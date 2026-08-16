import { useMemo, useState } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import { getJavaRuntimeStatus, runJava } from '@/lib/javaRuntime'
import { editorTheme, usePrefersDark } from '@/lib/editorTheme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function JavaRunner({
  initialCode,
  initialInput,
  storageKey,
  variant = 'default',
}: {
  initialCode: string
  initialInput?: string
  storageKey: string
  variant?: 'default' | 'challenge'
}) {
  const originalCode = initialCode.trimEnd()
  const inputStorageKey = `${storageKey}:input`
  const hasProgramInput = initialInput !== undefined
  const isChallenge = variant === 'challenge'
  const [code, setCode] = useState(() => localStorage.getItem(storageKey) ?? originalCode)
  const [programInput, setProgramInput] = useState(
    () => localStorage.getItem(inputStorageKey) ?? initialInput ?? '',
  )
  const [output, setOutput] = useState<string | null>(null)
  const [ok, setOk] = useState(true)
  const [running, setRunning] = useState(false)
  const dark = usePrefersDark()

  const extensions = useMemo(() => [java(), editorTheme, EditorView.lineWrapping], [])

  const handleRun = async () => {
    const label = getJavaRuntimeStatus() === 'ready' ? 'Running…' : 'Loading Java…'
    setRunning(true)
    setOutput(label)
    const result = await runJava(code, hasProgramInput ? [programInput] : [])
    setOk(result.ok)
    setOutput(result.output || '(no output)')
    setRunning(false)
  }

  const handleChange = (value: string) => {
    setCode(value)
    localStorage.setItem(storageKey, value)
  }

  const handleInputChange = (value: string) => {
    setProgramInput(value)
    localStorage.setItem(inputStorageKey, value)
  }

  const handleReset = () => {
    setCode(originalCode)
    setProgramInput(initialInput ?? '')
    setOutput(null)
    localStorage.removeItem(storageKey)
    localStorage.removeItem(inputStorageKey)
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className={cn('font-semibold text-primary', isChallenge ? 'text-lg' : 'text-base')}>
          {isChallenge ? 'Your solution' : '▶ Playground'}
        </h2>
        <Button type="button" size="sm" variant="outline" onClick={handleReset} disabled={running}>
          {isChallenge ? 'Reset solution' : 'Reset code'}
        </Button>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-lg border bg-muted',
          isChallenge ? 'border-primary/30 shadow-lg' : 'my-4',
        )}
      >
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
          className={cn(
            'text-[15px]',
            isChallenge && '[&_.cm-editor]:min-h-[24rem] [&_.cm-scroller]:min-h-[24rem]',
          )}
        />
        <div className="flex flex-wrap items-end justify-end gap-3 border-t px-2.5 py-2">
          {hasProgramInput && (
            <label className="mr-auto flex min-w-48 flex-col gap-1 text-xs font-medium text-muted-foreground">
              Program input
              <Input
                type="text"
                value={programInput}
                onChange={(event) => handleInputChange(event.target.value)}
                disabled={running}
                className="h-8 bg-background text-foreground"
              />
            </label>
          )}
          <Button
            type="button"
            size="sm"
            variant={isChallenge ? 'default' : 'outline'}
            onClick={handleRun}
            disabled={running}
            className={cn(
              !isChallenge &&
                'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
            )}
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
    </>
  )
}
