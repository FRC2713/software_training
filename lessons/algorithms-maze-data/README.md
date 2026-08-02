---
title: "The maze as data"
goal: "See a maze the way a program does — a grid of numbers — and learn to read a 2D array (an array of arrays) with maze[row][col], the shape almost every robot's-eye view of the field takes."
order: 196
section: "Algorithms"
---

# A maze is just a grid of numbers

You've driven the maze by hand and watched three robots cross it. Now for the
move that lets a *computer* do it: seeing the maze as **data** — plain numbers a
program can hold in a variable.

Back in the [Arrays](/lesson/12-arrays) lesson, an array was a row of boxes: a
single line of values, one after another. A maze isn't a single row, though —
it's a **grid**, with rows *and* columns. So we reach for the natural next step:
an array **whose elements are themselves arrays**. One array holds the rows;
each row is an array of cells. That's a **2D array**, and in Java its type is
`int[][]` — "an array of `int` arrays."

Here's a small 5×5 maze written exactly that way:

```java
int[][] maze = {
    {4, 12, 12, 12, 10},
    {6, 12, 10, 6, 9},
    {5, 10, 3, 3, 2},
    {6, 9, 3, 5, 11},
    {5, 8, 5, 12, 9}
};

System.out.println("The maze has " + maze.length + " rows.");
System.out.println("Row 0 has " + maze[0].length + " columns.");
```

Read it top to bottom and it lays out as five rows of five cells — the same shape
as the mazes you've been crossing. The outer `{ }` holds the whole maze; each
inner `{ }` is one row. `maze.length` is the number of rows; `maze[0].length` is
how many columns are in the first row. Press **Run** and check those counts.

# Reaching one cell: maze[row][col]

A single index reached into a plain array — `scores[2]` was the third score. A
2D array takes **two** indices, in a fixed order that's worth burning into
memory: **row first, then column.**

```java
int[][] maze = {
    {4, 12, 12, 12, 10},
    {6, 12, 10, 6, 9},
    {5, 10, 3, 3, 2},
    {6, 9, 3, 5, 11},
    {5, 8, 5, 12, 9}
};

// maze[row][col] — row first, then column. Both start counting at 0.
System.out.println("Top-left cell:     " + maze[0][0]);
System.out.println("Top-right cell:    " + maze[0][4]);
System.out.println("Bottom-right cell: " + maze[4][4]);
System.out.println("Middle cell:       " + maze[2][2]);
```

`maze[0][0]` is the **start** (top-left — the green cell in the maze pictures).
`maze[4][4]` is the **goal** (bottom-right, the red cell) — the last row, the
last column.
Row `0` is the top and column `0` is the left, so as the row index grows you move
*down* and as the column index grows you move *right*. Getting `[row][col]` the
right way round is the single most common place people trip: `maze[4][0]` is the
bottom-left cell, but `maze[0][4]` is the top-right — swap them and you're in a
completely different corner.

# Walking the whole grid

To *look at every cell*, you nest one loop inside another: the outer loop walks
the rows, the inner loop walks the columns of that row. This double loop is the
bread-and-butter way to touch every square of a grid, and you'll write it
constantly.

```java
int[][] maze = {
    {4, 12, 12, 12, 10},
    {6, 12, 10, 6, 9},
    {5, 10, 3, 3, 2},
    {6, 9, 3, 5, 11},
    {5, 8, 5, 12, 9}
};

for (int row = 0; row < maze.length; row++) {
    for (int col = 0; col < maze[row].length; col++) {
        System.out.print(maze[row][col] + "\t");
    }
    System.out.println(); // newline at the end of each row
}
```

Run it and the output is the maze laid back out as a grid — because the loops
visit the cells in exactly the order they're stored: all of row 0 left to right,
then all of row 1, and so on.

## What do the numbers *mean*?

Fair question — why is the start cell a `4` and the goal a `9`? Each number packs
in **which sides of that cell are open** (carved through) versus walled. The
start cell is `4`, which happens to mean "only the right side is open" — which
fits: the green start cell has just one way out, to the right.

Here's the good news, and it's the whole point of the next lesson: **you will
never do that decoding by hand.** Squeezing four walls into one number is a
clever trick, but it's a distraction from actually *solving* the maze. So instead
of asking you to do bit-by-bit arithmetic on these values, we'll hand the grid to
a small **library** that reads it for you and gives you a friendly robot to
drive. The maze stays this same `int[][]` — that's how it travels between the
website and your Java code — but from here on you get to think in *"is there a
wall to my right?"*, not in numbers.
