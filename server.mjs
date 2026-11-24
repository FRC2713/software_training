import { createReadStream, statSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(process.env.DIST_DIR || path.join(rootDir, 'site', 'dist'))
const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 3000)
const revision = process.env.APP_REVISION || 'development'

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
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Method Not Allowed')
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname)
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Bad Request')
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
    server.close(() => process.exit(0))
  })
}
