import { MarkerType, type Node, type Edge } from '@xyflow/react'

// Starter graphs for the *state-machine* playground — a sibling to the dataflow
// block editor (see lib/blockPresets.ts). Where a block preset is a computation
// the student watches evaluate, a state preset is a machine the student *drives*:
// it sits in one state and moves along a labelled transition when the matching
// event button is pressed. Same `preset: <name>` fence, a different renderer
// (components/StatePlayground.tsx), chosen by name via isStatePreset().

export interface EventDef {
  id: string // matched against a transition's `on`
  label: string // what the button says
}

export interface StatePreset {
  kind: 'state'
  draggable: boolean // can the student reposition states?
  buildable: boolean // toolbar to add states + draw/label transitions?
  start: string // id of the starting (and reset) state
  events: EventDef[] // the event buttons shown under the canvas
  nodes: Node[]
  edges: Edge[]
}

// ---- Factories -------------------------------------------------------------

const state = (id: string, label: string, x: number, y: number, tone?: 'red' | 'green' | 'yellow'): Node => ({
  id,
  type: 'state',
  position: { x, y },
  data: { label, active: false, isStart: false, editable: false, tone },
})

// A transition is a directed, event-labelled edge. Forward transitions flow
// top-to-bottom (bottom handle → top handle), matching the block editor's house
// style; a `back: true` transition loops up the right-hand side instead, the
// classic "return to an earlier state" arrow.
const trans = (from: string, to: string, on: string, label: string, back = false): Edge => ({
  id: `${from}-${to}-${on}`,
  source: from,
  target: to,
  sourceHandle: back ? 'r-out' : 'bottom',
  targetHandle: back ? 'r-in' : 'top',
  // Loop-back arrows route out to the right as a clean orthogonal path so their
  // label sits in a clear lane, well clear of the centred forward-edge labels.
  type: back ? 'smoothstep' : 'default',
  ...(back ? { pathOptions: { offset: 55, borderRadius: 12 } } : {}),
  label,
  data: { on },
  markerEnd: { type: MarkerType.ArrowClosed },
})

// ---- Demo: a traffic light (watch it cycle) --------------------------------

// One event drives the whole thing, so the student's only job is to press it and
// watch the current-state token move: red → green → yellow → red.
const smDemo: StatePreset = {
  kind: 'state',
  draggable: false,
  buildable: false,
  start: 'red',
  events: [{ id: 'timer', label: 'timer done' }],
  nodes: [
    state('red', 'RED', 60, 0, 'red'),
    state('green', 'GREEN', 60, 150, 'green'),
    state('yellow', 'YELLOW', 60, 300, 'yellow'),
  ],
  edges: [
    trans('red', 'green', 'timer', 'timer done'),
    trans('green', 'yellow', 'timer', 'timer done'),
    trans('yellow', 'red', 'timer', 'timer done', true),
  ],
}

// ---- Edit: a game-piece handler (fire different events) ---------------------

// Several events now, so the student discovers that a state only reacts to the
// events it has a transition for — pressing "shot done" while EMPTY does nothing.
const smEdit: StatePreset = {
  kind: 'state',
  draggable: true,
  buildable: false,
  start: 'empty',
  events: [
    { id: 'button', label: 'driver button' },
    { id: 'sensor', label: 'piece detected' },
    { id: 'done', label: 'shot done' },
  ],
  nodes: [
    state('empty', 'EMPTY', 60, 0),
    state('intaking', 'INTAKING', 60, 130),
    state('loaded', 'LOADED', 60, 260),
    state('shooting', 'SHOOTING', 60, 390),
  ],
  edges: [
    trans('empty', 'intaking', 'button', 'driver button'),
    trans('intaking', 'loaded', 'sensor', 'piece detected'),
    trans('loaded', 'shooting', 'button', 'driver button'),
    trans('shooting', 'empty', 'done', 'shot done', true),
  ],
}

// ---- Build: wire up a climber from scratch ---------------------------------

// The four states are placed but *unconnected*. The student draws each
// transition and labels it with an event from the picker — the whole point being
// that the transitions (the arrows) are the machine. Extra states can be added.
const smBuild: StatePreset = {
  kind: 'state',
  draggable: true,
  buildable: true,
  start: 'stowed',
  events: [
    { id: 'button', label: 'button' },
    { id: 'top', label: 'at top' },
    { id: 'bottom', label: 'at bottom' },
  ],
  nodes: [
    state('stowed', 'STOWED', 40, 0),
    state('extending', 'EXTENDING', 40, 140),
    state('extended', 'EXTENDED', 40, 280),
    state('retracting', 'RETRACTING', 40, 420),
  ],
  edges: [],
}

// ---- Registry --------------------------------------------------------------

const STATE_PRESETS: Record<string, StatePreset> = {
  'sm-demo': smDemo,
  'sm-edit': smEdit,
  'sm-build': smBuild,
}

export function isStatePreset(name: string): boolean {
  return name in STATE_PRESETS
}

export function getStatePreset(name: string): StatePreset {
  return STATE_PRESETS[name] ?? smDemo
}
