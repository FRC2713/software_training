---
title: "Capstone 2: an advanced mechanism"
goal: "Return to your Capstone 1 mechanism and upgrade it with enums with fields, match, Protocol interfaces, @property, lambdas, and the builder pattern so it runs identically in simulation and on real hardware."
order: 340
section: "Advanced Python"
---

# Picking up where Capstone 1 left off

[Capstone 1](#/lesson/25-capstone-state-machine) ended with you designing and
coding a real mechanism of your own, not `Climber`, but something from this
year's robot. Go find that file now and open it next to this lesson.

Everything below walks through upgrading `Climber` with every tool from this
Advanced Python section, one piece at a time. Your job is to make the same
upgrade to **your own mechanism** right alongside it. Don't wait until the end.
When a page adds a field to `ClimberState`, add one to your enum. When a page
gives `Climber` a `Protocol` interface, give yours one too. By the last page,
`Climber` and your mechanism should have grown up together.

Start with [lesson {n}'s](#/lesson/27-enums-revisited) trick, applied to the
states from Capstone 1: give every state its own motor speed, right on the
enum. Each member starts with a unique label so `STOWED` and `EXTENDED` stay
distinct states even though both use a speed of `0.0`:

```python
from enum import Enum


class ClimberState(Enum):
    STOWED = ("stowed", 0.0)
    EXTENDING = ("extending", 0.6)
    EXTENDED = ("extended", 0.0)
    RETRACTING = ("retracting", -0.6)

    def __init__(self, label: str, motor_speed: float) -> None:
        self.label = label
        self.motor_speed = motor_speed


for state in ClimberState:
    print(f"{state.name} -> {state.motor_speed}")
```

Run it. The four states from Capstone 1 print out, each now carrying the number
the motor should run at while the climber is in that state. No new behavior
otherwise, just [lesson {n}'s](#/lesson/27-enums-revisited) trick applied a
second time. Go add a field to your own enum before moving on.

# Give it real and simulated hardware

Next, [lesson {n}'s](#/lesson/29-interfaces-in-code) pattern: a `Protocol`
contract for "whatever moves the actual motor," plus a `Sim` and a `Real` class
that both keep it.

```python
from typing import Protocol


class ClimberIO(Protocol):
    def set_speed(self, speed: float) -> None: ...


class ClimberIOSim:
    def set_speed(self, speed: float) -> None:
        print(f"SIM: set_speed({speed})")


class ClimberIOReal:
    def set_speed(self, speed: float) -> None:
        print(f"REAL: set_speed({speed})")


io: ClimberIO = ClimberIOSim()
io.set_speed(0.6)
```

Run it, and `SIM: set_speed(0.6)` prints. Neither class talks to actual
hardware. They are stand-ins, exactly like
[lesson {n}'s](#/lesson/29-interfaces-in-code) `MotorIO`, so you can see which
one ran without needing a real motor controller plugged in. Write the same
`-IO` protocol, plus `Sim` and `Real`, for your own mechanism now.

# Recap: the config builder

Before combining everything, rebuild one more piece on its own:
[lesson {n}'s](#/lesson/33-builder-pattern-in-code) fluent config, this time
guarding the climber's speed instead of a generic motor's. We can also give it
a spot for an optional callback function, which is where a `lambda` will plug
in shortly.

```python
from __future__ import annotations
from typing import Callable


class ClimberConfig:
    def __init__(self) -> None:
        self._max_speed = 1.0
        self._on_change: Callable[[str], None] | None = None

    def with_max_speed(self, value: float) -> ClimberConfig:
        self._max_speed = value
        return self

    def with_on_change(self, callback: Callable[[str], None]) -> ClimberConfig:
        self._on_change = callback
        return self

    @property
    def on_change(self) -> Callable[[str], None] | None:
        return self._on_change

    def clamp(self, requested: float) -> float:
        if requested > self._max_speed:
            return self._max_speed
        if requested < -self._max_speed:
            return -self._max_speed
        return requested


config = (
    ClimberConfig()
    .with_max_speed(0.5)
    .with_on_change(lambda label: print(f"changed -> {label}"))
)
print(config.clamp(0.6))
print(config.clamp(-0.6))
print(config.clamp(0.2))
if config.on_change is not None:
    config.on_change("EXTENDING")
```

Run it: `0.5`, `-0.5`, `0.2`, followed by `changed -> EXTENDING`. The first two
speeds get reined in to `_max_speed`, while the third was already safely inside
it and passes through untouched. Internal fields plus `with_*` methods that
return `self` make up the whole builder, just like
[lesson {n}](#/lesson/33-builder-pattern-in-code), renamed for this mechanism.
Keep this shape in mind; it's about to plug straight into the next piece.

# Put state, match, and hardware together

Now combine the pieces from the first two pages, the enum with a field and the
`Sim`/`Real` hardware, into an actual state-machine class. Use
[lesson {n}'s](#/lesson/26-decisions-in-code-revisited) `match` for the
transitions and [lesson {n}'s](#/lesson/30-encapsulation-revisited) `@property`
to expose the state as read-only. No config yet, so `update` hands the enum's
speed straight to `io`:

```python
from enum import Enum
from typing import Protocol


class ClimberState(Enum):
    STOWED = ("stowed", 0.0)
    EXTENDING = ("extending", 0.6)
    EXTENDED = ("extended", 0.0)
    RETRACTING = ("retracting", -0.6)

    def __init__(self, label: str, motor_speed: float) -> None:
        self.label = label
        self.motor_speed = motor_speed


class ClimberIO(Protocol):
    def set_speed(self, speed: float) -> None: ...


class ClimberIOSim:
    def set_speed(self, speed: float) -> None:
        print(f"SIM: set_speed({speed})")


class Climber:
    def __init__(self, io: ClimberIO) -> None:
        self._io = io
        self._state = ClimberState.STOWED

    @property
    def state(self) -> ClimberState:
        return self._state

    def update(self, event: str) -> None:
        match self._state:
            case ClimberState.STOWED:
                if event == "button":
                    self._state = ClimberState.EXTENDING
            case ClimberState.EXTENDING:
                if event == "at_top":
                    self._state = ClimberState.EXTENDED
            case ClimberState.EXTENDED:
                if event == "button":
                    self._state = ClimberState.RETRACTING
            case ClimberState.RETRACTING:
                if event == "at_bottom":
                    self._state = ClimberState.STOWED
        self._io.set_speed(self._state.motor_speed)


climber = Climber(ClimberIOSim())
climber.update("button")
print(climber.state.name)
```

Run it. `SIM: set_speed(0.6)` prints, then `EXTENDING`. Trace each piece back
to where it came from: `_state` is internal with a read-only `@property` (30),
`update` dispatches with `match` (26), each state knows its own speed (27), and
that speed goes straight to whichever `ClimberIO` was passed in (29).
Everything here is a piece you've already seen; this page just wires them into
one class. The only thing missing is the config from the last page, guarding
that speed before it reaches `io` and firing the callback when the state
changes. Bring your own mechanism's `update` method up to the same shape before
continuing.

# Assemble the whole mechanism

One more piece: bring `ClimberConfig` in, clamp the speed before it reaches
`io`, and pass a `lambda` to log every state transition.

```python
from __future__ import annotations
from enum import Enum
from typing import Callable, Protocol


class ClimberState(Enum):
    STOWED = ("stowed", 0.0)
    EXTENDING = ("extending", 0.6)
    EXTENDED = ("extended", 0.0)
    RETRACTING = ("retracting", -0.6)

    def __init__(self, label: str, motor_speed: float) -> None:
        self.label = label
        self.motor_speed = motor_speed


class ClimberIO(Protocol):
    def set_speed(self, speed: float) -> None: ...


class ClimberIOSim:
    def set_speed(self, speed: float) -> None:
        print(f"SIM: set_speed({speed})")


class ClimberIOReal:
    def set_speed(self, speed: float) -> None:
        print(f"REAL: set_speed({speed})")


class ClimberConfig:
    def __init__(self) -> None:
        self._max_speed = 1.0
        self._on_change: Callable[[ClimberState], None] | None = None

    def with_max_speed(self, value: float) -> ClimberConfig:
        self._max_speed = value
        return self

    def with_on_change(
        self, callback: Callable[[ClimberState], None]
    ) -> ClimberConfig:
        self._on_change = callback
        return self

    @property
    def on_change(self) -> Callable[[ClimberState], None] | None:
        return self._on_change

    def clamp(self, requested: float) -> float:
        if requested > self._max_speed:
            return self._max_speed
        if requested < -self._max_speed:
            return -self._max_speed
        return requested


class Climber:
    def __init__(self, io: ClimberIO, config: ClimberConfig) -> None:
        self._io = io
        self._config = config
        self._state = ClimberState.STOWED

    @property
    def state(self) -> ClimberState:
        return self._state

    def update(self, event: str) -> None:
        previous = self._state
        match self._state:
            case ClimberState.STOWED:
                if event == "button":
                    self._state = ClimberState.EXTENDING
            case ClimberState.EXTENDING:
                if event == "at_top":
                    self._state = ClimberState.EXTENDED
            case ClimberState.EXTENDED:
                if event == "button":
                    self._state = ClimberState.RETRACTING
            case ClimberState.RETRACTING:
                if event == "at_bottom":
                    self._state = ClimberState.STOWED
        if self._state != previous and self._config.on_change is not None:
            self._config.on_change(self._state)
        self._io.set_speed(self._config.clamp(self._state.motor_speed))


config = (
    ClimberConfig()
    .with_max_speed(0.5)
    .with_on_change(lambda state: print(f"transition -> {state.name}"))
)
climber = Climber(ClimberIOSim(), config)

events = ["button", "at_top", "button", "at_bottom"]
for event in events:
    climber.update(event)
    print(climber.state.name)
```

Run it. Notice two things versus the last page: `EXTENDING`'s `0.6` comes out
as `0.5` in the printed `set_speed` call because `config.clamp(...)` caps it,
and the `lambda` passed to `with_on_change` prints each transition as it
happens.

Change `ClimberIOSim()` to `ClimberIOReal()` and run again. Every `state`
printed is identical, and only the `SIM:`/`REAL:` label on each `set_speed`
line changes. That's the entire payoff of the `Protocol` pattern: the state
machine itself never had to know which one it was talking to.

**This is your Capstone 2.** Bring your own mechanism from Capstone 1 the rest
of the way to this exact shape:

1. Give its `Enum` a field for whatever number matters most (a speed, a height
   rate, whatever fits).
2. Write an `-IO` `Protocol` for it, plus `Sim` and `Real` classes that print
   `"SIM: ..."` and `"REAL: ..."`.
3. Keep its `_state` field internal with a read-only `@property`, and dispatch
   its transitions with `match`.
4. Build it through a fluent config with at least one `with_*` setting and a
   `lambda` callback.
5. Swap `Sim` for `Real` and confirm every state transition still happens
   exactly the same way.

Do that, and the mechanism you designed back in Capstone 1 is now written in
the same shape (enum, protocol, property, lambda, and builder) as a real
subsystem in a modern robot codebase.
