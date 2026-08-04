---
title: "Finding the shortest path (A*)"
goal: "Meet A* — the algorithm that finds the shortest path, not just any path. Model the maze as a graph, score each step with cost-so-far plus a heuristic, drive a real PriorityQueue frontier, and watch your own A* beat the wall follower out of a freshly generated maze."
order: 350
section: "Advanced Java"
---

# When "it works" isn't good enough

Back in the Algorithms section you wrote a **wall follower**: keep your right
hand on the wall, and you'll eventually stumble out of any maze. It works — but
watch it run and you'll see it do a lot of *wandering*. It ducks into dead ends,
backs out, hugs walls that lead nowhere, and only reaches the goal because it
refuses to give up. It finds *a* path. It does not find the *shortest* one.

For a robot on a field with a shot clock, the difference matters. "Reaches the
goal" and "reaches the goal in the fewest moves" are two different problems, and
the second one needs a smarter idea.

That idea is **A\*** (say "A-star"), one of the most widely used pathfinding
algorithms there is — it's behind the routes in navigation apps and the enemies
in video games. The wall follower was *reactive*: it only ever looked at the one
cell it was standing in. A\* is a **planner**: it studies the whole map first,
works out the shortest route from start to goal, and only then starts driving.

The core trick is simple to say. At every moment A\* is holding a set of
partly-explored routes, and it always extends **the one that looks most
promising**. "Most promising" is the whole game, and A\* scores it with two
numbers added together:

```text
f  =  g  +  h

g = the cost to get HERE from the start   (steps we've actually taken — a fact)
h = a guess of the cost from HERE to goal  (the "heuristic" — an estimate)
```

`g` is what a route has already cost. `h` is a hunch about what's left. Their sum
`f` is A\*'s best estimate of the *total* length of a route that goes through this
cell. Always expanding the smallest `f` means A\* pours its effort into routes
that are both cheap so far **and** heading the right way — never wasting time
exploring backwards, the way the wall follower does.

Over the next two pages we'll turn each piece into Java: the map into a graph,
`h` into a formula, and "always take the smallest `f`" into a `PriorityQueue`.
Then you'll write A\* yourself and race it against the wall follower.

# The maze as a graph

To *plan* a route, A\* needs to see the whole map at once — not just the cell the
robot is standing in. So the first move is to stop thinking about the maze as a
picture and start thinking about it as a **graph**: a set of **nodes** connected
by **edges**.

- Each **cell** is a node.
- Wherever two neighbouring cells have **no wall** between them, there's an
  **edge** — a legal one-cell step.
- Every edge costs the same: **1 step**.

That's it. "Find the shortest path through the maze" becomes "find the fewest
edges from the start node to the goal node." And unlike the wall follower's robot,
which could only feel the walls of its current cell, a planner gets random access
to the entire map. In this lesson's playground your method is handed the whole
`Maze`:

```text
maze.rows(), maze.cols()        → the grid size
maze.cellAt(row, col)           → any cell you want, by coordinates
maze.cellAt(r, c).wall(dir)     → is there a wall on that side? (true = wall)
```

`maze.cellAt(r, c).wall(Direction.UP)` is how you discover the edges: if that's
`false`, there's no wall, so `(r, c)` connects to the cell above it.

### The heuristic: a good guess about what's left

The `g` in `f = g + h` is easy — it's just how many steps you've counted so far.
The interesting half is `h`, the guess about the distance still to go. In a grid
the natural guess is the **Manhattan distance**: how many rows plus how many
columns away the goal is, *pretending the walls aren't there.*

```text
h(r, c) = |r - goalRow| + |c - goalCol|
```

Why pretend there are no walls? Because a heuristic has one job: it must **never
over-estimate** the real distance. Walls can only ever make the true path
*longer* than the wall-free guess, so Manhattan distance is always a safe
under-estimate. A heuristic that never over-estimates is called **admissible**,
and admissibility is exactly the property that guarantees A\* returns a genuinely
shortest path rather than a merely-pretty-good one.

### The frontier is a priority queue

"Always expand the route with the smallest `f`" is a job for a data structure
that hands you its smallest element on demand: a **`PriorityQueue`**. You add
cells to it in any order; when you `poll()`, you always get the one with the best
(lowest) `f`. That's the beating heart of A\*, and you can watch it work on its
own right here:

```java
// A* keeps a "frontier" of cells it could explore next, and always takes the
// most promising one first: the smallest f = g + h.
//   g = steps already taken to reach a cell
//   h = the heuristic — a guess of how many steps are still to go
// Here each cell is just an {g, h} pair; the queue orders them by f = g + h.
PriorityQueue<int[]> frontier =
    new PriorityQueue<>((a, b) -> (a[0] + a[1]) - (b[0] + b[1]));

frontier.add(new int[] { 3, 5 }); // f = 8
frontier.add(new int[] { 1, 2 }); // f = 3  <-- most promising
frontier.add(new int[] { 2, 4 }); // f = 6

// They come back out cheapest-f first, no matter what order they went in.
while (!frontier.isEmpty()) {
    int[] cell = frontier.poll();
    System.out.println("explore a cell with f = " + (cell[0] + cell[1]));
}
```

Run it: even though `f = 3` went in second, it comes out first, then `6`, then
`8`. A\* will lean on exactly this — a frontier that always surrenders its most
promising cell — to march toward the goal without wandering. On the next page you
wire it into the real maze.

# A* in code

Here's the whole algorithm. It's longer than the wall follower, but every line is
one of the pieces you just met: a `g` score per cell, a `cameFrom` trail so you
can rebuild the route, a `PriorityQueue` frontier ordered by `f = g + h`, and the
Manhattan heuristic. Read it top to bottom before you run it.

```text
void solve(Maze maze, Robot robot) {
    int rows = maze.rows(), cols = maze.cols();
    int goalR = rows - 1, goalC = cols - 1;      // goal is the bottom-right cell

    int[][] g = new int[rows][cols];             // cheapest steps to reach each cell
    int[][] cameFrom = new int[rows][cols];      // which cell we arrived from
    for (int[] row : g) Arrays.fill(row, Integer.MAX_VALUE);
    for (int[] row : cameFrom) Arrays.fill(row, -1);
    g[0][0] = 0;                                  // start costs nothing to reach

    // Frontier entries are {row, col, f}, ordered smallest-f first.
    PriorityQueue<int[]> frontier = new PriorityQueue<>((a, b) -> a[2] - b[2]);
    frontier.add(new int[] { 0, 0, heuristic(0, 0, goalR, goalC) });

    while (!frontier.isEmpty()) {
        int[] cur = frontier.poll();             // the most promising cell so far
        int r = cur[0], c = cur[1];
        if (r == goalR && c == goalC) break;     // reached the goal — stop

        Cell cell = maze.cellAt(r, c);
        for (Direction dir : Direction.values()) {
            if (cell.wall(dir)) continue;        // no edge through a wall
            ... step to the neighbour in dir ...
            int tentative = g[r][c] + 1;         // one more step than here
            if (tentative < g[nr][nc]) {         // found a cheaper way in?
                g[nr][nc] = tentative;
                cameFrom[nr][nc] = r * cols + c; // remember how we got here
                frontier.add(new int[] { nr, nc, tentative + heuristic(...) });
            }
        }
    }
    ... follow cameFrom back from the goal, then drive the robot along it ...
}
```

The shape is always the same: **poll** the best cell, look at its open neighbours,
and for each one ask "is the path *through me* cheaper than any route you'd found
before?" If so, record the cheaper cost, remember the step in `cameFrom`, and drop
the neighbour back into the frontier with its new `f`. When the goal finally comes
out of the queue, `cameFrom` holds a breadcrumb trail you can walk backwards to
reconstruct the shortest route — then drive it.

Now the real thing. The editor below is pre-loaded with a **complete, working
A\*** — the code above, filled in. Run it first and watch the robot walk a clean,
direct line to the goal, no wandering. Then make it yours:

- **Race it.** Note how many cells A\*'s path is. Open the wall follower lesson in
  another tab, run it on a maze, and compare — A\* is never longer, usually much
  shorter.
- **Sabotage the heuristic.** Change `heuristic` to `return 0;`. It still finds
  the shortest path (now it's plain Dijkstra / breadth-first search) — but with no
  hunch about *which way* the goal is, it explores far more cells to get there.
- **Over-estimate on purpose.** Multiply the heuristic by 5. Now A\* over-trusts
  its guess, charges greedily at the goal, and can return a path that *isn't* the
  shortest — a live demonstration of why admissibility matters.
- Add a `System.out.println(...)` inside the loop to print each cell as it's
  expanded, and watch the search order in the output below.

```maze
solver: astar
```
