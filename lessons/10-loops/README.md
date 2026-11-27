---
title: "Loops in code"
goal: "Repeat steps in Python with for and while instead of copying lines."
order: 100
section: "Python Fundamentals"
---

# Repeat, in text

In [lesson {n}](#/lesson/03-loops) the **repeat** block ramped a drive motor without copying boxes by hand. Python's version is the **`for` loop**, and it comes with a built-in counter. Meet the counter first:

```python
for i in range(5):
    print(f"Control loop tick {i}")
```

Read the header in three pieces:

- **`range(5)`** generates five numbers starting at `0`: `0`, `1`, `2`, `3`, `4`.
- **`i`** is the counter variable. On each pass, Python puts the next number from `range(5)` into `i`.
- **The colon `:` and indented lines** hold the steps that repeat, just like `if` in [lesson {n}](#/lesson/09-if-statements).

Run it and watch `i` climb: `0`, `1`, `2`, `3`, `4`. That's five passes, and the loop hands you the "which tick am I on?" number on every one. Programmers start counting at zero; you'll see why it's handy in [lesson {n}](#/lesson/12-arrays).

Once the counting makes sense, put the loop to work: change `range(5)` to `range(3)`, then `range(10)`, and watch the count follow. Then swap the print line for `print("Checking sensors...")`. Same loop, only now it repeats a robot check five times. You don't have to *use* `i` for the loop to do its job of repeating.

# A running total

The real power of [lesson {n}'s](#/lesson/03-loops) repeat block was the **running total**, a value the robot remembered and updated each time around. Here our robot scores five 3-point game pieces in a row, tracking its score with a `for` loop and a variable ([lesson {n}](#/lesson/07-variables)):

```python
total = 0
for i in range(5):
    total = total + 3
    print(f"Score so far: {total}")
print(f"Final score: {total}")
```

Trace it: `total` starts at `0`, and each pass adds `3`, so it climbs `3`, `6`, `9`, `12`, `15`, the exact sequence the "repeat +" block produced. The pattern is *set a starting value before the loop, then update it inside the loop.* Notice `print(f"Final score: {total}")` is not indented, so it runs once after the loop finishes.

Try it yourself: change the starting value, the loop count, or the points per piece. Then build a **multiplying** total for a flywheel spin-up. Start at `1` and do `total = total * 2` each pass, and check that you get `2`, `4`, `8`, `16`, `32`, just like the "repeat ×" block.

# When you don't know the count: while

A `for` loop repeats a **known** number of times. Sometimes a robot needs to keep going *until something happens*, and you don't know how many ticks that will take. That's a **`while` loop**: it repeats as long as a question stays true.

```python
countdown = 5
while countdown > 0:
    print(countdown)
    countdown = countdown - 1
print("Autonomous start!")
```

Each time around, Python re-checks `countdown > 0`. As long as it's true, Python runs the indented steps; the moment it's false, the loop stops and the match begins. Here we count `5, 4, 3, 2, 1` and then launch autonomous. Notice the loop **changes the thing it's checking** (`countdown` shrinks each pass). That part is essential.

If a `while` loop never changes its condition, it runs **forever**, an "infinite loop," which is the most common beginner bug. Picture deleting `countdown = countdown - 1`: `countdown` would stay `5` and the question would never turn false.

Your turn: write a `while` loop that ramps a flywheel's `power` starting at `1`, **doubles** it each pass, and keeps going *while* `power < 100`. Print `power` each time. What's the first value it prints that's past 100?
