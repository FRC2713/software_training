import { useState } from 'react'
import { getPythonRuntimeStatus, runPython } from '@/lib/pythonRuntime'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PythonRunner({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode.trimEnd())
  const [output, setOutput] = useState<string | null>(null)
  const [ok, setOk] = useState(true)
  const [running, setRunning] = useState(false)

  const handleRun = async () => {
    const label = getPythonRuntimeStatus() === 'ready' ? 'Running…' : 'Loading Python…'
    setRunning(true)
    setOutput(label)
    const result = await runPython(code)
    setOk(result.ok)
    setOutput(result.output || '(no output)')
    setRunning(false)
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border bg-muted">
      <textarea
        className="block w-full resize-y bg-muted px-3.5 py-3 font-mono text-[15px] leading-relaxed text-foreground outline-none"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={Math.max(2, code.split('\n').length)}
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
