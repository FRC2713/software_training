---
title: "Input and integer math"
goal: "Read a whole-number program input and use division and remainder to split it into useful parts."
order: 85
section: "Java Fundamentals: Part 1"
---

# More tools for integer math

You have already used `+` and `-` with variables, and the block editor used
multiplication. Java writes the five basic integer operations like this:

```text
+   add
-   subtract
*   multiply
/   divide
%   find the remainder
```

That last one is called the **remainder operator** (often pronounced "mod" or
"modulo"). Division tells you how many complete groups fit; remainder tells
you what is left after making those groups.

Imagine packing `53` bolts into boxes that each hold `12`:

```java
int bolts = 53;
int boxSize = 12;

System.out.println("Full boxes: " + (bolts / boxSize));
System.out.println("Left over: " + (bolts % boxSize));
```

Run it. Java prints `4` full boxes and `5` bolts left over, because
`4 * 12 + 5` is `53`.

Both variables are `int`s, so `/` gives a **whole-number answer**. Java drops
the unfinished fraction: `53 / 12` is `4`, not `4.416...`. The `%` operation
does not give that fraction back; it gives the whole items left after division.

Parentheses still run from the inside out. They make sure the division happens
before Java joins the answer onto the text for `System.out.println`.

# Give the program an input

So far, changing a value meant editing a variable in the code. For a program
that should work with many values, it is better to supply the value separately.
The playground now has a **Program input** box below the code.

```java input="53"
int bolts = Integer.parseInt(args[0]);
System.out.println("You entered " + bolts + " bolts");
```

The first line is a small input recipe:

- `args[0]` means "the first piece of text given to this program."
- `Integer.parseInt(...)` converts that text into an `int`, the same conversion
  you used in [lesson {n}](#/lesson/08-numbers-and-text).
- The converted number is stored in `bolts`, so the rest of the program can use
  it like any other variable.

You will learn exactly why the `[0]` is there when you reach arrays. For now,
use the whole line as the standard recipe for reading one whole-number input.

Change the Program input to `24`, then `100`, and press **Run** each time. Do
not change the Java code: the same program should print each new value. This
input expects digits for a whole number; text or a decimal will produce a Java
error instead.

# Full boxes and leftovers

Now combine input, output, division, and remainder. Replace the two `0`s below
so this program calculates the number of full boxes and the bolts left over.

```java input="53"
int bolts = Integer.parseInt(args[0]);
int boxSize = 12;

int fullBoxes = 0;
int leftoverBolts = 0;

System.out.println("Full boxes: " + fullBoxes);
System.out.println("Left over: " + leftoverBolts);
```

Use `/` for the number of complete boxes and `%` for what remains. When `53` is
the input, the output should be:

```text
Full boxes: 4
Left over: 5
```

Then check that your program also handles these inputs without changing its
code:

| Input | Full boxes | Left over |
| ---: | ---: | ---: |
| `12` | `1` | `0` |
| `25` | `2` | `1` |
| `120` | `10` | `0` |

Next you will use this same "complete groups plus remainder" idea more than
once in a single program.
