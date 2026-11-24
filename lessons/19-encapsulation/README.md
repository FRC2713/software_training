---
title: "Encapsulation"
goal: "Hide an object's internal attributes behind public methods so outside code cannot force it into a broken state."
order: 190
section: "Objects"
---

# The problem with public attributes

Every attribute you have written so far has been reachable from anywhere, just by naming it: `intake.speed = ...`. That is convenient, and also a trap. Nothing stops outside code from setting an attribute to something the object was never designed to hold:

```python
class Flywheel:
    def __init__(self):
        self.rpm = 0.0

flywheel = Flywheel()
flywheel.rpm = -500.0
print(flywheel.rpm)
```

Run it. Python lets `rpm` go negative without a complaint, because nothing about the attribute says it cannot. A real flywheel cannot spin at `-500` RPM. That is not a valid setting, it is a bug waiting to reach the motor controller. The object's own methods would never do that to it. The danger is code **outside** the class reaching in directly.

# Private attributes, public methods

The fix is to mark the attribute as **private** by starting its name with an underscore (`_rpm`), and offer public methods as the *only* door in:

```python
class Flywheel:
    def __init__(self):
        self._rpm = 0.0

    def set_rpm(self, target):
        if target < 0.0:
            self._rpm = 0.0
        else:
            self._rpm = target

    def get_rpm(self):
        return self._rpm

flywheel = Flywheel()
flywheel.set_rpm(-500.0)
print(flywheel.get_rpm())
flywheel.set_rpm(4500.0)
print(flywheel.get_rpm())
```

In Python, a leading underscore like `_rpm` tells every reader and tool: "this belongs to `Flywheel` alone, do not touch it from outside." The intended way in is `set_rpm`, and `set_rpm` **refuses** the bad value instead of storing it. Run it: the first call clamps to `0.0`, and the second sets a real value. The object is now in charge of protecting its own rules.

# Designing the public interface

Every class you write is a decision about **what is public and what is private**, meaning what the rest of the program is allowed to do to this object versus the bookkeeping it never needs to see. A good rule of thumb: attributes are almost always private (prefixed with `_`), and methods are public **only** if calling code actually needs them.

```python
class Flywheel:
    def __init__(self):
        self._rpm = 0.0
        self._spinning = False

    def spin_up(self):
        self._rpm = 5000.0
        self._spinning = True

    def stop(self):
        self._rpm = 0.0
        self._spinning = False

    def is_ready(self):
        return self._spinning and self._rpm >= 4500.0

flywheel = Flywheel()
print(flywheel.is_ready())
flywheel.spin_up()
print(flywheel.is_ready())
```

Nothing outside `Flywheel` touches `_rpm` or `_spinning` directly. Calling code asks for `spin_up()`, `stop()`, or `is_ready()` and lets the object manage its own numbers. That is the shape of real WPILib subsystem code: a small, honest set of public actions guarding private details.

Your turn: write a `Climber` class with private attributes `_height_inches` and `_at_top`. Give it a public `extend(self, amount)` method that adds `amount` to `_height_inches` but never lets it go **above `60.0`** (clamp it, the way `set_rpm` did), setting `_at_top` to `True` when it reaches `60.0`. Add a `get_height(self)` method, try extending past the top in one big jump, and confirm it stops at `60.0` instead of sailing over.
