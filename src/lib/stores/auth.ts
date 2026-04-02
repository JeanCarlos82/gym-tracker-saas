import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

export const user = writable<User | null>(null);

export async function initAuth(): Promise<void> {
	try {
		const { data } = await supabase.auth.getSession();
		if (data.session?.user) {
			user.set(data.session.user);
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('gym_onboarded', 'true');
			}
		}
	} catch (e) {
		console.error('initAuth error:', e);
	}

	// Listen for changes (OAuth callback, logout, etc)
	supabase.auth.onAuthStateChange((_event, s) => {
		user.set(s?.user ?? null);
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
