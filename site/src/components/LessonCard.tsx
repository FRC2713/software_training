import { Check, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Lesson } from '@/lib/lessons'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function LessonCard({
  lesson,
  index,
  completed = false,
}: {
  lesson: Lesson
  index: number
  completed?: boolean
}) {
  return (
    <Link
      to={`/lesson/${lesson.slug}`}
      className="group block rounded-xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="flex-row items-center gap-4 border-border bg-card p-4 shadow-none transition-colors hover:border-primary/70 dark:hover:border-[var(--emphasis)]/70">
        <span
          className={cn(
            'brand-figures flex size-9 shrink-0 items-center justify-center rounded-md border text-sm font-bold transition-colors',
            completed
              ? 'border-[var(--ok)]/30 bg-[var(--ok-bg)] text-[var(--ok)]'
              : 'border-border bg-[var(--surface)] text-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground',
          )}
          aria-label={completed ? `Lesson ${index + 1} completed` : undefined}
        >
          {completed ? <Check className="size-4 stroke-[2.5]" /> : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="brand-subheading text-base leading-snug text-[var(--ink)]">
            {lesson.title}
          </h3>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{lesson.goal}</p>
        </div>
        {completed ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--ok-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ok)]">
            <Check className="size-3 stroke-[2.5]" aria-hidden="true" />
            Done
          </span>
        ) : (
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--emphasis)]"
            aria-hidden="true"
          />
        )}
      </Card>
    </Link>
  )
}
