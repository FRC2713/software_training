---
title: "Lesson 19: Capstone — design a state machine"
goal: "Take a real mechanism from words to a diagram to working code you can simulate."
order: 19
section: "State Machines"
---

# From a mechanism to a diagram

Everything so far handed you the states and transitions. The real skill — the one
you'll use all season — is **designing** them yourself. It's a repeatable
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

That's the exact diagram you'd build with blocks in [lesson 14](#/lesson/14-state-machines) — states, events,
arrows, and (just as important) *no* arrow for anything unsafe. Notice there's no
way to go straight from `STOWED` to `EXTENDED`: you must pass through
`EXTENDING`. The design forbids the dangerous shortcut.

# Translate the diagram to code

Now it's mechanical — the diagram maps straight onto the class shape from
[lesson 17](#/lesson/17-organizing-a-machine): constants for the states, `__init__` for the start, an `update` with one
`elif` per arrow, and enter actions for what should fire once.

```python
STOWED = "stowed"
EXTENDING = "extending"
EXTENDED = "extended"
RETRACTING = "retracting"

class Climber:
    def __init__(self):
        self.state = STOWED

    def update(self, event):
        old = self.state
        if self.state == STOWED and event == "button":
            self.state = EXTENDING
        elif self.state == EXTENDING and event == "at_top":
            self.state = EXTENDED
        elif self.state == EXTENDED and event == "button":
            self.state = RETRACTING
        elif self.state == RETRACTING and event == "at_bottom":
            self.state = STOWED
        if self.state != old:
            self.on_enter()

    def on_enter(self):
        if self.state == EXTENDING:
            print("  -> motor up")
        elif self.state == RETRACTING:
            print("  -> motor down, hang on!")

climber = Climber()
climber.update("button")
print(climber.state)
```

Read `update`: it remembers the `old` state, tries each transition, and if the
state actually changed, fires `on_enter` for the new one. Every line traces back
to a piece of the diagram. Run it — one `button` moves `stowed → extending` and
prints the motor-up action.

# Simulate it, then build your own

Drive your machine with a list of events, the way a match would, and print each
step:

```python
STOWED, EXTENDING, EXTENDED, RETRACTING = "stowed", "extending", "extended", "retracting"

class Climber:
    def __init__(self):
        self.state = STOWED
    def update(self, event):
        if self.state == STOWED and event == "button":
            self.state = EXTENDING
        elif self.state == EXTENDING and event == "at_top":
            self.state = EXTENDED
        elif self.state == EXTENDED and event == "button":
            self.state = RETRACTING
        elif self.state == RETRACTING and event == "at_bottom":
            self.state = STOWED

climber = Climber()
events = ["button", "button", "at_top", "button", "at_bottom"]
for event in events:
    climber.update(event)
    print(event, "->", climber.state)
```

Watch the second `"button"` do nothing — while `EXTENDING`, the climber ignores
the button and waits for `at_top`, just like the diagram says. That's the safety
you designed in, running in code.

**Your capstone.** Pick a real mechanism from this year's robot — an arm, a
turret, an indexer, whatever your team is building. Then:

1. Write its states, its events, and its arrows as a diagram (page 1's three
   questions).
2. Turn it into a `class` with constants, an `update`, and at least one enter
   action.
3. Simulate it with an event list and confirm it does the right thing — including
   *ignoring* the events that would be unsafe.

Do that, and you haven't just finished the lessons — you've written the kind of
code your robot will actually run this season.
