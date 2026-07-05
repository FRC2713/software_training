---
title: "Lesson 13: True, False, and combining conditions"
goal: "Treat yes/no answers as real values and combine them with and, or, and not to make safe decisions."
order: 13
section: "Python Fundamentals"
---

# Yes and no are values too

Back in [lesson 8](#/lesson/08-if-statements), an `if` asked a question like `score > 10` and acted on the
answer. That answer is a real value with a name: a **boolean**, which is either
`True` or `False` — the only two it can ever be. Every comparison *produces* one:

```python
score = 15
print(score > 10)
print(score == 20)
print(score < 5)
```

Run it: `True`, `False`, `False`. So `score > 10` isn't magic that only works
inside an `if` — it's an expression that evaluates to `True` or `False`, and you
can store it in a variable just like a number:

```python
enabled = True
at_limit = False
print(enabled)
```

Booleans are how a robot represents every yes/no fact about itself: *is the
robot enabled? is the arm at its limit? is the button pressed?* Each is one
`True`/`False` value. An `if` simply runs its block when the boolean is `True`.

# Two questions at once: and / or

Real decisions rarely hinge on a single fact. "Run the shooter **only if** it's
spun up **and** we have a game piece." Python joins conditions with **`and`** and
**`or`**:

- `A and B` is `True` only when **both** are true.
- `A or B` is `True` when **at least one** is true.

```python
spun_up = True
has_piece = True
print(spun_up and has_piece)

battery = 11.5
print(battery > 12 or battery > 11)
```

The first prints `True` — both facts hold, so the shooter's clear to fire. In
the second, the battery isn't above 12, but it *is* above 11, and `or` only
needs one side to be true, so you get `True`.

Put it to work in a real safety check — a motor that should only run when the
system is enabled **and** hasn't hit its limit:

```python
enabled = True
at_limit = False
if enabled and at_limit == False:
    print("Motor running")
else:
    print("Motor held")
```

# not: flipping an answer

`at_limit == False` works, but there's a cleaner way to say "the opposite of
this." **`not`** flips a boolean: `not True` is `False`, and `not False` is
`True`.

```python
at_limit = False
print(not at_limit)
```

So `not at_limit` reads as "not at the limit" — which is exactly the English you
meant. Rewrite the safety check with it and it reads like a sentence:

```python
enabled = True
at_limit = False
if enabled and not at_limit:
    print("Motor running")
else:
    print("Motor held")
```

"If enabled and not at the limit, run." That's the goal of good conditions: code
that says what it means. Flip `enabled` to `False`, or `at_limit` to `True`, and
confirm the motor is held every time either safety fails.

Your turn: a climber should only extend when `enabled` is true, `at_limit` is
false, **and** the match timer `time_left` is under 30 seconds. Write the single
`if` (using `and` and `not`) that prints `"Climb!"` only when all three hold. Set
up variables and test it with a few combinations — especially the ones that
should *refuse* to climb.
