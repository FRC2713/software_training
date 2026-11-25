export type Value = number | string

export type Operand =
  | { kind: 'num'; value: number }
  | { kind: 'str'; value: string }
  | { kind: 'var'; name: string }

export type BinOp = '+' | '-' | '*'
export type CmpOp = '<' | '>' | '<=' | '>=' | '==' | '!='

export type Expr =
  | { kind: 'operand'; operand: Operand }
  | { kind: 'binary'; left: Operand; op: BinOp; right: Operand }
  | { kind: 'call'; fnName: string; arg: Operand }

export interface SetNode {
  id: string
  kind: 'set'
  target: string
  expr: Expr
  note?: string
  editable?: boolean
  removable?: boolean
}

export interface IfNode {
  id: string
  kind: 'if'
  left: Operand
  cmp: CmpOp
  right: Operand
  yes: FlowNode[]
  no: FlowNode[]
  editableCond?: boolean
  editableBranches?: boolean
  removable?: boolean
}

export interface RepeatNode {
  id: string
  kind: 'repeat'
  times: Operand
  body: FlowNode[]
  editableTimes?: boolean
  editableBody?: boolean
  removable?: boolean
}

export interface OutputNode {
  id: string
  kind: 'output'
  operand: Operand
  label?: string
  removable?: boolean
}

export type FlowNode = SetNode | IfNode | RepeatNode | OutputNode

export interface FunctionDef {
  name: string
  param: string
  description: string
  body: FlowNode[]
  returnVar: string
  editableBody?: boolean
}

export interface FlowchartProgram {
  main: FlowNode[]
  functions: FunctionDef[]
}

export interface TraceStep {
  stepNumber: number
  nodeId: string
  scope: 'main' | string
  isError?: boolean
  activeBranch?: 'yes' | 'no'
  activeLoopPhase?: 'check' | 'back' | 'exit'
  skippedNodeIds: string[]
  memory: Record<string, Value>
  fnMemory?: Record<string, Value>
  changedVar?: string
  callStack: string[]
  loopProgress?: Record<string, { pass: number; total: number }>
  outputs: Value[]
  narration: string
  returnValue?: Value
}

export interface TraceResult {
  steps: TraceStep[]
  finalMemory: Record<string, Value>
  finalOutputs: Value[]
  error?: string
}

export interface ChallengeCase {
  label: string
  overrides: Record<string, Value>
  expectedOutput: Value
}

export interface ChallengeCheckResult {
  label: string
  passed: boolean
  expected: Value
  actual: Value | undefined
  error?: string
}

const MAX_TRACE_STEPS = 120
export const MAX_REPEAT_TIMES = 20

export function formatValue(v: Value | undefined): string {
  if (v === undefined) return '?'
  if (typeof v === 'string') return `"${v}"`
  return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2)))
}

export function formatOperand(op: Operand): string {
  if (op.kind === 'num') return String(op.value)
  if (op.kind === 'str') return `"${op.value}"`
  return op.name
}

export function formatOpSymbol(op: BinOp): string {
  if (op === '*') return '×'
  if (op === '-') return '−'
  return '+'
}

export function formatCmpSymbol(cmp: CmpOp): string {
  if (cmp === '==') return '='
  if (cmp === '!=') return '≠'
  if (cmp === '<=') return '≤'
  if (cmp === '>=') return '≥'
  return cmp
}

export function formatExpr(expr: Expr): string {
  if (expr.kind === 'operand') return formatOperand(expr.operand)
  if (expr.kind === 'binary') {
    return `${formatOperand(expr.left)} ${formatOpSymbol(expr.op)} ${formatOperand(expr.right)}`
  }
  return `${expr.fnName}(${formatOperand(expr.arg)})`
}

function collectIds(nodes: FlowNode[]): string[] {
  const out: string[] = []
  for (const n of nodes) {
    out.push(n.id)
    if (n.kind === 'if') {
      out.push(...collectIds(n.yes), ...collectIds(n.no))
    } else if (n.kind === 'repeat') {
      out.push(...collectIds(n.body))
    }
  }
  return out
}

function evalOperand(op: Operand, mem: Record<string, Value>): Value {
  if (op.kind === 'num') return op.value
  if (op.kind === 'str') return op.value
  if (Object.prototype.hasOwnProperty.call(mem, op.name)) {
    return mem[op.name]
  }
  throw new Error(`Variable "${op.name}" hasn't been set yet.`)
}

function toNumber(v: Value, context: string): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  throw new Error(`Expected a number for ${context}, got ${formatValue(v)}.`)
}

function evalCmp(left: Value, cmp: CmpOp, right: Value): boolean {
  switch (cmp) {
    case '<':
      return toNumber(left, 'comparison') < toNumber(right, 'comparison')
    case '>':
      return toNumber(left, 'comparison') > toNumber(right, 'comparison')
    case '<=':
      return toNumber(left, 'comparison') <= toNumber(right, 'comparison')
    case '>=':
      return toNumber(left, 'comparison') >= toNumber(right, 'comparison')
    case '==':
      return left === right
    case '!=':
      return left !== right
  }
}

export function applyInputOverrides(
  program: FlowchartProgram,
  overrides: Record<string, Value>,
): FlowchartProgram {
  const clone: FlowchartProgram = structuredClone(program)
  for (const node of clone.main) {
    if (
      node.kind === 'set' &&
      node.expr.kind === 'operand' &&
      Object.prototype.hasOwnProperty.call(overrides, node.target)
    ) {
      const val = overrides[node.target]
      node.expr.operand =
        typeof val === 'number' ? { kind: 'num', value: val } : { kind: 'str', value: val }
    }
  }
  return clone
}

export function compileTrace(program: FlowchartProgram): TraceResult {
  const steps: TraceStep[] = []
  const memory: Record<string, Value> = {}
  const outputs: Value[] = []
  const skipped = new Set<string>()
  const loopProgress: Record<string, { pass: number; total: number }> = {}
  const fnMap = new Map(program.functions.map((f) => [f.name, f]))

  const pushStep = (partial: Omit<TraceStep, 'stepNumber' | 'skippedNodeIds' | 'memory' | 'outputs' | 'loopProgress'> & { fnMemory?: Record<string, Value> }) => {
    if (steps.length >= MAX_TRACE_STEPS) {
      throw new Error(`Stopped after ${MAX_TRACE_STEPS} steps to keep the trace manageable.`)
    }
    steps.push({
      stepNumber: steps.length + 1,
      skippedNodeIds: [...skipped],
      memory: { ...memory },
      outputs: [...outputs],
      loopProgress: structuredClone(loopProgress),
      ...partial,
    })
  }

  pushStep({
    nodeId: '__start__',
    scope: 'main',
    callStack: ['main'],
    narration: 'Program starts at START and follows the arrows from top to bottom.',
  })

  class RecordedError extends Error {
    constructor(message: string) {
      super(message)
    }
  }

  const runNodes = (
    nodes: FlowNode[],
    scope: 'main' | string,
    scopeMem: Record<string, Value>,
    callStack: string[],
  ) => {
    for (const node of nodes) {
      try {
        if (node.kind === 'set') {
          if (node.expr.kind === 'call') {
            const fn = fnMap.get(node.expr.fnName)
            if (!fn) throw new Error(`Unknown function "${node.expr.fnName}".`)
            const argVal = evalOperand(node.expr.arg, scopeMem)
            pushStep({
              nodeId: node.id,
              scope,
              callStack: [...callStack],
              fnMemory: scope === 'main' ? undefined : { ...scopeMem },
              narration: `Calling ${fn.name}(${formatValue(argVal)}) — jumping into the reusable "${fn.name}" flowchart.`,
            })

            const localMem: Record<string, Value> = { [fn.param]: argVal }
            const nextStack = [...callStack, `${fn.name}(${fn.param}=${formatValue(argVal)})`]
            pushStep({
              nodeId: `__fn_start_${fn.name}__`,
              scope: fn.name,
              callStack: nextStack,
              fnMemory: { ...localMem },
              changedVar: fn.param,
              narration: `Inside ${fn.name}: parameter ${fn.param} receives ${formatValue(argVal)}.`,
            })

            runNodes(fn.body, fn.name, localMem, nextStack)

            const retVal = evalOperand({ kind: 'var', name: fn.returnVar }, localMem)
            pushStep({
              nodeId: `__fn_return_${fn.name}__`,
              scope: fn.name,
              callStack: nextStack,
              fnMemory: { ...localMem },
              returnValue: retVal,
              narration: `${fn.name} finishes and hands back ${formatValue(retVal)} to the caller.`,
            })

            scopeMem[node.target] = retVal
            pushStep({
              nodeId: node.id,
              scope,
              callStack: [...callStack],
              fnMemory: scope === 'main' ? undefined : { ...scopeMem },
              changedVar: node.target,
              returnValue: retVal,
              narration: `Back in ${scope}: stored ${formatValue(retVal)} into ${node.target}.`,
            })
            continue
          }

          let val: Value
          let detail: string
          if (node.expr.kind === 'operand') {
            val = evalOperand(node.expr.operand, scopeMem)
            detail = `${node.target} = ${formatValue(val)}`
          } else {
            const l = toNumber(evalOperand(node.expr.left, scopeMem), 'math')
            const r = toNumber(evalOperand(node.expr.right, scopeMem), 'math')
            if (node.expr.op === '+') val = l + r
            else if (node.expr.op === '-') val = l - r
            else val = l * r
            detail = `${formatValue(l)} ${formatOpSymbol(node.expr.op)} ${formatValue(r)} = ${formatValue(val)} → stored in ${node.target}`
          }
          scopeMem[node.target] = val
          pushStep({
            nodeId: node.id,
            scope,
            callStack: [...callStack],
            fnMemory: scope === 'main' ? undefined : { ...scopeMem },
            changedVar: node.target,
            narration: detail,
          })
        } else if (node.kind === 'if') {
          const l = evalOperand(node.left, scopeMem)
          const r = evalOperand(node.right, scopeMem)
          const result = evalCmp(l, node.cmp, r)
          const taken = result ? node.yes : node.no
          const untaken = result ? node.no : node.yes
          for (const sid of collectIds(untaken)) skipped.add(sid)

          pushStep({
            nodeId: node.id,
            scope,
            activeBranch: result ? 'yes' : 'no',
            callStack: [...callStack],
            fnMemory: scope === 'main' ? undefined : { ...scopeMem },
            narration: `Check: ${formatValue(l)} ${formatCmpSymbol(node.cmp)} ${formatValue(r)} is ${result ? 'YES (True)' : 'NO (False)'} → taking the ${result ? 'YES' : 'NO'} arrow and skipping the other branch.`,
          })

          runNodes(taken, scope, scopeMem, callStack)
        } else if (node.kind === 'repeat') {
          const rawTimes = toNumber(evalOperand(node.times, scopeMem), 'repeat count')
          const times = Math.trunc(rawTimes)
          if (times < 0 || times > MAX_REPEAT_TIMES) {
            throw new Error(`Repeat count must be between 0 and ${MAX_REPEAT_TIMES} (got ${rawTimes}).`)
          }
          if (times === 0) {
            for (const sid of collectIds(node.body)) skipped.add(sid)
            loopProgress[node.id] = { pass: 0, total: 0 }
            pushStep({
              nodeId: node.id,
              scope,
              activeLoopPhase: 'exit',
              callStack: [...callStack],
              fnMemory: scope === 'main' ? undefined : { ...scopeMem },
              narration: `Repeat count is 0 → skipping the loop body and taking the DONE arrow.`,
            })
            continue
          }

          for (let pass = 1; pass <= times; pass++) {
            loopProgress[node.id] = { pass, total: times }
            pushStep({
              nodeId: node.id,
              scope,
              activeLoopPhase: 'check',
              callStack: [...callStack],
              fnMemory: scope === 'main' ? undefined : { ...scopeMem },
              narration: `Loop pass ${pass} of ${times}: entering the loop body.`,
            })
            runNodes(node.body, scope, scopeMem, callStack)
            if (pass < times) {
              pushStep({
                nodeId: node.id,
                scope,
                activeLoopPhase: 'back',
                callStack: [...callStack],
                fnMemory: scope === 'main' ? undefined : { ...scopeMem },
                narration: `End of pass ${pass} of ${times}: following the loop-back arrow to repeat.`,
              })
            }
          }

          pushStep({
            nodeId: node.id,
            scope,
            activeLoopPhase: 'exit',
            callStack: [...callStack],
            fnMemory: scope === 'main' ? undefined : { ...scopeMem },
            narration: `Completed all ${times} ${times === 1 ? 'pass' : 'passes'} → exiting via the DONE arrow.`,
          })
        } else if (node.kind === 'output') {
          const val = evalOperand(node.operand, scopeMem)
          outputs.push(val)
          pushStep({
            nodeId: node.id,
            scope,
            callStack: [...callStack],
            fnMemory: scope === 'main' ? undefined : { ...scopeMem },
            narration: `${node.label ?? 'Output'}: ${formatValue(val)}`,
          })
        }
      } catch (err) {
        if (err instanceof RecordedError) throw err
        const message = err instanceof Error ? err.message : 'Could not evaluate step.'
        pushStep({
          nodeId: node.id,
          scope,
          isError: true,
          callStack: [...callStack],
          fnMemory: scope === 'main' ? undefined : { ...scopeMem },
          narration: `Error at this step: ${message}`,
        })
        throw new RecordedError(message)
      }
    }
  }

  try {
    runNodes(program.main, 'main', memory, ['main'])
    pushStep({
      nodeId: '__end__',
      scope: 'main',
      callStack: ['main'],
      narration:
        outputs.length > 0
          ? `Reached END! Final output: ${formatValue(outputs[outputs.length - 1])}.`
          : 'Reached END! Program finished.',
    })
    return { steps, finalMemory: memory, finalOutputs: outputs }
  } catch (err) {
    return {
      steps,
      finalMemory: memory,
      finalOutputs: outputs,
      error: err instanceof Error ? err.message : 'Could not evaluate flowchart.',
    }
  }
}

export interface PythonLine {
  lineNumber: number
  text: string
  nodeId?: string
}

function pyOperand(op: Operand): string {
  if (op.kind === 'num') return String(op.value)
  if (op.kind === 'str') return `"${op.value}"`
  return op.name
}

function pyExpr(expr: Expr): string {
  if (expr.kind === 'operand') return pyOperand(expr.operand)
  if (expr.kind === 'binary') return `${pyOperand(expr.left)} ${expr.op} ${pyOperand(expr.right)}`
  return `${expr.fnName}(${pyOperand(expr.arg)})`
}

export function generatePythonLines(program: FlowchartProgram): PythonLine[] {
  const lines: PythonLine[] = []
  const push = (text: string, nodeId?: string) => {
    lines.push({ lineNumber: lines.length + 1, text, nodeId })
  }

  const emitNodes = (nodes: FlowNode[], indent: string) => {
    if (nodes.length === 0) {
      push(`${indent}pass`)
      return
    }
    for (const node of nodes) {
      if (node.kind === 'set') {
        push(`${indent}${node.target} = ${pyExpr(node.expr)}`, node.id)
      } else if (node.kind === 'if') {
        push(`${indent}if ${pyOperand(node.left)} ${node.cmp} ${pyOperand(node.right)}:`, node.id)
        emitNodes(node.yes, `${indent}    `)
        if (node.no.length > 0) {
          push(`${indent}else:`)
          emitNodes(node.no, `${indent}    `)
        }
      } else if (node.kind === 'repeat') {
        push(`${indent}for _ in range(${pyOperand(node.times)}):`, node.id)
        emitNodes(node.body, `${indent}    `)
      } else if (node.kind === 'output') {
        push(`${indent}print(${pyOperand(node.operand)})`, node.id)
      }
    }
  }

  for (const fn of program.functions) {
    push(`def ${fn.name}(${fn.param}):`, `__fn_start_${fn.name}__`)
    emitNodes(fn.body, '    ')
    push(`    return ${fn.returnVar}`, `__fn_return_${fn.name}__`)
    push('')
  }

  emitNodes(program.main, '')
  return lines
}

export function runChallengeChecks(
  program: FlowchartProgram,
  cases: ChallengeCase[],
): ChallengeCheckResult[] {
  return cases.map((c) => {
    const overridden = applyInputOverrides(program, c.overrides)
    const trace = compileTrace(overridden)
    const actual = trace.finalOutputs[trace.finalOutputs.length - 1]
    return {
      label: c.label,
      passed: !trace.error && actual === c.expectedOutput,
      expected: c.expectedOutput,
      actual,
      error: trace.error,
    }
  })
}
