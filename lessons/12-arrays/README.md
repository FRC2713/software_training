---
title: "Lists"
goal: "Hold many values in one place, reach any of them by position, and walk through them with a loop."
order: 120
section: "Data Structures"
---

# One name, many values

Every variable your robot has used so far held a *single* value: one score, one
voltage, one name. In a real match, a robot deals in **groups**, like the five
sensor readings on its chassis, the names of everyone on the drive team, or the
points scored in each match. Python holds a group in a **list**: values inside
square brackets, separated by commas.

```python
readings = [12, 47, 3, 88, 21]
print(len(readings))
print(readings)
```

`readings` is *one* variable holding *five* numbers. `len(readings)` tells you
how many items are inside. Run it and you will see `5`, followed by the full
list `[12, 47, 3, 88, 21]`. A list can hold text too, like
`sides = ["front", "back", "left", "right"]`.

Instead of juggling five separate names like `reading1`, `reading2`, `reading3`,
`reading4`, and `reading5`, you keep one name for the whole batch. That is the
whole idea of a list.

# Reaching one item

You pull a single value out of a list by its **position**, written in square
brackets after the name. Python counts positions starting from **0**, not 1,
following the same "programmers start at zero" rule from
[lesson {n}](#/lesson/10-loops).

```python
readings = [12, 47, 3, 88, 21]
print(readings[0])
print(readings[1])
print(readings[4])
```

So `readings[0]` is the **first** item (`12`), `readings[1]` is the second
(`47`), and `readings[4]` is the fifth and last (`21`). That number in brackets
is called the **index**. Python also lets you count backward from the end with
negative numbers, so `readings[-1]` grabs the last item (`21`).

Because forward counting starts at zero, the last positive index is always
`len(readings) - 1`, never `len(readings)`. Ask for `readings[5]` and Python
stops with an `IndexError: list index out of range`. There is no sixth item.
Try it, read the error message, and then change it back.

You can also *change* an item by assigning to its position, just like a regular
variable:

```python
readings = [12, 47, 3, 88, 21]
readings[0] = 99
print(readings)
```

# Walking the whole list

[Lesson {n}'s](#/lesson/10-loops) `for` loop counted with `range(...)`. A `for`
loop can also walk straight through a list, handing you each item one pass at a
time:

```python
scores = [10, 25, 5, 40]
for score in scores:
    print(f"We scored {score}")
```

No indexes, no manual counting. The loop visits every item in order. Read the
header like English: "for each `score` in `scores`, print it." Run it and you
get one line per match.

Now combine it with the **running total** from [lesson {n}](#/lesson/10-loops)
to add a list up:

```python
scores = [10, 25, 5, 40]
total = 0
for score in scores:
    total = total + score
print(f"Total points: {total}")
```

Same pattern as before. Start a total *before* the loop and update it *inside*.

## Fixed sequences: tuples

Sometimes you have a small group of values that should never change, like an
`(x, y)` field position or an RGB color. Python calls that a **tuple**, written
with parentheses instead of square brackets: `position = (3.5, 1.2)`. You can
index it with `position[0]` and check `len(position)` just like a list, but
trying to change a slot with `position[0] = 5.0` raises a `TypeError`. Use a
list when the items can change, and a tuple when they are fixed.

[Next lesson](#/lesson/13-arraylists) shows how to grow, shrink, and slice lists
while a program runs.

Your turn: make a list of five sensor `readings`, then loop through and print
only the ones **above 20** (combining [lesson {n}](#/lesson/09-if-statements)
and [lesson {n}](#/lesson/12-arrays)). Then use the running-total pattern and
`len()` to print the **average**. Predict the answer first, then check.
