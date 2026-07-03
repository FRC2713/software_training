import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blocksPreset, firstPythonSnippet, getLesson, stripBlocksFence } from '../lib/lessons'
import { PythonRunner } from '../components/PythonRunner'
import { BlockPlayground } from '../components/BlockPlayground'
import { PageNav } from '../components/PageNav'
import './LessonView.css'

const PLACEHOLDER_CODE = '# Nothing to run on this page yet.\n# Try writing some Python of your own!'

// The prose column shows code as plain, static text - the runnable version of
// it lives in the playground panel instead, so there's one interactive copy.
const markdownComponents: Components = {
  code: ({ className, children }) => <code className={className}>{children}</code>,
}

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
  const playgroundCode = firstPythonSnippet(currentPage.markdown) ?? PLACEHOLDER_CODE

  const goTo = (index: number) => navigate(`/lesson/${lesson.slug}/${index + 1}`)

  return (
    <div className="lesson-view">
      <div className="lesson-view-header">
        <Link className="lesson-view-back" to="/">
          ← All lessons
        </Link>
        <p className="lesson-view-goal">
          <strong>Goal:</strong> {lesson.goal}
        </p>
      </div>
      <div className="lesson-view-split">
        <article key={pageIndex} className="lesson-view-page">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {prose}
          </ReactMarkdown>
        </article>
        <div className="lesson-view-playground">
          {preset ? (
            <>
              <h2 className="lesson-view-playground-title">▶ Block editor</h2>
              <BlockPlayground key={`${pageIndex}-${preset}`} preset={preset} />
            </>
          ) : (
            <>
              <h2 className="lesson-view-playground-title">▶ Playground</h2>
              <PythonRunner key={pageIndex} initialCode={playgroundCode} />
            </>
          )}
        </div>
      </div>
      <PageNav
        index={pageIndex}
        total={pageCount}
        onPrev={() => goTo(pageIndex - 1)}
        onNext={() => goTo(pageIndex + 1)}
        onJump={goTo}
      />
    </div>
  )
}
