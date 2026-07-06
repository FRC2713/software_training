---
title: "Lesson 8: Decisions in code"
goal: "Use if, else if, and else to make a program choose between paths."
order: 8
section: "Java Fundamentals"
---

# The if block, in text

Remember the **if** block from [lesson 2](#/lesson/02-conditionals)? It asked a true/false question and then
took one path or the other, always throwing one branch away. Java writes that
same idea with the word **`if`**:

```java
int temperature = 5;
if (temperature < 10) {
    System.out.println("Bring a jacket!");
}
System.out.println("Have a good day.");
```

Three things to notice:

- **The question** goes in parentheses: `(temperature < 10)` — a comparison
  that works out to `true` or `false`, just like the compare block.
- **The curly braces `{ }`** wrap the `✓ then` branch — everything between
  them runs *only* when the question is true. (The indentation is for human
  eyes; Java only cares about the braces.)
- **The last line** runs no matter what, because it's outside the braces — not
  part of the `if`.

The braces replace the arrows you used to drag into the `if` block. Run it,
then change `temperature` to `20` and run again — the jacket line vanishes,
but the "good day" line always prints.

# Both paths: else

[Lesson 2's](#/lesson/02-conditionals) `if` block always had *two* branches — a `✓ then` and a `✗ else`.
Java spells the second one **`else`**:

```java
int score = 7;
if (score >= 6) {
    System.out.println("You passed!");
} else {
    System.out.println("Not yet — try again.");
}
```

Exactly one of those two blocks runs, every time. If the question is true, you
get the first; otherwise you get the second. The other is skipped — "the road
not taken" from [lesson 2](#/lesson/02-conditionals), in text form.

One thing to watch closely: that's `>=` ("greater than or equal to"), and the
"is it equal?" test is `==` with **two** equals signs. A single `=` means
"store a value" ([lesson 6](#/lesson/06-variables)), so Java uses `==` to *ask* about equality. Mixing
them up is the code version of the `>` vs `≥` bug [lesson 2](#/lesson/02-conditionals) warned about.

Change `score` to `6`, then `5`, and run each time. Convince yourself `>= 6`
lets a `6` pass but a `5` doesn't.

# More than two paths: else if

Sometimes there are more than two outcomes. `else if` lets you ask another
question when the previous one was false:

```java
int score = 95;
if (score >= 90) {
    System.out.println("Grade: A");
} else if (score >= 80) {
    System.out.println("Grade: B");
} else if (score >= 70) {
    System.out.println("Grade: C");
} else {
    System.out.println("Grade: F");
}
```

Java checks each question **top to bottom** and takes the **first** one that's
true — then skips all the rest. That order matters: a score of `95` is also
`>= 80`, but because `>= 90` is checked first and wins, you never reach the B
line. This is the same "inputs before the things that use them, one step at a
time" discipline from [lesson 1](#/lesson/01-flowcharts).

Run it, then change `score` to `85`, `72`, and `40` and run each time to see a
different branch win. Then your challenge: build a program that sets a number
in a variable and prints whether it's `"negative"`, `"zero"`, or `"positive"`
— three paths, so you'll need an `if`, an `else if`, and an `else`.
