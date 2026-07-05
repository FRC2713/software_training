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
// first four lessons: number/operation blocks (sequences), compare + if blocks
// (conditionals), a repeat block that iterates (loops), and call blocks backed
// by reusable sub-flowcharts (functions). "Run step by step" walks the graph in
// dependency order so a student watches the computer evaluate one block at a
// time — the point of the whole series.

export type Op = 'add' | 'sub' | 'mul'
export type Cmp = 'gt' | 'lt' | 'eq'

// A value can be a number, a boolean (from a compare block), or '?' once we hit
// a block whose inputs aren't all connected yet — so the student sees exactly
// where the flow breaks.
type Value = number | boolean | '?'

const OP_SYMBOL: Record<Op, string> = { add: '+', sub: '−', mul: '×' }
const OP_APPLY: Record<Op, (a: number, b: number) => number> = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
}
const CMP_SYMBOL: Record<Cmp, string> = { gt: '>', lt: '<', eq: '=' }
const CMP_APPLY: Record<Cmp, (a: number, b: number) => boolean> = {
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  eq: (a, b) => a === b,
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const isNum = (v: Value): v is number => typeof v === 'number'
const fmt = (v: Value | null): string =>
  v === null || v === '?' ? '?' : typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v)

// ---- Custom nodes ----------------------------------------------------------

interface BaseData {
  active: boolean
  shown: Value | null // the value revealed during a step-by-step run
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
interface CmpData extends BaseData {
  cmp: Cmp
}
interface LoopData extends BaseData {
  op: 'add' | 'mul'
}
interface CallData extends BaseData {
  fn: string
  label: string
}

// Editing a value invalidates every revealed result, so we wipe them all and
// let the student re-run to see the new answer flow through.
function clearShownValues(nodes: Node[]): Node[] {
  return nodes.map((n) => ({ ...n, data: { ...n.data, shown: null, active: false } }))
}

function NumberNode({ id, data }: NodeProps<Node<NumberData>>) {
  const { setNodes } = useReactFlow()
  return (
    <div className={`blk blk-number${data.active ? ' blk-active' : ''}`}>
      <span className="blk-tag">number</span>
      {data.editable ? (
        <input
          className="nodrag blk-input"
          type="number"
          value={data.value}
          onChange={(e) =>
            setNodes((nodes) =>
              clearShownValues(nodes).map((n) =>
                n.id === id ? { ...n, data: { ...n.data, value: Number(e.target.value) } } : n,
              ),
            )
          }
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

// Shared layout for the multi-input blocks (compare, if, loop, call): the
// labelled inputs sit across the top, each with a handle above it, and the
// operator's title sits below — so the graph reads top-to-bottom like code.
function MultiNode({
  title,
  rows,
  shown,
  active,
}: {
  title: string
  rows: { id: string; label: string }[]
  shown: Value | null
  active: boolean
}) {
  return (
    <div className={`blk blk-multi${active ? ' blk-active' : ''}`}>
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

function CompareNode({ data }: NodeProps<Node<CmpData>>) {
  return (
    <MultiNode
      title={CMP_SYMBOL[data.cmp]}
      rows={[
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
      ]}
      shown={data.shown}
      active={data.active}
    />
  )
}

function IfNode({ data }: NodeProps<Node<BaseData>>) {
  return (
    <MultiNode
      title="if"
      rows={[
        { id: 'when', label: 'when' },
        { id: 'yes', label: '✓ then' },
        { id: 'no', label: '✗ else' },
      ]}
      shown={data.shown}
      active={data.active}
    />
  )
}

function LoopNode({ data }: NodeProps<Node<LoopData>>) {
  return (
    <MultiNode
      title={data.op === 'add' ? 'repeat +' : 'repeat ×'}
      rows={[
        { id: 'start', label: 'start' },
        { id: 'count', label: 'times' },
        { id: 'step', label: 'by' },
      ]}
      shown={data.shown}
      active={data.active}
    />
  )
}

function CallNode({ data }: NodeProps<Node<CallData>>) {
  return (
    <MultiNode
      title={data.label}
      rows={[{ id: 'x', label: 'x' }]}
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

const nodeTypes = {
  number: NumberNode,
  input: InputNode,
  op: OpNode,
  compare: CompareNode,
  if: IfNode,
  loop: LoopNode,
  call: CallNode,
  result: ResultNode,
}

// ---- Evaluation ------------------------------------------------------------

type FnMap = Record<string, FunctionDef>

function sourceOf(edges: Edge[], target: string, handle: string | null): string | undefined {
  return edges.find((e) => e.target === target && (e.targetHandle ?? null) === handle)?.source
}

// Resolve a node's value, memoized, guarding against cycles the student might
// wire up by accident.
function valueOf(
  id: string,
  nodes: Node[],
  edges: Edge[],
  fns: FnMap,
  memo: Map<string, Value>,
  stack: Set<string>,
): Value {
  const cached = memo.get(id)
  if (cached !== undefined) return cached
  if (stack.has(id)) return '?'
  stack.add(id)

  const node = nodes.find((n) => n.id === id)
  const input = (handle: string | null): Value => {
    const src = sourceOf(edges, id, handle)
    return src ? valueOf(src, nodes, edges, fns, memo, stack) : '?'
  }

  let result: Value = '?'
  if (node?.type === 'number' || node?.type === 'input') {
    result = (node.data as NumberData).value
  } else if (node?.type === 'op') {
    const a = input('a')
    const b = input('b')
    if (isNum(a) && isNum(b)) result = OP_APPLY[(node.data as OpData).op](a, b)
  } else if (node?.type === 'compare') {
    const a = input('a')
    const b = input('b')
    if (isNum(a) && isNum(b)) result = CMP_APPLY[(node.data as CmpData).cmp](a, b)
  } else if (node?.type === 'if') {
    const cond = input('when')
    if (cond === true) result = input('yes')
    else if (cond === false) result = input('no')
  } else if (node?.type === 'loop') {
    const start = input('start')
    const count = input('count')
    const step = input('step')
    if (isNum(start) && isNum(count) && isNum(step)) {
      result = runLoop((node.data as LoopData).op, start, count, step)
    }
  } else if (node?.type === 'call') {
    const x = input('x')
    const fn = fns[(node.data as CallData).fn]
    if (isNum(x) && fn) result = callFunction(fn, x, fns)
  } else if (node?.type === 'result') {
    result = input(null)
  }

  stack.delete(id)
  memo.set(id, result)
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
  return out ? valueOf(out.id, nodes, fn.edges, fns, new Map(), new Set()) : '?'
}

const COMPUTED = new Set(['op', 'compare', 'if', 'loop', 'call', 'result'])

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
      // Each input handle accepts a single wire — drop any existing one first.
      setEdges((eds) =>
        addEdge(
          params,
          eds.filter(
            (e) =>
              !(e.target === params.target && (e.targetHandle ?? null) === (params.targetHandle ?? null)),
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
      setNodes((nds) => [
        ...clearShownValues(nds),
        createNode(item, id, { x: 40 + offset, y: 40 + offset }),
      ])
    },
    [setNodes],
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
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false })))

    const memo = new Map<string, Value>()
    const stack = new Set<string>()
    const order = stepOrder(nodes, edges)

    for (const id of order) {
      await sleep(700)
      if (token !== runToken.current) return
      const node = nodes.find((n) => n.id === id)
      if (!node) continue

      // Highlight this block and light up the wires feeding it. For an if-block
      // only the condition wire and the branch actually taken light up, so the
      // student sees the choice being made.
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: n.id === id } })))
      let live = (e: Edge) => e.target === id
      if (node.type === 'if') {
        const condSrc = sourceOf(edges, id, 'when')
        const cond = condSrc ? valueOf(condSrc, nodes, edges, fns, memo, stack) : '?'
        const taken = cond === true ? 'yes' : cond === false ? 'no' : null
        live = (e) => e.target === id && (e.targetHandle === 'when' || e.targetHandle === taken)
      }
      setEdges((eds) => eds.map((e) => ({ ...e, animated: live(e) })))

      if (node.type === 'loop') {
        const at = (h: string) => {
          const src = sourceOf(edges, id, h)
          const v = src ? valueOf(src, nodes, edges, fns, memo, stack) : '?'
          return isNum(v) ? v : null
        }
        const start = at('start')
        const count = at('count')
        const step = at('step')
        if (start === null || count === null || step === null) {
          setShown(id, '?')
          memo.set(id, '?')
        } else {
          const operation = (node.data as LoopData).op
          let acc = start
          setShown(id, acc)
          const iterations = Math.max(0, Math.min(Math.round(count), 12))
          for (let i = 0; i < iterations; i++) {
            await sleep(420)
            if (token !== runToken.current) return
            acc = operation === 'add' ? acc + step : acc * step
            setShown(id, acc)
          }
          const exact = runLoop(operation, start, count, step)
          if (exact !== acc) setShown(id, exact)
          memo.set(id, exact)
        }
      } else {
        setShown(id, valueOf(id, nodes, edges, fns, memo, stack))
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
