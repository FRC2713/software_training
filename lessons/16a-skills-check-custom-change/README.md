---
title: "Challenge: Custom Coin Changer"
goal: "Combine arrays, loops, and integer math to make change with user-selected coin values."
order: 168
section: "Java Fundamentals: Part 2"
layout: "challenge"
---

# Mission: retool the coin changer

Back in Part 1, you built a machine with four hard-coded slots: quarters,
dimes, nickels, and pennies. It worked in the United States, but now RedHawk
Robotics is taking it on the road. Each event may use a different set of coins
or arcade tokens, and rebuilding the program before every trip is getting old.

Upgrade the machine so the user can enter **any number of denominations** as a
comma-separated list. Your program must walk through that array from largest to
smallest, use as many of each denomination as it can, and report the result.

The starter code turns the Denominations field into an `int[]`. Complete the
change-making loop.

```java input-cents="267" input-denominations="100,50,20,4,1"
int cents = Integer.parseInt(args[0]);
String[] pieces = args[1].split(",");
int[] denominations = new int[pieces.length];

for (int i = 0; i < pieces.length; i++) {
    denominations[i] = Integer.parseInt(pieces[i].trim());
}

int remaining = cents;
int totalCoins = 0;

for (int i = 0; i < denominations.length; i++) {
    int coin = denominations[i];
    int count = 0;

    // Find this coin's count, update remaining, and update totalCoins.

    System.out.println(coin + "-cent coins: " + count);
}

System.out.println("Total coins: " + totalCoins);
System.out.println("Unmade cents: " + remaining);
```

## Input rules

- Enter the amount as a nonnegative whole number of cents.
- Enter positive denominations separated by commas.
- Put the denominations in largest-to-smallest order.
- Do not assume how many denominations the user entered.
- Change only the code beneath the comment in the change-making loop.

## Example

For `267` cents and denominations `100,50,20,4,1`, the program should print:

```text
100-cent coins: 2
50-cent coins: 1
20-cent coins: 0
4-cent coins: 4
1-cent coins: 1
Total coins: 8
Unmade cents: 0
```

## Test cases

Each bracketed list shows the expected counts in the same order as the entered
denominations.

| Cents | Denominations | Expected counts | Total | Unmade |
| ---: | --- | --- | ---: | ---: |
| `267` | `100,50,20,4,1` | `[2, 1, 0, 4, 1]` | `8` | `0` |
| `144` | `25,10,5,1` | `[5, 1, 1, 4]` | `11` | `0` |
| `63` | `25,10,1` | `[2, 1, 3]` | `6` | `0` |
| `43` | `25,10,5` | `[1, 1, 1]` | `3` | `3` |

The challenge is complete when one solution passes every row.

# Toolkit and hints

Try the challenge before opening this page.

## Largest-first reminder

The Part 1 pattern still works inside a loop. For each `coin`, division finds
how many fit and remainder finds what is left:

```text
count = remaining / coin;
remaining = remaining % coin;
```

Add `count` to `totalCoins` before the loop advances to the next denomination.
