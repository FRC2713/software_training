---
title: "Lesson 7: Numbers, text, and input"
goal: "Tell the two basic kinds of data apart and read input from the person running the program."
order: 7
---

# Numbers are not text

The block editor quietly hid something from you: it only ever dealt with
numbers. Real programs juggle different **kinds** of data, and the two you'll
meet first are **numbers** and **text**.

- A **number** is a value you can do math with: `7`, `42`, `-3`.
- **Text** is a string of characters wrapped in quotes: `"7"`, `"hello"`,
  `"FRC 2713"`. Python calls text a *string*.

They look similar but behave completely differently. Watch:

```python
print(3 + 4)
print("3" + "4")
```

The first line prints `7` — that's math. The second prints `34`, because with
text, `+` means **stick these together**, not "add." `"3"` and `"4"` aren't
numbers to Python; they're just characters that happen to look like digits, so
it glues them into `"34"`.

Run it. The lesson: the *quotes* decide everything. `7` is a number you can add;
`"7"` is text you can only join. Getting these mixed up is one of the most common
early bugs, so whenever something misbehaves, ask: *is this a number, or text
that looks like a number?*

# Asking a question

Every program so far had its values baked in. To make a program *interactive*,
you ask the person running it for input, using `input(...)`:

```python
name = input("What is your name? ")
print("Nice to meet you,", name)
```

`input` shows your message, waits for the person to type something and press
Enter, and hands back **whatever they typed** as the value. Here we store that
value in `name`, then use it — the same "name for a value" idea from lesson 6,
except now the value comes from a human instead of from your code.

Press **Run** and type an answer when it asks. Then run it again with a
different answer. Same program, different result every time — because it adapts
to its input, exactly like the decision flowcharts adapted to theirs.

# Input is always text

Here's the catch that trips everyone up: **`input` always hands back text**,
even when the person types digits. So you can't do math with it directly:

```python
age = input("How old are you? ")
print("Next year you will be", age + 1)
```

Run that and type a number. It **crashes** — Python complains it can't add a
number (`1`) to text (`age`). Remember the last page: what looks like `25` is
really the string `"25"`, and you can't add `1` to a string.

The fix is to **convert** the text into a number with `int(...)` ("integer"):

```python
age = input("How old are you? ")
age = int(age)
print("Next year you will be", age + 1)
```

Now `int(age)` turns the text `"25"` into the number `25`, we store it back
(that reassignment trick from lesson 6), and the math works. Run it and confirm.

Your turn: write a program that asks for a number, converts it with `int`, and
prints that number **doubled**. If you get a crash, read it carefully — it's
almost always the computer telling you something is still text when you needed a
number.
