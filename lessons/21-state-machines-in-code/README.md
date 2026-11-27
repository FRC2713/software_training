---
title: "State machines in code"
goal: "Turn the state diagram from last lesson into Python with an Enum, transitions, and the loop that drives them."
order: 210
section: "State Machines"
---

# The current state is just a variable

[Last lesson](#/lesson/20-state-machines) you drove state machines as diagrams: a machine sits in one state and
moves along an arrow when an event happens. Now we write that in Python, and the
first piece is something you already know cold. **The current state is just a
variable.**

To list the allowed states clearly, Python gives us `Enum` from the standard
library:

```python
from enum import Enum

class MatchMode(Enum):
    DISABLED = "disabled"
    AUTO = "auto"
    TELEOP = "teleop"

state = MatchMode.DISABLED

match state:
    case MatchMode.DISABLED:
        print("Motors locked")
    case MatchMode.AUTO:
        print("Running autonomous")
    case MatchMode.TELEOP:
        print("Driver control")
```

That's the match-mode cycle from [lesson {n}](#/lesson/20-state-machines). `MatchMode` lists the three
legal modes, one variable `state` holds which mode the robot is in right
now, and `match` picks the behavior for that mode (you can also write the same
checks with `if` and `elif` from [lesson {n}](#/lesson/09-if-statements) and `==` from [lesson {n}](#/lesson/16-booleans)).
The glowing box in the diagram *is* this variable, nothing more.

Run it, then change `state` to `MatchMode.AUTO` and run again. Same code,
different state, different behavior. Notice the robot can only be in one mode at a
time, because a variable holds one value, which is the exact rule the diagram
enforced.

# Moving between states

A diagram's arrows said how to move. In code, a transition is just **changing
the variable**. Let's package "what comes next" as a function ([lesson {n}](#/lesson/11-writing-methods)):

```python
from enum import Enum

class MatchMode(Enum):
    DISABLED = "disabled"
    AUTO = "auto"
    TELEOP = "teleop"

def next_state(state):
    match state:
        case MatchMode.DISABLED:
            return MatchMode.AUTO
        case MatchMode.AUTO:
            return MatchMode.TELEOP
        case MatchMode.TELEOP:
            return MatchMode.DISABLED

state = MatchMode.DISABLED
print(state.name)
state = next_state(state)
print(state.name)
state = next_state(state)
print(state.name)
```

Each `state = next_state(state)` is one press of **timer done** from the
diagram: it looks at where the robot is and hands back where it goes. Run it and watch
`DISABLED → AUTO → TELEOP`. The reassignment trick from [lesson {n}](#/lesson/07-variables) is doing the
real work. The machine "moves" because we overwrite `state` with its next value.

# The loop that drives it

Here's the idea the whole season rests on: a robot doesn't run its code once
and stop. It runs the same update **over and over, many times a second**.
That's a loop ([lesson {n}](#/lesson/10-loops)), and dropping our machine inside one makes it *go*:

```python
from enum import Enum

class MatchMode(Enum):
    DISABLED = "disabled"
    AUTO = "auto"
    TELEOP = "teleop"

def next_state(state):
    match state:
        case MatchMode.DISABLED:
            return MatchMode.AUTO
        case MatchMode.AUTO:
            return MatchMode.TELEOP
        case MatchMode.TELEOP:
            return MatchMode.DISABLED

state = MatchMode.DISABLED
for tick in range(6):
    print(tick, state.name)
    state = next_state(state)
```

Each time around the loop is one **tick**: print where the robot is, then advance.
Run it and watch the match cycle `DISABLED → AUTO → TELEOP → DISABLED → AUTO …`,
driven entirely by that one repeating step. A real robot's loop is this exact
shape, just running 50 times a second instead of 6.

Your turn: add a fourth state, `ENDGAME = "endgame"`, that the match enters
after `TELEOP` and leaves back to `DISABLED`. You'll change `next_state` in two
spots: make `case MatchMode.TELEOP:` return `MatchMode.ENDGAME`, and add a
new `case MatchMode.ENDGAME:` that returns `MatchMode.DISABLED`. That's the same
as adding a box and rerouting the arrows in the diagram. Run the loop and
confirm your new state shows up in the cycle.
