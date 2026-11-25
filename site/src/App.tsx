import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AppSidebar } from './components/AppSidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { getLesson, lessonNumber } from '@/lib/lessons'
import { ProgressProvider, useProgress } from '@/lib/progress'
import { LessonIndex } from './routes/LessonIndex'
import { LessonView } from './routes/LessonView'

function HeaderBreadcrumb() {
  const { pathname } = useLocation()
  const match = /^\/lesson\/([^/]+)(?:\/(\d+))?/.exec(pathname)

  if (!match) {
    return (
      <span className="brand-subheading text-sm text-muted-foreground">All lessons</span>
    )
  }

  const slug = match[1]
  const lesson = getLesson(slug)
  if (!lesson) {
    return (
      <span className="brand-subheading text-sm text-muted-foreground">All lessons</span>
    )
  }

  const num = lessonNumber(slug)
  const pageCount = lesson.pages.length
  const requested = match[2] ? Number(match[2]) : 1
  const currentPage = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), pageCount)
    : 1

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      <Link
        to="/"
        className="shrink-0 text-[var(--link)] no-underline hover:underline"
      >
        All lessons
      </Link>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="brand-figures shrink-0 text-xs font-semibold text-[var(--emphasis)]">
        {num}
      </span>
      <span className="brand-subheading truncate text-foreground" title={lesson.title}>
        {lesson.title}
      </span>
      {pageCount > 1 && (
        <span className="brand-figures ml-1 hidden shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-block">
          Page {currentPage} / {pageCount}
        </span>
      )}
    </nav>
  )
}

function HeaderProgress() {
  const { user, completedCount, totalLessons, loading } = useProgress()
  if (loading || !user) return null
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="ml-auto flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <div
          className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="brand-figures font-medium text-foreground">
          {completedCount} / {totalLessons}
        </span>
      </div>
      <span className="hidden sm:inline text-border" aria-hidden="true">
        ·
      </span>
      <span className="hidden sm:inline truncate max-w-[160px]" title={user.name}>
        {user.name}
      </span>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <ProgressProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2.5 border-b bg-background/90 px-4 backdrop-blur">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" aria-hidden="true" />
              <HeaderBreadcrumb />
              <HeaderProgress />
            </header>
            <Routes>
              <Route path="/" element={<LessonIndex />} />
              <Route path="/lesson/:slug" element={<LessonView />} />
              <Route path="/lesson/:slug/:page" element={<LessonView />} />
            </Routes>
          </SidebarInset>
        </SidebarProvider>
      </ProgressProvider>
    </HashRouter>
  )
}

export default App
