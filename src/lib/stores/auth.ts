import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

export const user = writable<User | null>(null);

export async function initAuth(): Promise<void> {
	// Detect OAuth callback (tokens in URL hash or code in query)
	const hasAuthCallback = typeof window !== 'undefined' &&
		(window.location.hash.includes('access_token') ||
		 window.location.search.includes('code='));

	// Use a promise to wait for the first auth state event
	const firstEvent = new Promise<void>((resolve) => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			user.set(session?.user ?? null);
			resolve();
		});
		// Store subscription for potential cleanup
		void subscription;
	});

	if (hasAuthCallback) {
		// OAuth redirect: wait for Supabase to process tokens (max 4s)
		await Promise.race([
			firstEvent,
			new Promise<void>(r => setTimeout(r, 4000))
		]);
		// Clean URL after OAuth processing
		if (typeof window !== 'undefined') {
			window.history.replaceState({}, '', window.location.pathname);
		}
	} else {
		// Normal visit: get cached session with timeout (mobile can hang)
		try {
			const sessionPromise = supabase.auth.getSession();
			const { data } = await Promise.race([
				sessionPromise,
				new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
			]);
			if (data.session?.user) {
				user.set(data.session.user);
			}
		} catch (e) {
			console.error('initAuth error:', e);
		}
		// Also wait for the listener to fire (max 1s)
		await Promise.race([
			firstEvent,
			new Promise<void>(r => setTimeout(r, 1000))
		]);
	}
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
