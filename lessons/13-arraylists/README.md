---
title: "Lesson 13: ArrayLists"
goal: "Hold a group that grows and shrinks while the program runs, instead of a fixed number of slots."
order: 13
section: "Data Structures"
---

# A row that can grow

[Last lesson's](#/lesson/12-arrays) array is great, but it commits to a size up
front: `new int[5]` is five slots, forever. That's a problem the moment you
don't know the count ahead of time — how many game pieces will you score this
match? You don't know until the match is over.

Java's answer is `ArrayList`: a list that grows one slot at a time as you add
to it.

```java
ArrayList<Integer> scores = new ArrayList<>();
scores.add(10);
scores.add(25);
scores.add(15);
System.out.println(scores);
System.out.println(scores.size());
```

Run it. `scores` starts **empty** — no size decided up front — and each
`.add(...)` grows it by one. `System.out.println(scores)` prints the whole
list at once: `[10, 25, 15]`. And instead of the array's `.length`
*property*, a list has a `.size()` *method* — one of those small differences
that trips people up, so it's worth saying out loud: arrays use `.length`, no
parentheses; lists use `.size()`, with parentheses.

Notice the type in the brackets is `Integer`, capitalized — not the lowercase
`int` from every lesson before this one. An `ArrayList` can only hold
**objects**, not raw numbers, so Java uses a boxed stand-in type for each
primitive (`Integer` for `int`, `Double` for `double`, and so on). You'll
mostly just write `Integer` where you mean "a group of `int`s" and Java quietly
boxes and unboxes the values for you — `scores.add(10)` just works even
though `10` is a plain `int`.

# Reaching, changing, removing

Like an array, you reach one item by index with square brackets — except an
`ArrayList` uses a method instead of brackets:

```java
ArrayList<Integer> scores = new ArrayList<>();
scores.add(10);
scores.add(25);
scores.add(15);
System.out.println(scores.get(1));
```

`.get(1)` is the second item (`25`) — indexes still start at **0**, same rule
as [lesson 12](#/lesson/12-arrays). To change a slot without touching the
others, use `.set(index, value)`:

```java
ArrayList<Integer> scores = new ArrayList<>();
scores.add(10);
scores.add(25);
scores.add(15);
scores.set(0, 99);
System.out.println(scores);
```

And to shrink the list, `.remove(index)` deletes a slot entirely — everything
after it shifts down to fill the gap, and `.size()` drops by one:

```java
ArrayList<Integer> scores = new ArrayList<>();
scores.add(10);
scores.add(25);
scores.add(15);
scores.remove(1);
System.out.println(scores);
```

That prints `[10, 15]` — `25` is gone and `15` slid into its place. This is
the move an array simply cannot make: an array's size never changes, but a
list's does, on demand.

# Looping and checking membership

A for-each loop ([lesson 12](#/lesson/12-arrays)) walks a list exactly like it
walks an array:

```java
ArrayList<Integer> scores = new ArrayList<>();
scores.add(10);
scores.add(25);
scores.add(15);
int total = 0;
for (int score : scores) {
    total = total + score;
}
System.out.println("Total points: " + total);
```

One more list-only trick: `.contains(...)` asks "is this value in here
anywhere?" without you writing a loop yourself.

```java
ArrayList<Integer> scores = new ArrayList<>();
scores.add(10);
scores.add(25);
System.out.println(scores.contains(25));
System.out.println(scores.contains(99));
```

That's `true` then `false`. Between arrays and `ArrayList`, the choice comes
down to one question: do you know the count before the program runs? If yes,
an array is simpler. If the count depends on what happens while the program
runs — scoring events, sensor hits, robots you've seen this match — reach for
`ArrayList`.

Your turn: build an empty `ArrayList<Integer>` called `climbTimes`, then
`.add(...)` four made-up times in seconds. Remove the **slowest** one by
index (look at the printed list and pick its position), then loop over what's
left and print the **average** of the remaining times.
