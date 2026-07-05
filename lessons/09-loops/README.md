---
title: "Lesson 9: Loops in code"
goal: "Repeat steps in Python with for and while instead of copying lines."
order: 9
section: "Python Fundamentals"
---

# Repeat, in text

In [lesson 3](#/lesson/03-loops) the **repeat** block did a step over and over so you didn't have to
copy it out by hand. Python's version is the **`for` loop**:

```python
for i in range(5):
    print("Go team!")
```

`range(5)` means "five times," and the indented line is the step that repeats —
the same indentation rule you learned for `if`. Run it: "Go team!" prints five
times from one instruction. Change `5` to `3`, or to `10`, and watch the count
follow.

The `i` is a variable that holds **which time around you are** — it counts `0`,
`1`, `2`, `3`, `4` (programmers start counting at zero). You can use it:

```python
for i in range(5):
    print("This is loop number", i)
```

Run that and watch `i` climb. It's the loop handing you the "which step" value on
every pass, free of charge.

# A running total

The real power of [lesson 3's](#/lesson/03-loops) repeat block was the **running total** — a value it
remembered and updated each time around. You build that yourself in a `for` loop
by combining it with a variable ([lesson 6](#/lesson/06-variables)):

```python
total = 0
for i in range(5):
    total = total + 3
    print("So far:", total)
print("Final total:", total)
```

Trace it: `total` starts at `0`, and each pass adds `3`, so it climbs `3`, `6`,
`9`, `12`, `15` — the exact sequence the "repeat +" block produced. The pattern
is *set a starting value before the loop, update it inside the loop.* That's how
many identical steps add up to one answer.

Try it yourself: change the starting value, the `range`, or the amount you add.
Then make a **multiplying** total — start at `1` and do `total = total * 2` each
pass — and check you get `1`, `2`, `4`, `8`, `16`, just like the "repeat ×"
block.

# When you don't know the count: while

A `for` loop repeats a **known** number of times. But sometimes you need to keep
going *until something happens*, and you don't know how many steps that'll take.
That's a **`while` loop**: it repeats as long as a question stays true.

```python
countdown = 5
while countdown > 0:
    print(countdown)
    countdown = countdown - 1
print("Liftoff!")
```

Each time around, Python re-checks `countdown > 0`. As long as it's true, it runs
the indented steps; the moment it's false, the loop stops and the program moves
on. Here we count `5, 4, 3, 2, 1` and then lift off. Notice the loop **changes
the thing it's checking** (`countdown` shrinks each pass) — that's essential.

If a `while` loop never changes its condition, it runs **forever** — an "infinite
loop," the most common beginner bug. Delete the `countdown = countdown - 1` line
in your head and you'll see why: `countdown` would stay `5` and the question
would never turn false.

Your turn: write a `while` loop that starts a `total` at `1`, **doubles** it each
pass, and keeps going *while* `total < 100`. Print `total` each time. What's the
first value it prints that's past 100?
