---
title: "Lesson 31: Functional programming — Suppliers and lambdas"
goal: "Recognize a functional interface, write a lambda as shorthand for implementing one, and pass behavior into a method as a parameter."
order: 31
section: "Advanced Java"
---

# An interface with exactly one method

[MotorIO](#/lesson/29-interfaces-in-code) started with exactly one method:
`getSpeed()`. An interface shaped like that — one method, nothing else — has
a name: a **functional interface**. Java ships a bunch of them ready-made so
you don't have to declare your own for a one-off need. The most common is
`Supplier<T>`: one method, `get()`, that takes nothing and hands back a
value of type `T` (the same angle-bracket idea from `ArrayList<Integer>` in
[lesson 13](#/lesson/13-arraylists) — here `T` is just "whatever type this
particular `Supplier` produces").

```java
import java.util.function.Supplier;

class AlwaysTrue implements Supplier<Boolean> {
    public Boolean get() {
        return true;
    }
}

public class Main {
    public static void main(String[] args) {
        Supplier<Boolean> sensor = new AlwaysTrue();
        System.out.println(sensor.get());
    }
}
```

Run it — `true` prints. `AlwaysTrue` is a whole class just to answer one
question. That's a lot of ceremony for "always return `true`," and Java has a
much shorter way to say it.

# Lambdas: a method body with no method

A **lambda** is shorthand for "a new object implementing this functional
interface, whose one method just runs this expression." Same behavior as
`AlwaysTrue`, written as a lambda:

```java
import java.util.function.Supplier;

public class Main {
    public static void main(String[] args) {
        Supplier<Boolean> sensor = () -> true;
        System.out.println(sensor.get());
    }
}
```

Run it — identical output, no class declared anywhere. Read `() -> true` as
*"takes no arguments, returns `true`"*: the `()` is `get()`'s empty parameter
list, `->` separates "the inputs" from "what happens," and `true` is what
gets returned. There's no `AlwaysTrue` class because Java builds one for you,
invisibly, right where the lambda is written.

# Passing behavior into a method

Since a `Supplier` is just a value like any other, you can hand one to a
method as a parameter — which means you're handing over **behavior**, not
just a number or a `String`:

```java
import java.util.function.Supplier;

public class Main {
    static void checkSensor(Supplier<Boolean> sensor) {
        if (sensor.get()) {
            System.out.println("piece detected!");
        } else {
            System.out.println("nothing there");
        }
    }

    public static void main(String[] args) {
        checkSensor(() -> true);
        checkSensor(() -> false);
    }
}
```

`checkSensor` doesn't know or care *how* its `sensor` decides — it just calls
`.get()` once and reacts to whatever comes back ([lesson 9's](#/lesson/09-if-statements)
`if`, doing exactly what it always does). The two calls in `main` pass in two
completely different lambdas, and `checkSensor` behaves differently each
time without a single line of it changing. This is the same shape as
`WPILib`'s `Trigger` and `Commands.run(() -> ...)` — code that takes "a thing
to check" or "a thing to do" as a lambda, rather than baking one specific
check or action into itself.

Your turn: write a third call to `checkSensor` with a lambda that returns
`true` only when some made-up number you pick is greater than `10` (e.g.
`() -> 12 > 10`). Then write a second method, `runIfReady(Supplier<Boolean> ready)`,
that prints `"go!"` when `ready.get()` is `true` and nothing otherwise, and
call it twice with two different lambdas.
