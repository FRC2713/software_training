"""Trusted driver executed inside the sandboxed subprocess for maze runs.

Reads the student's solution.py, runs solve(robot) or solve(maze, robot) with
exact solution.py line numbers in tracebacks, and writes the JSON trail to a
dedicated pipe fd so student stdout never collides with the trail payload.
"""

from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from maze_solver import Cell, Direction, GridMaze, Robot  # noqa: E402


def main() -> None:
    solution_path = sys.argv[1]
    grid_path = sys.argv[2]
    mode = sys.argv[3]
    trail_fd = int(sys.argv[4])

    with open(grid_path, "r", encoding="utf-8") as f:
        grid = json.load(f)
    with open(solution_path, "r", encoding="utf-8") as f:
        source = f.read()

    maze = GridMaze(grid)
    robot = maze.robot()

    namespace: dict[str, object] = {
        "__name__": "__main__",
        "__file__": "solution.py",
        "Direction": Direction,
        "Cell": Cell,
        "Robot": Robot,
        "GridMaze": GridMaze,
    }
    compiled = compile(source, "solution.py", "exec")
    exec(compiled, namespace)

    solve_fn = namespace.get("solve")
    if not callable(solve_fn):
        raise RuntimeError(
            "Expected a `solve(maze, robot)` function in your code."
            if mode == "astar"
            else "Expected a `solve(robot)` function in your code."
        )

    if mode == "astar":
        solve_fn(maze, robot)
    else:
        solve_fn(robot)

    # Convert [row, col] to [x, y] = [col, row] for the frontend MazePlayground.
    trail_xy = [[col, row] for row, col in robot.trail()]
    payload = json.dumps(trail_xy).encode("utf-8")
    with os.fdopen(trail_fd, "wb") as out:
        out.write(payload)


if __name__ == "__main__":
    main()
