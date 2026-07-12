---
title: "Lesson 29: Interfaces, in code"
goal: "Write an interface as a contract with no body, implement it two ways, and see one method work unchanged against either implementation."
order: 29
section: "Advanced Java"
---

# A contract with no body

[Last lesson](#/lesson/28-interfaces-as-diagrams) you dragged a contract and
two implementations around by hand. In Java, the contract is an
**`interface`** — it lists a method's name and return type, but never says
*how*:

```java
interface MotorIO {
    double getSpeed();
}

public class Main {
    public static void main(String[] args) {
    }
}
```

(Nothing to run yet — an interface alone has no behavior. `main` is here
empty on purpose; the first real output shows up once something
`implements` it, below.)

That's it — no `{ }` body on `getSpeed()`, just a signature ending in a
semicolon, like a method header from [lesson 11](#/lesson/11-writing-methods)
with the body torn off. `MotorIO` is a promise: "whatever `implements` me can
answer `getSpeed()`" — nothing about *how* it answers.

# Two things that keep the promise

A class **implements** an interface with the `implements` keyword, and then
*must* provide a body for every method the interface listed:

```java
interface MotorIO {
    double getSpeed();
}

class MotorIOSim implements MotorIO {
    public double getSpeed() {
        System.out.println("SIM: getSpeed()");
        return 0.4;
    }
}

class MotorIOReal implements MotorIO {
    public double getSpeed() {
        System.out.println("REAL: getSpeed()");
        return 0.55;
    }
}

public class Main {
    public static void main(String[] args) {
        MotorIO io = new MotorIOSim();
        System.out.println(io.getSpeed());
    }
}
```

Run it — you'll see `SIM: getSpeed()` printed by the method itself, then
`0.4` printed by `main`. Now change `new MotorIOSim()` to `new MotorIOReal()`
and run again: same variable type, same `io.getSpeed()` call, completely
different implementation running underneath. `MotorIO io = ...` is the key
line — `io`'s **type** is the interface, so anything implementing `MotorIO`
can be stored in it and called through it, exactly the declare block from
last lesson.

# The pattern real robot code uses

An interface isn't limited to one method — add a second, `setSpeed`, and
every implementation has to answer for both. Watch what happens when a method
also takes the *interface* as its parameter type, not a specific class:

```java
interface MotorIO {
    double getSpeed();
    void setSpeed(double target);
}

class MotorIOSim implements MotorIO {
    public double getSpeed() {
        System.out.println("SIM: getSpeed()");
        return 0.4;
    }

    public void setSpeed(double target) {
        System.out.println("SIM: setSpeed(" + target + ")");
    }
}

class MotorIOReal implements MotorIO {
    public double getSpeed() {
        System.out.println("REAL: getSpeed()");
        return 0.55;
    }

    public void setSpeed(double target) {
        System.out.println("REAL: setSpeed(" + target + ")");
    }
}

public class Main {
    static void report(MotorIO io) {
        io.setSpeed(0.8);
        System.out.println("current speed: " + io.getSpeed());
    }

    public static void main(String[] args) {
        report(new MotorIOSim());
        report(new MotorIOReal());
    }
}
```

`report` never mentions `MotorIOSim` or `MotorIOReal` by name — it only knows
about `MotorIO`. Run it: both calls print a `SIM:`/`REAL:` pair from inside
`setSpeed()` and `getSpeed()`, then `report`'s own line, unchanged either way.

This is the **exact** pattern AdvantageKit uses for every subsystem: an
`XxxIO` interface plus an `XxxIOSim` and an `XxxIOReal`. The subsystem code —
the stuff that decides *when* to spin a motor or check its speed — is written
once against the interface, and never has to change depending on whether the
robot is a physical machine on the field or a simulation running on a
laptop. Swapping `new MotorIOSim()` for `new MotorIOReal()` in one place
(usually `RobotContainer`) is the only thing that changes.

Your turn: add a third method to `MotorIO`, `boolean isStalled()`, and
implement it in both classes — `MotorIOSim` should always return `false`,
`MotorIOReal` should always return `true` (just to tell them apart). Call it
from `report` and print its result alongside the speed.
