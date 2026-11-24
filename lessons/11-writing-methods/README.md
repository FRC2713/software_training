---
title: "Writing your own functions"
goal: "Package steps into a named function and hand back a result with return."
order: 110
section: "Python Fundamentals"
---

# Packaging steps with def

Since [lesson {n}](#/lesson/06-hello-world), every script you wrote ran straight from top to bottom. Now you're ready to build reusable blocks of your own, just like the custom blocks in [lesson {n}](#/lesson/04-functions). In Python, a reusable block of code is called a **function**, and you create one with **`def`**:

```python
def say_hello():
    print("Hello from inside a function!")

say_hello()
say_hello()
```

Two parts to spot:

- **`def say_hello():`** defines a function named `say_hello`. The indented lines underneath are the steps inside it.
- **`say_hello()`** calls the function, telling Python to run those indented steps.

Defining a function doesn't run it; it just teaches Python the block exists. It only does its work when you *call* it, and you can call it as many times as you need. Later, in [lesson {n}](#/lesson/17-classes-and-objects), you'll also put functions inside classes, where they're called methods.

Run it and notice the message prints twice from one function definition.

# Define a block of your own

[Lesson {n}](#/lesson/04-functions) gave you a **double** block with a little flowchart hidden inside that you could drop in wherever you needed it. Here is that same block in Python:

```python
def double_it(n):
    return n * 2

print(double_it(5))
```

Read the function piece by piece:

- `def double_it(n):` names a new function `double_it` that takes one input, `n` (the arrow feeding into the block).
- `return n * 2` is the flowchart *inside* the block: it works out the answer and **hands it back** with `return`.
- `double_it(5)` **calls** the function. Python runs those inner steps with `n` set to `5`, and `double_it(5)` evaluates to `10`.

Run this, then change `5` and run again: same block, different input, just like [lesson {n}](#/lesson/04-functions).

The `n` is called a **parameter**, a placeholder that gets filled in with whatever value you pass when you call the function. A function can take more than one:

```python
def add(a, b):
    return a + b

print(add(2, 3))
```

Add `add` next to `double_it` in the editor above and call `add(2, 3)` inside `print(...)`.

# Order matters (again)

[Lesson {n}](#/lesson/04-functions) ended with the big idea that **order matters**: `add 1` then `double` gave a different answer than `double` then `add 1`. Let's prove it in code with two functions of your own:

```python
def add_one(n):
    return n + 1

def double_it(n):
    return n * 2

print(double_it(add_one(4)))
print(add_one(double_it(4)))
```

Trace the first print line from the inside out: `add_one(4)` is `5`, then `double_it(5)` is `10`. The second line: `double_it(4)` is `8`, then `add_one(8)` is `9`. Same two blocks, same starting number, **different order, different answer**, matching the [lesson-4](#/lesson/04-functions) result.

Run it and confirm you get `10` then `9`.

Your challenge: write a function `square(n)` that returns `n * n`, then use it together with `add_one` to compute **`(4 + 1)` squared**. Predict the answer before you run, and watch your call order, because `square(add_one(4))` and `add_one(square(4))` are *not* the same.
