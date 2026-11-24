---
title: "The maze as data"
goal: "See a maze the way a program does, as a grid of numbers, and learn to read a 2D list with maze[row][col]."
order: 196
section: "Algorithms"
---

# A maze is just a grid of numbers

You have driven the maze by hand and watched three robots cross it. Now for the move that lets a *computer* do it: seeing the maze as **data**, plain numbers a program can hold in a variable.

Back in the [Arrays](/lesson/12-arrays) lesson, a list was a row of boxes, a single line of values one after another. A maze is not a single row, though. It is a **grid**, with rows *and* columns. So we reach for the natural next step: a list **whose elements are themselves lists**. One outer list holds the rows, and each row is a list of cells. That is a **2D list**, and in Python its type hint is `list[list[int]]`, a list of `int` lists.

Here is a small 5x5 maze written that way:

```python
maze: list[list[int]] = [
    [4, 12, 12, 12, 10],
    [6, 12, 10, 6, 9],
    [5, 10, 3, 3, 2],
    [6, 9, 3, 5, 11],
    [5, 8, 5, 12, 9],
]

print(f"The maze has {len(maze)} rows.")
print(f"Row 0 has {len(maze[0])} columns.")
```

Read it top to bottom and it lays out as five rows of five cells, the same shape as the mazes you have been crossing. The outer `[ ]` holds the whole maze, and each inner `[ ]` is one row. `len(maze)` is the number of rows, and `len(maze[0])` is how many columns are in the first row. Press **Run** and check those counts.

# Reaching one cell: maze[row][col]

A single index reached into a flat list: `scores[2]` was the third score. A 2D list takes **two** indices, in a fixed order worth memorizing: **row first, then column.**

```python
maze = [
    [4, 12, 12, 12, 10],
    [6, 12, 10, 6, 9],
    [5, 10, 3, 3, 2],
    [6, 9, 3, 5, 11],
    [5, 8, 5, 12, 9],
]

# maze[row][col]: row first, then column. Both start counting at 0.
print("Top-left cell:    ", maze[0][0])
print("Top-right cell:   ", maze[0][4])
print("Bottom-right cell:", maze[4][4])
print("Middle cell:      ", maze[2][2])
```

`maze[0][0]` is the **start** (top-left, the green cell in the maze pictures). `maze[4][4]` is the **goal** (bottom-right, the red cell), the last row and the last column. Row `0` is the top and column `0` is the left, so as the row index grows you move *down*, and as the column index grows you move *right*. Getting `[row][col]` the right way round is the most common place people trip: `maze[4][0]` is the bottom-left cell, while `maze[0][4]` is the top-right. Swap them and you are in a completely different corner.

# Walking the whole grid

To *look at every cell*, nest one loop inside another. The outer loop walks the rows, and the inner loop walks the columns of that row. This double loop is the standard way to touch every square of a grid, and you will write it often.

```python
maze = [
    [4, 12, 12, 12, 10],
    [6, 12, 10, 6, 9],
    [5, 10, 3, 3, 2],
    [6, 9, 3, 5, 11],
    [5, 8, 5, 12, 9],
]

for row in range(len(maze)):
    for col in range(len(maze[row])):
        print(maze[row][col], end="\t")
    print()  # newline at the end of each row
```

Run it and the output is the maze laid back out as a grid, because the loops visit the cells in the exact order they are stored: all of row 0 left to right, then all of row 1, and so on.

## What do the numbers *mean*?

Why is the start cell a `4` and the goal a `9`? Each number is a **bitmask** that packs in **which sides of that cell are open** versus walled:

- `1` means **up** is open
- `2` means **down** is open
- `4` means **right** is open
- `8` means **left** is open

To store multiple open sides in one number, add their values together. The start cell is `4`, meaning only the right side is open. The goal cell is `9` (`1 + 8`), meaning up and left are open. You can test a single bit in Python with `&`, like `(cell & 4) != 0`.

Here is the good news, and it is the whole point of the next lesson: **you will never do that decoding by hand.** Squeezing four walls into one number is a neat trick, but it is a distraction from actually *solving* the maze. Instead of doing bit arithmetic on these values, we hand the grid to a small **library** that reads it for you and gives you a friendly robot to drive. The maze stays this same `list[list[int]]`, since that is how it travels between the website and your Python code, and from here on you get to think in *"is there a wall to my right?"*, not in numbers.
