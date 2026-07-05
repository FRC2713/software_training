import { lessons } from '@/lib/lessons'
import { LessonCard } from '@/components/LessonCard'

export function LessonIndex() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-foreground">FRC 2713 Software Training</h1>
        <p className="mt-3 text-[17px] text-muted-foreground">
          Learn the fundamentals of programming, one short lesson at a time. Every lesson is
          hands-on — build and run things right in the browser.
        </p>
      </header>
      <div className="flex flex-col gap-3">
        {lessons.map((lesson, i) => (
          <LessonCard key={lesson.slug} lesson={lesson} index={i} />
        ))}
      </div>
    </div>
  )
}
