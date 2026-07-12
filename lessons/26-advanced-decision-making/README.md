---
title: "Lesson 26: Advanced decision making"
goal: "Rewrite if/else-if chains as switch statements — including over an enum — and use the ternary operator for one-line decisions."
order: 26
section: "Advanced Java"
---

# switch: one question, many answers

[Lesson 22](#/lesson/22-events-and-transitions) dispatched on an event string with `if`/`else if`. That works, but
when every branch is testing the *same* variable against different exact
values, Java has a shape built for exactly that: **`switch`**.

```java
String event = "button";

if (event.equals("button")) {
    System.out.println("driver pressed the button");
} else if (event.equals("sensor")) {
    System.out.println("sensor tripped");
} else if (event.equals("done")) {
    System.out.println("shot finished");
} else {
    System.out.println("unknown event");
}
```

Same behavior, as a `switch`:

```java
String event = "button";

switch (event) {
    case "button":
        System.out.println("driver pressed the button");
        break;
    case "sensor":
        System.out.println("sensor tripped");
        break;
    case "done":
        System.out.println("shot finished");
        break;
    default:
        System.out.println("unknown event");
}
```

Run it, then change `event` to `"sensor"` and `"nonsense"` and run again. Three
things to notice:

- **`case value:`** replaces `else if (x.equals(value))` — Java checks `event`
  against each case in order and runs the matching one.
- **`default:`** replaces the final `else` — it catches anything that matched
  no case.
- **`break;`** stops the switch after that case runs. Leave it off and Java
  keeps going into the *next* case regardless of whether it matches — a real
  bug called "fall-through." Try deleting the `break;` after `"button"` and
  run with `event = "button"` again: you'll get both the button message *and*
  the sensor message. Put the `break;` back before moving on.

# switch on an enum

`switch` gets even better once the thing you're checking is an
**`enum`**, because Java already knows every value it could possibly be.
Here's [lesson 23's](#/lesson/23-organizing-a-machine) `onEnter`, rewritten:

```java
enum HandlerState { EMPTY, INTAKING, LOADED, SHOOTING }

public class Main {
    static void onEnter(HandlerState state) {
        switch (state) {
            case INTAKING:
                System.out.println("  -> intake motor ON");
                break;
            case SHOOTING:
                System.out.println("  -> shooter spinning up!");
                break;
            case EMPTY:
                System.out.println("  -> motors off, waiting");
                break;
            default:
                break;
        }
    }

    public static void main(String[] args) {
        onEnter(HandlerState.SHOOTING);
        onEnter(HandlerState.LOADED);
    }
}
```

Run it: `SHOOTING` prints the spin-up message, and `LOADED` prints nothing —
it falls to `default`, which does nothing on purpose. Notice the case labels
are just `INTAKING`, not `HandlerState.INTAKING` — once you `switch (state)`,
Java already knows the type, so the enum name would be redundant. Compare
this to the `if (state == HandlerState.INTAKING)` chain from lesson 23: same
logic, less repetition, and far easier to scan when a state list grows long.

# The ternary operator: a decision in one line

Some decisions are too small to deserve a whole `if`/`else` — just picking
one of two values. The **ternary operator**, `? :`, does that in one line:

```java
boolean ready = true;
String status = ready ? "GO" : "WAIT";
System.out.println(status);
```

Read it as *"ready? then `"GO"`, otherwise `"WAIT"`."* Change `ready` to
`false` and run again — `status` flips. It's exactly the two-branch `if`/`else`
from [lesson 9](#/lesson/09-if-statements), just squeezed onto one line
because both branches are a single value, not a block of statements. A
realistic use — the ready check from [lesson 19's](#/lesson/19-encapsulation)
`Flywheel`:

```java
double rpm = 4800.0;
String message = rpm >= 4500.0 ? "shooter ready" : "still spinning up";
System.out.println(message);
```

Your turn: write a method `describe(HandlerState state)` that returns a
`String` using a `switch` — one case per state, plus a `default`. Then, in
`main`, call it for `HandlerState.EMPTY` and print the result with a ternary
tacked on: append `" (idle)"` if the state is `HandlerState.EMPTY`, or
`""` otherwise.
