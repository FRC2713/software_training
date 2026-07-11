---
title: "Lesson 24: Coordinating machines"
goal: "Run several small state machines in one loop and let them make decisions based on each other."
order: 24
section: "State Machines"
---

# A robot is many small machines

One giant state machine for a whole robot would be a tangle. Real robot code
uses **several small machines** — one per mechanism — each an object
([lesson 18](#/lesson/18-multiple-objects)) with its own state. Because a class remembers its own state
field, you can make as many as you want and they don't interfere:

```java
enum IntakeState { CLEAR, HOLDING }
enum ShooterState { IDLE, FIRING }

class Intake {
    IntakeState state = IntakeState.CLEAR;

    void update(String event) {
        if (this.state == IntakeState.CLEAR && event.equals("grab")) {
            this.state = IntakeState.HOLDING;
        } else if (this.state == IntakeState.HOLDING && event.equals("release")) {
            this.state = IntakeState.CLEAR;
        }
    }
}

class Shooter {
    ShooterState state = ShooterState.IDLE;

    void update(String event) {
        if (this.state == ShooterState.IDLE && event.equals("shoot")) {
            this.state = ShooterState.FIRING;
        } else if (this.state == ShooterState.FIRING && event.equals("done")) {
            this.state = ShooterState.IDLE;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Intake intake = new Intake();
        Shooter shooter = new Shooter();
        System.out.println(intake.state + " " + shooter.state);
    }
}
```

Two machines, two independent states — and two enums, because each mechanism
has its *own* set of legal states. Run it: `CLEAR IDLE`. Each machine is small
and easy to reason about on its own — that's the point of splitting them up.

(One shorthand to spot: `IntakeState state = IntakeState.CLEAR;` sets the
field's starting value right where it's declared, so these little classes
don't need a constructor. [Lesson 17's](#/lesson/17-classes-and-objects) constructor form is what you'll
want when starting up takes real work.)

# Machines that watch each other

Mechanisms aren't really independent, though. You shouldn't fire the shooter
while the intake is still holding a piece in the way. One machine can make a
decision based on **another machine's state** — just pass it in:

```java
enum IntakeState { CLEAR, HOLDING }
enum ShooterState { IDLE, FIRING }

class Shooter {
    ShooterState state = ShooterState.IDLE;

    void update(String event, IntakeState intakeState) {
        if (this.state == ShooterState.IDLE && event.equals("shoot")
                && intakeState == IntakeState.CLEAR) {
            this.state = ShooterState.FIRING;
        } else if (this.state == ShooterState.FIRING && event.equals("done")) {
            this.state = ShooterState.IDLE;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Shooter shooter = new Shooter();
        shooter.update("shoot", IntakeState.HOLDING);
        System.out.println("tried to shoot while holding: " + shooter.state);
        shooter.update("shoot", IntakeState.CLEAR);
        System.out.println("shot while clear: " + shooter.state);
    }
}
```

The extra `&& intakeState == IntakeState.CLEAR` ([lesson 16](#/lesson/16-booleans) again) is a
**guard**: the shooter refuses to fire unless the intake reports it's out of
the way. Run it — the first attempt is ignored because the intake was
`HOLDING`; the second works. This cross-machine guard is how you keep two
mechanisms from fighting each other.

# The shared robot loop

Now the payoff: one loop drives **both** machines every tick, feeding the
shooter whatever the intake's state currently is. This is, in miniature, the
loop that runs the whole robot.

```java
enum IntakeState { CLEAR, HOLDING }
enum ShooterState { IDLE, FIRING }

class Intake {
    IntakeState state = IntakeState.CLEAR;

    void update(String event) {
        if (this.state == IntakeState.CLEAR && event.equals("grab")) {
            this.state = IntakeState.HOLDING;
        } else if (this.state == IntakeState.HOLDING && event.equals("release")) {
            this.state = IntakeState.CLEAR;
        }
    }
}

class Shooter {
    ShooterState state = ShooterState.IDLE;

    void update(String event, IntakeState intakeState) {
        if (this.state == ShooterState.IDLE && event.equals("shoot")
                && intakeState == IntakeState.CLEAR) {
            this.state = ShooterState.FIRING;
        } else if (this.state == ShooterState.FIRING && event.equals("done")) {
            this.state = ShooterState.IDLE;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Intake intake = new Intake();
        Shooter shooter = new Shooter();
        String[] events = {"grab", "shoot", "release", "shoot", "done"};

        for (String event : events) {
            intake.update(event);
            shooter.update(event, intake.state);
            System.out.println(event + " ->  intake: " + intake.state
                    + "  shooter: " + shooter.state);
        }
    }
}
```

Trace it: `grab` makes the intake `HOLDING`; the `shoot` that follows is
blocked because the intake is in the way; `release` clears it; the next
`shoot` fires; and `done` resets. Two machines, one loop, coordinating through
their states — every tick, both get a chance to update. Run it and confirm the
blocked shot.

Your turn: add a third machine — a `Climber` with its own enum and states
`STOWED → EXTENDING → EXTENDED`. Update it in the same loop, and give it a
guard so it only starts extending when the shooter is `IDLE` (you don't want
to climb mid-shot). Add the events it needs and watch all three states march
through the loop together.
