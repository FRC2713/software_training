import './PageNav.css'

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
    <div className="page-nav">
      <button type="button" onClick={onPrev} disabled={index === 0}>
        ← Back
      </button>
      <div className="page-nav-dots">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to page ${i + 1}`}
            className={`page-nav-dot ${i === index ? 'page-nav-dot-active' : ''}`}
            onClick={() => onJump(i)}
          />
        ))}
      </div>
      <button type="button" onClick={onNext} disabled={index === total - 1}>
        Next →
      </button>
    </div>
  )
}
