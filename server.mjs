import { createReadStream, statSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openProgressDb } from './server/progress-db.mjs'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(process.env.DIST_DIR || path.join(rootDir, 'site', 'dist'))
const dataDir = path.resolve(
  process.env.DATA_DIR || (process.env.NODE_ENV === 'production' ? '/data' : path.join(rootDir, '.data')),
)
const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 3000)
const revision = process.env.APP_REVISION || 'development'
const runnerUrl = (process.env.RUNNER_URL || '').replace(/\/+$/, '')
const trustProxy = process.env.HAWK_SUITE_TRUST_PROXY === 'true'
const expectedTeamId = process.env.HAWK_SUITE_TEAM_ID || ''

const progressDb = openProgressDb(path.join(dataDir, 'progress.db'))

const LESSON_SLUG_RE = /^[a-z0-9][a-z0-9-]{0,99}$/

const MAX_BODY_BYTES = 64 * 1024
const RATE_LIMIT_BURST = 5
const RATE_LIMIT_REFILL_PER_SEC = 0.5 // 30 runs/minute per user
const MAX_CONCURRENT_RUNS = 4
const MAX_QUEUED_RUNS = 16
const RUNNER_FETCH_TIMEOUT_MS = 10_000

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jar': 'application/java-archive',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

// Per-user token bucket for /api/run*.
const buckets = new Map()

function takeRateLimitToken(userKey) {
  const now = Date.now()
  let bucket = buckets.get(userKey)
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_BURST, updatedAt: now }
    buckets.set(userKey, bucket)
  } else {
    const elapsedSec = (now - bucket.updatedAt) / 1000
    bucket.tokens = Math.min(RATE_LIMIT_BURST, bucket.tokens + elapsedSec * RATE_LIMIT_REFILL_PER_SEC)
    bucket.updatedAt = now
  }
  if (bucket.tokens < 1) {
    const retryAfter = Math.ceil((1 - bucket.tokens) / RATE_LIMIT_REFILL_PER_SEC)
    return { allowed: false, retryAfter }
  }
  bucket.tokens -= 1
  return { allowed: true, retryAfter: 0 }
}

// Bounded FIFO semaphore for runner requests.
let activeRuns = 0
const runWaiters = []

function acquireRunSlot() {
  if (activeRuns < MAX_CONCURRENT_RUNS) {
    activeRuns += 1
    return Promise.resolve(true)
  }
  if (runWaiters.length >= MAX_QUEUED_RUNS) {
    return Promise.resolve(false)
  }
  return new Promise((resolve) => {
    runWaiters.push(() => {
      activeRuns += 1
      resolve(true)
    })
  })
}

function releaseRunSlot() {
  activeRuns -= 1
  const next = runWaiters.shift()
  if (next) next()
}

function sendJson(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...extraHeaders,
  })
  res.end(body)
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let total = 0
    req.on('data', (chunk) => {
      total += chunk.length
      if (total > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(JSON.parse(text))
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }))
      }
    })
    req.on('error', () => {
      reject(Object.assign(new Error('Failed to read request body'), { status: 400 }))
    })
  })
}

function resolveUser(req) {
  if (!trustProxy) {
    return {
      userKey: 'local-dev',
      slackUserId: 'local-dev',
      slackTeamId: 'local',
      slackName: 'Local Developer',
    }
  }
  const slackUserId = String(req.headers['x-hawk-slack-user'] || '').trim()
  const slackTeamId = String(req.headers['x-hawk-slack-team'] || '').trim()
  if (!slackUserId) return null
  if (expectedTeamId && slackTeamId !== expectedTeamId) return null
  const slackName =
    String(
      req.headers['x-hawk-slack-name'] ||
        req.headers['x-hawk-user-name'] ||
        req.headers['x-hawk-slack-display-name'] ||
        '',
    ).trim() || slackUserId
  return {
    userKey: `${slackTeamId}:${slackUserId}`,
    slackUserId,
    slackTeamId,
    slackName,
  }
}

function resolveUserKey(req) {
  return resolveUser(req)?.userKey ?? null
}

async function handleProgressApi(req, res, method) {
  const user = resolveUser(req)
  if (!user) {
    sendJson(res, 401, { error: 'Sign in with Hawk Suite to track progress.' })
    return
  }

  if (method === 'GET') {
    progressDb.upsertUser(user)
    const completed = progressDb.getCompletedLessons(user.userKey)
    sendJson(res, 200, {
      user: { id: user.slackUserId, name: user.slackName },
      completed,
    })
    return
  }

  if (method === 'POST') {
    let body
    try {
      body = await readJsonBody(req)
    } catch (err) {
      sendJson(res, err.status || 400, { error: err.message || 'Bad request' })
      return
    }

    if (
      !body ||
      typeof body !== 'object' ||
      typeof body.lessonSlug !== 'string' ||
      !LESSON_SLUG_RE.test(body.lessonSlug) ||
      typeof body.completed !== 'boolean'
    ) {
      sendJson(res, 400, {
        error: 'Fields `lessonSlug` (valid slug) and `completed` (boolean) are required.',
      })
      return
    }

    const completed = progressDb.setLessonCompleted(user, body.lessonSlug, body.completed)
    sendJson(res, 200, {
      user: { id: user.slackUserId, name: user.slackName },
      completed,
    })
    return
  }

  res.writeHead(405, { Allow: 'GET, POST', 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Method Not Allowed')
}

async function handleRunApi(req, res, isMaze) {
  const userKey = resolveUserKey(req)
  if (!userKey) {
    sendJson(res, 401, { error: 'Sign in with Hawk Suite to run code.' })
    return
  }

  if (!runnerUrl) {
    sendJson(res, 503, { error: 'Python code runner is not configured.' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (err) {
    sendJson(res, err.status || 400, { error: err.message || 'Bad request' })
    return
  }

  if (!body || typeof body !== 'object' || typeof body.code !== 'string') {
    sendJson(res, 400, { error: 'Field `code` (string) is required.' })
    return
  }

  const payload = { code: body.code }
  if (isMaze) {
    if (!Array.isArray(body.grid) || (body.mode !== 'wall' && body.mode !== 'astar')) {
      sendJson(res, 400, { error: 'Fields `grid` (array) and `mode` ("wall" | "astar") are required.' })
      return
    }
    payload.maze = { grid: body.grid, mode: body.mode }
  }

  const rate = takeRateLimitToken(userKey)
  if (!rate.allowed) {
    sendJson(
      res,
      429,
      { error: 'Too many runs. Wait a moment and try again.' },
      { 'Retry-After': String(rate.retryAfter) },
    )
    return
  }

  const acquired = await acquireRunSlot()
  if (!acquired) {
    sendJson(res, 429, { error: 'Runner is busy. Try again in a moment.' }, { 'Retry-After': '2' })
    return
  }

  try {
    const upstream = await fetch(`${runnerUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(RUNNER_FETCH_TIMEOUT_MS),
    })
    const text = await upstream.text()
    res.writeHead(upstream.status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(text),
      'Cache-Control': 'no-store',
    })
    res.end(text)
  } catch {
    sendJson(res, 502, { error: 'Code runner is temporarily unavailable.' })
  } finally {
    releaseRunSlot()
  }
}

function sendFile(res, filePath, method, cacheControl) {
  const stat = statSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const headers = {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': cacheControl,
  }
  res.writeHead(200, headers)
  if (method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(filePath).pipe(res)
}

function tryFile(filePath) {
  try {
    const stat = statSync(filePath)
    return stat.isFile() ? filePath : null
  } catch {
    return null
  }
}

const server = http.createServer((req, res) => {
  const method = req.method || 'GET'

  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname)
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Bad Request')
    return
  }

  if (pathname === '/api/progress') {
    void handleProgressApi(req, res, method)
    return
  }

  if (pathname === '/api/run' || pathname === '/api/run/maze') {
    if (method !== 'POST') {
      res.writeHead(405, { Allow: 'POST', 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Method Not Allowed')
      return
    }
    void handleRunApi(req, res, pathname === '/api/run/maze')
    return
  }

  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Method Not Allowed')
    return
  }

  if (pathname === '/health') {
    const body = JSON.stringify({ status: 'ok', revision })
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
      'Cache-Control': 'no-store',
    })
    res.end(method === 'HEAD' ? undefined : body)
    return
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const candidate = path.resolve(distDir, relativePath)
  if (candidate !== distDir && !candidate.startsWith(distDir + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Forbidden')
    return
  }

  const exact = tryFile(candidate)
  if (exact) {
    const isHashedAsset = pathname.startsWith('/assets/')
    const cacheControl = isHashedAsset
      ? 'public, max-age=31536000, immutable'
      : pathname.endsWith('.html')
        ? 'no-cache'
        : 'public, max-age=3600'
    sendFile(res, exact, method, cacheControl)
    return
  }

  // Missing files with an extension (e.g. .jar, .js, .css) should 404 rather
  // than returning index.html.
  if (path.extname(relativePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
    return
  }

  const indexFile = tryFile(path.join(distDir, 'index.html'))
  if (indexFile) {
    sendFile(res, indexFile, method, 'no-cache')
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not Found')
})

server.listen(port, host, () => {
  console.log(`hawk-learn listening on http://${host}:${port} (revision ${revision})`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => {
      progressDb.close()
      process.exit(0)
    })
  })
}
