---
title: "Lesson 17: State machines as diagrams"
goal: "See a machine that's always in exactly one state and moves between states when events happen — before writing a line of code."
order: 17
section: "State Machines"
---

# One state at a time

Back in [the first lessons](#/lesson/01-flowcharts) you built flowcharts and watched the computer walk
them one step at a time. Now we meet the idea the whole rest of the season is
built on: the **state machine**. It's how our robots will think this year, so
we'll learn it the same way we learned everything else — **as a diagram first**,
then in code.

A state machine is simple to say: the machine is **always in exactly one
state**, and it **moves to another state when an event happens**. That's it.
Here's the classic example — a traffic light. Each rounded box is a **state**;
each arrow is a **transition**, labelled with the **event** that triggers it.

```blocks
preset: sm-demo
```

The light is glowing on its current state. There's one event here — the timer
finishing — so press **timer done** and watch the machine move: `RED → GREEN →
YELLOW → RED`, forever. Notice what you *can't* do: the light can't be red and
green at once, and it can't jump from red straight to yellow. One state at a
time, and it only moves the way an arrow allows. That restriction is the whole
point — it's what makes the behavior predictable.

# Events, and what gets ignored

A traffic light only had one event. A real mechanism has several, and here's the
key idea: **a state only reacts to the events it has an arrow for — everything
else, it ignores.**

This machine is a **game-piece handler**, the kind of thing our robot runs: it
starts `EMPTY`, takes a piece in, holds it, and shoots. It listens for three
events — the driver's button, a sensor seeing a piece, and a shot finishing.

```blocks
preset: sm-edit
```

Drive it the "happy path" first: `EMPTY` → press **driver button** → `INTAKING`
→ press **piece detected** → `LOADED` → press **driver button** → `SHOOTING` →
press **shot done** → back to `EMPTY`.

Now try to break it. While it's `EMPTY`, press **shot done**. Nothing happens —
`EMPTY` has no arrow for that event, so the machine simply ignores it. Press
**piece detected** while `LOADED`; ignored again. This is the safety you get for
free: the machine *can't* shoot when it's empty, because there's no path to
`SHOOTING` from `EMPTY`. You don't write code to forbid the bad cases — you just
don't draw those arrows.

Watch the status line under the canvas as you press things; it tells you each
move it makes, or that an event was ignored.

# Build one yourself

Your turn to design a machine. This one's a **climber**: it stows, extends up,
sits extended, then retracts back down. The four states are already placed —
your job is to draw the **arrows** between them, because *the transitions are the
machine.*

```blocks
preset: sm-build
```

Here's the behavior to build:

- `STOWED` → on **button** → `EXTENDING`
- `EXTENDING` → on **at top** → `EXTENDED`
- `EXTENDED` → on **button** → `RETRACTING`
- `RETRACTING` → on **at bottom** → `STOWED`

To draw an arrow, first pick its event in the **new arrow** menu, then drag from
one state to the next. When all four are wired, drive your machine with the event
buttons and confirm it cycles all the way around and back to `STOWED`.

Then make it your own: add a state with **＋ state** (say, an `EMERGENCY STOP`
everything can fall into), or a real mechanism from this year's robot. Sketch its
states, decide what event moves between each, and wire it up.

Everything you just did by hand — states, events, transitions, ignoring the
events that don't apply — is exactly what we'll write in Java [next lesson](#/lesson/18-state-machines-in-code). The
diagram *is* the program; the code just spells it out.
