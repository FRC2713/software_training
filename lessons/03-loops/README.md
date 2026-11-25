---
title: "Doing things over and over"
goal: "Use a loop with a loop-back arrow to repeat instructions without copying them by hand."
order: 30
section: "Programming with Blocks"
---

# Repeating without copying

If you slam an FRC drive motor straight from `0%` to `100%` speed in one
instant, the wheels slip and the battery voltage drops. Instead, robot code
**ramps** the speed up smoothly in small steps: `+20%`, `+20%`, `+20%`, `+20%`,
`+20%`.

You *could* paste five identical `speed = speed + 20` boxes in a row — until you
need to ramp in 50 steps! Programs solve this with a **loop**:

1. The **REPEAT** header tracks which pass you're on (`Pass 1 / 5`, `Pass 2 / 5`,
   …).
2. The computer runs the step(s) **inside** the loop body.
3. At the bottom of the body, it follows the curved **loop-back arrow** up to the
   top to repeat again.
4. Once all passes finish, it exits through the **DONE** arrow.

Press **▶ Run** or **⏭ Step** and watch the loop-back arrow light up on each
pass while `speed` in **Robot Memory** climbs: `0 → 20 → 40 → 60 → 80 → 100`.
Click **Peek at Python** to see how this becomes a `for` loop in Python.

```blocks
preset: loop-demo
```

# Loops update memory on every pass

The reason a loop can accomplish something different on each pass — even though
it runs the *exact same box* — is that the box reads and updates a variable in
**Robot Memory** every time around.

Here, `power` starts at `1` and **doubles** (`power = power × 2`) on each pass,
four times: `1 → 2 → 4 → 8 → 16`.

Experiment with the editable numbers and step through:
- Change the repeat count to **`5`** or **`6`** — watch how fast repeated
  doubling grows!
- Change the repeat count to **`0`**. What happens? A loop that runs zero times
  skips its body completely and jumps straight to the **DONE** arrow, leaving
  `power` untouched at `1`.
- Change the multiplier from `2` to `3` and predict the result before running.

```blocks
preset: loop-edit
```

# Build a flywheel spin-up loop

Your turn. Build a loop that starts with `power = 1` and ends at **`32`** (which
is 2⁵: `1 → 2 → 4 → 8 → 16 → 32`).

**How:**
- Drag the right step from the palette **inside the REPEAT loop body** (or click
  **`+`**).
- Set the **REPEAT** count to the right number of passes.
- Press **▶ Run** or **⏭ Step** to watch each pass climb toward `32`, then click
  **✓ Check** to verify!

Once that passes, try swapping in `power = power + 10` and adjusting the repeat
count to see how easy it is to change what a loop does.

```blocks
preset: loop-build
```
