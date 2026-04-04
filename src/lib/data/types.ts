// ── Data model types for the gym app ──

/** A single set within a weight exercise entry */
export interface GymSet {
  w: number;
  r: number;
  warmup?: boolean;
}
/** @deprecated Use GymSet instead */
export type WorkingSet = GymSet;

/** A weight-training entry logged for one exercise */
export interface WeightEntry {
  exercise: string;
  type: 'pesas';
  sets: GymSet[];
  unit: string;
  notes?: string;
}

/** A cardio entry logged for one exercise */
export interface CardioEntry {
  exercise: string;
  type: 'cardio';
  min: number;
  intensity: 'baja' | 'media' | 'alta';
  km: number;
  cal: number;
  calEstimated?: boolean;
  notes?: string;
}

/** Union of all entry types in a session */
export type Entry = WeightEntry | CardioEntry;

/** A training session for a single day */
export interface Session {
  date: string;            // ISO date string YYYY-MM-DD
  dayKey: string;          // e.g. "lunes"
  entries: Entry[];
  startTime?: string;      // ISO datetime
  endTime?: string;        // ISO datetime
}

/** Reference to an exercise inside a routine day */
export interface ExerciseRef {
  id: string;
  name: string;
  type: 'pesas' | 'cardio';
}

/** A single day's routine configuration */
export interface DayRoutine {
  label: string;
  rest: boolean;
  exercises: ExerciseRef[];
}

/** Weekly routine keyed by Spanish day names (no accents) */
export type Routine = Record<string, DayRoutine>;

/** User profile */
export interface Profile {
  name: string;
  age: string;
  sex: 'H' | 'M';
  height: string;
  weight: string;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'ft';
  restTimerSeconds: number;
  activityLevel: number;
}

/** A body-weight measurement */
export interface BodyWeightRecord {
  date: string;   // ISO date YYYY-MM-DD
  v: number;      // weight in kg
}
/** @deprecated Use BodyWeightRecord instead */
export type BodyWeight = BodyWeightRecord;

/** Training objective */
export type Objective = 'fuerza' | 'hipertrofia' | 'resistencia';

/** Objective rep/set prescription */
export interface ObjectivePrescription {
  reps: string;
  series: string;
}

/** IMC classification bracket */
export interface ImcCategory {
  max: number;
  label: string;
  color: string;
}

/** The top-level database shape persisted in storage */
export interface Database {
  routine: Routine;
  sessions: Session[];
  profile: Profile;
  objective: string;
  bw: BodyWeightRecord[];
}

/** Set count breakdown returned by entrySetCount */
export interface SetCountResult {
  working: number;
  warmup: number;
  total: number;
}

/** Smart suggestion returned by smartSuggestion */
export interface SmartSuggestionResult {
  weight: number;
  msg: string;
  reason: string;
  color: 'g' | 'o' | 'b';
}

/** Linear regression result */
export interface LinearRegressionResult {
  slope: number;
  intercept: number;
}

/** Plateau detection result */
export interface PlateauResult {
  isPlateaued: boolean;
  sessionsStuck: number;
}

/** Week range result from getWeekRange */
export interface WeekRange {
  start: Date;
  end: Date;
  key: string;
}
