// ── Exercise database with rich metadata ──

/** Category (primary muscle group) */
export type Category =
  | 'Pecho' | 'Espalda' | 'Hombros' | 'Bíceps' | 'Tríceps' | 'Antebrazo'
  | 'Piernas' | 'Glúteos' | 'Gemelos'
  | 'Core' | 'Cardio' | 'HIIT' | 'Full body' | 'Movilidad';

/** Equipment used */
export type Equipment = 'Barra' | 'Mancuernas' | 'Máquina' | 'Polea' | 'Peso corporal' | 'Kettlebell' | 'Banda' | 'Barra Z' | 'Funcional';

/** Movement modality */
export type MovementType = 'Libre' | 'Máquina' | 'Polea' | 'Cuerpo' | 'Funcional';

/** Movement pattern */
export type Movement =
  | 'Empuje horizontal' | 'Empuje vertical'
  | 'Tirón horizontal' | 'Tirón vertical'
  | 'Sentadilla' | 'Bisagra' | 'Aislamiento' | 'Cardio';

/** Difficulty level */
export type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzado';

/** Exercise type (kept for backward compat with entries) */
export type ExerciseType = 'pesas' | 'cardio';

/** Input mode hint — determines which fields ExerciseModal shows per set */
export type InputMode = 'weight_reps' | 'bodyweight_reps' | 'timed' | 'bodyweight_timed';

/** Full exercise definition */
export interface Exercise {
  id: string;
  name: string;
  category: Category;
  muscle_primary: string;
  muscle_secondary: string[];
  equipment: Equipment;
  type: MovementType;
  exerciseType: ExerciseType; // 'pesas' or 'cardio' for session entries
  movement: Movement;
  difficulty: Difficulty;
  is_compound: boolean;
  unilateral: boolean;
  inputMode?: InputMode; // UI hint for set logging — defaults to 'weight_reps'
}

// ── Backward compat aliases ──
/** @deprecated Use Category */
export type MuscleGroup = Category;
/** @deprecated Use zone mapping below */
export type Zone = 'superior' | 'inferior' | 'core' | 'cardio';

// ── Category colors (visible on #0d0d0d dark bg) ──
// Distinct colors per category — optimized for contrast on dark bg
export const CATEGORY_COLORS: Record<Category, string> = {
  'Pecho':       '#f87171',  // red
  'Espalda':     '#60a5fa',  // blue
  'Hombros':     '#fbbf24',  // yellow
  'Bíceps':      '#a78bfa',  // violet
  'Tríceps':     '#fb923c',  // orange
  'Antebrazo':   '#c084fc',  // purple
  'Piernas':     '#4ade80',  // green
  'Glúteos':     '#f472b6',  // pink
  'Gemelos':     '#2dd4bf',  // teal
  'Core':        '#facc15',  // bright yellow
  'Cardio':      '#22d3ee',  // cyan
  'HIIT':        '#ef4444',  // red-500
  'Full body':   '#8b5cf6',  // violet-500
  'Movilidad':   '#a3e635',  // lime
};

/** Get color for a category */
export function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat as Category] || '#888';
}

// ── Zone compat ──
export const ZONES: Record<Zone, string> = {
  superior: 'TREN SUPERIOR', inferior: 'TREN INFERIOR', core: 'CORE', cardio: 'CARDIO'
};
export const ZONE_MUSCLES: Record<Zone, Category[]> = {
  superior: ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Antebrazo'],
  inferior: ['Piernas', 'Glúteos', 'Gemelos'],
  core: ['Core'],
  cardio: ['Cardio', 'HIIT', 'Full body', 'Movilidad'],
};
const CATEGORY_TO_ZONE: Record<Category, Zone> = {
  'Pecho': 'superior', 'Espalda': 'superior', 'Hombros': 'superior',
  'Bíceps': 'superior', 'Tríceps': 'superior', 'Antebrazo': 'superior',
  'Piernas': 'inferior', 'Glúteos': 'inferior', 'Gemelos': 'inferior',
  'Core': 'core',
  'Cardio': 'cardio', 'HIIT': 'cardio', 'Full body': 'cardio', 'Movilidad': 'cardio',
};

// ── All categories in display order ──
export const CATEGORIES: Category[] = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Antebrazo',
  'Piernas', 'Glúteos', 'Gemelos',
  'Core', 'Cardio', 'HIIT', 'Full body', 'Movilidad',
];

// ── The full exercise database ──
export const EXERCISE_DB: Exercise[] = [
  // ══════════════════════════════════════════
  // PECHO
  // ══════════════════════════════════════════
  { id: 'press_banca_barra', name: 'Press banca barra', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_banca_mancuernas', name: 'Press banca mancuernas', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_banca_maquina', name: 'Press banca maquina', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Tríceps'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'press_inclinado_barra', name: 'Press inclinado barra', category: 'Pecho', muscle_primary: 'Pecho superior', muscle_secondary: ['Deltoide anterior', 'Tríceps'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_inclinado_mancuernas', name: 'Press inclinado mancuernas', category: 'Pecho', muscle_primary: 'Pecho superior', muscle_secondary: ['Deltoide anterior', 'Tríceps'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_inclinado_maquina', name: 'Press inclinado maquina', category: 'Pecho', muscle_primary: 'Pecho superior', muscle_secondary: ['Deltoide anterior'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'press_declinado_barra', name: 'Press declinado barra', category: 'Pecho', muscle_primary: 'Pecho inferior', muscle_secondary: ['Tríceps'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'aperturas_mancuernas', name: 'Aperturas mancuernas', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Deltoide anterior'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'aperturas_inclinadas', name: 'Aperturas inclinadas', category: 'Pecho', muscle_primary: 'Pecho superior', muscle_secondary: ['Deltoide anterior'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'aperturas_maquina', name: 'Aperturas maquina', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'cruces_polea_alta', name: 'Cruces polea alta', category: 'Pecho', muscle_primary: 'Pecho inferior', muscle_secondary: ['Deltoide anterior'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'cruces_polea_media', name: 'Cruces polea media', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Deltoide anterior'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'cruces_polea_baja', name: 'Cruces polea baja', category: 'Pecho', muscle_primary: 'Pecho superior', muscle_secondary: ['Deltoide anterior'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'fondos_paralelas', name: 'Fondos paralelas', category: 'Pecho', muscle_primary: 'Pecho inferior', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'flexiones', name: 'Flexiones', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'flexiones_inclinadas', name: 'Flexiones inclinadas', category: 'Pecho', muscle_primary: 'Pecho inferior', muscle_secondary: ['Tríceps'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'flexiones_declinadas', name: 'Flexiones declinadas', category: 'Pecho', muscle_primary: 'Pecho superior', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'flexiones_diamante', name: 'Flexiones diamante', category: 'Pecho', muscle_primary: 'Triceps', muscle_secondary: ['Pecho mayor'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'press_convergente', name: 'Press convergente', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Tríceps'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'squeeze_press', name: 'Squeeze press', category: 'Pecho', muscle_primary: 'Pecho interno', muscle_secondary: ['Tríceps'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_banca_smith', name: 'Press banca Smith', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'crossover_polea', name: 'Crossover polea', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Deltoide anterior'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'press_declinado_mancuernas', name: 'Press declinado mancuernas', category: 'Pecho', muscle_primary: 'Pecho inferior', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_inclinado_smith', name: 'Press inclinado Smith', category: 'Pecho', muscle_primary: 'Pecho superior', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'aperturas_declinadas', name: 'Aperturas declinadas', category: 'Pecho', muscle_primary: 'Pecho inferior', muscle_secondary: ['Deltoide anterior'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'press_pecho_polea', name: 'Press pecho polea', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Tríceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'flexiones_explosivas', name: 'Flexiones explosivas', category: 'Pecho', muscle_primary: 'Pecho mayor', muscle_secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Avanzado', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },

  // ══════════════════════════════════════════
  // ESPALDA
  // ══════════════════════════════════════════
  { id: 'dominadas_pronadas', name: 'Dominadas pronadas', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Romboides'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'dominadas_supinas', name: 'Dominadas supinas', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'dominadas_neutras', name: 'Dominadas neutras', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Braquial'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'dominadas_asistidas', name: 'Dominadas asistidas', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'jalon_al_pecho', name: 'Jalon al pecho', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Romboides'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'jalon_agarre_estrecho', name: 'Jalon agarre estrecho', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'jalon_agarre_amplio', name: 'Jalon agarre amplio', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Romboides'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'remo_barra', name: 'Remo barra', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Romboides', 'Trapecio'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'remo_mancuerna', name: 'Remo mancuerna', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Romboides'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'remo_polea_baja', name: 'Remo polea baja', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Romboides'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'remo_maquina', name: 'Remo maquina', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'remo_t_bar', name: 'Remo T bar', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Trapecio'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'remo_pendlay', name: 'Remo pendlay', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Trapecio'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'pullover_mancuerna', name: 'Pullover mancuerna', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Pecho mayor', 'Tríceps'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'pullover_polea', name: 'Pullover polea', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'pullover_maquina', name: 'Pullover maquina', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'peso_muerto_convencional', name: 'Peso muerto convencional', category: 'Espalda', muscle_primary: 'Espalda baja', muscle_secondary: ['Glúteos', 'Isquiotibiales', 'Trapecio'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', category: 'Espalda', muscle_primary: 'Isquiotibiales', muscle_secondary: ['Glúteos', 'Espalda baja'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'peso_muerto_sumo', name: 'Peso muerto sumo', category: 'Espalda', muscle_primary: 'Gluteos', muscle_secondary: ['Aductores', 'Isquiotibiales'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'hiperextensiones', name: 'Hiperextensiones', category: 'Espalda', muscle_primary: 'Espalda baja', muscle_secondary: ['Glúteos', 'Isquiotibiales'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'face_pull', name: 'Face pull', category: 'Espalda', muscle_primary: 'Deltoide posterior', muscle_secondary: ['Romboides', 'Trapecio'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'encogimientos_hombros', name: 'Encogimientos hombros', category: 'Espalda', muscle_primary: 'Trapecio', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'remo_alto_polea', name: 'Remo alto polea', category: 'Espalda', muscle_primary: 'Trapecio', muscle_secondary: ['Romboides'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'buenos_dias', name: 'Buenos dias', category: 'Espalda', muscle_primary: 'Espalda baja', muscle_secondary: ['Isquiotibiales', 'Glúteos'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'dominadas_chin_up', name: 'Dominadas chin up', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'pulldown_recto', name: 'Pulldown brazos rectos', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Tríceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'seal_row', name: 'Seal row', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Romboides', 'Bíceps'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'meadows_row', name: 'Meadows row', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Romboides'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Avanzado', is_compound: true, unilateral: true },
  { id: 'rack_pull', name: 'Rack pull', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Trapecio', 'Erector espinal'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'remo_gironda', name: 'Remo Gironda', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Romboides'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'remo_invertido', name: 'Remo invertido', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Romboides'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'jalon_supino', name: 'Jalon supino', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'jalon_unilateral', name: 'Jalon unilateral', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'remo_helms', name: 'Remo Helms', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Romboides', 'Bíceps'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'peso_muerto_barra_trampa', name: 'Peso muerto barra trampa', category: 'Espalda', muscle_primary: 'Erector espinal', muscle_secondary: ['Cuadriceps', 'Glúteos', 'Trapecio'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'pulldown_unilateral', name: 'Pulldown unilateral', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'remo_mancuerna_unilateral', name: 'Remo mancuerna unilateral', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Romboides'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Principiante', is_compound: true, unilateral: true },
  { id: 'remo_polea_unilateral', name: 'Remo polea unilateral', category: 'Espalda', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: true },

  // ══════════════════════════════════════════
  // HOMBROS
  // ══════════════════════════════════════════
  { id: 'press_militar_barra', name: 'Press militar barra', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: ['Tríceps', 'Trapecio'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_militar_mancuernas', name: 'Press militar mancuernas', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: ['Tríceps'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_arnold', name: 'Press arnold', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: ['Deltoide medio', 'Tríceps'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'press_hombro_maquina', name: 'Press hombro maquina', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: ['Tríceps'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'elevaciones_laterales', name: 'Elevaciones laterales', category: 'Hombros', muscle_primary: 'Deltoide medio', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'elevaciones_laterales_polea', name: 'Elevaciones laterales polea', category: 'Hombros', muscle_primary: 'Deltoide medio', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'elevaciones_laterales_maquina', name: 'Elevaciones laterales maquina', category: 'Hombros', muscle_primary: 'Deltoide medio', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'elevaciones_frontales', name: 'Elevaciones frontales', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'elevaciones_frontales_polea', name: 'Elevaciones frontales polea', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'pajaros_mancuernas', name: 'Pajaros mancuernas', category: 'Hombros', muscle_primary: 'Deltoide posterior', muscle_secondary: ['Romboides'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'pajaros_polea', name: 'Pajaros polea', category: 'Hombros', muscle_primary: 'Deltoide posterior', muscle_secondary: ['Romboides'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'reverse_pec_deck', name: 'Reverse pec deck', category: 'Hombros', muscle_primary: 'Deltoide posterior', muscle_secondary: ['Romboides'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'remo_al_menton', name: 'Remo al menton', category: 'Hombros', muscle_primary: 'Deltoide medio', muscle_secondary: ['Trapecio'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'y_raise', name: 'Y raise', category: 'Hombros', muscle_primary: 'Deltoide posterior', muscle_secondary: ['Trapecio'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'handstand_push_up', name: 'Handstand push up', category: 'Hombros', muscle_primary: 'Hombros', muscle_secondary: ['Tríceps', 'Core'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'press_landmine', name: 'Press landmine', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: ['Tríceps', 'Core'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'rear_delt_fly', name: 'Rear delt fly', category: 'Hombros', muscle_primary: 'Deltoide posterior', muscle_secondary: ['Romboides'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'press_hombro_smith', name: 'Press hombro Smith', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: ['Tríceps'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'elevacion_lateral_inclinada', name: 'Elevacion lateral inclinada', category: 'Hombros', muscle_primary: 'Deltoide lateral', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: true },
  { id: 'lu_raise', name: 'Lu raise', category: 'Hombros', muscle_primary: 'Deltoide lateral', muscle_secondary: ['Deltoide anterior'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'encogimientos_mancuernas', name: 'Encogimientos mancuernas', category: 'Hombros', muscle_primary: 'Trapecio', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'encogimientos_smith', name: 'Encogimientos Smith', category: 'Hombros', muscle_primary: 'Trapecio', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'press_landmine_unilateral', name: 'Press landmine unilateral', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: ['Tríceps', 'Core'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'elevacion_frontal_barra', name: 'Elevacion frontal barra', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: [], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'press_militar_polea', name: 'Press militar polea', category: 'Hombros', muscle_primary: 'Deltoide anterior', muscle_secondary: ['Tríceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: false },

  // ══════════════════════════════════════════
  // BÍCEPS
  // ══════════════════════════════════════════
  { id: 'curl_barra', name: 'Curl barra', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: ['Braquial'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_barra_z', name: 'Curl barra Z', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: ['Braquial'], equipment: 'Barra Z', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_mancuernas', name: 'Curl mancuernas', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: ['Braquial'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'curl_alterno', name: 'Curl alterno', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: ['Braquial'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'curl_martillo', name: 'Curl martillo', category: 'Bíceps', muscle_primary: 'Braquial', muscle_secondary: ['Bíceps'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'curl_inclinado', name: 'Curl inclinado', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'curl_concentrado', name: 'Curl concentrado', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'curl_polea', name: 'Curl polea', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_cuerda', name: 'Curl cuerda', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: ['Braquial'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_maquina', name: 'Curl maquina', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_predicador', name: 'Curl predicador', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: ['Braquial'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'curl_spider', name: 'Curl spider', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'curl_21', name: 'Curl 21', category: 'Bíceps', muscle_primary: 'Biceps', muscle_secondary: ['Braquial'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'curl_inverso', name: 'Curl inverso', category: 'Bíceps', muscle_primary: 'Antebrazo', muscle_secondary: ['Bíceps'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'curl_cable_overhead', name: 'Curl cable overhead', category: 'Bíceps', muscle_primary: 'Bíceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'curl_drag', name: 'Curl drag', category: 'Bíceps', muscle_primary: 'Bíceps', muscle_secondary: ['Braquial'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'curl_bayesian', name: 'Curl bayesian', category: 'Bíceps', muscle_primary: 'Bíceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: true },
  { id: 'curl_martillo_polea', name: 'Curl martillo polea', category: 'Bíceps', muscle_primary: 'Braquial', muscle_secondary: ['Bíceps'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_banda', name: 'Curl banda', category: 'Bíceps', muscle_primary: 'Bíceps', muscle_secondary: [], equipment: 'Banda', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_maquina_predicador', name: 'Curl maquina predicador', category: 'Bíceps', muscle_primary: 'Bíceps', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_predicador_mancuerna', name: 'Curl predicador mancuerna', category: 'Bíceps', muscle_primary: 'Bíceps', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'curl_scott', name: 'Curl Scott', category: 'Bíceps', muscle_primary: 'Bíceps', muscle_secondary: [], equipment: 'Barra Z', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },

  // ══════════════════════════════════════════
  // TRÍCEPS
  // ══════════════════════════════════════════
  { id: 'fondos_banco', name: 'Fondos banco', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: ['Pecho mayor', 'Deltoide anterior'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Principiante', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'press_cerrado', name: 'Press cerrado', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: ['Pecho mayor'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'extension_polea_barra', name: 'Extension polea barra', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'pushdown_cuerda', name: 'Pushdown cuerda', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'pushdown_inverso', name: 'Pushdown inverso', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'extension_overhead_mancuerna', name: 'Extension overhead mancuerna', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'extension_overhead_polea', name: 'Extension overhead polea', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'patada_triceps', name: 'Patada triceps', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'extension_maquina', name: 'Extension maquina', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'skull_crushers', name: 'Skull crushers', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'press_frances', name: 'Press frances', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'dip_machine', name: 'Fondos maquina', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: ['Pecho mayor'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'pushdown_barra_v', name: 'Pushdown barra V', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'pushdown_unilateral', name: 'Pushdown unilateral', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'jm_press', name: 'JM press', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: ['Pecho mayor'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje horizontal', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'extension_triceps_banda', name: 'Extension triceps banda', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Banda', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'extension_overhead_barra_z', name: 'Extension overhead barra Z', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Barra Z', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'extension_polea_unilateral', name: 'Extension polea unilateral', category: 'Tríceps', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },

  // ══════════════════════════════════════════
  // ANTEBRAZO
  // ══════════════════════════════════════════
  { id: 'curl_muneca', name: 'Curl muñeca', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_inverso_muneca', name: 'Curl inverso muñeca', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'farmer_walk', name: 'Farmer walk', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: ['Trapecio', 'Core'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'dead_hang', name: 'Dead hang', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: [], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'timed' },
  { id: 'pinch_grip', name: 'Pinch grip', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: [], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'curl_muneca_barra', name: 'Curl muneca barra', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: [], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'reverse_curl_barra', name: 'Reverse curl barra', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: ['Braquial'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'wrist_roller', name: 'Wrist roller', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: [], equipment: 'Funcional', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'plate_pinch', name: 'Plate pinch', category: 'Antebrazo', muscle_primary: 'Antebrazo', muscle_secondary: [], equipment: 'Funcional', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false, inputMode: 'timed' },

  // ══════════════════════════════════════════
  // PIERNAS
  // ══════════════════════════════════════════
  { id: 'sentadilla_barra', name: 'Sentadilla barra', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'sentadilla_frontal', name: 'Sentadilla frontal', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Core', 'Glúteos'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'sentadilla_goblet', name: 'Sentadilla goblet', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'sentadilla_bulgara', name: 'Sentadilla bulgara', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'zancadas', name: 'Zancadas', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'zancadas_caminando', name: 'Zancadas caminando', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'prensa_piernas', name: 'Prensa piernas', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'prensa_inclinada', name: 'Prensa inclinada', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'extension_piernas', name: 'Extension piernas', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'hack_squat', name: 'Hack squat', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'sentadilla_smith', name: 'Sentadilla smith', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'step_up', name: 'Step up', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: true },
  { id: 'pistol_squat', name: 'Pistol squat', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Avanzado', is_compound: true, unilateral: true, inputMode: 'bodyweight_reps' },
  { id: 'wall_sit', name: 'Wall sit', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: [], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'timed' },
  { id: 'curl_femoral_tumbado', name: 'Curl femoral tumbado', category: 'Piernas', muscle_primary: 'Isquiotibiales', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', category: 'Piernas', muscle_primary: 'Isquiotibiales', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'curl_femoral_de_pie', name: 'Curl femoral de pie', category: 'Piernas', muscle_primary: 'Isquiotibiales', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'nordic_curl', name: 'Nordic curl', category: 'Piernas', muscle_primary: 'Isquiotibiales', muscle_secondary: [], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Avanzado', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'aductores_maquina', name: 'Aductores maquina', category: 'Piernas', muscle_primary: 'Aductores', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'abductores_maquina', name: 'Abductores maquina', category: 'Piernas', muscle_primary: 'Abductores', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'cossack_squat', name: 'Cossack squat', category: 'Piernas', muscle_primary: 'Aductores', muscle_secondary: ['Cuadriceps', 'Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'lateral_lunge', name: 'Lateral lunge', category: 'Piernas', muscle_primary: 'Aductores', muscle_secondary: ['Cuadriceps', 'Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'sissy_squat', name: 'Sissy squat', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Core'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Avanzado', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'sentadilla_hack_inversa', name: 'Sentadilla hack inversa', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'sentadilla_pendulum', name: 'Sentadilla pendulum', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'prensa_horizontal', name: 'Prensa horizontal', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'sentadilla_zercher', name: 'Sentadilla Zercher', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'sentadilla_sumo', name: 'Sentadilla sumo', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos', 'Aductores'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'sentadilla_landmine', name: 'Sentadilla landmine', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'zancadas_inversas', name: 'Zancadas inversas', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: true },
  { id: 'split_squat', name: 'Split squat', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: true },
  { id: 'belt_squat', name: 'Belt squat', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'peso_muerto_deficit', name: 'Peso muerto deficit', category: 'Piernas', muscle_primary: 'Isquiotibiales', muscle_secondary: ['Glúteos', 'Erector espinal'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'peso_muerto_rumano_mancuernas', name: 'Peso muerto rumano mancuernas', category: 'Piernas', muscle_primary: 'Isquiotibiales', muscle_secondary: ['Glúteos'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'peso_muerto_rumano_unilateral', name: 'Peso muerto rumano unilateral', category: 'Piernas', muscle_primary: 'Isquiotibiales', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'prensa_unilateral', name: 'Prensa unilateral', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'extension_piernas_unilateral', name: 'Extension piernas unilateral', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'sentadilla_banda', name: 'Sentadilla banda', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Banda', type: 'Funcional', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'leg_press_horizontal', name: 'Leg press horizontal', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'sentadilla_copa_kettlebell', name: 'Sentadilla copa kettlebell', category: 'Piernas', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Kettlebell', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },

  // ══════════════════════════════════════════
  // GLÚTEOS
  // ══════════════════════════════════════════
  { id: 'hip_thrust', name: 'Hip thrust', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'hip_thrust_maquina', name: 'Hip thrust maquina', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'puente_gluteo', name: 'Puente gluteo', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'patada_gluteo_polea', name: 'Patada gluteo polea', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: [], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'abduccion_maquina', name: 'Abduccion maquina', category: 'Glúteos', muscle_primary: 'Gluteo medio', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'abduccion_banda', name: 'Abduccion banda', category: 'Glúteos', muscle_primary: 'Gluteo medio', muscle_secondary: [], equipment: 'Banda', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'pull_through', name: 'Pull through', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'frog_pumps', name: 'Frog pumps', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: [], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'hip_abduction_maquina', name: 'Hip abduction maquina', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Abductores'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'kickback_polea', name: 'Kickback polea', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'hip_thrust_mancuerna', name: 'Hip thrust mancuerna', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'hip_thrust_unilateral', name: 'Hip thrust unilateral', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Avanzado', is_compound: false, unilateral: true },
  { id: 'hip_thrust_banda', name: 'Hip thrust banda', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: [], equipment: 'Banda', type: 'Funcional', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'patada_gluteo_maquina', name: 'Patada gluteo maquina', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'clamshell', name: 'Clamshell', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Abductores'], equipment: 'Banda', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'fire_hydrant', name: 'Fire hydrant', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: ['Abductores'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_reps' },
  { id: 'elevacion_cadera_banda', name: 'Elevacion cadera banda', category: 'Glúteos', muscle_primary: 'Gluteos', muscle_secondary: [], equipment: 'Banda', type: 'Funcional', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Principiante', is_compound: false, unilateral: false },

  // ══════════════════════════════════════════
  // GEMELOS
  // ══════════════════════════════════════════
  { id: 'elevacion_talones', name: 'Elevacion talones', category: 'Gemelos', muscle_primary: 'Gemelos', muscle_secondary: ['Soleo'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'elevacion_talones_maquina', name: 'Elevacion talones maquina', category: 'Gemelos', muscle_primary: 'Gemelos', muscle_secondary: ['Soleo'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'elevacion_talones_sentado', name: 'Elevacion talones sentado', category: 'Gemelos', muscle_primary: 'Soleo', muscle_secondary: ['Gemelos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'donkey_calf_raise', name: 'Donkey calf raise', category: 'Gemelos', muscle_primary: 'Gemelos', muscle_secondary: ['Soleo'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'elevacion_talones_unilateral', name: 'Elevacion talones unilateral', category: 'Gemelos', muscle_primary: 'Gemelos', muscle_secondary: [], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true },
  { id: 'elevacion_talones_smith', name: 'Elevacion talones Smith', category: 'Gemelos', muscle_primary: 'Gemelos', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'tibialis_raise', name: 'Tibialis raise', category: 'Gemelos', muscle_primary: 'Tibial anterior', muscle_secondary: [], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },

  // ══════════════════════════════════════════
  // CORE
  // ══════════════════════════════════════════
  { id: 'crunch', name: 'Crunch', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: ['Oblicuos'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'crunch_maquina', name: 'Crunch maquina', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: [], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'crunch_polea', name: 'Crunch polea', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: ['Oblicuos'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'elevacion_piernas', name: 'Elevacion piernas', category: 'Core', muscle_primary: 'Abdomen inferior', muscle_secondary: ['Flexores de cadera'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'elevacion_piernas_colgado', name: 'Elevacion piernas colgado', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: ['Flexores de cadera'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Avanzado', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'plancha', name: 'Plancha', category: 'Core', muscle_primary: 'Core', muscle_secondary: ['Abdomen', 'Oblicuos'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'timed' },
  { id: 'plancha_lateral', name: 'Plancha lateral', category: 'Core', muscle_primary: 'Oblicuos', muscle_secondary: ['Core'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: true, inputMode: 'timed' },
  { id: 'russian_twist', name: 'Russian twist', category: 'Core', muscle_primary: 'Oblicuos', muscle_secondary: ['Abdomen'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'woodchopper', name: 'Woodchopper', category: 'Core', muscle_primary: 'Oblicuos', muscle_secondary: ['Abdomen'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: true },
  { id: 'bicycle_crunch', name: 'Bicycle crunch', category: 'Core', muscle_primary: 'Oblicuos', muscle_secondary: ['Abdomen'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'dead_bug', name: 'Dead bug', category: 'Core', muscle_primary: 'Core', muscle_secondary: ['Abdomen'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'ab_wheel_rollout', name: 'Ab wheel', category: 'Core', muscle_primary: 'Core', muscle_secondary: ['Abdomen', 'Hombros'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'hollow_hold', name: 'Hollow hold', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: ['Core'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false, inputMode: 'timed' },
  { id: 'pallof_press', name: 'Pallof press', category: 'Core', muscle_primary: 'Oblicuos', muscle_secondary: ['Core'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'v_ups', name: 'V-ups', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: ['Flexores de cadera'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'hanging_knee_raise', name: 'Elevacion rodillas colgado', category: 'Core', muscle_primary: 'Abdomen inferior', muscle_secondary: ['Flexores de cadera'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'crunch_inverso', name: 'Crunch inverso', category: 'Core', muscle_primary: 'Abdomen inferior', muscle_secondary: ['Core'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'crunch_lateral', name: 'Crunch lateral', category: 'Core', muscle_primary: 'Oblicuos', muscle_secondary: [], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_reps' },
  { id: 'dragon_flag', name: 'Dragon flag', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: ['Core'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Avanzado', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'l_sit', name: 'L-sit', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: ['Flexores de cadera'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Avanzado', is_compound: false, unilateral: false, inputMode: 'timed' },
  { id: 'sit_up', name: 'Sit-up', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: ['Flexores de cadera'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'flutter_kicks', name: 'Flutter kicks', category: 'Core', muscle_primary: 'Abdomen inferior', muscle_secondary: ['Flexores de cadera'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'timed' },
  { id: 'windshield_wiper', name: 'Windshield wiper', category: 'Core', muscle_primary: 'Oblicuos', muscle_secondary: ['Abdomen'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Avanzado', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'oblicuo_polea', name: 'Oblicuo polea', category: 'Core', muscle_primary: 'Oblicuos', muscle_secondary: ['Core'], equipment: 'Polea', type: 'Polea', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: true },
  { id: 'toe_touch', name: 'Toe touch', category: 'Core', muscle_primary: 'Abdomen', muscle_secondary: [], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'plancha_con_extension', name: 'Plancha con extension', category: 'Core', muscle_primary: 'Core', muscle_secondary: ['Abdomen', 'Hombros'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Intermedio', is_compound: false, unilateral: false, inputMode: 'timed' },

  // ══════════════════════════════════════════
  // CARDIO
  // ══════════════════════════════════════════
  { id: 'cinta_correr', name: 'Cinta correr', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Piernas'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'correr', name: 'Correr', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Piernas'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'bicicleta_estatica', name: 'Bicicleta estatica', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Cuadriceps'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'eliptica', name: 'Eliptica', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Cuadriceps', 'Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'remo_maquina_cardio', name: 'Remo maquina cardio', category: 'Cardio', muscle_primary: 'Cuerpo completo', muscle_secondary: ['Dorsal ancho', 'Bíceps'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'escaladora', name: 'Escaladora', category: 'Cardio', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'saltar_cuerda', name: 'Saltar cuerda', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Gemelos'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'caminata_inclinada', name: 'Caminata inclinada', category: 'Cardio', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos', 'Cardio'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'natacion', name: 'Natacion', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Espalda', 'Hombros'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'bicicleta_asalto', name: 'Bicicleta de asalto', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Piernas', 'Core'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'sled_push', name: 'Sled push', category: 'Cardio', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'air_bike', name: 'Air bike', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Piernas', 'Brazos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'caminar', name: 'Caminar', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Piernas'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'ski_erg', name: 'Ski erg', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Espalda', 'Core'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'sprints', name: 'Sprints', category: 'Cardio', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'bicicleta_exterior', name: 'Bicicleta exterior', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Piernas'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'senderismo', name: 'Senderismo', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Piernas', 'Glúteos'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'step_mill', name: 'Step mill', category: 'Cardio', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: false, unilateral: false },
  { id: 'hand_bike', name: 'Hand bike', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Hombros', 'Brazos'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'remo_indoor', name: 'Remo indoor', category: 'Cardio', muscle_primary: 'Cardio', muscle_secondary: ['Espalda', 'Piernas'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },

  // ══════════════════════════════════════════
  // HIIT
  // ══════════════════════════════════════════
  { id: 'burpees', name: 'Burpees', category: 'HIIT', muscle_primary: 'Cuerpo completo', muscle_secondary: ['Core', 'Pecho mayor'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'jumping_jacks', name: 'Jumping jacks', category: 'HIIT', muscle_primary: 'Cardio', muscle_secondary: [], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'mountain_climbers', name: 'Mountain climbers', category: 'HIIT', muscle_primary: 'Core', muscle_secondary: ['Cardio'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'high_knees', name: 'High knees', category: 'HIIT', muscle_primary: 'Cardio', muscle_secondary: ['Cuadriceps'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'tuck_jumps', name: 'Tuck jumps', category: 'HIIT', muscle_primary: 'Piernas', muscle_secondary: ['Core'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'box_jump', name: 'Box jump', category: 'HIIT', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'wall_ball', name: 'Wall ball', category: 'HIIT', muscle_primary: 'Full body', muscle_secondary: ['Piernas', 'Hombros'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'squat_jump', name: 'Squat jump', category: 'HIIT', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'lunge_jump', name: 'Lunge jump', category: 'HIIT', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'skater_jump', name: 'Skater jump', category: 'HIIT', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'devil_press', name: 'Devil press', category: 'HIIT', muscle_primary: 'Full body', muscle_secondary: ['Hombros', 'Piernas'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'man_maker', name: 'Man maker', category: 'HIIT', muscle_primary: 'Full body', muscle_secondary: ['Pecho', 'Hombros', 'Piernas'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'bear_crawl', name: 'Bear crawl', category: 'HIIT', muscle_primary: 'Core', muscle_secondary: ['Hombros', 'Piernas'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'sled_pull', name: 'Sled pull', category: 'HIIT', muscle_primary: 'Piernas', muscle_secondary: ['Espalda', 'Core'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'sumo_squat_jump', name: 'Sumo squat jump', category: 'HIIT', muscle_primary: 'Piernas', muscle_secondary: ['Glúteos', 'Aductores'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'cardio', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },

  // ══════════════════════════════════════════
  // FULL BODY
  // ══════════════════════════════════════════
  { id: 'thruster', name: 'Thruster', category: 'Full body', muscle_primary: 'Cuerpo completo', muscle_secondary: ['Cuadriceps', 'Hombros'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'clean_and_press', name: 'Clean and press', category: 'Full body', muscle_primary: 'Cuerpo completo', muscle_secondary: ['Hombros', 'Piernas'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'kettlebell_swing', name: 'Kettlebell swing', category: 'Full body', muscle_primary: 'Gluteos', muscle_secondary: ['Isquiotibiales', 'Core'], equipment: 'Kettlebell', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'turkish_get_up', name: 'Turkish get up', category: 'Full body', muscle_primary: 'Core', muscle_secondary: ['Hombros', 'Piernas'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Avanzado', is_compound: true, unilateral: true },
  { id: 'battle_ropes', name: 'Battle ropes', category: 'Full body', muscle_primary: 'Cardio', muscle_secondary: ['Hombros', 'Core'], equipment: 'Máquina', type: 'Máquina', exerciseType: 'pesas', movement: 'Cardio', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'snatch', name: 'Snatch', category: 'Full body', muscle_primary: 'Full body', muscle_secondary: ['Hombros', 'Piernas'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'power_clean', name: 'Power clean', category: 'Full body', muscle_primary: 'Full body', muscle_secondary: ['Piernas', 'Espalda'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'muscle_up', name: 'Muscle up', category: 'Full body', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Pecho mayor', 'Tríceps'], equipment: 'Peso corporal', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'rope_climb', name: 'Rope climb', category: 'Full body', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Core'], equipment: 'Funcional', type: 'Funcional', exerciseType: 'pesas', movement: 'Tirón vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false, inputMode: 'timed' },
  { id: 'clean', name: 'Clean', category: 'Full body', muscle_primary: 'Full body', muscle_secondary: ['Piernas', 'Espalda', 'Hombros'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'push_press', name: 'Push press', category: 'Full body', muscle_primary: 'Hombros', muscle_secondary: ['Tríceps', 'Piernas'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: false },
  { id: 'hang_clean', name: 'Hang clean', category: 'Full body', muscle_primary: 'Full body', muscle_secondary: ['Piernas', 'Espalda'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'hang_snatch', name: 'Hang snatch', category: 'Full body', muscle_primary: 'Full body', muscle_secondary: ['Hombros', 'Piernas'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Avanzado', is_compound: true, unilateral: false },
  { id: 'kettlebell_clean', name: 'Kettlebell clean', category: 'Full body', muscle_primary: 'Full body', muscle_secondary: ['Piernas', 'Core'], equipment: 'Kettlebell', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'kettlebell_snatch', name: 'Kettlebell snatch', category: 'Full body', muscle_primary: 'Full body', muscle_secondary: ['Hombros', 'Core'], equipment: 'Kettlebell', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Avanzado', is_compound: true, unilateral: true },
  { id: 'kettlebell_press', name: 'Kettlebell press', category: 'Full body', muscle_primary: 'Hombros', muscle_secondary: ['Tríceps', 'Core'], equipment: 'Kettlebell', type: 'Libre', exerciseType: 'pesas', movement: 'Empuje vertical', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'kettlebell_goblet_squat', name: 'Kettlebell goblet squat', category: 'Full body', muscle_primary: 'Cuadriceps', muscle_secondary: ['Glúteos', 'Core'], equipment: 'Kettlebell', type: 'Libre', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: true, unilateral: false },
  { id: 'kettlebell_windmill', name: 'Kettlebell windmill', category: 'Full body', muscle_primary: 'Core', muscle_secondary: ['Hombros', 'Oblicuos'], equipment: 'Kettlebell', type: 'Libre', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Avanzado', is_compound: false, unilateral: true },
  { id: 'kettlebell_row', name: 'Kettlebell row', category: 'Full body', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps'], equipment: 'Kettlebell', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Principiante', is_compound: true, unilateral: true },
  { id: 'landmine_row', name: 'Landmine row', category: 'Full body', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Bíceps', 'Core'], equipment: 'Barra', type: 'Libre', exerciseType: 'pesas', movement: 'Tirón horizontal', difficulty: 'Intermedio', is_compound: true, unilateral: true },
  { id: 'farmers_carry', name: 'Farmers carry', category: 'Full body', muscle_primary: 'Core', muscle_secondary: ['Antebrazo', 'Trapecio'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Cardio', difficulty: 'Principiante', is_compound: true, unilateral: false, inputMode: 'timed' },

  // ══════════════════════════════════════════
  // MOVILIDAD
  // ══════════════════════════════════════════
  { id: 'band_pull_apart', name: 'Band pull apart', category: 'Movilidad', muscle_primary: 'Espalda alta', muscle_secondary: ['Deltoide posterior'], equipment: 'Banda', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'rotacion_hombro', name: 'Rotacion hombro', category: 'Movilidad', muscle_primary: 'Hombros', muscle_secondary: [], equipment: 'Banda', type: 'Cuerpo', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false },
  { id: 'estiramiento_cadera', name: 'Estiramiento cadera', category: 'Movilidad', muscle_primary: 'Cadera', muscle_secondary: [], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_timed' },
  { id: 'cat_cow', name: 'Cat cow', category: 'Movilidad', muscle_primary: 'Columna', muscle_secondary: ['Core'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_timed' },
  { id: 'sentadilla_profunda', name: 'Sentadilla profunda', category: 'Movilidad', muscle_primary: 'Cadera', muscle_secondary: ['Cuadriceps'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Sentadilla', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_timed' },
  { id: 'estiramiento_cuadriceps', name: 'Estiramiento cuadriceps', category: 'Movilidad', muscle_primary: 'Cuadriceps', muscle_secondary: [], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_timed' },
  { id: 'estiramiento_isquiotibiales', name: 'Estiramiento isquiotibiales', category: 'Movilidad', muscle_primary: 'Isquiotibiales', muscle_secondary: [], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_timed' },
  { id: 'estiramiento_pecho', name: 'Estiramiento pecho', category: 'Movilidad', muscle_primary: 'Pecho mayor', muscle_secondary: ['Deltoide anterior'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_timed' },
  { id: 'estiramiento_espalda', name: 'Estiramiento espalda', category: 'Movilidad', muscle_primary: 'Dorsal ancho', muscle_secondary: ['Erector espinal'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_timed' },
  { id: 'estiramiento_gluteos', name: 'Estiramiento gluteos', category: 'Movilidad', muscle_primary: 'Gluteos', muscle_secondary: [], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_timed' },
  { id: 'estiramiento_triceps', name: 'Estiramiento triceps', category: 'Movilidad', muscle_primary: 'Triceps', muscle_secondary: [], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_timed' },
  { id: 'estiramiento_gemelos', name: 'Estiramiento gemelos', category: 'Movilidad', muscle_primary: 'Gemelos', muscle_secondary: [], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_timed' },
  { id: 'foam_rolling', name: 'Foam rolling', category: 'Movilidad', muscle_primary: 'Full body', muscle_secondary: [], equipment: 'Funcional', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_timed' },
  { id: 'world_greatest_stretch', name: 'World greatest stretch', category: 'Movilidad', muscle_primary: 'Cadera', muscle_secondary: ['Isquiotibiales', 'Core'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_timed' },
  { id: 'dislocaciones_hombro', name: 'Dislocaciones hombro', category: 'Movilidad', muscle_primary: 'Hombros', muscle_secondary: ['Pecho mayor'], equipment: 'Banda', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'rotacion_torax', name: 'Rotacion torax', category: 'Movilidad', muscle_primary: 'Columna', muscle_secondary: ['Oblicuos'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_reps' },
  { id: 'pigeon_stretch', name: 'Pigeon stretch', category: 'Movilidad', muscle_primary: 'Cadera', muscle_secondary: ['Gluteos'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_timed' },
  { id: 'scorpion_stretch', name: 'Scorpion stretch', category: 'Movilidad', muscle_primary: 'Cadera', muscle_secondary: ['Columna'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: true, inputMode: 'bodyweight_timed' },
  { id: 'knee_over_toes', name: 'Knee over toes', category: 'Movilidad', muscle_primary: 'Rodillas', muscle_secondary: ['Cuadriceps'], equipment: 'Peso corporal', type: 'Funcional', exerciseType: 'pesas', movement: 'Aislamiento', difficulty: 'Principiante', is_compound: false, unilateral: false, inputMode: 'bodyweight_reps' },
  { id: 'jefferson_curl', name: 'Jefferson curl', category: 'Movilidad', muscle_primary: 'Columna', muscle_secondary: ['Isquiotibiales'], equipment: 'Mancuernas', type: 'Libre', exerciseType: 'pesas', movement: 'Bisagra', difficulty: 'Intermedio', is_compound: false, unilateral: false },
];

// ══════════════════════════════════════════
// Lookup maps
// ══════════════════════════════════════════

/** Fast lookup by id */
export const EXERCISE_MAP = new Map<string, Exercise>(EXERCISE_DB.map(e => [e.id, e]));

/** Old name → new id mapping for data migration */
export const NAME_TO_ID: Record<string, string> = {
  // ── Old Pecho names ──
  'Press banca': 'press_banca_barra',
  'Press con mancuernas': 'press_banca_mancuernas',
  'Press en máquina': 'press_banca_maquina',
  'Press banca máquina': 'press_banca_maquina',
  'Press inclinado': 'press_inclinado_barra',
  'Press inclinado en máquina': 'press_inclinado_maquina',
  'Press inclinado máquina': 'press_inclinado_maquina',
  'Press declinado': 'press_declinado_barra',
  'Aperturas mancuernas': 'aperturas_mancuernas',
  'Aperturas en polea': 'cruces_polea_media',
  'Fondos en paralelas': 'fondos_paralelas',
  'Pullover': 'pullover_mancuerna',
  'Contractor de pecho': 'aperturas_maquina',
  'Flexiones': 'flexiones',
  // ── Old Espalda names ──
  'Jalón al pecho': 'jalon_al_pecho',
  'Jalón tras nuca': 'jalon_agarre_amplio',
  'Jalón agarre cerrado': 'jalon_agarre_estrecho',
  'Remo con barra': 'remo_barra',
  'Remo con mancuerna': 'remo_mancuerna',
  'Remo en polea baja': 'remo_polea_baja',
  'Dominadas': 'dominadas_pronadas',
  'Remo en máquina': 'remo_maquina',
  'Face pull': 'face_pull',
  'Pulldown en máquina': 'dominadas_asistidas',
  'Remo T-bar': 'remo_t_bar',
  // ── Old Hombros names ──
  'Press militar': 'press_militar_barra',
  'Press con mancuernas hombro': 'press_militar_mancuernas',
  'Press de hombro en máquina': 'press_hombro_maquina',
  'Press de hombro máquina': 'press_hombro_maquina',
  'Press Arnold': 'press_arnold',
  'Elevaciones laterales': 'elevaciones_laterales',
  'Elevaciones laterales mancuernas': 'elevaciones_laterales',
  'Elevaciones laterales en polea': 'elevaciones_laterales_polea',
  'Elevaciones laterales en máquina': 'elevaciones_laterales_maquina',
  'Elevaciones laterales máquina': 'elevaciones_laterales_maquina',
  'Elevaciones frontales': 'elevaciones_frontales',
  'Pájaros': 'pajaros_mancuernas',
  'Pájaros mancuernas': 'pajaros_mancuernas',
  'Encogimientos': 'encogimientos_hombros',
  // ── Old Bíceps names ──
  'Curl con barra': 'curl_barra',
  'Curl con barra Z': 'curl_barra_z',
  'Curl con mancuernas': 'curl_mancuernas',
  'Curl martillo': 'curl_martillo',
  'Curl concentrado': 'curl_concentrado',
  'Curl en polea': 'curl_polea',
  'Curl predicador': 'curl_predicador',
  'Curl en máquina': 'curl_maquina',
  // ── Old Tríceps names ──
  'Press francés': 'press_frances',
  'Tríceps en polea': 'extension_polea_barra',
  'Tríceps con cuerda': 'pushdown_cuerda',
  'Extensiones de tríceps': 'extension_overhead_mancuerna',
  'Patada de tríceps': 'patada_triceps',
  'Fondos en banco': 'fondos_banco',
  'Press cerrado': 'press_cerrado',
  'Tríceps en máquina': 'extension_maquina',
  // ── Old Cuádriceps names ──
  'Sentadilla': 'sentadilla_barra',
  'Sentadilla barra': 'sentadilla_barra',
  'Sentadilla goblet': 'sentadilla_goblet',
  'Sentadilla frontal': 'sentadilla_frontal',
  'Sentadilla búlgara': 'sentadilla_bulgara',
  'Sentadilla en máquina Smith': 'sentadilla_smith',
  'Sentadilla Smith': 'sentadilla_smith',
  'Sentadilla en multipower': 'sentadilla_smith',
  'Sentadilla multipower': 'sentadilla_smith',
  'Prensa de pierna': 'prensa_piernas',
  'Prensa de pierna 45°': 'prensa_inclinada',
  'Extensiones cuádriceps': 'extension_piernas',
  'Zancadas': 'zancadas',
  'Hack squat': 'hack_squat',
  'Sissy squat': 'sissy_squat',
  'Step up': 'step_up',
  // ── Old Isquiotibiales names ──
  'Curl femoral': 'curl_femoral_tumbado',
  'Curl femoral sentado': 'curl_femoral_sentado',
  'Peso muerto rumano': 'peso_muerto_rumano',
  'Peso muerto': 'peso_muerto_convencional',
  'Peso muerto sumo': 'peso_muerto_sumo',
  'Buenos días': 'buenos_dias',
  // ── Old Glúteos names ──
  'Hip thrust': 'hip_thrust',
  'Hip thrust barra': 'hip_thrust',
  'Hip thrust en máquina': 'hip_thrust_maquina',
  'Hip thrust máquina': 'hip_thrust_maquina',
  'Patada de glúteo': 'patada_gluteo_polea',
  'Patada de glúteo en máquina': 'patada_gluteo_polea',
  'Patada de glúteo máquina': 'patada_gluteo_polea',
  'Puente de glúteo': 'puente_gluteo',
  'Aductores en máquina': 'aductores_maquina',
  'Abductores en máquina': 'abductores_maquina',
  // ── Old Pantorrillas names ──
  'Pantorrillas': 'elevacion_talones',
  'Pantorrillas de pie': 'elevacion_talones_maquina',
  'Pantorrillas sentado': 'elevacion_talones_sentado',
  'Pantorrillas en prensa': 'elevacion_talones_maquina',
  // ── Old Core names ──
  'Crunch': 'crunch',
  'Crunch en polea': 'crunch_polea',
  'Crunch en máquina': 'crunch_maquina',
  'Plancha': 'plancha',
  'Plancha lateral': 'plancha_lateral',
  'Elevación de piernas': 'elevacion_piernas',
  'Elevación de piernas en banco': 'elevacion_piernas',
  'Russian twist': 'russian_twist',
  'Ab wheel': 'ab_wheel_rollout',
  'Mountain climbers': 'mountain_climbers',
  'Dead bug': 'dead_bug',
  'Leñador en polea': 'woodchopper',
  // ── Old Cardio names ──
  'Correr': 'correr',
  'Bicicleta estática': 'bicicleta_estatica',
  'Elíptica': 'eliptica',
  'Remo ergómetro': 'remo_maquina_cardio',
  'Saltar cuerda': 'saltar_cuerda',
  'Caminadora': 'cinta_correr',
  'Stairmaster': 'escaladora',
  'Bicicleta de asalto': 'bicicleta_asalto',
  'Natación': 'natacion',
  'Caminar': 'caminar',
  'Caminata inclinada': 'caminata_inclinada',
  'Incline walk': 'caminata_inclinada',
  'Treadmill incline': 'caminata_inclinada',
  'Incline walking': 'caminata_inclinada',
  'Swimming': 'natacion',
  'Assault bike': 'air_bike',
  'Sled push': 'sled_push',
  'Air bike': 'air_bike',
  'HIIT': 'burpees',
  // ── English aliases (for ChatGPT imports) ──
  'Bench press': 'press_banca_barra',
  'Flat bench press': 'press_banca_barra',
  'Incline bench press': 'press_inclinado_barra',
  'Incline bench': 'press_inclinado_barra',
  'Decline bench press': 'press_declinado_barra',
  'Chest press': 'press_banca_maquina',
  'Chest fly': 'aperturas_mancuernas',
  'Cable fly': 'cruces_polea_media',
  'Cable crossover': 'crossover_polea',
  'Pec deck': 'aperturas_maquina',
  'Push ups': 'flexiones',
  'Push-ups': 'flexiones',
  'Pushups': 'flexiones',
  'Dips': 'fondos_paralelas',
  'Lat pulldown': 'jalon_al_pecho',
  'Seated row': 'remo_maquina',
  'Seated cable row': 'remo_polea_baja',
  'Barbell row': 'remo_barra',
  'Dumbbell row': 'remo_mancuerna',
  'T-bar row': 'remo_t_bar',
  'Pendlay row': 'remo_pendlay',
  'Pull up': 'dominadas_pronadas',
  'Pull-up': 'dominadas_pronadas',
  'Pull ups': 'dominadas_pronadas',
  'Pullups': 'dominadas_pronadas',
  'Chin up': 'dominadas_chin_up',
  'Chin-up': 'dominadas_chin_up',
  'Chin ups': 'dominadas_chin_up',
  'Overhead press': 'press_militar_barra',
  'Military press': 'press_militar_barra',
  'Shoulder press': 'press_militar_barra',
  'Lateral raise': 'elevaciones_laterales',
  'Lateral raises': 'elevaciones_laterales',
  'Side lateral raise': 'elevaciones_laterales',
  'Front raise': 'elevaciones_frontales',
  'Reverse fly': 'pajaros_mancuernas',
  'Rear delt fly': 'rear_delt_fly',
  'Shrugs': 'encogimientos_hombros',
  'Barbell shrug': 'encogimientos_hombros',
  'Bicep curl': 'curl_barra',
  'Barbell curl': 'curl_barra',
  'Dumbbell curl': 'curl_mancuernas',
  'Hammer curl': 'curl_martillo',
  'Preacher curl': 'curl_predicador',
  'Spider curl': 'curl_spider',
  'EZ bar curl': 'curl_barra_z',
  'EZ curl': 'curl_barra_z',
  'Concentration curl': 'curl_concentrado',
  'Cable curl': 'curl_polea',
  'Reverse grip curl': 'curl_inverso',
  'Drag curl': 'curl_drag',
  'Tricep pushdown': 'extension_polea_barra',
  'Triceps pushdown': 'extension_polea_barra',
  'Rope pushdown': 'pushdown_cuerda',
  'Skull crusher': 'skull_crushers',
  'Skull crushers': 'skull_crushers',
  'Overhead tricep extension': 'extension_overhead_mancuerna',
  'Tricep kickback': 'patada_triceps',
  'Close grip bench press': 'press_cerrado',
  'Squat': 'sentadilla_barra',
  'Squats': 'sentadilla_barra',
  'Back squat': 'sentadilla_barra',
  'Front squat': 'sentadilla_frontal',
  'Goblet squat': 'sentadilla_goblet',
  'Bulgarian split squat': 'sentadilla_bulgara',
  'Smith machine squat': 'sentadilla_smith',
  'Box squat': 'sentadilla_barra',
  'Leg press': 'prensa_piernas',
  'Leg extension': 'extension_piernas',
  'Leg curl': 'curl_femoral_tumbado',
  'Seated leg curl': 'curl_femoral_sentado',
  'Lying leg curl': 'curl_femoral_tumbado',
  'Standing leg curl': 'curl_femoral_de_pie',
  'Lunge': 'zancadas',
  'Lunges': 'zancadas',
  'Walking lunge': 'zancadas_caminando',
  'Walking lunges': 'zancadas_caminando',
  'Step ups': 'step_up',
  'Deadlift': 'peso_muerto_convencional',
  'Conventional deadlift': 'peso_muerto_convencional',
  'Romanian deadlift': 'peso_muerto_rumano',
  'RDL': 'peso_muerto_rumano',
  'Sumo deadlift': 'peso_muerto_sumo',
  'Good morning': 'buenos_dias',
  'Good mornings': 'buenos_dias',
  'Barbell hip thrust': 'hip_thrust',
  'Glute bridge': 'puente_gluteo',
  'Cable kickback': 'kickback_polea',
  'Glute kickback': 'kickback_polea',
  'Calf raise': 'elevacion_talones',
  'Calf raises': 'elevacion_talones',
  'Standing calf raise': 'elevacion_talones_maquina',
  'Seated calf raise': 'elevacion_talones_sentado',
  'Plank': 'plancha',
  'Side plank': 'plancha_lateral',
  'Crunches': 'crunch',
  'Hanging leg raise': 'elevacion_piernas_colgado',
  'Hanging knee raise': 'hanging_knee_raise',
  'Leg raise': 'elevacion_piernas',
  'Ab rollout': 'ab_wheel_rollout',
  'V-ups': 'v_ups',
  'V ups': 'v_ups',
  'Farmer walk': 'farmer_walk',
  'Farmer carry': 'farmer_walk',
  'Kettlebell swing': 'kettlebell_swing',
  'Turkish get up': 'turkish_get_up',
  'Clean and press': 'clean_and_press',
  'Power clean': 'power_clean',
  'Snatch': 'snatch',
  'Muscle up': 'muscle_up',
  'Muscle-up': 'muscle_up',
  'Thruster': 'thruster',
  'Thrusters': 'thruster',
  'Burpee': 'burpees',
  'Battle ropes': 'battle_ropes',
  'Jump rope': 'saltar_cuerda',
  'Jumping rope': 'saltar_cuerda',
  'Treadmill': 'cinta_correr',
  'Elliptical': 'eliptica',
  'Stair climber': 'escaladora',
  'Stationary bike': 'bicicleta_estatica',
  'Exercise bike': 'bicicleta_estatica',
  'Rowing machine': 'remo_maquina_cardio',
  'Running': 'correr',
  'Jogging': 'correr',
  // ── New exercise aliases ──
  'Decline dumbbell press': 'press_declinado_mancuernas',
  'Incline smith press': 'press_inclinado_smith',
  'Decline fly': 'aperturas_declinadas',
  'Cable chest press': 'press_pecho_polea',
  'Explosive push ups': 'flexiones_explosivas',
  'Inverted row': 'remo_invertido',
  'Supine lat pulldown': 'jalon_supino',
  'Single arm pulldown': 'jalon_unilateral',
  'Single arm lat pulldown': 'pulldown_unilateral',
  'Helms row': 'remo_helms',
  'Trap bar deadlift': 'peso_muerto_barra_trampa',
  'Hex bar deadlift': 'peso_muerto_barra_trampa',
  'Single arm row': 'remo_mancuerna_unilateral',
  'Single arm cable row': 'remo_polea_unilateral',
  'Smith machine press': 'press_hombro_smith',
  'Lu raise': 'lu_raise',
  'Dumbbell shrug': 'encogimientos_mancuernas',
  'Bayesian curl': 'curl_bayesian',
  'Hammer curl cable': 'curl_martillo_polea',
  'Band curl': 'curl_banda',
  'Machine preacher curl': 'curl_maquina_predicador',
  'Scott curl': 'curl_scott',
  'Single arm pushdown': 'pushdown_unilateral',
  'JM press': 'jm_press',
  'Band tricep extension': 'extension_triceps_banda',
  'Wrist roller': 'wrist_roller',
  'Plate pinch hold': 'plate_pinch',
  'Zercher squat': 'sentadilla_zercher',
  'Sumo squat': 'sentadilla_sumo',
  'Landmine squat': 'sentadilla_landmine',
  'Reverse lunge': 'zancadas_inversas',
  'Reverse lunges': 'zancadas_inversas',
  'Split squat': 'split_squat',
  'Belt squat': 'belt_squat',
  'Deficit deadlift': 'peso_muerto_deficit',
  'Dumbbell RDL': 'peso_muerto_rumano_mancuernas',
  'Single leg RDL': 'peso_muerto_rumano_unilateral',
  'Single leg deadlift': 'peso_muerto_rumano_unilateral',
  'Single leg press': 'prensa_unilateral',
  'Single leg extension': 'extension_piernas_unilateral',
  'Banded squat': 'sentadilla_banda',
  'Dumbbell hip thrust': 'hip_thrust_mancuerna',
  'Single leg hip thrust': 'hip_thrust_unilateral',
  'Banded hip thrust': 'hip_thrust_banda',
  'Glute kickback machine': 'patada_gluteo_maquina',
  'Clamshell': 'clamshell',
  'Fire hydrant': 'fire_hydrant',
  'Single leg calf raise': 'elevacion_talones_unilateral',
  'Smith calf raise': 'elevacion_talones_smith',
  'Tibialis raise': 'tibialis_raise',
  'Reverse crunch': 'crunch_inverso',
  'Side crunch': 'crunch_lateral',
  'Dragon flag': 'dragon_flag',
  'L-sit': 'l_sit',
  'L sit': 'l_sit',
  'Sit up': 'sit_up',
  'Sit-up': 'sit_up',
  'Sit ups': 'sit_up',
  'Flutter kicks': 'flutter_kicks',
  'Windshield wiper': 'windshield_wiper',
  'Windshield wipers': 'windshield_wiper',
  'Toe touch': 'toe_touch',
  'Toe touches': 'toe_touch',
  'Walking': 'caminar',
  'Hiking': 'senderismo',
  'Outdoor cycling': 'bicicleta_exterior',
  'Cycling': 'bicicleta_exterior',
  'Ski erg': 'ski_erg',
  'SkiErg': 'ski_erg',
  'Sprint': 'sprints',
  'Hand bike': 'hand_bike',
  'Arm bike': 'hand_bike',
  'Indoor rowing': 'remo_indoor',
  'Box jump': 'box_jump',
  'Box jumps': 'box_jump',
  'Wall ball': 'wall_ball',
  'Wall balls': 'wall_ball',
  'Squat jump': 'squat_jump',
  'Jump squat': 'squat_jump',
  'Lunge jump': 'lunge_jump',
  'Jump lunge': 'lunge_jump',
  'Skater': 'skater_jump',
  'Skaters': 'skater_jump',
  'Devil press': 'devil_press',
  'Man maker': 'man_maker',
  'Bear crawl': 'bear_crawl',
  'Sled pull': 'sled_pull',
  'Clean': 'clean',
  'Push press': 'push_press',
  'Hang clean': 'hang_clean',
  'Hang snatch': 'hang_snatch',
  'Kettlebell clean': 'kettlebell_clean',
  'Kettlebell snatch': 'kettlebell_snatch',
  'Kettlebell press': 'kettlebell_press',
  'Kettlebell goblet squat': 'kettlebell_goblet_squat',
  'Kettlebell windmill': 'kettlebell_windmill',
  'Kettlebell row': 'kettlebell_row',
  'Landmine row': 'landmine_row',
  'Farmers carry': 'farmers_carry',
  'Foam rolling': 'foam_rolling',
  'Foam roller': 'foam_rolling',
  'Pigeon stretch': 'pigeon_stretch',
  'Pigeon pose': 'pigeon_stretch',
  'Scorpion stretch': 'scorpion_stretch',
  'World greatest stretch': 'world_greatest_stretch',
  'Jefferson curl': 'jefferson_curl',
  'Shoulder dislocations': 'dislocaciones_hombro',
  'Band pull apart': 'band_pull_apart',
  // ── Old IDs from previous DB version (for migration of stored sessions) ──
  'aperturas_polea': 'cruces_polea_media',
  'elevaciones_laterales_mancuernas': 'elevaciones_laterales',
  'triceps_polea': 'extension_polea_barra',
  'jalon_pecho': 'jalon_al_pecho',
  'jalon_tras_nuca': 'jalon_agarre_amplio',
  'jalon_agarre_cerrado': 'jalon_agarre_estrecho',
  'prensa_pierna': 'prensa_piernas',
  'prensa_pierna_45': 'prensa_inclinada',
  'pantorrillas_prensa': 'elevacion_talones_maquina',
  'pantorrillas_pie': 'elevacion_talones_maquina',
  'pantorrillas_sentado': 'elevacion_talones_sentado',
  'triceps_maquina': 'extension_maquina',
  'triceps_cuerda': 'pushdown_cuerda',
  'extensiones_triceps': 'extension_overhead_mancuerna',
  'hip_thrust_barra': 'hip_thrust',
  'hip_thrust_maquina': 'hip_thrust_maquina',
  'extensiones_cuadriceps': 'extension_piernas',
  'curl_femoral': 'curl_femoral_tumbado',
  'contractor_pecho': 'aperturas_maquina',
  'pulldown_maquina': 'dominadas_asistidas',
  'remo_tbar': 'remo_t_bar',
  'press_militar_mancuernas': 'press_militar_mancuernas',
  'pajaros_mancuernas': 'pajaros_mancuernas',
  'elevaciones_laterales_polea': 'elevaciones_laterales_polea',
  'fondos_paralelas': 'fondos_paralelas',
  'press_hombro_maquina': 'press_hombro_maquina',
  'patada_gluteo': 'patada_gluteo_polea',
  'abductores_maquina': 'abductores_maquina',
  'aductores_maquina': 'aductores_maquina',
  'lenador_polea': 'woodchopper',
  'elevacion_piernas_banco': 'elevacion_piernas',
  'ab_wheel': 'ab_wheel_rollout',
  'crunch_polea': 'crunch_polea',
  'sentadilla_smith': 'sentadilla_smith',
  'sentadilla_multipower': 'sentadilla_smith',
  'remo_ergometro': 'remo_maquina_cardio',
  'natacion': 'natacion',
  'caminar': 'caminar',
  'caminadora': 'cinta_correr',
  'stairmaster': 'escaladora',
};

// Also build name → exercise map for backward compat lookups
const EXERCISE_BY_NAME = new Map<string, Exercise>();
for (const [oldName, id] of Object.entries(NAME_TO_ID)) {
  const ex = EXERCISE_MAP.get(id);
  if (ex) EXERCISE_BY_NAME.set(oldName, ex);
}
// Also index by current name
for (const ex of EXERCISE_DB) {
  EXERCISE_BY_NAME.set(ex.name, ex);
}

// ══════════════════════════════════════════
// Helper functions
// ══════════════════════════════════════════

/** Primary lookup by id */
export function getExerciseById(id: string): Exercise | null {
  return EXERCISE_MAP.get(id) || null;
}

/** Get the input mode for an exercise (defaults to weight_reps) */
export function getInputMode(id: string): InputMode {
  const ex = EXERCISE_MAP.get(id);
  return ex?.inputMode ?? 'weight_reps';
}

/** Backward-compatible lookup: tries id first, then old name, then current name */
export function getExerciseInfo(nameOrId: string): Exercise | null {
  return EXERCISE_MAP.get(nameOrId) || EXERCISE_BY_NAME.get(nameOrId) || null;
}

/** Get primary category (muscle group) for display */
export function getExerciseMuscleGroup(nameOrId: string): string {
  const ex = getExerciseInfo(nameOrId);
  return ex?.category || 'Otro';
}

/** Resolve an id or old name to the canonical id */
export function resolveExerciseId(nameOrId: string): string {
  if (EXERCISE_MAP.has(nameOrId)) return nameOrId;
  return NAME_TO_ID[nameOrId] || nameOrId;
}

/** Resolve to display name */
export function resolveExerciseName(nameOrId: string): string {
  const ex = getExerciseInfo(nameOrId);
  return ex?.name || nameOrId;
}

/** Search with optional filters */
export interface ExerciseFilters {
  category?: Category;
  equipment?: Equipment;
  type?: MovementType;
  difficulty?: Difficulty;
}

/** Strip accents for accent-insensitive search */
function norm(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function searchExercises(query?: string | null, filters?: ExerciseFilters): Exercise[] {
  let results = EXERCISE_DB;

  if (filters) {
    if (filters.category) results = results.filter(e => e.category === filters.category);
    if (filters.equipment) results = results.filter(e => e.equipment === filters.equipment);
    if (filters.type) results = results.filter(e => e.type === filters.type);
    if (filters.difficulty) results = results.filter(e => e.difficulty === filters.difficulty);
  }

  if (query && query.trim()) {
    const q = norm(query.trim());
    results = results.filter(e =>
      norm(e.name).includes(q) ||
      norm(e.category).includes(q) ||
      norm(e.muscle_primary).includes(q) ||
      e.muscle_secondary.some(m => norm(m).includes(q)) ||
      norm(e.equipment).includes(q)
    );
  }

  return results;
}

/** Get exercises by category */
export function getExercisesByCategory(cat: Category): Exercise[] {
  return EXERCISE_DB.filter(e => e.category === cat);
}

/** @deprecated Use getExercisesByCategory. Kept for backward compat */
export function getExercisesByMuscle(muscle: Category): Exercise[] {
  return getExercisesByCategory(muscle);
}

/** @deprecated Use category-based filtering */
export function getExercisesByZone(zone: Zone): Exercise[] {
  const cats = ZONE_MUSCLES[zone] || [];
  return EXERCISE_DB.filter(e => cats.includes(e.category));
}
