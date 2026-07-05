---
title: "Lesson 15: Capstone — model a subsystem"
goal: "Combine variables, lists, dictionaries, conditions, loops, and classes to simulate a real robot mechanism."
order: 21
section: "Parked (pre-state-machine draft)"
---

# The job: an elevator

Time to use everything at once. You're going to model an **elevator** — the
mechanism that lifts a game piece to different heights. A real one has a motor,
a current height, and named target positions ("stow," "low," "high"). We can't
touch a real motor from this page, but we can build the exact same *logic* a
robot would run, and watch it work.

Here's the skeleton — a class ([lesson 14](#/lesson/14-classes)) holding its own data:

```python
class Elevator:
    def __init__(self):
        self.height = 0.0      # where it is right now
        self.target = 0.0      # where it's trying to go
        self.enabled = True

    def report(self):
        print("height:", round(self.height, 1), "| target:", self.target)

elevator = Elevator()
elevator.report()
```

Nothing new here — but notice how the object bundles the three facts about the
elevator that everything else will depend on. Run it and confirm it starts at
the bottom.

# Named positions and safe commands

A driver doesn't think in numbers; they press a button for "high." Store those
named heights in a **dictionary** ([lesson 12](#/lesson/12-dictionaries)), and add a method that sets the
target — but *safely*, using conditions ([lesson 13](#/lesson/13-booleans)) so a bad command can't move
a disabled or over-extended elevator.

```python
POSITIONS = {"stow": 0.0, "low": 10.0, "high": 25.0}
MAX_HEIGHT = 30.0

class Elevator:
    def __init__(self):
        self.height = 0.0
        self.target = 0.0
        self.enabled = True

    def go_to(self, position_name):
        if not self.enabled:
            print("Ignored", position_name, "- elevator disabled")
            return
        goal = POSITIONS[position_name]
        if goal > MAX_HEIGHT:
            print("Refused", position_name, "- too high!")
            return
        self.target = goal
        print("Target set to", position_name, "(", goal, ")")

elevator = Elevator()
elevator.go_to("high")
elevator.enabled = False
elevator.go_to("low")
```

Read the two guards at the top of `go_to`. Each one checks a condition and uses
`return` ([lesson 10](#/lesson/10-writing-functions)) to **bail out early** if something's unsafe — no motion, no
crash. Only if both pass does it accept the new target. This "check, then act"
shape is the heart of safe robot code. Run it: the first command lands, the
second is ignored because we disabled the elevator first.

# The simulation loop

A real robot runs the same update **many times a second** — nudging each
mechanism a little closer to its target every pass. That's a `while` loop
([lesson 9](#/lesson/09-loops)). Add a `step()` method that moves the height toward the target, then run it in
a loop until it arrives.

```python
POSITIONS = {"stow": 0.0, "low": 10.0, "high": 25.0}

class Elevator:
    def __init__(self):
        self.height = 0.0
        self.target = 0.0

    def go_to(self, position_name):
        self.target = POSITIONS[position_name]

    def step(self):
        gap = self.target - self.height
        if gap > 0.5:
            self.height = self.height + 1.0      # moving up
        elif gap < -0.5:
            self.height = self.height - 1.0      # moving down
        # else: close enough, hold

    def at_target(self):
        return abs(self.target - self.height) <= 0.5

elevator = Elevator()
elevator.go_to("high")

ticks = 0
while not elevator.at_target():
    elevator.step()
    ticks = ticks + 1
    print("tick", ticks, "height", round(elevator.height, 1))

print("Arrived in", ticks, "ticks")
```

Every piece you've learned is in here: a **class** holding **state**, a
**dictionary** of positions, **conditions** deciding which way to move, a method
that returns a **boolean**, and a **`while` loop** driving it until
`at_target()` turns `True`. This is a genuine, if simplified, control loop —
the same idea that runs on the robot 50 times a second.

Your challenge, to make it your own:

1. **Sequence of moves.** Put several positions in a **list** —
   `["high", "stow", "low"]` — and loop over them ([lesson 11](#/lesson/11-lists)), running the sim to
   completion for each before moving to the next. Print a line when each is
   reached.
2. **A safety limit.** Give the elevator a `MAX_HEIGHT` and make `step()` refuse
   to climb past it, even if the target is higher.
3. **Your own subsystem.** Throw out the elevator and model a *different*
   mechanism — an intake that counts game pieces, a shooter that spins up to an
   RPM, a turret that rotates to an angle. Same recipe: data in `__init__`,
   named settings in a dict, safe commands guarded by conditions, a `step()` the
   loop calls.

Build one of these and you've written the skeleton of a real robot subsystem —
which is exactly where the season starts.
