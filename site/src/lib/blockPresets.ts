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

// The if-block is a switch: two operands and an operator go in, and exactly
// one of its two output rails ('true'/'false') is energized.
const ifBlock = (id: string, cmp: 'gt' | 'lt' | 'eq' | 'neq', x: number, y: number): Node => ({
  id,
  type: 'if',
  position: { x, y },
  data: { cmp, active: false, shown: null },
})

// A pass-through: only lets its wired `value` through while its `gate` input
// (wired from an if-block's rail) is energized.
const outlet = (id: string, x: number, y: number): Node => ({
  id,
  type: 'outlet',
  position: { x, y },
  data: { active: false, shown: null },
})

// start/step are the loop's own internal logic, edited directly on the block;
// only `times` (how many passes) is wired in from outside.
const loop = (
  id: string,
  operation: 'add' | 'mul',
  start: number,
  step: number,
  x: number,
  y: number,
): Node => ({
  id,
  type: 'loop',
  position: { x, y },
  data: { op: operation, start, step, active: false, shown: null },
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

const wire = (source: string, target: string, targetHandle?: string, sourceHandle?: string): Edge => ({
  id: `${source}-${sourceHandle ?? 'out'}-${target}-${targetHandle ?? 'in'}`,
  source,
  target,
  targetHandle,
  sourceHandle,
})

const IF_CMP: Record<string, 'gt' | 'lt' | 'eq' | 'neq'> = {
  ifGt: 'gt',
  ifLt: 'lt',
  ifEq: 'eq',
  ifNeq: 'neq',
}

// Toolbar-added blocks. Numbers are always editable; everything else is a fixed
// operator. `call:name` embeds the function name so lesson 4's palette can offer
// specific reusable blocks.
export function createNode(item: ToolbarItem, id: string, position: { x: number; y: number }): Node {
  const { kind, label } = item
  if (kind === 'add' || kind === 'sub' || kind === 'mul') return op(id, kind, position.x, position.y)
  if (kind in IF_CMP) return ifBlock(id, IF_CMP[kind], position.x, position.y)
  if (kind === 'outlet') return outlet(id, position.x, position.y)
  if (kind === 'loopAdd') return loop(id, 'add', 0, 3, position.x, position.y)
  if (kind === 'loopMul') return loop(id, 'mul', 1, 2, position.x, position.y)
  if (kind.startsWith('call:')) return call(id, kind.slice(5), label, position.x, position.y)
  return num(id, 0, position.x, position.y, true)
}

// ---- Lesson 1: sequences ---------------------------------------------------

// (3 + 4) × 2 = 14 — a fixed graph the student can only watch evaluate. Laid
// out top-to-bottom: inputs up top, operations below, result at the bottom.
const sequence: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('a', 3, 0, 0),
    num('b', 4, 160, 0),
    op('plus', 'add', 70, 140),
    num('c', 2, 250, 140),
    op('times', 'mul', 150, 290),
    result('out', 150, 430),
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
    num('b', 3, 160, 0, true),
    op('plus', 'add', 70, 140),
    num('c', 2, 250, 140, true),
    op('times', 'mul', 150, 290),
    result('out', 150, 430),
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
  nodes: [num('a', 6, 0, 0, true), num('b', 4, 170, 0, true), result('out', 85, 220)],
  edges: [],
}

// ---- Lesson 2: conditionals ------------------------------------------------

// "the larger of two numbers": the if-block is a switch. a > b energizes its
// true rail; otherwise its false rail. Each rail feeds an outlet wired to the
// matching number — an outlet only passes its value through while its rail
// is hot, so only one of the two ever reaches the result.
const condDemo: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('a', 7, 0, 0),
    num('b', 4, 220, 0),
    ifBlock('sw', 'gt', 90, 160),
    outlet('outTrue', 10, 340),
    outlet('outFalse', 220, 340),
    result('out', 120, 500),
  ],
  edges: [
    wire('a', 'sw', 'a'),
    wire('b', 'sw', 'b'),
    wire('sw', 'outTrue', 'gate', 'true'),
    wire('sw', 'outFalse', 'gate', 'false'),
    wire('a', 'outTrue', 'value'),
    wire('b', 'outFalse', 'value'),
    wire('outTrue', 'out'),
    wire('outFalse', 'out'),
  ],
}

const condEdit: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [
    num('a', 7, 0, 0, true),
    num('b', 4, 220, 0, true),
    ifBlock('sw', 'gt', 90, 160),
    outlet('outTrue', 10, 340),
    outlet('outFalse', 220, 340),
    result('out', 120, 500),
  ],
  edges: [
    wire('a', 'sw', 'a'),
    wire('b', 'sw', 'b'),
    wire('sw', 'outTrue', 'gate', 'true'),
    wire('sw', 'outFalse', 'gate', 'false'),
    wire('a', 'outTrue', 'value'),
    wire('b', 'outFalse', 'value'),
    wire('outTrue', 'out'),
    wire('outFalse', 'out'),
  ],
}

const condBuild: BlockPreset = {
  connectable: true,
  toolbar: [
    { kind: 'number', label: 'number' },
    { kind: 'ifGt', label: 'if >' },
    { kind: 'ifLt', label: 'if <' },
    { kind: 'ifEq', label: 'if =' },
    { kind: 'ifNeq', label: 'if ≠' },
    { kind: 'outlet', label: 'outlet' },
  ],
  nodes: [num('a', 5, 0, 0, true), num('b', 8, 200, 0, true), result('out', 100, 340)],
  edges: [],
}

// ---- Lesson 3: loops -------------------------------------------------------

// start 0, repeat 5 times, add 3 → 15. Start/step are the loop's own internal
// logic (editable right on the block); only the repeat count is wired in.
const loopDemo: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [num('times', 5, 60, 0), loop('rep', 'add', 0, 3, 40, 140), result('out', 60, 300)],
  edges: [wire('times', 'rep', 'times'), wire('rep', 'out')],
}

// start 1, repeat 4 times, multiply by 2 → 16 (watch it double each step).
const loopEdit: BlockPreset = {
  connectable: false,
  toolbar: [],
  nodes: [num('times', 4, 60, 0, true), loop('rep', 'mul', 1, 2, 40, 140), result('out', 60, 300)],
  edges: [wire('times', 'rep', 'times'), wire('rep', 'out')],
}

const loopBuild: BlockPreset = {
  connectable: true,
  toolbar: [
    { kind: 'number', label: 'number' },
    { kind: 'loopAdd', label: 'repeat +' },
    { kind: 'loopMul', label: 'repeat ×' },
  ],
  nodes: [num('times', 5, 60, 0, true), result('out', 60, 260)],
  edges: [],
}

// ---- Lesson 4: functions ---------------------------------------------------

// double(n) = n × 2 — a reusable block with this flowchart inside it.
const doubleFn: FunctionDef = {
  name: 'double',
  label: 'double(n) = n × 2',
  nodes: [input('n', 'n', 0, 0), num('two', 2, 140, 0), op('m', 'mul', 50, 130), result('o', 60, 260)],
  edges: [wire('n', 'm', 'a'), wire('two', 'm', 'b'), wire('m', 'o')],
}

// addOne(n) = n + 1
const addOneFn: FunctionDef = {
  name: 'addOne',
  label: 'add 1 (n) = n + 1',
  nodes: [input('n', 'n', 0, 0), num('one', 1, 140, 0), op('a', 'add', 50, 130), result('o', 60, 260)],
  edges: [wire('n', 'a', 'a'), wire('one', 'a', 'b'), wire('a', 'o')],
}

const fnDemo: BlockPreset = {
  connectable: false,
  toolbar: [],
  functions: [doubleFn],
  nodes: [num('n', 5, 20, 0), call('c1', 'double', 'double', 0, 150), result('out', 20, 300)],
  edges: [wire('n', 'c1', 'n'), wire('c1', 'out')],
}

// The same double block, used twice — define once, reuse many times.
const fnChain: BlockPreset = {
  connectable: false,
  toolbar: [],
  functions: [doubleFn],
  nodes: [
    num('n', 3, 20, 0, true),
    call('c1', 'double', 'double', 0, 150),
    call('c2', 'double', 'double', 0, 300),
    result('out', 20, 450),
  ],
  edges: [wire('n', 'c1', 'n'), wire('c1', 'c2', 'n'), wire('c2', 'out')],
}

const fnBuild: BlockPreset = {
  connectable: true,
  toolbar: [
    { kind: 'number', label: 'number' },
    { kind: 'call:addOne', label: 'add 1' },
    { kind: 'call:double', label: 'double' },
  ],
  functions: [addOneFn, doubleFn],
  nodes: [num('n', 4, 20, 0, true), result('out', 20, 240)],
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
