import { lessons, lessonSections } from '@/lib/lessons'
import { useProgress } from '@/lib/progress'
import { LessonCard } from '@/components/LessonCard'

export function LessonIndex() {
  const { isCompleted, completedCount, totalLessons, user } = useProgress()

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-foreground">FRC 2713 Software Training</h1>
        <p className="mt-3 text-[17px] text-muted-foreground">
          Learn the fundamentals of programming, one short lesson at a time. Every lesson is
          hands-on — build and run things right in the browser.
        </p>
        {user && (
          <p className="mt-3 text-sm text-muted-foreground tabular-nums">
            Progress:{' '}
            <strong className="font-semibold text-foreground">
              {completedCount} of {totalLessons}
            </strong>{' '}
            lessons completed
          </p>
        )}
      </header>
      <div className="flex flex-col gap-10">
        {lessonSections.map((section) => {
          const doneInSection = section.lessons.filter((l) => isCompleted(l.slug)).length
          return (
            <section key={section.title}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h2>
                {user && (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {doneInSection} / {section.lessons.length}
                  </span>
                )}
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
