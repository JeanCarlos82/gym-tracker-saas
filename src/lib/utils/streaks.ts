import type { Session, Entry, Routine, WeightEntry } from '$lib/data/types.js';
import { DK } from '$lib/data/constants.js';
import { today } from '$lib/utils/format.js';
import { entryMaxWeight, entryVolume } from '$lib/utils/calculations.js';

/**
 * Calculate the consistency streak: how many consecutive scheduled training
 * days the user actually trained (working backwards from today).
 *
 * Rest days are skipped (they don't break the streak).
 *
 * @param sessions - all logged sessions
 * @param routine - the weekly routine (to know which days are rest)
 */
export function calcStreak(sessions: Session[], routine: Routine): number {
  // Guard: if all days are rest (default routine), no streak possible
  const hasTrainingDays = Object.values(routine).some(d => d && !d.rest);
  if (!hasTrainingDays || !sessions.length) return 0;

  const dates = new Set(
    sessions.filter((s) => s.entries?.length > 0).map((s) => s.date)
  );
  let n = 0;
  const d = new Date();
  if (!dates.has(today())) d.setDate(d.getDate() - 1);

  let maxIter = 400;
  while (maxIter-- > 0) {
    const k = d.toISOString().split('T')[0];
    const dk = DK[d.getDay()];
    const isRest = routine[dk]?.rest;
    if (isRest) {
      d.setDate(d.getDate() - 1);
      continue;
    }
    if (!dates.has(k)) break;
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/**
 * Determine whether a session showed improvement over the previous
 * session for the same day-key.
 *
 * Improvement = higher max weight, higher volume, more reps at same weight,
 * or an all-time PR on any exercise.
 *
 * @param sess - the session to evaluate
 * @param allSessions - all sessions (needed for historical comparison)
 */
export function sessionImproved(sess: Session, allSessions: Session[]): boolean {
  if (!sess || !sess.entries?.length) return false;

  // Find the previous session for the same day of the week
  const prevSessions = allSessions
    .filter(
      (s) =>
        s.dayKey === sess.dayKey &&
        s.date < sess.date &&
        s.entries?.length > 0
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!prevSessions.length) return true; // First session ever = counts as progress

  const prev = prevSessions[0];

  // Check each exercise in current session
  for (const entry of sess.entries) {
    if (entry.type === 'cardio') continue;
    const prevEntry = prev.entries?.find((e) => e.exercise === entry.exercise);
    if (!prevEntry) continue;

    const curMax = entryMaxWeight(entry);
    const prevMax = entryMaxWeight(prevEntry);
    if (curMax && prevMax && curMax > prevMax) return true; // Weight up

    const curVol = entryVolume(entry);
    const prevVol = entryVolume(prevEntry);
    if (curVol > prevVol) return true; // Volume up

    // Same weight, more reps on best set
    if (curMax && prevMax && curMax === prevMax && entry.type === 'pesas' && prevEntry.type === 'pesas') {
      const curSets = (entry as WeightEntry).sets || [];
      const prevSets = (prevEntry as WeightEntry).sets || [];
      const curBestReps = Math.max(
        ...curSets
          .filter((s) => !s.warmup && parseFloat(String(s.w)) === curMax)
          .map((s) => parseInt(String(s.r)) || 0),
        0
      );
      const prevBestReps = Math.max(
        ...prevSets
          .filter((s) => !s.warmup && parseFloat(String(s.w)) === prevMax)
          .map((s) => parseInt(String(s.r)) || 0),
        0
      );
      if (curBestReps > prevBestReps) return true;
    }
  }

  // Check for any all-time PR
  for (const entry of sess.entries) {
    if (entry.type === 'cardio') continue;
    const curMax = entryMaxWeight(entry);
    if (!curMax) continue;

    const allPrev = allSessions
      .filter((s) => s.date < sess.date)
      .flatMap((s) => s.entries || [])
      .filter((e) => e.exercise === entry.exercise);

    const allTimeMax = allPrev.length
      ? Math.max(...allPrev.map((e) => entryMaxWeight(e) || 0))
      : 0;
    if (curMax > allTimeMax) return true; // New PR
  }

  return false;
}

/**
 * Calculate the progress streak: how many consecutive sessions (most recent
 * first) showed improvement.
 *
 * @param sessions - all logged sessions
 */
export function calcProgressStreak(sessions: Session[]): number {
  const sorted = [...sessions]
    .filter((s) => s.entries?.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  let n = 0;
  for (const sess of sorted) {
    if (sessionImproved(sess, sessions)) n++;
    else break;
  }
  return n;
}
