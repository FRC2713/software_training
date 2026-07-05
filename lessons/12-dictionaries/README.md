---
title: "Lesson 12: Dictionaries"
goal: "Store values under names you choose instead of numbered positions, and look them up by those names."
order: 12
section: "Python Fundamentals"
---

# Labels instead of positions

A list is great when order is all you need. But `motors[2]` doesn't tell you
*what* motor that is — you just have to remember that position 2 is the intake.
Wouldn't it be nicer to say `motors["intake"]`?

That's a **dictionary**: a group of values where each one is filed under a
**label you pick** (called a **key**) instead of a numbered position. You write
it with curly braces and `key: value` pairs.

```python
motor_speeds = {"intake": 0.8, "shooter": 1.0, "climber": 0.5}
print(motor_speeds["shooter"])
print(motor_speeds["intake"])
```

You look a value up by its key, in square brackets — `motor_speeds["shooter"]`
hands back `1.0`. It reads like plain English, and you never have to remember
which position is which. A dictionary is perfect for **robot configuration**:
settings filed under names you'll recognize six months from now.

The keys are usually text, and the values can be anything — numbers, text, even
lists. Ask for a key that isn't there (`motor_speeds["drive"]`) and Python
crashes with a `KeyError`, its way of saying "no such label."

# Reading, changing, adding

You change a value the same way you'd change a variable or a list item — assign
to the key:

```python
config = {"team": 2713, "max_speed": 3.0, "enabled": False}
config["max_speed"] = 4.5
print(config["max_speed"])
```

And here's a difference from lists: assigning to a key that **doesn't exist yet**
doesn't crash — it *adds* a new entry. Same syntax does double duty:

```python
config = {"team": 2713, "max_speed": 3.0}
config["enabled"] = True
print(config)
```

`config` started with two entries and now has three. To check whether a key
exists before you reach for it — avoiding that `KeyError` — ask with `in`:

```python
config = {"team": 2713, "max_speed": 3.0}
print("team" in config)
print("shooter" in config)
```

That prints `True` then `False`. It's the safe way to look before you leap.

# Looping over a dictionary

Like a list, a dictionary can be walked with a `for` loop — but you usually want
both the key *and* its value each pass. `.items()` hands you both:

```python
motor_speeds = {"intake": 0.8, "shooter": 1.0, "climber": 0.5}
for name, speed in motor_speeds.items():
    print(name, "runs at", speed)
```

Each pass fills *two* variables — `name` with the key, `speed` with the value —
so you can print a tidy report of the whole config in three lines. This is how
you'd dump every setting on the robot to the console to check it before a match.

Your turn: build a dictionary called `sensors` with three named readings, e.g.
`{"front": 12, "left": 30, "back": 8}`. Then loop over it with `.items()` and
print a warning line only for sensors reading **below 10** (an `if` inside the
`for` again). Which combination from the last few lessons is this? A dictionary,
a loop, and a condition working together — that's what real programs look like.
