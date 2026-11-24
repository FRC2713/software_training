"""Pure-Python maze solver API matching FRC2713/maze-solver-java CONTRACT.md.

Wire format: grid[row][col] is a bitmask of OPEN sides:
  UP = 1, DOWN = 2, RIGHT = 4, LEFT = 8
Start is (0, 0); goal is (rows - 1, cols - 1).
"""

from __future__ import annotations

from enum import Enum
from typing import Sequence


class Direction(Enum):
    UP = 1
    DOWN = 2
    RIGHT = 4
    LEFT = 8

    def bit(self) -> int:
        return self.value

    def opposite(self) -> "Direction":
        return _OPPOSITE[self]

    def clockwise(self) -> "Direction":
        return _CLOCKWISE[self]

    def counter_clockwise(self) -> "Direction":
        return _COUNTER_CLOCKWISE[self]

    def delta(self) -> tuple[int, int]:
        return _DELTA[self]


_OPPOSITE = {
    Direction.UP: Direction.DOWN,
    Direction.DOWN: Direction.UP,
    Direction.LEFT: Direction.RIGHT,
    Direction.RIGHT: Direction.LEFT,
}

_CLOCKWISE = {
    Direction.UP: Direction.RIGHT,
    Direction.RIGHT: Direction.DOWN,
    Direction.DOWN: Direction.LEFT,
    Direction.LEFT: Direction.UP,
}

_COUNTER_CLOCKWISE = {
    Direction.UP: Direction.LEFT,
    Direction.LEFT: Direction.DOWN,
    Direction.DOWN: Direction.RIGHT,
    Direction.RIGHT: Direction.UP,
}

_DELTA = {
    Direction.UP: (-1, 0),
    Direction.DOWN: (1, 0),
    Direction.LEFT: (0, -1),
    Direction.RIGHT: (0, 1),
}


class Cell:
    def __init__(self, row: int, col: int, mask: int, rows: int, cols: int) -> None:
        self._row = row
        self._col = col
        self._mask = mask
        self._rows = rows
        self._cols = cols

    @property
    def row(self) -> int:
        return self._row

    @property
    def col(self) -> int:
        return self._col

    def wall(self, direction: Direction) -> bool:
        if not isinstance(direction, Direction):
            raise TypeError(f"Expected Direction, got {type(direction).__name__}")
        return (self._mask & direction.bit()) == 0

    def is_start(self) -> bool:
        return self._row == 0 and self._col == 0

    def is_goal(self) -> bool:
        return self._row == self._rows - 1 and self._col == self._cols - 1

    def __repr__(self) -> str:
        return f"Cell(row={self._row}, col={self._col})"


class Robot:
    def __init__(self, maze: "GridMaze") -> None:
        self._maze = maze
        self._row = 0
        self._col = 0
        self._facing = Direction.RIGHT
        self._trail: list[list[int]] = [[0, 0]]

    def read_wall_sensor(self, direction: Direction) -> bool:
        return self.cell().wall(direction)

    def drive(self, direction: Direction) -> None:
        if self.read_wall_sensor(direction):
            return
        dr, dc = direction.delta()
        nr, nc = self._row + dr, self._col + dc
        if 0 <= nr < self._maze.rows and 0 <= nc < self._maze.cols:
            self._row = nr
            self._col = nc
            self._facing = direction
            self._trail.append([nr, nc])

    def facing(self) -> Direction:
        return self._facing

    def at_goal(self) -> bool:
        return self._maze.is_goal_cell(self._row, self._col)

    @property
    def row(self) -> int:
        return self._row

    @property
    def col(self) -> int:
        return self._col

    def cell(self) -> Cell:
        return self._maze.cell_at(self._row, self._col)

    def trail(self) -> list[list[int]]:
        return [list(pair) for pair in self._trail]


class GridMaze:
    def __init__(self, grid: Sequence[Sequence[int]]) -> None:
        if not grid or not grid[0]:
            raise ValueError("Maze grid must be non-empty")
        cols = len(grid[0])
        if any(len(row) != cols for row in grid):
            raise ValueError("Maze grid must be rectangular")
        self._rows = len(grid)
        self._cols = cols
        self._cells = [
            [Cell(r, c, int(grid[r][c]), self._rows, self._cols) for c in range(cols)]
            for r in range(self._rows)
        ]

    @property
    def rows(self) -> int:
        return self._rows

    @property
    def cols(self) -> int:
        return self._cols

    def cell_at(self, row: int, col: int) -> Cell:
        if not (0 <= row < self._rows and 0 <= col < self._cols):
            raise IndexError(f"Cell ({row}, {col}) out of bounds for {self._rows}x{self._cols} maze")
        return self._cells[row][col]

    def robot(self) -> Robot:
        return Robot(self)

    def is_goal_cell(self, row: int, col: int) -> bool:
        return row == self._rows - 1 and col == self._cols - 1
