# The maze round-trip: JS → Java → animated steps

**Status: proposed / design spec.** As of this writing the round-trip is *not
wired end to end.* The individual pieces exist and are noted below, but nothing
today feeds a JS-generated maze into the JVM as data, and nothing parses the
Java output back into the animation. This document specifies the seams and data
contracts needed to connect them, so a future change can build it.

Audience: developers working on the site. This is not student-facing lesson
content.

## What we're building and why

A student writes a maze-solving **algorithm** in Java. They press **Run**, and
the maze currently shown in the playground — generated in JavaScript — is handed
to their algorithm, which drives a `Robot` through it. The path the robot took
is then **animated back** in the same playground.

The motivating win is *removing duplicated logic*. Today
`site/src/components/MazePlayground.tsx` animates a wall follower that is
**re-implemented in TypeScript** (`runSolver`, mode `'wall'`) purely so there's
something to animate. That algorithm already exists in Java and in the
`maze-solver` library. The round-trip makes the **Java side the single source of
truth for the path**: JS generates the maze and plays back a result, but never
re-simulates solving.

The library's job in this is narrow and deliberate: it turns the raw bitmask
grid into a friendly `Maze`/`Robot`/`Cell` API so the *student* writes an
algorithm, not file I/O or bitmask arithmetic. See `CONTEXT.md` for the domain
vocabulary (Maze, Grid, Cell, Robot, Move, Solution, **Maze Trail**).

## Data flow

```mermaid
sequenceDiagram
    participant JS as MazePlayground (JS)
    participant RT as javaRuntime.runJava
    participant H as Harness (generated Java)
    participant Stu as student solve(Robot)
    participant Lib as maze-solver library

    JS->>JS: generateMaze() → int[][] bitmask grid
    JS->>RT: runJava(harnessSource)   // grid interpolated as literal + solve() spliced in
    RT->>H: compile + run (CheerpJ)
    H->>Lib: new GridMaze(grid); maze.robot()
    H->>Stu: solve(robot)
    Stu->>Lib: robot.canMove*/move*/atGoal()   // library records the Maze Trail
    H->>H: print "__TRAIL__ [[row,col],…]" (sentinel line)
    RT-->>JS: RunOutcome.output (captured stdout)
    JS->>JS: scan for sentinel, JSON.parse, [row,col]→[x,y]
    JS->>JS: replay Trail — place robot dot at each cell
```

## The seams, one at a time

### 1. Generate the maze (JS) — *exists*

`generateMaze(SIZE)` in `MazePlayground.tsx` produces the `number[][]` N/S/E/W
bitmask grid (`N=1, S=2, E=4, W=8`; a set bit means that side is **open**). This
is unchanged.

### 2. Pass the maze down (new)

`runJava(code)` accepts **only a source string** — there is no data channel. So
the current grid is carried in by *interpolating it into the harness source* as
an `int[][]` literal, reusing the exact format `serializeToJava` already emits
(the bitmask grid plus `startRow/startCol/goalRow/goalCol`). No VFS file, no
Java-side parsing.

`serializeToJava` currently targets the clipboard ("Copy for Java"); the new glue
factors its literal-building out so the harness builder can call it directly.

### 3. Deserialize (Java / library) — *exists in the library*

The harness constructs the friendly API from the literal:

```java
Maze maze = new GridMaze(grid);
Robot robot = maze.robot();   // positioned at Start
```

The student never sees the bitmask grid or `main`.

### 4. Execute the student's algorithm (Java)

The harness calls the student's `solve(Robot)`. The student drives the robot with
the library's absolute-move API — `robot.canMoveUp/Right/Down/Left()`,
`robot.moveUp/…()`, `robot.atGoal()`. Each successful move extends the **Maze
Trail** the library records; a move blocked by a wall does nothing and adds no
Trail entry (so a buggy algorithm that drives into a wall shows the robot
*actually stuck there* when animated).

### 5. Emit the steps (new)

After `solve` returns, the **harness** — not the student — prints the Trail as a
single **sentinel-tagged line**:

```
__TRAIL__ [[0,0],[0,1],[1,1],[1,2]]
```

- The `__TRAIL__` prefix makes the line unambiguously extractable even when the
  student's own `System.out.println` debugging is interleaved in stdout.
- The payload is a **JSON array of `[row, col]` pairs**, in `row`-major
  (Java-native) coordinates — see the coordinate note below.
- It is the full `robot.trail()`, including the Start cell as the first entry, so
  the animation has a complete path from `trail[0]`.

### 6. Parse the steps back (new)

The JS glue takes `RunOutcome.output`, finds the line beginning with the
sentinel, and `JSON.parse`s the remainder. `runJava` already returns captured
stdout in `RunOutcome.output`, and already flags compile/runtime failure via
`RunOutcome.ok` — the parser only runs on `ok === true` and simply reports "no
trail found" if the sentinel line is absent.

### 7. Animate the steps (new wiring)

`MazePlayground` replays the parsed Trail by placing the robot dot at each cell
in sequence (the same interval-driven loop shape as today's `runSolver`, but
*reading* cells instead of *computing* moves). Because the Trail is exactly what
happened in Java, the JS side needs **no wall logic at all** — it does not check
openings, it just plays the cells back.

## The wire contract (authoritative)

| Direction | Payload | Encoding |
| --- | --- | --- |
| JS → Java | current maze grid + start/goal | `int[][]` literal interpolated into harness source (`serializeToJava` format) |
| Java → JS | Maze Trail | one line: `__TRAIL__ ` + JSON `[[row,col],…]` on stdout |

**Coordinate convention — the one conversion point.** Java is row-major
(`maze[row][col]`, `Cell.row()/col()`), but `MazePlayground`'s robot state is
`[x, y]` = `[col, row]`. They are transposed. The wire carries **`[row, col]`**
(Java-native); the JS parser performs the single `[row, col] → [x, y]` swap on
the way in. Do the swap in exactly one place and nowhere else.

## Harness shape (illustrative)

The app builds a full compilation unit; `prepareSource` in `javaRuntime.ts`
already runs a declared class with a `main`, so no changes to the runtime's
wrapping are needed. Roughly:

```java
import com.frc2713.mazesolver.*;

public class MazeRun {
    public static void main(String[] args) {
        int[][] grid = { /* interpolated from the current JS maze */ };
        Maze maze = new GridMaze(grid);
        Robot robot = maze.robot();

        solve(robot);   // <-- student's algorithm runs here

        // Emit the Maze Trail as a sentinel-tagged JSON line.
        StringBuilder sb = new StringBuilder("__TRAIL__ [");
        Cell[] trail = robot.trail();
        for (int i = 0; i < trail.length; i++) {
            if (i > 0) sb.append(',');
            sb.append('[').append(trail[i].row()).append(',').append(trail[i].col()).append(']');
        }
        System.out.println(sb.append(']'));
    }

    // ===== student-authored, spliced in by the harness builder =====
    static void solve(Robot robot) {
        // e.g. wall follower, or whatever the student wrote
    }
}
```

## Edge cases the implementation must handle

- **Algorithm never reaches the Goal.** The Trail is still valid — animate the
  partial path. `atGoal()` at the end tells you whether it succeeded; the
  animation can show "stuck"/"gave up" the same way the current playground does.
- **Student debug output.** Tolerated by design — the sentinel line is found
  regardless of other stdout. Show the rest of the output as-is if useful.
- **Compile or runtime error.** Handled by the existing `RunOutcome.ok === false`
  path (see `simplifyCompileErrors`/`simplifyRuntimeError`); no Trail is parsed.
- **No sentinel line on success.** Treat as "algorithm produced no trail" and
  surface a clear message rather than silently animating nothing.
- **Empty/one-cell Trail.** Robot never left Start — animate nothing / a no-op.

## Exists vs. to-build

**Exists (reuse):**
- `generateMaze` and the bitmask grid (`MazePlayground.tsx`).
- `serializeToJava`'s literal format (`MazePlayground.tsx`).
- `runJava` / `RunOutcome`, stdout capture, compile+run, error simplification,
  `prepareSource` class-with-`main` handling (`javaRuntime.ts`).
- The `maze-solver` library API — `GridMaze`, `Robot`, `Cell` (external repo
  `FRC2713/maze-solver-java`, vendored as `site/public/maze-solver.jar`).
- `MazePlayground`'s interval-driven robot animation loop.

**To build (the new glue):**
- A **harness builder** that composes the interpolated grid + spliced `solve`
  into the `MazeRun` source (factor the literal out of `serializeToJava`).
- The **`__TRAIL__` sentinel emit** convention in the harness.
- A **trail parser** on the JS side (sentinel scan → `JSON.parse` → `[row,col]→
  [x,y]` swap).
- Wiring `MazePlayground` to call `runJava` and replay the parsed Trail (a new
  solver "mode" alongside the existing `'random' | 'naive' | 'wall'`).

## Integration details to confirm against the library

The library lives in `FRC2713/maze-solver-java` (only the built jar is vendored),
so verify these against its actual API before implementing:
- The exact type and accessors of `robot.trail()` elements (assumed `Cell` with
  `row()`/`col()` above) — the lessons only ever use `robot.trail().length`.
- Whether the constructor is `new GridMaze(grid)` returning `Maze` and
  `maze.robot()` returns a Start-positioned `Robot` (matches the lesson snippet
  in `lessons/algorithms/README.md`).
- The move/query method names (`canMoveUp` vs `canGoUp` — the lesson uses
  `canMove*`, `CONTEXT.md`'s Helper entry says `canGo*`; reconcile before wiring).
