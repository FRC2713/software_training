---
title: "Coordinating machines"
goal: "Run several small state machines in one loop and let them make decisions based on each other."
order: 240
section: "State Machines"
---

# A robot is many small machines

One giant state machine for a whole robot would be a tangle. Real robot code
uses **several small machines**, one per mechanism, each an object
([lesson {n}](#/lesson/18-multiple-objects)) with its own state. Because a class remembers its own state
attribute, you can make as many as you want and they don't interfere:

```python
from enum import Enum

class IntakeState(Enum):
    CLEAR = "clear"
    HOLDING = "holding"

class ShooterState(Enum):
    IDLE = "idle"
    FIRING = "firing"

class Intake:
    def __init__(self):
        self.state = IntakeState.CLEAR

    def update(self, event):
        if self.state == IntakeState.CLEAR and event == "grab":
            self.state = IntakeState.HOLDING
        elif self.state == IntakeState.HOLDING and event == "release":
            self.state = IntakeState.CLEAR

class Shooter:
    def __init__(self):
        self.state = ShooterState.IDLE

    def update(self, event):
        if self.state == ShooterState.IDLE and event == "shoot":
            self.state = ShooterState.FIRING
        elif self.state == ShooterState.FIRING and event == "done":
            self.state = ShooterState.IDLE

intake = Intake()
shooter = Shooter()
print(intake.state.name, shooter.state.name)
```

Two machines, two independent states, and two enums, because each mechanism has
its *own* set of legal states. Run it: `CLEAR IDLE`. Each machine is small and
easy to reason about on its own. That's the point of splitting them up.

Each class sets its starting `self.state` inside `__init__` (from
[lesson {n}](#/lesson/17-classes-and-objects)), so every new object starts in a known state.

# Machines that watch each other

Mechanisms aren't really independent, though. You shouldn't fire the shooter
while the intake is still holding a piece in the way. One machine can make a
decision based on **another machine's state**. Just pass it in:

```python
from enum import Enum

class IntakeState(Enum):
    CLEAR = "clear"
    HOLDING = "holding"

class ShooterState(Enum):
    IDLE = "idle"
    FIRING = "firing"

class Shooter:
    def __init__(self):
        self.state = ShooterState.IDLE

    def update(self, event, intake_state):
        if (
            self.state == ShooterState.IDLE
            and event == "shoot"
            and intake_state == IntakeState.CLEAR
        ):
            self.state = ShooterState.FIRING
        elif self.state == ShooterState.FIRING and event == "done":
            self.state = ShooterState.IDLE

shooter = Shooter()
shooter.update("shoot", IntakeState.HOLDING)
print("tried to shoot while holding:", shooter.state.name)
shooter.update("shoot", IntakeState.CLEAR)
print("shot while clear:", shooter.state.name)
```

The extra `and intake_state == IntakeState.CLEAR` ([lesson {n}](#/lesson/16-booleans) again) is a
**guard**: the shooter refuses to fire unless the intake reports it's out of
the way. Run it. The first attempt is ignored because the intake was `HOLDING`;
the second works. This cross-machine guard is how you keep two mechanisms from
fighting each other.

# The shared robot loop

Now the payoff: one loop drives **both** machines every tick, feeding the
shooter whatever the intake's state currently is. This is, in miniature, the
loop that runs the whole robot.

```python
from enum import Enum

class IntakeState(Enum):
    CLEAR = "clear"
    HOLDING = "holding"

class ShooterState(Enum):
    IDLE = "idle"
    FIRING = "firing"

class Intake:
    def __init__(self):
        self.state = IntakeState.CLEAR

    def update(self, event):
        if self.state == IntakeState.CLEAR and event == "grab":
            self.state = IntakeState.HOLDING
        elif self.state == IntakeState.HOLDING and event == "release":
            self.state = IntakeState.CLEAR

class Shooter:
    def __init__(self):
        self.state = ShooterState.IDLE

    def update(self, event, intake_state):
        if (
            self.state == ShooterState.IDLE
            and event == "shoot"
            and intake_state == IntakeState.CLEAR
        ):
            self.state = ShooterState.FIRING
        elif self.state == ShooterState.FIRING and event == "done":
            self.state = ShooterState.IDLE

intake = Intake()
shooter = Shooter()
events = ["grab", "shoot", "release", "shoot", "done"]

for event in events:
    intake.update(event)
    shooter.update(event, intake.state)
    print(f"{event} ->  intake: {intake.state.name}  shooter: {shooter.state.name}")
```

Trace it: `grab` makes the intake `HOLDING`; the `shoot` that follows is
blocked because the intake is in the way; `release` clears it; the next
`shoot` fires; and `done` resets. Two machines, one loop, coordinating through
their states. Every tick, both get a chance to update. Run it and confirm the
blocked shot.

Your turn: add a third machine, a `Climber` with its own enum and states
`STOWED → EXTENDING → EXTENDED`. Update it in the same loop, and give it a
guard so it only starts extending when the shooter is `IDLE` (you don't want
to climb mid-shot). Add the events it needs and watch all three states march
through the loop together.
