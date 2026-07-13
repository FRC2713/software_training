---
title: "Lesson 34: Capstone 2 — an advanced mechanism"
goal: "Return to your Capstone 1 mechanism and upgrade it with enums with fields, switch, interfaces, access modifiers, and the builder pattern — so it runs identically in simulation and on real hardware."
order: 34
section: "Advanced Java"
---

# Picking up where Capstone 1 left off

[Capstone 1](#/lesson/25-capstone-state-machine) ended with you designing and
coding a real mechanism of your own — not `Climber`, something from this
year's robot. Go find that file now and open it next to this lesson.

Everything below walks through upgrading `Climber` with every tool from this
Advanced Java section, one piece at a time. Your job is to make the same
upgrade to **your own mechanism** right alongside it — don't wait until the
end. When a page adds a field to `ClimberState`, add one to your enum. When a
page gives `Climber` an interface, give yours one too. By the last page,
`Climber` and your mechanism should have grown up together.

Start with [lesson 27's](#/lesson/27-enums-revisited) trick, applied to the
states from Capstone 1: give every state its own motor speed, right on the
enum.

```java
enum ClimberState {
    STOWED(0.0),
    EXTENDING(0.6),
    EXTENDED(0.0),
    RETRACTING(-0.6);

    final double motorSpeed;

    ClimberState(double motorSpeed) {
        this.motorSpeed = motorSpeed;
    }
}

public class Main {
    public static void main(String[] args) {
        for (ClimberState state : ClimberState.values()) {
            System.out.println(state + " -> " + state.motorSpeed);
        }
    }
}
```

Run it — the four states from Capstone 1 print out, each now carrying the
number the motor should run at while the climber is in that state. No new
behavior otherwise, just [lesson 27's](#/lesson/27-enums-revisited) trick
applied a second time. Go add a field to your own enum before moving on.

# Give it real and simulated hardware

Next, [lesson 29's](#/lesson/29-interfaces-in-code) pattern: a contract for
"whatever moves the actual motor," plus a `Sim` and a `Real` that both keep
it.

```java
interface ClimberIO {
    void setSpeed(double speed);
}

class ClimberIOSim implements ClimberIO {
    public void setSpeed(double speed) {
        System.out.println("SIM: setSpeed(" + speed + ")");
    }
}

class ClimberIOReal implements ClimberIO {
    public void setSpeed(double speed) {
        System.out.println("REAL: setSpeed(" + speed + ")");
    }
}

public class Main {
    public static void main(String[] args) {
        ClimberIO io = new ClimberIOSim();
        io.setSpeed(0.6);
    }
}
```

Run it — `SIM: setSpeed(0.6)` prints. Neither implementation talks to actual
hardware — they're stand-ins, exactly like lesson 29's `MotorIO`, so you can
see which one ran without needing a real motor controller plugged in. Write
the same `-IO` interface, plus `Sim` and `Real`, for your own mechanism now.

# Recap: the config builder

Before combining everything, rebuild one more piece on its own:
[lesson 33's](#/lesson/33-builder-pattern-in-code) fluent config, this time
guarding the climber's speed instead of a generic motor's.

```java
class ClimberConfig {
    private double maxSpeed;

    ClimberConfig withMaxSpeed(double value) {
        this.maxSpeed = value;
        return this;
    }

    double clamp(double requested) {
        if (requested > maxSpeed) return maxSpeed;
        if (requested < -maxSpeed) return -maxSpeed;
        return requested;
    }
}

public class Main {
    public static void main(String[] args) {
        ClimberConfig config = new ClimberConfig().withMaxSpeed(0.5);
        System.out.println(config.clamp(0.6));
        System.out.println(config.clamp(-0.6));
        System.out.println(config.clamp(0.2));
    }
}
```

Run it: `0.5`, `-0.5`, `0.2` — the first two get reined in to `maxSpeed`,
the third was already safely inside it and passes through untouched.
`private double maxSpeed` plus one `with*` method that returns `this` is the
whole builder — nothing new here, just the exact class from lesson 33,
renamed for this mechanism. Keep this shape in mind; it's about to plug
straight into the next piece.

# Put state, switch, and hardware together

Now combine the pieces from the first two pages — the enum with a field, and
the `Sim`/`Real` hardware — into an actual state-machine class, using
[lesson 26's](#/lesson/26-decisions-in-code-revisited) `switch` for the
transitions and [lesson 30's](#/lesson/30-encapsulation-revisited) access
modifiers for the fields. No config yet — `update` hands the enum's speed
straight to `io`:

```java
enum ClimberState {
    STOWED(0.0), EXTENDING(0.6), EXTENDED(0.0), RETRACTING(-0.6);

    final double motorSpeed;

    ClimberState(double motorSpeed) {
        this.motorSpeed = motorSpeed;
    }
}

interface ClimberIO {
    void setSpeed(double speed);
}

class ClimberIOSim implements ClimberIO {
    public void setSpeed(double speed) {
        System.out.println("SIM: setSpeed(" + speed + ")");
    }
}

class Climber {
    private ClimberState state;
    private final ClimberIO io;

    Climber(ClimberIO io) {
        this.io = io;
        this.state = ClimberState.STOWED;
    }

    ClimberState getState() {
        return this.state;
    }

    void update(String event) {
        switch (state) {
            case STOWED:
                if (event.equals("button")) state = ClimberState.EXTENDING;
                break;
            case EXTENDING:
                if (event.equals("at_top")) state = ClimberState.EXTENDED;
                break;
            case EXTENDED:
                if (event.equals("button")) state = ClimberState.RETRACTING;
                break;
            case RETRACTING:
                if (event.equals("at_bottom")) state = ClimberState.STOWED;
                break;
            default:
                break;
        }
        io.setSpeed(state.motorSpeed);
    }
}

public class Main {
    public static void main(String[] args) {
        Climber climber = new Climber(new ClimberIOSim());
        climber.update("button");
        System.out.println(climber.getState());
    }
}
```

Run it — `SIM: setSpeed(0.6)` prints, then `EXTENDING`. Read it back to where
each piece came from: `state` is `private` with a public `getState()` (30);
`update` dispatches with a `switch` (26); each state already knows its own
speed (27); that speed goes straight to whichever `ClimberIO` was built in
(29). Everything here is a piece you've already seen — this page just wires
them into one class. The only thing missing is the config from the last
page, guarding that speed before it reaches `io`. Bring your own mechanism's
`update` method up to the same shape before continuing.

# Assemble the whole mechanism

One more piece: bring the `ClimberConfig` from two pages ago in, and clamp
the speed before it reaches `io`.

```java
enum ClimberState {
    STOWED(0.0), EXTENDING(0.6), EXTENDED(0.0), RETRACTING(-0.6);

    final double motorSpeed;

    ClimberState(double motorSpeed) {
        this.motorSpeed = motorSpeed;
    }
}

interface ClimberIO {
    void setSpeed(double speed);
}

class ClimberIOSim implements ClimberIO {
    public void setSpeed(double speed) {
        System.out.println("SIM: setSpeed(" + speed + ")");
    }
}

class ClimberIOReal implements ClimberIO {
    public void setSpeed(double speed) {
        System.out.println("REAL: setSpeed(" + speed + ")");
    }
}

class ClimberConfig {
    private double maxSpeed;

    ClimberConfig withMaxSpeed(double value) {
        this.maxSpeed = value;
        return this;
    }

    double clamp(double requested) {
        if (requested > maxSpeed) return maxSpeed;
        if (requested < -maxSpeed) return -maxSpeed;
        return requested;
    }
}

class Climber {
    private ClimberState state;
    private final ClimberIO io;
    private final ClimberConfig config;

    Climber(ClimberIO io, ClimberConfig config) {
        this.io = io;
        this.config = config;
        this.state = ClimberState.STOWED;
    }

    ClimberState getState() {
        return this.state;
    }

    void update(String event) {
        switch (state) {
            case STOWED:
                if (event.equals("button")) state = ClimberState.EXTENDING;
                break;
            case EXTENDING:
                if (event.equals("at_top")) state = ClimberState.EXTENDED;
                break;
            case EXTENDED:
                if (event.equals("button")) state = ClimberState.RETRACTING;
                break;
            case RETRACTING:
                if (event.equals("at_bottom")) state = ClimberState.STOWED;
                break;
            default:
                break;
        }
        io.setSpeed(config.clamp(state.motorSpeed));
    }
}

public class Main {
    public static void main(String[] args) {
        ClimberConfig config = new ClimberConfig().withMaxSpeed(0.5);
        Climber climber = new Climber(new ClimberIOSim(), config);

        String[] events = {"button", "at_top", "button", "at_bottom"};
        for (String event : events) {
            climber.update(event);
            System.out.println(climber.getState());
        }
    }
}
```

Run it. The only new line versus last page is `io.setSpeed(config.clamp(state.motorSpeed))`
instead of `io.setSpeed(state.motorSpeed)` — everything else is exactly what
you already built. Notice `EXTENDING`'s `0.6` comes out as `0.5` in the
printed `setSpeed` calls — `config.clamp(...)` is doing real work, not just
sitting there.

Change `new ClimberIOSim()` to `new ClimberIOReal()` and run again: every
`state` printed is identical, and only the `SIM:`/`REAL:` label on each
`setSpeed` line changes. That's the entire payoff of the interface pattern —
the state machine itself never had to know which one it was talking to.

**This is your Capstone 2.** Bring your own mechanism from Capstone 1 the
rest of the way to this exact shape:

1. Give its enum a field for whatever number matters most (a speed, a
   height rate, whatever fits).
2. Write an `-IO` interface for it, plus a `Sim` and a `Real` that print
   `"SIM: ..."` / `"REAL: ..."`.
3. Make its state field `private` with a public getter, and dispatch its
   transitions with a `switch`.
4. Build it through a fluent config with at least one `with*` setting.
5. Swap its `Sim` for a `Real` and confirm every state transition still
   happens exactly the same way.

Do that, and the mechanism you designed back in Capstone 1 is now written in
the same shape — enum, interface, access modifiers, builder — as a real
subsystem in this year's robot.
