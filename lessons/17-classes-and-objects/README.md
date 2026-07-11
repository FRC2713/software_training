---
title: "Lesson 17: Classes and objects"
goal: "Bundle related data and the actions on it into one thing you can create with new."
order: 17
section: "Objects"
---

# When data and actions belong together

Picture the robot's intake. It has **data** — a motor speed, whether it's
currently holding a game piece — and **actions** — start, stop, check if it's
loaded. So far you'd scatter that across loose variables and static methods
and hope you kept them straight. As a robot grows to a dozen mechanisms, that
falls apart fast.

A **class** is Java's way to bundle related data and actions into one thing.
It's a **blueprint**; from it you stamp out **objects** (also called
*instances*). This is not an obscure feature — it is how essentially all real
robot code is written. WPILib, the library FRC robots run on, gives you a
`SubsystemBase` class for each mechanism: an `Intake`, an `Elevator`, a
`Drivetrain`. Learn this and you're reading the shape of actual robot code.

```java
class Intake {
    double speed;
    boolean hasPiece;
}

public class Main {
    public static void main(String[] args) {
        Intake intake = new Intake();
        System.out.println(intake.speed);
        System.out.println(intake.hasPiece);
    }
}
```

`class Intake { ... }` declares the blueprint — a `double` and a `boolean`
**field** for the data it will hold. `new Intake()` stamps out one actual
intake object. And `intake.speed` reaches inside it for a value stored on
that object. Run it — you've built your first object, and its fields start at
Java's defaults: `0.0` and `false`.

# The constructor: giving a new object its starting values

Defaults are a coincidence, not a plan — the next field you add might not have
a sensible default, and relying on it is a bug waiting to happen. A
**constructor** runs automatically the moment you create an object with `new`,
and its job is to set the starting values on purpose:

```java
class Intake {
    double speed;
    boolean hasPiece;

    Intake() {
        this.speed = 0.0;
        this.hasPiece = false;
    }
}

public class Main {
    public static void main(String[] args) {
        Intake intake = new Intake();
        System.out.println(intake.speed);
        System.out.println(intake.hasPiece);
    }
}
```

Two pieces worth naming:

- **`Intake() { ... }`** — a method with no return type, sharing its name with
  the class. That's what makes it the constructor; `new Intake()` calls it.
- **`this`** is *the object being built, right now*. `this.speed = 0.0` means
  "*this particular intake's* speed starts at `0.0`." Every value filed on
  `this` becomes part of the object and sticks around after the constructor
  finishes.

Same output as before, but now it's guaranteed — not a default you got lucky
with.

# Methods: the actions

Data on its own is only half of it. A method defined **inside** a class,
without `static`, is an action the object performs **on its own data**, reached
through `this`:

```java
class Intake {
    double speed;
    boolean hasPiece;

    Intake() {
        this.speed = 0.0;
        this.hasPiece = false;
    }

    void start() {
        this.speed = 0.8;
        this.hasPiece = true;
    }

    void stop() {
        this.speed = 0.0;
    }

    void report() {
        System.out.println("speed: " + this.speed + " | holding: " + this.hasPiece);
    }
}

public class Main {
    public static void main(String[] args) {
        Intake intake = new Intake();
        intake.report();
        intake.start();
        intake.report();
        intake.stop();
        intake.report();
    }
}
```

You call a method with `intake.start()` — same dot as a field, now with
parentheses because it's an action. Trace the output: speed `0.0` and not
holding, then `start()` flips both, then `stop()` zeroes the speed. The object
carries its own state between calls; you're just telling it what to do.

That's the whole idea: **an object is data and the actions on that data, kept
together.** `intake.start()` reads like a command to a real mechanism — which
is exactly why robot code is built this way.

Your turn: write a `Shooter` class. In its constructor set `this.rpm = 0` and
`this.ready = false`. Add a `spinUp()` method that sets `rpm` to `5000` and
`ready` to `true`, and a `fire()` method that prints `"Fired!"` **only if**
`this.ready` is true (an `if` inside a method — [lesson 9](#/lesson/09-if-statements) lives here too).
Make one, try to `fire()` before spinning up, then `spinUp()` and fire for
real.
