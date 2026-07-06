---
title: "Lesson 9: Loops in code"
goal: "Repeat steps in Java with for and while instead of copying lines."
order: 9
section: "Java Fundamentals"
---

# Repeat, in text

In [lesson 3](#/lesson/03-loops) the **repeat** block did a step over and over so you didn't have to
copy it out by hand. Java's version is the **`for` loop**, and it comes with a
built-in counter. Meet the counter first:

```java
for (int i = 0; i < 5; i++) {
    System.out.println("This is loop number " + i);
}
```

The header has **three slots**, separated by semicolons:

- `int i = 0` — **start**: create a counter variable `i` holding `0`.
- `i < 5` — **keep going while**: before each pass, check this question; the
  loop runs only while it's true.
- `i++` — **step**: after each pass, bump `i` up by one (`i++` is shorthand
  for `i = i + 1`).

Those are the same three ideas the repeat block had — a start, a count, and a
step. The braces hold the step that repeats, just like `if` in [lesson 8](#/lesson/08-if-statements).

Run it and watch `i` climb: `0`, `1`, `2`, `3`, `4` — five passes, and the loop
hands you the "which time around am I?" number on every one, free of charge.
(Programmers start counting at zero; you'll see why it's handy in [lesson 11](#/lesson/11-arrays).)

Once the counting makes sense, put the loop to work: change the middle slot to
`i < 3`, then `i < 10`, and watch the count follow. Then swap the print line
for `System.out.println("Go team!");` — same loop, but now it just repeats a
step five times. You don't have to *use* `i` for the loop to do its job of
repeating.

# A running total

The real power of [lesson 3's](#/lesson/03-loops) repeat block was the **running total** — a value it
remembered and updated each time around. You build that yourself in a `for`
loop by combining it with a variable ([lesson 6](#/lesson/06-variables)):

```java
int total = 0;
for (int i = 0; i < 5; i++) {
    total = total + 3;
    System.out.println("So far: " + total);
}
System.out.println("Final total: " + total);
```

Trace it: `total` starts at `0`, and each pass adds `3`, so it climbs `3`, `6`,
`9`, `12`, `15` — the exact sequence the "repeat +" block produced. The pattern
is *declare a starting value before the loop, update it inside the loop.*
That's how many identical steps add up to one answer.

Try it yourself: change the starting value, the loop count, or the amount you
add. Then make a **multiplying** total — start at `1` and do
`total = total * 2` each pass — and check you get `2`, `4`, `8`, `16`, `32`,
just like the "repeat ×" block.

# When you don't know the count: while

A `for` loop repeats a **known** number of times. But sometimes you need to
keep going *until something happens*, and you don't know how many steps that'll
take. That's a **`while` loop**: it repeats as long as a question stays true.

```java
int countdown = 5;
while (countdown > 0) {
    System.out.println(countdown);
    countdown = countdown - 1;
}
System.out.println("Liftoff!");
```

Each time around, Java re-checks `(countdown > 0)`. As long as it's true, it
runs the braced steps; the moment it's false, the loop stops and the program
moves on. Here we count `5, 4, 3, 2, 1` and then lift off. Notice the loop
**changes the thing it's checking** (`countdown` shrinks each pass) — that's
essential.

If a `while` loop never changes its condition, it runs **forever** — an
"infinite loop," the most common beginner bug. Delete the
`countdown = countdown - 1;` line in your head and you'll see why: `countdown`
would stay `5` and the question would never turn false.

Your turn: write a `while` loop that starts a `total` at `1`, **doubles** it
each pass, and keeps going *while* `total < 100`. Print `total` each time.
What's the first value it prints that's past 100?
