import type {
  Entry,
  WeightEntry,
  CardioEntry,
  SetCountResult,
  SmartSuggestionResult,
  LinearRegressionResult,
  PlateauResult,
  Objective
} from '$lib/data/types.js';
import { getExerciseInfo } from '$lib/data/exercises.js';

// ── MET values per exercise and intensity (Compendium of Physical Activities) ──
// MET = oxygen consumption relative to rest. kcal/min = MET * weight(kg) * 3.5 / 200

export const CARDIO_METS: Record<string, Record<string, number>> = {
  'Correr': { baja: 6, media: 8.5, alta: 11 },
  'Caminadora': { baja: 3.5, media: 5, alta: 8 },
  'Caminar': { baja: 2.5, media: 3.5, alta: 5 },
  'Elíptica': { baja: 4.5, media: 6, alta: 8 },
  'Bicicleta estática': { baja: 4, media: 6.5, alta: 10 },
  'Stairmaster': { baja: 6, media: 8, alta: 10 },
  'Remo ergómetro': { baja: 5, media: 7, alta: 10 },
  'Saltar cuerda': { baja: 8, media: 10, alta: 12 },
  'Natación': { baja: 4.5, media: 7, alta: 10 },
  'Bicicleta de asalto': { baja: 6, media: 9, alta: 12 },
  'HIIT': { baja: 6, media: 9, alta: 12 }
};

// ── HTML escaping ──

/**
 * Escape HTML special characters in a string.
 */
export function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── 1RM Calculator (Epley formula) ──

/**
 * Estimate 1-rep max from weight and reps using Epley formula.
 * @param w - weight lifted
 * @param r - number of reps
 * @returns estimated 1RM, or 0 if inputs are invalid
 */
export function calc1RM(w: number, r: number): number {
  if (!w || !r || r <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}

/**
 * Get the best estimated 1RM across all working sets in an entry.
 */
export function entryBest1RM(e: Entry | null | undefined): number {
  if (!e || !('sets' in e) || !e.sets?.length) return 0;
  const working = e.sets.filter((s) => !s.warmup);
  if (!working.length) return 0;
  return Math.max(
    ...working.map((s) => calc1RM(parseFloat(String(s.w)) || 0, parseInt(String(s.r)) || 0))
  );
}

// ── Entry helpers (warmup-aware) ──

/**
 * Get the maximum weight used in working sets of an entry.
 * Falls back to entry.weight for legacy single-weight entries.
 */
export function entryMaxWeight(e: Entry | null | undefined): number | null {
  if (!e) return null;
  if ('sets' in e && e.sets?.length) {
    const working = e.sets.filter((s) => !s.warmup);
    if (!working.length) return null;
    return Math.max(...working.map((s) => parseFloat(String(s.w)) || 0));
  }
  // Legacy single-weight entry support
  if ('weight' in e && (e as Record<string, unknown>).weight) {
    return parseFloat(String((e as Record<string, unknown>).weight));
  }
  return null;
}

/**
 * Calculate total volume (weight x reps) across working sets.
 */
export function entryVolume(e: Entry | null | undefined): number {
  if (!e) return 0;
  if ('sets' in e && e.sets?.length) {
    return e.sets
      .filter((s) => !s.warmup)
      .reduce((a, s) => a + (parseFloat(String(s.w)) || 0) * (parseInt(String(s.r)) || 0), 0);
  }
  return 0;
}

/**
 * Count working, warmup, and total sets in an entry.
 */
export function entrySetCount(e: Entry | null | undefined): SetCountResult {
  if (!e) return { working: 0, warmup: 0, total: 0 };
  if ('sets' in e && e.sets?.length) {
    const w = e.sets.filter((s) => !s.warmup).length;
    const c = e.sets.filter((s) => s.warmup).length;
    return { working: w, warmup: c, total: e.sets.length };
  }
  // Legacy single-weight entry
  const hasWeight = 'weight' in e && !!(e as Record<string, unknown>).weight;
  return { working: hasWeight ? 1 : 0, warmup: 0, total: hasWeight ? 1 : 0 };
}

/**
 * Build a human-readable summary string for an entry.
 */
export function entrySummaryText(e: Entry | null | undefined): string {
  if (!e) return '';
  if ('sets' in e && e.sets?.length) {
    const mx = entryMaxWeight(e);
    const sc = entrySetCount(e);
    const parts: string[] = [];
    if (sc.warmup) parts.push(`${sc.warmup}C`);
    parts.push(`${sc.working}T`);
    return `${parts.join('+')} series · ${mx}${(e as WeightEntry).unit || 'kg'} máx`;
  }
  if ('weight' in e && (e as Record<string, unknown>).weight) {
    return `${(e as Record<string, unknown>).weight} ${(e as WeightEntry).unit || 'kg'}`;
  }
  if (e.type === 'cardio') {
    const ce = e as CardioEntry;
    const parts: string[] = [`${ce.min || 0}min`];
    if (ce.intensity && ce.intensity !== 'media') parts.push(ce.intensity);
    if (ce.km) parts.push(ce.km + 'km');
    if (ce.cal) parts.push((ce.calEstimated ? '~' : '') + ce.cal + 'kcal');
    return parts.join(' · ');
  }
  return '';
}

// ── Linear regression ──

/**
 * Simple linear regression over an array of Y values (X = index 0..n-1).
 */
export function linearRegression(pts: number[]): LinearRegressionResult {
  const n = pts.length;
  if (n < 2) return { slope: 0, intercept: pts[0] || 0 };
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += i;
    sy += pts[i];
    sxx += i * i;
    sxy += i * pts[i];
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return { slope: 0, intercept: sy / n };
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept };
}

// ── Plateau detection ──

/**
 * Detect whether recent data points indicate a training plateau.
 * @param pts - array of weight/performance values
 * @param windowSize - how many recent points to examine (default 4)
 */
export function detectPlateau(pts: number[], windowSize: number = 4): PlateauResult {
  if (pts.length < windowSize) return { isPlateaued: false, sessionsStuck: 0 };
  const recent = pts.slice(-windowSize);
  const maxRecent = Math.max(...recent);
  const minRecent = Math.min(...recent);
  const range = maxRecent - minRecent;
  const tolerance = maxRecent * 0.03;
  if (range <= tolerance) return { isPlateaued: true, sessionsStuck: windowSize };
  const lr = linearRegression(recent);
  if (lr.slope <= 0) return { isPlateaued: true, sessionsStuck: windowSize };
  return { isPlateaued: false, sessionsStuck: 0 };
}

// ── Smart suggestion ──

/**
 * Generate a smart weight suggestion for an exercise based on recent history.
 *
 * This is a "semi-pure" function: it requires passing sessions, objective, and
 * the getLastEntries results externally. The original vanilla version read globals;
 * this version takes explicit parameters.
 *
 * @param name - exercise name
 * @param lastEntries - the last N entries for this exercise (most recent first)
 * @param objective - current training objective
 */
export function smartSuggestion(
  name: string,
  lastEntries: Entry[],
  objective: Objective
): SmartSuggestionResult | null {
  if (!lastEntries.length) return null;
  const last = lastEntries[0];
  const lastMax = entryMaxWeight(last);
  if (!lastMax) return null;
  const unit = ('unit' in last ? (last as WeightEntry).unit : 'kg') || 'kg';
  const info = getExerciseInfo(name);

  // Determine increment size based on exercise type
  const isCompoundLower = [
    'Sentadilla', 'Peso muerto', 'Prensa de pierna',
    'Peso muerto rumano', 'Peso muerto sumo', 'Hip thrust', 'Hack squat'
  ].some((c) => name.includes(c));
  const isIsolation =
    info?.muscleGroup?.length === 1 &&
    !['Sentadilla', 'Press banca', 'Press militar', 'Peso muerto', 'Dominadas', 'Remo con barra']
      .some((c) => name.includes(c));
  const increment = isCompoundLower ? 5 : isIsolation ? 1.25 : 2.5;

  // Target reps based on objective
  const targetReps = objective === 'fuerza' ? 5 : objective === 'hipertrofia' ? 10 : 15;

  // Analyze last session performance
  const workingSets = ('sets' in last ? (last as WeightEntry).sets : [])
    ?.filter((s) => !s.warmup) || [];
  const setsAtMax = workingSets.filter((s) => parseFloat(String(s.w)) === lastMax);
  const lastSetReps = setsAtMax.length
    ? parseInt(String(setsAtMax[setsAtMax.length - 1].r)) || 0
    : 0;
  const exceededBy = lastSetReps - targetReps;

  // Check 2-for-2 rule with at least 2 sessions of history
  if (lastEntries.length >= 2) {
    const prevMax = entryMaxWeight(lastEntries[1]);

    // Weight dropped -> maintain
    if (prevMax !== null && lastMax < prevMax) {
      return {
        weight: lastMax,
        msg: `Mantener ${lastMax}${unit}`,
        reason: 'Bajaste peso — consolida antes de subir',
        color: 'b'
      };
    }

    // 2-for-2 rule check
    const prevWorkingSets = ('sets' in lastEntries[1]
      ? (lastEntries[1] as WeightEntry).sets
      : [])?.filter((s) => !s.warmup) || [];
    const prevSetsAtMax = prevWorkingSets.filter(
      (s) => parseFloat(String(s.w)) === prevMax
    );
    const prevLastSetReps = prevSetsAtMax.length
      ? parseInt(String(prevSetsAtMax[prevSetsAtMax.length - 1].r)) || 0
      : 0;
    const prevExceeded = prevLastSetReps - targetReps;

    if (exceededBy >= 2 && prevExceeded >= 2 && lastMax === prevMax) {
      const newWeight = lastMax + increment;
      return {
        weight: newWeight,
        msg: `Subir a ${newWeight}${unit}`,
        reason: `Regla 2-for-2: +${increment}${unit}`,
        color: 'g'
      };
    }

    // Same weight for 3 sessions, all completed -> ready
    if (lastEntries.length >= 3) {
      const allSame = lastEntries.every((e) => entryMaxWeight(e) === lastMax);
      const allCompleted = lastEntries.every((e) => {
        const ws = ('sets' in e ? (e as WeightEntry).sets : [])
          ?.filter((s) => !s.warmup) || [];
        const atMax = ws.filter((s) => parseFloat(String(s.w)) === entryMaxWeight(e));
        return atMax.length > 0 && atMax.every((s) => parseInt(String(s.r)) >= targetReps);
      });
      if (allSame && allCompleted) {
        const newWeight = lastMax + increment;
        return {
          weight: newWeight,
          msg: `Subir a ${newWeight}${unit}`,
          reason: `3 sesiones dominando — listo para +${increment}${unit}`,
          color: 'g'
        };
      }
    }
  }

  // Exceeded target reps but not 2-for-2 yet -> almost ready
  if (exceededBy >= 2) {
    return {
      weight: lastMax,
      msg: `Mantener ${lastMax}${unit}`,
      reason: `Vas bien (+${exceededBy} reps) — repite para confirmar`,
      color: 'o'
    };
  }

  // Completed target reps -> on track
  if (exceededBy >= 0) {
    return {
      weight: lastMax,
      msg: `Mantener ${lastMax}${unit}`,
      reason: 'Buen ritmo — sigue así',
      color: 'b'
    };
  }

  // Didn't reach target reps -> maintain
  return {
    weight: lastMax,
    msg: `Mantener ${lastMax}${unit}`,
    reason: `Faltan ${Math.abs(exceededBy)} reps — no subas aún`,
    color: 'b'
  };
}

// ── Calorie estimation ──

/**
 * Estimate calories burned during a cardio exercise.
 * @param exercise - exercise name (key into CARDIO_METS)
 * @param intensity - 'baja' | 'media' | 'alta'
 * @param minutes - duration in minutes
 * @param weightKg - user's body weight in kg
 */
export function estimateCalories(
  exercise: string,
  intensity: string,
  minutes: number,
  weightKg: number
): number {
  const mets = CARDIO_METS[exercise] || { baja: 4, media: 6, alta: 8 };
  const met = mets[intensity] || mets.media;
  return Math.round((met * weightKg * 3.5) / 200 * minutes);
}
