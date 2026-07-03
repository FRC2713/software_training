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
import { getPreset } from '../lib/blockPresets'
import './BlockPlayground.css'

// The block editor is a tiny visual programming language: number blocks hold
// values, operation blocks (+, −, ×) combine two inputs into one output, and a
// single result block shows the final answer. "Run step by step" walks the
// graph in dependency order so a student can watch the computer evaluate one
// block at a time — the whole point of lesson 1.

export type Op = 'add' | 'sub' | 'mul'

// A value can be a real number, or '?' once we hit a block whose inputs aren't
// all connected yet (so the student sees exactly where the flow breaks).
type Value = number | '?'

const OP_SYMBOL: Record<Op, string> = { add: '+', sub: '−', mul: '×' }
const OP_APPLY: Record<Op, (a: number, b: number) => number> = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ---- Node data -------------------------------------------------------------

interface BaseData {
  active: boolean
  shown: Value | null // the value revealed during a step-by-step run
  [key: string]: unknown
}
export interface NumberData extends BaseData {
  value: number
  editable: boolean
}
export interface OpData extends BaseData {
  op: Op
}
export type ResultData = BaseData

// ---- Custom nodes ----------------------------------------------------------

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
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

function OpNode({ data }: NodeProps<Node<OpData>>) {
  return (
    <div className={`blk blk-op${data.active ? ' blk-active' : ''}`}>
      <Handle type="target" id="a" position={Position.Left} style={{ top: '32%' }} />
      <Handle type="target" id="b" position={Position.Left} style={{ top: '68%' }} />
      <span className="blk-op-symbol">{OP_SYMBOL[data.op]}</span>
      {data.shown !== null && <span className="blk-op-result">= {data.shown}</span>}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

function ResultNode({ data }: NodeProps<Node<ResultData>>) {
  return (
    <div className={`blk blk-result${data.active ? ' blk-active' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <span className="blk-tag">result</span>
      <span className="blk-result-value">{data.shown === null ? '?' : data.shown}</span>
    </div>
  )
}

const nodeTypes = { number: NumberNode, op: OpNode, result: ResultNode }

// ---- Evaluation ------------------------------------------------------------

function sourceOf(edges: Edge[], target: string, handle: string | null): string | undefined {
  return edges.find((e) => e.target === target && (e.targetHandle ?? null) === handle)?.source
}

// Resolve a node's value, memoized, guarding against cycles the student might
// wire up by accident.
function valueOf(
  id: string,
  nodes: Node[],
  edges: Edge[],
  memo: Map<string, Value>,
  stack: Set<string>,
): Value {
  const cached = memo.get(id)
  if (cached !== undefined) return cached
  if (stack.has(id)) return '?'
  stack.add(id)

  const node = nodes.find((n) => n.id === id)
  let result: Value = '?'
  if (node?.type === 'number') {
    result = (node.data as NumberData).value
  } else if (node?.type === 'op') {
    const aId = sourceOf(edges, id, 'a')
    const bId = sourceOf(edges, id, 'b')
    const a = aId ? valueOf(aId, nodes, edges, memo, stack) : '?'
    const b = bId ? valueOf(bId, nodes, edges, memo, stack) : '?'
    result = a === '?' || b === '?' ? '?' : OP_APPLY[(node.data as OpData).op](a, b)
  } else if (node?.type === 'result') {
    const src = sourceOf(edges, id, null)
    result = src ? valueOf(src, nodes, edges, memo, stack) : '?'
  }

  stack.delete(id)
  memo.set(id, result)
  return result
}

// Dependency-first ordering of the op/result blocks, so the animation reveals
// inputs before the blocks that consume them.
function stepOrder(nodes: Node[], edges: Edge[]): string[] {
  const order: string[] = []
  const seen = new Set<string>()
  const visit = (id: string) => {
    if (seen.has(id)) return
    seen.add(id)
    for (const e of edges.filter((e) => e.target === id)) visit(e.source)
    const type = nodes.find((n) => n.id === id)?.type
    if (type === 'op' || type === 'result') order.push(id)
  }
  const result = nodes.find((n) => n.type === 'result')
  if (result) visit(result.id)
  for (const n of nodes) if (n.type === 'op') visit(n.id)
  return order
}

// ---- Playground ------------------------------------------------------------

function Playground({ preset }: { preset: string }) {
  const config = useMemo(() => getPreset(preset), [preset])
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
    (type: 'number' | 'op', op?: Op) => {
      const id = `n${nextId.current++}`
      const offset = nextId.current * 8
      const data =
        type === 'number'
          ? { value: 0, editable: true, active: false, shown: null }
          : { op: op!, active: false, shown: null }
      setNodes((nds) => [
        ...clearShownValues(nds),
        { id, type, position: { x: 40 + offset, y: 40 + offset }, data } as Node,
      ])
    },
    [setNodes],
  )

  // Reset means "start over": rebuild the preset's original blocks and wiring
  // (undoing any the student added, moved, or edited), not just clear the
  // last run's revealed values.
  const reset = useCallback(() => {
    runToken.current++
    setRunning(false)
    nextId.current = config.nodes.length + 1
    setNodes(structuredClone(config.nodes))
    setEdges(structuredClone(config.edges))
  }, [config, setEdges, setNodes])

  const run = useCallback(async () => {
    const token = ++runToken.current
    setRunning(true)
    setNodes(clearShownValues)
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false })))

    const memo = new Map<string, Value>()
    const stack = new Set<string>()
    const order = stepOrder(nodes, edges)

    for (const id of order) {
      await sleep(750)
      if (token !== runToken.current) return
      const value = valueOf(id, nodes, edges, memo, stack)
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, active: true, shown: value } } : { ...n, data: { ...n.data, active: false } },
        ),
      )
      setEdges((eds) => eds.map((e) => ({ ...e, animated: e.target === id })))
    }

    await sleep(600)
    if (token !== runToken.current) return
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: false } })))
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false })))
    setRunning(false)
  }, [nodes, edges, setEdges, setNodes])

  return (
    <div className="block-playground">
      {config.toolbar && (
        <div className="block-toolbar">
          <button type="button" onClick={() => addNode('number')}>
            number
          </button>
          <button type="button" onClick={() => addNode('op', 'add')}>
            +
          </button>
          <button type="button" onClick={() => addNode('op', 'sub')}>
            −
          </button>
          <button type="button" onClick={() => addNode('op', 'mul')}>
            ×
          </button>
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
