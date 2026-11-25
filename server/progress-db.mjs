import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export function openProgressDb(dbPath) {
  if (dbPath !== ':memory:') {
    mkdirSync(path.dirname(dbPath), { recursive: true })
  }

  const db = new DatabaseSync(dbPath)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS users (
      user_key TEXT PRIMARY KEY,
      slack_user_id TEXT NOT NULL,
      slack_team_id TEXT NOT NULL,
      slack_name TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lesson_completions (
      user_key TEXT NOT NULL REFERENCES users(user_key) ON DELETE CASCADE,
      lesson_slug TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_key, lesson_slug)
    );
  `)

  const upsertUserStmt = db.prepare(`
    INSERT INTO users (user_key, slack_user_id, slack_team_id, slack_name, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_key) DO UPDATE SET
      slack_name = excluded.slack_name,
      updated_at = datetime('now')
  `)

  const listCompletedStmt = db.prepare(`
    SELECT lesson_slug, completed_at
    FROM lesson_completions
    WHERE user_key = ?
    ORDER BY completed_at ASC
  `)

  const markCompleteStmt = db.prepare(`
    INSERT INTO lesson_completions (user_key, lesson_slug, completed_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_key, lesson_slug) DO NOTHING
  `)

  const unmarkCompleteStmt = db.prepare(`
    DELETE FROM lesson_completions
    WHERE user_key = ? AND lesson_slug = ?
  `)

  return {
    upsertUser({ userKey, slackUserId, slackTeamId, slackName }) {
      upsertUserStmt.run(userKey, slackUserId, slackTeamId, slackName)
    },

    getCompletedLessons(userKey) {
      const rows = listCompletedStmt.all(userKey)
      const completed = {}
      for (const row of rows) {
        completed[row.lesson_slug] = row.completed_at
      }
      return completed
    },

    setLessonCompleted(user, lessonSlug, completed) {
      upsertUserStmt.run(user.userKey, user.slackUserId, user.slackTeamId, user.slackName)
      if (completed) {
        markCompleteStmt.run(user.userKey, lessonSlug)
      } else {
        unmarkCompleteStmt.run(user.userKey, lessonSlug)
      }
      return this.getCompletedLessons(user.userKey)
    },

    close() {
      db.close()
    },
  }
}
