import { Link } from 'react-router-dom'
import type { Lesson } from '@/lib/lessons'
import { Card } from '@/components/ui/card'

export function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  return (
    <Link to={`/lesson/${lesson.slug}`} className="block no-underline">
      <Card className="flex-row items-center gap-4 p-5 transition-colors hover:border-primary/50">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
          {index + 1}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{lesson.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{lesson.goal}</p>
        </div>
      </Card>
    </Link>
  )
}
