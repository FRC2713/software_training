---
title: "Organizing a state machine"
goal: "Make a machine safe and tidy with an enum for the states, enter actions, and a class to hold it all together."
order: 230
section: "State Machines"
---

# Name your states with an enum

In the last lesson we used bare strings like `"shooting"` for state names. That
works until you make a typo, and typos in strings are a nasty, silent bug:

```python
state = "loaded"
if state == "loded":
    print("this never runs, and Python never warns you")
print("done")
```

Run it. Python happily compares `"loaded"` to the misspelled `"loded"`, decides
they're not equal, and moves on. There's no error, just a branch that
mysteriously never fires. In a robot, that's a mechanism that silently refuses
to shoot.

You saw the fix back in [lesson {n}](#/lesson/21-state-machines-in-code): an **`Enum`**, a type you define
yourself whose only possible values are the ones you list:

```python
from enum import Enum

class HandlerState(Enum):
    EMPTY = "empty"
    INTAKING = "intaking"
    LOADED = "loaded"
    SHOOTING = "shooting"

state = HandlerState.LOADED
if state == HandlerState.LOADED:
    print("ready to shoot!")
```

Run it, then change `HandlerState.LOADED` in the `if` line to
`HandlerState.LODED` and run it again. Python stops right away with an
`AttributeError` pointing straight at the misspelled `LODED`. That's the whole
point: a misspelled string fails silently at the worst possible moment, while a
misspelled **enum value** fails loudly right where the typo is. Fix `LODED`
back to `LOADED` and it works.

Two details worth noticing:

- `HandlerState` is a **type** you invented, and its members are the only legal
  states. The machine's rule "you're always in one of these states" is spelled
  out in one place.
- Enums are compared with `==` (from [lesson {n}](#/lesson/16-booleans)), or matched with `match`,
  so your conditions stay short and readable.

This is how real robot code names its states, so everything from here on uses
this shape.

# Do something the moment you enter a state

Often a state needs an action to happen **once, right as you enter it**, like
spinning the shooter up, starting the intake motor, or resetting a timer.
That's an **enter action**. Keep it separate from the transition logic:

```python
from enum import Enum

class HandlerState(Enum):
    EMPTY = "empty"
    INTAKING = "intaking"
    LOADED = "loaded"
    SHOOTING = "shooting"

def on_enter(state):
    if state == HandlerState.INTAKING:
        print("  -> intake motor ON")
    elif state == HandlerState.SHOOTING:
        print("  -> shooter spinning up!")
    elif state == HandlerState.EMPTY:
        print("  -> motors off, waiting")

# When a transition happens, run the enter action for the new state:
new_state = HandlerState.SHOOTING
on_enter(new_state)
```

Run it and you'll see the shooter spin-up message. The idea: transitions decide
*where* you go; enter actions decide *what fires* when you get there. Doing the
spin-up on **enter** means it happens once per shot, not every tick while you
sit in `SHOOTING`. That distinction matters a lot on a real robot.

# Bundle it into a class

Right now the state lives in a loose variable and the logic in loose functions.
You already know the fix for that from [the Objects lessons](#/lesson/17-classes-and-objects): an
**attribute** for the data, an `__init__` method to set its starting value, and
**methods** that read and write it through `self`. Applied to a state machine,
it looks like this:

```python
from enum import Enum

class HandlerState(Enum):
    EMPTY = "empty"
    INTAKING = "intaking"
    LOADED = "loaded"
    SHOOTING = "shooting"

class GamePieceHandler:
    def __init__(self):
        self.state = HandlerState.EMPTY

    def update(self, event):
        if self.state == HandlerState.EMPTY and event == "button":
            self.state = HandlerState.INTAKING
        elif self.state == HandlerState.INTAKING and event == "sensor":
            self.state = HandlerState.LOADED
        elif self.state == HandlerState.LOADED and event == "button":
            self.state = HandlerState.SHOOTING
        elif self.state == HandlerState.SHOOTING and event == "done":
            self.state = HandlerState.EMPTY

handler = GamePieceHandler()
print(handler.state.name)
handler.update("button")
handler.update("sensor")
print(handler.state.name)
```

Nothing here is new. `self.state` is an attribute, `__init__` sets its starting
value, and `update` reads and writes `self.state`. We just aimed it at an enum
instead of the plain data you practiced on earlier. Run it: the handler starts
`EMPTY`, and after a `button` then a `sensor` it's `LOADED`. It stayed `LOADED`
between the two calls because the object remembers its own state. That memory
is why a class beats loose variables once you have more than one machine, which
is where we go next.

Your turn: add a `report(self)` method to the class that prints the current
state with a friendly label (an `if`/`elif` over `self.state`). Create a
handler and drive it through a full load-and-shoot cycle, calling `report()`
after each event.
