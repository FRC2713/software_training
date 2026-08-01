---
title: "Writing a maze solver"
goal: "Turn the wall follower from an idea into working Java: use the robot's facing() and the Direction turns to try right, straight, left, then back, and watch your own algorithm drive a robot out of a freshly generated maze."
order: 198
section: "Algorithms"
---

# From a helper to an algorithm

You have a robot you understand and a `tryMove` helper that moves it one cell
*if it can*. Time to put them in a loop and cross the maze — the **wall
follower** from the visual lesson, now as real code.

The rule, in words, was: *relative to the way I'm facing, take the first opening
in this order — right, straight, left, then (only as a last resort) back.* The
one fact it leans on is the robot's **heading**, and that's exactly the fact the
robot already remembers for you: `robot.facing()`. Because `drive` updates
`facing()` every time the robot actually moves, you never have to track the
heading yourself.

To turn "right, straight, left, back" into real `Direction`s, ask the heading to
rotate. `Direction` offers three turns:

```text
Direction.RIGHT.clockwise()          → Direction.DOWN     (a right turn)
Direction.RIGHT.counterClockwise()   → Direction.UP       (a left turn)
Direction.RIGHT.opposite()           → Direction.LEFT     (turn around)
```

So if the robot is `facing()` right, its own right-hand side is `clockwise()` of
that (down), straight ahead is the heading itself, its left is
`counterClockwise()`, and back is `opposite()`. Build that list of four and
`tryMove` the first one that's open:

```java
import com.frc2713.mazesolver.*;

public class WallFollower {
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

        int maxSteps = 1000; // a safety stop, so a bad rule can't loop forever
        for (int i = 0; i < maxSteps && !robot.atGoal(); i++) {
            Direction ahead = robot.facing();
            // Right, straight, left, back — relative to the way we're facing.
            Direction[] order = {
                ahead.clockwise(), ahead, ahead.counterClockwise(), ahead.opposite()
            };
            for (Direction dir : order) {
                if (tryMove(robot, dir)) break; // took the first opening
            }
        }

        if (robot.atGoal()) {
            System.out.println("Reached the goal in " + (robot.trail().length - 1) + " steps!");
        } else {
            System.out.println("Gave up after " + maxSteps + " steps.");
        }
    }

    // Drive one step in dir if that side is open; report whether we moved.
    static boolean tryMove(Robot robot, Direction dir) {
        if (!robot.readWallSensor(dir)) {
            robot.drive(dir);
            return true;
        }
        return false;
    }
}
```

Press **Run**: the robot hugs the right-hand wall all the way from the green cell
to the red one and prints how many steps it took. Everything the visual lesson
promised is here in a dozen lines — and the only state the algorithm keeps is the
heading, which the robot hands you for free.

# Now you try: your solver in a real maze

You just read a whole program you could run but not *change*. Now it's your turn,
and this time the maze is real — freshly generated, and different every time.

Notice how much of that program was the same boilerplate every run: `main`,
building the `Maze`, the safety cap, printing the result. The only part that's
truly *the algorithm* is the decision inside the loop — so that's the only part
the playground asks you for. It hands you a `Robot` standing at the start and
asks for one method, `solve`:

The maze on the right is handed to your Java `solve` method, your algorithm drives
the `Robot`, and the exact path it took is animated right back here — the full
round-trip. You have the same API you've been using all along:

- `robot.readWallSensor(Direction.UP/DOWN/LEFT/RIGHT)` — is that side a wall?
- `robot.drive(Direction.UP/DOWN/LEFT/RIGHT)` — drive one cell (a wall stops you).
- `robot.facing()` — the direction it last drove; `Direction` also has
  `clockwise()`, `counterClockwise()`, and `opposite()`.
- `robot.atGoal()`, `robot.row()`, `robot.col()` — where am I, am I done?

The starter is the **wall follower** you just studied. Run it first and watch it
solve. Then make it yours:

- Hit **Generate new maze** and run again — a good algorithm clears *any* maze,
  not just one.
- Break it on purpose: swap `clockwise()` and `counterClockwise()` (a *left*-hand
  follower — it still works!), or delete the wall check and drive blindly into
  walls, and watch where your robot gets stuck.
- Throw out the wall follower entirely and write your own rule. Anything that
  reaches red counts.

```maze
solver: java
```
