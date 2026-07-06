---
title: "Lesson 11: Writing your own methods"
goal: "Package steps into a named method and hand back a result with return."
order: 11
section: "Java Fundamentals"
---

# The program shell, revealed

Since [lesson 6](#/lesson/06-hello-world), the playground has been quietly wrapping your code in a small
"program shell." Time to see it, because the thing you're about to build — a
reusable block of your own — has to live inside it. Here is what a complete
Java program really looks like:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from inside the shell!");
    }
}
```

Two layers, outside-in:

- `public class Main { ... }` — every Java program is a **class**, a named
  container for code. (Much more on classes in [lesson 18](#/lesson/18-organizing-a-machine).)
- `public static void main(String[] args) { ... }` — the **main method**:
  the agreed-upon starting point. When a Java program runs, the computer finds
  `main` and follows its instructions top to bottom. Every line you've written
  so far was living here.

Run it — it behaves exactly like lesson 6's one-liner, because it *is* that
program, shell and all. From now on, when a snippet shows the full shell, the
playground runs it exactly as written; you're seeing the whole truth.

# Define a block of your own

[Lesson 4](#/lesson/04-functions) gave you reusable blocks — a **double** block with a little flowchart
hidden inside, that you could drop in wherever you needed it. In Java, a
reusable block is called a **method**, and now you can build one yourself:

```java
public class Main {
    static int doubleIt(int n) {
        return n * 2;
    }

    public static void main(String[] args) {
        System.out.println(doubleIt(5));
    }
}
```

Read the new method piece by piece:

- `static int doubleIt(int n)` — names a new method `doubleIt` that takes one
  input, `int n` (the arrow feeding into the block), and promises to hand back
  an `int` — that first `int` is the **return type**. Even a method's output
  has a type in Java.
- `return n * 2;` is the flowchart *inside* the block: it works out the answer
  and **hands it back** with `return`.
- `doubleIt(5)` **calls** the method — it runs those inner steps with `n` set
  to `5`, and the whole `doubleIt(5)` becomes the value `10`.

Methods live inside the class, *next to* `main` — not inside it. Defining one
doesn't run it; it just teaches Java the block exists. It only does its work
when you *call* it. Run this, then change `5` and run again — same block,
different input, just like [lesson 4](#/lesson/04-functions).

The `n` is called a **parameter** — a placeholder that gets filled in with
whatever value you pass when you call. A method can take more than one:

```java
static int add(int a, int b) {
    return a + b;
}
```

Add that next to `doubleIt` and call `add(2, 3)` from `main`.

# Order matters (again)

[Lesson 4](#/lesson/04-functions) ended with the big idea that **order matters**: `add 1` then `double`
gave a different answer than `double` then `add 1`. Let's prove it in code with
two methods of your own:

```java
public class Main {
    static int addOne(int n) {
        return n + 1;
    }

    static int doubleIt(int n) {
        return n * 2;
    }

    public static void main(String[] args) {
        System.out.println(doubleIt(addOne(4)));
        System.out.println(addOne(doubleIt(4)));
    }
}
```

Trace the first line from the inside out: `addOne(4)` is `5`, then `doubleIt(5)`
is `10`. The second line: `doubleIt(4)` is `8`, then `addOne(8)` is `9`. Same
two blocks, same starting number, **different order, different answer** —
exactly the [lesson-4](#/lesson/04-functions) result, now in text.

Run it and confirm you get `10` then `9`.

Your challenge: write a method `square(int n)` that returns `n * n`, then use
it together with `addOne` to compute **`(4 + 1)` squared**. Predict the answer
before you run — and watch your call order, because `square(addOne(4))` and
`addOne(square(4))` are *not* the same.
