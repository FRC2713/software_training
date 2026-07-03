# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Software training suite for FRC 2713 — an onboarding curriculum teaching new
students Python fundamentals. Content lives in `lessons/`; a React + Vite app
in `site/` renders it as an interactive site (live Python execution via
Pyodide/WebAssembly, no server). Deployed to GitHub Pages on every push to
`main` via `.github/workflows/deploy-pages.yml`.

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
  - ` ```python ` fences are live/runnable, not decoration — only the first one
    per page becomes "the" runnable snippet (`firstPythonSnippet`). Use
    ` ```text ` for output samples or pseudocode that shouldn't be executable.
  - ` ```blocks ` fences replace the Python playground with the xyflow-based
    visual block editor (`BlockPlayground`). The fence body is a directive
    (`preset: <name>`), parsed by `blocksPreset` and stripped from the prose by
    `stripBlocksFence`; presets are defined in `site/src/lib/blockPresets.ts`.
    Lessons 1–4 are the pre-Python block series (arithmetic → conditionals →
    loops → functions); Python starts at lesson 5.
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
- **Python execution** (`site/src/lib/pythonRuntime.ts`): the only file that
  knows Pyodide exists. Loads Pyodide lazily from a jsDelivr CDN on first run
  (not bundled), caches the single instance, and queues concurrent `runPython`
  calls since stdout/stderr redirection isn't safe to run in parallel across
  code blocks. Also simplifies Pyodide tracebacks down to just the student's
  own `<exec>` frames plus the final error message.
- **Block editor** (`site/src/components/BlockPlayground.tsx` +
  `site/src/lib/blockPresets.ts`): an xyflow dataflow graph of custom node types
  (number/op/compare/if/loop/call/result/input). A pure `valueOf` evaluator
  resolves each node's value with memoization and cycle guarding; `stepOrder`
  gives a dependency-first walk that "Run step by step" animates. `call` nodes
  evaluate a named sub-graph (`FunctionDef`) via `callFunction`, and those
  functions also render as read-only "inside the block" mini-canvases. Node
  types and the evaluator must stay in sync — adding a block type means handling
  it in `valueOf`, `stepOrder`, `nodeTypes`, and `createNode`.
- **Routing** (`site/src/App.tsx`): `HashRouter` with two routes —
  `/lesson/:slug` and `/lesson/:slug/:page` — both handled by `LessonView`.
  Hash routing is required because the site is static-hosted on GitHub Pages.
- **Components**: `LessonCard` (index listing), `PageNav` (in-lesson page
  navigation), `PythonRunner` (the editable/runnable code block UI backed by
  `pythonRuntime.ts`).
