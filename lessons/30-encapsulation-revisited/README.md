---
title: "Encapsulation, revisited"
goal: "Use leading-underscore conventions and @property for read-only attributes so every class has a clear public contract."
order: 300
section: "Advanced Python"
---

# Leading underscores and @property

[Lesson {n}](#/lesson/19-encapsulation) showed why outside code shouldn't reach straight into an object's internal state. Unlike languages with a `private` keyword that locks fields at compile time, Python relies on two clean tools: **leading underscores** for internals, and **`@property`** for controlled, read-only access.

A single leading underscore, like `_speed` or `_clamp_speed`, tells every other programmer (and your editor): "this is internal bookkeeping for this class, don't reach in and touch it." Meanwhile, `@property` lets callers read `sim.speed` like a normal attribute without letting them overwrite it directly:

```python
class SimMotorIO:
    def __init__(self) -> None:
        self._speed = 0.0

    def _clamp_speed(self, value: float) -> float:
        if value > 1.0:
            return 1.0
        if value < -1.0:
            return -1.0
        return value

    @property
    def speed(self) -> float:
        return self._speed

    def set_speed(self, target: float) -> None:
        self._speed = self._clamp_speed(target)


sim = SimMotorIO()
sim.set_speed(1.5)
print(sim.speed)
```

Run it. `set_speed(1.5)` clamps the value through `_clamp_speed` and stores `1.0` in `_speed`. Then `print(sim.speed)` runs the `@property` method behind the scenes and hands back `1.0`.

Now try adding `sim.speed = 999.0` at the bottom and running again. Python raises `AttributeError: property 'speed' of 'SimMotorIO' object has no setter`. Because `speed` has a `@property` without a setter, it is **read-only**. Callers can inspect the speed cleanly with `sim.speed`, but the only legal way to change it is through `set_speed()`, where clamping is guaranteed.

# Clear contracts over locked doors

You might notice that Python wouldn't physically stop someone from writing `sim._speed = 999.0`. Python's philosophy is often summed up as "we're all consenting adults here." Encapsulation isn't about building a vault to fight off hackers; it's about drawing a **clear contract** between a class and the rest of the robot code.

When you write a class in Python, every attribute or method falls into one of three buckets:

- **Public methods and `@property` attributes** (`speed`, `set_speed`). This is the contract outside code depends on. Keep it small and predictable.
- **Read-only `@property`** (`@property def speed`). Use it when outside code needs to *read* a value, or a computed value like `is_at_speed`, without being able to assign to it directly.
- **Leading underscore (`_name`)** (`_speed`, `_clamp_speed`). Internal state and helper methods. Anything with a leading underscore is free to be renamed or rewritten later without breaking other files, because no outside code should be calling it.

Clear boundaries make a big robot codebase much easier to change. If `SimMotorIO` changes how it clamps or stores `_speed` next week, nothing in the commands or subsystems breaks as long as `speed` and `set_speed()` keep their promise.

Your turn: go back to [lesson {n}'s](#/lesson/23-organizing-a-machine) `GamePieceHandler`. Store its state in `self._state`, expose a read-only `@property` named `state`, keep `update(self, event: str)` public, and add an internal helper method `_is_safe_to_shoot(self) -> bool` that returns `True` only when `self._state == HandlerState.LOADED`.
