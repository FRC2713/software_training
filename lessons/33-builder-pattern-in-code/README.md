---
title: "The builder pattern, in code"
goal: "Write a chain of fluent setters that each return self, in the exact shape PhoenixLib uses to configure a motor."
order: 330
section: "Advanced Python"
---

# The problem with plain setters

A motor controller needs several settings at once: a max speed, a current
limit, a gear ratio. A plain setter that returns `None`, called one per line,
works, but it's clunky:

```python
class MotorConfig:
    def __init__(self) -> None:
        self.max_speed = 0.0
        self.current_limit = 0.0

    def with_max_speed(self, value: float) -> None:
        self.max_speed = value

    def with_current_limit(self, value: float) -> None:
        self.current_limit = value


config = MotorConfig()
config.with_max_speed(80)
config.with_current_limit(40)
print(config.max_speed, config.current_limit)
```

Run it. It works, but every setting is its own statement, repeating `config.`
each time. [Last lesson's](#/lesson/32-builder-pattern-as-diagrams) diagram
chained steps together instead. Here's how to make that valid Python.

# Setters that return self

The fix is one line: instead of returning `None`, each setter returns
**`self`**, *the object it was just called on*
([lesson {n}](#/lesson/17-classes-and-objects)). That lets you call the *next*
method directly on what the last one handed back:

```python
from __future__ import annotations


class MotorConfig:
    def __init__(self) -> None:
        self._max_speed = 0.0
        self._current_limit = 0.0
        self._gear_ratio = 1.0

    def with_max_speed(self, value: float) -> MotorConfig:
        self._max_speed = value
        return self

    def with_current_limit(self, value: float) -> MotorConfig:
        self._current_limit = value
        return self

    def with_gear_ratio(self, value: float) -> MotorConfig:
        self._gear_ratio = value
        return self

    def report(self) -> None:
        print(
            f"max_speed={self._max_speed} "
            f"current_limit={self._current_limit} "
            f"gear_ratio={self._gear_ratio}"
        )


config = (
    MotorConfig()
    .with_max_speed(80)
    .with_current_limit(40)
    .with_gear_ratio(4)
)
config.report()
```

Run it, and all three settings land in one chained expression. The outer
parentheses let Python split one chained expression across multiple lines. Read
`MotorConfig().with_max_speed(80)` as "build a config, then call
`with_max_speed` on it." Because `with_max_speed` **returns that very object**,
`.with_current_limit(40)` can be called directly on whatever it just returned,
and so on. The fields stay internal with a leading underscore
([lesson {n}](#/lesson/19-encapsulation)), so nothing outside `MotorConfig`
touches `_max_speed` directly, only through a `with_*` method that sets it on
purpose.

This is the **exact** pattern PhoenixLib uses to configure a real motor
controller: a chain of `.with_...(...)` calls, each setting one thing and
handing back the same config object so the next call lands right on top of it.
Real motor configs cover dozens of settings, not just speed and current limit,
but every one of them works the same way: one `with_*` method, one field,
`return self`.

Your turn: go back to your capstone mechanism from
[lesson {n}](#/lesson/25-capstone-state-machine). Write a fluent config class
for it with at least three `with_*` methods (pick settings that make sense for
your mechanism, like a max height, a hold current, or a speed) and a `report()`
method. Build one with a chained call and confirm `report()` prints all three
values you set.
