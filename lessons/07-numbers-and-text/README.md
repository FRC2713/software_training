---
title: "Lesson 7: Numbers and text"
goal: "Tell the two basic kinds of data apart, and convert between them."
order: 7
section: "Python Fundamentals"
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

# Text that looks like a number

Sometimes a value *looks* like a number but is really text — because it's
wrapped in quotes. Python treats it as text, so you can't do math with it:

```python
age = "24"
print(age + 1)
```

Run that. It **crashes** — Python complains it can't add a number (`1`) to text
(`age`). Remember the last page: what looks like `24` is really the string
`"24"`, and you can't add `1` to a string.

The fix is to **convert** the text into a number with `int(...)` ("integer"):

```python
age = "24"
age = int(age)
print("Next year you will be", age + 1)
```

Now `int(age)` turns the text `"24"` into the number `24`, we store it back
(that reassignment trick from lesson 6), and the math works. Run it and confirm.

Conversion goes the other way too. `str(...)` turns a number *into* text, which
you need when you want to glue a number onto a string:

```python
score = 42
print("Your score is " + str(score))
```

Your turn: start with the text `"9"`, convert it with `int`, and print that
number **doubled**. If you get a crash, read it carefully — it's almost always
the computer telling you something is still text when you needed a number, or a
number when you needed text.
