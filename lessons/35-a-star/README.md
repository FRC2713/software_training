---
title: "Finding the shortest path (A*)"
goal: "Use A* to find the shortest path through a maze by modeling it as a graph, scoring steps with cost-so-far plus a heuristic, and driving a heapq priority queue."
order: 350
section: "Advanced Python"
---

# When "it works" isn't good enough

Back in the Algorithms section you wrote a **wall follower**: keep your right
hand on the wall, and you'll eventually stumble out of any maze. It works, but
watch it run and you'll see it do a lot of *wandering*. It ducks into dead
ends, backs out, hugs walls that lead nowhere, and only reaches the goal
because it refuses to give up. It finds *a* path. It does not find the
*shortest* one.

For a robot on an FRC field with a 15-second autonomous clock, the difference matters. "Reaches the
scoring zone" and "reaches the scoring zone in the fewest moves" are two different problems,
and the second one needs a smarter idea.

That idea is **A\*** (say "A-star"), one of the most widely used pathfinding
algorithms in software. It powers routes in navigation apps and enemies in
video games. The wall follower was *reactive*: it only ever looked at the one
cell it was standing in. A\* is a **planner**: it studies the whole map first,
works out the shortest route from start to goal, and only then starts driving.

The core trick is simple to say. At every moment A\* holds a set of
partly-explored routes, and it always extends **the one that looks most
promising**. "Most promising" is the whole game, and A\* scores it with two
numbers added together:

```text
f  =  g  +  h

g = the cost to get HERE from the start   (steps we've actually taken, a fact)
h = a guess of the cost from HERE to goal (the "heuristic", an estimate)
```

`g` is what a route has already cost. `h` is a hunch about what's left. Their
sum `f` is A\*'s best estimate of the *total* length of a route that goes
through this cell. Always expanding the smallest `f` means A\* pours its effort
into routes that are both cheap so far **and** heading the right way, instead
of wasting time exploring backwards the way the wall follower does.

Over the next two pages we'll turn each piece into Python: the map into a
graph, `h` into a formula, and "always take the smallest `f`" into a `heapq`
priority queue. Then you'll write A\* yourself and race it against the wall
follower.

# The maze as a graph

To *plan* a route, A\* needs to see the whole map at once, not just the cell
the robot is standing in. So the first move is to stop thinking about the maze
as a picture and start thinking about it as a **graph**: a set of **nodes**
connected by **edges**.

- Each **cell** is a node.
- Wherever two neighbouring cells have **no wall** between them, there's an
  **edge**, a legal one-cell step.
- Every edge costs the same: **1 step**.

That's it. "Find the shortest path through the maze" becomes "find the fewest
edges from the start node to the goal node." Unlike the wall follower's robot,
which could only feel the walls of its current cell, a planner gets random
access to the entire map. In this lesson's playground your function is handed
the whole `maze`:

```text
maze.rows, maze.cols              -> the grid size
maze.cell_at(row, col)            -> any cell you want, by coordinates
maze.cell_at(r, c).wall(dir)      -> is there a wall on that side? (True = wall)
dir.delta()                       -> (dr, dc) step for that direction
```

`maze.cell_at(r, c).wall(Direction.UP)` is how you discover the edges: if
that's `False`, there's no wall, so `(r, c)` connects to the cell above it.

### The heuristic: a good guess about what's left

The `g` in `f = g + h` is easy, because it's just how many steps you've counted
so far. The interesting half is `h`, the guess about the distance still to go.
In a grid the natural guess is the **Manhattan distance**: how many rows plus
how many columns away the goal is, *pretending the walls aren't there.*

```text
h(r, c) = abs(r - goal_r) + abs(c - goal_c)
```

Why pretend there are no walls? Because a heuristic has one job: it must
**never over-estimate** the real distance. Walls can only ever make the true
path *longer* than the wall-free guess, so Manhattan distance is always a safe
under-estimate. A heuristic that never over-estimates is called **admissible**,
and admissibility is the property that guarantees A\* returns a genuinely
shortest path rather than a merely-pretty-good one.

### The frontier is a priority queue

"Always expand the route with the smallest `f`" is a job for a data structure
that hands you its smallest element on demand: a **priority queue**. In Python,
the standard library module **`heapq`** turns a regular list into one. You push
tuples with `heapq.heappush(frontier, item)`, and `heapq.heappop(frontier)`
always hands back the smallest tuple. Because Python compares tuples by their
first element, putting `f = g + h` first means `heappop` always picks the
lowest `f`. Watch it work on its own right here:

```python
import heapq

# A* keeps a "frontier" of cells it could explore next, and always takes the
# most promising one first: the smallest f = g + h.
#   g = steps already taken to reach a cell
#   h = the heuristic, a guess of how many steps are still to go
# Putting f first in each (f, g, h) tuple makes heapq return the smallest f.
frontier: list[tuple[int, int, int]] = []

for g, h in [(3, 5), (1, 2), (2, 4)]:
    heapq.heappush(frontier, (g + h, g, h))

# They come back out cheapest-f first, no matter what order they went in.
while frontier:
    f, g, h = heapq.heappop(frontier)
    print(f"explore a cell with f = {f} (g={g}, h={h})")
```

Run it. Even though `f = 3` went in second, it comes out first, then `6`, then
`8`. A\* leans on this exact trick, a frontier that always hands over its most
promising cell, to march toward the goal without wandering. On the next page
you wire it into the real maze.

# A* in code

Here's the whole algorithm. It's longer than the wall follower, but every line
is one of the pieces you just met: a `g` score per cell, a `came_from` trail so
you can rebuild the route, a `heapq` frontier ordered by `f = g + h`, and the
Manhattan heuristic. Read it top to bottom before you run it.

```text
def solve(maze, robot):
    rows, cols = maze.rows, maze.cols
    goal_r, goal_c = rows - 1, cols - 1           # goal is the bottom-right cell

    g = {(0, 0): 0}                               # cheapest steps to reach each cell
    came_from = {}                                # (r, c) -> (prev_r, prev_c, direction)

    # Frontier entries are (f, r, c), ordered smallest-f first.
    frontier = [(heuristic(0, 0, goal_r, goal_c), 0, 0)]

    while frontier:
        _, r, c = heapq.heappop(frontier)         # the most promising cell so far
        if (r, c) == (goal_r, goal_c):
            break                                 # reached the goal, stop

        cell = maze.cell_at(r, c)
        for direction in Direction:
            if cell.wall(direction):
                continue                          # no edge through a wall
            dr, dc = direction.delta()
            nr, nc = r + dr, c + dc
            tentative = g[(r, c)] + 1             # one more step than here
            if tentative < g.get((nr, nc), math.inf):
                g[(nr, nc)] = tentative
                came_from[(nr, nc)] = (r, c, direction)
                f = tentative + heuristic(nr, nc, goal_r, goal_c)
                heapq.heappush(frontier, (f, nr, nc))

    # Follow came_from back from the goal, reverse the steps,
    # then drive the robot with robot.drive(direction).
```

The shape is always the same: **pop** the best cell, look at its open
neighbours, and for each one ask "is the path *through me* cheaper than any
route you'd found before?" If so, record the cheaper cost, remember the step in
`came_from`, and push the neighbour onto the frontier with its new `f`. When
the goal finally comes out of the queue, `came_from` holds a breadcrumb trail
you can walk backwards to reconstruct the shortest route, then drive it with
`robot.drive(direction)`.

Now the real thing. The editor below is pre-loaded with a **complete, working
A\***, the code above filled in. Run it first and watch the robot walk a clean,
direct line to the goal with no wandering. Then make it yours:

- **Race it.** Note how many cells A\*'s path is. Open the wall follower lesson
  in another tab, run it on a maze, and compare. A\* is never longer and is
  usually much shorter.
- **Sabotage the heuristic.** Change `heuristic` to `return 0`. It still finds
  the shortest path (now it's plain Dijkstra / breadth-first search), but with
  no hunch about *which way* the goal is, it explores far more cells to get
  there.
- **Over-estimate on purpose.** Multiply the heuristic by 5. Now A\*
  over-trusts its guess, charges greedily at the goal, and can return a path
  that *isn't* the shortest, a live demonstration of why admissibility matters.
- Add a `print(...)` inside the loop to print each cell as it's expanded, and
  watch the search order in the output below.

```maze
solver: python-astar
```
