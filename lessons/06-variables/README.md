---
title: "Lesson 6: Naming things"
goal: "Store a value under a name so you can reuse it and change it in one place."
order: 6
---

# A name for a value

Back in the very first lesson, every **number block** held a value, and arrows
carried that value forward to the blocks that needed it. In Python we do the
same thing with a **variable**: a name that stands for a value.

```python
name = "Ada"
print("Hello,", name)
```

Read the `=` as "gets" or "is set to," **not** as "equals" from math. It means:
take the value on the right, and store it under the name on the left. After that
line runs, the name `name` holds the text `"Ada"`, and anywhere you write `name`
the computer reaches in and uses that value.

`print` can show more than one thing at once if you separate them with commas —
it prints them on one line with a space in between. So this program prints
`Hello, Ada`.

Press **Run**. Then change `"Ada"` to your own name and run again. Notice you
only had to change it in **one place**, even though the name gets *used* on the
next line. That's the whole point of giving a value a name.

# Use a name as many times as you like

A variable earns its keep when you use it more than once. Because the value
lives in one place, you write it once and reuse the name everywhere:

```python
team = 2713
print("We are FRC", team)
print("Go", team, "!")
print(team, "is the best number")
```

Every line reaches for the same stored value. Change `2713` to any number and
run it — all three lines update together, because they all point at the same
variable. Imagine if you'd typed the number out by hand three times instead:
you'd have to find and fix every copy. One name, one place to change.

You can name a value anything you like, as long as it starts with a letter and
has no spaces. Good names describe what the value *is* — `team`, `score`,
`name` — so the program reads almost like English. `x` works too, but future-you
will thank present-you for `score`.

# A variable can vary

Here's where the name earns the word *variable*: the value it holds can
**change** while the program runs. Assigning to a name a second time replaces
what was there before.

```python
score = 0
print("Starting score:", score)

score = 10
print("After scoring:", score)

score = score + 5
print("After a bonus:", score)
```

Read those last two carefully. `score = 10` throws away the old `0` and stores
`10`. Then `score = score + 5` looks confusing until you remember `=` means
"gets set to," not "equals": the computer works out the right side first
(`10 + 5 = 15`), then stores that back into `score`. This "take the value, change
it, put it back" pattern is exactly the running total the **repeat** block kept
in lesson 3 — a value that updates itself, one step at a time.

Your turn: add a line that gives a `10` penalty (subtract, don't add), then
print the score again. Predict the final number before you run it.
