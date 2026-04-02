import type {
  DayKey,
  Experience,
  ExerciseEntry,
  Goal,
  Objective,
  Routine,
  RoutineDay,
  Sex,
  TemplateCollection,
  TemplateKey
} from '$lib/types';
import { TEMPLATES_M, TEMPLATES_F } from '$lib/data/templates';

// ── Interfaces ──

export interface AdaptExercisesOptions {
  age: number | string;
  weight: number | string;
  height: number | string;
  experience: Experience;
  sex: Sex;
  goal: Goal;
  activityLevel?: number;
}

export interface TemplateSelection {
  key: TemplateKey;
  templates: TemplateCollection;
}

// ── Constants ──

const ALL_DAY_KEYS: DayKey[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo'
];

// ── Functions ──

/**
 * Select the appropriate template based on user profile.
 * Note: sex === 'M' means female (Mujer) in the original Spanish code.
 */
export function selectTemplate(
  experience: Experience,
  numDays: number,
  goal: Goal,
  sex: Sex
): TemplateSelection {
  const templates = sex === 'M' ? TEMPLATES_F : TEMPLATES_M;
  if (goal === 'grasa' && numDays <= 3) return { key: 'fullbody_cardio_3', templates };
  if (numDays <= 3) return { key: 'fullbody_3', templates };
  if (numDays === 4) return { key: 'upperlower_4', templates };
  if (numDays === 5) return { key: 'pplul_5', templates };
  return { key: 'ppl_6', templates };
}

/**
 * Build a weekly routine from a template, assigning exercises to selected days
 * and rest to the remaining days.
 */
export function buildRoutineFromWizard(
  templateKey: TemplateKey,
  selectedDays: DayKey[],
  templates?: TemplateCollection
): Routine {
  const tmpl = (templates ?? TEMPLATES_M)[templateKey];
  const routine = {} as Routine;
  let exIdx = 0;

  ALL_DAY_KEYS.forEach((dk) => {
    if (selectedDays.includes(dk) && exIdx < tmpl.exercises.length) {
      routine[dk] = {
        label: tmpl.labels[exIdx],
        rest: false,
        exercises: [...tmpl.exercises[exIdx]]
      };
      exIdx++;
    } else {
      routine[dk] = { label: 'Descanso', rest: true, exercises: [] };
    }
  });

  return routine;
}

/**
 * Full adaptation system with 4 phases:
 * 1. Exercise substitutions based on physical profile
 * 2. Volume adjustment by experience + activity
 * 3. Goal-based adaptations (cardio, exercise swaps)
 * 4. Duplicate removal within each day
 *
 * Based on evidence: ACSM, NSCA, biomechanics research
 */
export function adaptExercises(
  routine: Routine,
  options: AdaptExercisesOptions
): Routine {
  const a = typeof options.age === 'string' ? parseInt(options.age) || 25 : options.age || 25;
  const w = typeof options.weight === 'string' ? parseFloat(options.weight) || 70 : options.weight || 70;
  const h = typeof options.height === 'string' ? parseFloat(options.height) || 170 : options.height || 170;
  const bmi = h > 0 ? w / ((h / 100) * (h / 100)) : 22;
  const act = options.activityLevel ?? 2;
  const { experience, sex, goal } = options;

  const isBeginner = experience === 'principiante';
  const isIntermediate = experience === 'intermedio';
  const isAdvanced = experience === 'avanzado';
  const isTall = h >= 185;
  const isHeavy = bmi >= 30;
  const isVeryHeavy = bmi >= 35;
  const isOlder = a >= 45;
  const isSenior = a >= 50;
  // const isYoung = a < 20; // present in original but unused
  const isFem = sex === 'M';
  const isSedentary = act <= 1;

  // ═══════════════════════════════════════════
  // PHASE 1: Exercise substitutions by physical profile
  // ═══════════════════════════════════════════
  const swaps: [string, string][] = [];

  // === Adaptations by physical profile (apply to all levels) ===

  // Sentadilla: older/very heavy -> prensa always (independent of experience)
  if (isOlder || isVeryHeavy) swaps.push(['Sentadilla', 'Prensa de pierna']);
  else if (isHeavy) swaps.push(['Sentadilla', 'Sentadilla en máquina Smith']);
  else if (isTall && !isAdvanced) swaps.push(['Sentadilla', 'Sentadilla en multipower']);

  // Peso muerto: senior -> puente, older -> rumano safer
  if (isSenior) swaps.push(['Peso muerto rumano', 'Puente de glúteo']);
  else if (isVeryHeavy) swaps.push(['Peso muerto rumano', 'Puente de glúteo']);
  if (isIntermediate && isSenior) swaps.push(['Peso muerto', 'Peso muerto rumano']);

  // Cardio: overweight/older -> low impact
  if (isHeavy || isOlder) swaps.push(['Correr', 'Elíptica']);
  if (isVeryHeavy) swaps.push(['Stairmaster', 'Bicicleta estática']);

  // Fondos: older/heavy -> polea (joints)
  if (isOlder || isHeavy) swaps.push(['Fondos en paralelas', 'Tríceps en polea']);

  // === BEGINNER: guided machines and simpler versions ===
  if (isBeginner) {
    swaps.push(['Sentadilla frontal', 'Sentadilla goblet']);
    swaps.push(['Hack squat', 'Prensa de pierna']);

    // Chest: machine press is safer than barbell (no spotter needed)
    swaps.push(['Press banca', 'Press en máquina']);
    swaps.push(['Press inclinado', 'Press inclinado en máquina']);
    swaps.push(['Press declinado', 'Press en máquina']);
    swaps.push(['Aperturas mancuernas', 'Contractor de pecho']);
    swaps.push(['Fondos en paralelas', 'Flexiones']);

    // Back: guided machines avoid lower back posture errors
    swaps.push(['Remo con barra', 'Remo en máquina']);
    swaps.push(['Remo con mancuerna', 'Remo en máquina']);
    swaps.push(['Dominadas', 'Pulldown en máquina']);
    swaps.push(['Remo T-bar', 'Remo en máquina']);

    // Shoulders: machine press protects shoulder joint
    swaps.push(['Press militar', 'Press de hombro en máquina']);
    swaps.push(['Press Arnold', 'Press de hombro en máquina']);
    swaps.push(['Elevaciones laterales', 'Elevaciones laterales en máquina']);

    // Arms: pulley/machine more controllable for beginners
    swaps.push(['Curl con barra', 'Curl en máquina']);
    swaps.push(['Curl con barra Z', 'Curl en máquina']);
    swaps.push(['Press francés', 'Tríceps en máquina']);
    swaps.push(['Fondos en banco', 'Tríceps en máquina']);

    // Legs: guided machines for complex movements
    swaps.push(['Peso muerto sumo', 'Hip thrust en máquina']);
    swaps.push(['Sentadilla búlgara', 'Prensa de pierna']);
    swaps.push(['Curl femoral', 'Curl femoral sentado']);
    swaps.push(['Patada de glúteo', 'Patada de glúteo en máquina']);
    swaps.push(['Hip thrust', 'Hip thrust en máquina']);

    // Core: crunch machine has guided resistance
    swaps.push(['Crunch en polea', 'Crunch en máquina']);

    // Sedentary beginner -> even more basic
    if (isSedentary) {
      swaps.push(['Sentadilla', 'Sentadilla en máquina Smith']);
      swaps.push(['Sentadilla goblet', 'Sentadilla en máquina Smith']);
      swaps.push(['Zancadas', 'Prensa de pierna']);
    }
  }

  // === INTERMEDIATE: transition to free weights but keep machines for some ===
  if (isIntermediate) {
    swaps.push(['Dominadas', 'Jalón al pecho']); // Pull-ups require advanced strength
    swaps.push(['Hack squat', 'Prensa de pierna']);
    if (isOlder) {
      swaps.push(['Press militar', 'Press de hombro en máquina']);
      swaps.push(['Fondos en paralelas', 'Tríceps en polea']);
    }
  }

  // Apply substitutions
  const swapMap = new Map<string, string>(swaps.map(([from, to]) => [from, to]));
  const adapted = {} as Routine;
  for (const dk of Object.keys(routine) as DayKey[]) {
    adapted[dk] = { ...routine[dk] };
    if (adapted[dk].exercises) {
      adapted[dk].exercises = adapted[dk].exercises.map((ex) => {
        const replacement = swapMap.get(ex.name);
        return replacement ? { ...ex, name: replacement } : ex;
      });
    }
  }

  // ═══════════════════════════════════════════
  // PHASE 2: Adjust volume by experience + activity
  // ═══════════════════════════════════════════

  for (const dk of Object.keys(adapted) as DayKey[]) {
    const d = adapted[dk];
    if (d.rest || !d.exercises) continue;

    // Beginner sedentary: reduce to 4-5 exercises (less exhaustion)
    if (isBeginner && isSedentary && d.exercises.length > 5) {
      d.exercises = d.exercises.slice(0, 5);
    }
    // Beginner non-sedentary: max 5-6
    else if (isBeginner && d.exercises.length > 6) {
      d.exercises = d.exercises.slice(0, 6);
    }

    // Advanced: add extra variation exercise if fewer than 6
    if (isAdvanced && d.exercises.length < 6) {
      const hasUpper = d.exercises.some((e) =>
        ['Press banca', 'Press inclinado', 'Press con mancuernas', 'Jalón al pecho', 'Remo con barra'].includes(
          e.name
        )
      );
      const hasLower = d.exercises.some((e) =>
        ['Sentadilla', 'Hip thrust', 'Peso muerto rumano', 'Prensa de pierna'].includes(e.name)
      );
      if (hasUpper && !d.exercises.some((e) => e.name === 'Face pull')) {
        d.exercises.push({ name: 'Face pull', type: 'pesas' });
      } else if (hasLower && !d.exercises.some((e) => e.name === 'Pantorrillas')) {
        d.exercises.push({ name: 'Pantorrillas', type: 'pesas' });
      }
    }

    // Senior: limit to 5 exercises max (fatigue, recovery)
    if (isSenior && d.exercises.length > 5) {
      d.exercises = d.exercises.slice(0, 5);
    }
  }

  // ═══════════════════════════════════════════
  // PHASE 3: Adaptation by GOAL
  // ═══════════════════════════════════════════

  // Smart cardio selection based on goal + full profile
  // Each goal has an optimal cardio type for specific reasons:
  // - Fat: high calorie burn -> HIIT, running, Stairmaster
  // - Strength: minimal interference with recovery -> walking, bike
  // - Muscle: active recovery without catabolism -> elliptical, walking
  // - General: cardiovascular health -> moderate variety
  function bestCardio(): string {
    // Physical restrictions first (safety)
    if (isVeryHeavy) return 'Bicicleta estática'; // zero joint impact
    if (isSedentary && isBeginner) return 'Caminadora'; // start gentle
    if (isHeavy) return 'Elíptica'; // low impact
    if (isSenior) return 'Elíptica'; // joints

    // By goal
    if (goal === 'grasa') {
      if (isFem) return 'Stairmaster'; // glutes + burn
      if (isAdvanced) return 'HIIT'; // max burn in short time
      return 'Correr'; // high calorie burn
    }
    if (goal === 'fuerza') {
      return 'Caminar'; // minimal interference with strength
    }
    if (goal === 'musculo') {
      if (isFem) return 'Stairmaster'; // activates glutes without catabolism
      return 'Elíptica'; // low impact, active recovery
    }
    // General
    if (isFem) return 'Stairmaster';
    if (isOlder) return 'Elíptica';
    return 'Elíptica';
  }

  const optCardio = bestCardio();

  if (goal === 'grasa') {
    // Fat loss: cardio at the end of every weight day (high frequency)
    for (const dk of Object.keys(adapted) as DayKey[]) {
      const d = adapted[dk];
      if (d.rest || !d.exercises) continue;
      const hasCardio = d.exercises.some((e) => e.type === 'cardio');
      if (!hasCardio) {
        d.exercises[d.exercises.length - 1] = { name: optCardio, type: 'cardio' };
        d.label = d.label + ' + Cardio';
      }
    }
  }

  if (goal === 'fuerza') {
    // Strength: replace isolation with compounds
    // But NOT for beginners - they need a base first
    if (!isBeginner) {
      for (const dk of Object.keys(adapted) as DayKey[]) {
        const d = adapted[dk];
        if (d.rest || !d.exercises) continue;
        d.exercises = d.exercises.map((ex) => {
          if (
            ex.name === 'Aperturas mancuernas' ||
            ex.name === 'Aperturas en polea' ||
            ex.name === 'Contractor de pecho'
          )
            return { ...ex, name: 'Press cerrado' };
          if (ex.name === 'Curl predicador' || ex.name === 'Curl en máquina')
            return { ...ex, name: 'Curl con barra' };
          if (ex.name === 'Patada de tríceps' || ex.name === 'Tríceps en máquina')
            return { ...ex, name: 'Press francés' };
          if (ex.name === 'Elevaciones frontales') return { ...ex, name: 'Press militar' };
          if (isAdvanced && isFem && ex.name === 'Patada de glúteo')
            return { ...ex, name: 'Peso muerto sumo' };
          if (isAdvanced && isFem && ex.name === 'Patada de glúteo en máquina')
            return { ...ex, name: 'Peso muerto sumo' };
          return ex;
        });
      }
    }
    // Light cardio on 1 strength day (walking = minimal interference)
    let addedFCardio = false;
    for (const dk of Object.keys(adapted) as DayKey[]) {
      const d = adapted[dk];
      if (d.rest || !d.exercises || addedFCardio) continue;
      const hasCardio = d.exercises.some((e) => e.type === 'cardio');
      if (!hasCardio) {
        d.exercises.push({ name: optCardio, type: 'cardio' });
        addedFCardio = true;
      }
    }
  }

  if (goal === 'musculo') {
    // Hypertrophy: angle variety + isolation
    if (isAdvanced) {
      for (const dk of Object.keys(adapted) as DayKey[]) {
        const d = adapted[dk];
        if (d.rest || !d.exercises) continue;
        const hasChest = d.exercises.some((e) =>
          ['Press banca', 'Press inclinado', 'Press con mancuernas', 'Press en máquina', 'Press inclinado en máquina'].includes(e.name)
        );
        const hasBack = d.exercises.some((e) =>
          ['Jalón al pecho', 'Remo con barra', 'Remo con mancuerna', 'Remo en máquina', 'Pulldown en máquina'].includes(e.name)
        );
        if (
          hasChest &&
          d.exercises.length < 7 &&
          !d.exercises.some((e) => ['Aperturas en polea', 'Contractor de pecho'].includes(e.name))
        ) {
          d.exercises.push({ name: 'Contractor de pecho', type: 'pesas' });
        } else if (hasBack && d.exercises.length < 7 && !d.exercises.some((e) => e.name === 'Face pull')) {
          d.exercises.push({ name: 'Face pull', type: 'pesas' });
        }
      }
    }
    // Light cardio on 1 day (5+ days) for active recovery
    const trainDayKeys = (Object.keys(adapted) as DayKey[]).filter(
      (dk) => !adapted[dk].rest && adapted[dk].exercises?.length
    );
    if (trainDayKeys.length >= 5) {
      const lastDay = adapted[trainDayKeys[trainDayKeys.length - 1]];
      if (!lastDay.exercises.some((e) => e.type === 'cardio')) {
        lastDay.exercises[lastDay.exercises.length - 1] = { name: optCardio, type: 'cardio' };
        lastDay.label = lastDay.label + ' + Cardio ligero';
      }
    }
  }

  if (goal === 'general') {
    // General: core + cardio on 1-2 days for cardiovascular health
    const coreExs = ['Plancha', 'Crunch', 'Elevación de piernas'];
    let ci = 0;
    let cardioAdded = 0;
    const maxCardio = 2;

    for (const dk of Object.keys(adapted) as DayKey[]) {
      const d = adapted[dk];
      if (d.rest || !d.exercises) continue;
      const hasCore = d.exercises.some(
        (e) => coreExs.includes(e.name) || e.name === 'Russian twist'
      );
      if (!hasCore && d.exercises.length <= 6) {
        d.exercises.push({ name: coreExs[ci % coreExs.length], type: 'pesas' });
        ci++;
      }
      const hasCardio = d.exercises.some((e) => e.type === 'cardio');
      if (!hasCardio && cardioAdded < maxCardio) {
        d.exercises[d.exercises.length - 1] = { name: optCardio, type: 'cardio' };
        d.label = d.label + ' + Cardio';
        cardioAdded++;
      }
    }
  }

  // ═══════════════════════════════════════════
  // PHASE 4: Remove duplicates within the same day
  // ═══════════════════════════════════════════
  for (const dk of Object.keys(adapted) as DayKey[]) {
    const d = adapted[dk];
    if (!d.exercises) continue;
    const seen = new Set<string>();
    d.exercises = d.exercises.filter((ex) => {
      if (seen.has(ex.name)) return false;
      seen.add(ex.name);
      return true;
    });
  }

  return adapted;
}

/**
 * Returns a warning string if the user picks too many days for their experience level.
 */
export function getDaysWarning(experience: Experience, numDays: number): string | null {
  if (experience === 'principiante' && numDays >= 5)
    return 'La ciencia recomienda 3-4 días para principiantes. La recuperación es clave para crecer.';
  if (experience === 'intermedio' && numDays >= 6)
    return 'Para tu nivel, 4-5 días es lo óptimo. Más no siempre es mejor.';
  return null;
}

/**
 * Suggest number of training days based on activity level and experience.
 */
export function getSuggestedDays(activity: number, experience: Experience): number {
  if (experience === 'principiante') return activity <= 1 ? 3 : activity <= 3 ? 3 : 4;
  if (experience === 'intermedio') return activity <= 1 ? 3 : activity <= 2 ? 4 : 5;
  return activity <= 1 ? 4 : activity <= 2 ? 4 : activity <= 3 ? 5 : 6;
}

/**
 * Map a user-facing goal to the internal training objective.
 */
export function goalToObjective(goal: Goal): Objective {
  if (goal === 'musculo') return 'hipertrofia';
  if (goal === 'fuerza') return 'fuerza';
  if (goal === 'grasa') return 'resistencia';
  return 'hipertrofia';
}
