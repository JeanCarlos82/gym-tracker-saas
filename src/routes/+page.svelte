<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { db } from '$lib/stores/db';
	import { user, initAuth } from '$lib/stores/auth';
	import Nav from '$lib/components/Nav.svelte';
	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import ViewHoy from '$lib/components/ViewHoy.svelte';
	import ViewProgreso from '$lib/components/ViewProgreso.svelte';
	import ViewHistorial from '$lib/components/ViewHistorial.svelte';
	import ViewPerfil from '$lib/components/ViewPerfil.svelte';
	import ExerciseModal from '$lib/components/ExerciseModal.svelte';
	import Wizard from '$lib/components/Wizard.svelte';
	import Auth from '$lib/components/Auth.svelte';

	let activeView = $state('hoy');
	let isOnboarded = $state(false);
	let ready = $state(false);
	let showAuth = $state(false);
	let modalVisible = $state(false);
	let modalExercise = $state('');
	let modalType = $state<'pesas' | 'cardio'>('pesas');
	let wizardVisible = $state(false);
	let toast: Toast;

	function switchView(view: string) { activeView = view; }
	function openModal(name: string, type: 'pesas' | 'cardio') { modalExercise = name; modalType = type; modalVisible = true; }
	function showToast(msg: string) { toast?.show(msg); }
	function onWizardComplete() { isOnboarded = true; wizardVisible = false; }
	function relaunchWizard() { wizardVisible = true; }

	async function onAuthComplete() {
		showAuth = false;
		const u = get(user);
		if (u) {
			await db.init();
			db.setOnboarded();
			isOnboarded = true;
			const data = get(db);
			if (!Object.values(data.routine).some(d => d.exercises?.length > 0)) {
				wizardVisible = true;
			}
		} else {
			if (!db.isOnboarded()) wizardVisible = true;
			else isOnboarded = true;
		}
	}

	let initError = $state('');

	// React to OAuth callback: when user store changes from null to logged in
	let currentUser = $state($user);
	const unsubUser = user.subscribe(v => currentUser = v);
	$effect(() => {
		if (currentUser && showAuth && ready) {
			onAuthComplete();
		}
	});

	onMount(async () => {
		try {
			await initAuth();
		} catch (e) {
			console.error('Auth init failed:', e);
		}

		try {
			const u = get(user);
			isOnboarded = db.isOnboarded();

			if (u) {
				const hadLocalData = db.isOnboarded();
				await db.init();
				if (hadLocalData) {
					await db.migrateToCloud();
				}
				db.setOnboarded();
				isOnboarded = true;
			} else if (!isOnboarded) {
				showAuth = true;
			}
		} catch (e: any) {
			console.error('Init failed:', e);
			initError = e?.message || 'Error al cargar la app';
		}

		ready = true;

		return () => unsubUser();
	});
</script>

{#if initError}
	<div style="position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:20px;">
		<div style="color:#f87171;margin-bottom:8px;">
			<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
		</div>
		<div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:#f2f2f2;">Error al cargar</div>
		<div style="font-family:'DM Mono',monospace;font-size:11px;color:#777;text-align:center;max-width:300px;">{initError}</div>
		<button onclick={() => window.location.reload()} style="background:#E8FF3A;color:#000;border:none;border-radius:12px;padding:12px 24px;font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;cursor:pointer;margin-top:8px;">
			REINTENTAR
		</button>
	</div>
{:else if !ready}
	<div style="position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;">
		<div style="text-align:center;">
			<div style="
				font-family:'Bebas Neue',sans-serif;
				font-size:56px;
				color:#E8FF3A;
				letter-spacing:6px;
				animation:logoGlow 2s ease-in-out infinite;
				text-shadow:0 0 20px rgba(232,255,58,0.4), 0 0 40px rgba(232,255,58,0.15);
			">GYM</div>
			<div style="
				display:flex;
				align-items:center;
				justify-content:center;
				gap:4px;
				margin-top:16px;
				font-family:'DM Mono',monospace;
				font-size:11px;
				color:#444;
				letter-spacing:2px;
			">
				<span style="animation:dotPulse 1.4s ease-in-out infinite 0s;">.</span>
				<span style="animation:dotPulse 1.4s ease-in-out infinite 0.2s;">.</span>
				<span style="animation:dotPulse 1.4s ease-in-out infinite 0.4s;">.</span>
			</div>
		</div>
		{@html `<style>
			@keyframes logoGlow {
				0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(232,255,58,0.4), 0 0 40px rgba(232,255,58,0.15); }
				50% { opacity: 0.85; text-shadow: 0 0 30px rgba(232,255,58,0.6), 0 0 60px rgba(232,255,58,0.25); }
			}
			@keyframes dotPulse {
				0%, 100% { opacity: 0.2; transform: translateY(0); }
				50% { opacity: 1; transform: translateY(-3px); }
			}
		</style>`}
	</div>
{:else}
	{#if showAuth}
		<Auth oncomplete={onAuthComplete} />
	{/if}

	{#if !showAuth && (!isOnboarded || wizardVisible)}
		<Wizard bind:visible={wizardVisible} oncomplete={onWizardComplete} />
	{/if}

	{#if !showAuth && isOnboarded}
		<div id="app">
			<Header />
			<div class="scroll" id="scroll">
				{#if activeView === 'hoy'}
					<div class="view active"><ViewHoy onopenmodal={openModal} ontoast={showToast} /></div>
				{:else if activeView === 'prog'}
					<div class="view active"><ViewProgreso ontoast={showToast} /></div>
				{:else if activeView === 'hist'}
					<div class="view active"><ViewHistorial /></div>
				{:else if activeView === 'perfil'}
					<div class="view active"><ViewPerfil ontoast={showToast} onrelaunch={relaunchWizard} /></div>
				{/if}
			</div>
			<Nav active={activeView} onswitch={switchView} />
		</div>
	{/if}

	<ExerciseModal bind:visible={modalVisible} exerciseName={modalExercise} exerciseType={modalType} ontoast={showToast} />
{/if}

<Toast bind:this={toast} />
