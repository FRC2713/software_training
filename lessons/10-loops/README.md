---
title: "Loops in code"
goal: "Repeat steps in Python with for and while instead of copying lines."
order: 100
section: "Python Fundamentals"
---

# Repeat, in text

In [lesson {n}](#/lesson/03-loops) the **repeat** block did a step over and over so you didn't have to copy it out by hand. Python's version is the **`for` loop**, and it comes with a built-in counter. Meet the counter first:

```python
for i in range(5):
    print(f"This is loop number {i}")
```

Read the header in three pieces:

- **`range(5)`** generates five numbers starting at `0`: `0`, `1`, `2`, `3`, `4`.
- **`i`** is the counter variable. On each pass, Python puts the next number from `range(5)` into `i`.
- **The colon `:` and indented lines** hold the steps that repeat, just like `if` in [lesson {n}](#/lesson/09-if-statements).

Run it and watch `i` climb: `0`, `1`, `2`, `3`, `4`. That's five passes, and the loop hands you the "which time around am I?" number on every one. Programmers start counting at zero; you'll see why it's handy in [lesson {n}](#/lesson/12-arrays).

Once the counting makes sense, put the loop to work: change `range(5)` to `range(3)`, then `range(10)`, and watch the count follow. Then swap the print line for `print("Go team!")`. Same loop, only now it repeats a message five times. You don't have to *use* `i` for the loop to do its job of repeating.

# A running total

The real power of [lesson {n}'s](#/lesson/03-loops) repeat block was the **running total**, a value it remembered and updated each time around. You build that yourself in a `for` loop by combining it with a variable ([lesson {n}](#/lesson/07-variables)):

```python
total = 0
for i in range(5):
    total = total + 3
    print(f"So far: {total}")
print(f"Final total: {total}")
```

Trace it: `total` starts at `0`, and each pass adds `3`, so it climbs `3`, `6`, `9`, `12`, `15`, the exact sequence the "repeat +" block produced. The pattern is *set a starting value before the loop, then update it inside the loop.* Notice `print(f"Final total: {total}")` is not indented, so it runs once after the loop finishes.

Try it yourself: change the starting value, the loop count, or the amount you add. Then make a **multiplying** total. Start at `1` and do `total = total * 2` each pass, and check that you get `2`, `4`, `8`, `16`, `32`, just like the "repeat ×" block.

# When you don't know the count: while

A `for` loop repeats a **known** number of times. Sometimes you need to keep going *until something happens*, and you don't know how many steps that will take. That's a **`while` loop**: it repeats as long as a question stays true.

```python
countdown = 5
while countdown > 0:
    print(countdown)
    countdown = countdown - 1
print("Liftoff!")
```

Each time around, Python re-checks `countdown > 0`. As long as it's true, Python runs the indented steps; the moment it's false, the loop stops and the program moves on. Here we count `5, 4, 3, 2, 1` and then lift off. Notice the loop **changes the thing it's checking** (`countdown` shrinks each pass). That part is essential.

If a `while` loop never changes its condition, it runs **forever**, an "infinite loop," which is the most common beginner bug. Picture deleting `countdown = countdown - 1`: `countdown` would stay `5` and the question would never turn false.

Your turn: write a `while` loop that starts a `total` at `1`, **doubles** it each pass, and keeps going *while* `total < 100`. Print `total` each time. What's the first value it prints that's past 100?
