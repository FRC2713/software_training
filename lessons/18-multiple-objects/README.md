---
title: "Multiple objects, one blueprint"
goal: "See that every object made from a class keeps its own independent data, and hold a whole group of them in a list."
order: 180
section: "Objects"
---

# One blueprint, many objects

A class is a blueprint, not a thing by itself, and a robot rarely has just one of anything. Make two objects from the same `Intake` blueprint and each gets its **own copy** of the attributes:

```python
class Intake:
    def __init__(self, name):
        self.name = name
        self.speed = 0.0

    def start(self):
        self.speed = 0.8

left = Intake("left")
right = Intake("right")
left.start()
print(left.name, left.speed)
print(right.name, right.speed)
```

`__init__(self, name)` takes a value in, just like a function parameter ([lesson {n}](#/lesson/11-writing-methods)), and `Intake("left")` fills it in. Run it: `left.start()` sets `left`'s speed to `0.8` and leaves `right` completely untouched at `0.0`. One blueprint, two independent objects, with no way for one to reach into the other's attributes by accident.

# Functions vs. methods: who does it belong to?

Every function you wrote before [lesson {n}](#/lesson/17-classes-and-objects) stood on its own outside a class. Now that objects exist, the difference between a standalone function and a method matters:

```python
class Intake:
    def __init__(self):
        self.speed = 0.0

    def start(self):
        self.speed = 0.8

def double_it(n):
    return n * 2

print(double_it(5))

intake = Intake()
intake.start()
print(intake.speed)
```

`double_it(5)` is called by name alone. It is a standalone function, so it does not belong to any object and has no `self`. `intake.start()` is different: `start` is defined inside `Intake` with `self`, so it belongs to **one object**, and you must have that object (`intake`) to call it. Inside `start`, `self` means that exact object.

# A list of objects

Real robots do not have just one intake. They have a handful of mechanisms, all built from a small number of classes. A Python `list` ([lesson {n}](#/lesson/13-arraylists)) holds objects the same way it holds numbers or strings:

```python
class Intake:
    def __init__(self, name):
        self.name = name
        self.speed = 0.0

    def start(self):
        self.speed = 0.8

intakes = [Intake("front"), Intake("back")]

for intake in intakes:
    intake.start()
    print(intake.name, intake.speed)
```

`intakes` holds whole `Intake` objects instead of numbers. The `for` loop ([lesson {n}](#/lesson/12-arrays)) hands you one object at a time. Each pass, `intake` is a real object, so `intake.start()` and `intake.name` work just as they did above. Run it and watch both mechanisms start independently.

Your turn: give `Intake` a `has_piece` attribute and a `report(self)` method that prints `name`, `speed`, and `has_piece`. Build a list of three intakes, call `start()` on only the second one, then loop over the list calling `report()` on each. Confirm only one shows a nonzero speed.
