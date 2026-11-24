---
title: "Classes and objects"
goal: "Bundle related data and the actions on it into one class you can create instances from."
order: 170
section: "Objects"
---

# When data and actions belong together

Picture the robot's intake. It has **data**, like a motor speed and whether it is holding a game piece, and **actions**, like start, stop, and check if it is loaded. So far you would scatter that across loose variables and standalone functions and hope you kept them straight. As a robot grows to a dozen mechanisms, that falls apart fast.

A **class** is Python's way to bundle related data and actions into one thing. It is a **blueprint**. From it you stamp out **objects** (also called *instances*). This is how real robot code is written. WPILib gives you a `Subsystem` class for each mechanism: an `Intake`, an `Elevator`, a `Drivetrain`. Learn this and you are reading the shape of actual robot code.

```python
class Intake:
    speed = 0.0
    has_piece = False

intake = Intake()
print(intake.speed)
print(intake.has_piece)
```

`class Intake:` declares the blueprint with two attributes for the data it holds. `Intake()` stamps out one actual intake object. `intake.speed` reaches inside that object for a stored value. Run it and you have built your first object, starting at `0.0` and `False`.

# The constructor: giving a new object its starting values

Relying on shared class defaults is a trap. If two intakes exist, each one needs its own starting values set on purpose. A **constructor**, named `__init__` in Python, runs automatically the moment you create an object with `Intake()`, and its job is to set those starting values:

```python
class Intake:
    def __init__(self):
        self.speed = 0.0
        self.has_piece = False

intake = Intake()
print(intake.speed)
print(intake.has_piece)
```

Two pieces are worth naming:

- **`def __init__(self):`** is the constructor. Calling `Intake()` runs it automatically.
- **`self`** is *the object being built right now*. `self.speed = 0.0` means "*this particular intake's* speed starts at `0.0`." Every value stored on `self` becomes part of that object and sticks around after `__init__` finishes.

Same output as before, but now every intake gets its own clean starting state.

# Methods: the actions

Data on its own is only half of it. A function defined **inside** a class, with `self` as its first parameter, is a **method**. It is an action the object performs **on its own data**, reached through `self`:

```python
class Intake:
    def __init__(self):
        self.speed = 0.0
        self.has_piece = False

    def start(self):
        self.speed = 0.8
        self.has_piece = True

    def stop(self):
        self.speed = 0.0

    def report(self):
        print(f"speed: {self.speed} | holding: {self.has_piece}")

intake = Intake()
intake.report()
intake.start()
intake.report()
intake.stop()
intake.report()
```

You call a method with `intake.start()`, using the same dot as an attribute, now with parentheses because it is an action. Python passes `intake` in as `self` for you. Trace the output: speed `0.0` and not holding, then `start()` flips both, then `stop()` zeroes the speed. The object carries its own state between calls while you tell it what to do.

That is the whole idea: **an object is data and the actions on that data, kept together.** `intake.start()` reads like a command to a real mechanism, which is why robot code is built this way.

Your turn: write a `Shooter` class. In `__init__`, set `self.rpm = 0` and `self.ready = False`. Add a `spin_up(self)` method that sets `self.rpm` to `5000` and `self.ready` to `True`, and a `fire(self)` method that prints `"Fired!"` **only if** `self.ready` is `True` (an `if` inside a method, from [lesson {n}](#/lesson/09-if-statements), works here too). Make one, try calling `fire()` before spinning up, then call `spin_up()` and `fire()` for real.
