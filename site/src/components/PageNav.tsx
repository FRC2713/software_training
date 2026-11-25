import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PageNav({
  index,
  total,
  onPrev,
  onNext,
  onJump,
}: {
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  onJump: (index: number) => void
}) {
  const isFirst = index === 0
  const isLast = index === total - 1

  return (
    <nav
      aria-label="Lesson pagination"
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"
    >
      <Button variant="outline" size="sm" onClick={onPrev} disabled={isFirst}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Button>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center">
          {Array.from({ length: total }, (_, i) => {
            const current = i === index
            return (
              <button
                key={i}
                type="button"
                aria-label={`Go to page ${i + 1}`}
                aria-current={current ? 'page' : undefined}
                onClick={() => onJump(i)}
                className="group flex h-7 min-w-7 items-center justify-center rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    'block h-2 rounded-full transition-all',
                    current
                      ? 'w-5 bg-primary'
                      : 'w-2 bg-[var(--border-strong)] group-hover:bg-foreground/60',
                  )}
                />
              </button>
            )
          })}
        </div>
        <span className="brand-figures text-xs text-muted-foreground">
          Page {index + 1} of {total}
        </span>
      </div>

      <Button
        variant={isLast ? 'outline' : 'default'}
        size="sm"
        onClick={onNext}
        disabled={isLast}
      >
        Next
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}
