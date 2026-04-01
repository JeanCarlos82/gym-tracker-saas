// ── Core Types ──
// Re-export exercise-related types from their canonical source
export type { ExerciseType, Zone, MuscleGroup, Exercise } from '$lib/data/exercises';

import type { ExerciseType } from '$lib/data/exercises';

export interface ExerciseEntry {
  name: string;
  type: ExerciseType;
}

export type DayKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface RoutineDay {
  label: string;
  rest: boolean;
  exercises: ExerciseEntry[];
}

export type Routine = Record<DayKey, RoutineDay>;

export interface Template {
  exercises: ExerciseEntry[][];
  labels: string[];
}

export type TemplateKey = 'fullbody_3' | 'fullbody_cardio_3' | 'upperlower_4' | 'pplul_5' | 'ppl_6';

export type TemplateCollection = Record<TemplateKey, Template>;

export type Sex = 'H' | 'M';

export type Experience = 'principiante' | 'intermedio' | 'avanzado';

export type Goal = 'musculo' | 'fuerza' | 'grasa' | 'general';

export type Objective = 'hipertrofia' | 'fuerza' | 'resistencia';

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;
