import { lessons } from '../lib/lessons'
import { LessonCard } from '../components/LessonCard'
import './LessonIndex.css'

export function LessonIndex() {
  return (
    <div className="lesson-index">
      <header>
        <h1>FRC 2713 Software Training</h1>
        <p>
          Learn the fundamentals of programming, one short lesson at a time.
          Every lesson is hands-on — build and run things right in the browser.
        </p>
      </header>
      <div className="lesson-list">
        {lessons.map((lesson, i) => (
          <LessonCard key={lesson.slug} lesson={lesson} index={i} />
        ))}
      </div>
    </div>
  )
}
