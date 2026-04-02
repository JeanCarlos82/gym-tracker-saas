import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const authLoading = writable(true);

let authListenerRegistered = false;

export async function initAuth() {
	// Register listener once — this catches OAuth redirects AND future auth changes
	if (!authListenerRegistered) {
		authListenerRegistered = true;
		supabase.auth.onAuthStateChange((_event, s) => {
			session.set(s);
			user.set(s?.user ?? null);
			authLoading.set(false);
			if (s?.user && typeof localStorage !== 'undefined') {
				localStorage.setItem('gym_onboarded', 'true');
			}
		});
	}

	// Check if returning from OAuth redirect (hash contains token)
	const isOAuthReturn = typeof window !== 'undefined' && window.location.hash.includes('access_token');

	if (isOAuthReturn) {
		// Wait for Supabase to process the hash token via onAuthStateChange
		// The listener above will fire and set user/session/authLoading
		await new Promise<void>((resolve) => {
			const checkInterval = setInterval(() => {
				const currentUser = get(user);
				if (currentUser) {
					clearInterval(checkInterval);
					// Clean the URL hash
					window.history.replaceState(null, '', window.location.pathname);
					resolve();
				}
			}, 100);
			// Timeout after 5 seconds to prevent infinite wait
			setTimeout(() => {
				clearInterval(checkInterval);
				authLoading.set(false);
				resolve();
			}, 5000);
		});
	} else {
		// Normal load — just get existing session
		const { data } = await supabase.auth.getSession();
		session.set(data.session);
		user.set(data.session?.user ?? null);
		authLoading.set(false);
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
