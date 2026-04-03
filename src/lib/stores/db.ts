import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './auth';
import type { GymSet, WeightEntry, CardioEntry, Entry, Session, ExerciseRef, DayRoutine, Routine, Profile, BodyWeightRecord, Database } from '$lib/data/types';
export type { GymSet, WeightEntry, CardioEntry, Entry, Session, ExerciseRef, DayRoutine, Routine, Profile, BodyWeightRecord, Database };

// ── Defaults ──
const DEFAULT_ROUTINE: Routine = {
	lunes: { label: '', rest: true, exercises: [] }, martes: { label: '', rest: true, exercises: [] },
	miercoles: { label: '', rest: true, exercises: [] }, jueves: { label: '', rest: true, exercises: [] },
	viernes: { label: '', rest: true, exercises: [] }, sabado: { label: '', rest: true, exercises: [] },
	domingo: { label: '', rest: true, exercises: [] },
};
const DEFAULT_PROFILE: Profile = { name: '', age: '', sex: 'H', height: '', weight: '', weightUnit: 'kg', heightUnit: 'cm', restTimerSeconds: 90, activityLevel: 2 };
const DEFAULT_DB: Database = { routine: DEFAULT_ROUTINE, sessions: [], profile: DEFAULT_PROFILE, objective: 'hipertrofia', bw: [] };

// ── Local storage helpers ──
function loadLocal(): Database {
	if (typeof localStorage === 'undefined') return { ...DEFAULT_DB };
	try {
		return {
			routine: JSON.parse(localStorage.getItem('gym_routine') || 'null') || DEFAULT_ROUTINE,
			sessions: JSON.parse(localStorage.getItem('gym_sessions') || '[]') || [],
			profile: JSON.parse(localStorage.getItem('gym_profile') || 'null') || DEFAULT_PROFILE,
			objective: localStorage.getItem('gym_objective') || 'hipertrofia',
			bw: JSON.parse(localStorage.getItem('gym_bw') || '[]') || [],
		};
	} catch (e) {
		console.warn('Failed to load from localStorage:', e);
		return { ...DEFAULT_DB };
	}
}

function persistLocal(key: string, value: unknown) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
	} catch (e) {
		console.warn('Failed to persist to localStorage:', e);
	}
}

// ── Supabase helpers ──
function getUserId(): string | null {
	const u = get(user);
	return u?.id ?? null;
}

async function loadFromSupabase(userId: string): Promise<Database> {
	try {
		const [profileRes, routineRes, sessionsRes, bwRes] = await Promise.all([
			supabase.from('profiles').select('*').eq('id', userId).single(),
			supabase.from('routines').select('data').eq('user_id', userId).single(),
			supabase.from('sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
			supabase.from('body_weight').select('*').eq('user_id', userId).order('date', { ascending: true }),
		]);

		const p = profileRes.data;
		const profile: Profile = p ? {
			name: p.name || '', age: p.age || '', sex: (p.sex as 'H' | 'M') || 'H',
			height: p.height || '', weight: p.weight || '',
			weightUnit: (p.weight_unit as 'kg' | 'lb') || 'kg',
			heightUnit: (p.height_unit as 'cm' | 'ft') || 'cm',
			restTimerSeconds: p.rest_timer_seconds || 90, activityLevel: p.activity_level ?? 2,
		} : DEFAULT_PROFILE;

		const routine: Routine = routineRes.data?.data || DEFAULT_ROUTINE;

		const sessions: Session[] = (sessionsRes.data || []).map((s: { date: string; day_key: string; start_time: string; end_time: string; entries: Entry[] }) => ({
			date: s.date, dayKey: s.day_key, startTime: s.start_time,
			endTime: s.end_time, entries: s.entries || [],
		}));

		const bw: BodyWeightRecord[] = (bwRes.data || []).map((b: { date: string; value: number }) => ({ date: b.date, v: b.value }));

		return { routine, sessions, profile, objective: p?.objective || 'hipertrofia', bw };
	} catch (e) {
		console.error('Failed to load from Supabase:', e);
		return loadLocal();
	}
}

// ── Main Store ──
function createDB() {
	const { subscribe, set, update } = writable<Database>(loadLocal());

	return {
		subscribe, set, update,

		async init() {
			const userId = getUserId();
			if (userId) {
				try {
					const data = await Promise.race([
						loadFromSupabase(userId),
						new Promise<Database>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
					]);
					set(data);
				} catch (e) {
					console.warn('Cloud load timeout, using local data:', e);
					set(loadLocal());
				}
			} else {
				set(loadLocal());
			}
		},

		async saveRoutine(routine: Routine) {
			update(db => ({ ...db, routine }));
			persistLocal('gym_routine', routine);
			const userId = getUserId();
			if (userId) {
				try {
					await supabase.from('routines').upsert({
						user_id: userId, data: routine, updated_at: new Date().toISOString()
					}, { onConflict: 'user_id' });
				} catch (e) { console.error('Failed to save routine to cloud:', e); }
			}
		},

		async saveProfile(profile: Profile) {
			update(db => ({ ...db, profile }));
			persistLocal('gym_profile', profile);
			const userId = getUserId();
			if (userId) {
				try {
					await supabase.from('profiles').update({
						name: profile.name, age: profile.age, sex: profile.sex,
						height: profile.height, weight: profile.weight,
						weight_unit: profile.weightUnit || 'kg',
						height_unit: profile.heightUnit || 'cm',
						rest_timer_seconds: profile.restTimerSeconds,
						activity_level: profile.activityLevel,
						updated_at: new Date().toISOString()
					}).eq('id', userId);
				} catch (e) { console.error('Failed to save profile to cloud:', e); }
			}
		},

		async saveObjective(objective: string) {
			update(db => ({ ...db, objective }));
			persistLocal('gym_objective', objective);
			const userId = getUserId();
			if (userId) {
				try {
					await supabase.from('profiles').update({ objective }).eq('id', userId);
				} catch (e) { console.error('Failed to save objective to cloud:', e); }
			}
		},

		async addSession(sess: Session) {
			update(db => {
				const sessions = [...db.sessions];
				const idx = sessions.findIndex(s => s.date === sess.date);
				if (idx >= 0) sessions[idx] = sess;
				else sessions.push(sess);
				return { ...db, sessions };
			});
			const currentData = get({ subscribe });
			persistLocal('gym_sessions', currentData.sessions);
			const userId = getUserId();
			if (userId) {
				try {
					// Use upsert-like approach: delete then insert to avoid race conditions
					await supabase.from('sessions').delete().eq('user_id', userId).eq('date', sess.date);
					await supabase.from('sessions').insert({
						user_id: userId, date: sess.date, day_key: sess.dayKey,
						start_time: sess.startTime, end_time: sess.endTime, entries: sess.entries
					});
				} catch (e) { console.error('Failed to save session to cloud:', e); }
			}
		},

		async saveSessions(sessions: Session[]) {
			update(db => ({ ...db, sessions }));
			persistLocal('gym_sessions', sessions);
			// Sync changed sessions to cloud
			const userId = getUserId();
			if (userId) {
				try {
					const todayStr = new Date().toISOString().split('T')[0];
					const todaySession = sessions.find(s => s.date === todayStr);
					if (todaySession) {
						await supabase.from('sessions').delete().eq('user_id', userId).eq('date', todayStr);
						await supabase.from('sessions').insert({
							user_id: userId, date: todaySession.date, day_key: todaySession.dayKey,
							start_time: todaySession.startTime, end_time: todaySession.endTime,
							entries: todaySession.entries
						});
					}
				} catch (e) { console.error('Failed to sync sessions to cloud:', e); }
			}
		},

		async saveBW(bw: BodyWeightRecord[]) {
			update(db => ({ ...db, bw }));
			persistLocal('gym_bw', bw);
			const userId = getUserId();
			if (userId) {
				try {
					await supabase.from('body_weight').delete().eq('user_id', userId);
					if (bw.length) {
						await supabase.from('body_weight').insert(
							bw.map(b => ({ user_id: userId, date: b.date, value: b.v }))
						);
					}
				} catch (e) { console.error('Failed to save body weight to cloud:', e); }
			}
		},

		setOnboarded() {
			if (typeof localStorage !== 'undefined') localStorage.setItem('gym_onboarded', 'true');
		},

		isOnboarded(): boolean {
			if (typeof localStorage === 'undefined') return false;
			return !!localStorage.getItem('gym_onboarded');
		},

		reload() { set(loadLocal()); },

		exportData(): string {
			const data = get({ subscribe });
			return JSON.stringify({
				routine: data.routine, sessions: data.sessions, profile: data.profile,
				objective: data.objective, bw: data.bw, exported: new Date().toISOString()
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
			} catch { return false; }
		},

		async deleteAllCloud() {
			const userId = getUserId();
			if (!userId) return;
			// DELETE sessions & body_weight (have DELETE RLS policies)
			const [r1, r2] = await Promise.all([
				supabase.from('sessions').delete().eq('user_id', userId),
				supabase.from('body_weight').delete().eq('user_id', userId),
			]);
			if (r1.error) console.error('Delete sessions failed:', r1.error);
			if (r2.error) console.error('Delete body_weight failed:', r2.error);
			// UPDATE routines & profile to defaults (may not have DELETE policy)
			const [r3, r4] = await Promise.all([
				supabase.from('routines').update({ data: DEFAULT_ROUTINE, updated_at: new Date().toISOString() }).eq('user_id', userId),
				supabase.from('profiles').update({
					name: '', age: '', sex: 'H', height: '', weight: '',
					weight_unit: 'kg', height_unit: 'cm', rest_timer_seconds: 90,
					activity_level: 2, objective: 'hipertrofia',
					updated_at: new Date().toISOString()
				}).eq('id', userId),
			]);
			if (r3.error) console.error('Reset routines failed:', r3.error);
			if (r4.error) console.error('Reset profile failed:', r4.error);
		},

		// Migrate local data to cloud after first login
		async migrateToCloud() {
			const userId = getUserId();
			if (!userId) return;
			const local = loadLocal();
			const hasData = local.sessions.length > 0 || Object.values(local.routine).some(d => d.exercises?.length > 0);
			if (!hasData) return;

			try {
				await this.saveProfile(local.profile);
				await this.saveRoutine(local.routine);
				await this.saveObjective(local.objective);
				await this.saveBW(local.bw);
				for (const sess of local.sessions) {
					await this.addSession(sess);
				}
				// Clear local data after successful migration to prevent duplicates
				localStorage.removeItem('gym_sessions');
				localStorage.removeItem('gym_routine');
				localStorage.removeItem('gym_profile');
				localStorage.removeItem('gym_objective');
				localStorage.removeItem('gym_bw');
			} catch (e) {
				console.error('Migration failed:', e);
			}
		}
	};
}

export const db = createDB();

// ── Derived stores (independent of db — only depend on current date) ──
const _today = () => new Date().toISOString().split('T')[0];
const _todayDK = () => {
	const DK = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
	return DK[new Date().getDay()];
};
export const todayDate = writable(_today());
export const todayDayKey = writable(_todayDK());
// Refresh at midnight
if (typeof window !== 'undefined') {
	setInterval(() => { todayDate.set(_today()); todayDayKey.set(_todayDK()); }, 60000);
}
export const todayRoutine = derived([db, todayDayKey], ([$db, $dk]) => $db.routine[$dk] || { label: '', rest: true, exercises: [] });
export const todaySession = derived([db, todayDate], ([$db, $date]) => $db.sessions.find(s => s.date === $date) || null);
