---
title: "Lesson 16: Events and transitions in code"
goal: "Drive a machine from events, and make each state ignore the events it has no transition for."
order: 16
section: "State Machines"
---

# Transitions depend on an event

The traffic light moved on its own — one event, `timer done`, always advanced it.
Real mechanisms wait for **specific events**: a button press, a sensor tripping, a
shot finishing. So a transition depends on **two things**: which state you're in,
*and* which event just happened.

This is the game-piece handler you drove in [lesson 14](#/lesson/14-state-machines). Here's a single transition
from it:

```python
state = "empty"
event = "button"

if state == "empty" and event == "button":
    state = "intaking"

print(state)
```

The `and` ([lesson 13](#/lesson/13-booleans)) is the key: the machine only moves when it's in `empty`
**and** the driver's `button` event happened. Run it — `empty` becomes
`intaking`. Change `event` to `"sensor"` and run again: nothing changes, because
`empty` has no transition for `sensor`. That's the diagram's "ignore" behavior,
falling straight out of an `if` that doesn't match.

# The whole machine — and what it ignores

Now the full handler, as an `update` function that takes the current state and an
event and returns the new state:

```python
def update(state, event):
    if state == "empty" and event == "button":
        return "intaking"
    elif state == "intaking" and event == "sensor":
        return "loaded"
    elif state == "loaded" and event == "button":
        return "shooting"
    elif state == "shooting" and event == "done":
        return "empty"
    return state

print(update("empty", "done"))
print(update("empty", "button"))
print(update("loaded", "sensor"))
```

Look hard at that **last line, `return state`**. If none of the transitions
matched, the machine stays exactly where it was. That one line *is* "a state
ignores events it has no arrow for" — the safety you got for free in the diagram.

Run it: `update("empty", "done")` returns `empty` (ignored — you can't finish a
shot you never took), `update("empty", "button")` returns `intaking`, and
`update("loaded", "sensor")` returns `loaded` (ignored — a piece can't load
twice). The machine simply *cannot* reach a bad state, because no path leads
there.

# Feeding it a stream of events

A robot gets a new event every tick. We can simulate a whole match by putting
events in a **list** ([lesson 11](#/lesson/11-lists)) and running them through the machine one at a
time:

```python
def update(state, event):
    if state == "empty" and event == "button":
        return "intaking"
    elif state == "intaking" and event == "sensor":
        return "loaded"
    elif state == "loaded" and event == "button":
        return "shooting"
    elif state == "shooting" and event == "done":
        return "empty"
    return state

events = ["done", "button", "sensor", "button", "done", "sensor"]
state = "empty"
for event in events:
    state = update(state, event)
    print(event, "->", state)
```

Trace the output. That first `"done"` while `empty` does nothing — the machine
shrugs it off — then the real sequence walks `empty → intaking → loaded →
shooting → empty`. This is the loop from [last lesson](#/lesson/15-state-machines-in-code), now fed real events instead
of a timer.

Your turn: write the events list that takes the handler through **two full
cycles** (load and shoot a piece, then do it again). Then slip an out-of-place
event like `"sensor"` in at the start — a real event, just not one `empty` has a
transition for — and confirm the machine ignores it and still ends where you
expect.
