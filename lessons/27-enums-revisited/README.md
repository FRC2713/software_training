---
title: "Enums, revisited"
goal: "Loop over every member of an Enum, and give each member its own attributes and methods."
order: 270
section: "Advanced Python"
---

# Every value an enum can hold

You've had `HandlerState` since [lesson {n}](#/lesson/23-organizing-a-machine), four fixed states and nothing else legal. Here is a trick you haven't seen yet: in Python, an `Enum` class is directly iterable, so you can loop over **every member it has**.

```python
from enum import Enum


class HandlerState(Enum):
    EMPTY = "empty"
    INTAKING = "intaking"
    LOADED = "loaded"
    SHOOTING = "shooting"


for state in HandlerState:
    print(state.name)
```

Run it. All four states print in the order they were declared. Looping directly over `HandlerState` works just like looping over a list from [lesson {n}](#/lesson/12-arrays), and you can even write `list(HandlerState)` if you need an actual list. If you add a fifth state to the enum later, this loop picks it up automatically. A hand-written list would silently miss it.

# Giving an enum attributes and methods

So far an enum member has only been a name and a simple value. Because a Python `Enum` is a real class, each member can also carry its **own attributes** and **methods**, just like `Flywheel` in [lesson {n}](#/lesson/17-classes-and-objects).

Suppose every `HandlerState` knows the motor speed it should run at, plus a method that reports whether the motor is spinning:

```python
from enum import Enum


class HandlerState(Enum):
    EMPTY = 0.0
    INTAKING = 0.5
    LOADED = 0.0
    SHOOTING = 1.0

    def __init__(self, motor_speed: float) -> None:
        self.motor_speed = motor_speed

    def is_spinning(self) -> bool:
        return self.motor_speed > 0.0


for state in HandlerState:
    print(f"{state.name} -> speed={state.motor_speed}, spinning={state.is_spinning()}")
```

Run it. Each member passes its value into `__init__` when the class is defined. `INTAKING = 0.5` sets `self.motor_speed = 0.5` on `HandlerState.INTAKING`, and `SHOOTING = 1.0` sets `self.motor_speed = 1.0` on `HandlerState.SHOOTING`. Wait, look closely at `EMPTY` and `LOADED` in that output!

Did `LOADED` disappear from the loop? Yes! In Python, if two enum members have the exact same value (`0.0`), Python treats the second one (`LOADED`) as an **alias** for the first (`EMPTY`) instead of a distinct state. When two states share a speed, give each member a tuple with a unique name or ID, or a second field:

```python
from enum import Enum


class HandlerState(Enum):
    EMPTY = ("empty", 0.0)
    INTAKING = ("intaking", 0.5)
    LOADED = ("loaded", 0.0)
    SHOOTING = ("shooting", 1.0)

    def __init__(self, label: str, motor_speed: float) -> None:
        self.label = label
        self.motor_speed = motor_speed

    def is_spinning(self) -> bool:
        return self.motor_speed > 0.0


for state in HandlerState:
    print(f"{state.name} -> speed={state.motor_speed}, spinning={state.is_spinning()}")
```

Run that second snippet. Now all four states are distinct, Python unpacks the tuple into `__init__(self, label, motor_speed)` automatically, and every state carries both its own speed and the `is_spinning()` method.

This is the real shape of state-specific setpoints in FRC code: one enum, one speed per state, and no separate lookup table to keep in sync.

**A word of caution, though.** An enum's job is to name a **small, closed set of options** for a decision. `HandlerState` works because there are four clear states and every one of them matters to `update()`. One or two fields like `motor_speed` still serve that job. It is tempting to keep piling more attributes onto an enum once you see it hold one, like a third number, a timeout, and a sensor flag. The moment a member needs a pile of fields, or the list grows past what you can hold in your head at once, you have stopped modeling *a choice* and started modeling *a small database*. A regular `class` ([lesson {n}](#/lesson/17-classes-and-objects)) or a `dict` ([lesson {n}](#/lesson/14-maps)) fits that much better. Keep enum members focused on naming the options.

Your turn: add a fifth state, `JAMMED = ("jammed", 0.0)`, to `HandlerState`. Loop over `HandlerState` again and print each state's name, `motor_speed`, and `is_spinning()`. Confirm your new state shows up automatically without changing a single line of the loop.
