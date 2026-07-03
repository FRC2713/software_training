import { Link } from 'react-router-dom'
import type { Lesson } from '../lib/lessons'
import './LessonCard.css'

export function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  return (
    <Link className="lesson-card" to={`/lesson/${lesson.slug}`}>
      <span className="lesson-card-number">{index + 1}</span>
      <span className="lesson-card-body">
        <h2>{lesson.title}</h2>
        <p>{lesson.goal}</p>
      </span>
    </Link>
  )
}
