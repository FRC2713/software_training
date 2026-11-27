---
title: "What is Python?"
goal: "Recognize Python's basic punctuation, indentation, and program shape before writing or running any code."
order: 50
section: "Python Fundamentals"
---

# A language, not a magic spell

Your robot has been learning the basics through block flowcharts ([lesson {n}](#/lesson/01-flowcharts) onward). From here on we write those same robot instructions as **text**, in a language called **Python**.

Why does FRC 2713 teach software fundamentals in Python? Python reads close to plain English and keeps extra boilerplate out of your way, so you can focus on the core ideas: variables, decisions, loops, functions, objects, and state machines. Those concepts carry straight over to any language you use on the team later, including Java for robot code, and Python itself is useful for scripts, data analysis, and team tools.

A programming language is a strict set of grammar rules. English is forgiving. "Robot the on it run" is garbled, yet a person can still guess what you meant. Python won't guess. Every instruction has to follow the rules, or Python stops and points to the exact line that confused it. That isn't the computer being difficult; it's the computer telling you what it needs fixed.

Two habits matter right from the start:

- **Python is case-sensitive.** `Print` and `print` are different words to Python, just like `"Intake"` and `"intake"` are different strings. Spelling has to match, capital letters included.
- **Indentation matters.** Python uses spaces at the start of a line to group steps that belong together. Lining code up isn't just for neatness here; it's part of the grammar.

# The punctuation you'll see everywhere

Before you write a single instruction, it helps to recognize the symbols Python uses to hold instructions together, the same way knowing what a period or a comma does helps you read a new sentence.

```text
:     colon          - starts an indented block of steps
( )   parentheses    - hold the inputs a function needs
,     comma          - separates inputs when there is more than one
" "   quotes         - mark exact text, called a "string"
#     hash           - starts a comment (a note for humans)
```

- **Colons `:`** sit at the end of a header line to say "an indented block of steps comes next." You'll see them on `if` statements, loops, and functions.
- **Parentheses `( )`** hold what an instruction needs to do its job. Some instructions need nothing (`()`), some need one thing, and some need several.
- **Commas `,`** separate those things when an instruction needs more than one, the same job a comma does in "intake, shooter, and climber."
- **Quotes `" "`** mark exact text for Python to use as-is, called a **string**. Anything inside the quotes is data, not instructions, so Python won't try to run it.
- **Hash `#`** starts a **comment**. Anything after `#` on a line is a note for humans, and Python skips right over it.

# Reading a program's shape

Here is a tiny Python program for our robot so you can see those symbols working together:

```text
# announce the robot's current match mode
def announce(mode):
    print("Robot mode: " + mode)

announce("auto")
```

Don't worry about memorizing this yet. You'll learn to write your own functions in [lesson {n}](#/lesson/11-writing-methods). For today, just spot the pieces using the vocabulary above:

- `# announce the robot's current match mode` is a comment that Python ignores.
- `def announce(mode):` defines a reusable block named `announce` that expects one input, `mode`. The colon at the end tells Python an indented block is coming next.
- `    print("Robot mode: " + mode)` is indented by four spaces, so it belongs *inside* `announce`.
- `announce("auto")` is back at the left edge, outside `announce`, so Python runs it and hands `"auto"` into the function.

Notice how indentation shows what belongs to what, just like a box drawn around steps in a flowchart. Python doesn't require an outer wrapper class to start running code, so a one-line script is already a valid program.

You now know enough vocabulary to read Python without getting tripped up by the syntax. Next lesson, you'll run the robot's first real instruction.
