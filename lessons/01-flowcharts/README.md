---
title: "Lesson 1: Programs are step-by-step"
goal: "See a program as a flowchart of blocks and watch the computer evaluate it one step at a time."
order: 1
---

# One step at a time

Before we write a single line of code, let's get the big idea out of the way:
**a program is a list of steps, and the computer does them one at a time, in
order.** It never does two things at once by accident, and it never skips
ahead. It finishes one step, then moves to the next.

A good way to picture this is a **flowchart** — boxes joined by arrows. Each box
does one small thing, and the arrows show what feeds into what. The computer
follows the arrows.

The block editor here is exactly that: a little flowchart that does
math. Read it from top to bottom, the same way you read code:

- The **number** blocks hold values.
- The **+** and **×** blocks each take *two* inputs (the arrows coming in from
  the blocks above them) and produce *one* output.
- The **result** block at the bottom shows the final answer.

Press **▶ Run step by step** and watch. The computer can't multiply until it
knows what `3 + 4` is, so it works out the inner block first, then feeds that
answer forward. That order — inputs before the things that use them — is the
whole game.

```blocks
preset: sequence
```

# Blocks carry values

So this flowchart computes `(3 + 4) × 2`. Notice the computer had to figure out
`3 + 4 = 7` *before* it could do `7 × 2 = 14`. It literally cannot do the
multiply first — one of its inputs doesn't exist yet. **Every block has to wait
for its inputs to be ready.**

That waiting is why order matters, and it's the same reason the lines of a real
program run top to bottom: later steps often depend on what earlier steps
produced.

Now make it your own. The number blocks in the editor are **editable** this
time — click into one and change its value. Before you press Run, try to predict
the new answer in your head. Then run it and check whether the value flowing
into the result block matches what you expected.

Some things to try:
- Set the two top numbers so their sum is `10`. What does the result become?
- Can you make the result equal `0`? (Hint: what times anything is zero?)
- Make the result a **negative** number.

```blocks
preset: edit-values
```

# Build your own math machine

Time to build a flowchart from scratch. This canvas starts with two number
blocks and a result block, and a toolbar for adding more.

**How to work the editor:**

- Click a toolbar button — **number**, **+**, **−**, or **×** — to drop a new
  block onto the canvas. Drag blocks around to arrange them.
- **Connect blocks by dragging** from the little dot on the bottom of one block
  to a dot on the top of another. An operation block has *two* dots on top
  because it needs two inputs; the result block has one.
- Press **▶ Run step by step** to watch your machine evaluate. **Reset** clears
  the shown values so you can run it again.

A block shows `?` when it doesn't have all of its inputs wired up yet — that's
the computer telling you a step is missing.

Your challenge: build a machine that computes **`(8 − 3) × 4`** and check that
the result block lands on `20`. You'll need a subtract block feeding into a
multiply block, just like the very first example — except now *you* decide the
order the computer works in.

```blocks
preset: build
```
