---
title: "Making decisions"
goal: "Use a condition to make a program choose between two paths."
order: 20
section: "Programming with Blocks"
---

# When programs choose

So far our flowcharts always did the exact same steps in the exact same order.
Real programs need to **make decisions**: do one thing when the weather is cold,
another when it's warm; show "pass" when a score is high enough, "fail" when it
isn't.

In a flowchart, a decision is a **diamond**. It takes two numbers, `a` and `b`,
and asks a yes/no question about them — `a > b?` here (the question can also
use `<`, `=`, or `≠`). Then the program follows **exactly one of the two
arrows leaving it**: the `true` arrow when the answer is yes, the `false`
arrow when it's no. Never both, never neither.

Each arrow leads to an **answer** block — the step that runs on that path. An
answer block has two inputs: `when` (wired from one of the diamond's arrows)
and `value` (what to produce if its path is the one taken). The branch the
program doesn't take simply **never runs**.

The flowchart in the editor finds **the larger of two numbers**. The diamond
asks `a > b?` — that's `true` here (`7 > 4`) — so the program follows the
`true` arrow down to the answer wired to `a`, and `7` flows on to the result.

Press **▶ Run step by step**. Watch the diamond answer `true` and the program
head down the `true` arrow — while the other branch **grays out and gets
skipped**. Those blocks never run. This fork is exactly what Java writes as
`if / else` — you'll type it yourself in [lesson {n}](#/lesson/09-if-statements).

```blocks
preset: cond-demo
```

# The road not taken

The key idea: a decision **takes exactly one path, every time.** The other
branch isn't "a value you don't use" — it's code that **never runs**. Watch it
gray out during a run: the computer doesn't even look at it.

The numbers are editable now. Try these and run each time:

- Make `a` **smaller** than `b`. Which arrow does the program follow now?
  `a > b` is `false`, so it takes the `false` branch — and the answer wired to
  `b` is the one that runs while the other side gets skipped.
- Make `a` and `b` **equal**. Is `a > b` true or false when they're the same?
  (This is a classic bug source — "greater than" is not the same as "greater
  than or equal to.")

The result always ends up being whichever number is bigger, no matter which one
you put where. That's the whole point: the program adapts to its inputs instead
of doing one fixed thing.

```blocks
preset: cond-edit
```

# Build a decision

Your turn. Build a flowchart that outputs **the smaller of two numbers** and
check it against a few inputs.

**How:** you have a toolbar with number blocks, four decision diamonds
(`if >`, `if <`, `if =`, `if ≠`), and an **answer** block. Drag from a block's
output dot to an input dot on another block to wire things up.

A diamond needs `a` and `b` wired into its top. Each answer block needs two
wires: `when` (from one of the diamond's `true`/`false` arrows) and `value`
(the number that path should produce). Wire both answers into the result.

Two ways to get the *smaller* number — see if you can find both:

- Use `if <`: ask `a < b`, wire the `true` arrow's answer to `a` and the
  `false` arrow's answer to `b`.
- Or use `if >` and swap which number each answer is wired to.

Both work, because a decision is really just "which path do I take?" — and
each path carries its own answer. Run it with different numbers to convince
yourself it always picks the smaller one.

```blocks
preset: cond-build
```
