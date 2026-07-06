---
title: "Lesson 18: State machines in code"
goal: "Turn the state diagram from last lesson into Java — a state variable, transitions, and the loop that drives them."
order: 18
section: "State Machines"
---

# The current state is just a variable

[Last lesson](#/lesson/17-state-machines) you drove state machines as diagrams: a machine sits in one state and
moves along an arrow when an event happens. Now we write that in Java — and the
first piece is something you already know cold. **The current state is just a
variable.**

```java
String state = "red";

if (state.equals("red")) {
    System.out.println("STOP");
} else if (state.equals("green")) {
    System.out.println("GO");
} else if (state.equals("yellow")) {
    System.out.println("SLOW DOWN");
}
```

That's the traffic light from [lesson 17](#/lesson/17-state-machines). One variable, `state`, holds which state
the machine is in right now; an `if/else if` ([lesson 9](#/lesson/09-if-statements)) picks the behavior for
that state. The glowing box in the diagram *is* this variable — nothing more.
(The states are text, so we ask with `.equals`, the habit from [lesson 16](#/lesson/16-booleans).)

Run it, then change `state` to `"green"` and run again. Same code, different
state, different behavior. Notice you can only be in one state at a time,
because a variable holds one value — exactly the rule the diagram enforced.

# Moving between states

A diagram's arrows said how to move. In code, a transition is just **changing
the variable**. Let's package "what comes next" as a method ([lesson 11](#/lesson/11-writing-methods)) —
and since methods live in the shell, from here on the snippets show the whole
program:

```java
public class Main {
    static String nextState(String state) {
        if (state.equals("red")) {
            return "green";
        } else if (state.equals("green")) {
            return "yellow";
        } else {
            return "red";
        }
    }

    public static void main(String[] args) {
        String state = "red";
        System.out.println(state);
        state = nextState(state);
        System.out.println(state);
        state = nextState(state);
        System.out.println(state);
    }
}
```

Each `state = nextState(state)` is one press of **timer done** from the
diagram: it looks at where we are and hands back where we go. Run it and watch
`red → green → yellow`. The reassignment trick from [lesson 7](#/lesson/07-variables) is doing the
real work — the machine "moves" because we overwrite `state` with its next
value.

# The loop that drives it

Here's the idea the whole season rests on: a robot doesn't run its code once
and stop. It runs the same update **over and over, many times a second**.
That's a loop ([lesson 10](#/lesson/10-loops)) — and dropping our machine inside one makes it *go*:

```java
public class Main {
    static String nextState(String state) {
        if (state.equals("red")) {
            return "green";
        } else if (state.equals("green")) {
            return "yellow";
        } else {
            return "red";
        }
    }

    public static void main(String[] args) {
        String state = "red";
        for (int tick = 0; tick < 6; tick++) {
            System.out.println(tick + " " + state);
            state = nextState(state);
        }
    }
}
```

Each time around the loop is one **tick**: print where we are, then advance.
Run it and watch the light cycle `red → green → yellow → red → green …`,
driven entirely by that one repeating step. A real robot's loop is this exact
shape, just running 50 times a second instead of 6.

Your turn: add a fourth state, `"flashing"`, that the light enters after
`yellow` and leaves back to `red`. You'll change `nextState` in two spots —
make `"yellow"` return `"flashing"` instead of falling through to `"red"`, and
add a new `else if` for `"flashing"` that returns `"red"`. That's exactly
adding a box and rerouting the arrows in the diagram. Run the loop and confirm
your new state shows up in the cycle.
