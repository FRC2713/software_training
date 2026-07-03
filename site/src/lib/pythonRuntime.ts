// Runs real Python client-side via Pyodide (CPython compiled to WebAssembly),
// loaded lazily from jsDelivr on first use. This is the only file that knows
// Pyodide exists - everything else just calls runPython().
const PYODIDE_VERSION = '314.0.2'
const PYODIDE_CDN_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`

interface PyodideInterface {
  runPythonAsync(code: string): Promise<unknown>
  setStdout(options: { batched: (msg: string) => void }): void
  setStderr(options: { batched: (msg: string) => void }): void
}

type LoadPyodide = () => Promise<PyodideInterface>

let pyodidePromise: Promise<PyodideInterface> | null = null
let status: 'idle' | 'loading' | 'ready' = 'idle'

// Lets the UI show "loading the Python runtime" (a multi-MB download) only
// the first time, instead of on every Run click.
export function getPythonRuntimeStatus() {
  return status
}

function loadPyodideOnce(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    status = 'loading'
    pyodidePromise = (async () => {
      const mod = (await import(/* @vite-ignore */ PYODIDE_CDN_URL)) as {
        loadPyodide: LoadPyodide
      }
      const pyodide = await mod.loadPyodide()
      status = 'ready'
      return pyodide
    })()
  }
  return pyodidePromise
}

export interface RunOutcome {
  ok: boolean
  output: string
}

// Errors raised while Pyodide itself is compiling/running the snippet come
// with a traceback through Pyodide's own bootstrap code (_pyodide/_base.py),
// which is meaningless noise for a student. Keep only frames in the
// student's own code (file "<exec>") plus the final exception message.
function simplifyTraceback(text: string): string {
  const kept: string[] = []
  let inOwnFrame = false
  for (const line of text.split('\n')) {
    const frame = /^ {2}File "([^"]+)", line \d+/.exec(line)
    if (frame) {
      inOwnFrame = frame[1] === '<exec>'
      if (inOwnFrame) kept.push(line.trim())
      continue
    }
    if (/^Traceback/.test(line)) continue
    if (inOwnFrame || !/^\s/.test(line)) kept.push(line.trim())
  }
  return kept.join('\n').trim() || text.trim()
}

// The Pyodide runtime is a single shared instance (loading it twice would mean
// downloading tens of MB again), so concurrent Run clicks across different
// code blocks are queued rather than racing each other's stdout redirection.
let runQueue: Promise<unknown> = Promise.resolve()

export function runPython(code: string): Promise<RunOutcome> {
  const run = async (): Promise<RunOutcome> => {
    const pyodide = await loadPyodideOnce()
    const lines: string[] = []
    pyodide.setStdout({ batched: (msg) => lines.push(msg) })
    pyodide.setStderr({ batched: (msg) => lines.push(msg) })
    try {
      await pyodide.runPythonAsync(code)
      return { ok: true, output: lines.join('\n') }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      lines.push(simplifyTraceback(message))
      return { ok: false, output: lines.join('\n') }
    }
  }

  const result = runQueue.then(run, run)
  runQueue = result.catch(() => {})
  return result
}
