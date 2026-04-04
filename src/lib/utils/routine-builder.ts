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
import { getExerciseById } from '$lib/data/exercises';

/** Helper: build an ExerciseEntry from an exercise ID */
function exEntry(id: string, type: 'pesas' | 'cardio' = 'pesas'): ExerciseEntry {
  const info = getExerciseById(id);
  return { id, name: info?.name ?? id, type: info?.exerciseType ?? type };
}

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
  // Swaps use exercise IDs (not display names)
  const swaps: [string, string][] = [];

  // === Adaptations by physical profile (apply to all levels) ===

  // Sentadilla: older/very heavy -> prensa always (independent of experience)
  if (isOlder || isVeryHeavy) swaps.push(['sentadilla_barra', 'prensa_pierna']);
  else if (isHeavy) swaps.push(['sentadilla_barra', 'sentadilla_smith']);
  else if (isTall && !isAdvanced) swaps.push(['sentadilla_barra', 'sentadilla_multipower']);

  // Peso muerto: senior -> puente, older -> rumano safer
  if (isSenior) swaps.push(['peso_muerto_rumano', 'puente_gluteo']);
  else if (isVeryHeavy) swaps.push(['peso_muerto_rumano', 'puente_gluteo']);
  if (isIntermediate && isSenior) swaps.push(['peso_muerto', 'peso_muerto_rumano']);

  // Cardio: overweight/older -> low impact
  if (isHeavy || isOlder) swaps.push(['correr', 'eliptica']);
  if (isVeryHeavy) swaps.push(['stairmaster', 'bicicleta_estatica']);

  // Fondos: older/heavy -> polea (joints)
  if (isOlder || isHeavy) swaps.push(['fondos_paralelas', 'triceps_polea']);

  // === BEGINNER: guided machines and simpler versions ===
  if (isBeginner) {
    swaps.push(['sentadilla_frontal', 'sentadilla_goblet']);
    swaps.push(['hack_squat', 'prensa_pierna']);

    // Chest: machine press is safer than barbell (no spotter needed)
    swaps.push(['press_banca_barra', 'press_banca_maquina']);
    swaps.push(['press_inclinado_barra', 'press_inclinado_maquina']);
    swaps.push(['press_declinado_barra', 'press_banca_maquina']);
    swaps.push(['aperturas_mancuernas', 'contractor_pecho']);
    swaps.push(['fondos_paralelas', 'flexiones']);

    // Back: guided machines avoid lower back posture errors
    swaps.push(['remo_barra', 'remo_maquina']);
    swaps.push(['remo_mancuerna', 'remo_maquina']);
    swaps.push(['dominadas', 'pulldown_maquina']);
    swaps.push(['remo_tbar', 'remo_maquina']);

    // Shoulders: machine press protects shoulder joint
    swaps.push(['press_militar_barra', 'press_hombro_maquina']);
    swaps.push(['press_arnold', 'press_hombro_maquina']);
    swaps.push(['elevaciones_laterales_mancuernas', 'elevaciones_laterales_maquina']);

    // Arms: pulley/machine more controllable for beginners
    swaps.push(['curl_barra', 'curl_maquina']);
    swaps.push(['curl_barra_z', 'curl_maquina']);
    swaps.push(['press_frances', 'triceps_maquina']);
    swaps.push(['fondos_banco', 'triceps_maquina']);

    // Legs: guided machines for complex movements
    swaps.push(['peso_muerto_sumo', 'hip_thrust_maquina']);
    swaps.push(['sentadilla_bulgara', 'prensa_pierna']);
    swaps.push(['curl_femoral', 'curl_femoral_sentado']);
    swaps.push(['patada_gluteo', 'patada_gluteo_maquina']);
    swaps.push(['hip_thrust_barra', 'hip_thrust_maquina']);

    // Core: crunch machine has guided resistance
    swaps.push(['crunch_polea', 'crunch_maquina']);

    // Sedentary beginner -> even more basic
    if (isSedentary) {
      swaps.push(['sentadilla_barra', 'sentadilla_smith']);
      swaps.push(['sentadilla_goblet', 'sentadilla_smith']);
      swaps.push(['zancadas', 'prensa_pierna']);
    }
  }

  // === INTERMEDIATE: transition to free weights but keep machines for some ===
  if (isIntermediate) {
    swaps.push(['dominadas', 'jalon_pecho']); // Pull-ups require advanced strength
    swaps.push(['hack_squat', 'prensa_pierna']);
    if (isOlder) {
      swaps.push(['press_militar_barra', 'press_hombro_maquina']);
      swaps.push(['fondos_paralelas', 'triceps_polea']);
    }
  }

  // Apply substitutions (swap map keyed by exercise ID)
  const swapMap = new Map<string, string>(swaps.map(([from, to]) => [from, to]));
  const adapted = {} as Routine;
  for (const dk of Object.keys(routine) as DayKey[]) {
    adapted[dk] = { ...routine[dk] };
    if (adapted[dk].exercises) {
      adapted[dk].exercises = adapted[dk].exercises.map((ex) => {
        const replacementId = swapMap.get(ex.id);
        return replacementId ? exEntry(replacementId, ex.type) : ex;
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
        ['press_banca_barra', 'press_inclinado_barra', 'press_banca_mancuernas', 'jalon_pecho', 'remo_barra'].includes(e.id)
      );
      const hasLower = d.exercises.some((e) =>
        ['sentadilla_barra', 'hip_thrust_barra', 'peso_muerto_rumano', 'prensa_pierna'].includes(e.id)
      );
      if (hasUpper && !d.exercises.some((e) => e.id === 'face_pull')) {
        d.exercises.push(exEntry('face_pull'));
      } else if (hasLower && !d.exercises.some((e) => e.id === 'pantorrillas_pie')) {
        d.exercises.push(exEntry('pantorrillas_pie'));
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
  function bestCardioId(): string {
    // Physical restrictions first (safety)
    if (isVeryHeavy) return 'bicicleta_estatica'; // zero joint impact
    if (isSedentary && isBeginner) return 'caminadora'; // start gentle
    if (isHeavy) return 'eliptica'; // low impact
    if (isSenior) return 'eliptica'; // joints

    // By goal
    if (goal === 'grasa') {
      if (isFem) return 'stairmaster'; // glutes + burn
      if (isAdvanced) return 'hiit'; // max burn in short time
      return 'correr'; // high calorie burn
    }
    if (goal === 'fuerza') {
      return 'caminar'; // minimal interference with strength
    }
    if (goal === 'musculo') {
      if (isFem) return 'stairmaster'; // activates glutes without catabolism
      return 'eliptica'; // low impact, active recovery
    }
    // General
    if (isFem) return 'stairmaster';
    if (isOlder) return 'eliptica';
    return 'eliptica';
  }

  const optCardioId = bestCardioId();
  const optCardioEntry = exEntry(optCardioId, 'cardio');

  if (goal === 'grasa') {
    // Fat loss: cardio at the end of every weight day (high frequency)
    for (const dk of Object.keys(adapted) as DayKey[]) {
      const d = adapted[dk];
      if (d.rest || !d.exercises) continue;
      const hasCardio = d.exercises.some((e) => e.type === 'cardio');
      if (!hasCardio) {
        d.exercises[d.exercises.length - 1] = { ...optCardioEntry };
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
            ex.id === 'aperturas_mancuernas' ||
            ex.id === 'aperturas_polea' ||
            ex.id === 'contractor_pecho'
          )
            return exEntry('press_cerrado');
          if (ex.id === 'curl_predicador' || ex.id === 'curl_maquina')
            return exEntry('curl_barra');
          if (ex.id === 'patada_triceps' || ex.id === 'triceps_maquina')
            return exEntry('press_frances');
          if (ex.id === 'elevaciones_frontales') return exEntry('press_militar_barra');
          if (isAdvanced && isFem && ex.id === 'patada_gluteo')
            return exEntry('peso_muerto_sumo');
          if (isAdvanced && isFem && ex.id === 'patada_gluteo_maquina')
            return exEntry('peso_muerto_sumo');
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
        d.exercises.push({ ...optCardioEntry });
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
          ['press_banca_barra', 'press_inclinado_barra', 'press_banca_mancuernas', 'press_banca_maquina', 'press_inclinado_maquina'].includes(e.id)
        );
        const hasBack = d.exercises.some((e) =>
          ['jalon_pecho', 'remo_barra', 'remo_mancuerna', 'remo_maquina', 'pulldown_maquina'].includes(e.id)
        );
        if (
          hasChest &&
          d.exercises.length < 7 &&
          !d.exercises.some((e) => ['aperturas_polea', 'contractor_pecho'].includes(e.id))
        ) {
          d.exercises.push(exEntry('contractor_pecho'));
        } else if (hasBack && d.exercises.length < 7 && !d.exercises.some((e) => e.id === 'face_pull')) {
          d.exercises.push(exEntry('face_pull'));
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
        lastDay.exercises[lastDay.exercises.length - 1] = { ...optCardioEntry };
        lastDay.label = lastDay.label + ' + Cardio ligero';
      }
    }
  }

  if (goal === 'general') {
    // General: core + cardio on 1-2 days for cardiovascular health
    const coreIds = ['plancha', 'crunch', 'elevacion_piernas'];
    let ci = 0;
    let cardioAdded = 0;
    const maxCardio = 2;

    for (const dk of Object.keys(adapted) as DayKey[]) {
      const d = adapted[dk];
      if (d.rest || !d.exercises) continue;
      const hasCore = d.exercises.some(
        (e) => coreIds.includes(e.id) || e.id === 'russian_twist'
      );
      if (!hasCore && d.exercises.length <= 6) {
        d.exercises.push(exEntry(coreIds[ci % coreIds.length]));
        ci++;
      }
      const hasCardio = d.exercises.some((e) => e.type === 'cardio');
      if (!hasCardio && cardioAdded < maxCardio) {
        d.exercises[d.exercises.length - 1] = { ...optCardioEntry };
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
      if (seen.has(ex.id)) return false;
      seen.add(ex.id);
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
