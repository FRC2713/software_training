---
title: "Lesson 12: Maps"
goal: "Store values under names you choose instead of numbered positions, and look them up by those names."
order: 12
section: "Java Fundamentals"
---

# Labels instead of positions

An array is great when order is all you need. But `motors[2]` doesn't tell you
*what* motor that is — you just have to remember that position 2 is the intake.
Wouldn't it be nicer to say `motors.get("intake")`?

That's a **map**: a group of values where each one is filed under a **label you
pick** (called a **key**) instead of a numbered position. Java's everyday map
is the **`HashMap`**, and you put entries in with `put` and read them back
with `get`:

```java
HashMap<String, Double> motorSpeeds = new HashMap<>();
motorSpeeds.put("intake", 0.8);
motorSpeeds.put("shooter", 1.0);
motorSpeeds.put("climber", 0.5);
System.out.println(motorSpeeds.get("shooter"));
System.out.println(motorSpeeds.get("intake"));
```

The type `HashMap<String, Double>` names both halves: keys are `String`s,
values are `Double`s (that's `double` from [lesson 7](#/lesson/07-numbers-and-text), dressed up so it can
live in a collection — same idea as `ArrayList<Integer>` in [lesson 11](#/lesson/11-arrays)).
`motorSpeeds.get("shooter")` hands back `1.0`. It reads like plain English, and
you never have to remember which position is which. A map is perfect for
**robot configuration**: settings filed under names you'll recognize six
months from now.

Ask for a key that isn't there — `motorSpeeds.get("drive")` — and you get back
**`null`**, Java's word for "no value here." It doesn't crash on the spot,
which is a mixed blessing: the `null` travels onward and blows up *later* if
you try to use it, so check your spelling of keys carefully.

One housekeeping note: `HashMap` and `ArrayList` live in Java's utility
toolbox, which real programs bring in with a line at the top of the file —
`import java.util.*;`. The playground adds that line to its shell for you, so
these snippets just work.

# Reading, changing, adding

You change a value the same way you added it — `put` to the same key replaces
what was there:

```java
HashMap<String, Double> config = new HashMap<>();
config.put("maxSpeed", 3.0);
config.put("rampTime", 0.25);

config.put("maxSpeed", 4.5);
System.out.println(config.get("maxSpeed"));
```

And `put` on a key that **doesn't exist yet** *adds* a new entry — the same
call does double duty:

```java
HashMap<String, Double> config = new HashMap<>();
config.put("maxSpeed", 3.0);
config.put("shooterSpeed", 1.0);
System.out.println(config);
```

`config` started with one entry and now has two. To check whether a key exists
before you reach for it — avoiding that sneaky `null` — ask with
`containsKey`:

```java
HashMap<String, Double> config = new HashMap<>();
config.put("maxSpeed", 3.0);
System.out.println(config.containsKey("maxSpeed"));
System.out.println(config.containsKey("shooter"));
```

That prints `true` then `false`. It's the safe way to look before you leap.

# Looping over a map

Like an array, a map can be walked with a for-each loop ([lesson 11](#/lesson/11-arrays)). Loop
over its `keySet()` — the collection of every key — and use each key to fetch
its value:

```java
HashMap<String, Double> motorSpeeds = new HashMap<>();
motorSpeeds.put("intake", 0.8);
motorSpeeds.put("shooter", 1.0);
motorSpeeds.put("climber", 0.5);

for (String name : motorSpeeds.keySet()) {
    System.out.println(name + " runs at " + motorSpeeds.get(name));
}
```

Each pass fills `name` with one key, and `get(name)` fetches the matching
value — a tidy report of the whole config in a few lines. This is how you'd
dump every setting on the robot to the console to check it before a match.
(One heads-up: a `HashMap` doesn't promise to keep entries in the order you
added them — it files things for fast lookup, not for tidy printing.)

Your turn: build a map called `sensors` with three named readings — `"front"`
→ `12.0`, `"left"` → `30.0`, `"back"` → `8.0`. Then loop over its keys and
print a warning line only for sensors reading **below 10** (an `if` inside the
`for` again). Which combination from the last few lessons is this? A map, a
loop, and a condition working together — that's what real programs look like.
