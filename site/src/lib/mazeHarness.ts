// The JS → Java → animated-steps maze round-trip (see docs/maze-roundtrip.md).
//
// A student writes a `solve(Robot)` algorithm in the maze playground. To run it
// we build a full Java compilation unit here: the current maze is interpolated
// in as an `int[][]` literal, the student's method is spliced into the class
// body, and a `main` drives the robot then prints the Maze Trail as a single
// sentinel-tagged line for the JS side to parse and animate back.
//
// `new GridMaze(grid)` resolves against the maze-solver library on the
// classpath (see lib/javaRuntime.ts). Nothing maze-specific is bundled into
// the harness source itself.

// The maze as a ready-to-embed Java `int[][]` literal body (just the rows, no
// surrounding `int[][] x = {...}`). Each cell is the same N/S/E/W bitmask the JS
// grid uses — a set bit means that side is OPEN — so Java reads it with the
// identical constants. This is the one source of truth for the literal format;
// both the harness and "Copy for Java" build on it.
export function mazeGridLiteral(grid: number[][]): string {
  return grid.map((row) => '        {' + row.join(', ') + '}').join(',\n')
}

// Everything the harness puts *above* the student's spliced-in code. Kept as its
// own string so we can measure its line count and translate compile-error line
// numbers back to what the student sees in their editor.
//
// The `wall` harness hands the student just a `Robot` (a reactive, sense-as-you-go
// algorithm like the wall follower). The `astar` harness also hands them the whole
// `Maze` — random access to every cell via `maze.cellAt(...)` — and imports
// `java.util.*`, because a global planner like A* needs the full map plus
// PriorityQueue/HashMap up front. The trail emission is identical either way.
export type HarnessMode = 'wall' | 'astar'

function harnessPrefix(grid: number[][], mode: HarnessMode): string {
  const imports =
    mode === 'astar'
      ? 'import java.util.*;\nimport com.frc2713.mazesolver.*;'
      : 'import com.frc2713.mazesolver.*;'
  const call = mode === 'astar' ? 'new MazeRun().solve(maze, robot);' : 'new MazeRun().solve(robot);'
  return `${imports}

public class MazeRun {
    static final int[][] GRID = {
${mazeGridLiteral(grid)}
    };

    public static void main(String[] args) {
        Maze maze = new GridMaze(GRID);
        Robot robot = maze.robot();

        ${call}

        // Emit the Maze Trail as one sentinel-tagged JSON line of [row,col] pairs.
        int[][] trail = robot.trail();
        StringBuilder sb = new StringBuilder("__TRAIL__ [");
        for (int i = 0; i < trail.length; i++) {
            if (i > 0) sb.append(',');
            sb.append('[').append(trail[i][0]).append(',').append(trail[i][1]).append(']');
        }
        System.out.println(sb.append(']'));
    }

    // ===== your algorithm =====
`
}

// The harness closes the class after the student's spliced-in code.
const HARNESS_SUFFIX = '\n}\n'

// How many lines the harness inserts above the student's first line. Compile
// errors come back as "line N: ..." counted in the assembled file; subtracting
// this maps them to the line the student actually typed. The offset depends on
// the mode (the astar prefix has one extra import line), so pass the same mode
// used to build the harness.
export function studentLineOffset(grid: number[][], mode: HarnessMode = 'wall'): number {
  return harnessPrefix(grid, mode).split('\n').length - 1
}

// Assemble the full compilation unit: harness prefix + student code + close.
export function buildMazeHarness(
  grid: number[][],
  studentCode: string,
  mode: HarnessMode = 'wall',
): string {
  return harnessPrefix(grid, mode) + studentCode.trimEnd() + HARNESS_SUFFIX
}

// Rewrite the "line N:" prefixes in a compile-error message so they point at the
// student's editor lines instead of the assembled harness. Runtime errors have
// no line numbers under CheerpJ, so they pass through untouched.
export function retargetErrorLines(output: string, offset: number): string {
  return output.replace(/^line (\d+):/gm, (_m, n) => `line ${Math.max(1, Number(n) - offset)}:`)
}

export interface TrailResult {
  // Cells in [x, y] = [col, row] order (the swap from Java-native [row, col]
  // happens here and nowhere else), including the Start cell first.
  cells: [number, number][]
}

// Find the __TRAIL__ sentinel line in captured stdout and parse it. Returns null
// if no sentinel line is present (treat as "algorithm produced no trail").
export function parseTrail(output: string): TrailResult | null {
  const line = output.split('\n').find((l) => l.startsWith('__TRAIL__ '))
  if (!line) return null
  try {
    const rowCol = JSON.parse(line.slice('__TRAIL__ '.length)) as [number, number][]
    // The one conversion point: Java is [row, col]; the robot state is [x, y].
    return { cells: rowCol.map(([row, col]) => [col, row]) }
  } catch {
    return null
  }
}
