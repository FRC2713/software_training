---
title: "Lesson 32: The builder pattern, as diagrams"
goal: "See a configuration accumulate one field at a time through a chain of steps, before writing a line of code."
order: 32
section: "Advanced Java"
---

# Building a config, one step at a time

A real motor needs a pile of settings — a max speed, a current limit, and
more — decided once, up front. Instead of one block that takes every setting
at once, here's a different shape: a **chain**. Each block adds exactly one
setting to whatever configuration flowed in, then passes the whole thing
along to the next block.

```blocks
preset: builder-demo
```

Run it step by step and watch the **result** grow: empty config, then
`{ maxSpeed: 80 }`, then `{ maxSpeed: 80, currentLimit: 40 }`. Nothing gets
overwritten — every step keeps everything the steps before it set, and adds
its own field on top.

# Edit the chain

Change the numbers on each step and re-run. Notice the *shape* of the chain
never changes — configStart, then step, then step, then result — only the
values flowing through it do.

```blocks
preset: builder-edit
```

This is the whole idea of the builder pattern: instead of one giant block
(or one giant constructor call) that takes every setting as a pile of
arguments in a fixed order, you get a **chain of small, named steps**, each
responsible for exactly one setting, that reads top to bottom like a
sentence.

# Build one yourself

Your turn. Place a **new Config()** block, wire in at least three `with...`
steps of your choice, and connect the last one to the **result**.

```blocks
preset: builder-build
```

Try wiring the steps in a different order than you first thought of them —
confirm the final config comes out the same regardless of which order you
chained them in, as long as each field is only set once. Then run it step by
step and watch the result accumulate one field at a time.

Everything you just built here — a chain of small steps, each adding one
setting and handing the rest along — is exactly what we'll write in Java
[next lesson](#/lesson/33-builder-pattern-in-code). The diagram *is* the
pattern; the code just spells it out.
