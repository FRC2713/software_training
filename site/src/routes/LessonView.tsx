import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blocksPreset, firstJavaSnippet, getLesson, nextLesson, stripBlocksFence } from '@/lib/lessons'
import { JavaRunner } from '@/components/JavaRunner'
import { CodeBlock } from '@/components/CodeBlock'
import { BlockPlayground } from '@/components/BlockPlayground'
import { StatePlayground } from '@/components/StatePlayground'
import { isStatePreset } from '@/lib/statePresets'
import { PageNav } from '@/components/PageNav'

// Fenced code blocks in the prose render read-only through CodeMirror (same
// syntax highlighting + line numbers as the playground); the runnable copy of
// the first snippet still lives in the playground panel. Inline `code` stays as
// a plain styled element. `pre` is a pass-through so CodeBlock owns its own
// container instead of nesting inside a prose <pre>.
const markdownComponents: Components = {
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

// Tailwind Typography, retuned to the FRC palette: brand-red links, no backtick
// pseudo-elements on inline code, and code blocks on the muted surface.
const PROSE_CLASSES = [
  'prose dark:prose-invert max-w-none',
  'prose-headings:font-semibold prose-headings:text-foreground',
  'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
  'prose-code:rounded prose-code:bg-[var(--code-bg)] prose-code:px-1.5 prose-code:py-0.5',
  'prose-code:font-normal prose-code:text-foreground',
  'prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:border prose-pre:border-border prose-pre:bg-[var(--code-bg)] prose-pre:text-foreground',
].join(' ')

export function LessonView() {
  const { slug, page } = useParams()
  const navigate = useNavigate()
  const lesson = getLesson(slug ?? '')

  if (!lesson) return <Navigate to="/" replace />

  const pageCount = lesson.pages.length
  const requested = page ? Number(page) - 1 : 0
  const pageIndex = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 0), pageCount - 1)
    : 0
  const currentPage = lesson.pages[pageIndex]
  const preset = blocksPreset(currentPage.markdown)
  const prose = preset ? stripBlocksFence(currentPage.markdown) : currentPage.markdown
  const javaSnippet = firstJavaSnippet(currentPage.markdown)
  const hasPlayground = preset != null || javaSnippet != null

  const goTo = (index: number) => navigate(`/lesson/${lesson.slug}/${index + 1}`)

  const onLastPage = pageIndex === pageCount - 1
  const next = onLastPage ? nextLesson(lesson.slug) : undefined

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 pt-8 pb-20">
      <div className="mb-6">
        <Link className="mb-5 inline-block text-sm text-primary no-underline hover:underline" to="/">
          ← All lessons
        </Link>
        <p className="rounded-lg bg-primary/10 px-4 py-3 text-[15px] text-foreground">
          <strong>Goal:</strong> {lesson.goal}
        </p>
      </div>
      <div className={`flex flex-col items-start gap-8 ${hasPlayground ? 'lg:flex-row' : ''}`}>
        <article key={`${lesson.slug}-${pageIndex}`} className={`min-w-0 flex-1 ${PROSE_CLASSES}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {prose}
          </ReactMarkdown>
        </article>
        {hasPlayground && (
          <div className="w-full min-w-0 flex-1 lg:sticky lg:top-20 lg:min-w-[320px]">
            {preset && isStatePreset(preset) ? (
              <>
                <h2 className="mb-3 text-base font-semibold text-primary">▶ State machine</h2>
                <StatePlayground key={`${lesson.slug}-${pageIndex}-${preset}`} preset={preset} />
              </>
            ) : preset ? (
              <>
                <h2 className="mb-3 text-base font-semibold text-primary">▶ Block editor</h2>
                <BlockPlayground key={`${lesson.slug}-${pageIndex}-${preset}`} preset={preset} />
              </>
            ) : (
              <>
                <h2 className="mb-3 text-base font-semibold text-primary">▶ Playground</h2>
                <JavaRunner
                  key={`${lesson.slug}-${pageIndex}`}
                  initialCode={javaSnippet as string}
                  storageKey={`frc2713-playground:${lesson.slug}:${pageIndex + 1}`}
                />
              </>
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
      {onLastPage &&
        (next ? (
          <Link
            className="mt-6 flex flex-col gap-1 rounded-xl bg-primary/10 px-5 py-4 no-underline transition-[filter] hover:brightness-105"
            to={`/lesson/${next.slug}`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Next lesson
            </span>
            <span className="text-lg font-semibold text-foreground">{next.title} →</span>
          </Link>
        ) : (
          <Link
            className="mt-6 flex flex-col gap-1 rounded-xl bg-primary/10 px-5 py-4 no-underline transition-[filter] hover:brightness-105"
            to="/"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              You're all done
            </span>
            <span className="text-lg font-semibold text-foreground">Back to all lessons →</span>
          </Link>
        ))}
    </div>
  )
}
