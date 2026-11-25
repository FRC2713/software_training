import { Check } from 'lucide-react'
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
    <Link to={`/lesson/${lesson.slug}`} className="block no-underline">
      <Card className="flex-row items-center gap-4 p-5 transition-colors hover:border-primary/50">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full font-bold',
            completed
              ? 'bg-[var(--ok)]/15 text-[var(--ok)]'
              : 'bg-primary/10 text-primary',
          )}
          aria-label={completed ? `Lesson ${index + 1} completed` : undefined}
        >
          {completed ? <Check className="size-4 stroke-[2.5]" /> : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground">{lesson.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{lesson.goal}</p>
        </div>
        {completed && (
          <span className="shrink-0 rounded-full bg-[var(--ok)]/12 px-2.5 py-0.5 text-xs font-medium text-[var(--ok)]">
            Done
          </span>
        )}
      </Card>
    </Link>
  )
}
