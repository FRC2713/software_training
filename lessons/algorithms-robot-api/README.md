---
title: "Reading the robot's API"
goal: "Meet the Python maze_solver library and practice reading an unfamiliar API by writing a small try_move helper."
order: 197
section: "Algorithms"
---

# Meet the robot

Last lesson you saw the maze as a `list[list[int]]` and promised yourself you would never decode those bitmasks by hand. This is where that promise pays off. We hand the grid to a small **library** (`maze_solver`, a bundle of ready-made Python code), and it gives back two friendly objects:

```text
maze = GridMaze(grid)   # turn the raw grid into a maze
robot = maze.robot()    # a robot standing on the start cell
```

No bitmasks. From here you think about a **robot**, and a robot can do what the visual lessons described: **sense** what is around it and **move**. Learning what it can do means reading its **API**, the list of methods and attributes it offers. Reading an API you did not write is one of the most useful skills in programming, since it is most of what working with real robot code *is*. Here is the robot's API in full:

```text
robot.read_wall_sensor(Direction.UP)   is that side a wall? -> True / False
robot.drive(Direction.RIGHT)           drive one cell that way (does nothing if walled)
robot.facing()                         the Direction it last drove
robot.at_goal()                        standing on the goal (red) cell?
robot.row, robot.col                   where it is now
```

`Direction` is the four ways the robot can face or move: `Direction.UP`, `Direction.DOWN`, `Direction.LEFT`, `Direction.RIGHT`. Each direction also knows how to turn with `.clockwise()`, `.counter_clockwise()`, and `.opposite()`. Two things are worth noting before you use the robot:

- `read_wall_sensor(direction)` reports a **wall**: it returns `True` when that side is *blocked*. An *opening* is when it returns `False`.
- `drive(direction)` respects the walls: if you aim it at a wall, the robot stays put. When it *does* move, it remembers that direction, so right after `robot.drive(Direction.UP)`, `robot.facing()` is `Direction.UP`. A robot that just drove up is now facing up.

Here is the robot doing those things. The top part includes a compact copy of `maze_solver` so the snippet runs on its own. Read the code at the bottom, predict the output, then press **Run**:

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

    def facing(self):
        return self._facing

    def at_goal(self):
        return self.row == self._maze.rows - 1 and self.col == self._maze.cols - 1

class GridMaze:
    def __init__(self, grid):
        self._grid = grid
        self.rows = len(grid)
        self.cols = len(grid[0])

    def robot(self):
        return Robot(self)

# --- your code ---
grid = [
    [4, 12, 12, 12, 10],
    [6, 12, 10, 6, 9],
    [5, 10, 3, 3, 2],
    [6, 9, 3, 5, 11],
    [5, 8, 5, 12, 9],
]
maze = GridMaze(grid)
robot = maze.robot()

# What is around the robot at the start?
print("Wall above me? ", robot.read_wall_sensor(Direction.UP))
print("Wall to right? ", robot.read_wall_sensor(Direction.RIGHT))

# Drive one cell to the right, then look again.
robot.drive(Direction.RIGHT)
print(f"Drove right. Now at row {robot.row}, col {robot.col}")
print("Facing:", robot.facing())
```

At the start the robot is boxed in on every side except the right, which is why the start cell's number was `4`. Try changing that first `drive` to `Direction.UP` (into a wall) and re-run: the robot does not move, because the drivetrain cannot push through a wall.

# Build a helper: try_move

Look at the two abilities together and a small annoyance appears. To *safely* move in a direction, you always do the same two-step dance: **check the sensor, and only drive if it is open.** Drive without checking and you might grind into a wall.

That pattern, "move that way *if you can*, and tell me whether you did", is worth bottling into one function of your own. Call it `try_move`:

```text
try_move(robot, direction):
    if that side is NOT a wall:
        drive that way
        return True    (yes, I moved)
    otherwise:
        return False   (no, blocked)
```

It is only a few lines, and writing it is the exercise: you are turning the raw API into a tool shaped like the way you think about the problem. Here it is in code. **Read the body of `try_move` and make sure you can explain each line.** Then, to really learn it, delete the body and rewrite it from the pseudocode above without looking.

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

    def facing(self):
        return self._facing

    def at_goal(self):
        return self.row == self._maze.rows - 1 and self.col == self._maze.cols - 1

class GridMaze:
    def __init__(self, grid):
        self._grid = grid
        self.rows = len(grid)
        self.cols = len(grid[0])

    def robot(self):
        return Robot(self)

# --- your code ---
# Drive one step in direction if that side is open; report whether we moved.
def try_move(robot, direction):
    if not robot.read_wall_sensor(direction):  # not a wall -> there is an opening
        robot.drive(direction)
        return True
    return False

grid = [
    [4, 12, 12, 12, 10],
    [6, 12, 10, 6, 9],
    [5, 10, 3, 3, 2],
    [6, 9, 3, 5, 11],
    [5, 8, 5, 12, 9],
]
maze = GridMaze(grid)
robot = maze.robot()

# Try each direction once and report what happened.
to_try = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT]
for direction in to_try:
    moved = try_move(robot, direction)
    print(f"try_move {direction.name} -> {moved}   (now at row {robot.row}, col {robot.col})")
```

Run it and read the trace: `UP` and `DOWN` are walls, so `try_move` returns `False` and the robot holds its position with no crashing into walls. `RIGHT` is open, so the robot steps to column 1, and then `LEFT` steps back to column 0.

You now have a robot you understand and one helper of your own. That is everything you need to write a *real* maze-solving algorithm in the next lesson.
