---
title: "Lesson 20: Capstone — design a state machine"
goal: "Take a real mechanism from words to a diagram to working code you can simulate."
order: 20
section: "State Machines"
---

# From a mechanism to a diagram

Everything so far handed you the states and transitions. The real skill — the
one you'll use all season — is **designing** them yourself. It's a repeatable
process, and it starts on paper, not in code.

Take a **climber**: it stows flat, extends a hook up to the bar, hangs there,
then retracts to lift the robot. Design it in three questions:

1. **What states can it be in?** `STOWED`, `EXTENDING`, `EXTENDED`, `RETRACTING`.
2. **What events can happen?** the driver's `button`, an `at_top` sensor, an
   `at_bottom` sensor.
3. **Which event moves between which states?** Draw the arrows:

```text
STOWED     --button--->  EXTENDING
EXTENDING  --at_top--->  EXTENDED
EXTENDED   --button--->  RETRACTING
RETRACTING --at_bottom-> STOWED
```

That's the exact diagram you'd build with blocks in [lesson 15](#/lesson/15-state-machines) — states, events,
arrows, and (just as important) *no* arrow for anything unsafe. Notice there's
no way to go straight from `STOWED` to `EXTENDED`: you must pass through
`EXTENDING`. The design forbids the dangerous shortcut.

# Translate the diagram to code

Now it's mechanical — the diagram maps straight onto the class shape from
[lesson 18](#/lesson/18-organizing-a-machine): an enum for the states, a constructor for the start, an `update`
with one branch per arrow, and enter actions for what should fire once.

```java
enum ClimberState { STOWED, EXTENDING, EXTENDED, RETRACTING }

class Climber {
    ClimberState state;

    Climber() {
        this.state = ClimberState.STOWED;
    }

    void update(String event) {
        ClimberState old = this.state;
        if (this.state == ClimberState.STOWED && event.equals("button")) {
            this.state = ClimberState.EXTENDING;
        } else if (this.state == ClimberState.EXTENDING && event.equals("at_top")) {
            this.state = ClimberState.EXTENDED;
        } else if (this.state == ClimberState.EXTENDED && event.equals("button")) {
            this.state = ClimberState.RETRACTING;
        } else if (this.state == ClimberState.RETRACTING && event.equals("at_bottom")) {
            this.state = ClimberState.STOWED;
        }
        if (this.state != old) {
            onEnter();
        }
    }

    void onEnter() {
        if (this.state == ClimberState.EXTENDING) {
            System.out.println("  -> motor up");
        } else if (this.state == ClimberState.RETRACTING) {
            System.out.println("  -> motor down, hang on!");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Climber climber = new Climber();
        climber.update("button");
        System.out.println(climber.state);
    }
}
```

Read `update`: it remembers the `old` state, tries each transition, and if the
state actually changed, fires `onEnter` for the new one. Every line traces back
to a piece of the diagram. Run it — one `button` moves `STOWED → EXTENDING`
and prints the motor-up action.

# Simulate it, then build your own

Drive your machine with an array of events, the way a match would, and print
each step:

```java
enum ClimberState { STOWED, EXTENDING, EXTENDED, RETRACTING }

class Climber {
    ClimberState state = ClimberState.STOWED;

    void update(String event) {
        if (this.state == ClimberState.STOWED && event.equals("button")) {
            this.state = ClimberState.EXTENDING;
        } else if (this.state == ClimberState.EXTENDING && event.equals("at_top")) {
            this.state = ClimberState.EXTENDED;
        } else if (this.state == ClimberState.EXTENDED && event.equals("button")) {
            this.state = ClimberState.RETRACTING;
        } else if (this.state == ClimberState.RETRACTING && event.equals("at_bottom")) {
            this.state = ClimberState.STOWED;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Climber climber = new Climber();
        String[] events = {"button", "button", "at_top", "button", "at_bottom"};
        for (String event : events) {
            climber.update(event);
            System.out.println(event + " -> " + climber.state);
        }
    }
}
```

Watch the second `"button"` do nothing — while `EXTENDING`, the climber
ignores the button and waits for `at_top`, just like the diagram says. That's
the safety you designed in, running in code.

**Your capstone.** Pick a real mechanism from this year's robot — an arm, a
turret, an indexer, whatever your team is building. Then:

1. Write its states, its events, and its arrows as a diagram (page 1's three
   questions).
2. Turn it into an enum and a class with an `update` and at least one enter
   action.
3. Simulate it with an event array and confirm it does the right thing —
   including *ignoring* the events that would be unsafe.

Do that, and you haven't just finished the lessons — you've written the kind of
code your robot will actually run this season.
