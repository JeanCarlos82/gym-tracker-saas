import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const authLoading = writable(true);

// Initialize auth state
export async function initAuth() {
	const { data } = await supabase.auth.getSession();
	session.set(data.session);
	user.set(data.session?.user ?? null);
	authLoading.set(false);

	// Listen for auth changes
	supabase.auth.onAuthStateChange((_event, s) => {
		session.set(s);
		user.set(s?.user ?? null);
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
	return data;
}

// Sign in with Google
export async function signInWithGoogle() {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: { redirectTo: window.location.origin }
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
		redirectTo: `${window.location.origin}/reset-password`
	});
	if (error) throw error;
}
