import { describe, it, expect } from 'vitest';
import { sessionImproved, calcProgressStreak } from './streaks.js';
import type { Session, Entry, WeightEntry } from '$lib/data/types.js';

// ── Helper factories ──

function makeWeightEntry(
  exercise: string,
  sets: Array<{ w: number; r: number; warmup?: boolean }>
): WeightEntry {
  return { exercise, type: 'pesas', sets, unit: 'kg' };
}

function makeSession(date: string, dayKey: string, entries: Entry[]): Session {
  return { date, dayKey, entries };
}

// ── sessionImproved ──

describe('sessionImproved', () => {
  it('returns true for the first session (no previous history)', () => {
    const sess = makeSession('2025-03-05', 'miercoles', [
      makeWeightEntry('Bench Press', [{ w: 60, r: 10 }])
    ]);
    expect(sessionImproved(sess, [sess])).toBe(true);
  });

  it('returns true when max weight increased', () => {
    const prev = makeSession('2025-02-26', 'miercoles', [
      makeWeightEntry('Bench Press', [{ w: 60, r: 10 }])
    ]);
    const curr = makeSession('2025-03-05', 'miercoles', [
      makeWeightEntry('Bench Press', [{ w: 65, r: 10 }])
    ]);
    const all = [prev, curr];
    expect(sessionImproved(curr, all)).toBe(true);
  });

  it('returns true when volume increased (same weight, more reps)', () => {
    const prev = makeSession('2025-02-26', 'miercoles', [
      makeWeightEntry('Squat', [{ w: 80, r: 8 }])
    ]);
    const curr = makeSession('2025-03-05', 'miercoles', [
      makeWeightEntry('Squat', [{ w: 80, r: 10 }])
    ]);
    const all = [prev, curr];
    expect(sessionImproved(curr, all)).toBe(true);
  });

  it('returns false when no improvement occurred', () => {
    const prev = makeSession('2025-02-26', 'miercoles', [
      makeWeightEntry('Bench Press', [{ w: 60, r: 10 }])
    ]);
    const curr = makeSession('2025-03-05', 'miercoles', [
      makeWeightEntry('Bench Press', [{ w: 60, r: 10 }])
    ]);
    const all = [prev, curr];
    expect(sessionImproved(curr, all)).toBe(false);
  });

  it('returns false for a session with no entries', () => {
    const sess = makeSession('2025-03-05', 'miercoles', []);
    expect(sessionImproved(sess, [sess])).toBe(false);
  });
});

// ── calcProgressStreak ──

describe('calcProgressStreak', () => {
  it('returns 0 for empty sessions array', () => {
    expect(calcProgressStreak([])).toBe(0);
  });

  it('returns count of all sessions when all show improvement', () => {
    // Each session is first for its dayKey, so all count as improved
    const sessions = [
      makeSession('2025-03-03', 'lunes', [
        makeWeightEntry('Squat', [{ w: 80, r: 8 }])
      ]),
      makeSession('2025-03-05', 'miercoles', [
        makeWeightEntry('Bench Press', [{ w: 60, r: 10 }])
      ]),
      makeSession('2025-03-07', 'viernes', [
        makeWeightEntry('Deadlift', [{ w: 100, r: 5 }])
      ])
    ];
    expect(calcProgressStreak(sessions)).toBe(3);
  });

  it('stops counting at the first non-improving session', () => {
    const s1 = makeSession('2025-02-24', 'lunes', [
      makeWeightEntry('Squat', [{ w: 80, r: 8 }])
    ]);
    const s2 = makeSession('2025-03-03', 'lunes', [
      makeWeightEntry('Squat', [{ w: 80, r: 8 }]) // same as s1, no improvement
    ]);
    const s3 = makeSession('2025-03-05', 'miercoles', [
      makeWeightEntry('Bench Press', [{ w: 60, r: 10 }]) // first miercoles = improved
    ]);
    const all = [s1, s2, s3];
    // sorted by date desc: s3, s2, s1
    // s3: first miercoles -> improved (streak=1)
    // s2: same as s1 on lunes -> NOT improved (break)
    expect(calcProgressStreak(all)).toBe(1);
  });
});
