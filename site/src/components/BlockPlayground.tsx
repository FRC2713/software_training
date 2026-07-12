import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { createNode, getPreset, type FunctionDef, type ToolbarItem } from '../lib/blockPresets'
import './BlockPlayground.css'

// The block editor is a tiny visual programming language that grows across the
// first four lessons: number/operation blocks (sequences), a decision diamond
// that branches (conditionals), a repeat block that iterates (loops), and call
// blocks backed by reusable sub-flowcharts (functions). "Run step by step"
// walks the graph in dependency order so a student watches the computer
// evaluate one block at a time — and skips the blocks on an if-branch the
// program didn't take, like code that never runs.

export type Op = 'add' | 'sub' | 'mul'
export type Cmp = 'gt' | 'lt' | 'eq' | 'neq'

// A value can be a number, a boolean (a decision diamond's answer), a config
// object (the builder pattern's accumulated fields), or '?' once we hit a
// block whose inputs aren't all connected — or that sits on a branch the
// program didn't take — so the student sees where the flow breaks.
type ConfigValue = Record<string, number>
type Value = number | boolean | ConfigValue | '?'

const OP_SYMBOL: Record<Op, string> = { add: '+', sub: '−', mul: '×' }
const OP_APPLY: Record<Op, (a: number, b: number) => number> = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
}
const CMP_SYMBOL: Record<Cmp, string> = { gt: '>', lt: '<', eq: '=', neq: '≠' }
const CMP_APPLY: Record<Cmp, (a: number, b: number) => boolean> = {
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const isNum = (v: Value): v is number => typeof v === 'number'
const isConfig = (v: Value): v is ConfigValue => typeof v === 'object' && v !== null
const fmt = (v: Value | null): string => {
  if (v === null || v === '?') return '?'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (isConfig(v)) {
    const entries = Object.entries(v)
    return entries.length === 0 ? '{ }' : `{ ${entries.map(([k, n]) => `${k}: ${n}`).join(', ')} }`
  }
  return String(v)
}

// ---- Custom nodes ----------------------------------------------------------

interface BaseData {
  active: boolean
  shown: Value | null // the value revealed during a step-by-step run
  skipped?: boolean // set during a run on blocks along an untaken if-branch
  [key: string]: unknown
}
interface NumberData extends BaseData {
  value: number
  editable: boolean
}
interface InputData extends BaseData {
  label: string
  value: number
}
interface OpData extends BaseData {
  op: Op
}
// The if-block is a decision diamond: it asks a yes/no question about its two
// operands, and the program follows exactly one of its two arrows out
// ('true' or 'false').
interface IfData extends BaseData {
  cmp: Cmp
}
// The loop's own logic — start value and per-pass step — lives on the block
// itself; the only thing wired in from outside is how many times to repeat.
interface LoopData extends BaseData {
  op: 'add' | 'mul'
  start: number
  step: number
}
interface CallData extends BaseData {
  fn: string
  label: string
}
// A static legend card naming an interface and its one method — never wired
// to anything, just the "here's the contract" header for lesson 28's diagram.
interface ContractData extends BaseData {
  title: string
  method: string
}
// One implementation of that contract (labelled SIM or REAL), holding the
// number its method would return — a leaf value, same shape as `number`.
interface ImplData extends BaseData {
  label: string
  value: number
  editable: boolean
}
// The polymorphism payoff: a manual toggle between two wired implementations.
// Nothing about its wiring changes when you flip it — only which side it reads.
interface SwapData extends BaseData {
  selected: 'a' | 'b'
}
// `new Config()` — the start of a builder chain. Always an empty object; the
// interesting behavior lives in the `withStep` blocks chained after it.
type ConfigStartData = BaseData
// One `.withX(value)` call in a builder chain: merges its own field into
// whatever config flowed in, and passes the result along.
interface WithStepData extends BaseData {
  field: string
  label: string
  value: number
}

// Editing a value invalidates every revealed result, so we wipe them all and
// let the student re-run to see the new answer flow through.
function clearShownValues(nodes: Node[]): Node[] {
  return nodes.map((n) => ({ ...n, data: { ...n.data, shown: null, active: false, skipped: false } }))
}

// Wires carry run styling too (animation on live wires, dimming on a skipped
// branch), so whatever invalidates the nodes' revealed values must also strip
// the edges back to neutral.
function clearEdgeRunState(edges: Edge[]): Edge[] {
  return edges.map((e) => ({ ...e, animated: false, className: undefined }))
}

function NumberNode({ id, data }: NodeProps<Node<NumberData>>) {
  const { setNodes, setEdges } = useReactFlow()
  return (
    <div className={`blk blk-number${data.active ? ' blk-active' : ''}`}>
      <span className="blk-tag">number</span>
      {data.editable ? (
        <input
          className="nodrag blk-input"
          type="number"
          value={data.value}
          onChange={(e) => {
            setEdges(clearEdgeRunState)
            setNodes((nodes) =>
              clearShownValues(nodes).map((n) =>
                n.id === id ? { ...n, data: { ...n.data, value: Number(e.target.value) } } : n,
              ),
            )
          }}
        />
      ) : (
        <span className="blk-value">{data.value}</span>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// A function's parameter, shown symbolically (x) inside its definition view.
function InputNode({ data }: NodeProps<Node<InputData>>) {
  return (
    <div className="blk blk-input-node">
      <span className="blk-tag">input</span>
      <span className="blk-value">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function OpNode({ data }: NodeProps<Node<OpData>>) {
  return (
    <div className={`blk blk-op${data.active ? ' blk-active' : ''}`}>
      <Handle type="target" id="a" position={Position.Top} style={{ left: '30%' }} />
      <Handle type="target" id="b" position={Position.Top} style={{ left: '70%' }} />
      <span className="blk-op-symbol">{OP_SYMBOL[data.op]}</span>
      {data.shown !== null && <span className="blk-op-result">= {fmt(data.shown)}</span>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// Shared layout for the multi-input blocks (outlet, call): the labelled
// inputs sit across the top, each with a handle above it, and the block's
// title sits below — so the graph reads top-to-bottom like code.
function MultiNode({
  title,
  rows,
  shown,
  active,
  skipped,
}: {
  title: string
  rows: { id: string; label: string }[]
  shown: Value | null
  active: boolean
  skipped?: boolean
}) {
  return (
    <div className={`blk blk-multi${active ? ' blk-active' : ''}${skipped ? ' blk-skipped' : ''}`}>
      <div className="blk-inputs">
        {rows.map((row, i) => (
          <div className="blk-cell" key={row.id}>
            <Handle
              type="target"
              id={row.id}
              position={Position.Top}
              style={{ left: `${((i + 0.5) / rows.length) * 100}%` }}
            />
            <span className="blk-row-label">{row.label}</span>
          </div>
        ))}
      </div>
      <div className="blk-title">
        {title}
        {shown !== null && <span className="blk-multi-shown">{fmt(shown)}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// The if-block: a classic flowchart decision diamond. It asks a yes/no
// question about its two operands, and the program follows exactly one of the
// two arrows leaving it — 'true' out the left point, 'false' out the right.
// Blocks gated from the arrow not taken get skipped, like code that never runs.
function IfNode({ data }: NodeProps<Node<IfData>>) {
  return (
    <div className={`blk-diamond${data.active ? ' blk-active' : ''}`}>
      <Handle type="target" id="a" position={Position.Top} style={{ left: '38%' }} />
      <Handle type="target" id="b" position={Position.Top} style={{ left: '62%' }} />
      <div className="blk-diamond-shape" />
      <div className="blk-diamond-label">
        <span className="blk-diamond-question">a {CMP_SYMBOL[data.cmp]} b ?</span>
        {data.shown !== null && <span className="blk-diamond-outcome">→ {fmt(data.shown)}</span>}
      </div>
      <Handle type="source" id="true" position={Position.Left} style={{ top: '50%' }} />
      <Handle type="source" id="false" position={Position.Right} style={{ top: '50%' }} />
    </div>
  )
}

// The "answer" block: the step that runs on one branch of a decision. It
// produces its wired `value` only when its `gate` input ("when", wired from a
// diamond's arrow) is on the path the program took. On the untaken branch it
// gets skipped — code that never runs, made visible.
function OutletNode({ data }: NodeProps<Node<BaseData>>) {
  return (
    <MultiNode
      title="answer"
      rows={[
        { id: 'gate', label: 'when' },
        { id: 'value', label: 'value' },
      ]}
      shown={data.shown}
      active={data.active}
      skipped={data.skipped}
    />
  )
}

function LoopNode({ id, data }: NodeProps<Node<LoopData>>) {
  const { setNodes, setEdges } = useReactFlow()
  const setField = (field: 'start' | 'step') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setEdges(clearEdgeRunState)
    setNodes((nodes) =>
      clearShownValues(nodes).map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)),
    )
  }
  return (
    <div className={`blk blk-loop${data.active ? ' blk-active' : ''}`}>
      <div className="blk-inputs">
        <div className="blk-cell">
          <Handle type="target" id="times" position={Position.Top} style={{ left: '50%' }} />
          <span className="blk-row-label">times</span>
        </div>
      </div>
      <div className="blk-title">repeat</div>
      <div className="blk-loop-body">
        <input
          className="nodrag blk-input blk-input-sm"
          type="number"
          value={data.start}
          onChange={setField('start')}
        />
        <span className="blk-op-symbol">{data.op === 'add' ? '+' : '×'}</span>
        <input
          className="nodrag blk-input blk-input-sm"
          type="number"
          value={data.step}
          onChange={setField('step')}
        />
      </div>
      {data.shown !== null && <span className="blk-multi-shown">{fmt(data.shown)}</span>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function CallNode({ data }: NodeProps<Node<CallData>>) {
  return (
    <MultiNode
      title={data.label}
      rows={[{ id: 'n', label: 'n' }]}
      shown={data.shown}
      active={data.active}
    />
  )
}

function ResultNode({ data }: NodeProps<Node<BaseData>>) {
  return (
    <div className={`blk blk-result${data.active ? ' blk-active' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <span className="blk-tag">result</span>
      <span className="blk-result-value">{fmt(data.shown)}</span>
    </div>
  )
}

// The interface's contract: name + one method signature, no handles at all —
// it never carries a value, it just labels what the implementations below it
// promise to do.
function ContractNode({ data }: NodeProps<Node<ContractData>>) {
  return (
    <div className="blk blk-contract">
      <span className="blk-tag">interface</span>
      <span className="blk-contract-title">{data.title}</span>
      <span className="blk-contract-method">{data.method}</span>
    </div>
  )
}

// One implementation of the contract above — a leaf value like `number`, just
// tagged SIM or REAL so it's obvious which "hardware" it stands in for.
function ImplNode({ id, data }: NodeProps<Node<ImplData>>) {
  const { setNodes, setEdges } = useReactFlow()
  return (
    <div className={`blk blk-impl blk-impl-${data.label.toLowerCase()}${data.active ? ' blk-active' : ''}`}>
      <span className="blk-tag">{data.label}</span>
      {data.editable ? (
        <input
          className="nodrag blk-input"
          type="number"
          value={data.value}
          onChange={(e) => {
            setEdges(clearEdgeRunState)
            setNodes((nodes) =>
              clearShownValues(nodes).map((n) =>
                n.id === id ? { ...n, data: { ...n.data, value: Number(e.target.value) } } : n,
              ),
            )
          }}
        />
      ) : (
        <span className="blk-value">{data.value}</span>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// The manual toggle between two wired implementations — the whole point:
// flipping it changes what flows out without touching a single wire.
function SwapNode({ id, data }: NodeProps<Node<SwapData>>) {
  const { setNodes, setEdges } = useReactFlow()
  const flip = () => {
    setEdges(clearEdgeRunState)
    setNodes((nodes) =>
      clearShownValues(nodes).map((n) =>
        n.id === id ? { ...n, data: { ...n.data, selected: n.data.selected === 'a' ? 'b' : 'a' } } : n,
      ),
    )
  }
  return (
    <div className={`blk blk-swap${data.active ? ' blk-active' : ''}`}>
      <Handle type="target" id="a" position={Position.Top} style={{ left: '30%' }} />
      <Handle type="target" id="b" position={Position.Top} style={{ left: '70%' }} />
      <span className="blk-tag">swap</span>
      <button type="button" className="nodrag blk-swap-toggle" onClick={flip}>
        using {data.selected === 'a' ? '◀ A' : 'B ▶'}
      </button>
      {data.shown !== null && <span className="blk-op-result">= {fmt(data.shown)}</span>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function ConfigStartNode({ data }: NodeProps<Node<ConfigStartData>>) {
  return (
    <div className={`blk blk-config-start${data.active ? ' blk-active' : ''}`}>
      <span className="blk-tag">config</span>
      <span className="blk-value">new Config()</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// One link in a builder chain: takes the config flowing in, merges its own
// field into it, and passes the combined config along to the next step.
function WithStepNode({ id, data }: NodeProps<Node<WithStepData>>) {
  const { setNodes, setEdges } = useReactFlow()
  return (
    <div className={`blk blk-with-step${data.active ? ' blk-active' : ''}`}>
      <Handle type="target" id="in" position={Position.Top} style={{ left: '50%' }} />
      <span className="blk-tag">.{data.label}(…)</span>
      <input
        className="nodrag blk-input blk-input-sm"
        type="number"
        value={data.value}
        onChange={(e) => {
          setEdges(clearEdgeRunState)
          setNodes((nodes) =>
            clearShownValues(nodes).map((n) =>
              n.id === id ? { ...n, data: { ...n.data, value: Number(e.target.value) } } : n,
            ),
          )
        }}
      />
      {data.shown !== null && <span className="blk-multi-shown">{fmt(data.shown)}</span>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes = {
  number: NumberNode,
  input: InputNode,
  op: OpNode,
  if: IfNode,
  outlet: OutletNode,
  loop: LoopNode,
  call: CallNode,
  result: ResultNode,
  contract: ContractNode,
  impl: ImplNode,
  swap: SwapNode,
  configStart: ConfigStartNode,
  withStep: WithStepNode,
}

// ---- Evaluation ------------------------------------------------------------

type FnMap = Record<string, FunctionDef>

// All edges wired into a given (node, handle) target — usually one, but a
// convergence point downstream of a diamond's two branches (like `result`)
// legitimately has two, only one of which is ever live at a time.
function edgesInto(edges: Edge[], target: string, handle: string | null): Edge[] {
  return edges.filter((e) => e.target === target && (e.targetHandle ?? null) === handle)
}

// Resolve whatever's wired into (id, handle), memoized per node+output-handle
// and guarding against cycles the student might wire up by accident. Returns
// the first candidate that isn't '?' — the mechanism that lets two branches
// converge on one downstream target without the dead branch winning.
function resolveInput(
  id: string,
  handle: string | null,
  nodes: Node[],
  edges: Edge[],
  fns: FnMap,
  memo: Map<string, Value>,
  stack: Set<string>,
): Value {
  for (const e of edgesInto(edges, id, handle)) {
    const v = valueOf(e.source, e.sourceHandle ?? null, nodes, edges, fns, memo, stack)
    if (v !== '?') return v
  }
  return '?'
}

// Resolve a node's value at a given output handle (most node types have only
// one, unnamed output; the if-block has two — 'true' and 'false' — and only
// the one on the branch the program takes resolves to a value).
function valueOf(
  id: string,
  outHandle: string | null,
  nodes: Node[],
  edges: Edge[],
  fns: FnMap,
  memo: Map<string, Value>,
  stack: Set<string>,
): Value {
  const key = `${id}:${outHandle ?? ''}`
  const cached = memo.get(key)
  if (cached !== undefined) return cached
  if (stack.has(key)) return '?'
  stack.add(key)

  const node = nodes.find((n) => n.id === id)
  const input = (handle: string | null): Value => resolveInput(id, handle, nodes, edges, fns, memo, stack)

  // Any block can be wired from a decision diamond's arrow into its 'gate'
  // input — it only produces a value while its arrow is the branch the
  // program took (i.e. resolves `true`).
  let result: Value = '?'
  const gated = edgesInto(edges, id, 'gate').length > 0
  if (gated && input('gate') !== true) {
    result = '?'
  } else if (node?.type === 'number' || node?.type === 'input') {
    result = (node.data as NumberData).value
  } else if (node?.type === 'op') {
    const a = input('a')
    const b = input('b')
    if (isNum(a) && isNum(b)) result = OP_APPLY[(node.data as OpData).op](a, b)
  } else if (node?.type === 'if') {
    const a = input('a')
    const b = input('b')
    const cond = isNum(a) && isNum(b) ? CMP_APPLY[(node.data as IfData).cmp](a, b) : null
    if (outHandle === 'true') result = cond === true ? true : '?'
    else if (outHandle === 'false') result = cond === false ? true : '?'
  } else if (node?.type === 'outlet') {
    result = input('value')
  } else if (node?.type === 'loop') {
    const times = input('times')
    if (isNum(times)) {
      const { op: loopOp, start, step } = node.data as LoopData
      result = runLoop(loopOp, start, times, step)
    }
  } else if (node?.type === 'call') {
    const n = input('n')
    const fn = fns[(node.data as CallData).fn]
    if (isNum(n) && fn) result = callFunction(fn, n, fns)
  } else if (node?.type === 'impl') {
    result = (node.data as ImplData).value
  } else if (node?.type === 'swap') {
    result = input((node.data as SwapData).selected)
  } else if (node?.type === 'configStart') {
    result = {}
  } else if (node?.type === 'withStep') {
    const configIn = input('in')
    const { field, value } = node.data as WithStepData
    result = { ...(isConfig(configIn) ? configIn : {}), [field]: value }
  } else if (node?.type === 'result') {
    result = input(null)
  }

  stack.delete(key)
  memo.set(key, result)
  return result
}

function runLoop(operation: 'add' | 'mul', start: number, count: number, step: number): number {
  let acc = start
  const iterations = Math.max(0, Math.min(Math.round(count), 1000))
  for (let i = 0; i < iterations; i++) acc = operation === 'add' ? acc + step : acc * step
  return acc
}

// Run a function's inner flowchart with `arg` plugged into its input node.
function callFunction(fn: FunctionDef, arg: number, fns: FnMap): Value {
  const nodes = fn.nodes.map((n) =>
    n.type === 'input' ? { ...n, data: { ...n.data, value: arg } } : n,
  )
  const out = fn.nodes.find((n) => n.type === 'result')
  return out ? valueOf(out.id, null, nodes, fn.edges, fns, new Map(), new Set()) : '?'
}

const COMPUTED = new Set(['op', 'if', 'outlet', 'loop', 'call', 'result', 'swap', 'withStep'])

// Dependency-first ordering of the computed blocks, so the animation reveals
// inputs before the blocks that consume them.
function stepOrder(nodes: Node[], edges: Edge[]): string[] {
  const order: string[] = []
  const seen = new Set<string>()
  const visit = (id: string) => {
    if (seen.has(id)) return
    seen.add(id)
    for (const e of edges.filter((e) => e.target === id)) visit(e.source)
    if (COMPUTED.has(nodes.find((n) => n.id === id)?.type ?? '')) order.push(id)
  }
  const result = nodes.find((n) => n.type === 'result')
  if (result) visit(result.id)
  for (const n of nodes) if (COMPUTED.has(n.type ?? '')) visit(n.id)
  return order
}

// ---- Read-only "inside the block" view (lesson 4) --------------------------

function FunctionDefView({ fn }: { fn: FunctionDef }) {
  return (
    <div className="fn-def">
      <div className="fn-def-label">
        Inside <strong>{fn.label}</strong>
      </div>
      <div className="fn-def-canvas">
        <ReactFlowProvider>
          <ReactFlow
            nodes={fn.nodes}
            edges={fn.edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            colorMode="system"
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  )
}

// ---- Playground ------------------------------------------------------------

function Playground({ preset }: { preset: string }) {
  const config = useMemo(() => getPreset(preset), [preset])
  const fns = useMemo<FnMap>(
    () => Object.fromEntries((config.functions ?? []).map((f) => [f.name, f])),
    [config],
  )
  // Clone the preset so React Flow's in-place edits (dragging, connecting) never
  // touch the shared module-level constants — Reset relies on them staying
  // pristine to rebuild the starting graph.
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(structuredClone(config.nodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(structuredClone(config.edges))
  const [running, setRunning] = useState(false)
  const runToken = useRef(0)
  const nextId = useRef(config.nodes.length + 1)

  const onConnect = useCallback(
    (params: Connection) => {
      setNodes(clearShownValues)
      // Each named input handle accepts a single wire — drop any existing one
      // first. The anonymous target handle (only `result` uses it) is the one
      // place two wires legitimately converge: the diamond's two branches,
      // each ending in an answer block, both feeding the same result.
      // Arrows drawn from a diamond's true/false handles get labelled, same
      // as the preset-defined ones.
      const labelled =
        params.sourceHandle === 'true' || params.sourceHandle === 'false'
          ? { ...params, label: params.sourceHandle }
          : params
      setEdges((eds) =>
        addEdge(
          labelled,
          clearEdgeRunState(
            params.targetHandle == null
              ? eds
              : eds.filter(
                  (e) =>
                    !(e.target === params.target && (e.targetHandle ?? null) === (params.targetHandle ?? null)),
                ),
          ),
        ),
      )
    },
    [setEdges, setNodes],
  )

  const addNode = useCallback(
    (item: ToolbarItem) => {
      const id = `n${nextId.current++}`
      const offset = nextId.current * 8
      setEdges(clearEdgeRunState)
      setNodes((nds) => [
        ...clearShownValues(nds),
        createNode(item, id, { x: 40 + offset, y: 40 + offset }),
      ])
    },
    [setNodes, setEdges],
  )

  // Reset means "start over": rebuild the preset's original blocks and wiring
  // (undoing any the student added, moved, or edited), not just clear the last
  // run's revealed values.
  const reset = useCallback(() => {
    runToken.current++
    setRunning(false)
    nextId.current = config.nodes.length + 1
    setNodes(structuredClone(config.nodes))
    setEdges(structuredClone(config.edges))
  }, [config, setEdges, setNodes])

  const setShown = useCallback(
    (id: string, value: Value) =>
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, shown: value } } : n))),
    [setNodes],
  )

  const run = useCallback(async () => {
    const token = ++runToken.current
    setRunning(true)
    setNodes(clearShownValues)
    setEdges(clearEdgeRunState)

    const memo = new Map<string, Value>()
    const stack = new Set<string>()
    const order = stepOrder(nodes, edges)
    // Blocks on an if-branch the program didn't take. Each diamond marks its
    // dead arrow's targets as it evaluates (stepOrder guarantees the diamond
    // runs before anything gated on it), and the loop skips them outright —
    // like lines of code the program never reaches.
    const skippedIds = new Set<string>()

    for (const id of order) {
      if (skippedIds.has(id)) continue
      await sleep(700)
      if (token !== runToken.current) return
      const node = nodes.find((n) => n.id === id)
      if (!node) continue

      // Highlight this block and light up the wires feeding it — but only
      // wires that actually carry a value. A wire from an untaken branch
      // resolves '?' and stays dark, so the road not taken never lights up.
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: n.id === id } })))
      const live = (e: Edge) =>
        e.target === id &&
        valueOf(e.source, e.sourceHandle ?? null, nodes, edges, fns, memo, stack) !== '?'
      setEdges((eds) => eds.map((e) => ({ ...e, animated: live(e) })))

      if (node.type === 'loop') {
        const times = resolveInput(id, 'times', nodes, edges, fns, memo, stack)
        const { op: loopOp, start, step } = node.data as LoopData
        if (!isNum(times)) {
          setShown(id, '?')
          memo.set(`${id}:`, '?')
        } else {
          let acc = start
          setShown(id, acc)
          const iterations = Math.max(0, Math.min(Math.round(times), 12))
          for (let i = 0; i < iterations; i++) {
            await sleep(420)
            if (token !== runToken.current) return
            acc = loopOp === 'add' ? acc + step : acc * step
            setShown(id, acc)
          }
          const exact = runLoop(loopOp, start, times, step)
          if (exact !== acc) setShown(id, exact)
          memo.set(`${id}:`, exact)
        }
      } else if (node.type === 'if') {
        const trueVal = valueOf(id, 'true', nodes, edges, fns, memo, stack)
        const cond = trueVal === true ? true : valueOf(id, 'false', nodes, edges, fns, memo, stack) === true ? false : '?'
        setShown(id, cond)
        // The decision made, the branch not taken dies: every block gated
        // from the dead arrow is skipped — dimmed, never activated, its
        // wires never lit. (An unanswerable question — cond '?' — skips
        // nothing: that's a broken graph, not an untaken branch.)
        if (typeof cond === 'boolean') {
          const dead = cond ? 'false' : 'true'
          const deadTargets = new Set(
            edges
              .filter((e) => e.source === id && e.sourceHandle === dead && e.targetHandle === 'gate')
              .map((e) => e.target),
          )
          if (deadTargets.size > 0) {
            for (const t of deadTargets) skippedIds.add(t)
            setNodes((nds) =>
              nds.map((n) => (deadTargets.has(n.id) ? { ...n, data: { ...n.data, skipped: true } } : n)),
            )
            setEdges((eds) =>
              eds.map((e) =>
                deadTargets.has(e.source) || deadTargets.has(e.target)
                  ? { ...e, className: 'edge-skipped' }
                  : e,
              ),
            )
          }
        }
      } else {
        setShown(id, valueOf(id, null, nodes, edges, fns, memo, stack))
      }
    }

    await sleep(600)
    if (token !== runToken.current) return
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: false } })))
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false })))
    setRunning(false)
  }, [nodes, edges, fns, setEdges, setNodes, setShown])

  return (
    <div className="block-playground">
      {config.functions?.map((fn) => <FunctionDefView key={fn.name} fn={fn} />)}
      {config.toolbar.length > 0 && (
        <div className="block-toolbar">
          {config.toolbar.map((item) => (
            <button key={item.kind} type="button" onClick={() => addNode(item)}>
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div className="block-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={config.connectable ? onConnect : undefined}
          nodeTypes={nodeTypes}
          nodesConnectable={config.connectable}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="system"
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={18} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div className="block-controls">
        <button type="button" className="block-run" onClick={run} disabled={running}>
          {running ? 'Running…' : '▶ Run step by step'}
        </button>
        <button type="button" className="block-reset" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  )
}

// ReactFlow needs its provider for useReactFlow() inside the custom nodes.
export function BlockPlayground({ preset }: { preset: string }) {
  return (
    <ReactFlowProvider>
      <Playground preset={preset} />
    </ReactFlowProvider>
  )
}
