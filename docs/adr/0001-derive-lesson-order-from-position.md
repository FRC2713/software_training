# 1. Derive lesson order from position

Status: Accepted

Date: 2026-07-20

## Context

A lesson's **absolute position** used to be stored as *content* in three places,
which made inserting or reordering a lesson a ~250-edit chore:

- `order:` frontmatter was a dense consecutive integer sequence (1, 2, 3, …), so
  inserting a lesson shifted the `order` of every later lesson.
- `title:` embedded the ordinal (`"Lesson 20: State machines as diagrams"`).
- Cross-references named the ordinal in visible link text and prose
  (`[lesson 12](#/lesson/12-arrays)`, and bare "in lesson 20" mentions) — 103
  hash-links plus dozens of prose mentions across 34 files.

Sorting is driven **only** by `order` (`site/src/lib/lessons.ts`); the numeric
prefix on a folder/slug name is cosmetic and never read. So the displayed number
can be computed from a lesson's position in the sorted list instead of stored.

## Decision

Derive the displayed lesson number from position; get ordinals out of stored
content. Specifically (Option B — we did **not** rename folders or change any
`#/lesson/<slug>` href, which was the rejected Option C):

1. **Gapped `order`.** Each lesson's `order` is `position * 10` (1st → 10, 2nd →
   20, … 34th → 340). Same sequence as before, but with room to insert a lesson
   between neighbors (e.g. a future maze module at 191–195) without touching any
   other lesson's `order`.
2. **Concept-only titles.** The `Lesson N: ` prefix is stripped from all `title:`
   values (`title: "State machines as diagrams"`).
3. **Number rendered from position.** The `lessons` array is sorted by `order`;
   the displayed number is its 1-based index. `lessonNumber(slug)` in
   `site/src/lib/lessons.ts` is the single source of truth; the index cards,
   sidebar, and lesson-view header all read it.
4. **Slug-keyed cross-references.** Cross-reference links carry no stored number.
   Their visible text uses `{n}` / `{title}` tokens (e.g.
   `[lesson {n}](#/lesson/09-if-statements)`) that a custom react-markdown link
   renderer in `LessonView.tsx` fills in from the target's **current**
   `lessonNumber` / title at render time. Bare-prose "lesson NN" mentions were
   converted to the same token-link form (or rephrased to a concept reference,
   e.g. "the Objects lessons").

## Consequences

- Inserting or reordering a lesson touches **only** `order:` values. No title,
  prose, or cross-reference edits are needed; every displayed number and
  reference re-labels itself automatically from the new positions.
- Slugs keep their numeric prefix (`12-arrays`). It is now an opaque, harmless id
  that users never see — it is not the lesson's displayed number and need not
  match it. A lesson can sit at any position regardless of its slug prefix.
- Lesson READMEs remain valid Markdown, but the `{n}` / `{title}` tokens and
  `#/lesson/<slug>` hrefs only resolve inside the site renderer; on GitHub the
  tokens render literally and the hash links do not navigate. This was already
  true of the hash links and is an accepted cost of Option B.
- Anything that reads a lesson's number must derive it (`lessonNumber`), never
  parse it from a title or slug.
