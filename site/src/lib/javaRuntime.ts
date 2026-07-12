// Runs real Java client-side via CheerpJ (a JVM compiled to WebAssembly),
// loaded lazily from Leaning Tech's CDN on first use under their free
// Community License. This is the only file that knows CheerpJ exists -
// everything else just calls runJava().
//
// Each run is a real compile-then-execute: the snippet is written into
// CheerpJ's virtual filesystem, compiled with javac (from the OpenJDK 8
// tools.jar vendored in public/), and the resulting class is executed. javac
// itself is a Java program running inside the same in-browser JVM.
const CHEERPJ_LOADER_URL = 'https://cjrtnc.leaningtech.com/4.3/loader.js'

// CheerpJ mounts the site's HTTP origin at /app/, so the vendored compiler
// lives under the Vite base path (/software_training/ in production).
const TOOLS_JAR = `/app${import.meta.env.BASE_URL}tools.jar`
const CLASS_PATH = `${TOOLS_JAR}:/files/`

// Globals installed by loader.js (a classic script, not an ES module).
declare global {
  function cheerpjInit(options?: object): Promise<void>
  function cheerpjRunMain(className: string, classPath: string, ...args: string[]): Promise<number>
  function cheerpOSAddStringFile(path: string, data: Uint8Array): void
}

let cheerpjPromise: Promise<void> | null = null
let status: 'idle' | 'loading' | 'ready' = 'idle'

// Lets the UI show "loading the Java runtime" (a multi-MB download plus a
// slow first compile) only the first time, instead of on every Run click.
export function getJavaRuntimeStatus() {
  return status
}

function injectScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

// CheerpJ writes System.out and System.err as text into whatever element has
// id="console". We keep a hidden one and read/clear it around each run, which
// is safe because runs are queued (see runQueue below).
let consoleElement: HTMLPreElement | null = null

function loadCheerpjOnce(): Promise<void> {
  if (!cheerpjPromise) {
    status = 'loading'
    cheerpjPromise = (async () => {
      consoleElement = document.createElement('pre')
      consoleElement.id = 'console'
      consoleElement.style.display = 'none'
      document.body.appendChild(consoleElement)
      await injectScriptOnce(CHEERPJ_LOADER_URL)
      await cheerpjInit({ status: 'none' })
      // Warm-up: the first javac invocation inside the browser JVM is several
      // times slower than the ones after it, so absorb that cost here while
      // the UI still says "loading" instead of on the student's first Run.
      await compileAndRun('class Warmup { public static void main(String[] a) {} }')
      status = 'ready'
    })()
  }
  return cheerpjPromise
}

export interface RunOutcome {
  ok: boolean
  output: string
}

// Bare statements are wrapped in a main-method shell so early lessons can run
// `System.out.println("hi");` without meeting class boilerplate (lesson 11
// reveals the shell). Snippets that declare their own class/enum run as-is.
// The blanket java.util import lets ArrayList/HashMap snippets work before
// imports are taught.
const WRAP_PREFIX = 'import java.util.*;\npublic class Main {\npublic static void main(String[] args) {\n'
const WRAP_SUFFIX = '\n}\n}'
const WRAP_LINE_OFFSET = 3

interface PreparedSource {
  source: string
  mainClass: string
  lineOffset: number
}

function prepareSource(code: string): PreparedSource {
  // Ignore `class`/`interface`/`enum` mentions inside line comments when
  // deciding whether the snippet is already a full compilation unit. An
  // interface-only snippet (lesson 29) must not fall through to the wrap
  // path below — a top-level `interface` inside a method body is illegal.
  const withoutComments = code.replace(/\/\/[^\n]*/g, '')
  const declarations = [...withoutComments.matchAll(/\b(?:class|enum|interface)\s+(\w+)/g)]
  if (declarations.length > 0) {
    // Run the class that owns main(): the last type declared before the main
    // method (snippets can hold several classes, e.g. lesson 21). The public
    // class must also match the filename, and in our lessons that is always
    // the class with main. A snippet with no main still compiles for feedback.
    const mainIndex = withoutComments.search(/\bstatic\s+void\s+main\b/)
    const before = declarations.filter((d) => d.index! < mainIndex)
    const mainClass = (before.length > 0 ? before[before.length - 1] : declarations[0])[1]
    return { source: code, mainClass, lineOffset: 0 }
  }
  return {
    source: WRAP_PREFIX + code + WRAP_SUFFIX,
    mainClass: 'Main',
    lineOffset: WRAP_LINE_OFFSET,
  }
}

// javac diagnostics point at the wrapped file (/str/Main.java:12); rewrite
// them to the student's own line numbers and drop the trailing "N errors"
// count, keeping the code line + caret which genuinely help.
function simplifyCompileErrors(text: string, lineOffset: number, mainClass: string): string {
  const kept: string[] = []
  for (const line of text.split('\n')) {
    const diag = new RegExp(`^/str/${mainClass}\\.java:(\\d+):\\s*(.*)$`).exec(line)
    if (diag) {
      kept.push(`line ${Number(diag[1]) - lineOffset}: ${diag[2]}`)
      continue
    }
    if (/^\d+ errors?$/.test(line.trim())) continue
    kept.push(line)
  }
  return kept.join('\n').trim()
}

// CheerpJ reports runtime stack frames as "Unknown Source" (no line numbers),
// so the best we can do is keep the exception itself plus the frames in the
// student's own classes and drop JVM-internal ones.
function simplifyRuntimeError(text: string): string {
  const kept: string[] = []
  for (const line of text.split('\n')) {
    if (/^\s+at\s/.test(line) && !/\(Unknown Source\)|\(\w+\.java/.test(line)) continue
    kept.push(line.replace(/\(Unknown Source\)/, '').trimEnd())
  }
  return kept.join('\n').trim()
}

async function compileAndRun(code: string): Promise<RunOutcome> {
  const { source, mainClass, lineOffset } = prepareSource(code)
  const out = consoleElement!
  out.textContent = ''
  cheerpOSAddStringFile(`/str/${mainClass}.java`, new TextEncoder().encode(source))
  const exitCode = await cheerpjRunMain(
    'com.sun.tools.javac.Main',
    CLASS_PATH,
    `/str/${mainClass}.java`,
    '-d',
    '/files/',
  )
  if (exitCode !== 0) {
    return { ok: false, output: simplifyCompileErrors(out.textContent ?? '', lineOffset, mainClass) }
  }
  out.textContent = ''
  await cheerpjRunMain(mainClass, CLASS_PATH)
  // Console writes land asynchronously; give the DOM a beat to settle.
  await new Promise((resolve) => setTimeout(resolve, 150))
  const output = out.textContent ?? ''
  // CheerpJ exits 0 even on an uncaught exception, so detect failure from the
  // output itself. "Error:" covers JVM launcher failures (e.g. a snippet whose
  // class has no main method).
  if (/^Exception in thread |^Error: /m.test(output)) {
    return { ok: false, output: simplifyRuntimeError(output) }
  }
  return { ok: true, output: output.replace(/\n$/, '') }
}

// The CheerpJ runtime is a single shared instance (loading it twice would mean
// downloading tens of MB again), so concurrent Run clicks across different
// code blocks are queued rather than racing each other's console capture.
let runQueue: Promise<unknown> = Promise.resolve()

export function runJava(code: string): Promise<RunOutcome> {
  const run = async (): Promise<RunOutcome> => {
    await loadCheerpjOnce()
    return compileAndRun(code)
  }

  const result = runQueue.then(run, run)
  runQueue = result.catch(() => {})
  return result
}

// Dev-only hook so lesson snippets can be batch-tested from the console.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __runJava: typeof runJava }).__runJava = runJava
}
