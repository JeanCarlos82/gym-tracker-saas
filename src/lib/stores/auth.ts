import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

export const user = writable<User | null>(null);

// Register auth listener once at module load
supabase.auth.onAuthStateChange((_event, session) => {
	user.set(session?.user ?? null);
});

export async function initAuth(): Promise<void> {
	// getSession() awaits _initialize() which handles PKCE code exchange.
	// 15s timeout as safety net (PKCE exchange needs time but shouldn't hang forever).
	try {
		const result = await Promise.race([
			supabase.auth.getSession(),
			new Promise<null>(r => setTimeout(() => r(null), 15000))
		]);
		if (result && 'data' in result && result.data.session?.user) {
			user.set(result.data.session.user);
		}
	} catch (_) {}
}

export async function signUp(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) throw error;
	return data;
}

export async function signIn(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
	if (data.session) localStorage.setItem('gym_onboarded', 'true');
	return data;
}

export async function signInWithGoogle() {
	const { error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : '' }
	});
	if (error) throw error;
}

export async function signOut() {
	await supabase.auth.signOut();
	user.set(null);
}

export async function resetPassword(email: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(email);
	if (error) throw error;
}
