---
title: "Navigating a maze"
goal: "See a maze as a robot's world — a grid it must cross — and learn what makes something an algorithm by watching three robots try to solve it: a random walk (no plan), a fixed rule that loops (an algorithm, but a bad one), and the wall follower (sense, decide, move, repeat)."
order: 195
section: "Algorithms"
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

# The dumbest possible robot: move at random

You just drove the maze by hand, making a real choice at every cell. So here's a
fair question — what if the robot *didn't* choose? What if, at each step, it just
picked one of the open directions **at random** and went?

Hit **Move at random** and watch.

```maze
solver: random
```

Sometimes it stumbles onto the goal. Sometimes it wanders forever. And here's the
part that matters: **run it again and it does something completely different.**
There's no plan — just a coin flip at every cell.

That's exactly why this is *not an algorithm*. An algorithm is something you can
write down, hand to someone else, and have them get the **same result you did**.
You can't write down "flip a coin" and call that a plan. Notice, too, that
nothing guarantees it ever finishes — it could bounce around and simply never
happen to land on red.

(Random isn't worthless — real robots sometimes add a pinch of it on purpose. But
as *the whole strategy*, it's nothing you can count on, and that's the point.)

# A rule you can repeat

Let's give the robot an actual rule — the simplest one imaginable. At every cell,
always try the same directions in the same order, and take the first one that's
open:

```text
at each cell, try these in order and take the first open one:
    up, then left, then down, then right
```

That's the entire rule. No randomness, no cleverness. Press **Run the naive
rule**:

```maze
solver: naive
```

Two things to notice.

First, it's **completely repeatable**. Run it again on this same maze and the
robot retraces the *exact* same steps — every time. That's what random didn't
have, and it's what makes this an **algorithm**: a precise rule that produces the
same result on every run.

Second… it barely gets anywhere. Watch it take a step and then immediately walk
**right back** the way it came, jittering between two cells forever. (A rule with
*no memory* that returns to a cell it's already seen will make the identical
choice it made last time — so it's provably doomed to loop there. We let it
bounce a few times so you can see it, then stop it.)

Why does it trap itself so fast? Because "up" is first in its list, and once
it steps down into a cell, the very next thing it does is look up — back where it
came from — and take it. It has **no memory** of having just been there. It
doesn't know which way it was heading, and it doesn't know the goal exists.

So being an algorithm doesn't make a rule *good*. This one is perfectly precise
and perfectly repeatable — and perfectly useless for crossing the maze. The bar
for "algorithm" is just *definiteness and repeatability*; **whether it actually
works is a separate question**, and it's the interesting one. Give this robot
just *one* fact to remember, and something surprising happens.

# An algorithm that actually crosses the maze

Here's the surprise: the **wall follower** is almost the same rule as the naive
one — a fixed order of directions, take the first open one. It adds exactly **one
remembered fact**: which way the robot is currently facing. And it tries its
directions *relative to that heading* instead of relative to the screen:

```text
at each cell, relative to the way I'm facing, take the first open one:
1. turn right  — is there an opening to my right?  take it.
2. go straight — else, is the way ahead open?      take it.
3. turn left   — else, is there an opening left?   take it.
4. turn around — else, it's a dead end. go back.
```

That's the whole idea behind **"keep your right hand on the wall."** And look at
what it does to the jitter: "turn around" is now **dead last**, so the robot only
reverses at a true dead end — never on the very next step. Because "right" and
"straight" are measured from a heading the robot *remembers* between steps, it
hugs the wall and keeps moving instead of bouncing in place. That single
remembered fact — its facing — is the *only* thing it adds to the naive rule. No
map, no list of visited cells, no idea where the goal is. Press **Run wall
follower**:

```maze
solver: wall
```

## Why it works

Here's the surprising part. The walls of this maze aren't a scattering of
separate obstacles — they're all **one single connected piece**. The generator
carved the maze by knocking out walls without ever sealing off a loop, so what's
left is one continuous wall with no islands (mazes like this are called *simply
connected*, or "perfect" mazes).

Now picture tracing your finger along the edge of one connected shape — say, the
outline of a single puzzle piece. Keep going and you always come back around; you
can't get stranded, because there's only one border to follow. The wall follower
does exactly that: it traces the boundary of that one giant wall. Since the start
and the goal both sit on that same connected boundary, faithfully following it
**must** eventually walk the robot from one to the other. It might wander down
dead ends and back out — but it can never get permanently lost.

That's why the naive rule fails and this one doesn't: it isn't luck, it's the
memory. Facing is just enough state to keep the robot *committed to a wall*
rather than making the same local choice from scratch each time.

But "works" still isn't "good." The wall follower cheerfully explores every dead
end, and the path it finds is usually far from the **shortest** one. And the
whole guarantee rests on that one assumption — one connected wall. Add a loop to
the maze, a wall island floating in the middle, and the robot can circle that
island forever, hugging a border that never touches the goal. For our perfect
mazes, though, it always gets there.

## The same skeleton, over and over

Look back at all three robots and you'll see they're built from the *same loop* —
they only disagree about one step:

```text
start at the green cell
repeat until you reach the red cell:
    look at which directions are open   (sense)
    choose one of them                  (decide)
    step that way                       (move)
```

Everything interesting lives in that middle line — **"choose one."** Random rolls
a die there; the naive rule reads a fixed list; the wall follower consults its
remembered heading. Swap in a smarter "decide" and you get smarter algorithms:

- **Wall follower** — "keep your right hand on the wall." One remembered fact,
  and it clears any perfect maze.
- **Depth-first search** — "keep pushing into new cells; when you hit a dead end,
  back up to the last spot with an untried opening and try that." (Fun fact: this
  maze was *built* by that exact idea, running in reverse.)
- **Breadth-first search** — "explore all the cells one step away, then all the
  cells two steps away…" — more to write, but it finds the *shortest* path.

Same skeleton — **sense, decide, move, repeat** — every time, differing only in
"decide." That skeleton is the shape of an enormous amount of robot code: read
your sensors, decide what to do, act, and loop.

# The same algorithm, in Java

Everything so far has been visual. But the whole point is that a maze is just
**data**, and an algorithm is just **code** — and once it's data and code, a
robot can run it. Here's that exact wall follower written in real Java.

The maze starts as an `int[][]` — a grid of numbers, each the same **N/S/E/W
bitmask** you've been looking at (a set bit means that side of the cell is
open). But you don't want to be doing bitmask arithmetic while you're trying to
think about *solving* the maze. That's what a **library** is for. Our team's
`maze-solver` library (`com.frc2713.mazesolver`) turns that raw grid into three
friendly tools:

- a **`Maze`** you build from the grid — `new GridMaze(grid)`,
- a **`Robot`** that walks it — `robot.canMoveRight()`, `robot.moveRight()`,
  `robot.atGoal()`,
- and **`Cell`**s you can ask plain questions like `cell.wallRight()`.

The library handles the *maze* — no bitmasks, no `maze[row][col]` arithmetic, no
tracking coordinates as the robot steps. What's left is just the algorithm, and
the algorithm keeps exactly **one** piece of its own state: `facing`, the
direction the robot is currently pointing. That's the single remembered fact
from the last page — the whole reason the wall follower beats the naive rule.
The maze is the library's job; the facing is the part that's genuinely *yours*.

The loop below is the flowchart from earlier turned into code: relative to the
way it's facing, the robot tries right, else straight, else left, else back —
takes the first open direction, remembers that as its new facing, and repeats.
Press **Run** and watch it count its way to the exit.

```java
import com.frc2713.mazesolver.*;

public class SolveMaze {
    public static void main(String[] args) {
        // A maze serialized from the generator: each cell is an N/S/E/W bitmask.
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

        // The robot's one remembered fact: which way it's facing.
        // 0 = up, 1 = right, 2 = down, 3 = left. Start facing right.
        int facing = 1;
        int cap = maze.rows() * maze.cols() * 4; // safety stop

        while (!robot.atGoal() && robot.trail().length <= cap) {
            // Try right, straight, left, back — relative to the way we're facing
            // — and take the first one that's open, remembering it as the new facing.
            int[] order = { (facing + 1) % 4, facing, (facing + 3) % 4, (facing + 2) % 4 };
            for (int dir : order) {
                if (tryMove(robot, dir)) {
                    facing = dir;
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

    // Move one step in an absolute direction if that side is open; report
    // whether we actually moved. (0 = up, 1 = right, 2 = down, 3 = left.)
    static boolean tryMove(Robot robot, int dir) {
        if (dir == 0 && robot.canMoveUp())    { robot.moveUp();    return true; }
        if (dir == 1 && robot.canMoveRight()) { robot.moveRight(); return true; }
        if (dir == 2 && robot.canMoveDown())  { robot.moveDown();  return true; }
        if (dir == 3 && robot.canMoveLeft())  { robot.moveLeft();  return true; }
        return false;
    }
}
```

# Now you try: write your own solver

You just read the whole program — building the maze, getting the robot, the
loop, checking the goal. You could run it, but not *change* it. Now it's your
turn.

Notice how much of that program was the same every time: `main`, building the
`Maze`, the safety cap, printing the result. The only part that was really *the
algorithm* was the decision inside the loop. So that's the only part we'll ask
you for. The playground below hands you a `Robot` already standing at the start
and asks for one method — `solve` — the interesting part.

The maze on the right is a real one, freshly generated. Write an algorithm that
drives the robot from the **green** cell to the **red** one, press **Run in the
maze**, and watch *your* robot walk the path your code produced. This is the full
round-trip: the maze you see is handed to your Java `solve` method, your
algorithm drives the `Robot`, and the exact path it took is animated right back
here. You have:

- `robot.canMoveUp()`, `robot.canMoveDown()`, `robot.canMoveLeft()`,
  `robot.canMoveRight()` — is that side open?
- `robot.moveUp()`, `robot.moveDown()`, `robot.moveLeft()`, `robot.moveRight()`
  — step one cell (a move into a wall does nothing).
- `robot.atGoal()`, `robot.row()`, `robot.col()` — where am I, am I done?

The starter code is the **wall follower** from the last two pages. Run it first
to see it solve the maze. Then make it yours:

- Hit **Generate new maze** and run again — a good algorithm clears *any* maze,
  not just one.
- Break it on purpose: change the starting `facing` to `0`, or drive the robot
  straight into a wall, and watch it get stuck exactly where your code went
  wrong.
- Throw out the wall follower entirely and write your own rule. Anything that
  reaches red counts.

```maze
solver: java
```
