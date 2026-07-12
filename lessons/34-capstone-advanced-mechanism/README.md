---
title: "Lesson 34: Capstone — an advanced mechanism"
goal: "Combine enums with fields, switch, interfaces, access modifiers, and the builder pattern into one mechanism that runs identically in simulation and on real hardware."
order: 34
section: "Advanced Java"
---

# Starting from lesson 25, with one upgrade

[Lesson 25's](#/lesson/25-capstone-state-machine) climber design process still
holds: figure out the states, the events, and which event moves between which
states. This time, fold in [lesson 27's](#/lesson/27-enums-revisited) trick
from the start — give every state its own motor speed, right on the enum:

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

Run it — the four states from lesson 25 print out, each now carrying the
number the motor should run at while the climber is in that state. No new
behavior otherwise, just [lesson 27's](#/lesson/27-enums-revisited) trick
applied a second time.

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
see which one ran without needing a real motor controller plugged in.

# Assemble the whole mechanism

Now bring in [lesson 26's](#/lesson/26-advanced-decision-making) `switch`,
[lesson 30's](#/lesson/30-encapsulation-revisited) access modifiers, and
[lesson 33's](#/lesson/33-builder-pattern-in-code) fluent config, all at
once:

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

Run it and read every line back to the lesson it came from: `state` is
`private` with a public `getState()` (30); `update` dispatches with a
`switch` (26); each state already knows its own speed (27); that speed is
handed to whichever `ClimberIO` was built in, `Sim` or `Real` (29); and the
whole thing is constructed through `new ClimberConfig().withMaxSpeed(0.5)`
(33). Notice `EXTENDING`'s `0.6` comes out as `0.5` in the printed
`setSpeed` calls — `config.clamp(...)` is doing real work, not just sitting
there.

**Your capstone.** Change `new ClimberIOSim()` to `new ClimberIOReal()` and
run again: every `state` printed is identical, and only the `SIM:`/`REAL:`
label on each `setSpeed` line changes. That's the entire payoff of the
interface pattern — the state machine itself never had to know which one it
was talking to.

Then do the same upgrade to **your own mechanism** from lesson 25:

1. Give its enum a field for whatever number matters most (a speed, a
   height rate, whatever fits).
2. Write an `-IO` interface for it, plus a `Sim` and a `Real` that print
   `"SIM: ..."` / `"REAL: ..."`.
3. Make its state field `private` with a public getter, and dispatch its
   transitions with a `switch`.
4. Build it through a fluent config with at least one `with*` setting.

Do that, and you've written the same shape of code — enum, interface, access
modifiers, builder — that a real subsystem in this year's robot will use.
