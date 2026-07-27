import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import { getJavaRuntimeStatus, runJava } from '@/lib/javaRuntime'
import { editorTheme, usePrefersDark } from '@/lib/editorTheme'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  buildMazeHarness,
  mazeGridLiteral,
  parseTrail,
  retargetErrorLines,
  studentLineOffset,
} from '@/lib/mazeHarness'

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
  const rows = mazeGridLiteral(grid)
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

// The three canned JS-animated demos, plus `java` — the student writes a real
// solver run through the maze round-trip (see lib/mazeHarness.ts).
type CannedMode = 'random' | 'naive' | 'wall'
export type SolverMode = CannedMode | 'java'

const SOLVER_LABEL: Record<CannedMode, string> = {
  random: 'Move at random',
  naive: 'Run the naive rule',
  wall: 'Run wall follower',
}

// The editor's starting point for `solver: java`: a right-hand wall follower,
// the same algorithm lesson "Navigating a maze" builds up to — translated to
// the library's absolute-move API with a remembered `facing` heading.
const DEFAULT_JAVA_SOLVE = `// Drive the robot from start (green) to goal (red).
// You have: robot.canMoveUp/Down/Left/Right(), robot.moveUp/Down/Left/Right(),
// robot.atGoal(), robot.row(), robot.col().
//
// This starter is the "keep your right hand on the wall" follower.
void solve(Robot robot) {
    // Heading: 0 = up, 1 = right, 2 = down, 3 = left. Start facing right.
    int facing = 1;
    int maxSteps = 1000;
    for (int i = 0; i < maxSteps && !robot.atGoal(); i++) {
        // Try right, straight, left, back — relative to the way we're facing.
        int[] order = { (facing + 1) % 4, facing, (facing + 3) % 4, (facing + 2) % 4 };
        for (int dir : order) {
            if (tryMove(robot, dir)) {
                facing = dir;
                break;
            }
        }
    }
}

// Move one step in an absolute direction if that side is open; report whether
// we actually moved.
boolean tryMove(Robot robot, int dir) {
    if (dir == 0 && robot.canMoveUp())    { robot.moveUp();    return true; }
    if (dir == 1 && robot.canMoveRight()) { robot.moveRight(); return true; }
    if (dir == 2 && robot.canMoveDown())  { robot.moveDown();  return true; }
    if (dir == 3 && robot.canMoveLeft())  { robot.moveLeft();  return true; }
    return false;
}`

export function MazePlayground({ solver = null }: { solver?: SolverMode | null }) {
  const [grid, setGrid] = useState<number[][]>(() => generateMaze(SIZE))
  const [robot, setRobot] = useState<[number, number]>(START)
  const [running, setRunning] = useState(false)
  const [stuck, setStuck] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const [copied, setCopied] = useState(false)

  // `solver: java` state — the editable Java solver and its run output.
  const isJava = solver === 'java'
  const [code, setCode] = useState(DEFAULT_JAVA_SOLVE)
  const [javaOutput, setJavaOutput] = useState<string | null>(null)
  const [javaOk, setJavaOk] = useState(true)
  const dark = usePrefersDark()
  const editorExtensions = useMemo(() => [java(), editorTheme, EditorView.lineWrapping], [])

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
    (mode: CannedMode) => {
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

  // Replay a Maze Trail computed in Java: place the robot at each cell in turn,
  // same 180ms cadence as the canned solvers but *reading* cells rather than
  // computing moves. The trail is exactly what happened in the JVM, so there is
  // no wall logic here at all. If it doesn't end on the goal, flag it stuck.
  const animateTrail = useCallback(
    (cells: [number, number][]) => {
      stopSolver()
      const last = cells[cells.length - 1] ?? START
      const reachedGoal = last[0] === GOAL[0] && last[1] === GOAL[1]
      setRobot(cells[0] ?? START)
      setStuck(false)
      if (cells.length <= 1) {
        // Robot never left Start — nothing to animate.
        setStuck(!reachedGoal)
        return
      }
      setRunning(true)
      let i = 1
      timer.current = setInterval(() => {
        if (i >= cells.length) {
          stopSolver()
          setStuck(!reachedGoal)
          return
        }
        setRobot(cells[i++])
      }, 180)
    },
    [stopSolver],
  )

  const runJavaSolver = useCallback(async () => {
    stopSolver()
    setStuck(false)
    setRobot(START)
    setJavaOk(true)
    setJavaOutput(getJavaRuntimeStatus() === 'ready' ? 'Running…' : 'Loading Java…')
    const harness = buildMazeHarness(grid, code)
    const result = await runJava(harness)
    if (!result.ok) {
      const offset = studentLineOffset(grid)
      setJavaOk(false)
      setJavaOutput(retargetErrorLines(result.output, offset) || '(error)')
      return
    }
    const trail = parseTrail(result.output)
    if (!trail) {
      setJavaOk(false)
      setJavaOutput(
        'Ran, but produced no Maze Trail. Make sure solve(robot) moves the robot.',
      )
      return
    }
    // Show any debug output the student printed, minus the sentinel line.
    const debug = result.output
      .split('\n')
      .filter((l) => !l.startsWith('__TRAIL__ '))
      .join('\n')
      .trim()
    setJavaOk(true)
    setJavaOutput(debug || null)
    animateTrail(trail.cells)
  }, [grid, code, stopSolver, animateTrail])

  const generate = () => {
    stopSolver()
    setStuck(false)
    setJavaOutput(null)
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
        {solver && !isJava && (
          <button
            type="button"
            onClick={running ? stopSolver : () => runSolver(solver as CannedMode)}
            className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            {running ? 'Stop' : SOLVER_LABEL[solver as CannedMode]}
          </button>
        )}
        <button
          type="button"
          onClick={generate}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Generate new maze
        </button>
        {!isJava && (
          <button
            type="button"
            onClick={copyForJava}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            {copied ? 'Copied!' : 'Copy for Java'}
          </button>
        )}
      </div>

      {isJava && (
        <div className="w-full">
          <div className="overflow-hidden rounded-lg border bg-muted">
            <CodeMirror
              value={code}
              onChange={setCode}
              extensions={editorExtensions}
              theme={dark ? oneDark : 'light'}
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                autocompletion: false,
              }}
              className="text-[13px]"
            />
            <div className="flex justify-between gap-2 border-t px-2.5 py-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setCode(DEFAULT_JAVA_SOLVE)
                  setJavaOutput(null)
                }}
                disabled={running}
              >
                Reset code
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={running ? stopSolver : runJavaSolver}
                className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              >
                {running ? 'Stop' : '▶ Run in the maze'}
              </Button>
            </div>
            {javaOutput !== null && (
              <pre
                className={cn(
                  'm-0 whitespace-pre-wrap break-words border-t bg-background px-3.5 py-3 font-mono text-sm text-foreground',
                  !javaOk && 'text-destructive',
                )}
              >
                {javaOutput}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
