import type { Node, Edge } from '@xyflow/react'

// Starter graphs for the block editor. Each lesson page references one by name
// from its ```blocks fence; keeping the graphs here (rather than in markdown)
// means the authoring format stays a simple `preset: <name>` line.

// A palette button: `kind` tells createNode() what block to drop, `label` is
// what the student sees on the button.
export interface ToolbarItem {
  kind: string
  label: string
}

// A reusable block with its own little flowchart inside (lesson 4). The `input`
// node stands in for the parameter; a `call` block runs this graph with a value
// plugged into that input.
export interface FunctionDef {
  name: string
  label: string
  nodes: Node[]
  edges: Edge[]
}

export interface BlockPreset {
  connectable: boolean // can the student wire blocks together?
  toolbar: ToolbarItem[] // palette buttons (empty = no toolbar)
  nodes: Node[]
  edges: Edge[]
  functions?: FunctionDef[] // rendered read-only as "inside the block" views
}

// ---- Node factories --------------------------------------------------------

const num = (id: string, value: number, x: number, y: number, editable = false): Node => ({
  id,
  type: 'number',
  position: { x, y },
  data: { value, editable, active: false, shown: null },
})

const op = (id: string, operation: 'add' | 'sub' | 'mul', x: number, y: number): Node => ({
  id,
  type: 'op',
  position: { x, y },
  data: { op: operation, active: false, shown: null },
})

const compare = (id: string, cmp: 'gt' | 'lt' | 'eq', x: number, y: number): Node => ({
  id,
  type: 'compare',
  position: { x, y },
  data: { cmp, active: false, shown: null },
})

const ifBlock = (id: string, x: number, y: number): Node => ({
  id,
  type: 'if',
  position: { x, y },
  data: { active: false, shown: null },
})

const loop = (id: string, operation: 'add' | 'mul', x: number, y: number): Node => ({
  id,
  type: 'loop',
  position: { x, y },
  data: { op: operation, active: false, shown: null },
})

const call = (id: string, fn: string, label: string, x: number, y: number): Node => ({
  id,
  type: 'call',
  position: { x, y },
  data: { fn, label, active: false, shown: null },
})

const input = (id: string, label: string, x: number, y: number): Node => ({
  id,
  type: 'input',
  position: { x, y },
  data: { label, value: 0, active: false, shown: null },
})

const result = (id: string, x: number, y: number): Node => ({
  id,
  type: 'result',
  position: { x, y },
  data: { active: false, shown: null },
})

const wire = (source: string, target: string, targetHandle?: string): Edge => ({
  id: `${source}-${target}-${targetHandle ?? 'in'}`,
  source,
  target,
  targetHandle,
})

// Toolbar-added blocks. Numbers are always editable; everything else is a fixed
// operator. `call:name` embeds the function name so lesson 4's palette can offer
// specific reusable blocks.
export function createNode(item: ToolbarItem, id: string, position: { x: number; y: number }): Node {
  const { kind, label } = item
  if (kind === 'add' || kind === 'sub' || kind === 'mul') return op(id, kind, position.x, position.y)
  if (kind === 'gt' || kind === 'lt' || kind === 'eq') return compare(id, kind, position.x, position.y)
  if (kind === 'if') return ifBlock(id, position.x, position.y)
  if (kind === 'loopAdd') return loop(id, 'add', position.x, position.y)
  if (kind === 'loopMul') return loop(id, 'mul', position.x, position.y)
  if (kind.startsWith('call:')) return call(id, kind.slice(5), label, position.x, position.y)
  return num(id, 0, position.x, position.y, true)
}

// ---- Lesson 1: sequences ---------------------------------------------------

// (3 + 4) × 2 = 14 — a fixed graph the student can only watch evaluate.
const sequence: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('a', 3, 0, 0),
    num('b', 4, 0, 90),
    op('plus', 'add', 200, 25),
    num('c', 2, 200, 150),
    op('times', 'mul', 400, 70),
    result('out', 620, 80),
  ],
  edges: [
    wire('a', 'plus', 'a'),
    wire('b', 'plus', 'b'),
    wire('plus', 'times', 'a'),
    wire('c', 'times', 'b'),
    wire('times', 'out'),
  ],
}

// Same shape as `sequence`, but the number blocks are editable.
const editValues: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('a', 5, 0, 0, true),
    num('b', 3, 0, 90, true),
    op('plus', 'add', 200, 25),
    num('c', 2, 200, 150, true),
    op('times', 'mul', 400, 70),
    result('out', 620, 80),
  ],
  edges: [
    wire('a', 'plus', 'a'),
    wire('b', 'plus', 'b'),
    wire('plus', 'times', 'a'),
    wire('c', 'times', 'b'),
    wire('times', 'out'),
  ],
}

const build: BlockPreset = {
  connectable: true,
  toolbar: [
    { kind: 'number', label: 'number' },
    { kind: 'add', label: '+' },
    { kind: 'sub', label: '−' },
    { kind: 'mul', label: '×' },
  ],
  nodes: [num('a', 6, 0, 0, true), num('b', 4, 0, 120, true), result('out', 420, 60)],
  edges: [],
}

// ---- Lesson 2: conditionals ------------------------------------------------

// "the larger of two numbers": compare a > b, then an if-block picks a or b.
const condDemo: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('a', 7, 0, 0),
    num('b', 4, 0, 150),
    compare('cmp', 'gt', 180, 30),
    ifBlock('pick', 360, 20),
    result('out', 560, 60),
  ],
  edges: [
    wire('a', 'cmp', 'a'),
    wire('b', 'cmp', 'b'),
    wire('cmp', 'pick', 'when'),
    wire('a', 'pick', 'yes'),
    wire('b', 'pick', 'no'),
    wire('pick', 'out'),
  ],
}

const condEdit: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('a', 7, 0, 0, true),
    num('b', 4, 0, 150, true),
    compare('cmp', 'gt', 180, 30),
    ifBlock('pick', 360, 20),
    result('out', 560, 60),
  ],
  edges: [
    wire('a', 'cmp', 'a'),
    wire('b', 'cmp', 'b'),
    wire('cmp', 'pick', 'when'),
    wire('a', 'pick', 'yes'),
    wire('b', 'pick', 'no'),
    wire('pick', 'out'),
  ],
}

const condBuild: BlockPreset = {
  connectable: true,
  toolbar: [
    { kind: 'number', label: 'number' },
    { kind: 'gt', label: '>' },
    { kind: 'lt', label: '<' },
    { kind: 'eq', label: '=' },
    { kind: 'if', label: 'if' },
  ],
  nodes: [num('a', 5, 0, 0, true), num('b', 8, 0, 150, true), result('out', 480, 70)],
  edges: [],
}

// ---- Lesson 3: loops -------------------------------------------------------

// start 0, repeat 5 times, add 3 → 15. The run animation counts up one step at
// a time, which is the whole idea of a loop.
const loopDemo: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('start', 0, 0, 0),
    num('count', 5, 0, 90),
    num('step', 3, 0, 180),
    loop('rep', 'add', 220, 40),
    result('out', 440, 70),
  ],
  edges: [
    wire('start', 'rep', 'start'),
    wire('count', 'rep', 'count'),
    wire('step', 'rep', 'step'),
    wire('rep', 'out'),
  ],
}

// start 1, repeat 4 times, multiply by 2 → 16 (watch it double each step).
const loopEdit: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('start', 1, 0, 0, true),
    num('count', 4, 0, 90, true),
    num('step', 2, 0, 180, true),
    loop('rep', 'mul', 220, 40),
    result('out', 440, 70),
  ],
  edges: [
    wire('start', 'rep', 'start'),
    wire('count', 'rep', 'count'),
    wire('step', 'rep', 'step'),
    wire('rep', 'out'),
  ],
}

const loopBuild: BlockPreset = {
  connectable: true,
  toolbar: [
    { kind: 'number', label: 'number' },
    { kind: 'loopAdd', label: 'repeat +' },
    { kind: 'loopMul', label: 'repeat ×' },
  ],
  nodes: [
    num('start', 1, 0, 0, true),
    num('count', 5, 0, 90, true),
    num('step', 2, 0, 180, true),
    result('out', 480, 80),
  ],
  edges: [],
}

// ---- Lesson 4: functions ---------------------------------------------------

// double(x) = x × 2 — a reusable block with this flowchart inside it.
const doubleFn: FunctionDef = {
  name: 'double',
  label: 'double(x) = x × 2',
  nodes: [input('x', 'x', 0, 20), num('two', 2, 0, 130), op('m', 'mul', 190, 55), result('o', 360, 65)],
  edges: [wire('x', 'm', 'a'), wire('two', 'm', 'b'), wire('m', 'o')],
}

// addOne(x) = x + 1
const addOneFn: FunctionDef = {
  name: 'addOne',
  label: 'add 1 (x) = x + 1',
  nodes: [input('x', 'x', 0, 20), num('one', 1, 0, 130), op('a', 'add', 190, 55), result('o', 360, 65)],
  edges: [wire('x', 'a', 'a'), wire('one', 'a', 'b'), wire('a', 'o')],
}

const fnDemo: BlockPreset = {
  connectable: false,
  toolbar: [],
  functions: [doubleFn],
  nodes: [num('n', 5, 0, 40), call('c1', 'double', 'double', 200, 40), result('out', 400, 50)],
  edges: [wire('n', 'c1', 'x'), wire('c1', 'out')],
}

// The same double block, used twice — define once, reuse many times.
const fnChain: BlockPreset = {
  connectable: false,
  toolbar: [],
  functions: [doubleFn],
  nodes: [
    num('n', 3, 0, 40, true),
    call('c1', 'double', 'double', 180, 40),
    call('c2', 'double', 'double', 360, 40),
    result('out', 540, 50),
  ],
  edges: [wire('n', 'c1', 'x'), wire('c1', 'c2', 'x'), wire('c2', 'out')],
}

const fnBuild: BlockPreset = {
  connectable: true,
  toolbar: [
    { kind: 'number', label: 'number' },
    { kind: 'call:addOne', label: 'add 1' },
    { kind: 'call:double', label: 'double' },
  ],
  functions: [addOneFn, doubleFn],
  nodes: [num('n', 4, 0, 40, true), result('out', 520, 50)],
  edges: [],
}

// ---- Registry --------------------------------------------------------------

const PRESETS: Record<string, BlockPreset> = {
  sequence,
  'edit-values': editValues,
  build,
  'cond-demo': condDemo,
  'cond-edit': condEdit,
  'cond-build': condBuild,
  'loop-demo': loopDemo,
  'loop-edit': loopEdit,
  'loop-build': loopBuild,
  'fn-demo': fnDemo,
  'fn-chain': fnChain,
  'fn-build': fnBuild,
}

export function getPreset(name: string): BlockPreset {
  return PRESETS[name] ?? build
}
