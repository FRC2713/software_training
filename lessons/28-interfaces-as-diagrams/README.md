---
title: "Lesson 28: Interfaces, as diagrams"
goal: "See that a contract can have more than one implementation, and that plugging in something that isn't one shows up as a visible, broken wire — before writing a line of Java."
order: 28
section: "Advanced Java"
---

# One contract, two implementations

Every class you've built so far was one specific thing: one `Flywheel`, one
`Climber`. Now meet a different idea: a **contract** — a promise that
"whatever this is, it can do *this one thing*" — with more than one thing
willing to keep that promise.

Here's `MotorIO`: a contract for one action, `getSpeed()`. Below it sit two
things that could keep that promise — a **SIM** block and a **REAL** block —
and a **declare** block that holds exactly one of them.

```blocks
preset: iface-demo
```

Notice the SIM and REAL blocks each show a `getSpeed()` field with a number in
it — but only because a wire runs down from `MotorIO` into each one. That
wire is what grants them the field in the first place; an implementation
without it would have nothing to offer. `declare` holds the SIM block right
now, so the result is SIM's number. Run it and watch that value flow all the
way down.

# Same question, different answer

To get REAL's answer instead, you don't flip a switch — you change **which
wire** feeds `declare`. Here the same graph is wired to REAL instead, with
different numbers on each implementation:

```blocks
preset: iface-edit
```

Edit the SIM and REAL numbers and re-run. Whichever one `declare` is wired to
is the one whose number reaches the result — same question, same `declare`
block, different answer, entirely because of which implementation is plugged
in underneath it.

This is the whole idea of an interface, in one sentence: **code that asks the
question doesn't need to know which implementation is answering — it only
needs whatever's plugged in to have kept the promise.** A robot running in
simulation and a robot running on real motors can execute the *exact same*
logic, as long as both sides keep the same promise.

# Build one yourself

Your turn. Place an **interface**, two implementations — one **SIM**, one
**REAL** — and a **declare object**, then wire `MotorIO` into both
implementations (watch their `getSpeed()` fields appear) and wire *one* of
them into `declare`.

```blocks
preset: iface-build
```

Now try to break it: drag out a plain **number** block and wire it into
`declare` instead. The wire *does* connect — but it turns dashed with a red
**✕** on it, because `declare` can tell this isn't a real `MotorIO`. Click
**Run step by step** anyway and the result comes back `error`: a wire is not
the same thing as a valid answer. This is exactly what a real
`MotorIO io = someNumber;` line would do in Java — refuse to compile, because
a plain number was never anything the interface promised. Reconnect a real
implementation, confirm the result comes back clean, then try swapping which
implementation feeds `declare` and watch the result change to match.

Everything you just built by hand — a contract, two things that fulfill it,
and a declaration that can tell the difference between a real implementation
and a broken wire — is exactly what we'll write in Java
[next lesson](#/lesson/29-interfaces-in-code). The diagram *is* the pattern;
the code just spells it out.
