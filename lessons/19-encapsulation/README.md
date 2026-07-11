---
title: "Lesson 19: Encapsulation"
goal: "Hide an object's fields behind public methods so outside code can't force it into a broken state."
order: 19
section: "Objects"
---

# The problem with public fields

Every field you've written so far has been reachable from anywhere, just by
naming it: `intake.speed = ...`. That's convenient, and also a trap. Nothing
stops outside code from setting a field to something the object was never
designed to hold:

```java
class Flywheel {
    double rpm;

    Flywheel() {
        this.rpm = 0.0;
    }
}

public class Main {
    public static void main(String[] args) {
        Flywheel flywheel = new Flywheel();
        flywheel.rpm = -500.0;
        System.out.println(flywheel.rpm);
    }
}
```

Run it — Java lets `rpm` go negative without a complaint, because nothing
about the field says it shouldn't. A real flywheel can't spin at `-500` RPM;
that's not a value, it's a bug waiting to reach the motor controller. The
object's own methods would never *do* that to it — the danger is code
**outside** the class reaching in directly.

# private fields, public methods

The fix: mark the field **`private`**, so only code inside the class can
touch it, and offer a public method as the *only* door in:

```java
class Flywheel {
    private double rpm;

    Flywheel() {
        this.rpm = 0.0;
    }

    void setRpm(double target) {
        if (target < 0.0) {
            this.rpm = 0.0;
        } else {
            this.rpm = target;
        }
    }

    double getRpm() {
        return this.rpm;
    }
}

public class Main {
    public static void main(String[] args) {
        Flywheel flywheel = new Flywheel();
        flywheel.setRpm(-500.0);
        System.out.println(flywheel.getRpm());
        flywheel.setRpm(4500.0);
        System.out.println(flywheel.getRpm());
    }
}
```

Try `flywheel.rpm = -500.0;` now and it won't even compile — `rpm` is
`private`, so `Main` isn't allowed to see it at all. The only way in is
`setRpm`, and `setRpm` **refuses** the bad value instead of storing it. Run it:
the first call clamps to `0.0`, the second sets a real value. The object is
now in charge of protecting its own rules — that's the whole point of
`private`.

# Designing the public interface

Every class you write is really a decision about **what's public and what's
private** — what the rest of the program is allowed to do to this object,
versus the bookkeeping it never needs to see. A good rule of thumb: fields are
almost always `private`; methods are public **only** if calling code actually
needs them.

```java
class Flywheel {
    private double rpm;
    private boolean spinning;

    Flywheel() {
        this.rpm = 0.0;
        this.spinning = false;
    }

    void spinUp() {
        this.rpm = 5000.0;
        this.spinning = true;
    }

    void stop() {
        this.rpm = 0.0;
        this.spinning = false;
    }

    boolean isReady() {
        return this.spinning && this.rpm >= 4500.0;
    }
}

public class Main {
    public static void main(String[] args) {
        Flywheel flywheel = new Flywheel();
        System.out.println(flywheel.isReady());
        flywheel.spinUp();
        System.out.println(flywheel.isReady());
    }
}
```

Nothing outside `Flywheel` ever touches `rpm` or `spinning` directly — it asks
for `spinUp()`, `stop()`, or `isReady()` and lets the object worry about its
own numbers. That's exactly the shape of real WPILib subsystem code: a small,
honest set of public actions guarding a pile of private details.

Your turn: write a `Climber` class with `private` fields `heightInches` and
`atTop`. Give it a public `extend(double amount)` method that adds `amount` to
`heightInches` but never lets it go **above `60.0`** (clamp it, the way
`setRpm` did), setting `atTop` to `true` exactly when it reaches `60.0`. Try
extending past the top in one big jump and confirm it stops at `60.0` instead
of sailing over.
