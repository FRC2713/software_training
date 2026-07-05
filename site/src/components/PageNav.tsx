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
  return (
    <div className="mt-8 flex items-center justify-between gap-4 border-t pt-4">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={index === 0}>
        ← Back
      </Button>
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to page ${i + 1}`}
            onClick={() => onJump(i)}
            className={cn(
              'size-2.5 rounded-full border border-primary/50 transition-colors',
              i === index ? 'bg-primary' : 'hover:bg-primary/30',
            )}
          />
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={onNext} disabled={index === total - 1}>
        Next →
      </Button>
    </div>
  )
}
