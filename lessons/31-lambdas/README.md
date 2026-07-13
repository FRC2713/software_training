---
title: "Lesson 31: Lambdas"
goal: "Write a lambda that hands back a value, then one that just does something, and pass either into a method as a parameter."
order: 31
section: "Advanced Java"
---

# A lambda that returns something

A **lambda** is a tiny, unnamed chunk of behavior you can store in a
variable. Here's the simplest one — it just answers a yes/no question:

```java
interface Check {
    boolean isReady();
}

public class Main {
    public static void main(String[] args) {
        Check ready = () -> true;
        System.out.println(ready.isReady());
    }
}
```

Run it — `true` prints. Read `() -> true` as *"takes no arguments, returns
`true`"*: the `()` is `isReady()`'s empty parameter list, `->` separates "the
inputs" from "what happens," and `true` is what gets returned. Don't worry
yet about *why* `Check` has to exist — for now, just read `Check ready = () -> true;`
as "make a thing called `ready` whose answer is always `true`."

The part after `->` is a real expression, evaluated fresh every time it's
called, not just a fixed value:

```java
interface Check {
    boolean isReady();
}

public class Main {
    public static void main(String[] args) {
        Check ready = () -> true;
        Check notReady = () -> false;
        Check bigEnough = () -> 12 > 10;

        System.out.println(ready.isReady());
        System.out.println(notReady.isReady());
        System.out.println(bigEnough.isReady());
    }
}
```

Run it — `true`, `false`, `true`. Three completely different lambdas, each
answering `isReady()` its own way.

# Runnable: a lambda that just does something

A lambda doesn't have to answer a question — sometimes you just want it to
**do** something. Java ships a ready-made type for exactly that, called
`Runnable`, with one method, `run()`, that takes nothing and returns nothing.
You don't have to declare it yourself — it's already part of Java:

```java
public class Main {
    public static void main(String[] args) {
        Runnable sayHi = () -> System.out.println("intake spinning");
        sayHi.run();
    }
}
```

Run it — the message prints. `sayHi` is a lambda implementing `Runnable`,
the exact same way `ready` above was a lambda implementing `Check` — the only
difference is `Runnable` came from Java itself instead of a line you wrote.
More examples, same shape:

```java
public class Main {
    public static void main(String[] args) {
        Runnable spinIntake = () -> System.out.println("intake spinning");
        Runnable spinShooter = () -> System.out.println("shooter spinning");

        spinIntake.run();
        spinShooter.run();
        spinIntake.run();
    }
}
```

Run it — each `.run()` prints whatever that particular lambda says, in
whatever order you call them.

# Passing a lambda into a method

Since a lambda is just a value like any other, you can hand one to a method
as a parameter — which means you're handing over **behavior**, not just a
number or a `String`:

```java
interface Check {
    boolean isReady();
}

public class Main {
    static void checkSensor(Check sensor) {
        if (sensor.isReady()) {
            System.out.println("piece detected!");
        } else {
            System.out.println("nothing there");
        }
    }

    public static void main(String[] args) {
        checkSensor(() -> true);
        checkSensor(() -> false);
        checkSensor(() -> 12 > 10);
    }
}
```

`checkSensor` doesn't know or care *how* its `sensor` decides — it just calls
`.isReady()` once and reacts to whatever comes back ([lesson 9's](#/lesson/09-if-statements)
`if`, doing exactly what it always does). Three calls, three different
lambdas, and `checkSensor` itself never changes. A method can take a
`Runnable` the same way:

```java
public class Main {
    static void doTwice(Runnable action) {
        action.run();
        action.run();
    }

    public static void main(String[] args) {
        doTwice(() -> System.out.println("intake spinning"));
        doTwice(() -> System.out.println("shooter spinning"));
    }
}
```

Run it — each lambda's line prints twice. `doTwice` doesn't know what its
`action` actually does, only that it can `.run()` it.

One more, combining both ideas:

```java
interface Check {
    boolean isReady();
}

public class Main {
    static void runIfReady(Check ready, Runnable action) {
        if (ready.isReady()) {
            action.run();
        } else {
            System.out.println("not ready yet");
        }
    }

    public static void main(String[] args) {
        runIfReady(() -> true, () -> System.out.println("fire!"));
        runIfReady(() -> false, () -> System.out.println("fire!"));
    }
}
```

Run it: the first call is ready, so `action` runs and prints `fire!`; the
second isn't, so `action` never runs at all — the exact same lambda, simply
never called. This is the same shape WPILib's `Trigger` and
`Commands.run(() -> ...)` use under the hood: a lambda standing in for "the
thing to check" or "the thing to do," handed to code that doesn't need to
know any more about it than that.

Your turn: write a method `describe(Check c)` that prints `"ready"` or
`"not ready"` depending on `c.isReady()`. Call it three times with three
different lambdas — one always `true`, one always `false`, and one that
computes its answer from a comparison you make up (like `7 > 3`).
