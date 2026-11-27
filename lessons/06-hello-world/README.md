---
title: "Hello, World!"
goal: "Explain what a program actually is, then write and run your first one."
order: 60
section: "Python Fundamentals"
---

# What is a program?

You've already been building programs as flowcharts of blocks. Everything you did there carries over: doing steps in order ([lesson {n}](#/lesson/01-flowcharts)), making decisions ([lesson {n}](#/lesson/02-conditionals)), repeating steps ([lesson {n}](#/lesson/03-loops)), and packaging steps into reusable pieces ([lesson {n}](#/lesson/04-functions)). From here on we write those same ideas as **text** instead of wiring boxes together. The concepts don't change, only the notation does, and [last lesson](#/lesson/05-what-is-java) you met that notation: colons, indentation, parentheses, commas, and quotes.

A **program** is a list of instructions, written in a language a computer can follow step by step, in order.

That's it. Not magic, just a pre-match checklist: "Zero the gyro. Spin up the flywheel. Drive forward two meters." A robot program is the same idea, except the robot controller follows your instructions *exactly* as written, including your mistakes.

Everything you learn here builds the foundation you'll use for FRC robot software, simulations, and team tools.

# Your first program

When a robot boots up on the workbench, the first thing you want to know is that it is alive and talking to the driver station. Here is a complete, one-line Python program that prints its first message:

```python
print("Hello, world!")
```

`print` is a function that means "show this on the console." The text in quotes is exactly what gets shown. The robot doesn't know that `Hello, world!` is a greeting; it just does what it's told with the data it's given. Each instruction sits on its own line, with no semicolon needed at the end.

Two things to know about the playground before you press Run:

- The **first Run loads Python** in your browser, so it can take a few extra seconds. After that, runs are quick.
- A single `print(...)` line is already a complete Python program. Later, in [lesson {n}](#/lesson/11-writing-methods), you'll learn how to package instructions into your own functions.

Press **Run** and watch the output panel below the code.

Now break it on purpose. Try changing the text between the quotes, removing a quote, or deleting a parenthesis, and hit Run again each time. Reading error messages without panicking is one of the most useful skills in programming. You'll see plenty of them, and every one is Python telling you what it didn't understand.

# Your turn

Edit the code below so the robot announces itself to the driver station with **your robot's name or team number** instead of `world`. Run it to check.

```python
print("Hello, world!")
```

Once that works, add a second line that prints a startup status, like `"Battery checked"` or `"Autonomous armed"`. Each `print(...)` line runs in order, top to bottom, and produces its own line of output.
