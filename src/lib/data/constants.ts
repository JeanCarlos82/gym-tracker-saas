import type {
  Routine,
  ObjectivePrescription,
  ImcCategory,
  DayRoutine,
  Objective
} from './types.js';

/** Spanish day names (lowercase, no accents), indexed by JS getDay() */
export const DK: string[] = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado'
];

/** Display labels for day names (with accents where needed) */
export const DL: Record<string, string> = {
  domingo: 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado'
};

/** Short month names in Spanish */
export const MO: string[] = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

/** Rep and set prescriptions per training objective */
export const OBJS: Record<Objective, ObjectivePrescription> = {
  fuerza: { reps: '1–5 reps', series: '4–6 series' },
  hipertrofia: { reps: '6–12 reps', series: '3–4 series' },
  resistencia: { reps: '13–20 reps', series: '2–3 series' }
};

/** IMC classification brackets */
export const IMC_C: ImcCategory[] = [
  { max: 18.5, label: 'Bajo peso', color: '#3ab4ff' },
  { max: 25, label: 'Peso normal', color: '#3aff8a' },
  { max: 30, label: 'Sobrepeso', color: '#ffaa3a' },
  { max: 35, label: 'Obesidad I', color: '#ff4d4d' },
  { max: 999, label: 'Obesidad II+', color: '#ff4d4d' }
];

/** Default rest-day routine for a single day */
function defaultDay(): DayRoutine {
  return { label: '', rest: true, exercises: [] };
}

/** Default weekly routine (all rest days) */
export const DR: Routine = {
  lunes: defaultDay(),
  martes: defaultDay(),
  miercoles: defaultDay(),
  jueves: defaultDay(),
  viernes: defaultDay(),
  sabado: defaultDay(),
  domingo: defaultDay()
};
