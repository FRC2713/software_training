---
title: "Navigating a maze"
goal: "See a maze as a robot's world and learn what makes something an algorithm by watching three robots try to solve it: a random walk, a fixed rule that loops, and the wall follower."
order: 195
section: "Algorithms"
---

# A maze is a robot's world

Your robot now has variables, loops, and mechanisms. Time to put it on a practice
field. On the right is a maze. It is fun to solve by hand, and for us it is also
a tiny, simplified version of the problem every FRC robot faces in autonomous:
**"I'm here, I need to get there, and there are things in my way."**

Strip a competition field down to its essentials and you get this: a space divided into a **grid** of cells, some paths open, some blocked by **walls**, a place you **start**, and a place you are trying to **reach**.

- The **grid of cells** is the field, chopped into squares the robot can occupy.
- The **walls** are obstacles you cannot drive through.
- The **green** cell is the **start**, and the **red** cell is the **goal**.
- The **blue dot** is the **robot**.

Before we talk about *how* a robot crosses this, get a feel for it: use the arrow buttons (or your arrow keys) and drive the robot from green to red. Notice you cannot move through walls, only through the openings.

```maze
```

# The robot only knows what's around it

Here is the key thing about robots, and it is easy to miss because *you* can see the whole maze at once. **The robot can't.**

A real robot does not get a bird's-eye view. It knows two things:

1. **Where it is right now**, which cell it is sitting in. That is its **state**: a single fact, "I am at column 3, row 5."
2. **What is immediately around it**, which of its four sides (up, down, left, right) are open, and which are walls. That is its **sensor reading** for this moment.

That is it. From one cell, the robot can only see its own four walls. It has to make its next decision using just that, then move, look again, and decide again.

When *you* press an arrow, you are being the robot's decision-maker for one step: you pick a direction, and it either moves (opening) or stays put (wall). Each press is one **"sense -> decide -> move"** cycle.

```maze
```

# The dumbest possible robot: move at random

You just drove the maze by hand, making a real choice at every cell. So here is a fair question: what if the robot *didn't* choose? What if, at each step, it just picked one of the open directions **at random** and went?

Hit **Move at random** and watch.

```maze
solver: random
```

Sometimes it stumbles onto the goal. Sometimes it wanders forever. And here is the part that matters: **run it again and it does something completely different.** There is no plan, just a coin flip at every cell.

That is why this is *not an algorithm*. An algorithm is something you can write down, hand to someone else, and have them get the **same result you did**. You cannot write down "flip a coin" and call that a plan. Nothing guarantees it ever finishes either. It could bounce around and never land on red.

Random is not worthless. Real robots sometimes add a pinch of it on purpose. As *the whole strategy*, though, it is nothing you can count on.

# A rule you can repeat

Let's give the robot an actual rule, the simplest one imaginable. At every cell, always try the same directions in the same order, and take the first one that is open:

```text
at each cell, try these in order and take the first open one:
    up, then left, then down, then right
```

That is the entire rule. No randomness, no cleverness. Press **Run the naive rule**:

```maze
solver: naive
```

Two things to notice.

First, it is **completely repeatable**. Run it again on this same maze and the robot retraces the *exact* same steps every time. That is what random lacked, and it is what makes this an **algorithm**: a precise rule that produces the same result on every run.

Second, it barely gets anywhere. Watch it take a step and then immediately walk **right back** the way it came, jittering between two cells forever. A rule with *no memory* that returns to a cell it has already seen will make the identical choice it made last time, so it is doomed to loop there. We let it bounce a few times so you can see it, then stop it.

Why does it trap itself so fast? Because "up" is first in its list. Once it steps down into a cell, the very next thing it does is look up, back where it came from, and take it. It has **no memory** of having just been there. It does not know which way it was heading, and it does not know the goal exists.

Being an algorithm does not make a rule *good*. This one is precise and repeatable, and completely useless for crossing the maze. The bar for "algorithm" is just *definiteness and repeatability*. **Whether it actually works is a separate question**, and it is the interesting one. Give this robot just *one* fact to remember, and something surprising happens.

# An algorithm that actually crosses the maze

Here is the surprise: the **wall follower** is almost the same rule as the naive one, a fixed order of directions taking the first open one. It adds exactly **one remembered fact**: which way the robot is currently facing. It tries its directions *relative to that heading* instead of relative to the screen:

```text
at each cell, relative to the way I'm facing, take the first open one:
1. turn right  : is there an opening to my right?  take it.
2. go straight : else, is the way ahead open?      take it.
3. turn left   : else, is there an opening left?   take it.
4. turn around : else, it's a dead end. go back.
```

That is the whole idea behind **"keep your right hand on the wall."** Look at what it does to the jitter: "turn around" is now **dead last**, so the robot only reverses at a true dead end, never on the very next step. Because "right" and "straight" are measured from a heading the robot *remembers* between steps, it hugs the wall and keeps moving instead of bouncing in place. That single remembered fact, its facing, is the *only* thing it adds to the naive rule. No map, no list of visited cells, no idea where the goal is. Press **Run wall follower**:

```maze
solver: wall
```

## Why it works

Here is the surprising part. The walls of this maze are not a scattering of separate obstacles. They are all **one single connected piece**. The generator carved the maze by knocking out walls without ever sealing off a loop, so what is left is one continuous wall with no islands (mazes like this are called *simply connected*, or "perfect" mazes).

Now picture tracing your finger along the edge of one connected shape, like the outline of a single puzzle piece. Keep going and you always come back around. You cannot get stranded, because there is only one border to follow. The wall follower does that: it traces the boundary of that one giant wall. Since the start and the goal both sit on that same connected boundary, following it **must** eventually walk the robot from one to the other. It might wander down dead ends and back out, but it can never get permanently lost.

That is why the naive rule fails and this one does not. It is not luck, it is memory. Facing is just enough state to keep the robot *committed to a wall* rather than making the same local choice from scratch each time.

Still, "works" is not the same as "good." The wall follower explores every dead end, and the path it finds is usually far from the **shortest** one. And the whole guarantee rests on one assumption: one connected wall. Add a loop to the maze, a wall island floating in the middle, and the robot can circle that island forever, hugging a border that never touches the goal. For our perfect mazes, though, it always gets there.

## The same skeleton, over and over

Look back at all three robots and you will see they are built from the *same loop*. They only disagree about one step:

```text
start at the green cell
repeat until you reach the red cell:
    look at which directions are open   (sense)
    choose one of them                  (decide)
    step that way                       (move)
```

Everything interesting lives in that middle line: **"choose one."** Random rolls a die there, the naive rule reads a fixed list, and the wall follower checks its remembered heading. Swap in a smarter "decide" and you get smarter algorithms:

- **Wall follower.** "Keep your right hand on the wall." One remembered fact clears any perfect maze.
- **Depth-first search.** "Keep pushing into new cells; when you hit a dead end, back up to the last spot with an untried opening and try that." Fun fact: this maze was *built* by that exact idea, running in reverse.
- **Breadth-first search.** "Explore all the cells one step away, then all the cells two steps away." More to write, and it finds the *shortest* path.

Same skeleton every time: **sense, decide, move, repeat**, differing only in "decide." That skeleton is the shape of a huge amount of robot code: read your sensors, decide what to do, act, and loop.

So far this has all been visual. You drove the robot and watched three robots run. The whole promise of an algorithm is that it is a plan precise enough to *hand to a computer*. Over the next few lessons you will do that: first see the maze as plain **data** a program can hold, then meet the **robot** your Python code gets to drive, and finally write the wall follower yourself and watch *your* code solve a maze.
