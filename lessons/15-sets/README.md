---
title: "Lesson 15: Sets"
goal: "Track a group where duplicates aren't allowed and all you need is membership, not order or position."
order: 15
section: "Data Structures"
---

# Just "is it in here?"

Three data structures in, and each one answers a different question. An array
or `ArrayList` ([lessons 12](#/lesson/12-arrays)–[13](#/lesson/13-arraylists))
answers "what's at position `i`?" A map ([lesson 14](#/lesson/14-maps))
answers "what's filed under this key?" A **set** throws position and keys out
entirely and answers just one question: **"is this value in the group, or
not?"**

Java's everyday set is `HashSet`, and it behaves like an `ArrayList` that
refuses duplicates:

```java
HashSet<String> visited = new HashSet<>();
visited.add("red");
visited.add("blue");
visited.add("red");
System.out.println(visited);
System.out.println(visited.size());
```

Run it. Even though `"red"` was added twice, it only appears **once** — the
second `.add("red")` is silently ignored because it's already there. `.size()`
prints `2`, not `3`. That's the entire point of a set: it enforces "no
duplicates" for you, so you never have to check yourself before adding.

# Checking membership

The move you'll use constantly is `.contains(...)` — same method name as
`ArrayList` ([lesson 13](#/lesson/13-arraylists)), but here it's the *reason
the type exists*, not an extra trick:

```java
HashSet<String> visited = new HashSet<>();
visited.add("red");
visited.add("blue");
System.out.println(visited.contains("red"));
System.out.println(visited.contains("green"));
```

`true`, then `false`. Think of a set as a robot's memory of "places I've
already been" or "alliance colors I've already faced" — you don't care what
order you saw them in, and you don't want the same one counted twice. Add
with `.add(...)`, ask with `.contains(...)`, remove with `.remove(...)`:

```java
HashSet<String> visited = new HashSet<>();
visited.add("red");
visited.add("blue");
visited.remove("red");
System.out.println(visited.contains("red"));
```

# Looping, and why order isn't promised

A for-each loop walks a set just like an array, `ArrayList`, or a map's
`keySet()`:

```java
HashSet<String> alliances = new HashSet<>();
alliances.add("red");
alliances.add("blue");
alliances.add("green");

for (String alliance : alliances) {
    System.out.println("Faced: " + alliance);
}
```

Run it a couple of times. The three lines always appear, but not necessarily
in the order you added them — same warning as `HashMap` in
[lesson 14](#/lesson/14-maps): a `HashSet` files things for fast lookup, not
for tidy printing. If you need "no duplicates" *and* "keeps the order I added
them," Java has `LinkedHashSet` — same methods, different filing system — but
plain `HashSet` is the one you'll reach for first.

Your turn: loop over this array of scouted robot numbers —
`int[] seen = {254, 1114, 254, 118, 1114, 33};` — adding each one to a
`HashSet<Integer>` called `uniqueTeams`. Print `uniqueTeams.size()` to see how
many *distinct* teams were actually scouted, then print the set itself to
check which numbers survived.
