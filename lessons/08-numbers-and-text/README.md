---
title: "Types: numbers and text"
goal: "Tell the basic kinds of data apart, and convert between them."
order: 80
section: "Python Fundamentals"
---

# Numbers are not text

The block editor quietly hid something from you: it only ever dealt with numbers. Real programs juggle different **kinds** of data. Every value in Python has a **type** ([lesson {n}](#/lesson/07-variables)), and the two you'll meet first are:

- **`int`**: a whole number you can do math with, like `7`, `42`, `-3`.
- **`str`**: text, a run of characters wrapped in quotes, like `"7"`, `"hello"`, `"FRC 2713"`.

They look similar but behave differently. Watch:

```python
print(3 + 4)
print("3" + "4")
```

The first line prints `7`, which is math. The second prints `34`, because with text, `+` means **stick these together** (you used it that way in [lesson {n}](#/lesson/07-variables)), not "add." `"3"` and `"4"` aren't numbers to Python; they're characters that happen to look like digits, so Python glues them into `"34"`.

Run it. The lesson: the *quotes* decide everything. `7` is a number you can add; `"7"` is text you can join. Getting these mixed up is one of the most common early bugs, so whenever something misbehaves, ask: *is this a number, or text that looks like a number?*

# Text that looks like a number

Sometimes the field management system or driver station sends a value that *looks* like a number but arrives as text wrapped in quotes, like `"24"`. If you try `"24" + 1` in Python, it stops with a `TypeError` because Python refuses to guess whether you meant `"241"` or `25`.

The fix is to **convert** the text into a real number with `int(...)`:

```python
match_text = "24"
match_number = int(match_text)
print(f"Next up: qualification match {match_number + 1}")
```

Using a separate name for the converted number (`match_text` for the `str`, `match_number` for the `int`) keeps the program easy to read. You can tell at a glance what is text and what is a number, building on the naming habit from [lesson {n}](#/lesson/07-variables). Inside the f-string, Python evaluates `match_number + 1` first before inserting the result, just like inner-first evaluation in [lesson {n}](#/lesson/01-flowcharts).

Conversion goes the other way too: `str(42)` turns a number into the text `"42"`, which is handy whenever you want to join a number onto a string with `+` instead of an f-string.

One more type while we're here: numbers with a decimal point, like a robot battery voltage of `12.5`, use the type **`float`** (short for *floating-point number*):

```python
voltage = 12.5
print(f"Battery: {voltage} volts")
```

Your turn: start with a dashboard reading `coral_text = "9"`, convert it with `int(...)`, and print that number **plus 5** more scored in teleop. Then try removing `int(...)` for a moment and running it to see the `TypeError` Python gives when you mix text and numbers.
