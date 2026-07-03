# Lessons

Each subfolder here is one lesson. Every lesson is a single `README.md` file that
does double duty: it's what you see when you browse this folder on GitHub, and
it's the exact content the [training site](../site) renders, page by page.

## Adding a new lesson

1. Create a new folder, numbered so it sorts in teaching order, e.g. `02-variables/`.
2. Add a `README.md` inside it with this shape:

   ```markdown
   ---
   title: "Lesson 2: Variables"
   goal: "Explain what a variable is and why programs need them."
   order: 2
   ---

   # A heading starts a new page
   Content for the first page a student sees.

   # Another heading, another page
   More content. Code fences tagged \`python\` are rendered as a live,
   editable, runnable code block instead of plain text:

   ​```python
   name = "Ada"
   print("Hello,", name)
   ​```

   # One more page
   Wrap up with a short exercise for the student to try.
   ```

### Rules the site relies on

- **Frontmatter is required**: `title`, `goal`, and `order` (a number controlling
  where the lesson sits in the lesson list).
- **Every top-level `#` heading starts a new page.** Don't use `#` for anything
  except a page break — use `##` and smaller for in-page structure.
- **` ```python ` code fences are live**, not decoration. Students can edit and
  run them right on the page (via [Pyodide](https://pyodide.org), a real Python
  interpreter compiled to WebAssembly — no server involved). Only put code
  there that's meant to be run; use ` ```text ` or plain prose for
  output samples or pseudocode.
- **` ```blocks ` fences swap the Python playground for the visual block
  editor** (drag-and-drop math flowcharts). The fence body is a directive, not
  content — it names a starter graph, e.g. `preset: sequence`, and never renders
  in the prose. The available presets live in
  [`site/src/lib/blockPresets.ts`](../site/src/lib/blockPresets.ts):
  `sequence` (fixed, watch-only), `edit-values` (editable numbers), and
  `build` (blank canvas with an add-a-block toolbar). A page has one playground:
  a ` ```blocks ` fence takes precedence over any ` ```python ` on the page.
- Keep the `goal` to one sentence. It's shown on the lesson card and at the top
  of the lesson — it should tell a student what they'll be able to do
  afterwards, not just what topic it covers.
