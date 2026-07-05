---
title: "Lesson 4: Reusable blocks"
goal: "Package a flowchart into a named block you can reuse instead of rebuilding it."
order: 4
section: "Programming with Blocks"
---

# A block with a flowchart inside

Look at the top of the block editor. There's a block called **double**,
and it has its own little flowchart *inside* it: an input `x`, a `× 2`, and an
output. That's a **function** — a small program you've wrapped up and given a
name.

Down in your program, you don't see those inner blocks anymore. You just see one
tidy **double** block. Feed it a number and it hands back that number times two.
Here we give it `5`, and out comes `10`.

Press **▶ Run step by step**. The `double` block lights up and produces `10` —
without you ever having to place the `× 2` yourself. The messy details are
hidden inside; you just *use* the block.

```blocks
preset: fn-demo
```

# Define once, use many times

Here's why functions are worth the trouble: **you build the flowchart once, then
reuse it as many times as you like.**

This program feeds `3` into a `double` block, and then feeds *that* result into
**another** `double` block. Same block, used twice. `3` becomes `6`, and `6`
becomes `12`.

Press **▶ Run step by step** and watch the value pass through both copies. Each
`double` block runs the exact same inner flowchart — you defined it a single
time, but you can drop it in wherever you need it. Imagine the double block
secretly held fifty inner blocks; you'd still just wire up one tidy "double" and
move on.

Change the starting number and run again. Whatever you put in, it comes out
multiplied by four — because doubling twice is the same as ×4.

```blocks
preset: fn-chain
```

# Build with reusable blocks

Now you have **two** reusable blocks in the toolbar: **add 1** (which does
`x + 1`) and **double** (which does `x × 2`). You can see both inner flowcharts
at the top of the panel.

Your challenge: starting from the number `4`, build a program whose result is
**exactly `10`**, using the `add 1` and `double` blocks.

**Order matters** — and this is the whole lesson. `4` fed through *add 1 then
double* gives `(4 + 1) × 2 = 10`. But *double then add 1* gives
`4 × 2 + 1 = 9`. Same two blocks, different order, different answer — just like
the very first lesson, where the computer had to do the inner step before the
outer one.

Wire a block's output into the next block's `x` input to chain them, then send
the last block into the result. Run it step by step and confirm you land on
`10`. Then see what *double then add 1* gives you instead.

```blocks
preset: fn-build
```
