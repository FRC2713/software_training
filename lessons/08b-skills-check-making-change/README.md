---
title: "Challenge: Making Change"
goal: "Apply variables, integer math, and printed output to make the fewest U.S. coins for an amount in cents."
order: 88
section: "Java Fundamentals: Part 1"
layout: "challenge"
---

# Mission

Build a change-making program. It receives an amount in **whole cents** and
prints the fewest U.S. coins needed to make that amount.

```java input="144"
int cents = Integer.parseInt(args[0]);
int remaining = cents;

// Build your solution here.
int quarters = 0;
int dimes = 0;
int nickels = 0;
int pennies = 0;

System.out.println("Quarters: " + quarters);
System.out.println("Dimes: " + dimes);
System.out.println("Nickels: " + nickels);
System.out.println("Pennies: " + pennies);
```

## Coin values

| Coin | Cents |
| --- | ---: |
| Quarter | `25` |
| Dime | `10` |
| Nickel | `5` |
| Penny | `1` |

## Rules

- Change only the code beneath `Build your solution here`.
- Use variables and integer math. You do not need an `if` or a loop.
- Do not hard-code the answer for `144`.
- The same program must pass every test amount.

## Example

Input `144` represents `$1.44` and must print:

```text
Quarters: 5
Dimes: 1
Nickels: 1
Pennies: 4
```

## Test cases

Change only the Program input when testing:

| Cents | Quarters | Dimes | Nickels | Pennies |
| ---: | ---: | ---: | ---: | ---: |
| `0` | `0` | `0` | `0` | `0` |
| `30` | `1` | `0` | `1` | `0` |
| `41` | `1` | `1` | `1` | `1` |
| `99` | `3` | `2` | `0` | `4` |
| `144` | `5` | `1` | `1` | `4` |

The challenge is complete when one solution passes every row.

# Hints, after you try

For each coin, do two steps:

1. Divide `remaining` by the coin's value to find how many fit.
2. Replace `remaining` with the remainder after using that coin.

Here is the complete pair of steps for quarters:

```text
int quarters = remaining / 25;
remaining = remaining % 25;
```

Repeat that pattern for dimes and nickels, using the newly updated value of
`remaining` every time. Once those coins are handled, every remaining cent is
one penny.

## Bonus for now

Print one more line containing the total number of coins. You already have the
four counts, so no new kind of math is required.

## Save one question for later

What if the user could supply any number of coin denominations instead of the
four names built into this program? Keep that question in mind. At the end of
Part 2, you will return to this machine with loops and arrays so the same
program can work with a list of any length.
