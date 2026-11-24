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

class LightState(Enum):
    RED = "red"
    GREEN = "green"
    YELLOW = "yellow"

state = LightState.RED

match state:
    case LightState.RED:
        print("STOP")
    case LightState.GREEN:
        print("GO")
    case LightState.YELLOW:
        print("SLOW DOWN")
```

That's the traffic light from [lesson {n}](#/lesson/20-state-machines). `LightState` lists the three
legal states, one variable `state` holds which state the machine is in right
now, and `match` picks the behavior for that state (you can also write the same
checks with `if` and `elif` from [lesson {n}](#/lesson/09-if-statements) and `==` from [lesson {n}](#/lesson/16-booleans)).
The glowing box in the diagram *is* this variable, nothing more.

Run it, then change `state` to `LightState.GREEN` and run again. Same code,
different state, different behavior. Notice you can only be in one state at a
time, because a variable holds one value, which is the exact rule the diagram
enforced.

# Moving between states

A diagram's arrows said how to move. In code, a transition is just **changing
the variable**. Let's package "what comes next" as a function ([lesson {n}](#/lesson/11-writing-methods)):

```python
from enum import Enum

class LightState(Enum):
    RED = "red"
    GREEN = "green"
    YELLOW = "yellow"

def next_state(state):
    match state:
        case LightState.RED:
            return LightState.GREEN
        case LightState.GREEN:
            return LightState.YELLOW
        case LightState.YELLOW:
            return LightState.RED

state = LightState.RED
print(state.name)
state = next_state(state)
print(state.name)
state = next_state(state)
print(state.name)
```

Each `state = next_state(state)` is one press of **timer done** from the
diagram: it looks at where we are and hands back where we go. Run it and watch
`RED → GREEN → YELLOW`. The reassignment trick from [lesson {n}](#/lesson/07-variables) is doing the
real work. The machine "moves" because we overwrite `state` with its next value.

# The loop that drives it

Here's the idea the whole season rests on: a robot doesn't run its code once
and stop. It runs the same update **over and over, many times a second**.
That's a loop ([lesson {n}](#/lesson/10-loops)), and dropping our machine inside one makes it *go*:

```python
from enum import Enum

class LightState(Enum):
    RED = "red"
    GREEN = "green"
    YELLOW = "yellow"

def next_state(state):
    match state:
        case LightState.RED:
            return LightState.GREEN
        case LightState.GREEN:
            return LightState.YELLOW
        case LightState.YELLOW:
            return LightState.RED

state = LightState.RED
for tick in range(6):
    print(tick, state.name)
    state = next_state(state)
```

Each time around the loop is one **tick**: print where we are, then advance.
Run it and watch the light cycle `RED → GREEN → YELLOW → RED → GREEN …`,
driven entirely by that one repeating step. A real robot's loop is this exact
shape, just running 50 times a second instead of 6.

Your turn: add a fourth state, `FLASHING = "flashing"`, that the light enters
after `YELLOW` and leaves back to `RED`. You'll change `next_state` in two
spots: make `case LightState.YELLOW:` return `LightState.FLASHING`, and add a
new `case LightState.FLASHING:` that returns `LightState.RED`. That's the same
as adding a box and rerouting the arrows in the diagram. Run the loop and
confirm your new state shows up in the cycle.
