---
title: "Lesson 11: Lists"
goal: "Hold many values in one place, reach any of them by position, and walk through them with a loop."
order: 11
section: "Python Fundamentals"
---

# One name, many values

Every variable so far has held a *single* value: one number, one string. But
real programs deal in **groups** — the six sensor readings on a robot, the names
of everyone on the drive team, the points scored in each match. Python holds a
group in a **list**: values in square brackets, separated by commas.

```python
readings = [12, 47, 3, 88, 21]
print(readings)
print(len(readings))
```

`readings` is *one* variable holding *five* numbers. `len(...)` ("length") tells
you how many are in there — run it and you'll see `5`. A list can hold text too,
like `["front", "back", "left", "right"]`, and it can be empty: `[]`, a group
with nothing in it yet.

The point: instead of `reading1`, `reading2`, `reading3`, `reading4`,
`reading5` — five names to keep straight — you have one name for the whole
batch. That's the whole idea of a list.

# Reaching one item

You pull a single value out of a list by its **position**, written in square
brackets after the name. And here's the catch that trips up everyone: Python
counts positions starting from **0**, not 1 — the same "programmers start at
zero" rule the loop counter followed back in [lesson 9](#/lesson/09-loops).

```python
readings = [12, 47, 3, 88, 21]
print(readings[0])
print(readings[1])
print(readings[4])
```

So `readings[0]` is the **first** item (`12`), `readings[1]` is the second
(`47`), and `readings[4]` is the fifth and last (`21`). That number in brackets
is called the **index**.

Because counting starts at zero, the last index is always `len - 1`, never
`len`. Ask for `readings[5]` and Python crashes with an "index out of range"
error — there's no sixth item. Try it, read the error, then fix it back. When
you don't want to count, Python lets you reach backwards: `readings[-1]` is the
last item, `readings[-2]` the one before it.

You can also *change* an item by assigning to its position, exactly like a
variable:

```python
readings = [12, 47, 3, 88, 21]
readings[0] = 99
print(readings)
```

# Walking the whole list

[Lesson 9's](#/lesson/09-loops) `for` loop repeated a fixed number of times with `range`. Its real
job is walking a list — handing you each item, one per pass:

```python
scores = [10, 25, 5, 40]
for score in scores:
    print("We scored", score)
```

No indexes, no counting — the loop takes care of visiting every item in order.
Read it out loud: "for each `score` in `scores`, print it." Run it and you get
one line per match.

Now combine it with the **running total** from [lesson 9](#/lesson/09-loops) to add a list up:

```python
scores = [10, 25, 5, 40]
total = 0
for score in scores:
    total = total + score
print("Total points:", total)
```

Same pattern as always — start a total *before* the loop, update it *inside*.
This one's so common Python has a shortcut, `sum(scores)`, but building it by
hand is worth doing once. A list grows, too: `scores.append(15)` sticks a new
value on the end.

Your turn: make a list of five sensor `readings`, then loop through and print
only the ones **above 20** (you'll need an `if` inside the `for` — [lesson 8](#/lesson/08-if-statements) meets
lesson 11). Then use `len(...)` and `sum(...)` to print the **average**. Predict
it first, then check.
