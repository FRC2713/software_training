---
title: "Lesson 30: Encapsulation, revisited"
goal: "Add the default (package-private) access level to private and public, and see how a real robot project uses all three."
order: 30
section: "Advanced Java"
---

# A third option: no modifier at all

[Lesson 19](#/lesson/19-encapsulation) gave you two access levels: `private`
(only this class can see it) and `public` (anything can see it). There's a
third, and you've actually been writing it by accident — leave the modifier
off entirely, and you get **default** access, also called **package-private**:
visible to any class in the same **package**, invisible to everything outside
it.

A real robot project isn't one file — it's dozens, organized into packages
like `frc.robot.subsystems` and `frc.robot.commands`, one folder per package.
`public` means "any package can use this." `private` means "not even other
classes in my own file." Package-private sits in between: "anything in my
own folder can use this, but nothing outside it."

```java
interface MotorIO {
    double getSpeed();
    void setSpeed(double target);
}

class MotorIOSim implements MotorIO {
    private double speed;

    double clampSpeed(double value) {
        if (value > 1.0) return 1.0;
        if (value < -1.0) return -1.0;
        return value;
    }

    public double getSpeed() {
        return this.speed;
    }

    public void setSpeed(double target) {
        this.speed = clampSpeed(target);
    }
}

public class Main {
    public static void main(String[] args) {
        MotorIOSim sim = new MotorIOSim();
        sim.setSpeed(1.5);
        System.out.println(sim.getSpeed());
    }
}
```

`clampSpeed` has **no modifier** — that's package-private. Run it: `setSpeed`
still calls `clampSpeed` just fine, because they're in the same class (and
therefore certainly the same package). The site's playground compiles
everything as one file, so there's no *other* package here to actually be
kept out — but picture `clampSpeed` living in `frc.robot.subsystems`
alongside a few other motor-wrapper classes that also need to clamp a speed:
they could all share it, while a class over in `frc.robot.commands` — a
different package — couldn't call it even by accident. That's the whole
point of package-private: a helper meant for "the other classes right next
to me," not the entire codebase.

# Choosing a level for every member

Every field or method you write is really a decision among three doors:

- **`private`** — only this class. The default choice for fields
  ([lesson 19](#/lesson/19-encapsulation)).
- **(no modifier)** — this class, plus anything else in the same package. Use
  it for helpers that other closely-related classes legitimately need, but
  that have no business being called from anywhere else in the robot.
- **`public`** — anyone. Reserve it for the small set of actions or values
  outside code genuinely needs — `getSpeed()`, `setSpeed()`, not
  `clampSpeed()`.

Your turn: go back to [lesson 23's](#/lesson/23-organizing-a-machine)
`GamePieceHandler`. Make its `state` field `private` with a public
`getState()` method, keep `update(String event)` `public` (outside code needs
to drive it), and add a package-private helper method,
`boolean isSafeToShoot()`, that returns `true` only when `state` is `LOADED`
— a check another class in the same package (say, a shooter-arming routine)
could call, but nothing outside it should.
