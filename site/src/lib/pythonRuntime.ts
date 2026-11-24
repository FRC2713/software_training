export interface RunOutcome {
  ok: boolean
  output: string
}

export interface RunnerResponse {
  ok: boolean
  stdout: string
  stderr: string
  exitCode: number | null
  timedOut: boolean
  truncated: boolean
  durationMs: number
  trail?: [number, number][] | null
  error?: string
}

export interface MazeRunOutcome extends RunOutcome {
  trail: [number, number][] | null
}

function formatRunnerOutput(data: RunnerResponse): string {
  const parts: string[] = []
  if (data.stdout) parts.push(data.stdout.replace(/\n$/, ''))
  if (data.stderr) parts.push(data.stderr.replace(/\n$/, ''))
  if (data.timedOut) parts.push('Timed out after 3 seconds (check for an infinite loop).')
  if (data.truncated) parts.push('Output exceeded 32 KB limit and was stopped.')
  return parts.join('\n').trim()
}

async function postRunner(path: string, body: unknown): Promise<{ ok: boolean; data?: RunnerResponse; error?: string }> {
  let res: Response
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: 'Could not reach the code runner.' }
  }

  if (res.redirected || res.status === 401 || res.status === 403) {
    return { ok: false, error: 'Session expired. Reload the page to sign in again.' }
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return { ok: false, error: 'Session expired or runner returned an unexpected response. Reload and try again.' }
  }

  const data = (await res.json()) as RunnerResponse
  if (!res.ok) {
    return { ok: false, error: data.error || `Runner error (HTTP ${res.status}).` }
  }
  return { ok: true, data }
}

export async function runPython(code: string): Promise<RunOutcome> {
  const result = await postRunner('/api/run', { code })
  if (!result.ok || !result.data) {
    return { ok: false, output: result.error ?? 'Unknown runner error.' }
  }
  return {
    ok: result.data.ok,
    output: formatRunnerOutput(result.data),
  }
}

export async function runPythonMaze(
  code: string,
  grid: number[][],
  mode: 'wall' | 'astar',
): Promise<MazeRunOutcome> {
  const result = await postRunner('/api/run/maze', { code, grid, mode })
  if (!result.ok || !result.data) {
    return { ok: false, output: result.error ?? 'Unknown runner error.', trail: null }
  }
  return {
    ok: result.data.ok,
    output: formatRunnerOutput(result.data),
    trail: Array.isArray(result.data.trail) ? result.data.trail : null,
  }
}
