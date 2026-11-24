---
title: "Capstone 1: design a state machine"
goal: "Take a real mechanism from words to a diagram to working code you can simulate."
order: 250
section: "State Machines"
---

# From a mechanism to a diagram

Everything so far handed you the states and transitions. The real skill, the
one you'll use all season, is **designing** them yourself. It's a repeatable
process, and it starts on paper, not in code.

Take a **climber**: it stows flat, extends a hook up to the bar, hangs there,
then retracts to lift the robot. Design it in three questions:

1. **What states can it be in?** `STOWED`, `EXTENDING`, `EXTENDED`, `RETRACTING`.
2. **What events can happen?** the driver's `button`, an `at_top` sensor, an
   `at_bottom` sensor.
3. **Which event moves between which states?** Draw the arrows:

```text
STOWED     --button--->  EXTENDING
EXTENDING  --at_top--->  EXTENDED
EXTENDED   --button--->  RETRACTING
RETRACTING --at_bottom-> STOWED
```

That's the exact diagram you'd build with blocks in [lesson {n}](#/lesson/20-state-machines): states,
events, arrows, and (just as important) *no* arrow for anything unsafe. Notice
there's no way to go straight from `STOWED` to `EXTENDED`. You must pass
through `EXTENDING`. The design forbids the dangerous shortcut.

# Translate the diagram to code

Now it's mechanical. The diagram maps straight onto the class shape from
[lesson {n}](#/lesson/23-organizing-a-machine): an enum for the states, an `__init__` for the start, an
`update` with one branch per arrow, and enter actions for what should fire once.

```python
from enum import Enum

class ClimberState(Enum):
    STOWED = "stowed"
    EXTENDING = "extending"
    EXTENDED = "extended"
    RETRACTING = "retracting"

class Climber:
    def __init__(self):
        self.state = ClimberState.STOWED

    def update(self, event):
        old = self.state
        if self.state == ClimberState.STOWED and event == "button":
            self.state = ClimberState.EXTENDING
        elif self.state == ClimberState.EXTENDING and event == "at_top":
            self.state = ClimberState.EXTENDED
        elif self.state == ClimberState.EXTENDED and event == "button":
            self.state = ClimberState.RETRACTING
        elif self.state == ClimberState.RETRACTING and event == "at_bottom":
            self.state = ClimberState.STOWED
        if self.state != old:
            self.on_enter()

    def on_enter(self):
        if self.state == ClimberState.EXTENDING:
            print("  -> motor up")
        elif self.state == ClimberState.RETRACTING:
            print("  -> motor down, hang on!")

climber = Climber()
climber.update("button")
print(climber.state.name)
```

Read `update`: it remembers the `old` state, tries each transition, and if the
state actually changed, fires `on_enter` for the new one. Every line traces
back to a piece of the diagram. Run it: one `button` moves `STOWED → EXTENDING`
and prints the motor-up action.

# Simulate it, then build your own

Drive your machine with a list of events, the way a match would, and print
each step:

```python
from enum import Enum

class ClimberState(Enum):
    STOWED = "stowed"
    EXTENDING = "extending"
    EXTENDED = "extended"
    RETRACTING = "retracting"

class Climber:
    def __init__(self):
        self.state = ClimberState.STOWED

    def update(self, event):
        if self.state == ClimberState.STOWED and event == "button":
            self.state = ClimberState.EXTENDING
        elif self.state == ClimberState.EXTENDING and event == "at_top":
            self.state = ClimberState.EXTENDED
        elif self.state == ClimberState.EXTENDED and event == "button":
            self.state = ClimberState.RETRACTING
        elif self.state == ClimberState.RETRACTING and event == "at_bottom":
            self.state = ClimberState.STOWED

climber = Climber()
events = ["button", "button", "at_top", "button", "at_bottom"]
for event in events:
    climber.update(event)
    print(f"{event} -> {climber.state.name}")
```

Watch the second `"button"` do nothing. While `EXTENDING`, the climber ignores
the button and waits for `at_top`, just like the diagram says. That's the
safety you designed in, running in code.

**Your Capstone 1.** Pick a real mechanism from this year's robot, like an arm,
a turret, or an indexer. Then:

1. Write its states, its events, and its arrows as a diagram (page 1's three
   questions).
2. Turn it into an enum and a class with an `update` and at least one enter
   action.
3. Simulate it with an event list and confirm it does the right thing, including
   *ignoring* the events that would be unsafe.

Do that, and you haven't just finished the lessons. You've written the kind of
code your robot will actually run this season.

Keep this mechanism around. Once you've picked up a few more tools in the
Advanced Python section, Capstone 2 will have you come back and upgrade this
exact class.
