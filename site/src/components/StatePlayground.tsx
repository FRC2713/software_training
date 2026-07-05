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
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { getStatePreset, type EventDef, type StatePreset } from '../lib/statePresets'
import './StatePlayground.css'

// The state-machine playground: a machine the student *drives* rather than a
// computation they watch evaluate. It sits in one state (highlighted) and, when
// an event button is pressed, follows the matching outgoing transition to the
// next state. Pressing an event a state has no transition for does nothing —
// which is exactly the "a state ignores what it doesn't care about" intuition
// the code lessons build on. `sm-build` adds a toolbar to grow the machine.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface StateData {
  label: string
  active: boolean // is this the current state?
  isStart: boolean
  editable: boolean // rename via inline input (build mode)
  tone?: 'red' | 'green' | 'yellow' // optional fixed color, e.g. the traffic light
  [key: string]: unknown
}

// ---- State node ------------------------------------------------------------

function StateNode({ id, data }: NodeProps<Node<StateData>>) {
  const { setNodes } = useReactFlow()
  return (
    <div className={`sm-node${data.active ? ' sm-active' : ''}${data.tone ? ` sm-tone-${data.tone}` : ''}`}>
      {data.isStart && <span className="sm-start-badge">start</span>}
      {/* Vertical flow in/out, plus a right-side pair for loop-back transitions. */}
      <Handle type="target" id="top" position={Position.Top} />
      <Handle type="source" id="bottom" position={Position.Bottom} />
      <Handle type="source" id="r-out" position={Position.Right} style={{ top: '35%' }} />
      <Handle type="target" id="r-in" position={Position.Right} style={{ top: '65%' }} />
      {data.editable ? (
        <input
          className="nodrag sm-node-input"
          value={data.label}
          onChange={(e) =>
            setNodes((nodes) =>
              nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: e.target.value } } : n)),
            )
          }
        />
      ) : (
        <span className="sm-node-label">{data.label}</span>
      )}
    </div>
  )
}

const nodeTypes = { state: StateNode }

// ---- Building the initial graph from a preset ------------------------------

// Inject the render-time flags (which state is current/start, whether labels are
// editable) into the preset's plain nodes.
function buildNodes(config: StatePreset): Node[] {
  return config.nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      active: n.id === config.start,
      isStart: n.id === config.start,
      editable: config.buildable,
    },
  }))
}

// ---- Playground ------------------------------------------------------------

function Playground({ preset }: { preset: string }) {
  const config = useMemo(() => getStatePreset(preset), [preset])
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(buildNodes(config))
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(structuredClone(config.edges))
  const [status, setStatus] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string>(config.events[0]?.id ?? '')

  // The current state drives everything, so keep it in a ref the async event
  // handler can read without going stale between awaits.
  const current = useRef(config.start)
  const busy = useRef(false)
  const nextId = useRef(config.nodes.length + 1)

  const labelOf = useCallback(
    (id: string) => (nodes.find((n) => n.id === id)?.data as StateData | undefined)?.label ?? id,
    [nodes],
  )

  const setCurrent = useCallback(
    (id: string) => {
      current.current = id
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: n.id === id } })))
    },
    [setNodes],
  )

  // Fire an event: find a transition out of the current state that reacts to it,
  // animate along it, and land on the next state. No match → say so (the machine
  // ignored it), which is the lesson.
  const fire = useCallback(
    async (event: EventDef) => {
      if (busy.current) return
      const from = current.current
      const edge = edges.find((e) => e.source === from && (e.data as { on?: string })?.on === event.id)

      if (!edge) {
        setStatus(`In ${labelOf(from)}, “${event.label}” does nothing — no transition for it.`)
        return
      }

      busy.current = true
      setStatus(`“${event.label}” → moving to ${labelOf(edge.target)}`)
      setEdges((eds) => eds.map((e) => ({ ...e, animated: e.id === edge.id })))
      await sleep(650)
      setCurrent(edge.target)
      setEdges((eds) => eds.map((e) => ({ ...e, animated: false })))
      setStatus(`Now in ${labelOf(edge.target)}.`)
      busy.current = false
    },
    [edges, labelOf, setCurrent, setEdges],
  )

  // Draw a transition (build mode): label it with the currently-picked event.
  const onConnect = useCallback(
    (params: Connection) => {
      const event = config.events.find((ev) => ev.id === selectedEvent)
      if (!event) return
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: `${params.source}-${params.target}-${event.id}-${Date.now()}`,
            label: event.label,
            data: { on: event.id },
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      )
    },
    [config.events, selectedEvent, setEdges],
  )

  const addState = useCallback(() => {
    const n = nextId.current++
    const offset = n * 6
    setNodes((nds) => [
      ...nds,
      {
        id: `s${n}`,
        type: 'state',
        position: { x: 220 + offset, y: 40 + offset },
        data: { label: `state ${n}`, active: false, isStart: false, editable: true },
      },
    ])
  }, [setNodes])

  const reset = useCallback(() => {
    busy.current = false
    nextId.current = config.nodes.length + 1
    current.current = config.start
    setNodes(buildNodes(config))
    setEdges(structuredClone(config.edges))
    setStatus(null)
  }, [config, setEdges, setNodes])

  return (
    <div className="state-playground">
      {config.buildable && (
        <div className="sm-toolbar">
          <button type="button" onClick={addState}>
            ＋ state
          </button>
          <label className="sm-event-pick">
            new arrow:
            <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
              {config.events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="sm-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={config.buildable ? onConnect : undefined}
          nodeTypes={nodeTypes}
          nodesDraggable={config.draggable || config.buildable}
          nodesConnectable={config.buildable}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="system"
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={18} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <div className="sm-events">
        {config.events.map((ev) => (
          <button key={ev.id} type="button" className="sm-event" onClick={() => fire(ev)}>
            {ev.label}
          </button>
        ))}
        <button type="button" className="sm-reset" onClick={reset}>
          Reset
        </button>
      </div>

      <p className="sm-status">{status ?? `Machine is in ${labelOf(current.current)}. Press an event.`}</p>

      {config.buildable && (
        <p className="sm-hint">
          Drag from one state to another to draw a transition — it’s labelled with the event picked above.
        </p>
      )}
    </div>
  )
}

// ReactFlow needs its provider for useReactFlow() inside the custom node.
export function StatePlayground({ preset }: { preset: string }) {
  return (
    <ReactFlowProvider>
      <Playground preset={preset} />
    </ReactFlowProvider>
  )
}
