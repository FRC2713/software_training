---
title: "Lesson 7: Types — numbers and text"
goal: "Tell the basic kinds of data apart, and convert between them."
order: 7
section: "Java Fundamentals"
---

# Numbers are not text

The block editor quietly hid something from you: it only ever dealt with
numbers. Real programs juggle different **kinds** of data — [lesson 6](#/lesson/06-variables) already
made you name the kind every time you declared a variable. That kind is the
**type**, and the two you'll meet first are:

- **`int`** — a whole number you can do math with: `7`, `42`, `-3`.
- **`String`** — text: a run of characters wrapped in quotes: `"7"`, `"hello"`,
  `"FRC 2713"`.

They look similar but behave completely differently. Watch:

```java
System.out.println(3 + 4);
System.out.println("3" + "4");
```

The first line prints `7` — that's math. The second prints `34`, because with
text, `+` means **stick these together** (you used it that way in [lesson 6](#/lesson/06-variables)),
not "add." `"3"` and `"4"` aren't numbers to Java; they're just characters that
happen to look like digits, so it glues them into `"34"`.

Run it. The lesson: the *quotes* decide everything. `7` is a number you can add;
`"7"` is text you can only join. Getting these mixed up is one of the most
common early bugs, so whenever something misbehaves, ask: *is this a number, or
text that looks like a number?*

# Text that looks like a number

Sometimes a value *looks* like a number but is really text — because it's
wrapped in quotes. Here's the trap, and it's sneakier than a crash:

```java
String age = "24";
System.out.println(age + 1);
```

Run that. It doesn't fail — it prints `241`. Java saw text on the left of the
`+`, so it treated the `1` as text too and **glued** instead of adding. No
error, no warning, just a silently wrong answer — which in a program is far
more dangerous than a crash, because nothing tells you to go looking for it.

The fix is to **convert** the text into a real number with
`Integer.parseInt(...)`:

```java
String ageText = "24";
int age = Integer.parseInt(ageText);
System.out.println("Next year you will be " + (age + 1));
```

Notice we needed a **second variable**. `ageText` is a `String` and its type
can never change — that's the deal Java made with you in [lesson 6](#/lesson/06-variables). So the
converted number gets its own name, `age`, with its own type, `int`. One name
per kind of thing keeps the program honest: you can always tell what's text
and what's a number just by reading the declarations. (The parentheses around
`(age + 1)` make the math happen *before* the joining — remember inner-first
from [lesson 1](#/lesson/01-flowcharts).)

Conversion goes the other way too: `String.valueOf(42)` turns a number into
text — though as you saw, gluing a number onto a string with `+` usually does
that for you.

One more type while we're here: numbers with a decimal point, like a motor
voltage of `12.5`, use the type **`double`**:

```java
double voltage = 12.5;
System.out.println("Battery: " + voltage + " volts");
```

Your turn: start with the text `"9"`, convert it with `Integer.parseInt`, and
print that number **doubled**. If you see `99` instead of `18`, you've just
met the glue-instead-of-add bug from the top of this page — look at where the
conversion happens.
