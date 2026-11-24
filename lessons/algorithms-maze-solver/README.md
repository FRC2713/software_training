---
title: "Writing a maze solver"
goal: "Turn the wall follower from an idea into working Python using facing() and Direction turns, then watch your solver cross a freshly generated maze."
order: 198
section: "Algorithms"
---

# From a helper to an algorithm

You have a robot you understand and a `try_move` helper that moves it one cell *if it can*. Time to put them in a loop and cross the maze using the **wall follower** from the visual lesson, now as real Python code.

The rule, in words, was: *relative to the way I'm facing, take the first opening in this order: right, straight, left, then (only as a last resort) back.* The one fact it leans on is the robot's **heading**, and that is the fact the robot already remembers for you: `robot.facing()`. Because `drive` updates `facing()` every time the robot actually moves, you never have to track the heading yourself.

To turn "right, straight, left, back" into real `Direction` values, ask the heading to rotate. `Direction` offers three turns:

```text
Direction.RIGHT.clockwise()           -> Direction.DOWN    (a right turn)
Direction.RIGHT.counter_clockwise()   -> Direction.UP      (a left turn)
Direction.RIGHT.opposite()            -> Direction.LEFT    (turn around)
```

If the robot is `facing()` right, its own right-hand side is `clockwise()` of that (down), straight ahead is the heading itself, its left is `counter_clockwise()`, and back is `opposite()`. Build that list of four and `try_move` the first one that is open:

```python
from enum import Enum

# --- maze_solver library (included here so this snippet runs standalone) ---
class Direction(Enum):
    UP = 1
    DOWN = 2
    RIGHT = 4
    LEFT = 8

    def clockwise(self):
        return {Direction.UP: Direction.RIGHT, Direction.RIGHT: Direction.DOWN,
                Direction.DOWN: Direction.LEFT, Direction.LEFT: Direction.UP}[self]

    def counter_clockwise(self):
        return {Direction.UP: Direction.LEFT, Direction.LEFT: Direction.DOWN,
                Direction.DOWN: Direction.RIGHT, Direction.RIGHT: Direction.UP}[self]

    def opposite(self):
        return {Direction.UP: Direction.DOWN, Direction.DOWN: Direction.UP,
                Direction.LEFT: Direction.RIGHT, Direction.RIGHT: Direction.LEFT}[self]

class Robot:
    def __init__(self, maze):
        self._maze = maze
        self.row = 0
        self.col = 0
        self._facing = Direction.RIGHT
        self._trail = [[0, 0]]

    def read_wall_sensor(self, direction):
        return (self._maze._grid[self.row][self.col] & direction.value) == 0

    def drive(self, direction):
        if self.read_wall_sensor(direction):
            return
        dr, dc = {Direction.UP: (-1, 0), Direction.DOWN: (1, 0),
                  Direction.LEFT: (0, -1), Direction.RIGHT: (0, 1)}[direction]
        self.row += dr
        self.col += dc
        self._facing = direction
        self._trail.append([self.row, self.col])

    def facing(self):
        return self._facing

    def at_goal(self):
        return self.row == self._maze.rows - 1 and self.col == self._maze.cols - 1

    def trail(self):
        return list(self._trail)

class GridMaze:
    def __init__(self, grid):
        self._grid = grid
        self.rows = len(grid)
        self.cols = len(grid[0])

    def robot(self):
        return Robot(self)

# --- your solver ---
def try_move(robot, direction):
    if not robot.read_wall_sensor(direction):
        robot.drive(direction)
        return True
    return False

def solve(robot):
    max_steps = 1000  # a safety stop, so a bad rule cannot loop forever
    for _ in range(max_steps):
        if robot.at_goal():
            break
        ahead = robot.facing()
        # Right, straight, left, back, relative to the way we are facing.
        order = [
            ahead.clockwise(),
            ahead,
            ahead.counter_clockwise(),
            ahead.opposite(),
        ]
        for direction in order:
            if try_move(robot, direction):
                break  # took the first opening

grid = [
    [4, 12, 12, 12, 10],
    [6, 12, 10, 6, 9],
    [5, 10, 3, 3, 2],
    [6, 9, 3, 5, 11],
    [5, 8, 5, 12, 9],
]
maze = GridMaze(grid)
robot = maze.robot()
solve(robot)

if robot.at_goal():
    print(f"Reached the goal in {len(robot.trail()) - 1} steps!")
else:
    print("Gave up after 1000 steps.")
```

Press **Run**: the robot hugs the right-hand wall all the way from the green cell to the red one and prints how many steps it took. Everything the visual lesson promised is here in a dozen lines, and the only state the algorithm keeps is the heading, which the robot hands you for free.

# Now you try: your solver in a real maze

You just read a whole program you could run. Now it is your turn, and this time the maze is freshly generated and different every time.

Notice how much of that program was setup boilerplate: building the `GridMaze`, creating the `robot`, printing the result. The only part that is *the algorithm* is the decision inside the loop, so that is the only part the playground asks you for. It hands you a `robot` standing at the start and asks for one function: `def solve(robot):`.

The maze on the right is handed to your Python `solve` function, your algorithm drives the `robot`, and the exact path it took is animated right back here. You have the same API you have been using all along:

- `robot.read_wall_sensor(Direction.UP/DOWN/LEFT/RIGHT)` checks whether that side is a wall.
- `robot.drive(Direction.UP/DOWN/LEFT/RIGHT)` drives one cell (a wall stops you).
- `robot.facing()` returns the direction it last drove. `Direction` also has `clockwise()`, `counter_clockwise()`, and `opposite()`.
- `robot.at_goal()`, `robot.row`, and `robot.col` tell you where the robot is and whether it is done.

The starter is the **wall follower** you just studied. Run it first and watch it solve. Then make it yours:

- Hit **Generate new maze** and run again. A good algorithm clears *any* maze, not just one.
- Break it on purpose: swap `clockwise()` and `counter_clockwise()` (a *left*-hand follower, which still works!), or delete the wall check and drive blindly into walls, and watch where your robot gets stuck.
- Throw out the wall follower entirely and write your own rule. Anything that reaches red counts.

```maze
solver: python
```
