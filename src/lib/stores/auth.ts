import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

export const user = writable<User | null>(null);

export async function initAuth(): Promise<void> {
	// Check if this is an OAuth callback (has code or hash token)
	const isCallback = typeof window !== 'undefined' &&
		(window.location.search.includes('code=') ||
		 window.location.hash.includes('access_token'));

	return new Promise<void>((resolve) => {
		let resolved = false;
		const done = () => { if (!resolved) { resolved = true; resolve(); } };

		// Listen for auth state changes — this handles OAuth callbacks too
		supabase.auth.onAuthStateChange((event, session) => {
			user.set(session?.user ?? null);
			if (session?.user && typeof localStorage !== 'undefined') {
				localStorage.setItem('gym_onboarded', 'true');
			}
			// On OAuth callback, wait for SIGNED_IN event specifically
			if (isCallback) {
				if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
					done();
				}
			} else {
				done();
			}
		});

		// Also try getSession for cached sessions
		supabase.auth.getSession().then(({ data }) => {
			if (data.session?.user) {
				user.set(data.session.user);
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('gym_onboarded', 'true');
				}
			}
			if (!isCallback) done();
		}).catch(() => done());

		// Timeout fallback — never hang forever
		setTimeout(done, 5000);
	});
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
