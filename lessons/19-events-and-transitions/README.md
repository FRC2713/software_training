---
title: "Lesson 19: Events and transitions in code"
goal: "Drive a machine from events, and make each state ignore the events it has no transition for."
order: 19
section: "State Machines"
---

# Transitions depend on an event

The traffic light moved on its own — one event, `timer done`, always advanced
it. Real mechanisms wait for **specific events**: a button press, a sensor
tripping, a shot finishing. So a transition depends on **two things**: which
state you're in, *and* which event just happened.

This is the game-piece handler you drove in [lesson 17](#/lesson/17-state-machines). Here's a single
transition from it:

```java
String state = "empty";
String event = "button";

if (state.equals("empty") && event.equals("button")) {
    state = "intaking";
}

System.out.println(state);
```

The `&&` ([lesson 16](#/lesson/16-booleans)) is the key: the machine only moves when it's in `empty`
**and** the driver's `button` event happened. Run it — `empty` becomes
`intaking`. Change `event` to `"sensor"` and run again: nothing changes,
because `empty` has no transition for `sensor`. That's the diagram's "ignore"
behavior, falling straight out of an `if` that doesn't match.

# The whole machine — and what it ignores

Now the full handler, as an `update` method that takes the current state and
an event and returns the new state:

```java
public class Main {
    static String update(String state, String event) {
        if (state.equals("empty") && event.equals("button")) {
            return "intaking";
        } else if (state.equals("intaking") && event.equals("sensor")) {
            return "loaded";
        } else if (state.equals("loaded") && event.equals("button")) {
            return "shooting";
        } else if (state.equals("shooting") && event.equals("done")) {
            return "empty";
        }
        return state;
    }

    public static void main(String[] args) {
        System.out.println(update("empty", "done"));
        System.out.println(update("empty", "button"));
        System.out.println(update("loaded", "sensor"));
    }
}
```

Look hard at that **last line, `return state`**. If none of the transitions
matched, the machine stays exactly where it was. That one line *is* "a state
ignores events it has no arrow for" — the safety you got for free in the
diagram.

Run it: `update("empty", "done")` returns `empty` (ignored — you can't finish
a shot you never took), `update("empty", "button")` returns `intaking`, and
`update("loaded", "sensor")` returns `loaded` (ignored — a piece can't load
twice). The machine simply *cannot* reach a bad state, because no path leads
there.

# Feeding it a stream of events

A robot gets a new event every tick. We can simulate a whole match by putting
events in an **array** ([lesson 12](#/lesson/12-arrays)) and running them through the machine one
at a time with a for-each loop:

```java
public class Main {
    static String update(String state, String event) {
        if (state.equals("empty") && event.equals("button")) {
            return "intaking";
        } else if (state.equals("intaking") && event.equals("sensor")) {
            return "loaded";
        } else if (state.equals("loaded") && event.equals("button")) {
            return "shooting";
        } else if (state.equals("shooting") && event.equals("done")) {
            return "empty";
        }
        return state;
    }

    public static void main(String[] args) {
        String[] events = {"done", "button", "sensor", "button", "done", "sensor"};
        String state = "empty";
        for (String event : events) {
            state = update(state, event);
            System.out.println(event + " -> " + state);
        }
    }
}
```

Trace the output. That first `"done"` while `empty` does nothing — the machine
shrugs it off — then the real sequence walks `empty → intaking → loaded →
shooting → empty`. This is the loop from [last lesson](#/lesson/18-state-machines-in-code), now fed real events
instead of a timer.

Your turn: write the events array that takes the handler through **two full
cycles** (load and shoot a piece, then do it again). Then slip an out-of-place
event like `"sensor"` in at the start — a real event, just not one `empty` has
a transition for — and confirm the machine ignores it and still ends where you
expect.
