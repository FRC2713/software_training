---
title: "Growing and changing lists"
goal: "Build lists while a program runs, add and remove items, and pull out slices."
order: 130
section: "Data Structures"
---

# Building a list as you go

In [last lesson](#/lesson/12-arrays) you wrote every value in the list up front.
That breaks down the moment you do not know the count ahead of time. How many
game pieces will your robot score this match? You do not know until the match is
over.

Python lists can start **empty** (`[]`) and grow one item at a time with
`.append(...)`:

```python
scores = []
scores.append(10)
scores.append(25)
scores.append(15)
print(scores)
print(len(scores))
```

Run it. `scores` starts with zero items, and each `.append(...)` tacks a new
value onto the end. `print(scores)` shows `[10, 25, 15]`, and `len(scores)` is
`3`.

This shines inside a loop. You can walk through one list and build a brand-new
list with only the values you want to keep:

```python
readings = [12, 47, 3, 88, 21]
high_readings = []
for reading in readings:
    if reading > 20:
        high_readings.append(reading)
print(high_readings)
```

Start with an empty list before the loop, then append inside the `if`. You will
use this pattern all the time to filter sensor data or collect match events.

# Removing items with pop and remove

Python gives you two main ways to take items out of a list. When you know the
**position** you want to remove, use `.pop(index)`. It deletes that slot, shifts
everything after it down, and hands the removed value back to you:

```python
scores = [10, 25, 15]
dropped = scores.pop(1)
print(dropped)
print(scores)
```

That prints `25`, then `[10, 15]`. Indexes still start at **0**, same rule as
[lesson {n}](#/lesson/12-arrays). If you call `scores.pop()` with nothing inside
the parentheses, it removes and returns the **last** item.

When you know the **value** you want gone instead of its position, use
`.remove(value)`:

```python
sides = ["front", "left", "back", "right"]
sides.remove("back")
print(sides)
```

`.remove(...)` finds the first matching item and deletes it. If the value is not
in the list, Python stops with a `ValueError`, so make sure it is there first.

# Slicing and checking membership

Sometimes you want a chunk of a list rather than a single item. **Slicing** uses
a colon inside the brackets, `scores[start:stop]`, to copy from `start` up to
(but not including) `stop`, just like `range` in
[lesson {n}](#/lesson/10-loops):

```python
scores = [10, 25, 15, 40, 30]
print(scores[1:4])
print(scores[:2])
print(scores[3:])
```

`scores[1:4]` grabs indexes `1`, `2`, and `3`, giving `[25, 15, 40]`. Leave out
the first number (`scores[:2]`) to start from the beginning. Leave out the
second number (`scores[3:]`) to go all the way to the end. Slicing always makes
a new list and leaves `scores` untouched.

One more handy check: `in` asks whether a value appears anywhere in the list,
without writing a loop yourself:

```python
scores = [10, 25, 15]
print(25 in scores)
print(99 in scores)
```

That prints `True`, then `False`.

Your turn: start with an empty list called `climb_times`, then use `.append(...)`
to add four made-up times in seconds. Remove the **slowest** one using
`.remove(...)` or `.pop(...)`, then loop over what is left and print the
**average** of the remaining times.
