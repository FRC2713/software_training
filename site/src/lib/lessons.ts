export interface LessonPage {
  heading: string
  markdown: string
}

export interface Lesson {
  slug: string
  title: string
  goal: string
  order: number
  section: string
  layout: 'lesson' | 'challenge'
  pages: LessonPage[]
}

export interface LessonSection {
  title: string
  lessons: Lesson[]
}

// Lessons without an explicit `section` fall into this bucket so they still
// render somewhere rather than silently disappearing from grouped views.
const UNSECTIONED = 'Lessons'

// Every lesson's README.md doubles as its GitHub-facing docs and the site's
// content source - see lessons/README.md for the authoring convention.
const rawLessonFiles = import.meta.glob('../../../lessons/*/README.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

// A top-level `# Heading` starts a new page; anything deeper (`##`, `###`, ...)
// stays within the current page.
function splitIntoPages(body: string): LessonPage[] {
  const pages: LessonPage[] = []
  let heading = ''
  let lines: string[] = []

  const flush = () => {
    const markdown = lines.join('\n').trim()
    if (heading || markdown) pages.push({ heading, markdown })
  }

  for (const line of body.split('\n')) {
    const match = /^#\s+(.*)$/.exec(line)
    if (match) {
      flush()
      heading = match[1].trim()
      lines = [`# ${heading}`]
    } else {
      lines.push(line)
    }
  }
  flush()

  return pages
}

function slugFromPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 2]
}

// Lessons only ever need a handful of flat scalar fields, so this reads just
// enough YAML frontmatter to cover that instead of pulling in a full parser.
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, content: raw }

  const data: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const kv = /^(\w+):\s*(.*)$/.exec(line)
    if (!kv) continue
    data[kv[1]] = kv[2].trim().replace(/^(["'])(.*)\1$/, '$2')
  }

  return { data, content: raw.slice(match[0].length) }
}

export const lessons: Lesson[] = Object.entries(rawLessonFiles)
  .map<Lesson>(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw)
    return {
      slug: slugFromPath(path),
      title: data.title ?? slugFromPath(path),
      goal: data.goal ?? '',
      order: Number(data.order ?? 0),
      section: data.section || UNSECTIONED,
      layout: data.layout === 'challenge' ? 'challenge' : 'lesson',
      pages: splitIntoPages(content),
    }
  })
  .sort((a, b) => a.order - b.order)

// Lessons grouped into sections, with section order determined by the first
// lesson (by `order`) that names each section. Both the index and the sidebar
// read from this so the grouping stays in one place.
export const lessonSections: LessonSection[] = lessons.reduce<LessonSection[]>((acc, lesson) => {
  const existing = acc.find((s) => s.title === lesson.section)
  if (existing) existing.lessons.push(lesson)
  else acc.push({ title: lesson.section, lessons: [lesson] })
  return acc
}, [])

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug)
}

// The displayed lesson number is derived from position in the sorted `lessons`
// array (1-based), never stored in content. This is the single source of truth
// for "what number is this lesson" - cards, the sidebar, and cross-reference
// links all read it, so inserting/reordering a lesson (change its `order`) is
// the only edit needed to renumber everything.
export function lessonNumber(slug: string): number {
  const index = lessons.findIndex((lesson) => lesson.slug === slug)
  return index === -1 ? 0 : index + 1
}

// The lesson that follows `slug` in `order`, or undefined if it's the last one.
export function nextLesson(slug: string): Lesson | undefined {
  const index = lessons.findIndex((lesson) => lesson.slug === slug)
  return index === -1 ? undefined : lessons[index + 1]
}

export interface JavaPlaygroundSpec {
  code: string
  initialInput?: string
}

// Drives the playground panel: a page's first ```java fence is what gets
// loaded into it. Pages can still show other code samples in their prose;
// only this one is treated as "the" runnable snippet for the page. An optional
// input="..." attribute opts the page into the runner's program-input field.
const JAVA_FENCE = /```java(?:[ \t]+([^\r\n]*))?\r?\n([\s\S]*?)```/

export function firstJavaPlayground(markdown: string): JavaPlaygroundSpec | null {
  const match = JAVA_FENCE.exec(markdown)
  if (!match) return null

  const metadata = match[1] ?? ''
  const input = /\binput=(?:"([^"]*)"|'([^']*)'|(\S+))/.exec(metadata)
  const initialInput = input ? (input[1] ?? input[2] ?? input[3]) : undefined

  return {
    code: match[2].trimEnd(),
    ...(initialInput !== undefined ? { initialInput } : {}),
  }
}

// Kept as the simple code-only helper for callers that do not need fence
// metadata.
export function firstJavaSnippet(markdown: string): string | null {
  return firstJavaPlayground(markdown)?.code ?? null
}

// Challenge layouts put the editable runner first, so remove its source fence
// from the supporting prose rather than showing a read-only duplicate.
export function stripFirstJavaFence(markdown: string): string {
  return markdown.replace(JAVA_FENCE, '').replace(/\n{3,}/g, '\n\n').trim()
}

// A page can swap the Java playground for the visual block editor with a
// ```blocks fence whose body names a preset (see lib/blockPresets.ts). The
// fence is a directive, not content, so it never renders in the prose column.
const BLOCKS_FENCE = /```blocks\r?\n([\s\S]*?)```/

export function blocksPreset(markdown: string): string | null {
  const match = BLOCKS_FENCE.exec(markdown)
  if (!match) return null
  const preset = /preset:\s*(\S+)/.exec(match[1])
  return preset ? preset[1] : 'build'
}

export function stripBlocksFence(markdown: string): string {
  return markdown
    .replace(/```blocks\r?\n[\s\S]*?```/g, '')
    .replace(/```maze[\s\S]*?```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// A page can swap the playground for the maze-generator demo with a ```maze
// fence. Like ```blocks it's a directive, not content, so it's stripped from
// the prose.
const MAZE_FENCE = /```maze\r?\n?([\s\S]*?)```/

export function hasMaze(markdown: string): boolean {
  return MAZE_FENCE.test(markdown)
}

// The maze fence can carry a `solver:` directive to reveal a solver control.
// The three canned modes drive the "what is an algorithm?" progression:
//   random — move to a random open neighbour (not an algorithm: unrepeatable)
//   naive  — fixed direction priority, no memory (an algorithm, but it loops)
//   wall   — the wall follower (an algorithm that works, if not optimally)
// The fourth, `java`, swaps the canned button for an editor where the student
// writes their own solver in real Java, run through the maze round-trip.
export type SolverMode = 'random' | 'naive' | 'wall' | 'java'

export function mazeSolver(markdown: string): SolverMode | null {
  const match = MAZE_FENCE.exec(markdown)
  if (!match) return null
  const m = /solver:\s*(random|naive|wall|java)/.exec(match[1])
  return m ? (m[1] as SolverMode) : null
}
