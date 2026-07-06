---
title: "Lesson 2: Making decisions"
goal: "Use a condition to make a program choose between two paths."
order: 2
section: "Programming with Blocks"
---

# When programs choose

So far our flowcharts always did the exact same steps in the exact same order.
Real programs need to **make decisions**: do one thing when the weather is cold,
another when it's warm; show "pass" when a score is high enough, "fail" when it
isn't.

Think of the **if** block as a switch in a circuit. It takes two numbers, `a`
and `b`, and an operator (`>`, `<`, `=`, `≠`) — the question it's asking. Answer
that question and the switch throws power down exactly one of its two output
rails: **✓ true** or **✗ false**. Never both, never neither.

Power alone isn't very interesting, though — you need something wired to the
live rail to actually get a value out. That's what the **outlet** block is
for: it has a `power` input and a `value` input, and it only lets its value
through while its power input is live. Wire a rail into an outlet's `power`,
wire a number into its `value`, and that number appears **only when its rail
is the one that fired.**

The flowchart in the editor finds **the larger of two numbers**. The switch
asks `a > b` — that's `true` here (`7 > 4`) — so it throws power down the
**✓ true** rail. That rail's outlet is wired to `a`, so `7` flows through; the
**✗ false** rail's outlet is wired to `b`, but with no power it reads `?` and
never reaches the result.

Press **▶ Run step by step**. Watch the switch light up its **✓ true** rail —
and only that one — then watch power travel down to the `a`-outlet while the
`b`-outlet stays dark.

```blocks
preset: cond-demo
```

# The road not taken

The key idea: a switch **energizes exactly one rail, every time.** The other
rail gets no power at all — not "a value you don't use," but genuinely no
power, so whatever's wired to it can't produce anything.

The numbers are editable now. Try these and run each time:

- Make `a` **smaller** than `b`. Which rail lights up now? `a > b` is `false`,
  so power goes down **✗ false** instead — and the `b`-outlet is the one that
  lights up.
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

**How:** you have a toolbar with number blocks, four switch variants (`if >`,
`if <`, `if =`, `if ≠`), and an **outlet** block. Drag from a block's bottom
dot to an input dot on top of another to wire things up.

A switch needs `a` and `b` wired in. Each outlet needs two wires: `power` (from
one of the switch's rails) and `value` (the number you want that rail to
produce). Wire both outlets into the result.

Two ways to get the *smaller* number — see if you can find both:

- Use `if <`: ask `a < b`, wire the **✓ true** rail's outlet to `a` and the
  **✗ false** rail's outlet to `b`.
- Or use `if >` and swap which number each outlet is wired to.

Both work, because a decision is really just "which of these two values do I
let through?" Run it with different numbers to convince yourself it always
picks the smaller one.

```blocks
preset: cond-build
```
