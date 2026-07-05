---
title: "Lesson 18: Coordinating machines"
goal: "Run several small state machines in one loop and let them make decisions based on each other."
order: 18
section: "State Machines"
---

# A robot is many small machines

One giant state machine for a whole robot would be a tangle. Real robot code uses
**several small machines** — one per mechanism — each an object ([lesson 17](#/lesson/17-organizing-a-machine)) with
its own state. Because a class remembers its own `self.state`, you can make as
many as you want and they don't interfere:

```python
class Intake:
    def __init__(self):
        self.state = "clear"

    def update(self, event):
        if self.state == "clear" and event == "grab":
            self.state = "holding"
        elif self.state == "holding" and event == "release":
            self.state = "clear"


class Shooter:
    def __init__(self):
        self.state = "idle"

    def update(self, event):
        if self.state == "idle" and event == "shoot":
            self.state = "firing"
        elif self.state == "firing" and event == "done":
            self.state = "idle"


intake = Intake()
shooter = Shooter()
print(intake.state, shooter.state)
```

Two machines, two independent states. Run it: `clear idle`. Each is small and
easy to reason about on its own — that's the point of splitting them up.

# Machines that watch each other

Mechanisms aren't really independent, though. You shouldn't fire the shooter
while the intake is still holding a piece in the way. One machine can make a
decision based on **another machine's state** — just pass it in:

```python
class Shooter:
    def __init__(self):
        self.state = "idle"

    def update(self, event, intake_state):
        if self.state == "idle" and event == "shoot" and intake_state == "clear":
            self.state = "firing"
        elif self.state == "firing" and event == "done":
            self.state = "idle"


shooter = Shooter()
shooter.update("shoot", "holding")
print("tried to shoot while holding:", shooter.state)
shooter.update("shoot", "clear")
print("shot while clear:", shooter.state)
```

The extra `and intake_state == "clear"` ([lesson 13](#/lesson/13-booleans) again) is a **guard**: the
shooter refuses to fire unless the intake reports it's out of the way. Run it —
the first attempt is ignored because the intake was `holding`; the second works.
This cross-machine guard is how you keep two mechanisms from fighting each other.

# The shared robot loop

Now the payoff: one loop drives **both** machines every tick, feeding the
shooter whatever the intake's state currently is. This is, in miniature, the loop
that runs the whole robot.

```python
class Intake:
    def __init__(self):
        self.state = "clear"
    def update(self, event):
        if self.state == "clear" and event == "grab":
            self.state = "holding"
        elif self.state == "holding" and event == "release":
            self.state = "clear"


class Shooter:
    def __init__(self):
        self.state = "idle"
    def update(self, event, intake_state):
        if self.state == "idle" and event == "shoot" and intake_state == "clear":
            self.state = "firing"
        elif self.state == "firing" and event == "done":
            self.state = "idle"


intake = Intake()
shooter = Shooter()
events = ["grab", "shoot", "release", "shoot", "done"]

for event in events:
    intake.update(event)
    shooter.update(event, intake.state)
    print(event, "->  intake:", intake.state, " shooter:", shooter.state)
```

Trace it: `grab` makes the intake `holding`; the `shoot` that follows is blocked
because the intake is in the way; `release` clears it; the next `shoot` fires; and
`done` resets. Two machines, one loop, coordinating through their states — every
tick, both get a chance to update. Run it and confirm the blocked shot.

Your turn: add a third machine — a `Climber` with states `stowed → extending →
extended`. Update it in the same loop, and give it a guard so it only starts
extending when the shooter is `idle` (you don't want to climb mid-shot). Add the
events it needs and watch all three states march through the loop together.
