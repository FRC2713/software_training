---
title: "Lesson 3: Doing things over and over"
goal: "Use a loop to repeat a step many times without copying it out by hand."
order: 3
section: "Programming with Blocks"
---

# Repeating without copying

Imagine you want to add `3` to a number five times. You *could* drag out five
separate `+` blocks and chain them together. But what if it were five hundred
times? Copying a block out by hand stops working fast.

Programs solve this with a **loop**: one block that says "do this step, over and
over, this many times." The **repeat** block in the editor does exactly that. It
has three inputs:

- **start** — the value to begin with.
- **times** — how many times to repeat.
- **by** — the number to apply on each repeat.

This one is a **repeat +**: it starts at `0` and adds `3`, five times over.
Press **▶ Run step by step** and watch the block's value climb — `0`, `3`, `6`,
`9`, `12`, `15`. Each step is the *same* instruction; the loop is just doing it
again with the result so far.

```blocks
preset: loop-demo
```

# A loop keeps a running total

Notice what the repeat block is really doing: it remembers a value, and each
time around it updates that value using the one before it. That "value so far"
is the heart of every loop — it's how five identical steps add up to something.

This block is a **repeat ×**: it starts at `1` and *multiplies* by `2`, four
times. Before you run it, predict the sequence in your head — `1`, then… Run it
and watch: `1`, `2`, `4`, `8`, `16`. Repeated multiplying grows *fast*; that's
the same reason folding a piece of paper in half again and again gets thick so
quickly.

Now experiment. The inputs are editable:

- Change **times** and watch how many steps the loop takes.
- Set **start** to `10` and **by** to `10` — what running total do you get after
  a few repeats?
- What happens with **times** set to `0`? A loop that repeats zero times just
  hands back the value it started with, untouched.

```blocks
preset: loop-edit
```

# Build a loop

Build a repeat block that computes **2 to the 5th power** — that's `2` multiplied
by itself, ending on `32`.

**How:** the toolbar has number blocks, a **repeat +**, and a **repeat ×**.
Drop one in, wire a number into each of its three inputs (`start`, `times`,
`by`), and send its output to the result block.

Think about which pieces you need: to keep multiplying by `2`, what should
`start` be so the very first multiply gives you `2`? How many `times` do you
repeat to land on `32`? Run it step by step and check the climb: `2`, `4`, `8`,
`16`, `32`.

Once that works, try a **repeat +** that counts to `100` — there's more than one
combination of `start`, `times`, and `by` that gets there.

```blocks
preset: loop-build
```
