// ── Exercise database and lookup functions ──

/** Zone identifiers */
export type Zone = 'superior' | 'inferior' | 'core' | 'cardio';

/** Muscle group names used in the database */
export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Hombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Cuádriceps'
  | 'Isquiotibiales'
  | 'Glúteos'
  | 'Pantorrillas'
  | 'Core'
  | 'Cardio';

/** Exercise type */
export type ExerciseType = 'pesas' | 'cardio';

/** An exercise definition in the database */
export interface Exercise {
  name: string;
  type: ExerciseType;
  zone: Zone;
  muscleGroup: MuscleGroup[];
}

/** Display labels for each zone */
export const ZONES: Record<Zone, string> = {
  superior: 'TREN SUPERIOR',
  inferior: 'TREN INFERIOR',
  core: 'CORE',
  cardio: 'CARDIO'
};

/** Muscles belonging to each zone */
export const ZONE_MUSCLES: Record<Zone, MuscleGroup[]> = {
  superior: ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps'],
  inferior: ['Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas'],
  core: ['Core'],
  cardio: ['Cardio']
};

/** The full exercise database */
export const EXERCISE_DB: Exercise[] = [
  // ── PECHO ──
  { name: 'Press banca', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho', 'Tríceps'] },
  { name: 'Press inclinado', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho', 'Hombros'] },
  { name: 'Press declinado', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho', 'Tríceps'] },
  { name: 'Press con mancuernas', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho', 'Tríceps'] },
  { name: 'Aperturas mancuernas', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho'] },
  { name: 'Aperturas en polea', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho'] },
  { name: 'Fondos en paralelas', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho', 'Tríceps'] },
  { name: 'Pullover', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho', 'Espalda'] },
  { name: 'Press en máquina', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho'] },
  { name: 'Press inclinado en máquina', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho', 'Hombros'] },
  { name: 'Contractor de pecho', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho'] },
  { name: 'Flexiones', type: 'pesas', zone: 'superior', muscleGroup: ['Pecho', 'Tríceps'] },

  // ── ESPALDA ──
  { name: 'Jalón al pecho', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda', 'Bíceps'] },
  { name: 'Jalón tras nuca', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda'] },
  { name: 'Jalón agarre cerrado', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda', 'Bíceps'] },
  { name: 'Remo con barra', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda', 'Bíceps'] },
  { name: 'Remo con mancuerna', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda'] },
  { name: 'Remo en polea baja', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda', 'Bíceps'] },
  { name: 'Dominadas', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda', 'Bíceps'] },
  { name: 'Remo en máquina', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda'] },
  { name: 'Face pull', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda', 'Hombros'] },
  { name: 'Pulldown en máquina', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda', 'Bíceps'] },
  { name: 'Remo T-bar', type: 'pesas', zone: 'superior', muscleGroup: ['Espalda'] },

  // ── HOMBROS ──
  { name: 'Press militar', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros', 'Tríceps'] },
  { name: 'Press Arnold', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros'] },
  { name: 'Elevaciones laterales', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros'] },
  { name: 'Elevaciones frontales', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros'] },
  { name: 'Pájaros', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros', 'Espalda'] },
  { name: 'Encogimientos', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros'] },
  { name: 'Press con mancuernas hombro', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros'] },
  { name: 'Elevaciones laterales en polea', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros'] },
  { name: 'Press de hombro en máquina', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros', 'Tríceps'] },
  { name: 'Elevaciones laterales en máquina', type: 'pesas', zone: 'superior', muscleGroup: ['Hombros'] },

  // ── BICEPS ──
  { name: 'Curl con barra', type: 'pesas', zone: 'superior', muscleGroup: ['Bíceps'] },
  { name: 'Curl con mancuernas', type: 'pesas', zone: 'superior', muscleGroup: ['Bíceps'] },
  { name: 'Curl martillo', type: 'pesas', zone: 'superior', muscleGroup: ['Bíceps'] },
  { name: 'Curl concentrado', type: 'pesas', zone: 'superior', muscleGroup: ['Bíceps'] },
  { name: 'Curl en polea', type: 'pesas', zone: 'superior', muscleGroup: ['Bíceps'] },
  { name: 'Curl predicador', type: 'pesas', zone: 'superior', muscleGroup: ['Bíceps'] },
  { name: 'Curl con barra Z', type: 'pesas', zone: 'superior', muscleGroup: ['Bíceps'] },
  { name: 'Curl en máquina', type: 'pesas', zone: 'superior', muscleGroup: ['Bíceps'] },

  // ── TRICEPS ──
  { name: 'Press francés', type: 'pesas', zone: 'superior', muscleGroup: ['Tríceps'] },
  { name: 'Tríceps en polea', type: 'pesas', zone: 'superior', muscleGroup: ['Tríceps'] },
  { name: 'Extensiones de tríceps', type: 'pesas', zone: 'superior', muscleGroup: ['Tríceps'] },
  { name: 'Patada de tríceps', type: 'pesas', zone: 'superior', muscleGroup: ['Tríceps'] },
  { name: 'Fondos en banco', type: 'pesas', zone: 'superior', muscleGroup: ['Tríceps', 'Pecho'] },
  { name: 'Press cerrado', type: 'pesas', zone: 'superior', muscleGroup: ['Tríceps', 'Pecho'] },
  { name: 'Tríceps con cuerda', type: 'pesas', zone: 'superior', muscleGroup: ['Tríceps'] },
  { name: 'Tríceps en máquina', type: 'pesas', zone: 'superior', muscleGroup: ['Tríceps'] },

  // ── CUADRICEPS ──
  { name: 'Sentadilla', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },
  { name: 'Sentadilla goblet', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },
  { name: 'Sentadilla frontal', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps'] },
  { name: 'Sentadilla búlgara', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },
  { name: 'Sentadilla en máquina Smith', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },
  { name: 'Sentadilla en multipower', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },
  { name: 'Prensa de pierna', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },
  { name: 'Prensa de pierna 45°', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },
  { name: 'Extensiones cuádriceps', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps'] },
  { name: 'Zancadas', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },
  { name: 'Hack squat', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps'] },
  { name: 'Sissy squat', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps'] },
  { name: 'Step up', type: 'pesas', zone: 'inferior', muscleGroup: ['Cuádriceps', 'Glúteos'] },

  // ── ISQUIOTIBIALES ──
  { name: 'Curl femoral', type: 'pesas', zone: 'inferior', muscleGroup: ['Isquiotibiales'] },
  { name: 'Curl femoral sentado', type: 'pesas', zone: 'inferior', muscleGroup: ['Isquiotibiales'] },
  { name: 'Peso muerto rumano', type: 'pesas', zone: 'inferior', muscleGroup: ['Isquiotibiales', 'Glúteos', 'Espalda'] },
  { name: 'Peso muerto', type: 'pesas', zone: 'inferior', muscleGroup: ['Isquiotibiales', 'Espalda', 'Glúteos'] },
  { name: 'Peso muerto sumo', type: 'pesas', zone: 'inferior', muscleGroup: ['Isquiotibiales', 'Glúteos'] },
  { name: 'Buenos días', type: 'pesas', zone: 'inferior', muscleGroup: ['Isquiotibiales', 'Espalda'] },

  // ── GLUTEOS ──
  { name: 'Hip thrust', type: 'pesas', zone: 'inferior', muscleGroup: ['Glúteos'] },
  { name: 'Hip thrust en máquina', type: 'pesas', zone: 'inferior', muscleGroup: ['Glúteos'] },
  { name: 'Patada de glúteo', type: 'pesas', zone: 'inferior', muscleGroup: ['Glúteos'] },
  { name: 'Patada de glúteo en máquina', type: 'pesas', zone: 'inferior', muscleGroup: ['Glúteos'] },
  { name: 'Puente de glúteo', type: 'pesas', zone: 'inferior', muscleGroup: ['Glúteos'] },
  { name: 'Aductores en máquina', type: 'pesas', zone: 'inferior', muscleGroup: ['Glúteos'] },
  { name: 'Abductores en máquina', type: 'pesas', zone: 'inferior', muscleGroup: ['Glúteos'] },

  // ── PANTORRILLAS ──
  { name: 'Pantorrillas', type: 'pesas', zone: 'inferior', muscleGroup: ['Pantorrillas'] },
  { name: 'Pantorrillas sentado', type: 'pesas', zone: 'inferior', muscleGroup: ['Pantorrillas'] },
  { name: 'Pantorrillas en prensa', type: 'pesas', zone: 'inferior', muscleGroup: ['Pantorrillas'] },

  // ── CORE ──
  { name: 'Crunch', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Plancha', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Plancha lateral', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Elevación de piernas', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Elevación de piernas en banco', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Russian twist', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Ab wheel', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Crunch en polea', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Crunch en máquina', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Mountain climbers', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Dead bug', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },
  { name: 'Leñador en polea', type: 'pesas', zone: 'core', muscleGroup: ['Core'] },

  // ── CARDIO ──
  { name: 'Correr', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Bicicleta estática', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Elíptica', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Remo ergómetro', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Saltar cuerda', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Caminadora', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Stairmaster', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Bicicleta de asalto', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Natación', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'Caminar', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] },
  { name: 'HIIT', type: 'cardio', zone: 'cardio', muscleGroup: ['Cardio'] }
];

/**
 * Search exercises by name or muscle group.
 * Returns all exercises if query is empty.
 */
export function searchExercises(query: string | null | undefined): Exercise[] {
  if (!query || !query.trim()) return EXERCISE_DB;
  const q = query.toLowerCase().trim();
  return EXERCISE_DB.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.muscleGroup.some((m) => m.toLowerCase().includes(q))
  );
}

/**
 * Find an exercise by exact name.
 * @returns the Exercise object, or null if not found
 */
export function getExerciseInfo(name: string): Exercise | null {
  return EXERCISE_DB.find((e) => e.name === name) || null;
}

/**
 * Get the primary muscle group for an exercise by name.
 * @returns the first muscle group, or 'Otro' if not found
 */
export function getExerciseMuscleGroup(name: string): string {
  const found = EXERCISE_DB.find((e) => e.name === name);
  return found?.muscleGroup[0] || 'Otro';
}

/**
 * Get all exercises that target a specific muscle group.
 */
export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return EXERCISE_DB.filter((e) => e.muscleGroup.includes(muscle));
}

/**
 * Get all exercises in a specific training zone.
 */
export function getExercisesByZone(zone: Zone): Exercise[] {
  return EXERCISE_DB.filter((e) => e.zone === zone);
}
