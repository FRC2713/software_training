---
title: "Lesson 18: Multiple objects, one blueprint"
goal: "See that every object made from a class keeps its own independent data, and hold a whole group of them in a list."
order: 18
section: "Objects"
---

# One blueprint, many objects

A class is a blueprint, not a thing by itself — and a robot rarely has just
one of anything. Make two objects from the same `Intake` blueprint and each
gets its **own copy** of the fields:

```java
class Intake {
    String name;
    double speed;

    Intake(String name) {
        this.name = name;
        this.speed = 0.0;
    }

    void start() {
        this.speed = 0.8;
    }
}

public class Main {
    public static void main(String[] args) {
        Intake left = new Intake("left");
        Intake right = new Intake("right");
        left.start();
        System.out.println(left.name + " " + left.speed);
        System.out.println(right.name + " " + right.speed);
    }
}
```

`Intake(String name)` takes a value in, exactly like a method parameter
([lesson 11](#/lesson/11-writing-methods)) — `new Intake("left")` fills it in. Run it: `left.start()` sets
`left`'s speed to `0.8` and leaves `right` completely untouched, at `0.0`. One
blueprint, two independent objects, no way for one to reach into the other's
fields by accident.

# static vs. instance: who does a method belong to?

Every method you wrote before [lesson 17](#/lesson/17-classes-and-objects) had `static` in front of it, and
you probably didn't think twice about it — there was nothing yet for a method
to belong to. Now that objects exist, the difference matters:

```java
class Intake {
    double speed;

    void start() {
        this.speed = 0.8;
    }
}

public class Main {
    static int doubleIt(int n) {
        return n * 2;
    }

    public static void main(String[] args) {
        System.out.println(doubleIt(5));

        Intake intake = new Intake();
        intake.start();
        System.out.println(intake.speed);
    }
}
```

`doubleIt(5)` is called by name alone — a `static` method belongs to the
**program**, not to any object, so there's nothing to attach it to (that's
also why `main` itself is `static`: the program needs somewhere to start
before a single object exists). `intake.start()` is different — `start` has
no `static`, so it belongs to **one object**, and you must have that object
(`intake`) to call it. Inside, `this` means exactly that object. That's the
whole rule: no `static` and no object, no call.

# A list of objects

Real robots don't have one intake — they have a handful of mechanisms, all
built from a small number of classes. An `ArrayList` ([lesson 13](#/lesson/13-arraylists))
holds objects exactly the way it holds numbers or strings:

```java
import java.util.ArrayList;

class Intake {
    String name;
    double speed;

    Intake(String name) {
        this.name = name;
        this.speed = 0.0;
    }

    void start() {
        this.speed = 0.8;
    }
}

public class Main {
    public static void main(String[] args) {
        ArrayList<Intake> intakes = new ArrayList<>();
        intakes.add(new Intake("front"));
        intakes.add(new Intake("back"));

        for (Intake intake : intakes) {
            intake.start();
            System.out.println(intake.name + " " + intake.speed);
        }
    }
}
```

`ArrayList<Intake>` says exactly what it holds: not numbers this time, but
whole `Intake` objects. The for-each loop ([lesson 10](#/lesson/10-loops)) hands you one object at
a time — `intake` is a real object each pass, so `intake.start()` and
`intake.name` work exactly as they did above. Run it and watch both mechanisms
start independently.

Your turn: give `Intake` a `hasPiece` field and a `report()` method that
prints `name`, `speed`, and `hasPiece`. Build an `ArrayList` of three intakes,
`start()` only the second one, then loop over the list calling `report()` on
each — confirm only one shows a nonzero speed.
