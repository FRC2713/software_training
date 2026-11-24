---
title: "Sets"
goal: "Track a group where duplicates aren't allowed and all you need is membership, not order or position."
order: 150
section: "Data Structures"
---

# Just "is it in here?"

Three data structures in, and each one answers a different question. Lists
([lesson {n}](#/lesson/12-arrays) and [lesson {n}](#/lesson/13-arraylists))
answer "what is at position `i`?" Dictionaries
([lesson {n}](#/lesson/14-maps)) answer "what is filed under this key?" A
**set** throws out positions and keys and answers just one question: **"is this
value in the group, or not?"**

Python's `set` acts like a collection that refuses duplicates:

```python
visited = set()
visited.add("red")
visited.add("blue")
visited.add("red")
print(visited)
print(len(visited))
```

Run it. Even though `"red"` was added twice, it only appears **once**. The
second `.add("red")` does nothing because `"red"` is already there, and
`len(visited)` prints `2`, not `3`. That is the point of a set: it enforces "no
duplicates" for you so you never have to check yourself before adding.

You can also create a non-empty set with curly braces, like
`visited = {"red", "blue"}`. Notice that `{}` on its own makes an empty
dictionary, so always write `set()` when you want an empty set.

# Checking membership

The check you will use most often is `in`, the same operator you saw with lists
in [lesson {n}](#/lesson/13-arraylists). With a set, membership checks are the
main reason the type exists, and Python can answer them fast even when the set
holds thousands of items:

```python
visited = {"red", "blue"}
print("red" in visited)
print("green" in visited)
```

`True`, then `False`. Think of a set as a robot's memory of places it has
already visited or alliance colors it has faced. You do not care about the
order, and you do not want the same one counted twice. Add with `.add(...)`,
check with `in`, and delete with `.remove(...)`:

```python
visited = {"red", "blue"}
visited.remove("red")
print("red" in visited)
```

If you want to remove an item without risking an error when it is already gone,
use `.discard(...)` instead of `.remove(...)`.

# Looping, and why order isn't promised

A `for` loop walks a set just like a list or dictionary:

```python
alliances = {"red", "blue", "green"}
for alliance in alliances:
    print(f"Faced: {alliance}")
```

All three lines always appear, but not necessarily in the order you wrote them.
Unlike lists and dictionaries ([lesson {n}](#/lesson/14-maps)), a `set` does not
preserve insertion order. It organizes values for fast `in` lookups, not for
tidy printing. If you need them in alphabetical or numeric order, loop over
`sorted(alliances)` instead.

Your turn: start with this list of scouted robot numbers,
`seen = [254, 1114, 254, 118, 1114, 33]`. Loop over `seen` and add each one to
an empty set called `unique_teams`. Print `len(unique_teams)` to see how many
*distinct* teams were scouted, then print `unique_teams` itself to check which
numbers survived.
