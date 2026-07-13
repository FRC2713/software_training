# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Software training suite for FRC 2713 — an onboarding curriculum teaching new
students Java fundamentals (the language FRC robot code is written in).
Content lives in `lessons/`; a React + Vite app in `site/` renders it as an
interactive site (live Java compile+run via CheerpJ/WebAssembly, no server).
Deployed to GitHub Pages on every push to `main` via
`.github/workflows/deploy-pages.yml`.

## Commands

All commands run from `site/`:

```
npm install     # install deps
npm run dev     # start dev server
npm run build   # tsc -b && vite build (type-checks, then builds)
npm run lint    # oxlint
npm run preview # preview the production build
```

There is no test suite currently configured.

Adding or renaming a lesson folder changes what `import.meta.glob` matches in
`site/src/lib/lessons.ts`; a running dev server won't pick up a brand-new lesson
folder until it's restarted.

## Repository layout

- `lessons/` — lesson content. One folder per lesson, each containing a single
  `README.md` that is *both* GitHub-facing docs and the site's content source.
  See `lessons/README.md` for the full authoring convention before adding or
  editing a lesson. Key rules baked into the site's parsing logic:
  - Frontmatter (`title`, `goal`, `order`) is required and drives sorting/display.
  - Every top-level `# heading` starts a new page in the site — anything
    smaller (`##`, `###`) stays within the current page. This is not a
    markdown convention, it's what `splitIntoPages` in `site/src/lib/lessons.ts`
    literally parses on.
  - ` ```java ` fences are live/runnable, not decoration — only the first one
    per page becomes "the" runnable snippet (`firstJavaSnippet`). Use
    ` ```text ` for output samples or pseudocode that shouldn't be executable.
    Snippets without a `class`/`enum`/`interface` declaration are auto-wrapped
    in a `Main`-class shell (with `import java.util.*;`) by the runtime;
    snippets that declare a type run as written (see `prepareSource` in
    `site/src/lib/javaRuntime.ts` and the authoring notes in
    `lessons/README.md`).
  - ` ```blocks ` fences replace the Java playground with the xyflow-based
    visual block editor (`BlockPlayground`). The fence body is a directive
    (`preset: <name>`), parsed by `blocksPreset` and stripped from the prose by
    `stripBlocksFence`; presets are defined in `site/src/lib/blockPresets.ts`.
    Preset names defined in `site/src/lib/statePresets.ts` (the `sm-*` trio)
    render the state-machine playground (`StatePlayground`) instead — same
    fence, different renderer, chosen by `isStatePreset`.
    Lessons 1–4 are the pre-Java block series (arithmetic → conditionals →
    loops → functions); Java starts at lesson 5; the "Objects" section
    (classes, multiple objects, encapsulation) runs 17–19; state machines
    run 20–25 (ending in Capstone 1, lesson 25, where students design their
    own mechanism); the "Advanced Java" section (switch/ternary, enums with
    fields, interfaces → the AdvantageKit IO pattern, access modifiers,
    lambdas, the builder pattern → PhoenixLib-style fluent config, and
    Capstone 2 — upgrading that same Capstone 1 mechanism) runs 26–34.
  - `lessons/parked/` holds withdrawn drafts. The site's glob only matches
    `lessons/*/README.md`, so anything nested a level deeper never renders.
- `site/` — the React + TypeScript + Vite app. See `site/README.md` for the
  Vite/Oxlint template notes.

## Site architecture

- **Lesson loading** (`site/src/lib/lessons.ts`): uses Vite's `import.meta.glob`
  to eagerly load every `lessons/*/README.md` as raw text at build time — there
  is no runtime fetch. It hand-rolls a minimal frontmatter parser (flat scalar
  fields only, no nested YAML) and splits each file into pages by top-level
  heading. This is the single source of truth for how lesson content becomes
  site data; both `LessonIndex` and `LessonView` read from `lessons`/`getLesson`
  here.
- **Java execution** (`site/src/lib/javaRuntime.ts`): the only file that knows
  CheerpJ exists. Lazily injects CheerpJ 4.3's `loader.js` from the
  cjrtnc.leaningtech.com CDN on first run (free Community License requires
  loading from their CDN; not bundled), then compiles each snippet with a real
  javac (`com.sun.tools.javac.Main` from the OpenJDK 8 `tools.jar` vendored in
  `site/public/`) and runs the resulting class — all inside the in-browser JVM.
  Bare-statement snippets are auto-wrapped in a `Main` shell (`prepareSource`),
  and compile diagnostics are rewritten to the student's own line numbers.
  Runtime stack traces have no line numbers under CheerpJ (`Unknown Source`)
  and the JVM exits 0 even on uncaught exceptions, so run failures are detected
  by scanning output for `Exception in thread `/`Error: `. Concurrent runs are
  queued (console capture is global state via a hidden `#console` element), and
  a warm-up compile during loading absorbs javac's slow first invocation.
- **Block editor** (`site/src/components/BlockPlayground.tsx` +
  `site/src/lib/blockPresets.ts`): an xyflow dataflow graph of custom node types
  (number/op/if/outlet/loop/call/result/input). A pure `valueOf` evaluator
  resolves each node's value **per output handle** (memoized on `id:handle`)
  with cycle guarding; `stepOrder` gives a dependency-first walk that "Run step
  by step" animates. `call` nodes evaluate a named sub-graph (`FunctionDef`) via
  `callFunction`, and those functions also render as read-only "inside the
  block" mini-canvases. Node types and the evaluator must stay in sync — adding
  a block type means handling it in `valueOf`, `stepOrder`, `nodeTypes`, and
  `createNode`.
  - The **if** block is lesson 2's conditional, rendered as a classic
    flowchart **decision diamond** (a rotated-square `.blk-diamond`, not
    clip-path, so borders/glow work). It takes two operands `a`/`b` plus an
    operator (`>`/`<`/`=`/`≠`) and has **two named output handles**, `'true'`
    (exits left) and `'false'` (exits right); edges from those handles are
    auto-labelled `true`/`false` (in `wire()` and `onConnect`). Exactly one
    handle resolves to `true` per evaluation; the other resolves to `'?'` —
    it's a branch the program didn't take, not a value selector.
  - Any node can be wired from a diamond's arrow into an input handle named
    `'gate'`; a generic check at the top of `valueOf` forces that node's result
    to `'?'` unless its gate resolves to `true`. The **outlet** node
    (`gate` + `value` in, one value out; student-facing name **"answer"**, its
    gate row labelled "when" — the type string stays `'outlet'`) is the only
    block that currently exposes this: it's "the step that runs on this
    branch", producing its value only on the path taken.
  - **"Run step by step" is branch-aware**: when a diamond's condition
    evaluates to a boolean, every node gated from its untaken handle gets
    `data.skipped` (dimmed via `.blk-skipped`/`.edge-skipped`), is excluded
    from activation, and its wires never animate; edges in general only
    animate when their source resolves to a real value (non-`'?'`). The skip
    rule is deliberately local — only nodes gated *directly* from the dead
    arrow — anything further downstream just resolves `'?'` as usual.
  - Because a branch's answer block is a separate node from whatever feeds the
    diamond's `a`/`b`, two branches can legitimately converge on the same
    downstream target (e.g. both answers wired to `result`). `resolveInput`
    handles this by trying every edge into a handle and returning the first
    non-`'?'` value; `onConnect` only enforces "one wire per handle" for named
    handles, deliberately allowing multiple wires into a node's anonymous
    default target handle (only `result` uses it).
  - The **loop** block takes just one wired input (`times`); its `start` and
    `step` are edited directly on the block itself (`LoopNode`'s own inline
    number fields), not wired in — the loop's internal logic lives inside the
    block, matching the mentor-facing metaphor of "a block with its own logic
    that repeats N times and outputs a number."
  - **Lesson 28** (interfaces) and **lesson 32** (builder pattern) add five
    more node types on top of the original eight: `contract`/`impl`/`declare`
    and `configStart`/`withStep`. A `contract` is a legend card with a source
    handle; an `impl` (tagged SIM/REAL) only reveals its `getSpeed` field once
    something is wired into its `contract` handle — no contract, no method.
    `declare` ("`MotorIO io = ...`") holds whatever `impl` is wired into it;
    `isValidConnection` in `Playground` lets `impl`→`contract` wiring be
    strictly enforced, but deliberately lets anything wire into `declare`'s
    `impl` handle — a non-`impl` source there is allowed to connect but gets
    marked `edge-invalid` (dashed, `✕` label) in `onConnect`, and resolves to
    the `'error'` `Value` in `valueOf` instead of being rejected outright, so
    a type mismatch is something a student can see rather than a wire that
    silently won't drop. `configStart`/`withStep` is a builder chain that
    accumulates a plain object field by field, `{ ...configIn, [field]: value }`.
    These pushed `Value` from `number | boolean | '?'` to also include a
    config object (`Record<string, number>`) and `'error'`, so `fmt()` and
    any exhaustive switch over `Value` need both — check when touching the
    evaluator.
- **State-machine playground** (`site/src/components/StatePlayground.tsx` +
  `site/src/lib/statePresets.ts`): a sibling to the block editor for the state
  machine lessons (14+). Instead of evaluating a dataflow graph, the student
  *drives* the machine: it sits in one active state and follows an
  event-labelled transition when the matching event button is pressed;
  unmatched events are reported as ignored. Presets come in the same
  demo/edit/build arc (`sm-demo`, `sm-edit`, `sm-build`), with `buildable`
  presets adding a toolbar to place states and draw labelled transitions.
- **Routing** (`site/src/App.tsx`): `HashRouter` with two routes —
  `/lesson/:slug` and `/lesson/:slug/:page` — both handled by `LessonView`.
  Hash routing is required because the site is static-hosted on GitHub Pages.
- **Components**: `LessonCard` (index listing), `PageNav` (in-lesson page
  navigation), `JavaRunner` (the editable/runnable code block UI backed by
  `javaRuntime.ts`).
