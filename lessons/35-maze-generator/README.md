---
title: "Navigating a maze"
goal: "See a maze as a robot's world — a grid it must cross — and understand how an algorithm steps through it: sense, decide, move, repeat, until it reaches the goal."
order: 350
section: "Extras"
---

# A maze is a robot's world

On the right is a maze. It's fun to solve by hand — but for us it's really a
tiny, simplified version of the problem every FRC robot faces: **"I'm here, I
need to get there, and there are things in my way."**

Strip a competition field down to its essentials and you get exactly this: a
space divided into a **grid** of cells, some paths open, some blocked by
**walls**, a place you **start**, and a place you're trying to **reach**.

- The **grid of cells** is the field, chopped into squares the robot can occupy.
- The **walls** are obstacles — you can't drive through them.
- The **green** cell is the **start**; the **red** cell is the **goal**.
- The **blue dot** is the **robot**.

Before we talk about *how* a robot crosses this, get a feel for it: use the
arrow buttons (or your arrow keys) and drive the robot from green to red. Notice
you can't move through walls — only through the openings.

```maze
```

# The robot only knows what's around it

Here's the crucial thing about robots — and it's easy to miss because *you* can
see the whole maze at once. **The robot can't.**

A real robot doesn't get a bird's-eye view. It knows two things:

1. **Where it is right now** — which cell it's sitting in. That's its
   **state**: a single fact, "I am at column 3, row 5."
2. **What's immediately around it** — which of its four sides (up, down, left,
   right) are open, and which are walls. That's its **sensor reading** for this
   moment.

That's it. From one cell, the robot can only see its own four walls. It has to
make its next decision using just that — then move, look again, and decide
again.

When *you* press an arrow, you're being the robot's decision-maker for one step:
you pick a direction, and it either moves (opening) or stays put (wall). Each
press is one **"sense → decide → move"** cycle.

```maze
```

# An algorithm is that loop, written down

Driving by hand is fine, but robots run **algorithms** — a plan the computer
repeats, the same way every time, until the job is done. And a maze algorithm
is just the loop you've been doing by hand, spelled out:

```text
start at the green cell
repeat until you reach the red cell:
    look at which directions are open   (sense)
    choose one of them                  (decide)
    step that way                       (move)
```

Everything interesting lives in that middle line — **"choose one."** *How* the
robot chooses is what makes one algorithm smart and another one dumb:

- **Wall follower** — "always keep your right hand on the wall." Simple, needs
  no memory, and it works for a lot of mazes.
- **Depth-first search** — "keep pushing into new cells; when you hit a dead
  end, back up to the last spot with an untried opening and try that."
  (Fun fact: this maze was *built* by that exact idea, running in reverse.)
- **Breadth-first search** — "explore all the cells one step away, then all the
  cells two steps away…" — slower to write, but it finds the *shortest* path.

They all share the same skeleton — **sense, decide, move, repeat** — and differ
only in the "decide" step. That skeleton is the shape of an enormous amount of
robot code: read your sensors, decide what to do, act, and loop.

## A closer look at the wall follower

The wall follower is the simplest of the three, and it's worth understanding in
full because it shows how a *tiny* rule can produce smart-looking behavior.

**How it works.** Imagine walking the maze with your **right hand** pressed flat
against the wall. You never lift it. At every cell the robot runs through the
same four choices, always in this order, and takes the **first** one that's
open:

```text
1. turn right  — is there an opening to my right?  take it.
2. go straight — else, is the way ahead open?      take it.
3. turn left   — else, is there an opening left?   take it.
4. turn around — else, it's a dead end. go back.
```

That "right first" order is exactly what keeping your right hand on the wall
does: you hug the wall by always turning toward it when you can, and only peel
away when you must. The robot needs to remember just **one** thing between
steps — the direction it's currently facing — so it can tell which way "right"
is. No map. No list of visited cells. No idea where the goal is.

**Why it works.** Here's the surprising part. The walls of this maze aren't a
scattering of separate obstacles — they're all **one single connected piece**.
The generator carved the maze by knocking out walls without ever sealing off a
loop, so what's left is one continuous wall with no islands (mazes like this are
called *simply connected*, or "perfect" mazes).

Now picture tracing your finger along the edge of one connected shape — say, the
outline of a single puzzle piece. Keep going and you always come back around;
you can't get stranded, because there's only one border to follow. The wall
follower does exactly that: it traces the boundary of that one giant wall. Since
the start and the goal both sit on that same connected boundary, faithfully
following it **must** eventually walk the robot from one to the other. It might
wander down dead ends and back out — but it can never get permanently lost.

The catch is right there in the "why": it only works when the walls are one
connected piece. Add a loop to the maze — a wall island floating in the middle —
and the robot can end up circling that island forever, hugging a border that
never touches the goal. For our perfect mazes, though, it's guaranteed.

Hit **Run wall follower** below and watch it happen: no map, no memory of where
it's been, just those four choices in order, over and over, until it lands on
the goal.

```maze
solver: wall
```

# The same algorithm, in Java

Everything so far has been visual. But the whole point is that a maze is just
**data**, and an algorithm is just **code** — and once it's data and code, a
robot can run it. Here's that exact wall follower written in Java, reading a
maze that was serialized straight out of the generator on the previous page.

The maze is an `int[][]` — a grid of numbers. Each number is the same
**N/S/E/W bitmask** you've been looking at: a set bit means that side of the
cell is open. Reading a wall is one operation: `(maze[row][col] & E) != 0` asks
"is the east side open — can I move right?"

The loop below is the flowchart from earlier turned into code: while we're not
at the goal, try to turn right, else go straight, else turn left, else turn
around — take the first open direction, step, repeat. Press **Run** and watch it
count its way to the exit. Then try editing the start heading, or paste your own
maze from the **Copy for Java** button and run *that*.

```java
public class Maze {
    // Wall bits: for a cell, a SET bit means that side is open.
    static final int N = 1, S = 2, E = 4, W = 8;

    // Headings, clockwise: 0 = up, 1 = right, 2 = down, 3 = left.
    // BIT/DR/DC line up with those indexes: which wall to check, and how the
    // row/column change when you step that way.
    static final int[] BIT  = { N, E, S, W };
    static final int[] DR   = { -1, 0, 1, 0 };
    static final int[] DC   = { 0, 1, 0, -1 };
    static final char[] FACE = { 'U', 'R', 'D', 'L' };

    public static void main(String[] args) {
        // A maze serialized from the generator: each cell is an N/S/E/W bitmask.
        int[][] maze = {
      {4, 12, 10, 6, 10, 4, 14, 10, 4, 12, 14, 12, 12, 10},
      {6, 10, 5, 9, 5, 12, 9, 5, 12, 12, 9, 6, 12, 9},
      {3, 5, 12, 14, 12, 12, 12, 10, 6, 12, 10, 3, 6, 8},
      {3, 6, 10, 3, 6, 8, 6, 9, 5, 10, 3, 3, 5, 10},
      {5, 9, 3, 3, 7, 12, 13, 12, 10, 1, 3, 5, 10, 3},
      {6, 8, 3, 3, 5, 8, 6, 10, 5, 10, 3, 6, 9, 3},
      {3, 6, 9, 5, 10, 6, 9, 3, 4, 13, 9, 5, 12, 11},
      {3, 5, 12, 10, 5, 9, 2, 5, 12, 12, 12, 14, 10, 3},
      {7, 14, 8, 5, 10, 4, 13, 12, 12, 14, 10, 3, 1, 3},
      {3, 3, 6, 10, 5, 10, 6, 12, 12, 9, 3, 5, 12, 9},
      {1, 3, 3, 5, 12, 9, 3, 6, 12, 10, 3, 2, 6, 10},
      {6, 11, 3, 4, 12, 14, 9, 3, 2, 5, 9, 7, 9, 3},
      {3, 1, 3, 6, 10, 3, 6, 9, 5, 12, 12, 13, 8, 3},
      {5, 12, 13, 9, 5, 9, 5, 12, 12, 12, 12, 12, 12, 9}
        };
        int startRow = 0, startCol = 0;
        int goalRow = 13, goalCol = 13;

        int row = startRow, col = startCol;
        int dir = 1; // start facing right
        int steps = 0;
        int maxSteps = maze.length * maze[0].length * 4;
        StringBuilder path = new StringBuilder();

        System.out.println("Start at (" + row + ", " + col + "), goal is ("
            + goalRow + ", " + goalCol + ")");

        while (!(row == goalRow && col == goalCol) && steps < maxSteps) {
            // Right-hand rule: try right (+1), straight (0), left (+3),
            // back (+2) — take the first heading whose wall is open.
            for (int turn : new int[] { 1, 0, 3, 2 }) {
                int d = (dir + turn) % 4;
                if ((maze[row][col] & BIT[d]) != 0) {
                    dir = d;
                    row += DR[d];
                    col += DC[d];
                    path.append(FACE[d]);
                    break;
                }
            }
            steps++;
        }

        if (row == goalRow && col == goalCol) {
            System.out.println("Reached the goal in " + steps + " steps!");
            System.out.println("Path: " + path);
        } else {
            System.out.println("Gave up after " + steps + " steps.");
        }
    }
}
```

# Solving with a maze library

That last program worked, but look at how much of it was *plumbing* — bitmask
constants, `DR`/`DC` offset arrays, `maze[row][col] & BIT[d]`. None of that is
the algorithm. It's bookkeeping you have to get exactly right before you can
even start thinking about *how to solve the maze*.

That's what a **library** is for. Our team's `maze-solver` library
(`com.frc2713.mazesolver`) wraps all of that up and hands you three friendly
tools:

- a **`Maze`** you build from the grid,
- a **`Robot`** that walks it — `robot.canMoveRight()`, `robot.moveRight()`,
  `robot.atGoal()`,
- and **`Cell`**s you can ask plain questions like `cell.wallRight()`.

No bitmasks. The exact same wall-follower now reads like the *idea* instead of
the bookkeeping — "if I can turn right, turn right; otherwise go straight, then
left, then back." You write the algorithm; the library handles the maze.

```java
import com.frc2713.mazesolver.*;

public class SolveMaze {
    public static void main(String[] args) {
        int[][] grid = {
      {4, 12, 10, 6, 10, 4, 14, 10, 4, 12, 14, 12, 12, 10},
      {6, 10, 5, 9, 5, 12, 9, 5, 12, 12, 9, 6, 12, 9},
      {3, 5, 12, 14, 12, 12, 12, 10, 6, 12, 10, 3, 6, 8},
      {3, 6, 10, 3, 6, 8, 6, 9, 5, 10, 3, 3, 5, 10},
      {5, 9, 3, 3, 7, 12, 13, 12, 10, 1, 3, 5, 10, 3},
      {6, 8, 3, 3, 5, 8, 6, 10, 5, 10, 3, 6, 9, 3},
      {3, 6, 9, 5, 10, 6, 9, 3, 4, 13, 9, 5, 12, 11},
      {3, 5, 12, 10, 5, 9, 2, 5, 12, 12, 12, 14, 10, 3},
      {7, 14, 8, 5, 10, 4, 13, 12, 12, 14, 10, 3, 1, 3},
      {3, 3, 6, 10, 5, 10, 6, 12, 12, 9, 3, 5, 12, 9},
      {1, 3, 3, 5, 12, 9, 3, 6, 12, 10, 3, 2, 6, 10},
      {6, 11, 3, 4, 12, 14, 9, 3, 2, 5, 9, 7, 9, 3},
      {3, 1, 3, 6, 10, 3, 6, 9, 5, 12, 12, 13, 8, 3},
      {5, 12, 13, 9, 5, 9, 5, 12, 12, 12, 12, 12, 12, 9}
        };

        // The library turns the raw grid into a maze and a robot at the start.
        Maze maze = new GridMaze(grid);
        Robot robot = maze.robot();

        // Heading, clockwise: 0 = up, 1 = right, 2 = down, 3 = left.
        int heading = 1; // start facing right
        int cap = maze.rows() * maze.cols() * 4; // safety stop

        while (!robot.atGoal() && robot.trail().length <= cap) {
            // Right-hand rule: prefer turning right, then straight, then left,
            // then back — the first heading the robot can actually move.
            for (int turn : new int[] { 1, 0, 3, 2 }) {
                int dir = (heading + turn) % 4;
                if (canMove(robot, dir)) {
                    heading = dir;
                    move(robot, dir);
                    break;
                }
            }
        }

        if (robot.atGoal()) {
            System.out.println("Reached the goal in " + (robot.trail().length - 1) + " steps!");
        } else {
            System.out.println("Gave up.");
        }
    }

    // Ask the robot, in one absolute direction, whether it can move.
    static boolean canMove(Robot robot, int dir) {
        switch (dir) {
            case 0:  return robot.canMoveUp();
            case 1:  return robot.canMoveRight();
            case 2:  return robot.canMoveDown();
            default: return robot.canMoveLeft();
        }
    }

    // Move the robot one step in that absolute direction.
    static void move(Robot robot, int dir) {
        switch (dir) {
            case 0:  robot.moveUp();    break;
            case 1:  robot.moveRight(); break;
            case 2:  robot.moveDown();  break;
            default: robot.moveLeft();  break;
        }
    }
}
```
