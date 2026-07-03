---
title: "Lesson 2: Making decisions"
goal: "Use a condition to make a program choose between two paths."
order: 2
---

# When programs choose

So far our flowcharts always did the exact same steps in the exact same order.
Real programs need to **make decisions**: do one thing when the weather is cold,
another when it's warm; show "pass" when a score is high enough, "fail" when it
isn't.

A decision needs two new kinds of block:

- A **compare** block asks a yes-or-no question about two numbers — is `a`
  greater than `b`? Its output isn't a number, it's **`true`** or **`false`**.
- An **if** block takes that true/false answer as its `when` input, and then
  passes along *one* of its other two inputs: the `✓ then` value when the
  answer is true, or the `✗ else` value when it's false.

The flowchart in the editor finds **the larger of two numbers**. It compares
`7 > 4` (which is `true`), so the `if` block sends the `✓ then` value — the `7` —
through to the result.

Press **▶ Run step by step**. Watch the compare block light up with `true`, and
notice that only *one* branch into the `if` block lights up: the path the
program actually takes. The other branch is ignored.

```blocks
preset: cond-demo
```

# The road not taken

The key idea: an `if` block **always throws one of its inputs away.** Every time
it runs, exactly one branch is used and the other is skipped. That's what
"making a decision" means — picking a path and not taking the other.

The numbers are editable now. Try these and run each time:

- Make `a` **smaller** than `b`. Which branch lights up now? The compare block
  says `false`, so the `if` block reaches for its `✗ else` input instead.
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

**How:** you have a toolbar with number blocks, three compare blocks (`>`, `<`,
`=`), and an `if` block. Drag from a block's right dot to an input dot to wire
things up. Remember the `if` block needs three wires: `when` (a true/false
value), `✓ then`, and `✗ else`.

Two ways to get the *smaller* number — see if you can find both:

- Ask `a < b`, then send `a` down the `✓ then` path and `b` down `✗ else`.
- Or ask `a > b` and swap which number goes on each branch.

Both work, because a decision is really just "which of these two values do I let
through?" Run it with different numbers to convince yourself it always picks the
smaller one.

```blocks
preset: cond-build
```
