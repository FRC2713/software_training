---
title: "Lesson 33: The builder pattern, in code"
goal: "Write a chain of fluent setters that each return this, in the exact shape PhoenixLib uses to configure a motor."
order: 33
section: "Advanced Java"
---

# The problem with plain setters

A motor controller needs several settings at once — a max speed, a current
limit, a gear ratio. A `void` setter, one per line, works, but it's clunky:

```java
class MotorConfig {
    double maxSpeed;
    double currentLimit;

    void withMaxSpeed(double value) {
        this.maxSpeed = value;
    }

    void withCurrentLimit(double value) {
        this.currentLimit = value;
    }
}

public class Main {
    public static void main(String[] args) {
        MotorConfig config = new MotorConfig();
        config.withMaxSpeed(80);
        config.withCurrentLimit(40);
        System.out.println(config.maxSpeed + " " + config.currentLimit);
    }
}
```

Run it — it works, but every setting is its own statement, repeating
`config.` each time. [Last lesson's](#/lesson/32-builder-pattern-as-diagrams)
diagram chained steps together instead. Here's how to make that legal Java.

# Setters that return this

The fix is one word: instead of `void`, a setter returns **`this`** — *the
object it was just called on* ([lesson 17](#/lesson/17-classes-and-objects)).
That lets you call the *next* method directly on what the last one handed
back:

```java
class MotorConfig {
    private double maxSpeed;
    private double currentLimit;
    private double gearRatio;

    MotorConfig withMaxSpeed(double value) {
        this.maxSpeed = value;
        return this;
    }

    MotorConfig withCurrentLimit(double value) {
        this.currentLimit = value;
        return this;
    }

    MotorConfig withGearRatio(double value) {
        this.gearRatio = value;
        return this;
    }

    void report() {
        System.out.println("maxSpeed=" + maxSpeed + " currentLimit=" + currentLimit + " gearRatio=" + gearRatio);
    }
}

public class Main {
    public static void main(String[] args) {
        MotorConfig config = new MotorConfig()
                .withMaxSpeed(80)
                .withCurrentLimit(40)
                .withGearRatio(4);
        config.report();
    }
}
```

Run it — all three settings land in one chained expression. Read
`new MotorConfig().withMaxSpeed(80)` as "build a config, then call
`withMaxSpeed` on it" — and because `withMaxSpeed` **returns that very
object**, `.withCurrentLimit(40)` can be called directly on whatever it just
returned, and so on. The fields stay `private` ([lesson 19](#/lesson/19-encapsulation))
— nothing outside `MotorConfig` ever touches `maxSpeed` directly, only
through a `with*` method that sets it on purpose.

This is the **exact** pattern PhoenixLib uses to configure a real motor
controller — a chain of `.with...(...)` calls, each setting one thing and
handing back the same config object so the next call can land right on top
of it. Real motor configs aren't just speed and current limit — they cover
dozens of settings — but every one of them is set the same way: one
`with*` method, one field, `return this;`.

Your turn: go back to your capstone mechanism from [lesson 25](#/lesson/25-capstone-state-machine).
Write a fluent config class for it with at least three `with*` methods (pick
settings that make sense for your mechanism — a max height, a hold current, a
speed, whatever fits) and a `report()` method. Build one with a chained call
and confirm `report()` prints all three values you set.
