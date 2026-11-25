import { useMemo, useState } from 'react'
import { Play, RotateCcw, Terminal } from 'lucide-react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { runPython } from '@/lib/pythonRuntime'
import { editorTheme, usePrefersDark } from '@/lib/editorTheme'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function JavaRunner({
  initialCode,
  storageKey,
}: {
  initialCode: string
  storageKey: string
}) {
  const originalCode = initialCode.trimEnd()
  const [code, setCode] = useState(() => localStorage.getItem(storageKey) ?? originalCode)
  const [output, setOutput] = useState<string | null>(null)
  const [ok, setOk] = useState(true)
  const [running, setRunning] = useState(false)
  const dark = usePrefersDark()

  const extensions = useMemo(() => [python(), editorTheme, EditorView.lineWrapping], [])

  const handleRun = async () => {
    setRunning(true)
    setOutput('Running…')
    const result = await runPython(code)
    setOk(result.ok)
    setOutput(result.output || '(no output)')
    setRunning(false)
  }

  const handleChange = (value: string) => {
    setCode(value)
    localStorage.setItem(storageKey, value)
  }

  const handleReset = () => {
    setCode(originalCode)
    setOutput(null)
    localStorage.removeItem(storageKey)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card transition-shadow focus-within:ring-2 focus-within:ring-ring/50">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-[var(--emphasis)]" aria-hidden="true" />
          <h2 className="brand-subheading text-sm uppercase tracking-wider text-[var(--ink)]">
            Playground
          </h2>
          <span className="rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            Python
          </span>
        </div>
        <Button type="button" size="xs" variant="ghost" onClick={handleReset} disabled={running}>
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset
        </Button>
      </div>

      <div className="bg-card">
        <CodeMirror
          value={code}
          onChange={handleChange}
          extensions={extensions}
          theme={dark ? oneDark : 'light'}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            autocompletion: false,
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted px-3.5 py-2">
        <span className="text-xs text-muted-foreground">Edit the code, then press Run.</span>
        <Button type="button" size="sm" variant="default" onClick={handleRun} disabled={running}>
          <Play className="size-3.5 fill-current" aria-hidden="true" />
          {running ? 'Running…' : 'Run'}
        </Button>
      </div>

      {output !== null && (
        <div className="border-t border-border bg-background px-3.5 py-3">
          <div
            className={cn(
              'brand-subheading mb-1 text-[11px] uppercase tracking-wider',
              ok ? 'text-muted-foreground' : 'text-[var(--err)]',
            )}
          >
            {ok ? 'Output' : 'Error'}
          </div>
          <pre
            className={cn(
              'm-0 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground',
              !ok && 'text-[var(--err)]',
            )}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
