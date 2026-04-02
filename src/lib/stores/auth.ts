import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const authLoading = writable(true);

let authListenerRegistered = false;

// Initialize auth state — handles OAuth redirects too
export async function initAuth() {
	// Use onAuthStateChange to reliably detect OAuth callbacks
	// instead of fragile hash checking with setTimeout
	if (!authListenerRegistered) {
		authListenerRegistered = true;
		supabase.auth.onAuthStateChange((_event, s) => {
			session.set(s);
			user.set(s?.user ?? null);
			if (s?.user && typeof localStorage !== 'undefined') {
				localStorage.setItem('gym_onboarded', 'true');
			}
		});
	}

	const { data } = await supabase.auth.getSession();
	session.set(data.session);
	user.set(data.session?.user ?? null);
	authLoading.set(false);
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

// Sign out — clears stores explicitly
export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
	user.set(null);
	session.set(null);
}

// Reset password
export async function resetPassword(email: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}`
	});
	if (error) throw error;
}
