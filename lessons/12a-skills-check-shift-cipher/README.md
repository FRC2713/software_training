---
title: "Challenge: Shift Cipher"
goal: "Use a loop to inspect and replace characters in an array while encrypting a message."
order: 125
section: "Data Structures"
layout: "challenge"
---

# Mission: shift cipher

Imagine you are sending battle plans across the Roman Empire. Your only option
is a courier carrying a scroll through territory watched by the enemy. If the
courier is captured, a message written normally gives away the entire plan.

To keep intercepted messages secret, the Romans used a **shift cipher**. The
sender replaced every letter with one a fixed number of places later in the
alphabet. The receiving commander knew the secret shift and could reverse it;
an enemy who grabbed the scroll saw only scrambled text.

Your challenge is to build the Empire's cipher machine in Java. A shift of `2`
turns `A` into `C`, `B` into `D`, and wraps `Y` to `A` and `Z` to `B`.
Instead of building a second string one character at a time, turn the message
into an array and replace each letter in its existing position.

```java input-message="RedHawk Robotics" input-shift="2"
String message = args[0];
int shift = Integer.parseInt(args[1]);
char[] characters = message.toCharArray();

// Your code here.

String encrypted = new String(characters);
System.out.println(encrypted);
```

## Rules

- Shift only `A`–`Z` and `a`–`z`.
- Preserve capitalization.
- Leave spaces, numbers, and punctuation unchanged.
- Support every shift from `1` through `25`.
- Modify the `characters` array instead of assembling another string.
- Keep the solution in local variables—no global or static fields.
- One solution must pass every test below.

## Java reference

- `message.toCharArray()` makes a `char[]` with one array element per character.
- `characters.length` is the number of elements in that array.
- `characters[i]` reads or replaces the character at position `i`.
- `new String(characters)` joins the finished array back into a `String`.
- A `char` uses single quotes, such as `'A'`; a `String` uses double quotes.
- Letters have numeric character codes, so Java can subtract `'A'` from another
  uppercase letter or `'a'` from another lowercase letter.
- Cast a numeric character code back with `(char) number`.

## Test cases

| Message | Shift | Expected output |
| --- | ---: | --- |
| `RedHawk Robotics` | `2` | `TgfJcym Tqdqvkeu` |
| `XYZ xyz! 123` | `1` | `YZA yza! 123` |
| `Hello, World!` | `13` | `Uryyb, Jbeyq!` |
| `Abc-Z` | `25` | `Zab-Y` |

The challenge is complete when changing only the Message and Shift fields
passes every row.

# Bonus: passphrase cipher

The enemy's codebreakers have been collecting intercepted scrolls. After some
experimentation, they discover that every letter moves by the same amount and
start reading the Empire's plans again. Your cipher needs an upgrade before
the next courier leaves.

Strengthen it with a secret passphrase whose letters provide changing shift
amounts: `A = 1`, `B = 2`, through `Z = 26`. The passphrase `DOG` therefore
repeats the shifts `4, 15, 7`, making the pattern much harder to spot.

Build one program that can both encrypt and decrypt. Enter exactly `encrypt` or
`decrypt` in the Mode field.

```java input-message="RedHawk Robotics" input-passphrase="DOG" input-mode="encrypt"
String message = args[0];
String passphrase = args[1];
boolean decrypt = args[2].equals("decrypt");
char[] characters = message.toCharArray();
char[] key = passphrase.toUpperCase().toCharArray();

// Your code here.

System.out.println(new String(characters));
```

## Bonus rules

- The passphrase contains letters only and repeats for the whole message.
- Advance the passphrase position for every message character. Spaces and
  punctuation are not shifted, but they still consume one passphrase position.
- Preserve capitalization and leave nonletters unchanged.
- `encrypt` shifts forward; `decrypt` reverses the same shifts.
- The same code must perform both operations.

## Required round trip

| Mode | Message | Passphrase | Expected output |
| --- | --- | --- | --- |
| `encrypt` | `RedHawk Robotics` | `DOG` | `VtkLpdo Ysqvxxjw` |
| `decrypt` | `VtkLpdo Ysqvxxjw` | `DOG` | `RedHawk Robotics` |

Passing both rows proves that decrypting an encrypted message recovers the
original text.

# Toolkit and hints

Try the challenge before using this page. These pieces are reminders, not a
complete program.

## Core cipher

Use an `if` / `else if` / `else` to classify each character:

```text
current >= 'A' && current <= 'Z'
current >= 'a' && current <= 'z'
```

For a letter, choose the matching base (`'A'` or `'a'`), turn the letter into a
position from `0` to `25`, shift and wrap that position, then convert it back:

```text
int position = current - base;
int shiftedPosition = (position + shift) % 26;
char shifted = (char) (base + shiftedPosition);
```

Store the result back in the same array position with `characters[i] = shifted;`.
You do not need a final `else`: characters you do not replace remain unchanged
in the array.

## Passphrase bonus

Inside your loop, use `%` to repeat the passphrase after its last character:

```text
char keyLetter = key[i % key.length];
int shift = keyLetter - 'A' + 1;
```

To decrypt, reverse the shift before applying it:

```text
if (decrypt) {
    shift = -shift;
}
int shiftedPosition = (position + shift + 26) % 26;
```

The extra `26` keeps the value nonnegative when shifting backward. Apply the
same uppercase/lowercase branches as the core cipher and replace only letters
in the array. Nonletters remain unchanged automatically.
