import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { lessons } from '@/lib/lessons'

export interface ProgressUser {
  id: string
  name: string
}

interface ProgressPayload {
  user: ProgressUser
  completed: Record<string, string>
}

interface ProgressContextValue {
  user: ProgressUser | null
  completed: Record<string, string>
  loading: boolean
  savingSlug: string | null
  isCompleted: (slug: string) => boolean
  setCompleted: (slug: string, done: boolean) => Promise<boolean>
  completedCount: number
  totalLessons: number
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

const KNOWN_SLUGS = new Set(lessons.map((l) => l.slug))

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ProgressUser | null>(null)
  const [completed, setCompletedMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingSlug, setSavingSlug] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/progress')
      .then(async (res) => {
        if (!res.ok) return null
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return null
        return (await res.json()) as ProgressPayload
      })
      .then((data) => {
        if (cancelled || !data) return
        setUser(data.user)
        setCompletedMap(data.completed ?? {})
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isCompleted = useCallback((slug: string) => Boolean(completed[slug]), [completed])

  const setCompleted = useCallback(async (slug: string, done: boolean): Promise<boolean> => {
    setSavingSlug(slug)
    let previous: Record<string, string> = {}
    setCompletedMap((curr) => {
      previous = curr
      const next = { ...curr }
      if (done) next[slug] = new Date().toISOString()
      else delete next[slug]
      return next
    })

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonSlug: slug, completed: done }),
      })
      if (!res.ok) {
        setCompletedMap(previous)
        return false
      }
      const data = (await res.json()) as ProgressPayload
      setUser(data.user)
      setCompletedMap(data.completed ?? {})
      return true
    } catch {
      setCompletedMap(previous)
      return false
    } finally {
      setSavingSlug((curr) => (curr === slug ? null : curr))
    }
  }, [])

  const completedCount = useMemo(
    () => Object.keys(completed).filter((slug) => KNOWN_SLUGS.has(slug)).length,
    [completed],
  )

  const value = useMemo<ProgressContextValue>(
    () => ({
      user,
      completed,
      loading,
      savingSlug,
      isCompleted,
      setCompleted,
      completedCount,
      totalLessons: lessons.length,
    }),
    [user, completed, loading, savingSlug, isCompleted, setCompleted, completedCount],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
