---
title: "Lesson 14: true, false, and combining conditions"
goal: "Treat yes/no answers as real values and combine them with &&, ||, and ! to make safe decisions."
order: 14
section: "Java Fundamentals"
---

# Yes and no are values too

Back in [lesson 9](#/lesson/09-if-statements), an `if` asked a question like `score > 10` and acted on the
answer. That answer is a real value with a type of its own: a **`boolean`**,
which is either `true` or `false` — the only two it can ever be. Every
comparison *produces* one:

```java
int score = 15;
System.out.println(score > 10);
System.out.println(score == 20);
System.out.println(score < 5);
```

Run it: `true`, `false`, `false`. So `score > 10` isn't magic that only works
inside an `if` — it's an expression that evaluates to `true` or `false`, and
you can store it in a variable just like a number:

```java
boolean enabled = true;
boolean atLimit = false;
System.out.println(enabled);
```

Booleans are how a robot represents every yes/no fact about itself: *is the
robot enabled? is the arm at its limit? is the button pressed?* Each is one
`true`/`false` value. An `if` simply runs its block when the boolean is `true`.

# Two questions at once: && / ||

Real decisions rarely hinge on a single fact. "Run the shooter **only if** it's
spun up **and** we have a game piece." Java joins conditions with **`&&`**
(and) and **`||`** (or):

- `a && b` is `true` only when **both** are true.
- `a || b` is `true` when **at least one** is true.

```java
boolean spunUp = true;
boolean hasPiece = true;
System.out.println(spunUp && hasPiece);

double battery = 11.5;
System.out.println(battery > 12 || battery > 11);
```

The first prints `true` — both facts hold, so the shooter's clear to fire. In
the second, the battery isn't above 12, but it *is* above 11, and `||` only
needs one side to be true, so you get `true`.

Put it to work in a real safety check — a motor that should only run when the
system is enabled **and** hasn't hit its limit:

```java
boolean enabled = true;
boolean atLimit = false;
if (enabled && atLimit == false) {
    System.out.println("Motor running");
} else {
    System.out.println("Motor held");
}
```

# !: flipping an answer

`atLimit == false` works, but there's a cleaner way to say "the opposite of
this." **`!`** (read it as "not") flips a boolean: `!true` is `false`, and
`!false` is `true`.

```java
boolean atLimit = false;
System.out.println(!atLimit);
```

So `!atLimit` reads as "not at the limit" — which is exactly the English you
meant. Rewrite the safety check with it and it reads like a sentence:

```java
boolean enabled = true;
boolean atLimit = false;
if (enabled && !atLimit) {
    System.out.println("Motor running");
} else {
    System.out.println("Motor held");
}
```

"If enabled and not at the limit, run." That's the goal of good conditions:
code that says what it means. Flip `enabled` to `false`, or `atLimit` to
`true`, and confirm the motor is held every time either safety fails.

## Comparing text: use .equals, not ==

One trap to disarm before the next lessons, where programs start making
decisions based on text. `==` is for comparing **numbers and booleans**. For
**Strings**, always ask with **`.equals(...)`**:

```java
String mode = "climb";
System.out.println(mode.equals("climb"));
System.out.println(mode.equals("shoot"));
```

That prints `true` then `false`. Writing `mode == "climb"` will sometimes
*look* like it works and then silently fail in a real program, because `==` on
Strings asks "are these the exact same object in memory?" rather than "do
these spell the same thing?" — a distinction you don't want your robot's
behavior hanging on. The habit to build now: **numbers use `==`, text uses
`.equals`**.

Your turn: a climber should only extend when `enabled` is true, `atLimit` is
false, **and** the match timer `timeLeft` is under 30 seconds. Write the single
`if` (using `&&` and `!`) that prints `"Climb!"` only when all three hold. Set
up variables and test it with a few combinations — especially the ones that
should *refuse* to climb.
