---
title: "Lesson 12: Arrays"
goal: "Hold many values in one place, reach any of them by position, and walk through them with a loop."
order: 12
section: "Data Structures"
---

# One name, many values

Every variable so far has held a *single* value: one number, one string. But
real programs deal in **groups** — the six sensor readings on a robot, the names
of everyone on the drive team, the points scored in each match. Java holds a
group in an **array**: values in curly braces, separated by commas.

```java
int[] readings = {12, 47, 3, 88, 21};
System.out.println(readings.length);
System.out.println(Arrays.toString(readings));
```

`readings` is *one* variable holding *five* numbers. Its type, `int[]`, reads
as "array of int" — the square brackets mean "many of these." `.length` tells
you how many are in there — run it and you'll see `5`. An array can hold text
too — `String[] sides = {"front", "back", "left", "right"};` — and every slot
has the type the array declared: an `int[]` holds ints, and nothing else.

(`Arrays.toString(...)` is a helper that prints the whole array nicely;
printing an array directly shows a cryptic id instead of the values.)

The point: instead of `reading1`, `reading2`, `reading3`, `reading4`,
`reading5` — five names to keep straight — you have one name for the whole
batch. That's the whole idea of an array.

# Reaching one item

You pull a single value out of an array by its **position**, written in square
brackets after the name. And here's the catch that trips up everyone: Java
counts positions starting from **0**, not 1 — the same "programmers start at
zero" rule the loop counter followed back in [lesson 10](#/lesson/10-loops).

```java
int[] readings = {12, 47, 3, 88, 21};
System.out.println(readings[0]);
System.out.println(readings[1]);
System.out.println(readings[4]);
```

So `readings[0]` is the **first** item (`12`), `readings[1]` is the second
(`47`), and `readings[4]` is the fifth and last (`21`). That number in brackets
is called the **index**.

Because counting starts at zero, the last index is always `length - 1`, never
`length`. Ask for `readings[5]` and the program fails with an
`ArrayIndexOutOfBoundsException` — there's no sixth item. Try it and read the
error: "exception" is Java's word for "something went wrong while running,"
and this one tells you exactly what — the index was out of the array's bounds.
Then fix it back.

You can also *change* an item by assigning to its position, exactly like a
variable:

```java
int[] readings = {12, 47, 3, 88, 21};
readings[0] = 99;
System.out.println(Arrays.toString(readings));
```

# Walking the whole array

[Lesson 10's](#/lesson/10-loops) `for` loop counted with `i`. There's a second form of `for` whose
real job is walking an array — handing you each item, one per pass. It's
called the **for-each** loop:

```java
int[] scores = {10, 25, 5, 40};
for (int score : scores) {
    System.out.println("We scored " + score);
}
```

No indexes, no counting — the loop takes care of visiting every item in order.
Read the colon as "in": "for each `score` in `scores`, print it." Run it and
you get one line per match.

Now combine it with the **running total** from [lesson 10](#/lesson/10-loops) to add an array up:

```java
int[] scores = {10, 25, 5, 40};
int total = 0;
for (int score : scores) {
    total = total + score;
}
System.out.println("Total points: " + total);
```

Same pattern as always — declare a total *before* the loop, update it *inside*.

One thing an array **can't** do is grow: it's created with a fixed number of
slots and keeps them forever. When you need a group that grows and shrinks,
Java has `ArrayList`:

```java
ArrayList<Integer> scores = new ArrayList<>();
scores.add(10);
scores.add(25);
scores.add(15);
System.out.println(scores);
```

`.add(...)` sticks a new value on the end, and the list just gets bigger. You'll
see `ArrayList` (and its relatives) all over real robot code alongside plain
arrays. For now, arrays are the concept to nail down — a fixed row of numbered
slots.

Your turn: make an array of five sensor `readings`, then loop through and print
only the ones **above 20** (you'll need an `if` inside the `for` — [lesson 9](#/lesson/09-if-statements)
meets lesson 12). Then use the running-total pattern and `.length` to print the
**average**. Predict it first, then check.
