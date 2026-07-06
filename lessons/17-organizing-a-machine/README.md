---
title: "Lesson 17: Organizing a state machine"
goal: "Make a machine safe and tidy with an enum for the states, enter actions, and a class to hold it all together."
order: 17
section: "State Machines"
---

# Name your states with an enum

Our machines used bare strings like `"shooting"` for state names. That works
until you make a typo — and typos in strings are a nasty, silent bug:

```java
String state = "loaded";
if (state.equals("loded")) {
    System.out.println("this never runs, and Java never warns you");
}
System.out.println("done");
```

Run it. Java happily compares `"loaded"` to the misspelled `"loded"`, decides
they're not equal, and moves on — no error, just a branch that mysteriously
never fires. In a robot, that's a mechanism that silently refuses to shoot.

Java has a purpose-built fix: an **`enum`** — a type you define yourself, whose
only possible values are the ones you list:

```java
enum HandlerState { EMPTY, INTAKING, LOADED, SHOOTING }

public class Main {
    public static void main(String[] args) {
        HandlerState state = HandlerState.LOADED;
        if (state == HandlerState.LODED) {
            System.out.println("ready to shoot!");
        }
    }
}
```

Run *that* and it doesn't even compile — the error points straight at the
misspelled `LODED` before the program takes a single step. That's the whole
point: a misspelled string fails silently at the worst possible moment, but a
misspelled **enum value** fails loudly before the code can run at all. Fix
`LODED` to `LOADED` and it works.

Two details worth noticing:

- `HandlerState` is a **type**, like `int` or `String` — but one *you*
  invented, and a variable of that type can only ever hold one of the four
  listed values. The machine's rule "you're always in exactly one of these
  states" is now enforced by the compiler.
- Enums are compared with `==` — the one place text-like values get to use it
  safely, because there's exactly one `HandlerState.LOADED` in the whole
  program. (Strings still need `.equals`, as [lesson 13](#/lesson/13-booleans) warned.)

This is exactly how real FRC robot code names its states, so everything from
here on is the real-world shape.

# Do something the moment you enter a state

Often a state needs an action to happen **once, right as you enter it** — spin
the shooter up, start the intake motor, reset a timer. That's an **enter
action**. Keep it separate from the transition logic:

```java
enum HandlerState { EMPTY, INTAKING, LOADED, SHOOTING }

public class Main {
    static void onEnter(HandlerState state) {
        if (state == HandlerState.INTAKING) {
            System.out.println("  -> intake motor ON");
        } else if (state == HandlerState.SHOOTING) {
            System.out.println("  -> shooter spinning up!");
        } else if (state == HandlerState.EMPTY) {
            System.out.println("  -> motors off, waiting");
        }
    }

    public static void main(String[] args) {
        // When a transition happens, run the enter action for the new state:
        HandlerState newState = HandlerState.SHOOTING;
        onEnter(newState);
    }
}
```

Run it and you'll see the shooter spin-up message. The idea: transitions decide
*where* you go; enter actions decide *what fires* when you get there. Doing the
spin-up on **enter** means it happens exactly once per shot, not every tick
while you sit in `SHOOTING` — a distinction that matters a lot on a real robot.

# Bundle it into a class

Right now the state lives in a loose variable and the logic in loose methods.
As machines grow, that gets hard to keep straight. You met the **class** in
[lesson 10](#/lesson/10-writing-methods) as the shell every program lives in — but a class is really a
bundle of *data and the methods that work on it*. Perfect for a machine that
owns a state and an update:

```java
enum HandlerState { EMPTY, INTAKING, LOADED, SHOOTING }

class GamePieceHandler {
    HandlerState state;

    GamePieceHandler() {
        this.state = HandlerState.EMPTY;
    }

    void update(String event) {
        if (this.state == HandlerState.EMPTY && event.equals("button")) {
            this.state = HandlerState.INTAKING;
        } else if (this.state == HandlerState.INTAKING && event.equals("sensor")) {
            this.state = HandlerState.LOADED;
        } else if (this.state == HandlerState.LOADED && event.equals("button")) {
            this.state = HandlerState.SHOOTING;
        } else if (this.state == HandlerState.SHOOTING && event.equals("done")) {
            this.state = HandlerState.EMPTY;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        GamePieceHandler handler = new GamePieceHandler();
        System.out.println(handler.state);
        handler.update("button");
        handler.update("sensor");
        System.out.println(handler.state);
    }
}
```

Three new things to learn, all in `GamePieceHandler`:

- `HandlerState state;` declares a **field** — a variable that lives *inside*
  each machine, remembered between calls.
- `GamePieceHandler() { ... }` is the **constructor**: it runs once when you
  create a machine with `new GamePieceHandler()`, and sets the starting state.
- **`this`** is *this machine*. `this.state` is its own state field.
  `handler.update("button")` runs the update on that machine and changes its
  state in place. (You'll also notice the methods have no `static` — they
  belong to each machine, not to the program as a whole.)

Run it: the handler starts `EMPTY`, and after a `button` then a `sensor` it's
`LOADED` — and it stayed `LOADED` between the two calls because the object
remembers. That memory is why a class beats loose variables once you have more
than one machine — which is exactly where we go next.

Your turn: add a `report()` method to the class that prints the current state
with a friendly label (an `if/else if` over `this.state`). Create a handler
and drive it through a full load-and-shoot cycle, calling `report()` after
each event.
