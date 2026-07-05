---
title: "Lesson 14: Classes and objects"
goal: "Bundle related data and the actions on it into one thing — the way real robot code is organized."
order: 20
section: "Parked (pre-state-machine draft)"
---

# When data and actions belong together

Picture the robot's intake. It has **data** — a motor speed, whether it's
currently holding a game piece — and **actions** — start, stop, check if it's
loaded. So far you'd scatter that across loose variables and functions and hope
you kept them straight. As a robot grows to a dozen mechanisms, that falls apart
fast.

A **class** is Python's way to bundle related data and actions into one thing.
It's a **blueprint**; from it you stamp out **objects** (also called
*instances*). This is not an obscure feature — it is how essentially all real
robot code is written. WPILib, the library FRC robots run on, gives you a
`Subsystem` class for each mechanism: an `Intake`, an `Elevator`, a
`Drivetrain`. Learn this and you're reading the shape of actual robot code.

```python
class Intake:
    def __init__(self):
        self.speed = 0.0
        self.has_piece = False

intake = Intake()
print(intake.speed)
print(intake.has_piece)
```

`class Intake:` declares the blueprint. `intake = Intake()` stamps out one
actual intake object. And `intake.speed` reaches inside it for a value stored on
that object. Run it — you've built your first object.

# __init__ and self

Two pieces of that need unpacking, because they show up in every class you'll
ever write.

- **`__init__`** is a special function that runs automatically the moment you
  create an object with `Intake()`. Its job is **setup** — giving the new object
  its starting data. (The double underscores are just how Python marks it as
  special.)
- **`self`** is the object being set up, right now. `self.speed = 0.0` means
  "*this particular intake's* speed starts at 0." Every value filed on `self`
  becomes part of the object and sticks around.

Because each object gets its own `self`, two objects from the same blueprint
hold their own separate data:

```python
class Intake:
    def __init__(self, name):
        self.name = name
        self.speed = 0.0

left = Intake("left")
right = Intake("right")
left.speed = 0.8
print(left.name, left.speed)
print(right.name, right.speed)
```

One blueprint, two independent objects — changing `left.speed` leaves
`right.speed` untouched. That input `name` is passed in just like a function
parameter ([lesson 10](#/lesson/10-writing-functions)): `Intake("left")` fills it in.

# Methods: the actions

Data on its own is only half of it. A function defined **inside** a class is
called a **method** — an action the object can perform on its own data. Every
method takes `self` first, so it can reach that object's values:

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
        print("speed:", self.speed, "| holding:", self.has_piece)

intake = Intake()
intake.report()
intake.start()
intake.report()
intake.stop()
intake.report()
```

You call a method with `intake.start()` — same dot, now with parentheses because
it's an action. Trace the output: speed `0.0` and not holding, then `start()`
flips both, then `stop()` zeroes the speed. The object carries its own state
between calls; you're just telling it what to do.

That's the whole idea: **an object is data and the actions on that data, kept
together.** `intake.start()` reads like a command to a real mechanism — which is
exactly why robot code is built this way.

Your turn: write a `Shooter` class. In `__init__` give it `self.rpm = 0` and
`self.ready = False`. Add a `spin_up()` method that sets `rpm` to `5000` and
`ready` to `True`, and a `fire()` method that prints `"Fired!"` **only if**
`self.ready` is true (an `if` inside a method — [lesson 8](#/lesson/08-if-statements) lives here too). Make
one, try to `fire()` before spinning up, then `spin_up()` and fire for real.
