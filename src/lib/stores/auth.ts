import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const authReady = writable(false);

let initialized = false;

export async function initAuth(): Promise<void> {
	if (initialized) {
		authReady.set(true);
		return;
	}
	initialized = true;

	try {
		// Get current session (works for both normal load and OAuth redirect)
		const { data, error } = await supabase.auth.getSession();

		if (data.session) {
			session.set(data.session);
			user.set(data.session.user);
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('gym_onboarded', 'true');
			}
		}

		// Listen for future auth changes (login, logout, token refresh)
		supabase.auth.onAuthStateChange((event, s) => {
			session.set(s);
			user.set(s?.user ?? null);
			if (s?.user && typeof localStorage !== 'undefined') {
				localStorage.setItem('gym_onboarded', 'true');
			}
			// If this is the OAuth callback completing, reload the page
			if (event === 'SIGNED_IN' && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
				window.history.replaceState(null, '', window.location.pathname);
				window.location.reload();
			}
		});
	} catch (e) {
		console.error('Auth init failed:', e);
	}

	authReady.set(true);
}

export async function signUp(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) throw error;
	return data;
}

export async function signIn(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
	if (data.session) {
		localStorage.setItem('gym_onboarded', 'true');
	}
	return data;
}

export async function signInWithGoogle() {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: typeof window !== 'undefined' ? window.location.origin : ''
		}
	});
	if (error) throw error;
	return data;
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
	user.set(null);
	session.set(null);
}

export async function resetPassword(email: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}`
	});
	if (error) throw error;
}
