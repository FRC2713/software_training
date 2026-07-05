---
title: "Lesson 15: State machines in code"
goal: "Turn the state diagram from last lesson into Python — a state variable, transitions, and the loop that drives them."
order: 15
section: "State Machines"
---

# The current state is just a variable

[Last lesson](#/lesson/14-state-machines) you drove state machines as diagrams: a machine sits in one state and
moves along an arrow when an event happens. Now we write that in Python — and the
first piece is something you already know cold. **The current state is just a
variable.**

```python
state = "red"

if state == "red":
    print("STOP")
elif state == "green":
    print("GO")
elif state == "yellow":
    print("SLOW DOWN")
```

That's the traffic light from [lesson 14](#/lesson/14-state-machines). One variable, `state`, holds which state
the machine is in right now; an `if/elif` ([lesson 8](#/lesson/08-if-statements)) picks the behavior for that
state. The glowing box in the diagram *is* this variable — nothing more.

Run it, then change `state` to `"green"` and run again. Same code, different
state, different behavior. Notice you can only be in one state at a time, because
a variable holds one value — exactly the rule the diagram enforced.

# Moving between states

A diagram's arrows said how to move. In code, a transition is just **changing the
variable**. Let's package "what comes next" as a function ([lesson 10](#/lesson/10-writing-functions)):

```python
def next_state(state):
    if state == "red":
        return "green"
    elif state == "green":
        return "yellow"
    elif state == "yellow":
        return "red"

state = "red"
print(state)
state = next_state(state)
print(state)
state = next_state(state)
print(state)
```

Each `state = next_state(state)` is one press of **timer done** from the diagram:
it looks at where we are and hands back where we go. Run it and watch `red →
green → yellow`. The reassignment trick from [lesson 6](#/lesson/06-variables) is doing the real work —
the machine "moves" because we overwrite `state` with its next value.

# The loop that drives it

Here's the idea the whole season rests on: a robot doesn't run its code once and
stop. It runs the same update **over and over, many times a second**. That's a
loop ([lesson 9](#/lesson/09-loops)) — and dropping our machine inside one makes it *go*:

```python
def next_state(state):
    if state == "red":
        return "green"
    elif state == "green":
        return "yellow"
    elif state == "yellow":
        return "red"

state = "red"
for tick in range(6):
    print(tick, state)
    state = next_state(state)
```

Each time around the loop is one **tick**: print where we are, then advance. Run
it and watch the light cycle `red → green → yellow → red → green …`, driven
entirely by that one repeating step. A real robot's loop is this exact shape,
just running 50 times a second instead of 6.

Your turn: add a fourth state, `"flashing"`, that the light enters after
`yellow` and leaves back to `red`. You'll change `next_state` in two spots —
make `"yellow"` return `"flashing"` instead of `"red"`, and add a new `elif` for
`"flashing"` — plus give it a line in the behavior `if/elif`. That's exactly
adding a box and rerouting the arrows in the diagram. Run the loop and confirm
your new state shows up in the cycle.
