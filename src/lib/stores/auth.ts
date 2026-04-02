import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const authLoading = writable(true);

// Initialize auth state — handles OAuth redirects too
export async function initAuth() {
	// First check if we're returning from an OAuth redirect
	if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
		// Supabase will automatically pick up the hash
		// Wait a moment for it to process
		await new Promise(resolve => setTimeout(resolve, 500));
	}

	const { data } = await supabase.auth.getSession();
	session.set(data.session);
	user.set(data.session?.user ?? null);
	authLoading.set(false);

	// If we got a session from OAuth redirect, set onboarded and clean URL
	if (data.session && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
		localStorage.setItem('gym_onboarded', 'true');
		// Clean the URL hash
		window.history.replaceState(null, '', window.location.pathname);
	}

	// Listen for future auth changes
	supabase.auth.onAuthStateChange((_event, s) => {
		session.set(s);
		user.set(s?.user ?? null);
		if (s?.user && typeof localStorage !== 'undefined') {
			localStorage.setItem('gym_onboarded', 'true');
		}
	});
}

// Sign up with email
export async function signUp(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) throw error;
	return data;
}

// Sign in with email
export async function signIn(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
	if (data.session) {
		localStorage.setItem('gym_onboarded', 'true');
	}
	return data;
}

// Sign in with Google
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

// Sign out
export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

// Reset password
export async function resetPassword(email: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`
	});
	if (error) throw error;
}
