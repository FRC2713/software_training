---
title: "Programs are step-by-step"
goal: "Follow a robot flowchart from START to END and watch the computer run one instruction at a time."
order: 10
section: "Programming with Blocks"
---

# One step at a time

Your robot is powering on for the first time, and it knows nothing about FRC yet. Before we write a single line of Python, let's get the big idea out of the way: **a program is a list of instructions, and the robot runs them one at a time, in order.** It never skips ahead, and it never runs two steps at once by accident. It finishes one box, updates its memory, and follows the arrow to the next box.

A **flowchart** shows that exact journey from **START** to **END**:

- Each **box** is one instruction, like storing a number or doing math.
- Each **arrow** shows which step runs next.
- **Robot Memory** at the bottom shows the named values the robot is remembering right now.

The flowchart here teaches the robot how an FRC **autonomous score** works: `3` coral at `4` points each, plus a `3`-point bonus for leaving the starting zone.

Press **▶ Run** (or click **⏭ Step** to advance one instruction at a time) and
watch **Robot Memory** update as each box lights up. You can also click
**Peek at Python** to see the exact same steps written as real Python code.

```blocks
preset: sequence
```

# Order matters because steps share memory

Notice how `points` changed twice during the run:

1. First, `points = coral × 4` stored `12` in Robot Memory.
2. Next, `points = points + 3` read that `12`, added `3`, and updated `points`
   to `15`.

If you tried to add the bonus *before* calculating `coral × 4`, `points`
wouldn't even exist yet! **Later steps depend on what earlier steps stored in
memory** — that's why top-to-bottom order is the foundation of every program.

Now experiment. The `coral` and `leave_bonus` boxes are **editable** — click a
number to change it, predict the new score in your head, then **Step** through
to check your prediction.

Some things to try:
- Score `5` coral with a `3`-point leave bonus. What does `points` reach?
- What if the robot didn't leave the starting zone (`leave_bonus = 0`)?
- What if `coral = 0` and `leave_bonus = 0`?

```blocks
preset: edit-values
```

# Build your own scoring flowchart

Time to build a flowchart yourself. Suppose our robot took `8` shots
(`attempts`) and dropped `3` of them (`dropped`), and each scored coral is worth
`4` points.

**How to build:**
- **Drag a block** from the palette into the drop slot (or click its **`+`**
  button to insert it).
- Use the **↑ / ↓** arrows on any block you added to change the order, or the
  **trash icon** to remove it.
- Press **▶ Run** or **⏭ Step** to trace your program. **Clear run** resets only
  the animation (your blocks stay safe); **Start over** resets the whole canvas.

Your challenge: assemble the steps so the robot computes
**`(attempts − dropped) × 4`** and outputs `score`. Try putting the multiply
block *before* the subtract block once just to see what happens when a step
reads a variable that hasn't been calculated yet — then put them in the right
order and click **✓ Check** to test your flowchart against three match
scenarios!

```blocks
preset: build
```
