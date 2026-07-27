# Handoff: make lesson ordering cheap to change (Option B)

## Why
Today, a lesson's **absolute position** is stored as *content* in three places, so
inserting or moving a lesson is a ~250-edit chore:

- `order:` frontmatter is dense consecutive integers → inserting shifts every later lesson.
- `title:` embeds the ordinal (`"Lesson 20: State machines as diagrams"`).
- Cross-references name the ordinal in visible prose and link text
  (`[lesson 12](#/lesson/12-arrays)`, and bare "in lesson 20" mentions).

Sorting is driven **only** by `order` (`site/src/lib/lessons.ts:92`); the numeric
prefix on folder names is cosmetic. The fix: **derive the displayed number from a
lesson's position in the sorted list**, and get ordinals out of stored content.

Measured footprint (lessons 1–34): 34 titles, 103 hash-links, 128 prose "lesson NN"
mentions, 34 numbered folders.

## Scope: Option B (do), Option C (do NOT)
**In scope (B):**
1. **Gapped `order`.** Rewrite each lesson's `order` to `position * 10` (current
   1st → 10, 2nd → 20, … 34th → 340), preserving today's exact sequence but
   leaving room to insert. (A future maze module will slot in at, e.g., 191–195
   between Objects and State Machines — nothing else will need to move.)
2. **De-numbered titles.** Strip the `Lesson N: ` prefix from all 34 `title:`
   values → concept only (`title: "State machines as diagrams"`).
3. **Site renders the number from position.** The `lessons` array is already
   sorted by `order`; display a 1-based index as the lesson number everywhere a
   number should appear — index cards (`LessonCard.tsx`), the lesson header
   (`LessonView`), and the sidebar (`AppSidebar.tsx`, whose `shortTitle` regex on
   line 18 becomes obsolete — titles no longer carry the prefix; prepend the
   derived number instead if a number is wanted there). Numbers must stay 1..34
   in the same order after the refactor — this is a no-visible-reorder change.
4. **Reorder-proof cross-references.** This is the point of the whole exercise:
   after this, moving/inserting a lesson must NOT require editing any other
   lesson's prose. Recommended mechanism: a custom link renderer (the site
   renders lesson markdown — find the react-markdown/MD renderer in
   `site/src/`) that, for any `#/lesson/<slug>` link, resolves the target
   lesson's **current** derived number (and/or title) at render time via
   `getLesson(slug)` + its index. Convert the 103 existing
   `[lesson N](#/lesson/<slug>)` links to a canonical slug-keyed form the
   renderer fills in, so the visible "lesson N" is always computed, never stored.
   For the bare-prose "lesson NN" mentions that are not links, prefer turning them
   into such links, or rephrase to a concept reference ("the arrays lesson"). No
   stored ordinal may remain in prose.

**Out of scope (Option C — do NOT do):**
- Do **not** rename lesson folders or strip numeric prefixes from slugs.
- Do **not** change any `#/lesson/<slug>` href target. Slugs stay exactly as they
  are (their numeric prefix is now a harmless opaque id users never see).

## Deliverables
- All 34 lessons updated (order + title) and cross-references converted.
- Site code renders derived numbers and resolves cross-ref numbers at render time.
- `docs/adr/0001-derive-lesson-order-from-position.md` recording the decision
  (context: ordinal-as-content churn; decision: derive from position, concept-only
  titles, slug-keyed cross-refs; consequence: inserts/reorders touch only `order`).
- `cd site && npm run build && npm run lint` both pass.

## Acceptance check
- Index and sidebar show lessons 1..34 in the identical order and with the same
  visible numbers as before this change.
- Every cross-reference link still resolves, and its visible number matches the
  target's current position (test by temporarily bumping one lesson's `order`
  past a neighbor — the reference text should follow automatically, with no
  content edit — then revert).
- No `title:` contains `Lesson \d+:`; no lesson prose contains a hard-coded
  "lesson NN" ordinal.
