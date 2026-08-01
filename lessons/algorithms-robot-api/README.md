---
title: "Reading the robot's API"
goal: "Meet the maze-solver library — the Maze, Robot, and Direction it hands you — and practice the real-world skill of reading an unfamiliar API by writing a small helper method, tryMove, out of the robot's sense and drive abilities."
order: 197
section: "Algorithms"
---

# Meet the robot

Last lesson you saw the maze as an `int[][]` — and promised yourself you'd never
decode those numbers by hand. This is where that promise pays off. We hand the
grid to a small **library** (a bundle of ready-made code someone else wrote for
you), and it gives back two friendly objects:

```java
Maze maze = new GridMaze(grid);   // turn the raw grid into a maze
Robot robot = maze.robot();       // a robot standing on the start cell
```

That's it — no bitmasks. From here you think about a **robot**, and a robot can
do exactly what the visual lessons described: **sense** what's around it and
**move**. Learning precisely what it can do means reading its **API** — the list
of methods it offers. Reading an API you didn't write is one of the most useful
skills in all of programming (it's most of what working with real robot code
*is*), so here's the robot's, in full:

```text
robot.readWallSensor(Direction.UP)     is that side a wall?  → true / false
robot.drive(Direction.RIGHT)           drive one cell that way (does nothing if walled)
robot.facing()                         the Direction it last drove
robot.atGoal()                         standing on the goal (red) cell?
robot.row(), robot.col()               where it is now
```

`Direction` is the four ways it can face or move: `Direction.UP`,
`Direction.DOWN`, `Direction.LEFT`, `Direction.RIGHT`. Two things are worth
underlining before you use them:

- `readWallSensor(dir)` reports a **wall**: it's `true` when that side is
  *blocked*. So an *opening* is when it comes back `false`.
- `drive(dir)` is honest about the walls: if you aim it at a wall, the robot just
  stays put. And when it *does* move, it remembers that direction — so right
  after `robot.drive(Direction.UP)`, `robot.facing()` is `Direction.UP`. A robot
  that just drove up is now facing up.

Here's the robot actually doing these things. Read the code, predict the output,
then press **Run**:

```java
import com.frc2713.mazesolver.*;

public class MeetTheRobot {
    public static void main(String[] args) {
        int[][] grid = {
            {4, 12, 12, 12, 10},
            {6, 12, 10, 6, 9},
            {5, 10, 3, 3, 2},
            {6, 9, 3, 5, 11},
            {5, 8, 5, 12, 9}
        };
        Maze maze = new GridMaze(grid);
        Robot robot = maze.robot();

        // What's around the robot at the start?
        System.out.println("Wall above me?  " + robot.readWallSensor(Direction.UP));
        System.out.println("Wall to right?  " + robot.readWallSensor(Direction.RIGHT));

        // Drive one cell to the right, then look again.
        robot.drive(Direction.RIGHT);
        System.out.println("Drove right. Now at row " + robot.row() + ", col " + robot.col());
        System.out.println("Facing: " + robot.facing());
    }
}
```

At the start the robot is boxed in on every side but the right — that lone
opening is why the start cell's number was `4`. Try changing that first `drive`
to `Direction.UP` (into a wall) and re-run: the robot doesn't move, because the
drivetrain can't push through a wall.

# Build a helper: tryMove

Look at the two abilities together and a small annoyance appears. To *safely*
move a direction you always do the same two-step dance: **check the sensor, and
only drive if it's open.** Drive without checking and you might just grind into a
wall.

That pattern — "move that way *if you can*, and tell me whether you did" — is
worth bottling into one method of your own. Call it `tryMove`:

```text
tryMove(robot, dir):
    if that side is NOT a wall:
        drive that way
        return true   (yes, I moved)
    otherwise:
        return false  (no, blocked)
```

It's only a few lines, but writing it is the exercise: you're turning the raw API
into a tool shaped like the way you actually think about the problem. Here it is
in code. **Read the body of `tryMove` and make sure you can explain each line** —
then, to really learn it, delete the body and rewrite it from the pseudocode
above without looking.

```java
import com.frc2713.mazesolver.*;

public class TryMove {
    public static void main(String[] args) {
        int[][] grid = {
            {4, 12, 12, 12, 10},
            {6, 12, 10, 6, 9},
            {5, 10, 3, 3, 2},
            {6, 9, 3, 5, 11},
            {5, 8, 5, 12, 9}
        };
        Maze maze = new GridMaze(grid);
        Robot robot = maze.robot();

        // Try each direction once and report what happened.
        Direction[] toTry = { Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT };
        for (Direction dir : toTry) {
            boolean moved = tryMove(robot, dir);
            System.out.println("tryMove " + dir + " -> " + moved
                + "   (now at row " + robot.row() + ", col " + robot.col() + ")");
        }
    }

    // Drive one step in dir if that side is open; report whether we moved.
    static boolean tryMove(Robot robot, Direction dir) {
        if (!robot.readWallSensor(dir)) {  // not a wall → there's an opening
            robot.drive(dir);
            return true;
        }
        return false;
    }
}
```

Run it and read the trace: from the start only `RIGHT` comes back `true`, so
that's the only line where the robot's column changes. Every other direction is a
wall, so `tryMove` reports `false` and the robot holds its position — no crashing
into walls, exactly as designed.

You now have a robot you understand and one helper of your own. That's everything
you need to write a *real* maze-solving algorithm — which is the next lesson.
