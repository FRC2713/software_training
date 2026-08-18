---
title: "Challenge: Custom Coin Changer"
goal: "Combine arrays, loops, decisions, and integer math to make change with user-selected coin values."
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
| `6` | `4,3,1` | `[1, 0, 2]` | `3` | `0` |

The main challenge is complete when one solution passes every row.

## An important limitation

This program deliberately uses the same largest-first strategy as the original
coin changer. It gives the fewest coins for normal U.S. denominations, but not
for every possible list. The final test exposes the problem: largest-first
makes `6` as `4 + 1 + 1`, even though `3 + 3` uses fewer coins.

That is not a bug in your Part 2 solution. It is the problem tackled in the
advanced bonus.

# Advanced bonus: guarantee the fewest coins

The international version works, but a team at one event notices that it
sometimes dispenses more tokens than necessary. Now the machine must consider
several possible combinations and guarantee the **smallest total number of
coins**, regardless of the denominations it receives.

One way to do this is to solve every smaller amount on the way to the requested
amount. The array `fewest[value]` records the best answer found for `value`, and
`chosenCoin[value]` records the last coin used in that answer.

Complete the nested loops. The reconstruction code beneath them will turn your
recorded choices into denomination counts.

```java input-cents="6" input-denominations="4,3,1"
int cents = Integer.parseInt(args[0]);
String[] pieces = args[1].split(",");
int[] denominations = new int[pieces.length];

for (int i = 0; i < pieces.length; i++) {
    denominations[i] = Integer.parseInt(pieces[i].trim());
}

int impossible = cents + 1;
int[] fewest = new int[cents + 1];
int[] chosenCoin = new int[cents + 1];
Arrays.fill(fewest, impossible);
Arrays.fill(chosenCoin, -1);
fewest[0] = 0;

for (int value = 1; value <= cents; value++) {
    for (int coinIndex = 0; coinIndex < denominations.length; coinIndex++) {
        int coin = denominations[coinIndex];

        // If this coin can improve the best answer for value,
        // update fewest[value] and chosenCoin[value].
    }
}

if (chosenCoin[cents] == -1 && cents != 0) {
    System.out.println("No exact change possible.");
} else {
    int[] counts = new int[denominations.length];
    int remaining = cents;

    while (remaining > 0) {
        int coinIndex = chosenCoin[remaining];
        counts[coinIndex]++;
        remaining -= denominations[coinIndex];
    }

    for (int i = 0; i < denominations.length; i++) {
        System.out.println(denominations[i] + "-cent coins: " + counts[i]);
    }
    System.out.println("Total coins: " + fewest[cents]);
}
```

## Bonus tests

| Cents | Denominations | One correct minimum result | Total |
| ---: | --- | --- | ---: |
| `6` | `4,3,1` | `[0, 2, 0]` | `2` |
| `10` | `6,5,1` | `[0, 2, 0]` | `2` |
| `267` | `100,50,20,4,1` | `[2, 1, 0, 4, 1]` | `8` |
| `7` | `6,4` | `No exact change possible.` | — |

There can be more than one equally short answer. Any combination is correct if
it makes the requested amount and uses the minimum total number of coins.

# Toolkit and hints

Try both challenges before opening this page.

## Largest-first reminder

The Part 1 pattern still works inside a loop. For each `coin`, division finds
how many fit and remainder finds what is left:

```text
count = remaining / coin;
remaining = remaining % coin;
```

Add `count` to `totalCoins` before the loop advances to the next denomination.

## Advanced algorithm

Start with the fact that making `0` cents takes `0` coins. For every later
`value`, try every denomination. A coin is a better final step when:

```text
coin <= value
and
fewest[value - coin] + 1 < fewest[value]
```

When both conditions are true, record the improvement:

```text
fewest[value] = fewest[value - coin] + 1;
chosenCoin[value] = coinIndex;
```

This strategy remembers answers to smaller versions of the same problem. You
will see this style of problem-solving again in the Algorithms section; for
now, completing it is meant to be a stretch beyond the Part 2 requirements.
