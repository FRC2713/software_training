---
title: "Dictionaries"
goal: "Store values under names you choose instead of numbered positions, and look them up by those names."
order: 140
section: "Data Structures"
---

# Labels instead of positions

A list is great when order is all you need. But `motors[2]` does not tell you
*which* motor that is. You just have to remember that position 2 is the intake.
It is much clearer to write `motor_speeds["intake"]`.

That is a **dictionary** (`dict`): a group of values where each one is filed
under a **label you pick**, called a **key**, instead of a numbered position.
You write a dictionary with curly braces and `key: value` pairs:

```python
motor_speeds = {
    "intake": 0.8,
    "shooter": 1.0,
    "climber": 0.5,
}
print(motor_speeds["shooter"])
print(motor_speeds["intake"])
```

Here the keys are strings (`"intake"`, `"shooter"`, `"climber"`) and the values
are floats from [lesson {n}](#/lesson/08-numbers-and-text). Looking up
`motor_speeds["shooter"]` hands back `1.0`. It reads like plain English, and you
never have to memorize which slot is which. Dictionaries are a natural fit for
**robot configuration**, where settings live under names you will still
recognize six months later.

Ask for a key that does not exist with square brackets, like
`motor_speeds["drive"]`, and Python stops with a `KeyError`. If a key might be
missing, use `.get(...)` instead: `motor_speeds.get("drive")` returns `None`,
Python's value for "nothing here." You can also pass a fallback value, like
`motor_speeds.get("drive", 0.0)`, which returns `0.0` when `"drive"` is missing.

# Reading, changing, adding

You change a value the same way you update a list slot, using its key in square
brackets:

```python
config = {"max_speed": 3.0, "ramp_time": 0.25}
config["max_speed"] = 4.5
print(config["max_speed"])
```

Assigning to a key that **does not exist yet** adds a new entry. The same syntax
does both jobs:

```python
config = {"max_speed": 3.0}
config["shooter_speed"] = 1.0
print(config)
```

`config` started with one entry and now has two. To check whether a key exists
before you look it up, use `in` or `.get(...)`:

```python
config = {"max_speed": 3.0}
print("max_speed" in config)
print("shooter" in config)
print(config.get("shooter", 0.0))
```

That prints `True`, `False`, and `0.0`. Checking with `in` or providing a
default with `.get(...)` keeps missing keys from crashing your program.

# Looping over a dictionary

Like a list in [lesson {n}](#/lesson/12-arrays), you can walk through a
dictionary with a `for` loop. Call `.items()` to get each key and its matching
value together:

```python
motor_speeds = {
    "intake": 0.8,
    "shooter": 1.0,
    "climber": 0.5,
}

for name, speed in motor_speeds.items():
    print(f"{name} runs at {speed}")
```

Each pass fills `name` with the key and `speed` with the value, giving you a
clean report of the whole config in two lines. This is how you dump every
setting on a robot to the console before a match. Python dictionaries also
remember the order you added keys, so the output stays predictable.

Your turn: build a dictionary called `sensors` with three named readings:
`"front"` at `12.0`, `"left"` at `30.0`, and `"back"` at `8.0`. Loop over
`sensors.items()` and print a warning line only for sensors reading **below 10**
(an `if` inside the `for` again). A dictionary, a loop, and a condition working
together is what real programs look like.
