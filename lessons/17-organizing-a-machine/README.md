---
title: "Lesson 17: Organizing a state machine"
goal: "Make a machine safe and tidy with named state constants, enter actions, and a class to hold it all together."
order: 17
section: "State Machines"
---

# Name your states with constants

Our machines used bare strings like `"shooting"` for state names. That works
until you make a typo — and typos in strings are a nasty, silent bug:

```python
state = "loaded"
if state == "loded":
    print("this never runs, and Python never warns you")
print("done")
```

Run it. Python happily compares `"loaded"` to the misspelled `"loded"`, decides
they're not equal, and moves on — no error, just a branch that mysteriously never
fires. The fix is to give each state a **named constant** and use the name
everywhere:

```python
EMPTY = "empty"
INTAKING = "intaking"
LOADED = "loaded"
SHOOTING = "shooting"

state = LOADED
if state == LODED:
    print("ready to shoot!")
```

Run *that* and Python crashes immediately with `NameError: name 'LODED' is not
defined` — it caught the typo the instant you made it. That's the whole point:
a misspelled string fails silently, but a misspelled **name** fails loudly. Fix
`LODED` to `LOADED` and it works. Constants (written in CAPS by convention) also
make code read cleanly: `state == SHOOTING` says what you mean.

# Do something the moment you enter a state

Often a state needs an action to happen **once, right as you enter it** — spin the
shooter up, start the intake motor, reset a timer. That's an **enter action**.
Keep it separate from the transition logic:

```python
def on_enter(state):
    if state == "intaking":
        print("  -> intake motor ON")
    elif state == "shooting":
        print("  -> shooter spinning up!")
    elif state == "empty":
        print("  -> motors off, waiting")

# When a transition happens, run the enter action for the new state:
new_state = "shooting"
on_enter(new_state)
```

Run it and you'll see the shooter spin-up message. The idea: transitions decide
*where* you go; enter actions decide *what fires* when you get there. Doing the
spin-up on **enter** means it happens exactly once per shot, not every tick while
you sit in `shooting` — a distinction that matters a lot on a real robot.

# Bundle it into a class

Right now the state lives in a loose variable and the logic in loose functions.
As machines grow, that gets hard to keep straight. A **class** (like a function
from [lesson 10](#/lesson/10-writing-functions), but bigger) bundles a machine's state *and* its update into one
tidy object.

```python
class GamePieceHandler:
    def __init__(self):
        self.state = "empty"

    def update(self, event):
        if self.state == "empty" and event == "button":
            self.state = "intaking"
        elif self.state == "intaking" and event == "sensor":
            self.state = "loaded"
        elif self.state == "loaded" and event == "button":
            self.state = "shooting"
        elif self.state == "shooting" and event == "done":
            self.state = "empty"

handler = GamePieceHandler()
print(handler.state)
handler.update("button")
handler.update("sensor")
print(handler.state)
```

Two new words to learn:

- **`__init__`** runs once when you create the machine with `GamePieceHandler()`.
  It sets the starting state — the same job as `state = "empty"` before.
- **`self`** is *this machine*. `self.state` is its own state, remembered between
  calls. `handler.update("button")` runs the update on that machine and updates
  its `self.state` in place.

Run it: the handler starts `empty`, and after a `button` then a `sensor` it's
`loaded` — and it stayed `loaded` between the two calls because the object
remembers. That memory is why a class beats loose variables once you have more
than one machine — which is exactly where we go next.

Your turn: give the class the constants from page 1 (use `EMPTY`, `INTAKING`,
etc. instead of the raw strings), and add a `report()` method that prints the
current state with a friendly label. Create a handler and drive it through a full
load-and-shoot cycle.
