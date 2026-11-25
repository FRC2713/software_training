import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Code2,
  GripVertical,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  compileTrace,
  formatCmpSymbol,
  formatExpr,
  formatOperand,
  formatOpSymbol,
  formatValue,
  generatePythonLines,
  MAX_REPEAT_TIMES,
  runChallengeChecks,
  type ChallengeCheckResult,
  type CmpOp,
  type FlowchartProgram,
  type FlowNode,
  type FunctionDef,
  type IfNode,
  type RepeatNode,
  type SetNode,
  type TraceStep,
} from '@/lib/flowchartEngine'
import { getFlowchartPreset, type PaletteItem } from '@/lib/flowchartPresets'
import { Button } from '@/components/ui/button'
import './FlowchartPlayground.css'

type SlotTarget =
  | { kind: 'main' }
  | { kind: 'if-yes'; nodeId: string }
  | { kind: 'if-no'; nodeId: string }
  | { kind: 'repeat-body'; nodeId: string }
  | { kind: 'fn-body'; fnName: string }

// Controlled numeric input that keeps raw text while typing so clearing the
// field doesn't snap to 0 mid-edit.
function DraftNumberInput({
  value,
  onChange,
  disabled,
  min,
  max,
  ariaLabel,
}: {
  value: number
  onChange: (n: number) => void
  disabled?: boolean
  min?: number
  max?: number
  ariaLabel: string
}) {
  const [draft, setDraft] = useState(String(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setDraft(String(value))
  }, [value, focused])

  const commit = (raw: string) => {
    const trimmed = raw.trim()
    if (trimmed === '' || trimmed === '-') {
      setDraft(String(value))
      return
    }
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed)) {
      setDraft(String(value))
      return
    }
    let clamped = parsed
    if (min !== undefined) clamped = Math.max(min, clamped)
    if (max !== undefined) clamped = Math.min(max, clamped)
    onChange(clamped)
    setDraft(String(clamped))
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      disabled={disabled}
      value={draft}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        commit(draft)
      }}
      onChange={(e) => {
        const next = e.target.value
        setDraft(next)
        const parsed = Number(next)
        if (next.trim() !== '' && next.trim() !== '-' && Number.isFinite(parsed)) {
          if ((min === undefined || parsed >= min) && (max === undefined || parsed <= max)) {
            onChange(parsed)
          }
        }
      }}
      className="fc-num-input"
    />
  )
}

function FlowArrow({ active, skipped, label }: { active?: boolean; skipped?: boolean; label?: string }) {
  return (
    <div className={`fc-arrow${active ? ' fc-arrow-active' : ''}${skipped ? ' fc-skipped' : ''}`}>
      {label && <span className="fc-arrow-label">{label}</span>}
      <svg width="20" height="26" viewBox="0 0 20 26" aria-hidden="true">
        <line x1="10" y1="0" x2="10" y2="19" stroke="currentColor" strokeWidth="2.2" />
        <polygon points="4,17 16,17 10,25" fill="currentColor" />
      </svg>
    </div>
  )
}

function mapNodes(nodes: FlowNode[], fn: (n: FlowNode) => FlowNode): FlowNode[] {
  return nodes.map((n) => {
    const updated = fn(n)
    if (updated.kind === 'if') {
      return {
        ...updated,
        yes: mapNodes(updated.yes, fn),
        no: mapNodes(updated.no, fn),
      }
    }
    if (updated.kind === 'repeat') {
      return {
        ...updated,
        body: mapNodes(updated.body, fn),
      }
    }
    return updated
  })
}

function updateSlotList(
  nodes: FlowNode[],
  slot: SlotTarget,
  updater: (list: FlowNode[]) => FlowNode[],
): FlowNode[] {
  if (slot.kind === 'main') return updater(nodes)
  return nodes.map((n) => {
    if (slot.kind === 'if-yes' && n.kind === 'if' && n.id === slot.nodeId) {
      return { ...n, yes: updater(n.yes) }
    }
    if (slot.kind === 'if-no' && n.kind === 'if' && n.id === slot.nodeId) {
      return { ...n, no: updater(n.no) }
    }
    if (slot.kind === 'repeat-body' && n.kind === 'repeat' && n.id === slot.nodeId) {
      return { ...n, body: updater(n.body) }
    }
    if (n.kind === 'if') {
      return {
        ...n,
        yes: updateSlotList(n.yes, slot, updater),
        no: updateSlotList(n.no, slot, updater),
      }
    }
    if (n.kind === 'repeat') {
      return { ...n, body: updateSlotList(n.body, slot, updater) }
    }
    return n
  })
}

const CMP_OPTIONS: CmpOp[] = ['<', '>', '<=', '>=', '==', '!=']

export function FlowchartPlayground({ preset }: { preset: string }) {
  const config = useMemo(() => getFlowchartPreset(preset), [preset])
  const [program, setProgram] = useState<FlowchartProgram>(() => structuredClone(config.program))
  const [stepIndex, setStepIndex] = useState<number>(-1)
  const [playing, setPlaying] = useState(false)
  const [fast, setFast] = useState(false)
  const [showPython, setShowPython] = useState(false)
  const [confirmStartOver, setConfirmStartOver] = useState(false)
  const [checkResults, setCheckResults] = useState<ChallengeCheckResult[] | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)
  const nextId = useRef(1)

  // Reset state cleanly if preset changes.
  useEffect(() => {
    setProgram(structuredClone(config.program))
    setStepIndex(-1)
    setPlaying(false)
    setConfirmStartOver(false)
    setCheckResults(null)
  }, [config])

  const trace = useMemo(() => compileTrace(program), [program])
  const pythonLines = useMemo(() => generatePythonLines(program), [program])
  const currentStep: TraceStep | null =
    stepIndex >= 0 && stepIndex < trace.steps.length ? trace.steps[stepIndex] : null

  // Auto-advance timer when playing.
  useEffect(() => {
    if (!playing) return
    const delay = fast ? 380 : 800
    const timer = window.setTimeout(() => {
      setStepIndex((curr) => {
        if (curr + 1 >= trace.steps.length) {
          setPlaying(false)
          return curr
        }
        return curr + 1
      })
    }, delay)
    return () => window.clearTimeout(timer)
  }, [playing, stepIndex, fast, trace.steps.length])

  const clearRun = useCallback(() => {
    setPlaying(false)
    setStepIndex(-1)
  }, [])

  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (stepIndex < 0 || stepIndex >= trace.steps.length - 1) {
      setStepIndex(0)
    }
    setPlaying(true)
  }

  const handleStep = () => {
    setPlaying(false)
    setStepIndex((curr) => {
      if (curr < 0) return 0
      if (curr + 1 >= trace.steps.length) return curr
      return curr + 1
    })
  }

  const handleStepBack = () => {
    setPlaying(false)
    setStepIndex((curr) => (curr > 0 ? curr - 1 : curr))
  }

  const mutateProgram = (updater: (prev: FlowchartProgram) => FlowchartProgram) => {
    clearRun()
    setCheckResults(null)
    setConfirmStartOver(false)
    setProgram(updater)
  }

  const insertFromPalette = (item: PaletteItem, slot: SlotTarget) => {
    const id = `usr-${nextId.current++}`
    const node = item.makeNode(id)
    mutateProgram((prev) => ({
      ...prev,
      main: updateSlotList(prev.main, slot, (list) => {
        if (slot.kind === 'main') {
          // Insert right before the final output node so it feeds into the output.
          const outIdx = list.findIndex((n) => n.kind === 'output')
          if (outIdx !== -1) {
            return [...list.slice(0, outIdx), node, ...list.slice(outIdx)]
          }
        }
        return [...list, node]
      }),
    }))
  }

  const removeNode = (slot: SlotTarget, nodeId: string) => {
    mutateProgram((prev) => ({
      ...prev,
      main: updateSlotList(prev.main, slot, (list) => list.filter((n) => n.id !== nodeId)),
    }))
  }

  const moveNode = (slot: SlotTarget, nodeId: string, dir: -1 | 1) => {
    mutateProgram((prev) => ({
      ...prev,
      main: updateSlotList(prev.main, slot, (list) => {
        const idx = list.findIndex((n) => n.id === nodeId)
        if (idx === -1) return list
        const targetIdx = idx + dir
        if (targetIdx < 0 || targetIdx >= list.length) return list
        // Keep removable nodes from moving past fixed inputs or the output node.
        if (!list[targetIdx].removable) return list
        const copy = [...list]
        const [moved] = copy.splice(idx, 1)
        copy.splice(targetIdx, 0, moved)
        return copy
      }),
    }))
  }

  const updateSetLiteral = (nodeId: string, val: number) => {
    const patch = (n: FlowNode): FlowNode => {
      if (n.id !== nodeId || n.kind !== 'set') return n
      if (n.expr.kind === 'operand' && n.expr.operand.kind === 'num') {
        return { ...n, expr: { kind: 'operand', operand: { kind: 'num', value: val } } }
      }
      if (n.expr.kind === 'binary' && n.expr.right.kind === 'num') {
        return { ...n, expr: { ...n.expr, right: { kind: 'num', value: val } } }
      }
      return n
    }
    mutateProgram((prev) => ({
      main: mapNodes(prev.main, patch),
      functions: prev.functions.map((fn) => ({ ...fn, body: mapNodes(fn.body, patch) })),
    }))
  }

  const updateIfCondition = (nodeId: string, cmp: CmpOp, rightVal: number) => {
    mutateProgram((prev) => ({
      ...prev,
      main: mapNodes(prev.main, (n) => {
        if (n.id !== nodeId || n.kind !== 'if') return n
        return { ...n, cmp, right: { kind: 'num', value: rightVal } }
      }),
    }))
  }

  const updateRepeatTimes = (nodeId: string, times: number) => {
    mutateProgram((prev) => ({
      ...prev,
      main: mapNodes(prev.main, (n) => {
        if (n.id !== nodeId || n.kind !== 'repeat') return n
        return { ...n, times: { kind: 'num', value: times } }
      }),
    }))
  }

  const handleCheck = () => {
    if (!config.checks) return
    clearRun()
    setCheckResults(runChallengeChecks(program, config.checks))
  }

  const handleStartOver = () => {
    if (!confirmStartOver) {
      setConfirmStartOver(true)
      return
    }
    setProgram(structuredClone(config.program))
    clearRun()
    setCheckResults(null)
    setConfirmStartOver(false)
  }

  // Default click-to-add target for palette buttons.
  const defaultClickSlot = useMemo<SlotTarget>(() => {
    if (config.targetSlots?.includes('body')) {
      const rep = program.main.find((n) => n.kind === 'repeat')
      if (rep) return { kind: 'repeat-body', nodeId: rep.id }
    }
    if (config.targetSlots?.includes('yes')) {
      const cond = program.main.find((n) => n.kind === 'if')
      if (cond && cond.kind === 'if') {
        if (cond.yes.length === 0) return { kind: 'if-yes', nodeId: cond.id }
        return { kind: 'if-no', nodeId: cond.id }
      }
    }
    return { kind: 'main' }
  }, [config.targetSlots, program.main])

  const skippedSet = useMemo(() => new Set(currentStep?.skippedNodeIds ?? []), [currentStep])
  const activeNodeId = currentStep?.nodeId ?? null

  const slotKey = (slot: SlotTarget) => {
    if (slot.kind === 'main') return 'main'
    if (slot.kind === 'fn-body') return `fn-body:${slot.fnName}`
    return `${slot.kind}:${slot.nodeId}`
  }

  const renderDropZone = (slot: SlotTarget, prompt: string) => {
    if (!config.palette) return null
    const key = slotKey(slot)
    const isOver = dragOverSlot === key
    return (
      <div
        className={`fc-dropzone${isOver ? ' fc-dropzone-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOverSlot(key)
        }}
        onDragLeave={() => setDragOverSlot((curr) => (curr === key ? null : curr))}
        onDrop={(e) => {
          e.preventDefault()
          setDragOverSlot(null)
          const itemId = e.dataTransfer.getData('text/plain')
          const item = config.palette?.find((p) => p.id === itemId)
          if (item) insertFromPalette(item, slot)
        }}
      >
        <span>{prompt}</span>
      </div>
    )
  }

  const renderSetNode = (node: SetNode, slot: SlotTarget, list: FlowNode[], index: number) => {
    const isActive = activeNodeId === node.id
    const isError = isActive && Boolean(currentStep?.isError)
    const isSkipped = skippedSet.has(node.id)
    const isCall = node.expr.kind === 'call'
    const canMoveUp = Boolean(node.removable && index > 0 && list[index - 1]?.removable)
    const canMoveDown = Boolean(
      node.removable && index < list.length - 1 && list[index + 1]?.removable,
    )

    return (
      <div
        className={`fc-node fc-node-set${isCall ? ' fc-node-call' : ''}${isError ? ' fc-node-error' : isActive ? ' fc-active' : ''}${isSkipped ? ' fc-skipped' : ''}`}
      >
        <div className="fc-node-main">
          {isCall && <span className="fc-tag">CALL</span>}
          <span className="fc-var">{node.target}</span>
          <span className="fc-eq">=</span>
          {node.editable && node.expr.kind === 'operand' && node.expr.operand.kind === 'num' ? (
            <DraftNumberInput
              value={node.expr.operand.value}
              onChange={(v) => updateSetLiteral(node.id, v)}
              disabled={playing}
              ariaLabel={`Value for ${node.target}`}
            />
          ) : node.editable && node.expr.kind === 'binary' && node.expr.right.kind === 'num' ? (
            <span className="fc-expr-inline">
              <span>{formatOperand(node.expr.left)}</span>
              <span>{formatOpSymbol(node.expr.op)}</span>
              <DraftNumberInput
                value={node.expr.right.value}
                onChange={(v) => updateSetLiteral(node.id, v)}
                disabled={playing}
                ariaLabel={`Step value for ${node.target}`}
              />
            </span>
          ) : (
            <span className="fc-expr">{formatExpr(node.expr)}</span>
          )}
        </div>
        {node.note && <div className="fc-note">{node.note}</div>}
        {node.removable && (
          <div className="fc-node-actions">
            {canMoveUp && (
              <button
                type="button"
                aria-label="Move step up"
                disabled={playing}
                onClick={() => moveNode(slot, node.id, -1)}
              >
                <ArrowUp className="size-3.5" />
              </button>
            )}
            {canMoveDown && (
              <button
                type="button"
                aria-label="Move step down"
                disabled={playing}
                onClick={() => moveNode(slot, node.id, 1)}
              >
                <ArrowDown className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              aria-label="Remove step"
              disabled={playing}
              onClick={() => removeNode(slot, node.id)}
              className="fc-btn-remove"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderIfNode = (node: IfNode) => {
    const isActive = activeNodeId === node.id
    const isError = isActive && Boolean(currentStep?.isError)
    const isSkipped = skippedSet.has(node.id)
    const yesSkipped =
      node.yes.length > 0
        ? node.yes.every((n) => skippedSet.has(n.id))
        : currentStep?.nodeId === node.id && currentStep.activeBranch === 'no'
    const noSkipped =
      node.no.length > 0
        ? node.no.every((n) => skippedSet.has(n.id))
        : currentStep?.nodeId === node.id && currentStep.activeBranch === 'yes'
    const yesTaken = currentStep?.nodeId === node.id && currentStep.activeBranch === 'yes'
    const noTaken = currentStep?.nodeId === node.id && currentStep.activeBranch === 'no'

    return (
      <div className={`fc-if-block${isSkipped ? ' fc-skipped' : ''}`}>
        <div
          className={`fc-diamond-wrap${isError ? ' fc-diamond-error' : isActive ? ' fc-diamond-active' : ''}`}
        >
          <svg
            className="fc-diamond-svg"
            viewBox="0 0 260 54"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon
              points="16,2 244,2 258,27 244,52 16,52 2,27"
              className="fc-diamond-poly"
            />
          </svg>
          <div className="fc-diamond-content">
            <div className="fc-diamond-badge">IF</div>
            <div className="fc-diamond-expr">
              <span>{formatOperand(node.left)}</span>
              {node.editableCond && node.right.kind === 'num' ? (
                <>
                  <select
                    aria-label="Comparison operator"
                    disabled={playing}
                    value={node.cmp}
                    onChange={(e) =>
                      updateIfCondition(
                        node.id,
                        e.target.value as CmpOp,
                        node.right.kind === 'num' ? node.right.value : 0,
                      )
                    }
                    className="fc-select"
                  >
                    {CMP_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {formatCmpSymbol(c)}
                      </option>
                    ))}
                  </select>
                  <DraftNumberInput
                    value={node.right.value}
                    onChange={(v) => updateIfCondition(node.id, node.cmp, v)}
                    disabled={playing}
                    ariaLabel="Comparison threshold"
                  />
                </>
              ) : (
                <>
                  <span className="fc-cmp">{formatCmpSymbol(node.cmp)}</span>
                  <span>{formatOperand(node.right)}</span>
                </>
              )}
              <span>?</span>
            </div>
          </div>
        </div>

        <svg className="fc-fork-svg" viewBox="0 0 200 22" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M 100 0 L 100 10 L 48 10 L 48 22"
            fill="none"
            className={`fc-connector${yesTaken ? ' fc-connector-active' : ''}${yesSkipped ? ' fc-connector-skipped' : ''}`}
          />
          <path
            d="M 100 0 L 100 10 L 152 10 L 152 22"
            fill="none"
            className={`fc-connector${noTaken ? ' fc-connector-active' : ''}${noSkipped ? ' fc-connector-skipped' : ''}`}
          />
        </svg>

        <div className="fc-branches">
          <div className={`fc-branch fc-branch-yes${yesSkipped ? ' fc-branch-skipped' : ''}`}>
            <div className={`fc-branch-header${yesTaken ? ' fc-branch-header-active' : ''}`}>
              <span className="fc-pill-yes">YES</span>
              {yesSkipped && <span className="fc-skipped-tag">skipped</span>}
            </div>
            <FlowArrow active={yesTaken} skipped={yesSkipped} />
            <div className="fc-branch-body">
              {renderFlowList(node.yes, { kind: 'if-yes', nodeId: node.id })}
              {node.editableBranches &&
                renderDropZone(
                  { kind: 'if-yes', nodeId: node.id },
                  node.yes.length === 0 ? 'Drop YES step here' : '+ Drop another YES step',
                )}
            </div>
          </div>

          <div className={`fc-branch fc-branch-no${noSkipped ? ' fc-branch-skipped' : ''}`}>
            <div className={`fc-branch-header${noTaken ? ' fc-branch-header-active' : ''}`}>
              <span className="fc-pill-no">NO</span>
              {noSkipped && <span className="fc-skipped-tag">skipped</span>}
            </div>
            <FlowArrow active={noTaken} skipped={noSkipped} />
            <div className="fc-branch-body">
              {renderFlowList(node.no, { kind: 'if-no', nodeId: node.id })}
              {node.editableBranches &&
                renderDropZone(
                  { kind: 'if-no', nodeId: node.id },
                  node.no.length === 0 ? 'Drop NO step here' : '+ Drop another NO step',
                )}
            </div>
          </div>
        </div>

        <svg className="fc-merge-svg" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M 48 0 L 48 10 L 100 10 L 100 20"
            fill="none"
            className={`fc-connector${yesSkipped ? ' fc-connector-skipped' : ''}`}
          />
          <path
            d="M 152 0 L 152 10 L 100 10 L 100 20"
            fill="none"
            className={`fc-connector${noSkipped ? ' fc-connector-skipped' : ''}`}
          />
        </svg>
      </div>
    )
  }

  const renderRepeatNode = (node: RepeatNode) => {
    const isActive = activeNodeId === node.id
    const isError = isActive && Boolean(currentStep?.isError)
    const isSkipped = skippedSet.has(node.id)
    const progress = currentStep?.loopProgress?.[node.id]
    const loopBackActive = isActive && currentStep?.activeLoopPhase === 'back'
    const loopExitActive = isActive && currentStep?.activeLoopPhase === 'exit'
    const bodySkipped = node.body.length > 0 && node.body.every((n) => skippedSet.has(n.id))

    return (
      <div className={`fc-repeat-block${isSkipped ? ' fc-skipped' : ''}`}>
        <div
          className={`fc-repeat-header${isError ? ' fc-node-error' : isActive && !loopBackActive ? ' fc-active' : ''}`}
        >
          <span className="fc-tag">REPEAT</span>
          {node.editableTimes && node.times.kind === 'num' ? (
            <DraftNumberInput
              value={node.times.value}
              min={0}
              max={MAX_REPEAT_TIMES}
              onChange={(v) => updateRepeatTimes(node.id, v)}
              disabled={playing}
              ariaLabel="Number of loop passes"
            />
          ) : (
            <span className="fc-repeat-count">{formatOperand(node.times)}</span>
          )}
          <span>times</span>
          {progress && (
            <span className="fc-pass-badge">
              {progress.total === 0 ? '0 passes' : `Pass ${progress.pass} / ${progress.total}`}
            </span>
          )}
        </div>

        <div className="fc-repeat-inner">
          <div className={`fc-repeat-body${bodySkipped ? ' fc-skipped' : ''}`}>
            <FlowArrow
              active={isActive && currentStep?.activeLoopPhase === 'check'}
              skipped={bodySkipped}
              label="each pass"
            />
            {renderFlowList(node.body, { kind: 'repeat-body', nodeId: node.id })}
            {node.editableBody &&
              renderDropZone(
                { kind: 'repeat-body', nodeId: node.id },
                node.body.length === 0 ? 'Drop step to repeat here' : '+ Drop another step',
              )}
          </div>

          <div
            className={`fc-loopback${loopBackActive ? ' fc-loopback-active' : ''}${bodySkipped ? ' fc-skipped' : ''}`}
            aria-label="Loop back to repeat"
          >
            <svg viewBox="0 0 38 110" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M 2 98 C 30 98, 30 12, 8 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <polygon points="10,6 10,18 1,12" fill="currentColor" />
            </svg>
            <span className="fc-loopback-label">repeat</span>
          </div>
        </div>

        <div className="fc-repeat-exit">
          <FlowArrow active={loopExitActive} label="done" />
        </div>
      </div>
    )
  }

  const renderFlowList = (nodes: FlowNode[], slot: SlotTarget) => {
    const outIdx = slot.kind === 'main' ? nodes.findIndex((n) => n.kind === 'output') : -1

    return (
      <div className="fc-column">
        {nodes.map((node, i) => {
          const isSkipped = skippedSet.has(node.id)
          const showMainDropBefore =
            slot.kind === 'main' && config.targetSlots?.includes('main') && i === outIdx

          return (
            <div key={node.id} className="fc-item">
              {showMainDropBefore && (
                <>
                  {renderDropZone({ kind: 'main' }, 'Drop step here (or click a block above)')}
                  <FlowArrow />
                </>
              )}
              {node.kind === 'set' && renderSetNode(node, slot, nodes, i)}
              {node.kind === 'if' && renderIfNode(node)}
              {node.kind === 'repeat' && renderRepeatNode(node)}
              {node.kind === 'output' && (
                <div
                  className={`fc-node fc-node-output${activeNodeId === node.id && currentStep?.isError ? ' fc-node-error' : activeNodeId === node.id ? ' fc-active' : ''}${isSkipped ? ' fc-skipped' : ''}`}
                >
                  <span className="fc-tag">OUTPUT</span>
                  <span className="fc-expr">{formatOperand(node.operand)}</span>
                  {currentStep && currentStep.outputs.length > 0 && (
                    <span className="fc-output-val">
                      = {formatValue(currentStep.outputs[currentStep.outputs.length - 1])}
                    </span>
                  )}
                  {node.label && <span className="fc-note">({node.label})</span>}
                </div>
              )}
              {i < nodes.length - 1 && node.kind !== 'repeat' && (
                <FlowArrow skipped={isSkipped} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderFunctionCard = (fn: FunctionDef) => {
    const isFnActive = currentStep?.scope === fn.name
    const startActive = activeNodeId === `__fn_start_${fn.name}__`
    const retActive = activeNodeId === `__fn_return_${fn.name}__`
    const paramVal = isFnActive ? currentStep?.fnMemory?.[fn.param] : undefined

    return (
      <div key={fn.name} className={`fc-fn-card${isFnActive ? ' fc-fn-active' : ''}`}>
        <div className="fc-fn-header">
          <span className="fc-tag">FUNCTION</span>
          <strong>
            {fn.name}({fn.param})
          </strong>
          {isFnActive && paramVal !== undefined && (
            <span className="fc-param-pill">
              {fn.param} = {formatValue(paramVal)}
            </span>
          )}
        </div>
        <p className="fc-fn-desc">{fn.description}</p>
        <div className="fc-fn-flow">
          <div className={`fc-pill fc-pill-start fc-pill-sm${startActive ? ' fc-active' : ''}`}>
            IN: {fn.param}
            {isFnActive && paramVal !== undefined ? ` = ${formatValue(paramVal)}` : ''}
          </div>
          <FlowArrow active={startActive} />
          {renderFlowList(fn.body, { kind: 'fn-body', fnName: fn.name })}
          <FlowArrow active={retActive} />
          <div className={`fc-pill fc-pill-end fc-pill-sm${retActive ? ' fc-active' : ''}`}>
            RETURN {fn.returnVar}
            {retActive && currentStep?.returnValue !== undefined
              ? ` (${formatValue(currentStep.returnValue)})`
              : ''}
          </div>
        </div>
      </div>
    )
  }

  const memoryEntries = Object.entries(currentStep?.memory ?? {})
  const hasFunctions = program.functions.length > 0
  const allChecksPassed = checkResults !== null && checkResults.every((r) => r.passed)

  return (
    <div className="fc-shell">
      <div className="fc-header">
        <div>
          <div className="fc-title">{config.title}</div>
          <div className="fc-subtitle">{config.subtitle}</div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="fc-controls">
        <Button type="button" size="sm" onClick={handlePlayPause}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? 'Pause' : stepIndex >= trace.steps.length - 1 ? 'Run again' : 'Run'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleStepBack}
          disabled={stepIndex <= 0}
        >
          <SkipBack className="size-4" />
          Back
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleStep}
          disabled={stepIndex >= trace.steps.length - 1}
        >
          <SkipForward className="size-4" />
          Step
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={clearRun}
          disabled={stepIndex === -1 && !playing}
        >
          <RotateCcw className="size-4" />
          Clear run
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setFast((f) => !f)}
          title="Toggle playback speed"
        >
          {fast ? '2× speed' : '1× speed'}
        </Button>
        <div className="fc-controls-spacer" />
        <Button
          type="button"
          size="sm"
          variant={showPython ? 'secondary' : 'outline'}
          onClick={() => setShowPython((s) => !s)}
        >
          <Code2 className="size-4" />
          {showPython ? 'Hide Python' : 'Peek at Python'}
        </Button>
        {config.checks && (
          <Button type="button" size="sm" variant="outline" onClick={handleCheck}>
            <Check className="size-4" />
            Check
          </Button>
        )}
        {config.palette && (
          <Button
            type="button"
            size="sm"
            variant={confirmStartOver ? 'destructive' : 'ghost'}
            onClick={handleStartOver}
          >
            {confirmStartOver ? 'Confirm start over?' : 'Start over'}
          </Button>
        )}
      </div>

      {/* Palette for build presets */}
      {config.palette && (
        <div className="fc-palette">
          <div className="fc-palette-label">
            {config.targetSlots?.includes('yes') && config.targetSlots?.includes('no')
              ? 'Drag a block into YES or NO (or click + YES / + NO):'
              : 'Drag a block into the flowchart (or click + to add):'}
          </div>
          <div className="fc-palette-items">
            {config.palette.map((item) => {
              const condNode =
                config.targetSlots?.includes('yes') && config.targetSlots?.includes('no')
                  ? program.main.find((n) => n.kind === 'if')
                  : undefined
              return (
                <div
                  key={item.id}
                  draggable={!playing}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.id)
                    e.dataTransfer.effectAllowed = 'copy'
                  }}
                  className="fc-palette-chip"
                  title={item.hint}
                >
                  <GripVertical className="size-3.5 text-muted-foreground" />
                  <span className="fc-palette-code">{item.label}</span>
                  {condNode ? (
                    <div className="fc-palette-branch-btns">
                      <button
                        type="button"
                        disabled={playing}
                        aria-label={`Add ${item.label} to YES branch`}
                        onClick={() =>
                          insertFromPalette(item, { kind: 'if-yes', nodeId: condNode.id })
                        }
                        className="fc-palette-add fc-palette-add-text"
                      >
                        + YES
                      </button>
                      <button
                        type="button"
                        disabled={playing}
                        aria-label={`Add ${item.label} to NO branch`}
                        onClick={() =>
                          insertFromPalette(item, { kind: 'if-no', nodeId: condNode.id })
                        }
                        className="fc-palette-add fc-palette-add-text"
                      >
                        + NO
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={playing}
                      aria-label={`Add ${item.label}`}
                      onClick={() => insertFromPalette(item, defaultClickSlot)}
                      className="fc-palette-add"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main flowchart + optional side-by-side function definitions */}
      <div className={`fc-workspace${hasFunctions ? ' fc-workspace-split' : ''}`}>
        <div className="fc-canvas">
          {hasFunctions && <div className="fc-pane-label">Main Program</div>}
          <div className={`fc-pill fc-pill-start${activeNodeId === '__start__' ? ' fc-active' : ''}`}>
            START
          </div>
          <FlowArrow active={activeNodeId === '__start__'} />
          {renderFlowList(program.main, { kind: 'main' })}
          <FlowArrow active={activeNodeId === '__end__'} />
          <div className={`fc-pill fc-pill-end${activeNodeId === '__end__' ? ' fc-active' : ''}`}>
            END
          </div>
        </div>

        {hasFunctions && (
          <div className="fc-functions-col">
            <div className="fc-pane-label">Reusable Functions</div>
            {program.functions.map(renderFunctionCard)}
          </div>
        )}
      </div>

      {/* Live execution narrator */}
      <div className={`fc-narrator${currentStep?.isError ? ' fc-narrator-err' : ''}`}>
        <span className="fc-step-badge">
          {currentStep ? `Step ${currentStep.stepNumber} / ${trace.steps.length}` : 'Ready'}
        </span>
        <span className="fc-narrator-text">
          {currentStep
            ? currentStep.narration
            : 'Press Run or Step to watch the computer follow the arrows.'}
        </span>
      </div>

      {/* Live Robot Memory + Local Function Memory + Output */}
      <div className="fc-memory-bar">
        <div className="fc-memory-section">
          <span className="fc-memory-label">Robot Memory:</span>
          {memoryEntries.length === 0 ? (
            <span className="fc-memory-empty">(empty until a step runs)</span>
          ) : (
            <div className="fc-memory-chips">
              {memoryEntries.map(([k, v]) => (
                <span
                  key={k}
                  className={`fc-mem-chip${currentStep?.changedVar === k && currentStep?.scope === 'main' ? ' fc-mem-changed' : ''}`}
                >
                  <span className="fc-mem-k">{k}</span>
                  <span className="fc-mem-eq">=</span>
                  <span className="fc-mem-v">{formatValue(v)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {currentStep?.fnMemory && currentStep.scope !== 'main' && (
          <div className="fc-memory-section">
            <span className="fc-memory-label">{currentStep.scope}() Local Memory:</span>
            <div className="fc-memory-chips">
              {Object.entries(currentStep.fnMemory).map(([k, v]) => (
                <span
                  key={k}
                  className={`fc-mem-chip${currentStep.changedVar === k ? ' fc-mem-changed' : ''}`}
                >
                  <span className="fc-mem-k">{k}</span>
                  <span className="fc-mem-eq">=</span>
                  <span className="fc-mem-v">{formatValue(v)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {currentStep && currentStep.outputs.length > 0 && (
          <div className="fc-memory-section">
            <span className="fc-memory-label">Output:</span>
            <div className="fc-memory-chips">
              {currentStep.outputs.map((val, i) => (
                <span key={i} className="fc-mem-chip fc-mem-output">
                  {formatValue(val)}
                </span>
              ))}
            </div>
          </div>
        )}
        {hasFunctions && currentStep && currentStep.callStack.length > 1 && (
          <div className="fc-memory-section">
            <span className="fc-memory-label">Call Stack:</span>
            <span className="fc-stack-text">{currentStep.callStack.join(' → ')}</span>
          </div>
        )}
      </div>

      {/* Optional synced Python preview */}
      {showPython && (
        <div className="fc-python-panel">
          <div className="fc-python-header">Same program in Python</div>
          <pre className="fc-python-code">
            {pythonLines.map((line) => {
              const isLineActive = Boolean(activeNodeId && line.nodeId === activeNodeId)
              return (
                <div
                  key={line.lineNumber}
                  className={`fc-python-line${isLineActive ? ' fc-python-line-active' : ''}`}
                >
                  <span className="fc-python-ln">{line.lineNumber}</span>
                  <code>{line.text || ' '}</code>
                </div>
              )
            })}
          </pre>
        </div>
      )}

      {/* Automated challenge check results */}
      {checkResults && (
        <div className={`fc-checks${allChecksPassed ? ' fc-checks-pass' : ''}`}>
          <div className="fc-checks-title">
            {allChecksPassed
              ? 'All test cases passed!'
              : 'Some test cases need a tweak:'}
          </div>
          <ul className="fc-checks-list">
            {checkResults.map((r) => (
              <li key={r.label} className={r.passed ? 'fc-check-ok' : 'fc-check-fail'}>
                {r.passed ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : (
                  <XCircle className="size-4 shrink-0" />
                )}
                <span>
                  {r.label}
                  {!r.passed && (
                    <span className="fc-check-detail">
                      {' '}
                      — {r.error ? r.error : `got ${formatValue(r.actual)}`}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
