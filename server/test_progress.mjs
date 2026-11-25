import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { openProgressDb } from './progress-db.mjs'

test('records and toggles lesson completions per user', () => {
  const db = openProgressDb(':memory:')
  try {
    const alice = {
      userKey: 'T2713:U001',
      slackUserId: 'U001',
      slackTeamId: 'T2713',
      slackName: 'Alice',
    }
    const bob = {
      userKey: 'T2713:U002',
      slackUserId: 'U002',
      slackTeamId: 'T2713',
      slackName: 'Bob',
    }

    assert.deepEqual(db.getCompletedLessons(alice.userKey), {})

    const afterFirst = db.setLessonCompleted(alice, '01-flowcharts', true)
    assert.ok(afterFirst['01-flowcharts'])
    assert.deepEqual(db.getCompletedLessons(bob.userKey), {})

    // Marking the same lesson complete twice keeps the original timestamp.
    const firstTs = afterFirst['01-flowcharts']
    const afterDup = db.setLessonCompleted(alice, '01-flowcharts', true)
    assert.equal(afterDup['01-flowcharts'], firstTs)

    // Completing a second lesson and unmarking the first.
    db.setLessonCompleted(alice, '02-conditionals', true)
    const afterUnmark = db.setLessonCompleted(alice, '01-flowcharts', false)
    assert.equal(afterUnmark['01-flowcharts'], undefined)
    assert.ok(afterUnmark['02-conditionals'])
  } finally {
    db.close()
  }
})

test('persists completions across reopen on disk', () => {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'hawk-learn-progress-'))
  const dbPath = path.join(tmpDir, 'progress.db')
  const user = {
    userKey: 'T2713:U009',
    slackUserId: 'U009',
    slackTeamId: 'T2713',
    slackName: 'Maya',
  }

  try {
    const db1 = openProgressDb(dbPath)
    db1.setLessonCompleted(user, '06-hello-world', true)
    db1.close()

    const db2 = openProgressDb(dbPath)
    const completed = db2.getCompletedLessons(user.userKey)
    assert.ok(completed['06-hello-world'])
    db2.close()
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})
