---
title: "Lesson 28: Interfaces, as diagrams"
goal: "See that a contract can have more than one implementation, and that swapping which one you use changes nothing about the code calling it — before writing a line of Java."
order: 28
section: "Advanced Java"
---

# One contract, two implementations

Every class you've built so far was one specific thing: one `Flywheel`, one
`Climber`. Now meet a different idea: a **contract** — a promise that
"whatever this is, it can do *this one thing*" — with more than one thing
willing to keep that promise.

Here's `MotorIO`: a contract for one action, `getSpeed()`. Below it sit two
things that keep that promise — a **SIM** implementation and a **REAL**
implementation, each holding its own number. A **swap** decides which one
answers when you ask.

```blocks
preset: iface-demo
```

Toggle the swap and watch the result flip between the SIM and REAL numbers.
Notice what *didn't* change: no wire moved. The swap block doesn't care what's
plugged into `a` or `b` — it just asks "whichever one is currently selected,
what's your `getSpeed()`?" That question has the same shape no matter which
implementation answers it.

# Same question, different answers

Try your own values. Edit the SIM and REAL numbers, flip the swap a few
times, and watch the result track whichever side is selected.

```blocks
preset: iface-edit
```

This is the whole idea of an interface, in one sentence: **code that asks the
question doesn't need to know which implementation is answering.** A robot
running in simulation and a robot running on real motors can execute the
*exact same* logic, as long as both sides keep the same promise.

# Build one yourself

Your turn. Place an **interface**, two implementations — one **SIM**, one
**REAL** — and a **swap**, then wire the two implementations into the swap's
two inputs and the swap into the result.

```blocks
preset: iface-build
```

Give your SIM and REAL implementations different numbers, then flip the swap
and confirm the result changes to match. Once it's wired up, try disconnecting
the REAL implementation and wiring in a *second* SIM-style block instead — the
swap still works, because it was never wired to a specific block, only to
"whatever answers the `a` input" and "whatever answers the `b` input."

Everything you just built by hand — a contract, two things that fulfill it,
and code that doesn't care which one it's talking to — is exactly what we'll
write in Java [next lesson](#/lesson/29-interfaces-in-code). The diagram *is*
the pattern; the code just spells it out.
