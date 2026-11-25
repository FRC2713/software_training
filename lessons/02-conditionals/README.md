---
title: "Making decisions"
goal: "Use a condition diamond to make a program choose one path and skip the other."
order: 20
section: "Programming with Blocks"
---

# When a robot has to choose

So far our flowcharts ran every single box from **START** to **END**. Real
robots have to **make decisions** based on sensors: slow down when the battery
is low, shoot when the target is in range, or stop when an arm hits its limit
switch.

In a flowchart, a decision is a **diamond** (`IF ... ?`). It asks a yes/no
question about the robot's memory — here, `battery < 10 ?` — and then follows
**exactly one** of its two outgoing arrows:

- Follow **YES** when the condition is **True**.
- Follow **NO** when the condition is **False**.

The other branch **grays out and is completely skipped** — none of the steps on
that side ever run. After the taken branch finishes, both paths come back
together and continue to **OUTPUT** and **END**.

Press **▶ Run** or **⏭ Step** on this **Battery Brownout Limiter**. With
`battery = 12`, watch the robot check `12 < 10` (False), follow the **NO**
arrow to set `mode = "FULL POWER"` and `max_speed = 100`, and skip the entire
**YES** branch. Click **Peek at Python** to see how this maps directly to
`if / else` (which you'll write yourself in
[lesson {n}](#/lesson/09-if-statements)).

```blocks
preset: cond-demo
```

# Testing the boundary

A decision **takes exactly one path, every time.** Every step inside the untaken
branch is skipped — the computer doesn't even touch it.

Now both the `battery` voltage and the `IF` condition are editable. Try these
and **Step** through each one:

- Set `battery` to **`9`**. Now `9 < 10` is **YES (True)** — watch the **YES**
  branch run (`mode = "LOW POWER"`, `max_speed = 40`) while the **NO** branch
  grays out.
- Set `battery` to **`10`** — right on the boundary! Is `10 < 10` True or False?
  (This is one of the most common bugs in robotics code: `<` means *strictly
  less than*, while `≤` includes the boundary itself.)
- Try switching `<` to `≤` in the diamond and run `battery = 10` again.

```blocks
preset: cond-edit
```

# Build a shooter range check

Your turn. Our robot has a distance sensor measuring how many meters away the
target is (`distance`).

**Your challenge:**
- If `distance < 3`, the robot should set `action = "SHOOT"`.
- Otherwise (`NO`), the robot should set `action = "DRIVE CLOSER"`.

**How:** drag a block from the palette into the **YES** drop slot and another
into the **NO** drop slot (or click **`+`**). Then click **✓ Check** — it will
automatically test your flowchart with `distance = 2`, the boundary `distance = 3`,
and `distance = 5`!

```blocks
preset: cond-build
```
