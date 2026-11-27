---
title: "Naming things"
goal: "Store a value under a name so you can reuse it and change it in one place."
order: 70
section: "Python Fundamentals"
---

# A name for a value

Back in [the very first lesson](#/lesson/01-flowcharts), every box stored values in **Robot Memory**, and later steps read them back. In Python we do the same thing with a **variable**: a name that stands for a value.

```python
robot_name = "Red Hawk"
print("Booting " + robot_name)
```

Read the `=` as "gets" or "is set to," **not** as "equals" from math. It means: take the value on the right, and store it under the name on the left. After that line runs, `robot_name` holds the text `"Red Hawk"`, and anywhere you write `robot_name` Python reaches in and uses that value.

Every value in Python has a **type**, which is the *kind* of value it is. `"Red Hawk"` is a `str` (short for *string*, meaning text). Python figures out the type from the value you assign, so you don't have to write `str` in front of `robot_name`, and it still tracks the type behind the scenes. More on types in [lesson {n}](#/lesson/08-numbers-and-text).

The `+` between `"Booting "` and `robot_name` **joins** text together into one string, so this program prints `Booting Red Hawk`.

Press **Run**. Then change `"Red Hawk"` to a name for your own robot and run again. Notice you only had to change it in **one place**, even though the name gets *used* on the next line. That's the whole point of giving a value a name.

# Use a name as many times as you like

A variable earns its keep when you use it more than once. Because the value lives in one place, you write it once and reuse the name everywhere. Whole numbers have the type **`int`** (short for *integer*):

```python
team = 2713
print(f"We are FRC {team}")
print(f"Go {team}!")
print(f"{team} is the best number")
```

Every line reaches for the same stored value. Change `2713` to any number and run it. All three lines update together, because they all point at the same variable. Imagine if you'd typed the number out by hand three times instead; you'd have to find and fix every copy. One name, one place to change.

Notice the `f` right before the opening quote, like `f"Go {team}!"`. That is an **f-string** (formatted string). Putting a variable inside `{ }` tells Python to drop its value straight into the text, whether it's a string or a number.

You can name a variable almost anything, as long as it starts with a letter or underscore and has no spaces. Good names describe what the value *is*, like `team`, `score`, or `name`, so the program reads close to English. For multi-word names, Python uses `snake_case` with underscores, like `team_number`. `x` works too, but future-you will thank present-you for `score`.

# A variable can vary

Here's where the name earns the word *variable*: the value it holds can **change** while a match runs. Assigning to a name a second time replaces what was there before.

```python
score = 0
print(f"Match start: {score}")

score = 10
print(f"After autonomous: {score}")

score = score + 5
print(f"After a bonus: {score}")
```

Read those last two assignments carefully. `score = 10` throws away the old `0` and stores `10`. Then `score = score + 5` looks strange until you remember `=` means "gets set to," not "equals." Python works out the right side first (`10 + 5 = 15`), then stores that back into `score`. This "take the value, change it, put it back" pattern is the same running total the **repeat** block kept in [lesson {n}](#/lesson/03-loops), a value that updates itself one step at a time.

Your turn: add a line that takes a `10`-point foul penalty (subtract, don't add), then print the score again. Predict the final number before you run it.
