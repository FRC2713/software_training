---
title: "Lesson 5: What is Java?"
goal: "Recognize Java's basic punctuation and program shape before writing or running any code."
order: 5
section: "Java Fundamentals"
---

# A language, not a magic spell

You've been building programs already — as flowcharts of blocks
([lesson 1](#/lesson/01-flowcharts) onward). From here on we write those same
ideas as **text**, in a language called **Java**. It's the language FRC robot
code is written in, and one of the most widely used languages in the world.

A programming language is just a very strict set of grammar rules. English is
forgiving — "computer the on it run" is garbled but a person can still guess
what you meant. Java isn't. Every instruction has to be spelled and punctuated
exactly one way, or the computer refuses to run any of it and reports back
exactly what confused it. That's not the computer being difficult — it's the
computer being honest about not understanding you yet.

Two habits fall out of that strictness, right from the start:

- **Java is case-sensitive.** `System` and `system` are different words to
  Java, the same way "Rex" and "rex" are different words if one's a dog's name
  and the other isn't. Spelling has to match exactly, capital letters included.
- **Whitespace mostly doesn't matter.** Spaces, blank lines, and indentation
  make code easier for *you* to read, but Java doesn't require them to be any
  particular way. What *does* matter is a small set of punctuation marks that
  show up in almost every line you'll write. That's the rest of this lesson.

# The punctuation you'll see everywhere

Before you write a single instruction, it helps to recognize the marks Java
uses to hold instructions together — the same way knowing what a period or a
comma does helps you read a sentence you've never seen before.

```text
{ }   curly braces   - group a bunch of steps into one block
( )   parentheses    - hold the "ingredients" an instruction needs
,     comma          - separates ingredients when there's more than one
;     semicolon       - marks the end of one instruction
" "   quotes         - mark exact text, called a "string"
```

- **Curly braces `{ }`** group steps that belong together, the way a folder
  groups pages. Everything between a `{` and its matching `}` is treated as one
  bundle — you already saw this idea as the box drawn around the steps inside
  an `if` or a repeat block.
- **Parentheses `( )`** hold what an instruction needs to do its job. Some
  instructions need nothing (empty parentheses, `()`), some need one thing,
  some need several.
- **Commas `,`** separate those things when an instruction needs more than
  one — the same job a comma does in "eggs, milk, and flour."
- **Semicolons `;`** mark where one instruction ends, like a period at the end
  of a sentence. Forget one and Java will tell you it expected to see it.
- **Quotes `" "`** mark exact text for Java to use as-is — a run of characters
  called a **string**. Anything inside the quotes is data, not instructions;
  Java won't try to run it.

# Reading a program's shape

Every Java program you run needs to live inside a shell like this one:

```text
public class Main {
    public static void main(String[] args) {
        // your instructions go here
    }
}
```

Don't worry about memorizing this — the playground writes it for you for now,
and you'll learn to write it yourself in
[lesson 11](#/lesson/11-writing-methods). For today, just recognize the shapes
in it with the vocabulary from above:

- `public class Main { ... }` — a **class** named `Main`, with everything it
  owns held between its curly braces.
- `public static void main(String[] args) { ... }` — inside that class, a
  block named `main`. This is the one Java looks for first and runs — every
  program's very first instruction lives inside `main`'s braces. The
  parentheses hold what `main` needs to do its job, but you can ignore
  `String[] args` for now.
- `// your instructions go here` — a **comment**. Anything after `//` on a
  line is a note for humans; Java skips right over it.

Notice the braces nest: `main`'s `{ }` sits inside `Main`'s `{ }`, like a small
folder inside a bigger one. That nesting is how Java knows what belongs to
what — you'll see it again every time a block sits inside another block.

You now know enough vocabulary to read Java without panicking at the
punctuation. Next lesson, you'll write and run your first real instruction.
