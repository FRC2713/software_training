---
title: "Decisions in code"
goal: "Use if, elif, and else to make a program choose between paths."
order: 90
section: "Python Fundamentals"
---

# The decision diamond, in text

Remember the **decision diamond** from [lesson {n}](#/lesson/02-conditionals)? It asked a true/false question about a robot sensor and then took one path or the other, skipping the branch it didn't take. Python writes that same idea with the word **`if`**:

```python
battery = 9
if battery < 10:
    print("Low battery! Slowing drive.")
print("Status check complete.")
```

Three things to notice:

- **The question** follows `if` and ends with a colon `:`. `battery < 10` works out to `True` or `False`, just like the question in the diamond.
- **The indented lines** form the `True` branch. Everything indented under the `if` runs *only* when the question is true.
- **The last line** is back at the left edge, outside the `if`, so it runs no matter what.

Indentation replaces the arrows leaving the diamond. Run it, then change `battery` to `12` and run again. The low-battery warning vanishes, while the status check line always prints.

# Both paths: else

[Lesson {n}'s](#/lesson/02-conditionals) diamond always had *two* arrows, a `true` arrow and a `false` arrow. Python spells the second one **`else:`**:

```python
coral = 7
if coral >= 6:
    print("Ranking point earned!")
else:
    print("Need more coral.")
```

Exactly one of those two blocks runs, every time. If the question is true, you get the first; otherwise you get the second. The other is skipped, "the road not taken" from [lesson {n}](#/lesson/02-conditionals), in text form.

One thing to watch closely: `>=` means "greater than or equal to," and the "is it equal?" test is `==` with **two** equals signs. A single `=` means "store a value" ([lesson {n}](#/lesson/07-variables)), so Python uses `==` to *ask* about equality. Mixing them up is the code version of the `<` vs `≤` bug [lesson {n}](#/lesson/02-conditionals) warned about.

Change `coral` to `6`, then `5`, and run each time. Convince yourself `>= 6` earns the ranking point at `6` while `5` does not.

# More than two paths: elif

Sometimes a match check has more than two outcomes. `elif` (short for "else if") lets your robot ask another question when the previous one was false:

```python
score = 95
if score >= 90:
    print("Match tier: Playoff ready")
elif score >= 80:
    print("Match tier: Strong match")
elif score >= 70:
    print("Match tier: Solid start")
else:
    print("Match tier: Check the pit log")
```

Python checks each question **top to bottom** and takes the **first** one that's true, then skips all the rest. That order matters: a score of `95` is also `>= 80`, but because `>= 90` is checked first and wins, you never reach the `80` line. This is the same "one step at a time, in order" discipline from [lesson {n}](#/lesson/01-flowcharts).

Run it, then change `score` to `85`, `72`, and `40` and run each time to see a different branch win. Then your challenge: set a motor's `speed` in a variable and print whether the motor is `"reversing"` (negative), `"stopped"` (zero), or `"forward"` (positive). That's three paths, so you'll need an `if`, an `elif`, and an `else`.
