export interface LessonPage {
  heading: string
  markdown: string
}

export interface Lesson {
  slug: string
  title: string
  goal: string
  order: number
  pages: LessonPage[]
}

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
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw)
    return {
      slug: slugFromPath(path),
      title: data.title ?? slugFromPath(path),
      goal: data.goal ?? '',
      order: Number(data.order ?? 0),
      pages: splitIntoPages(content),
    }
  })
  .sort((a, b) => a.order - b.order)

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug)
}

// Drives the playground panel: a page's first ```python fence is what gets
// loaded into it. Pages can still show other code samples in their prose;
// only this one is treated as "the" runnable snippet for the page.
export function firstPythonSnippet(markdown: string): string | null {
  const match = /```python\r?\n([\s\S]*?)```/.exec(markdown)
  return match ? match[1].trimEnd() : null
}

// A page can swap the Python playground for the visual block editor with a
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
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
