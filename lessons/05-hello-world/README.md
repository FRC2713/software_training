---
title: "Lesson 5: Hello, World!"
goal: "Explain what a program actually is, then write and run your first one."
order: 5
section: "Python Fundamentals"
---

# What is a program?

You've already been building programs — as flowcharts of blocks. Everything you
did there carries over: doing steps in order ([lesson 1](#/lesson/01-flowcharts)), making decisions
([lesson 2](#/lesson/02-conditionals)), repeating steps ([lesson 3](#/lesson/03-loops)), and packaging steps into reusable pieces
([lesson 4](#/lesson/04-functions)). From here on we write those same ideas as **text** instead of wiring
boxes together. The concepts don't change; only the notation does.

A **program** is just a list of instructions, written in a language a computer
can follow exactly, step by step, in order.

That's it. Not magic — a recipe. "Crack two eggs. Whisk them. Pour into a hot
pan." A computer program is the same idea, except the "kitchen" is the
computer's memory and screen, and the "chef" is the computer itself, which
will follow your instructions *exactly* as written, including your mistakes.

The language we'll use is called **Python**. It reads closer to English than
most programming languages, which makes it a good place to learn the ideas
that show up in every language: giving things names, making decisions,
repeating steps, and organizing instructions into reusable pieces. Those ideas
matter a lot more than Python's specific spelling rules — the syntax is just
the notation we'll use to practice them.

# Your first program

Here is a complete, one-line Python program:

```python
print("Hello, world!")
```

`print` is an instruction that means "show this on the screen." The text in
quotes is exactly what gets shown — computers don't know that `Hello, world!`
is a greeting, they just do what they're told with the data they're given.

Press **Run** and watch the output panel below the code.

Now break it on purpose. Try changing the text between the quotes, or deleting
a quote mark, or removing the parentheses, and hit Run again each time. Reading
error messages without panicking is one of the most useful skills in
programming — you'll see a lot of them, and every one is the computer telling
you exactly what it didn't understand.

# Your turn

Edit the code below so it prints a greeting with **your own name** in it,
instead of `world`. Run it to check.

```python
print("Hello, world!")
```

Once that works, try adding a second line that prints something else about
yourself — your favorite subject, a hobby, anything. Each `print(...)` line
runs in order, top to bottom, and produces its own line of output.
