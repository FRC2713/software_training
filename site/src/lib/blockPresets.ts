import type { Node, Edge } from '@xyflow/react'

// Starter graphs for the block editor. Each lesson-1 page references one by name
// from its ```blocks fence; keeping the graphs here (rather than in markdown)
// means the authoring format stays a simple `preset: <name>` line.

export interface BlockPreset {
  connectable: boolean // can the student wire blocks together?
  toolbar: boolean // show the "add a block" palette?
  nodes: Node[]
  edges: Edge[]
}

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

// (3 + 4) × 2 = 14 — a fixed graph the student can only watch evaluate.
const sequence: BlockPreset = {
  connectable: false,
  toolbar: false,
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

// Same shape as `sequence`, but the number blocks are editable so the student
// can change the inputs and predict the new answer before running.
const editValues: BlockPreset = {
  connectable: false,
  toolbar: false,
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

// A near-empty canvas: two numbers and a result, plus the full toolbar, so the
// student assembles their own math machine.
const build: BlockPreset = {
  connectable: true,
  toolbar: true,
  nodes: [num('a', 6, 0, 0, true), num('b', 4, 0, 120, true), result('out', 420, 60)],
  edges: [],
}

const PRESETS: Record<string, BlockPreset> = { sequence, 'edit-values': editValues, build }

export function getPreset(name: string): BlockPreset {
  return PRESETS[name] ?? build
}
