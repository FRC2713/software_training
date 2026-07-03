import { useState } from 'react'
import { getPythonRuntimeStatus, runPython } from '../lib/pythonRuntime'
import './PythonRunner.css'

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
    <div className="python-runner">
      <textarea
        className="python-runner-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={Math.max(2, code.split('\n').length)}
      />
      <div className="python-runner-controls">
        <button type="button" onClick={handleRun} disabled={running}>
          {running ? 'Running…' : '▶ Run'}
        </button>
      </div>
      {output !== null && (
        <pre className={`python-runner-output ${ok ? '' : 'python-runner-output-error'}`}>
          {output}
        </pre>
      )}
    </div>
  )
}
