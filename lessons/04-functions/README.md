---
title: "Reusable blocks"
goal: "Package a flowchart into a named function you can call from anywhere instead of rebuilding it."
order: 40
section: "Programming with Blocks"
---

# Jumping into a reusable flowchart

Look to the right of **Main Program**: there is a separate mini-flowchart called
**`double(n)`**. That's a **function** — a small routine you write once, give a
name, and call whenever you need it.

- **`n`** is its **parameter** (the input handed in when you call it).
- Inside, it calculates `result = n × 2` in its own local memory.
- At the bottom, **`RETURN result`** hands the answer back to wherever it was
  called from.

Press **⏭ Step** (or **▶ Run**) and watch closely! When **Main Program** reaches
`boosted = double(speed)`:

1. Execution **pauses** in Main Program and **jumps over to `double(n)`**.
2. `n` receives `5` (the value of `speed`).
3. `double` runs `result = 5 × 2 = 10` (watch **`double()` Local Memory** at the
   bottom!) and returns `10`.
4. Execution **jumps back** to Main Program and stores `10` in `boosted`.

Check the **Call Stack** at the bottom while it's inside `double` — that's how
the computer remembers where to return!

```blocks
preset: fn-demo
```

# Define once, call as many times as you need

Here is why functions are so useful in robot code: **you define the routine
once, then call it as many times as you want with different inputs — and if you
ever need to change how it works, you only change it in one place.**

This program calls `boost_speed(speed)` **twice in a row**. Watch the
**`boost_speed(n)`** card on the right as you step through:

- On the **1st call**, `n` becomes `3` and `boost_speed` returns `6`.
- On the **2nd call**, the *exact same* flowchart runs again, except now `n` is
  `6` and `boost_speed` returns `12`.

Now try editing the **`2`** *inside* the `boost_speed` function on the right
(for example, change it to `3`) and run again. Notice that changing the function
**once** automatically updates **both** calls in Main Program (`3 → 9 → 27`)!

```blocks
preset: fn-chain
```

# Build a match scoring pipeline

Now you have **two** reusable FRC scoring functions defined on the right:
- **`add_leave_bonus(pts)`** — adds `1` bonus point and returns the new score.
- **`coop_double(pts)`** — doubles the score and returns it.

**Your challenge:** starting from `score = 4`, drag function calls into **Main
Program** so that the final match score is **`10`** (and `14` when `score = 6`).

**Order matters!**
- `add_leave_bonus` *then* `coop_double`: `(4 + 1) × 2 = 10`
- `coop_double` *then* `add_leave_bonus`: `(4 × 2) + 1 = 9`

Use the **↑ / ↓** arrows on the blocks you add to test both orders, step through
to watch the values jump into each function on the right, and click **✓ Check**
to verify your solution against all three match scores!

```blocks
preset: fn-build
```
