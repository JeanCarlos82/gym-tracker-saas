import { describe, it, expect } from 'vitest';
import {
  goalToObjective,
  getDaysWarning,
  getSuggestedDays,
  selectTemplate,
  buildRoutineFromWizard
} from './routine-builder';
import type { DayKey, Experience, Goal, Sex } from '$lib/types';

// ── goalToObjective ──

describe('goalToObjective', () => {
  it('maps grasa to resistencia', () => {
    expect(goalToObjective('grasa')).toBe('resistencia');
  });

  it('maps fuerza to fuerza', () => {
    expect(goalToObjective('fuerza')).toBe('fuerza');
  });

  it('maps musculo to hipertrofia', () => {
    expect(goalToObjective('musculo')).toBe('hipertrofia');
  });

  it('maps general to hipertrofia', () => {
    expect(goalToObjective('general')).toBe('hipertrofia');
  });
});

// ── getDaysWarning ──

describe('getDaysWarning', () => {
  it('returns warning for principiante with 5 days', () => {
    const result = getDaysWarning('principiante', 5);
    expect(result).toBeTypeOf('string');
    expect(result).toContain('principiantes');
  });

  it('returns null for principiante with 4 days', () => {
    expect(getDaysWarning('principiante', 4)).toBeNull();
  });

  it('returns warning for intermedio with 6 days', () => {
    const result = getDaysWarning('intermedio', 6);
    expect(result).toBeTypeOf('string');
    expect(result).toContain('tu nivel');
  });

  it('returns null for intermedio with 5 days', () => {
    expect(getDaysWarning('intermedio', 5)).toBeNull();
  });

  it('returns null for avanzado with any number of days', () => {
    expect(getDaysWarning('avanzado', 3)).toBeNull();
    expect(getDaysWarning('avanzado', 5)).toBeNull();
    expect(getDaysWarning('avanzado', 6)).toBeNull();
    expect(getDaysWarning('avanzado', 7)).toBeNull();
  });
});

// ── getSuggestedDays ──

describe('getSuggestedDays', () => {
  it('principiante + sedentary (0) returns 3', () => {
    expect(getSuggestedDays(0, 'principiante')).toBe(3);
  });

  it('principiante + moderate (2) returns 3', () => {
    expect(getSuggestedDays(2, 'principiante')).toBe(3);
  });

  it('principiante + active (4) returns 4', () => {
    expect(getSuggestedDays(4, 'principiante')).toBe(4);
  });

  it('intermedio + sedentary (0) returns 3', () => {
    expect(getSuggestedDays(0, 'intermedio')).toBe(3);
  });

  it('intermedio + moderate (2) returns 4', () => {
    expect(getSuggestedDays(2, 'intermedio')).toBe(4);
  });

  it('intermedio + active (3) returns 5', () => {
    expect(getSuggestedDays(3, 'intermedio')).toBe(5);
  });

  it('avanzado + sedentary (0) returns 4', () => {
    expect(getSuggestedDays(0, 'avanzado')).toBe(4);
  });

  it('avanzado + active (4) returns 6', () => {
    expect(getSuggestedDays(4, 'avanzado')).toBe(6);
  });

  it('avanzado + moderate (3) returns 5', () => {
    expect(getSuggestedDays(3, 'avanzado')).toBe(5);
  });
});

// ── selectTemplate ──

describe('selectTemplate', () => {
  it('principiante, 3 days, musculo, H returns fullbody_3', () => {
    const result = selectTemplate('principiante', 3, 'musculo', 'H');
    expect(result.key).toBe('fullbody_3');
  });

  it('any level, 3 days, grasa returns fullbody_cardio_3', () => {
    const result = selectTemplate('principiante', 3, 'grasa', 'H');
    expect(result.key).toBe('fullbody_cardio_3');
  });

  it('intermedio, 4 days returns upperlower_4', () => {
    const result = selectTemplate('intermedio', 4, 'musculo', 'H');
    expect(result.key).toBe('upperlower_4');
  });

  it('intermedio, 5 days returns pplul_5', () => {
    const result = selectTemplate('intermedio', 5, 'musculo', 'H');
    expect(result.key).toBe('pplul_5');
  });

  it('avanzado, 6 days, fuerza, H returns ppl_6', () => {
    const result = selectTemplate('avanzado', 6, 'fuerza', 'H');
    expect(result.key).toBe('ppl_6');
  });

  it('sex M uses female templates (TEMPLATES_F)', () => {
    const male = selectTemplate('principiante', 3, 'musculo', 'H');
    const female = selectTemplate('principiante', 3, 'musculo', 'M');
    // They should return the same key but different template collections
    expect(female.key).toBe(male.key);
    expect(female.templates).not.toBe(male.templates);
  });

  it('grasa with 4 days does not use cardio template', () => {
    const result = selectTemplate('intermedio', 4, 'grasa', 'H');
    expect(result.key).toBe('upperlower_4');
  });
});

// ── buildRoutineFromWizard ──

describe('buildRoutineFromWizard', () => {
  const ALL_DAY_KEYS: DayKey[] = [
    'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
  ];

  it('returns all 7 day keys', () => {
    const selectedDays: DayKey[] = ['lunes', 'miercoles', 'viernes'];
    const routine = buildRoutineFromWizard('fullbody_3', selectedDays);

    for (const dk of ALL_DAY_KEYS) {
      expect(routine[dk]).toBeDefined();
    }
  });

  it('non-selected days are rest', () => {
    const selectedDays: DayKey[] = ['lunes', 'miercoles', 'viernes'];
    const routine = buildRoutineFromWizard('fullbody_3', selectedDays);

    const restDays: DayKey[] = ['martes', 'jueves', 'sabado', 'domingo'];
    for (const dk of restDays) {
      expect(routine[dk].rest).toBe(true);
      expect(routine[dk].label).toBe('Descanso');
      expect(routine[dk].exercises).toEqual([]);
    }
  });

  it('selected days have exercises and are not rest', () => {
    const selectedDays: DayKey[] = ['lunes', 'miercoles', 'viernes'];
    const routine = buildRoutineFromWizard('fullbody_3', selectedDays);

    for (const dk of selectedDays) {
      expect(routine[dk].rest).toBe(false);
      expect(routine[dk].exercises.length).toBeGreaterThan(0);
      expect(routine[dk].label).not.toBe('Descanso');
    }
  });

  it('assigns template exercises in order to selected days', () => {
    const selectedDays: DayKey[] = ['lunes', 'miercoles', 'viernes'];
    const routine = buildRoutineFromWizard('fullbody_3', selectedDays);

    // First selected day should get the first template exercise group
    expect(routine['lunes'].label).toBe('Full Body A');
    expect(routine['miercoles'].label).toBe('Full Body B');
    expect(routine['viernes'].label).toBe('Full Body C');
  });

  it('extra selected days beyond template exercises become rest', () => {
    // fullbody_3 has 3 exercise groups, selecting 5 days means last 2 are rest
    const selectedDays: DayKey[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const routine = buildRoutineFromWizard('fullbody_3', selectedDays);

    // First 3 selected days get exercises
    expect(routine['lunes'].rest).toBe(false);
    expect(routine['martes'].rest).toBe(false);
    expect(routine['miercoles'].rest).toBe(false);
    // Remaining selected days become rest since template has only 3 groups
    expect(routine['jueves'].rest).toBe(true);
    expect(routine['viernes'].rest).toBe(true);
  });
});
