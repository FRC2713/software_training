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
  initialInputs = [],
  storageKey,
  variant = 'default',
}: {
  initialCode: string
  initialInputs?: Array<{ label: string; value: string }>
  storageKey: string
  variant?: 'default' | 'challenge'
}) {
  const originalCode = initialCode.trimEnd()
  const inputStorageKey = (index: number) =>
    index === 0 ? `${storageKey}:input` : `${storageKey}:input:${index}`
  const hasProgramInput = initialInputs.length > 0
  const isChallenge = variant === 'challenge'
  const [code, setCode] = useState(() => localStorage.getItem(storageKey) ?? originalCode)
  const [programInputs, setProgramInputs] = useState(
    () =>
      initialInputs.map(
        (input, index) => localStorage.getItem(inputStorageKey(index)) ?? input.value,
      ),
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
    const result = await runJava(code, programInputs)
    setOk(result.ok)
    setOutput(result.output || '(no output)')
    setRunning(false)
  }

  const handleChange = (value: string) => {
    setCode(value)
    localStorage.setItem(storageKey, value)
  }

  const handleInputChange = (index: number, value: string) => {
    setProgramInputs((current) => current.map((input, i) => (i === index ? value : input)))
    localStorage.setItem(inputStorageKey(index), value)
  }

  const handleReset = () => {
    setCode(originalCode)
    setProgramInputs(initialInputs.map((input) => input.value))
    setOutput(null)
    localStorage.removeItem(storageKey)
    initialInputs.forEach((_, index) => localStorage.removeItem(inputStorageKey(index)))
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
            <div className="mr-auto flex min-w-48 flex-1 flex-wrap gap-2">
              {initialInputs.map((input, index) => (
                <label
                  key={`${input.label}-${index}`}
                  className="flex min-w-36 flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground"
                >
                  {input.label}
                  <Input
                    type="text"
                    value={programInputs[index] ?? ''}
                    onChange={(event) => handleInputChange(index, event.target.value)}
                    disabled={running}
                    className="h-8 bg-background text-foreground"
                  />
                </label>
              ))}
            </div>
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
            {running ? 'Running…' : isChallenge ? '▶ Test solution' : '▶ Run'}
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
