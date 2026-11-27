---
title: "Decisions in code, revisited"
goal: "Rewrite if/elif chains as match/case statements, including over an Enum, and use conditional expressions for one-line decisions."
order: 260
section: "Advanced Python"
---

# match: one question, many answers

Your robot's mechanisms work in practice now. This section upgrades that code for
competition: cleaner dispatch, smarter enums, hardware interfaces for simulation,
and fluent motor configs.

[Lesson {n}](#/lesson/22-events-and-transitions) dispatched on an event string with `if`/`elif`. That works, but when every branch tests the *same* variable against different exact values, Python 3.10+ has a cleaner shape built for it: **`match`** and **`case`**.

```python
event = "button"

if event == "button":
    print("driver pressed the button")
elif event == "sensor":
    print("sensor tripped")
elif event == "done":
    print("shot finished")
else:
    print("unknown event")
```

Same behavior, written with `match`:

```python
event = "button"

match event:
    case "button":
        print("driver pressed the button")
    case "sensor":
        print("sensor tripped")
    case "done":
        print("shot finished")
    case _:
        print("unknown event")
```

Run it, then change `event` to `"sensor"` and `"nonsense"` and run again. Three things to notice:

- **`case value:`** replaces `elif event == value:`. Python checks `event` against each case in order and runs the first one that matches.
- **`case _:`** replaces the final `else`. The underscore is a wildcard that catches anything that did not match an earlier case.
- **No `break` needed.** Once a case runs, Python exits the `match` block automatically. It never falls through into the next case.

# match on an enum

`match` shines when the value you're checking is an **`Enum`**, because every legal value is listed in one place. Here is [lesson {n}'s](#/lesson/23-organizing-a-machine) `on_enter`, rewritten:

```python
from enum import Enum


class HandlerState(Enum):
    EMPTY = "empty"
    INTAKING = "intaking"
    LOADED = "loaded"
    SHOOTING = "shooting"


def on_enter(state: HandlerState) -> None:
    match state:
        case HandlerState.INTAKING:
            print("  -> intake motor ON")
        case HandlerState.SHOOTING:
            print("  -> shooter spinning up!")
        case HandlerState.EMPTY:
            print("  -> motors off, waiting")
        case _:
            pass


on_enter(HandlerState.SHOOTING)
on_enter(HandlerState.LOADED)
```

Run it. `SHOOTING` prints the spin-up message, and `LOADED` prints nothing because it hits `case _:` and does `pass` on purpose.

Notice that each case writes the full dotted name, `HandlerState.INTAKING`, not just `INTAKING`. In Python's `match` statement, a bare name without a dot tells Python to *capture* the value into a new variable instead of comparing against a constant. Always include the enum class name with the dot.

Compare this to the `if state == HandlerState.INTAKING:` chain from [lesson {n}](#/lesson/23-organizing-a-machine). Same logic, less repetition, and easier to scan when a state list grows long.

# Conditional expressions: a decision in one line

Some decisions are too small for a four-line `if`/`else`. When you only need to pick one of two values, Python's **conditional expression** does it on one line:

```python
ready = True
status = "GO" if ready else "WAIT"
print(status)
```

Read it almost like English: *"`"GO"` if `ready`, else `"WAIT"`."* Change `ready` to `False` and run again to see `status` flip. It is the exact same two-branch `if`/`else` from [lesson {n}](#/lesson/09-if-statements), squeezed onto one line because both branches produce a single value rather than running a block of statements.

Here is a realistic use based on the ready check from [lesson {n}'s](#/lesson/19-encapsulation) `Flywheel`:

```python
rpm = 4800.0
message = "shooter ready" if rpm >= 4500.0 else "still spinning up"
print(message)
```

Your turn: write a function `describe(state: HandlerState) -> str` that returns a description using `match`, with one case per state plus `case _:`. Call it for `HandlerState.EMPTY` and print the result with a conditional expression tacked on: append `" (idle)"` if the state is `HandlerState.EMPTY`, or `""` otherwise.
