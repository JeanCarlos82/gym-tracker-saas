import { describe, it, expect } from 'vitest';
import type { WeightEntry } from '$lib/data/types';
import {
  escapeHtml,
  calc1RM,
  entryMaxWeight,
  entryVolume,
  entrySetCount,
  linearRegression,
  detectPlateau,
  estimateCalories
} from './calculations';

function makeWeightEntry(
  sets: Array<{ w: number; r: number; warmup?: boolean }>,
  unit = 'kg'
): WeightEntry {
  return { exercise: 'Test', type: 'pesas', sets, unit };
}

// ── escapeHtml ──

describe('escapeHtml', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('escapes all HTML special characters', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#039;');
  });
});

// ── calc1RM ──

describe('calc1RM', () => {
  it('returns weight when reps = 1', () => {
    expect(calc1RM(100, 1)).toBe(100);
  });

  it('uses Epley formula for reps > 1', () => {
    // 100 * (1 + 5/30) = 116.666... -> rounded to 116.7
    expect(calc1RM(100, 5)).toBe(116.7);
  });

  it('returns 0 when weight is 0', () => {
    expect(calc1RM(0, 5)).toBe(0);
  });
});

// ── entryMaxWeight ──

describe('entryMaxWeight', () => {
  it('returns null for null entry', () => {
    expect(entryMaxWeight(null)).toBeNull();
  });

  it('filters warmup sets and returns max working weight', () => {
    const e = makeWeightEntry([
      { w: 40, r: 10, warmup: true },
      { w: 80, r: 8 },
      { w: 100, r: 5 }
    ]);
    expect(entryMaxWeight(e)).toBe(100);
  });

  it('returns null when all sets are warmup', () => {
    const e = makeWeightEntry([{ w: 40, r: 10, warmup: true }]);
    expect(entryMaxWeight(e)).toBeNull();
  });
});

// ── entryVolume ──

describe('entryVolume', () => {
  it('returns 0 for null entry', () => {
    expect(entryVolume(null)).toBe(0);
  });

  it('sums weight*reps for working sets only', () => {
    const e = makeWeightEntry([
      { w: 20, r: 10, warmup: true },
      { w: 60, r: 8 },
      { w: 80, r: 5 }
    ]);
    // 60*8 + 80*5 = 480 + 400 = 880
    expect(entryVolume(e)).toBe(880);
  });
});

// ── entrySetCount ──

describe('entrySetCount', () => {
  it('returns all zeros for null entry', () => {
    expect(entrySetCount(null)).toEqual({ working: 0, warmup: 0, total: 0 });
  });

  it('counts warmup vs working sets', () => {
    const e = makeWeightEntry([
      { w: 20, r: 10, warmup: true },
      { w: 60, r: 8 },
      { w: 80, r: 5 }
    ]);
    expect(entrySetCount(e)).toEqual({ working: 2, warmup: 1, total: 3 });
  });
});

// ── linearRegression ──

describe('linearRegression', () => {
  it('returns 0 slope and 0 intercept for empty array', () => {
    const r = linearRegression([]);
    expect(r.slope).toBe(0);
    expect(r.intercept).toBe(0);
  });

  it('returns slope 0 for flat data', () => {
    const r = linearRegression([5, 5, 5, 5]);
    expect(r.slope).toBeCloseTo(0);
  });

  it('returns positive slope for ascending data', () => {
    const r = linearRegression([1, 2, 3, 4]);
    expect(r.slope).toBeCloseTo(1);
  });
});

// ── detectPlateau ──

describe('detectPlateau', () => {
  it('returns false for array shorter than window', () => {
    expect(detectPlateau([100, 100], 4)).toEqual({ isPlateaued: false, sessionsStuck: 0 });
  });

  it('returns true for flat data within tolerance', () => {
    const result = detectPlateau([100, 100, 100, 100]);
    expect(result.isPlateaued).toBe(true);
  });

  it('returns false for clearly ascending data', () => {
    const result = detectPlateau([80, 85, 90, 95]);
    expect(result.isPlateaued).toBe(false);
  });
});

// ── estimateCalories ──

describe('estimateCalories', () => {
  it('calculates for known exercise and intensity', () => {
    // correr, media: MET=8.5, 70kg, 30min -> round(8.5*70*3.5/200*30) = round(312.375) = 312
    expect(estimateCalories('correr', 'media', 30, 70)).toBe(312);
  });

  it('uses fallback METs for unknown exercise', () => {
    // unknown -> media fallback MET=6, 70kg, 30min -> round(6*70*3.5/200*30) = round(220.5) = 221
    expect(estimateCalories('Zumba', 'media', 30, 70)).toBe(221);
  });

  it('returns 0 for zero minutes', () => {
    expect(estimateCalories('correr', 'alta', 0, 70)).toBe(0);
  });
});
