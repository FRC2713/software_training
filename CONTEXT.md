# Maze Solver Module

Glossary for the maze-solving module of the FRC 2713 training curriculum — a
series of lessons in which students write Java that solves a maze. This file is
the shared language for that module only; it is not a spec.

## Language

**Maze**:
A fixed puzzle the robot must traverse from Start to Goal. The student's program
is handed the whole maze up front (see _Grid_).

**Grid**:
The god's-eye representation of a Maze the program receives — the entire layout,
known in full before the robot moves, as a rectangular 2D array of Cells. Each
Cell carries its own Wall flags, so the Grid is a `Cell[][]`, not a grid of
blocked/open squares.
_Avoid_: map (reserve "map" for a robot-built model, which this module does not use)

**Cell**:
One square of the Grid — always open and standable. A Cell records a **Wall** on
each of its four sides (up / down / left / right); those flags, not the Cells
themselves, are what block movement. Every Cell is reachable to stand on; what
varies is which of its edges are walled.

**Wall**:
A **thin** barrier on the edge between two adjacent Cells (or on a Cell's outer
edge), blocking movement across that edge. Walls live on edges, not whole Cells:
a Cell is never "a wall". Wall flags are consistent between neighbours — the down
edge of a Cell is the up edge of the Cell below it.

**Robot**:
The thing that traverses the Maze by executing a Solution. It has a position on
the Grid (a Cell) and **no orientation** — it does not face a direction, so every
Move is an absolute step, not a turn. Orientation is a property of the robot's
_interface_, not of every algorithm: a wall-follower may choose to *remember*
which way it last stepped (a `facing` variable it owns), but that state lives in
the algorithm, not the robot — the robot still only ever takes absolute Moves.

**Start**:
The cell where the Robot begins.

**Goal**:
The target cell. A Solution **succeeds** if and only if executing it from Start
leaves the Robot standing on the Goal.

**Solution**:
The ordered sequence of Moves the student's program emits. Success is judged
only by whether it finishes the Maze (reaches the Goal). A Move blocked by a Wall
is not a modeled failure — it simply does nothing; nothing is penalized. The
module is about *finishing*, not collision avoidance.

**Maze Trail**:
The ordered sequence of Cells the Robot has occupied while executing its
Solution, from Start onward. It is the *consequence* of a Solution, not the same
thing: a Solution is the Moves the algorithm emits, whereas the Maze Trail is
where the Robot actually ended up standing after each. A Move blocked by a Wall
adds no Maze Trail entry, so an algorithm that drives into a wall leaves a Trail
that simply stays put there.
_Avoid_: path (ambiguous — could mean the open corridors of the Maze itself)

**Maze Battle**:
The module's finale. A student submits one program; it is scored by how many of a
set of *unseen* Mazes it finishes (a gauntlet), tie-broken by total Moves. The
format rewards a general algorithm (which clears the whole set) over a hard-coded
Solution (which finishes only the one Maze it was written for).

**Move** (also **Command**):
One instruction to the Robot. Exactly four exist: **UP**, **DOWN**, **LEFT**,
**RIGHT** — absolute, screen-relative directions. Each Move steps the Robot
**one Cell** in that direction *if that edge is open*; a Move blocked by a Wall
(or the grid edge) does nothing. There are no turns and no orientation to track.
_Avoid_: turn, heading, facing, North/South/East/West, "drive to the next junction"

**Helper** (injected):
Convenience methods the harness puts in scope so students query the Maze without
hand-indexing Wall flags: `robot.moveUp/moveDown/moveLeft/moveRight()`,
`robot.canGoUp/canGoDown/canGoLeft/canGoRight()`, `robot.atGoal()`,
`robot.row()/col()`, plus god's-eye access to the whole `Cell[][]` grid for route
planning.
