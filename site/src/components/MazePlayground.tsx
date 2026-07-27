import { useCallback, useEffect, useRef, useState } from 'react'

// NOTE: the `maze-generator` npm package is broken — its internal `shuffle` is
// written as `for (...; ...; update) return o`, so it returns on the first
// iteration and the Math.random in the update slot never runs. The direction
// order is therefore always ['N','E','S','W'], producing the identical
// degenerate maze every call (and it schedules via a Node-only `setImmediate`
// on top of that). So we generate the same N/S/E/W bitmask grid it was meant
// to produce with a correct recursive-backtracking walk.

// Cell bitmask: which sides of a cell have been carved open.
const N = 1
const S = 2
const E = 4
const W = 8
const DX: Record<string, number> = { E: 1, W: -1, N: 0, S: 0 }
const DY: Record<string, number> = { E: 0, W: 0, N: -1, S: 1 }
const BIT: Record<string, number> = { N, S, E, W }
const OPP: Record<string, number> = { E: W, W: E, N: S, S: N }
const DIRS = ['N', 'E', 'S', 'W']

function generateMaze(size: number): number[][] {
  const grid = Array.from({ length: size }, () => Array<number>(size).fill(0))
  const seen = Array.from({ length: size }, () => Array<boolean>(size).fill(false))
  const stack: [number, number][] = [[0, 0]]
  seen[0][0] = true
  while (stack.length) {
    const [x, y] = stack[stack.length - 1]
    const dirs = [...DIRS].sort(() => Math.random() - 0.5)
    let moved = false
    for (const d of dirs) {
      const nx = x + DX[d]
      const ny = y + DY[d]
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && !seen[ny][nx]) {
        grid[y][x] |= BIT[d]
        grid[ny][nx] |= OPP[d]
        seen[ny][nx] = true
        stack.push([nx, ny])
        moved = true
        break
      }
    }
    if (!moved) stack.pop()
  }
  return grid
}

const SIZE = 14 // maze is SIZE x SIZE cells
const CELL = 22 // px per cell
const PAD = 12

const START: [number, number] = [0, 0]
const GOAL: [number, number] = [SIZE - 1, SIZE - 1]

// Which wall bit must be open to step in each direction, keyed by arrow.
const MOVES: Record<'up' | 'down' | 'left' | 'right', { bit: number; dx: number; dy: number }> = {
  up: { bit: N, dx: 0, dy: -1 },
  down: { bit: S, dx: 0, dy: 1 },
  left: { bit: W, dx: -1, dy: 0 },
  right: { bit: E, dx: 1, dy: 0 },
}

// Center of a cell in svg coordinates.
const cx = (x: number) => PAD + x * CELL + CELL / 2
const cy = (y: number) => PAD + y * CELL + CELL / 2

// Serialize the maze as a ready-to-paste Java `int[][]` literal. Each cell is
// the same N/S/E/W bitmask the grid already uses, so Java reads it with the
// identical constants (N=1, S=2, E=4, W=8) and `cell & N` wall checks.
function serializeToJava(grid: number[][]): string {
  const rows = grid.map((row) => '    {' + row.join(', ') + '}').join(',\n')
  return `// Maze as an N/S/E/W bitmask grid. For each cell, a set bit means that
// side is OPEN (you can move that way); a clear bit is a wall.
//   N = 1 (up)   S = 2 (down)   E = 4 (right)   W = 8 (left)
// Example check: (maze[row][col] & E) != 0  -->  can move right.
final int N = 1, S = 2, E = 4, W = 8;

int[][] maze = {
${rows}
};

// Where the robot starts and where it's trying to get to (row, col):
int startRow = ${START[1]}, startCol = ${START[0]};
int goalRow  = ${GOAL[1]}, goalCol  = ${GOAL[0]};`
}

// Headings for the wall follower, clockwise: 0=up, 1=right, 2=down, 3=left.
const DIR4 = [
  { bit: N, dx: 0, dy: -1 }, // up
  { bit: E, dx: 1, dy: 0 }, // right
  { bit: S, dx: 0, dy: 1 }, // down
  { bit: W, dx: -1, dy: 0 }, // left
]

// The naive rule's fixed direction priority: up, then left, then down, then
// right. It biases toward the top-left, away from the bottom-right goal, so on
// most mazes the memory-less robot marches into a corner and loops.
const NAIVE_ORDER = [0, 3, 2, 1]

export type SolverMode = 'random' | 'naive' | 'wall'

const SOLVER_LABEL: Record<SolverMode, string> = {
  random: 'Move at random',
  naive: 'Run the naive rule',
  wall: 'Run wall follower',
}

export function MazePlayground({ solver = null }: { solver?: SolverMode | null }) {
  const [grid, setGrid] = useState<number[][]>(() => generateMaze(SIZE))
  const [robot, setRobot] = useState<[number, number]>(START)
  const [running, setRunning] = useState(false)
  const [stuck, setStuck] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const [copied, setCopied] = useState(false)

  const copyForJava = () => {
    const java = serializeToJava(grid)
    navigator.clipboard?.writeText(java).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      },
      () => {},
    )
  }

  const stopSolver = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setRunning(false)
  }, [])

  // Animate one of the three solvers, one step every 180ms:
  //   random — step to a uniformly-random open neighbour. No rule, so no two
  //            runs match; it only reaches the goal by luck.
  //   naive  — take the first open direction in a fixed priority order, with no
  //            memory of where it came from. Deterministic, so the moment it
  //            re-enters a cell it will forever repeat the same choices — that
  //            first revisit is a provable infinite loop, and we stop there.
  //   wall   — the right-hand rule: relative to a *remembered* heading, try
  //            right, straight, left, back. That one remembered fact (facing)
  //            is the whole difference from `naive`; in a perfect maze it
  //            always reaches the goal.
  const runSolver = useCallback(
    (mode: SolverMode) => {
      stopSolver()
      let x = START[0]
      let y = START[1]
      let dir = 1 // wall follower's remembered heading (start facing right)
      let steps = 0
      const maxSteps = SIZE * SIZE * 4
      const visits = new Map<string, number>([[`${x},${y}`, 1]])
      setRobot([x, y])
      setRunning(true)
      setStuck(false)
      timer.current = setInterval(() => {
        if ((x === GOAL[0] && y === GOAL[1]) || steps++ > maxSteps) {
          stopSolver()
          return
        }
        if (mode === 'wall') {
          for (const nd of [(dir + 1) % 4, dir, (dir + 3) % 4, (dir + 2) % 4]) {
            const { bit, dx, dy } = DIR4[nd]
            if (grid[y][x] & bit) {
              dir = nd
              x += dx
              y += dy
              break
            }
          }
        } else if (mode === 'naive') {
          for (const nd of NAIVE_ORDER) {
            const { bit, dx, dy } = DIR4[nd]
            if (grid[y][x] & bit) {
              x += dx
              y += dy
              break
            }
          }
        } else {
          const opens = [0, 1, 2, 3].filter((nd) => grid[y][x] & DIR4[nd].bit)
          const { dx, dy } = DIR4[opens[Math.floor(Math.random() * opens.length)]]
          x += dx
          y += dy
        }
        setRobot([x, y])
        // A memory-less rule that revisits a cell is doomed to loop forever
        // (same cell -> same choice). We don't stop on the *first* revisit
        // though — we let the robot visibly bounce a few times so the loop is
        // something you can watch, then call it once a cell has been hit 4×.
        if (mode === 'naive' && !(x === GOAL[0] && y === GOAL[1])) {
          const key = `${x},${y}`
          const n = (visits.get(key) ?? 0) + 1
          visits.set(key, n)
          if (n >= 4) {
            setStuck(true)
            stopSolver()
          }
        }
      }, 180)
    },
    [grid, stopSolver],
  )

  const generate = () => {
    stopSolver()
    setStuck(false)
    setGrid(generateMaze(SIZE))
    setRobot(START)
  }

  const move = useCallback(
    (dir: keyof typeof MOVES) => {
      stopSolver()
      setStuck(false)
      setRobot(([x, y]) => {
        const { bit, dx, dy } = MOVES[dir]
        // Can only move through a carved opening (no wall on that side).
        if (grid[y][x] & bit) return [x + dx, y + dy]
        return [x, y]
      })
    },
    [grid, stopSolver],
  )

  useEffect(() => {
    setGrid(generateMaze(SIZE))
    setRobot(START)
  }, [])

  // Arrow keys drive the robot too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, keyof typeof MOVES> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }
      const dir = map[e.key]
      if (dir) {
        e.preventDefault()
        move(dir)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  // Stop any running animation when the component goes away.
  useEffect(() => stopSolver, [stopSolver])

  const w = SIZE * CELL + PAD * 2
  const stroke = 'var(--foreground, #e5e5e5)'
  const solved = robot[0] === GOAL[0] && robot[1] === GOAL[1]

  const arrow = (dir: keyof typeof MOVES, label: string) => (
    <button
      type="button"
      onClick={() => move(dir)}
      aria-label={dir}
      className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-[var(--code-bg)] text-lg font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground"
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${w}`}
        className="max-w-[360px] rounded-lg border border-border bg-[var(--code-bg)]"
      >
        {/* Start (green) and goal (red) cells. */}
        <rect
          x={PAD + START[0] * CELL + 2}
          y={PAD + START[1] * CELL + 2}
          width={CELL - 4}
          height={CELL - 4}
          fill="#22c55e"
          opacity={0.35}
        />
        <rect
          x={PAD + GOAL[0] * CELL + 2}
          y={PAD + GOAL[1] * CELL + 2}
          width={CELL - 4}
          height={CELL - 4}
          fill="#ef4444"
          opacity={0.35}
        />

        {grid.map((row, y) =>
          row.map((cell, x) => {
            const px = PAD + x * CELL
            const py = PAD + y * CELL
            const line = (x1: number, y1: number, x2: number, y2: number, k: string) => (
              <line
                key={k}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={stroke}
                strokeWidth={2}
                strokeLinecap="square"
              />
            )
            // Draw a wall on every side that was NOT carved open.
            return (
              <g key={`${x}-${y}`}>
                {!(cell & N) && line(px, py, px + CELL, py, 'n')}
                {!(cell & S) && line(px, py + CELL, px + CELL, py + CELL, 's')}
                {!(cell & W) && line(px, py, px, py + CELL, 'w')}
                {!(cell & E) && line(px + CELL, py, px + CELL, py + CELL, 'e')}
              </g>
            )
          }),
        )}

        {/* The robot. */}
        <circle
          cx={cx(robot[0])}
          cy={cy(robot[1])}
          r={CELL / 3}
          fill="#3b82f6"
          stroke="#fff"
          strokeWidth={1.5}
        />
      </svg>

      <p className="text-sm text-muted-foreground">
        <span className="text-[#22c55e]">■</span> start&nbsp;&nbsp;
        <span className="text-[#ef4444]">■</span> goal&nbsp;&nbsp;
        <span className="text-[#3b82f6]">●</span> robot
        {solved && <strong className="ml-2 text-[#22c55e]">— solved! 🎉</strong>}
        {stuck && !solved && (
          <strong className="ml-2 text-[#ef4444]">— stuck in a loop 🔁</strong>
        )}
      </p>

      {/* Directional pad. */}
      <div className="grid grid-cols-3 grid-rows-2 gap-1.5">
        <div />
        {arrow('up', '↑')}
        <div />
        {arrow('left', '←')}
        {arrow('down', '↓')}
        {arrow('right', '→')}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {solver && (
          <button
            type="button"
            onClick={running ? stopSolver : () => runSolver(solver)}
            className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            {running ? 'Stop' : SOLVER_LABEL[solver]}
          </button>
        )}
        <button
          type="button"
          onClick={generate}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Generate new maze
        </button>
        <button
          type="button"
          onClick={copyForJava}
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground"
        >
          {copied ? 'Copied!' : 'Copy for Java'}
        </button>
      </div>
    </div>
  )
}
