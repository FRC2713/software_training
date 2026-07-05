---
title: "Lesson 10: Writing your own functions"
goal: "Package steps into a named function with def and hand back a result with return."
order: 10
section: "Python Fundamentals"
---

# Define a block of your own

[Lesson 4](#/lesson/04-functions) gave you reusable blocks — a **double** block with a little flowchart
hidden inside, that you could drop in wherever you needed it. Now you'll build
one yourself. In Python you create a reusable block with **`def`** (short for
"define"):

```python
def double(x):
    return x * 2

print(double(5))
```

Read it piece by piece:

- `def double(x):` names a new function `double` that takes one input, `x` — the
  arrow feeding into the block.
- The indented `return x * 2` is the flowchart *inside* the block: it works out
  the answer and **hands it back** with `return`.
- `double(5)` **calls** the function — it runs that inner flowchart with `x` set
  to `5`, and the whole `double(5)` becomes the value `10`.

Defining a function doesn't run it; it just teaches Python the block exists. It
only does its work when you *call* it. Run this, then change `5` and run again —
same block, different input, just like [lesson 4](#/lesson/04-functions).

# Define once, use many times

The reason functions are worth it, same as [lesson 4](#/lesson/04-functions): **build it once, use it as
often as you like.** Each call runs the same inner steps with whatever input you
give it.

```python
def double(x):
    return x * 2

print(double(3))
print(double(10))
print(double(3) + double(4))
```

The one `def` gets used four times over. That last line is worth pausing on:
Python works out `double(3)` (→ `6`) and `double(4)` (→ `8`) **first**, then adds
them to get `14` — inputs before the things that use them, the rule from [the very
first lesson](#/lesson/01-flowcharts).

The `x` is called a **parameter** — a placeholder that gets filled in with
whatever value you pass when you call. `double(3)` fills `x` with `3` for that one
run; `double(10)` fills it with `10` for another. The block doesn't care what
number shows up; it just doubles it.

A function can take more than one input, too. Try adding this and calling it:

```python
def add(a, b):
    return a + b

print(add(2, 3))
```

# Order matters (again)

[Lesson 4](#/lesson/04-functions) ended with the big idea that **order matters**: `add 1` then `double`
gave a different answer than `double` then `add 1`. Let's prove it in code with
two functions of your own:

```python
def add_one(x):
    return x + 1

def double(x):
    return x * 2

print(double(add_one(4)))
print(add_one(double(4)))
```

Trace the first line from the inside out: `add_one(4)` is `5`, then `double(5)`
is `10`. The second line: `double(4)` is `8`, then `add_one(8)` is `9`. Same two
blocks, same starting number, **different order, different answer** — exactly the
[lesson-4](#/lesson/04-functions) result, now in text.

Run it and confirm you get `10` then `9`.

Your challenge: write a function `square(x)` that returns `x * x`, then use it
together with `add_one` to compute **`(4 + 1) squared`**. Predict the answer
before you run — and watch your call order, because `square(add_one(4))` and
`add_one(square(4))` are *not* the same.
