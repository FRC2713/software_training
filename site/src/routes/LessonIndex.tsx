import { lessons, lessonSections } from '@/lib/lessons'
import { useProgress } from '@/lib/progress'
import { LessonCard } from '@/components/LessonCard'

export function LessonIndex() {
  const { isCompleted, completedCount, totalLessons, user } = useProgress()
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-10 pb-20">
      <header className="mb-10 border-b border-border pb-7">
        <p className="brand-subheading text-xs uppercase tracking-widest text-[var(--emphasis)]">
          Red Hawk Robotics · Team 2713
        </p>
        <h1 className="brand-display mt-1 text-4xl text-[var(--ink)] sm:text-5xl">
          Software Training
        </h1>
        <div className="mt-3 h-[3px] w-14 bg-primary" aria-hidden="true" />
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Follow an FRC robot from its first boot on the workbench to running full mechanisms and
          autonomous paths in a match. Every lesson is short and hands-on, right in the browser.
        </p>
        {user && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border bg-[var(--surface)] px-4 py-3">
            <span className="brand-subheading text-xs uppercase tracking-wider text-muted-foreground">
              Progress
            </span>
            <div
              className="h-2 min-w-[120px] flex-1 overflow-hidden rounded-full bg-border"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="brand-figures text-sm font-semibold text-foreground">
              {completedCount} / {totalLessons}
            </span>
          </div>
        )}
      </header>
      <div className="flex flex-col gap-10">
        {lessonSections.map((section) => {
          const doneInSection = section.lessons.filter((l) => isCompleted(l.slug)).length
          return (
            <section key={section.title}>
              <div className="mb-4 flex items-baseline justify-between gap-2 border-b border-border pb-2">
                <h2 className="brand-heading text-base text-[var(--ink)]">
                  {section.title}
                </h2>
                <span className="brand-figures text-xs text-muted-foreground">
                  {user
                    ? `${doneInSection} / ${section.lessons.length}`
                    : `${section.lessons.length} lessons`}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {section.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.slug}
                    lesson={lesson}
                    index={lessons.indexOf(lesson)}
                    completed={isCompleted(lesson.slug)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
