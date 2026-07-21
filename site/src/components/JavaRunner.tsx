import { useMemo, useState } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import { getJavaRuntimeStatus, runJava } from '@/lib/javaRuntime'
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

  const extensions = useMemo(() => [java(), editorTheme, EditorView.lineWrapping], [])

  const handleRun = async () => {
    const label = getJavaRuntimeStatus() === 'ready' ? 'Running…' : 'Loading Java…'
    setRunning(true)
    setOutput(label)
    const result = await runJava(code)
    setOk(result.ok)
    setOutput(result.output || '(no output)')
    setRunning(false)
  }

  const handleChange = (value: string) => {
    setCode(value)
    localStorage.setItem(storageKey, value)
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border bg-muted">
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
        className="text-[15px]"
      />
      <div className="flex justify-end border-t px-2.5 py-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleRun}
          disabled={running}
          className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
        >
          {running ? 'Running…' : '▶ Run'}
        </Button>
      </div>
      {output !== null && (
        <pre
          className={cn(
            'm-0 whitespace-pre-wrap break-words border-t bg-background px-3.5 py-3 font-mono text-sm text-foreground',
            !ok && 'text-destructive',
          )}
        >
          {output}
        </pre>
      )}
    </div>
  )
}
