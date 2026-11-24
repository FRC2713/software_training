---
title: "Lambdas"
goal: "Write one-line lambda functions, pass functions as key arguments and callbacks, and know when to use def instead."
order: 310
section: "Advanced Python"
---

# A lambda: a one-line function

A **`lambda`** is a tiny, unnamed function you can write inline on a single line. Here is the simplest kind, one that answers a yes/no question:

```python
ready = lambda: True
print(ready())
```

Run it and `True` prints. Read `lambda: True` as *"takes no arguments, returns `True`"*. The part before the colon lists the parameters (empty here), and the expression after the colon is what gets returned. No `return` keyword is needed.

The expression after the colon runs fresh every time you call the lambda, and lambdas can take parameters just like a normal function:

```python
ready = lambda: True
not_ready = lambda: False
fast_enough = lambda rpm: rpm >= 4500.0

print(ready())
print(not_ready())
print(fast_enough(4800.0))
print(fast_enough(2000.0))
```

Run it: `True`, `False`, `True`, `False`.

In practice, you rarely assign a `lambda` to a variable name like `fast_enough = ...` in real Python code. If a function deserves a name, `def` is cleaner and easier to debug. Lambdas exist for the places where you want to pass a tiny throwaway function directly into *another* function.

# Passing functions as arguments: key=...

In Python, functions are ordinary values, just like numbers or strings. That means you can pass a function into another function as an argument.

One of the most common places you'll see this is sorting with `key=`. Suppose you have a list of robot motors as `(name, rpm)` tuples and want to sort them by RPM instead of alphabetically by name:

```python
motors = [("intake", 1200), ("shooter", 4800), ("climber", 600)]

by_rpm = sorted(motors, key=lambda motor: motor[1])
print(by_rpm)
```

Run it. `sorted()` calls your lambda once for each item in `motors`, gets back `motor[1]` (the RPM), and sorts the list by those numbers. Without `lambda`, you'd have to write a separate `def get_rpm(motor): ...` just to use it once.

The same `key=` pattern works with `min()` and `max()`, and you can pass a regular `def` function whenever the logic is clearer with a name:

```python
motors = [
    {"name": "intake", "rpm": 1200},
    {"name": "shooter", "rpm": 4800},
    {"name": "climber", "rpm": 600},
]

fastest = max(motors, key=lambda motor: motor["rpm"])
print(fastest["name"], fastest["rpm"])
```

Run it and `shooter 4800` prints. `max()` doesn't know what a motor dictionary looks like; your lambda tells it which number to compare.

# Callbacks: handing behavior to another function

You can write your own functions that accept other functions as parameters, often called **callbacks**. Instead of handing a function a number or a string, you hand it *behavior*:

```python
from collections.abc import Callable


def check_sensor(sensor: Callable[[], bool]) -> None:
    if sensor():
        print("piece detected!")
    else:
        print("nothing there")


check_sensor(lambda: True)
check_sensor(lambda: False)
check_sensor(lambda: 12 > 10)
```

`Callable[[], bool]` is the type hint for "a function that takes no arguments and returns a `bool`." `check_sensor` doesn't know or care *how* `sensor` decides. It just calls `sensor()` once and reacts with the `if` from [lesson {n}](#/lesson/09-if-statements).

A function can also take a callback that just *does* something, returning `None`:

```python
from collections.abc import Callable


def do_twice(action: Callable[[], None]) -> None:
    action()
    action()


do_twice(lambda: print("intake spinning"))
do_twice(lambda: print("shooter spinning"))
```

Run it, and each line prints twice. `do_twice` doesn't know what `action` does, only that it can call `action()`.

Now combine both ideas, a condition callback and an action callback:

```python
from collections.abc import Callable


def run_if_ready(ready: Callable[[], bool], action: Callable[[], None]) -> None:
    if ready():
        action()
    else:
        print("not ready yet")


run_if_ready(lambda: True, lambda: print("fire!"))
run_if_ready(lambda: False, lambda: print("fire!"))
```

Run it. The first call is ready, so `action()` runs and prints `fire!`. The second isn't, so `action` never runs at all. This is the exact shape WPILib's `Trigger` and `cmd.run(lambda: ...)` use in FRC robot code: a short lambda standing in for "the thing to check" or "the thing to do," handed to code that decides *when* to run it.

One rule of thumb: reach for `lambda` when the body is a single short expression. The moment it needs two steps, an `if` statement, or a descriptive name, write a regular `def` function and pass its name (without parentheses) as the callback instead.

Your turn: write a function `describe(check: Callable[[], bool]) -> None` that prints `"ready"` or `"not ready"` depending on `check()`. Call it three times with three different lambdas: one always `True`, one always `False`, and one that computes its answer from a comparison you make up (like `7 > 3`).
