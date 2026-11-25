import type { ReactNode } from 'react'
import { ArrowRight, Blocks, Check, Circle, Compass, GitBranch } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  blocksPreset,
  firstRunnableSnippet,
  getLesson,
  hasMaze,
  mazeSolver,
  lessonNumber,
  nextLesson,
  stripBlocksFence,
} from '@/lib/lessons'
import { useProgress } from '@/lib/progress'
import { JavaRunner } from '@/components/JavaRunner'
import { CodeBlock } from '@/components/CodeBlock'
import { BlockPlayground } from '@/components/BlockPlayground'
import { FlowchartPlayground } from '@/components/FlowchartPlayground'
import { MazePlayground } from '@/components/MazePlayground'
import { StatePlayground } from '@/components/StatePlayground'
import { isFlowchartPreset } from '@/lib/flowchartPresets'
import { isStatePreset } from '@/lib/statePresets'
import { PageNav } from '@/components/PageNav'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Fenced code blocks in the prose render read-only through CodeMirror (same
// syntax highlighting + line numbers as the playground); the runnable copy of
// the first snippet still lives in the playground panel. Inline `code` stays as
// a plain styled element. `pre` is a pass-through so CodeBlock owns its own
// container instead of nesting inside a prose <pre>.
// Cross-reference links point at `#/lesson/<slug>` and carry no stored lesson
// number - their visible text uses `{n}` / `{title}` tokens that we fill in
// here from the target's CURRENT position, so reordering a lesson (its `order`)
// re-labels every reference to it automatically, with no content edit.
const LESSON_HREF = /^#\/lesson\/([a-z0-9-]+)$/

function flattenText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(flattenText).join('')
  return ''
}

const markdownComponents: Components = {
  a: ({ href, children }) => {
    const match = LESSON_HREF.exec(href ?? '')
    if (match) {
      const slug = match[1]
      const text = flattenText(children)
      if (text.includes('{n}') || text.includes('{title}')) {
        const filled = text
          .replace(/\{n\}/g, String(lessonNumber(slug)))
          .replace(/\{title\}/g, getLesson(slug)?.title ?? '')
        return <a href={href}>{filled}</a>
      }
    }
    return <a href={href}>{children}</a>
  },
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const language = /language-(\w+)/.exec(className ?? '')?.[1]
    const text = String(children ?? '')
    if (!language && !text.includes('\n')) {
      return <code className={className}>{children}</code>
    }
    return <CodeBlock code={text.replace(/\n$/, '')} language={language} />
  },
}

// Tailwind Typography tuned to the FRC 2713 palette & typography rules (paired
// with `.lesson-prose` in src/index.css).
const PROSE_CLASSES = [
  'prose dark:prose-invert lesson-prose max-w-none',
  'prose-code:rounded prose-code:border prose-code:border-border prose-code:bg-[var(--code-bg)] prose-code:px-1.5 prose-code:py-0.5',
  'prose-code:font-mono prose-code:text-[0.875em] prose-code:font-normal prose-code:text-[var(--ink)]',
  'prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:border prose-pre:border-border prose-pre:bg-[var(--code-bg)] prose-pre:text-foreground',
].join(' ')

export function LessonView() {
  const { slug, page } = useParams()
  const navigate = useNavigate()
  const { isCompleted, setCompleted, savingSlug, user } = useProgress()
  const lesson = getLesson(slug ?? '')

  if (!lesson) return <Navigate to="/" replace />

  const completed = isCompleted(lesson.slug)
  const saving = savingSlug === lesson.slug
  const toggleCompleted = () => {
    void setCompleted(lesson.slug, !completed)
  }

  const num = lessonNumber(lesson.slug)
  const pageCount = lesson.pages.length
  const requested = page ? Number(page) - 1 : 0
  const pageIndex = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 0), pageCount - 1)
    : 0
  const currentPage = lesson.pages[pageIndex]
  const preset = blocksPreset(currentPage.markdown)
  const maze = hasMaze(currentPage.markdown)
  const prose =
    preset || maze ? stripBlocksFence(currentPage.markdown) : currentPage.markdown
  const snippet = firstRunnableSnippet(currentPage.markdown)
  const hasPlayground = preset != null || maze || snippet != null

  const goTo = (index: number) => navigate(`/lesson/${lesson.slug}/${index + 1}`)

  const onLastPage = pageIndex === pageCount - 1
  const next = onLastPage ? nextLesson(lesson.slug) : undefined

  return (
    <div
      className={cn(
        'mx-auto w-full px-5 pt-7 pb-20',
        hasPlayground ? 'max-w-[1320px]' : 'max-w-3xl',
      )}
    >
      <div className="mb-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="brand-figures rounded bg-primary px-2 py-0.5 font-semibold text-primary-foreground">
              Lesson {num}
            </span>
            <span className="brand-subheading uppercase tracking-wider text-muted-foreground">
              {lesson.section}
            </span>
          </div>
          {user && (
            <Button
              type="button"
              size="sm"
              variant={completed ? 'default' : 'outline'}
              disabled={saving}
              onClick={toggleCompleted}
              className={
                completed
                  ? 'bg-[var(--ok)] text-white hover:bg-[var(--ok)]/90'
                  : undefined
              }
            >
              {completed ? (
                <>
                  <Check className="size-4" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="size-4" />
                  Mark lesson complete
                </>
              )}
            </Button>
          )}
        </div>

        <div className="brand-callout brand-callout-teal">
          <div className="brand-subheading text-xs uppercase tracking-wider text-[var(--ink)]">
            Goal
          </div>
          <p className="mt-0.5 text-[15px] leading-snug text-foreground">{lesson.goal}</p>
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 items-start gap-8',
          hasPlayground && 'lg:grid-cols-[minmax(0,1fr)_minmax(440px,1.08fr)]',
        )}
      >
        <article key={`${lesson.slug}-${pageIndex}`} className={`min-w-0 ${PROSE_CLASSES}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {prose}
          </ReactMarkdown>
        </article>
        {hasPlayground && (
          <div className="w-full min-w-0 lg:sticky lg:top-20">
            {maze ? (
              <>
                <h2 className="brand-subheading mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-foreground">
                  <Compass className="size-4 text-[var(--emphasis)]" aria-hidden="true" />
                  Maze playground
                </h2>
                <MazePlayground
                  key={`${lesson.slug}-${pageIndex}`}
                  solver={mazeSolver(currentPage.markdown)}
                />
              </>
            ) : preset && isStatePreset(preset) ? (
              <>
                <h2 className="brand-subheading mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-foreground">
                  <GitBranch className="size-4 text-[var(--emphasis)]" aria-hidden="true" />
                  State machine
                </h2>
                <StatePlayground key={`${lesson.slug}-${pageIndex}-${preset}`} preset={preset} />
              </>
            ) : preset && isFlowchartPreset(preset) ? (
              <FlowchartPlayground key={`${lesson.slug}-${pageIndex}-${preset}`} preset={preset} />
            ) : preset ? (
              <>
                <h2 className="brand-subheading mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-foreground">
                  <Blocks className="size-4 text-[var(--emphasis)]" aria-hidden="true" />
                  Block editor
                </h2>
                <BlockPlayground key={`${lesson.slug}-${pageIndex}-${preset}`} preset={preset} />
              </>
            ) : (
              <JavaRunner
                key={`${lesson.slug}-${pageIndex}`}
                initialCode={snippet!.code}
                storageKey={`frc2713-playground:${lesson.slug}:${pageIndex + 1}`}
              />
            )}
          </div>
        )}
      </div>

      <PageNav
        index={pageIndex}
        total={pageCount}
        onPrev={() => goTo(pageIndex - 1)}
        onNext={() => goTo(pageIndex + 1)}
        onJump={goTo}
      />

      {onLastPage && user && !completed && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-[var(--surface)] px-5 py-4">
          <div className="text-sm font-medium text-foreground">Finished this lesson?</div>
          <Button
            type="button"
            size="sm"
            disabled={saving}
            onClick={() => void setCompleted(lesson.slug, true)}
          >
            <Check className="size-4" />
            Mark lesson complete
          </Button>
        </div>
      )}

      {onLastPage &&
        (next ? (
          <Link
            className="group mt-6 flex items-center justify-between gap-4 rounded-lg border border-border border-l-4 border-l-primary bg-card px-5 py-4 no-underline transition-colors hover:border-primary/70 dark:hover:border-[var(--emphasis)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            to={`/lesson/${next.slug}`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="brand-subheading text-xs uppercase tracking-wider text-[var(--emphasis)]">
                Next lesson
              </span>
              <span className="brand-subheading text-lg text-[var(--ink)]">
                <span className="brand-figures mr-1.5 text-base text-muted-foreground">
                  {lessonNumber(next.slug)}.
                </span>
                {next.title}
              </span>
            </div>
            <ArrowRight
              className="size-5 shrink-0 text-[var(--emphasis)] transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <Link
            className="group mt-6 flex items-center justify-between gap-4 rounded-lg border border-border border-l-4 border-l-[var(--hawk-teal)] bg-card px-5 py-4 no-underline transition-colors hover:border-[var(--hawk-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            to="/"
          >
            <div className="flex flex-col gap-0.5">
              <span className="brand-subheading text-xs uppercase tracking-wider text-[var(--emphasis)]">
                Course complete
              </span>
              <span className="brand-subheading text-lg text-[var(--ink)]">
                Back to all lessons
              </span>
            </div>
            <ArrowRight
              className="size-5 shrink-0 text-[var(--emphasis)] transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        ))}
    </div>
  )
}
