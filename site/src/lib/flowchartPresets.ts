import type { ChallengeCase, FlowchartProgram, FlowNode } from './flowchartEngine'

export interface PaletteItem {
  id: string
  label: string
  hint: string
  makeNode: (id: string) => FlowNode
}

export interface FlowchartPreset {
  id: string
  title: string
  subtitle: string
  program: FlowchartProgram
  palette?: PaletteItem[]
  targetSlots?: ('main' | 'yes' | 'no' | 'body')[]
  challengePrompt?: string
  checks?: ChallengeCase[]
}

const PRESETS: Record<string, FlowchartPreset> = {
  // ── Lesson 1: Programs are step-by-step (Autonomous Coral Scoring) ──────────
  sequence: {
    id: 'sequence',
    title: 'Autonomous Score Calculator',
    subtitle: 'Watch the robot calculate its autonomous score one step at a time.',
    program: {
      functions: [],
      main: [
        {
          id: 's1',
          kind: 'set',
          target: 'coral',
          expr: { kind: 'operand', operand: { kind: 'num', value: 3 } },
          note: 'coral scored in auto',
        },
        {
          id: 's2',
          kind: 'set',
          target: 'points',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'coral' },
            op: '*',
            right: { kind: 'num', value: 4 },
          },
          note: '4 points per coral',
        },
        {
          id: 's3',
          kind: 'set',
          target: 'points',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'points' },
            op: '+',
            right: { kind: 'num', value: 3 },
          },
          note: '+3 leave-zone bonus',
        },
        {
          id: 's4',
          kind: 'output',
          operand: { kind: 'var', name: 'points' },
          label: 'Total auto points',
        },
      ],
    },
  },

  'edit-values': {
    id: 'edit-values',
    title: 'Experiment with Inputs',
    subtitle: 'Change the starting numbers, predict the score, then step through.',
    program: {
      functions: [],
      main: [
        {
          id: 'e1',
          kind: 'set',
          target: 'coral',
          expr: { kind: 'operand', operand: { kind: 'num', value: 3 } },
          note: 'coral scored',
          editable: true,
        },
        {
          id: 'e2',
          kind: 'set',
          target: 'leave_bonus',
          expr: { kind: 'operand', operand: { kind: 'num', value: 3 } },
          note: '0 if robot stayed put',
          editable: true,
        },
        {
          id: 'e3',
          kind: 'set',
          target: 'points',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'coral' },
            op: '*',
            right: { kind: 'num', value: 4 },
          },
          note: '4 points each',
        },
        {
          id: 'e4',
          kind: 'set',
          target: 'points',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'points' },
            op: '+',
            right: { kind: 'var', name: 'leave_bonus' },
          },
          note: 'add leave bonus',
        },
        {
          id: 'e5',
          kind: 'output',
          operand: { kind: 'var', name: 'points' },
          label: 'Total auto points',
        },
      ],
    },
  },

  build: {
    id: 'build',
    title: 'Build: Net Coral Score',
    subtitle: 'Drag steps into order so the robot subtracts dropped coral before multiplying by 4.',
    challengePrompt:
      'Build a flowchart that computes (attempts − dropped) × 4 and outputs score. Order matters!',
    targetSlots: ['main'],
    program: {
      functions: [],
      main: [
        {
          id: 'b-attempts',
          kind: 'set',
          target: 'attempts',
          expr: { kind: 'operand', operand: { kind: 'num', value: 8 } },
          note: 'shots taken',
          editable: true,
        },
        {
          id: 'b-dropped',
          kind: 'set',
          target: 'dropped',
          expr: { kind: 'operand', operand: { kind: 'num', value: 3 } },
          note: 'missed shots',
          editable: true,
        },
        {
          id: 'b-out',
          kind: 'output',
          operand: { kind: 'var', name: 'score' },
          label: 'Final score',
        },
      ],
    },
    palette: [
      {
        id: 'p-sub',
        label: 'scored = attempts − dropped',
        hint: 'Find how many actually went in',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'scored',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'attempts' },
            op: '-',
            right: { kind: 'var', name: 'dropped' },
          },
          removable: true,
        }),
      },
      {
        id: 'p-mul',
        label: 'score = scored × 4',
        hint: '4 points per scored coral',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'score',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'scored' },
            op: '*',
            right: { kind: 'num', value: 4 },
          },
          removable: true,
        }),
      },
      {
        id: 'p-bonus',
        label: 'score = score + 3',
        hint: 'Optional bonus step',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'score',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'score' },
            op: '+',
            right: { kind: 'num', value: 3 },
          },
          removable: true,
        }),
      },
    ],
    checks: [
      { label: '8 attempts, 3 dropped → 20', overrides: { attempts: 8, dropped: 3 }, expectedOutput: 20 },
      { label: '5 attempts, 1 dropped → 16', overrides: { attempts: 5, dropped: 1 }, expectedOutput: 16 },
      { label: '4 attempts, 4 dropped → 0', overrides: { attempts: 4, dropped: 4 }, expectedOutput: 0 },
    ],
  },

  // ── Lesson 2: Making decisions (Battery Brownout Limiter) ──────────────────
  'cond-demo': {
    id: 'cond-demo',
    title: 'Battery Brownout Limiter',
    subtitle: 'Watch the robot take ONE branch and completely skip the other.',
    program: {
      functions: [],
      main: [
        {
          id: 'cd-bat',
          kind: 'set',
          target: 'battery',
          expr: { kind: 'operand', operand: { kind: 'num', value: 12 } },
          note: 'volts',
        },
        {
          id: 'cd-if',
          kind: 'if',
          left: { kind: 'var', name: 'battery' },
          cmp: '<',
          right: { kind: 'num', value: 10 },
          yes: [
            {
              id: 'cd-y1',
              kind: 'set',
              target: 'mode',
              expr: { kind: 'operand', operand: { kind: 'str', value: 'LOW POWER' } },
            },
            {
              id: 'cd-y2',
              kind: 'set',
              target: 'max_speed',
              expr: { kind: 'operand', operand: { kind: 'num', value: 40 } },
              note: 'protect the battery',
            },
          ],
          no: [
            {
              id: 'cd-n1',
              kind: 'set',
              target: 'mode',
              expr: { kind: 'operand', operand: { kind: 'str', value: 'FULL POWER' } },
            },
            {
              id: 'cd-n2',
              kind: 'set',
              target: 'max_speed',
              expr: { kind: 'operand', operand: { kind: 'num', value: 100 } },
              note: 'all systems go',
            },
          ],
        },
        {
          id: 'cd-out',
          kind: 'output',
          operand: { kind: 'var', name: 'max_speed' },
          label: 'Motor speed %',
        },
      ],
    },
  },

  'cond-edit': {
    id: 'cond-edit',
    title: 'Test the Boundary',
    subtitle: 'Change the battery voltage (try 9, 10, and 12) and watch which path runs.',
    program: {
      functions: [],
      main: [
        {
          id: 'ce-bat',
          kind: 'set',
          target: 'battery',
          expr: { kind: 'operand', operand: { kind: 'num', value: 12 } },
          note: 'volts',
          editable: true,
        },
        {
          id: 'ce-if',
          kind: 'if',
          left: { kind: 'var', name: 'battery' },
          cmp: '<',
          right: { kind: 'num', value: 10 },
          editableCond: true,
          yes: [
            {
              id: 'ce-y1',
              kind: 'set',
              target: 'mode',
              expr: { kind: 'operand', operand: { kind: 'str', value: 'LOW POWER' } },
            },
            {
              id: 'ce-y2',
              kind: 'set',
              target: 'max_speed',
              expr: { kind: 'operand', operand: { kind: 'num', value: 40 } },
            },
          ],
          no: [
            {
              id: 'ce-n1',
              kind: 'set',
              target: 'mode',
              expr: { kind: 'operand', operand: { kind: 'str', value: 'FULL POWER' } },
            },
            {
              id: 'ce-n2',
              kind: 'set',
              target: 'max_speed',
              expr: { kind: 'operand', operand: { kind: 'num', value: 100 } },
            },
          ],
        },
        {
          id: 'ce-out',
          kind: 'output',
          operand: { kind: 'var', name: 'max_speed' },
          label: 'Motor speed %',
        },
      ],
    },
  },

  'cond-build': {
    id: 'cond-build',
    title: 'Build: Shooter Range Check',
    subtitle: 'Drag the right action into the YES and NO branches.',
    challengePrompt:
      'If distance < 3 meters, set action to "SHOOT". Otherwise, set action to "DRIVE CLOSER".',
    targetSlots: ['yes', 'no'],
    program: {
      functions: [],
      main: [
        {
          id: 'cb-dist',
          kind: 'set',
          target: 'distance',
          expr: { kind: 'operand', operand: { kind: 'num', value: 2 } },
          note: 'meters to target',
          editable: true,
        },
        {
          id: 'cb-if',
          kind: 'if',
          left: { kind: 'var', name: 'distance' },
          cmp: '<',
          right: { kind: 'num', value: 3 },
          editableCond: true,
          editableBranches: true,
          yes: [],
          no: [],
        },
        {
          id: 'cb-out',
          kind: 'output',
          operand: { kind: 'var', name: 'action' },
          label: 'Robot command',
        },
      ],
    },
    palette: [
      {
        id: 'p-shoot',
        label: 'action = "SHOOT"',
        hint: 'Fire when close enough',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'action',
          expr: { kind: 'operand', operand: { kind: 'str', value: 'SHOOT' } },
          removable: true,
        }),
      },
      {
        id: 'p-drive',
        label: 'action = "DRIVE CLOSER"',
        hint: 'Move toward the target',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'action',
          expr: { kind: 'operand', operand: { kind: 'str', value: 'DRIVE CLOSER' } },
          removable: true,
        }),
      },
      {
        id: 'p-stop',
        label: 'action = "STOP"',
        hint: 'Halt the drivetrain',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'action',
          expr: { kind: 'operand', operand: { kind: 'str', value: 'STOP' } },
          removable: true,
        }),
      },
    ],
    checks: [
      { label: 'distance = 2 (< 3) → "SHOOT"', overrides: { distance: 2 }, expectedOutput: 'SHOOT' },
      { label: 'distance = 3 (edge case!) → "DRIVE CLOSER"', overrides: { distance: 3 }, expectedOutput: 'DRIVE CLOSER' },
      { label: 'distance = 5 → "DRIVE CLOSER"', overrides: { distance: 5 }, expectedOutput: 'DRIVE CLOSER' },
    ],
  },

  // ── Lesson 3: Doing things over and over (Motor Ramp-Up Loop) ──────────────
  'loop-demo': {
    id: 'loop-demo',
    title: 'Smooth Motor Ramp-Up',
    subtitle: 'Watch the loop-back arrow run the same step 5 times to ramp speed smoothly.',
    program: {
      functions: [],
      main: [
        {
          id: 'ld-s',
          kind: 'set',
          target: 'speed',
          expr: { kind: 'operand', operand: { kind: 'num', value: 0 } },
          note: 'start from rest',
        },
        {
          id: 'ld-loop',
          kind: 'repeat',
          times: { kind: 'num', value: 5 },
          body: [
            {
              id: 'ld-inc',
              kind: 'set',
              target: 'speed',
              expr: {
                kind: 'binary',
                left: { kind: 'var', name: 'speed' },
                op: '+',
                right: { kind: 'num', value: 20 },
              },
              note: 'nudge motor +20%',
            },
          ],
        },
        {
          id: 'ld-out',
          kind: 'output',
          operand: { kind: 'var', name: 'speed' },
          label: 'Final motor speed %',
        },
      ],
    },
  },

  'loop-edit': {
    id: 'loop-edit',
    title: 'Power Doubling & Zero Passes',
    subtitle: 'Change start, repeat count (try 0!), or multiplier and watch every pass.',
    program: {
      functions: [],
      main: [
        {
          id: 'le-s',
          kind: 'set',
          target: 'power',
          expr: { kind: 'operand', operand: { kind: 'num', value: 1 } },
          note: 'starting value',
          editable: true,
        },
        {
          id: 'le-loop',
          kind: 'repeat',
          times: { kind: 'num', value: 4 },
          editableTimes: true,
          body: [
            {
              id: 'le-mul',
              kind: 'set',
              target: 'power',
              expr: {
                kind: 'binary',
                left: { kind: 'var', name: 'power' },
                op: '*',
                right: { kind: 'num', value: 2 },
              },
              note: 'double each pass',
              editable: true,
            },
          ],
        },
        {
          id: 'le-out',
          kind: 'output',
          operand: { kind: 'var', name: 'power' },
          label: 'Final power',
        },
      ],
    },
  },

  'loop-build': {
    id: 'loop-build',
    title: 'Build: Flywheel Spin-Up',
    subtitle: 'Drop a step INSIDE the loop body and set the repeat count to hit 32.',
    challengePrompt:
      'Starting from power = 1, repeat doubling power so the robot lands on 32 (2⁵).',
    targetSlots: ['body'],
    program: {
      functions: [],
      main: [
        {
          id: 'lb-s',
          kind: 'set',
          target: 'power',
          expr: { kind: 'operand', operand: { kind: 'num', value: 1 } },
          note: 'starting value',
          editable: true,
        },
        {
          id: 'lb-loop',
          kind: 'repeat',
          times: { kind: 'num', value: 3 },
          editableTimes: true,
          editableBody: true,
          body: [],
        },
        {
          id: 'lb-out',
          kind: 'output',
          operand: { kind: 'var', name: 'power' },
          label: 'Final power',
        },
      ],
    },
    palette: [
      {
        id: 'p-dbl',
        label: 'power = power × 2',
        hint: 'Double power each pass',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'power',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'power' },
            op: '*',
            right: { kind: 'num', value: 2 },
          },
          removable: true,
        }),
      },
      {
        id: 'p-add10',
        label: 'power = power + 10',
        hint: 'Add 10 each pass',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'power',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'power' },
            op: '+',
            right: { kind: 'num', value: 10 },
          },
          removable: true,
        }),
      },
      {
        id: 'p-add1',
        label: 'power = power + 1',
        hint: 'Add 1 each pass',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'power',
          expr: {
            kind: 'binary',
            left: { kind: 'var', name: 'power' },
            op: '+',
            right: { kind: 'num', value: 1 },
          },
          removable: true,
        }),
      },
    ],
    checks: [
      { label: 'Starts at 1 → ends at 32', overrides: { power: 1 }, expectedOutput: 32 },
      { label: 'Starts at 2 → ends at 64', overrides: { power: 2 }, expectedOutput: 64 },
    ],
  },

  // ── Lesson 4: Reusable blocks (Functions) ──────────────────────────────────
  'fn-demo': {
    id: 'fn-demo',
    title: 'Calling a Reusable Routine',
    subtitle: 'Watch execution jump into the function on the right, run its steps, and return.',
    program: {
      functions: [
        {
          name: 'double',
          param: 'n',
          description: 'Multiplies any input by 2 and returns it.',
          returnVar: 'result',
          body: [
            {
              id: 'fd-fn-1',
              kind: 'set',
              target: 'result',
              expr: {
                kind: 'binary',
                left: { kind: 'var', name: 'n' },
                op: '*',
                right: { kind: 'num', value: 2 },
              },
            },
          ],
        },
      ],
      main: [
        {
          id: 'fd-1',
          kind: 'set',
          target: 'speed',
          expr: { kind: 'operand', operand: { kind: 'num', value: 5 } },
          note: 'base speed',
        },
        {
          id: 'fd-2',
          kind: 'set',
          target: 'boosted',
          expr: { kind: 'call', fnName: 'double', arg: { kind: 'var', name: 'speed' } },
          note: 'call reusable routine',
        },
        {
          id: 'fd-3',
          kind: 'output',
          operand: { kind: 'var', name: 'boosted' },
          label: 'Boosted speed',
        },
      ],
    },
  },

  'fn-chain': {
    id: 'fn-chain',
    title: 'Define Once, Call Twice',
    subtitle: 'Same function, two inputs — edit the multiplier inside boost_speed once and watch both calls update!',
    program: {
      functions: [
        {
          name: 'boost_speed',
          param: 'n',
          description: 'Scales a motor speed by the factor below and returns it.',
          returnVar: 'result',
          editableBody: true,
          body: [
            {
              id: 'fc-fn-1',
              kind: 'set',
              target: 'result',
              editable: true,
              expr: {
                kind: 'binary',
                left: { kind: 'var', name: 'n' },
                op: '*',
                right: { kind: 'num', value: 2 },
              },
            },
          ],
        },
      ],
      main: [
        {
          id: 'fc-1',
          kind: 'set',
          target: 'speed',
          expr: { kind: 'operand', operand: { kind: 'num', value: 3 } },
          editable: true,
        },
        {
          id: 'fc-2',
          kind: 'set',
          target: 'speed',
          expr: { kind: 'call', fnName: 'boost_speed', arg: { kind: 'var', name: 'speed' } },
          note: '1st call',
        },
        {
          id: 'fc-3',
          kind: 'set',
          target: 'speed',
          expr: { kind: 'call', fnName: 'boost_speed', arg: { kind: 'var', name: 'speed' } },
          note: '2nd call',
        },
        {
          id: 'fc-4',
          kind: 'output',
          operand: { kind: 'var', name: 'speed' },
          label: 'Final speed',
        },
      ],
    },
  },

  'fn-build': {
    id: 'fn-build',
    title: 'Build: Match Scoring Pipeline',
    subtitle: 'Drag the reusable robot scoring functions into order so score = 4 lands on 10.',
    challengePrompt:
      'Apply add_leave_bonus (+1) before coop_double (×2) so (score + 1) × 2 gives 10 when score = 4.',
    targetSlots: ['main'],
    program: {
      functions: [
        {
          name: 'add_leave_bonus',
          param: 'pts',
          description: 'Adds 1 bonus point and returns the new score.',
          returnVar: 'result',
          body: [
            {
              id: 'fb-fn-a1',
              kind: 'set',
              target: 'result',
              expr: {
                kind: 'binary',
                left: { kind: 'var', name: 'pts' },
                op: '+',
                right: { kind: 'num', value: 1 },
              },
            },
          ],
        },
        {
          name: 'coop_double',
          param: 'pts',
          description: 'Doubles the match score and returns it.',
          returnVar: 'result',
          body: [
            {
              id: 'fb-fn-d1',
              kind: 'set',
              target: 'result',
              expr: {
                kind: 'binary',
                left: { kind: 'var', name: 'pts' },
                op: '*',
                right: { kind: 'num', value: 2 },
              },
            },
          ],
        },
      ],
      main: [
        {
          id: 'fb-1',
          kind: 'set',
          target: 'score',
          expr: { kind: 'operand', operand: { kind: 'num', value: 4 } },
          note: 'base match score',
          editable: true,
        },
        {
          id: 'fb-out',
          kind: 'output',
          operand: { kind: 'var', name: 'score' },
          label: 'Final match score',
        },
      ],
    },
    palette: [
      {
        id: 'p-call-add',
        label: 'score = add_leave_bonus(score)',
        hint: 'Adds 1 bonus point to score',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'score',
          expr: { kind: 'call', fnName: 'add_leave_bonus', arg: { kind: 'var', name: 'score' } },
          removable: true,
        }),
      },
      {
        id: 'p-call-dbl',
        label: 'score = coop_double(score)',
        hint: 'Doubles score',
        makeNode: (id) => ({
          id,
          kind: 'set',
          target: 'score',
          expr: { kind: 'call', fnName: 'coop_double', arg: { kind: 'var', name: 'score' } },
          removable: true,
        }),
      },
    ],
    checks: [
      { label: 'score = 4 → 10', overrides: { score: 4 }, expectedOutput: 10 },
      { label: 'score = 6 → 14', overrides: { score: 6 }, expectedOutput: 14 },
      { label: 'score = 0 → 2', overrides: { score: 0 }, expectedOutput: 2 },
    ],
  },
}

export function isFlowchartPreset(preset: string): boolean {
  return Object.prototype.hasOwnProperty.call(PRESETS, preset)
}

export function getFlowchartPreset(preset: string): FlowchartPreset {
  return PRESETS[preset] ?? PRESETS.sequence
}
