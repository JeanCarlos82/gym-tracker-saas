import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './auth';

// ── Types ──
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

// ── Defaults ──
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

// ── Local storage helpers (fallback when not logged in) ──
function loadLocal(): Database {
	if (typeof localStorage === 'undefined') {
		return { routine: DEFAULT_ROUTINE, sessions: [], profile: DEFAULT_PROFILE, objective: 'hipertrofia', bw: [] };
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
		return { routine: DEFAULT_ROUTINE, sessions: [], profile: DEFAULT_PROFILE, objective: 'hipertrofia', bw: [] };
	}
}

function persistLocal(key: string, value: unknown) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

// ── Supabase sync helpers ──
async function getUserId(): Promise<string | null> {
	const u = get(user);
	return u?.id ?? null;
}

async function loadFromSupabase(userId: string): Promise<Database> {
	const [profileRes, routineRes, sessionsRes, bwRes] = await Promise.all([
		supabase.from('profiles').select('*').eq('id', userId).single(),
		supabase.from('routines').select('data').eq('user_id', userId).single(),
		supabase.from('sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
		supabase.from('body_weight').select('*').eq('user_id', userId).order('date', { ascending: true }),
	]);

	const p = profileRes.data;
	const profile: Profile = p ? {
		name: p.name || '',
		age: p.age || '',
		sex: (p.sex as 'H' | 'M') || 'H',
		height: p.height || '',
		weight: p.weight || '',
		restTimerSeconds: p.rest_timer_seconds || 90,
		activityLevel: p.activity_level ?? 2,
	} : DEFAULT_PROFILE;

	const routine: Routine = routineRes.data?.data || DEFAULT_ROUTINE;

	const sessions: Session[] = (sessionsRes.data || []).map((s: any) => ({
		date: s.date,
		dayKey: s.day_key,
		startTime: s.start_time,
		endTime: s.end_time,
		entries: s.entries || [],
	}));

	const bw: BodyWeightRecord[] = (bwRes.data || []).map((b: any) => ({
		date: b.date,
		v: b.value,
	}));

	return { routine, sessions, profile, objective: p?.objective || 'hipertrofia', bw };
}

// ── Main Store ──
function createDB() {
	const initial = loadLocal();
	const { subscribe, set, update } = writable<Database>(initial);

	let isCloud = false;

	return {
		subscribe,
		set,
		update,

		async init() {
			const userId = await getUserId();
			if (userId) {
				isCloud = true;
				const data = await loadFromSupabase(userId);
				set(data);
			} else {
				isCloud = false;
				set(loadLocal());
			}
		},

		async saveRoutine(routine: Routine) {
			update(db => { db.routine = routine; return db; });
			persistLocal('gym_routine', routine);
			const userId = await getUserId();
			if (userId) {
				await supabase.from('routines').upsert({
					user_id: userId,
					data: routine,
					updated_at: new Date().toISOString()
				}, { onConflict: 'user_id' });
			}
		},

		async saveProfile(profile: Profile) {
			update(db => { db.profile = profile; return db; });
			persistLocal('gym_profile', profile);
			const userId = await getUserId();
			if (userId) {
				await supabase.from('profiles').update({
					name: profile.name,
					age: profile.age,
					sex: profile.sex,
					height: profile.height,
					weight: profile.weight,
					rest_timer_seconds: profile.restTimerSeconds,
					activity_level: profile.activityLevel,
					updated_at: new Date().toISOString()
				}).eq('id', userId);
			}
		},

		async saveObjective(objective: string) {
			update(db => { db.objective = objective; return db; });
			persistLocal('gym_objective', objective);
			const userId = await getUserId();
			if (userId) {
				await supabase.from('profiles').update({ objective }).eq('id', userId);
			}
		},

		async addSession(sess: Session) {
			update(db => {
				const idx = db.sessions.findIndex(s => s.date === sess.date);
				if (idx >= 0) db.sessions[idx] = sess;
				else db.sessions.push(sess);
				return db;
			});
			persistLocal('gym_sessions', get({ subscribe }).sessions);
			const userId = await getUserId();
			if (userId) {
				// Upsert by user_id + date
				const existing = await supabase.from('sessions')
					.select('id').eq('user_id', userId).eq('date', sess.date).single();
				if (existing.data) {
					await supabase.from('sessions').update({
						day_key: sess.dayKey,
						start_time: sess.startTime,
						end_time: sess.endTime,
						entries: sess.entries,
						updated_at: new Date().toISOString()
					}).eq('id', existing.data.id);
				} else {
					await supabase.from('sessions').insert({
						user_id: userId,
						date: sess.date,
						day_key: sess.dayKey,
						start_time: sess.startTime,
						end_time: sess.endTime,
						entries: sess.entries
					});
				}
			}
		},

		async saveSessions(sessions: Session[]) {
			update(db => { db.sessions = sessions; return db; });
			persistLocal('gym_sessions', sessions);
		},

		async saveBW(bw: BodyWeightRecord[]) {
			update(db => { db.bw = bw; return db; });
			persistLocal('gym_bw', bw);
			const userId = await getUserId();
			if (userId) {
				// Delete all and re-insert
				await supabase.from('body_weight').delete().eq('user_id', userId);
				if (bw.length) {
					await supabase.from('body_weight').insert(
						bw.map(b => ({ user_id: userId, date: b.date, value: b.v }))
					);
				}
			}
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
			set(loadLocal());
		},

		exportData(): string {
			const data = get({ subscribe });
			return JSON.stringify({
				routine: data.routine,
				sessions: data.sessions,
				profile: data.profile,
				objective: data.objective,
				bw: data.bw,
				exported: new Date().toISOString()
			}, null, 2);
		},

		importData(json: string): boolean {
			try {
				const d = JSON.parse(json);
				if (d.sessions) persistLocal('gym_sessions', d.sessions);
				if (d.routine) persistLocal('gym_routine', d.routine);
				if (d.profile) persistLocal('gym_profile', d.profile);
				if (d.objective) persistLocal('gym_objective', d.objective);
				if (d.bw) persistLocal('gym_bw', d.bw);
				set(loadLocal());
				return true;
			} catch {
				return false;
			}
		},

		// Migrate local data to cloud after first login
		async migrateToCloud() {
			const userId = await getUserId();
			if (!userId) return;
			const local = loadLocal();
			if (local.sessions.length > 0 || Object.values(local.routine).some(d => d.exercises?.length > 0)) {
				await this.saveProfile(local.profile);
				await this.saveRoutine(local.routine);
				await this.saveObjective(local.objective);
				await this.saveBW(local.bw);
				for (const sess of local.sessions) {
					await this.addSession(sess);
				}
			}
		}
	};
}

export const db = createDB();

// ── Derived stores ──
export const todayDate = derived(db, () => new Date().toISOString().split('T')[0]);

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
