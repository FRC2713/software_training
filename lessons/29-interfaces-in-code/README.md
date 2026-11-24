---
title: "Interfaces, in code"
goal: "Write a Protocol as a contract with no body, implement it two ways, and see one function work unchanged against either implementation."
order: 290
section: "Advanced Python"
---

# A contract with no body

[Last lesson](#/lesson/28-interfaces-as-diagrams) you dragged a contract and two implementations around by hand. In Python, you write that contract with **`Protocol`** from the `typing` module. It lists a method's name, parameters, and return type, without saying *how* it works:

```python
from typing import Protocol


class MotorIO(Protocol):
    def get_speed(self) -> float: ...
```

Nothing prints when you run this, because a protocol alone has no behavior. The first real output shows up once a class satisfies it below.

Notice the `...` (three dots) in place of a method body. Like a function header from [lesson {n}](#/lesson/11-writing-methods) with the body torn off, `MotorIO` is purely a promise: "whatever matches me has a `get_speed()` method that returns a `float`." It says nothing about *how* that speed is measured.

# Two things that keep the promise

In Python, a class satisfies a `Protocol` simply by having methods with the right names and types. You don't even need a special `implements` keyword. Here are two classes that both keep `MotorIO`'s promise, `SimMotorIO` and `RealMotorIO`:

```python
from typing import Protocol


class MotorIO(Protocol):
    def get_speed(self) -> float: ...


class SimMotorIO:
    def get_speed(self) -> float:
        print("SIM: get_speed()")
        return 0.4


class RealMotorIO:
    def get_speed(self) -> float:
        print("REAL: get_speed()")
        return 0.55


io: MotorIO = SimMotorIO()
print(io.get_speed())
```

Run it. You'll see `SIM: get_speed()` printed by the method itself, then `0.4` printed below it. Now change `SimMotorIO()` to `RealMotorIO()` and run again: same type annotation, same `io.get_speed()` call, completely different implementation running underneath.

`io: MotorIO = ...` is the key line. It declares that `io` must satisfy `MotorIO`, so anything with a matching `get_speed` method fits right in, just like the `declare` block from last lesson.

# The pattern real robot code uses

A `Protocol` isn't limited to one method. Add a second, `set_speed`, and every implementation must answer for both. Watch what happens when a function takes the *protocol* as its parameter type instead of a specific class:

```python
from typing import Protocol


class MotorIO(Protocol):
    def get_speed(self) -> float: ...
    def set_speed(self, target: float) -> None: ...


class SimMotorIO:
    def get_speed(self) -> float:
        print("SIM: get_speed()")
        return 0.4

    def set_speed(self, target: float) -> None:
        print(f"SIM: set_speed({target})")


class RealMotorIO:
    def get_speed(self) -> float:
        print("REAL: get_speed()")
        return 0.55

    def set_speed(self, target: float) -> None:
        print(f"REAL: set_speed({target})")


def report(io: MotorIO) -> None:
    io.set_speed(0.8)
    print(f"current speed: {io.get_speed()}")


report(SimMotorIO())
report(RealMotorIO())
```

`report` never mentions `SimMotorIO` or `RealMotorIO` by name. It only knows about `MotorIO`. Run it: both calls print a `SIM:`/`REAL:` pair from inside `set_speed()` and `get_speed()`, then `report`'s own line, unchanged either way.

This is the **exact** AdvantageKit IO pattern used in FRC subsystems: an `XxxIO` contract plus a `SimXxxIO` and a `RealXxxIO`. The subsystem code that decides *when* to spin a motor or check its speed is written once against the protocol, and never has to change depending on whether the robot is physical hardware on the field or a simulation running on a laptop. Swapping `SimMotorIO()` for `RealMotorIO()` in one place (usually `RobotContainer`) is the only thing that changes.

Your turn: add a third method to `MotorIO`, `def is_stalled(self) -> bool: ...`, and implement it in both classes. `SimMotorIO` should return `False`, and `RealMotorIO` should return `True` just to tell them apart. Call it from `report` and print its result alongside the speed.
