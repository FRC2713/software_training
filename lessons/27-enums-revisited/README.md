---
title: "Lesson 27: Enums, revisited"
goal: "Loop over every value an enum can hold, and give an enum a field so each state carries its own number."
order: 27
section: "Advanced Java"
---

# Every value an enum can hold

You've had `HandlerState` since [lesson 23](#/lesson/23-organizing-a-machine)
— four fixed values, nothing else legal. Here's a trick you haven't seen yet:
an enum can hand you **every value it has**, with `.values()`.

```java
enum HandlerState { EMPTY, INTAKING, LOADED, SHOOTING }

public class Main {
    public static void main(String[] args) {
        for (HandlerState state : HandlerState.values()) {
            System.out.println(state);
        }
    }
}
```

Run it — all four states print, in the order they were declared. `.values()`
returns an array of every constant ([lesson 12's](#/lesson/12-arrays) array,
[lesson 10's](#/lesson/10-loops) for-each) — handy anywhere you'd otherwise
have to list the states yourself and hope you didn't forget one. If you add a
fifth state to the enum, this loop picks it up automatically; a hand-written
list would silently miss it.

# Giving an enum a field

So far an enum constant has only ever been a name. But a constant can also
carry its **own data** — say, the motor speed each state should run at. Give
`HandlerState` a field and a constructor, the same way [lesson 17](#/lesson/17-classes-and-objects)
gave `Flywheel` one:

```java
enum HandlerState {
    EMPTY(0.0),
    INTAKING(0.5),
    LOADED(0.0),
    SHOOTING(1.0);

    final double motorSpeed;

    HandlerState(double motorSpeed) {
        this.motorSpeed = motorSpeed;
    }
}

public class Main {
    public static void main(String[] args) {
        for (HandlerState state : HandlerState.values()) {
            System.out.println(state + " -> " + state.motorSpeed);
        }
    }
}
```

Run it. Each constant now calls the constructor with its own number —
`INTAKING(0.5)` means "build the `INTAKING` constant, passing `0.5` to its
constructor" — exactly like `new Flywheel(0.5)` would, just written before the
semicolon that ends the constant list. `this.motorSpeed = motorSpeed;` inside
the constructor is the same assignment pattern from lesson 17; it just runs
once per constant instead of once per `new`.

Two details worth naming:

- The **semicolon after `SHOOTING(1.0)`** is required — it's what separates
  "here are the constants" from "here's everything else in the enum" (the
  field and constructor).
- **`final`** means `motorSpeed` is set once, in the constructor, and can
  never change after — appropriate here, since `HandlerState.SHOOTING`
  shouldn't be able to quietly mean a different speed partway through a
  match.

This is exactly the real shape of state-specific setpoints in FRC code: one
enum, one number per state, no separate lookup table to keep in sync.

Your turn: add a fifth state, `JAMMED(0.0)`, to `HandlerState`. Then loop over
`.values()` again and print each state's name next to its `motorSpeed` —
confirm your new state shows up automatically, with no other line of the loop
needing to change.
