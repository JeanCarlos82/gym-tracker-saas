import { writable, derived } from 'svelte/store';

// Types
export interface GymSet {
	w: number;
	r: number;
	warmup?: boolean;
}

export interface WeightEntry {
	exercise: string;
	type: 'pesas';
	sets: GymSet[];
	unit: string;
	notes?: string;
}

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

export type Entry = WeightEntry | CardioEntry;

export interface Session {
	date: string;
	dayKey: string;
	startTime?: string;
	endTime?: string;
	entries: Entry[];
}

export interface ExerciseRef {
	name: string;
	type: 'pesas' | 'cardio';
}

export interface DayRoutine {
	label: string;
	rest: boolean;
	exercises: ExerciseRef[];
}

export interface Routine {
	[key: string]: DayRoutine;
}

export interface Profile {
	name: string;
	age: string;
	sex: 'H' | 'M';
	height: string;
	weight: string;
	restTimerSeconds: number;
	activityLevel: number;
}

export interface BodyWeightRecord {
	date: string;
	v: number;
}

export interface Database {
	routine: Routine;
	sessions: Session[];
	profile: Profile;
	objective: string;
	bw: BodyWeightRecord[];
}

// Default empty routine
const DEFAULT_ROUTINE: Routine = {
	lunes: { label: '', rest: true, exercises: [] },
	martes: { label: '', rest: true, exercises: [] },
	miercoles: { label: '', rest: true, exercises: [] },
	jueves: { label: '', rest: true, exercises: [] },
	viernes: { label: '', rest: true, exercises: [] },
	sabado: { label: '', rest: true, exercises: [] },
	domingo: { label: '', rest: true, exercises: [] },
};

const DEFAULT_PROFILE: Profile = {
	name: '',
	age: '',
	sex: 'H',
	height: '',
	weight: '',
	restTimerSeconds: 90,
	activityLevel: 2,
};

// Load from localStorage
function loadDB(): Database {
	if (typeof localStorage === 'undefined') {
		return {
			routine: DEFAULT_ROUTINE,
			sessions: [],
			profile: DEFAULT_PROFILE,
			objective: 'hipertrofia',
			bw: [],
		};
	}
	try {
		return {
			routine: JSON.parse(localStorage.getItem('gym_routine') || 'null') || DEFAULT_ROUTINE,
			sessions: JSON.parse(localStorage.getItem('gym_sessions') || '[]') || [],
			profile: JSON.parse(localStorage.getItem('gym_profile') || 'null') || DEFAULT_PROFILE,
			objective: localStorage.getItem('gym_objective') || 'hipertrofia',
			bw: JSON.parse(localStorage.getItem('gym_bw') || '[]') || [],
		};
	} catch {
		return {
			routine: DEFAULT_ROUTINE,
			sessions: [],
			profile: DEFAULT_PROFILE,
			objective: 'hipertrofia',
			bw: [],
		};
	}
}

// Persist to localStorage
function persist(key: string, value: unknown) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

// Create the main store
function createDB() {
	const initial = loadDB();
	const { subscribe, set, update } = writable<Database>(initial);

	return {
		subscribe,
		set,
		update,

		// Persist helpers
		saveRoutine(routine: Routine) {
			update(db => {
				db.routine = routine;
				persist('gym_routine', routine);
				return db;
			});
		},

		saveSessions(sessions: Session[]) {
			update(db => {
				db.sessions = sessions;
				persist('gym_sessions', sessions);
				return db;
			});
		},

		saveProfile(profile: Profile) {
			update(db => {
				db.profile = profile;
				persist('gym_profile', profile);
				return db;
			});
		},

		saveObjective(objective: string) {
			update(db => {
				db.objective = objective;
				persist('gym_objective', objective);
				return db;
			});
		},

		saveBW(bw: BodyWeightRecord[]) {
			update(db => {
				db.bw = bw;
				persist('gym_bw', bw);
				return db;
			});
		},

		addSession(session: Session) {
			update(db => {
				const existing = db.sessions.findIndex(s => s.date === session.date);
				if (existing >= 0) {
					db.sessions[existing] = session;
				} else {
					db.sessions.push(session);
				}
				persist('gym_sessions', db.sessions);
				return db;
			});
		},

		setOnboarded() {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('gym_onboarded', 'true');
			}
		},

		isOnboarded(): boolean {
			if (typeof localStorage === 'undefined') return false;
			return !!localStorage.getItem('gym_onboarded');
		},

		reload() {
			set(loadDB());
		},

		exportData(): string {
			const db = loadDB();
			return JSON.stringify({
				routine: db.routine,
				sessions: db.sessions,
				profile: db.profile,
				objective: db.objective,
				bw: db.bw,
				exported: new Date().toISOString()
			}, null, 2);
		},

		importData(json: string): boolean {
			try {
				const d = JSON.parse(json);
				if (d.sessions) persist('gym_sessions', d.sessions);
				if (d.routine) persist('gym_routine', d.routine);
				if (d.profile) persist('gym_profile', d.profile);
				if (d.objective) persist('gym_objective', d.objective);
				if (d.bw) persist('gym_bw', d.bw);
				set(loadDB());
				return true;
			} catch {
				return false;
			}
		}
	};
}

export const db = createDB();

// Derived stores for common queries
export const todayDate = derived(db, () => {
	const d = new Date();
	return d.toISOString().split('T')[0];
});

export const todayDayKey = derived(db, () => {
	const DK = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
	return DK[new Date().getDay()];
});

export const todayRoutine = derived([db, todayDayKey], ([$db, $dk]) => {
	return $db.routine[$dk] || { label: '', rest: true, exercises: [] };
});

export const todaySession = derived([db, todayDate], ([$db, $date]) => {
	return $db.sessions.find(s => s.date === $date) || null;
});
