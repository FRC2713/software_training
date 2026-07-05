---
title: "Lesson 8: Decisions in code"
goal: "Use if, elif, and else to make a program choose between paths."
order: 8
---

# The if block, in text

Remember the **if** block from lesson 2? It asked a true/false question and then
took one path or the other, always throwing one branch away. Python writes that
same idea with the word **`if`**:

```python
temperature = 5
if temperature < 10:
    print("Bring a jacket!")
print("Have a good day.")
```

Three things to notice:

- **The question** is `temperature < 10` — a comparison that works out to `true`
  or `false`, just like the compare block. The colon `:` ends the question.
- **The indented line** (the spaces at the start) is the `✓ then` branch — it
  runs *only* when the question is true.
- **The un-indented line** runs no matter what, because it's not part of the
  `if`.

Indentation is how Python knows which steps belong to the decision. It replaces
the arrows you used to drag into the `if` block. Run it, then change
`temperature` to `20` and run again — the jacket line vanishes, but the "good
day" line always prints.

# Both paths: else

Lesson 2's `if` block always had *two* branches — a `✓ then` and a `✗ else`.
Python spells the second one **`else`**:

```python
score = 7
if score >= 6:
    print("You passed!")
else:
    print("Not yet — try again.")
```

Exactly one of those two blocks runs, every time. If the question is true, you
get the first; otherwise you get the second. The other is skipped — "the road
not taken" from lesson 2, in text form.

One thing to watch closely: that's `>=` ("greater than or equal to"), and the
"is it equal?" test is `==` with **two** equals signs. A single `=` means
"store a value" (lesson 6), so Python uses `==` to *ask* about equality. Mixing
them up is the code version of the `>` vs `≥` bug lesson 2 warned about.

Change `score` to `6`, then `5`, and run each time. Convince yourself `>= 6`
lets a `6` pass but a `5` doesn't.

# More than two paths: elif

Sometimes there are more than two outcomes. `elif` (short for "else if") lets you
ask another question when the previous one was false:

```python
score = int(input("Enter a score out of 100: "))
if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
```

Python checks each question **top to bottom** and takes the **first** one that's
true — then skips all the rest. That order matters: a score of `95` is also `>=
80`, but because `>= 90` is checked first and wins, you never reach the B line.
This is the same "inputs before the things that use them, one step at a time"
discipline from lesson 1.

Run it a few times with different scores. Then your challenge: build a program
that asks for a number and prints whether it's `"negative"`, `"zero"`, or
`"positive"` — three paths, so you'll need an `if`, an `elif`, and an `else`.
