<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { db } from '$lib/stores/db';
	import { user, authReady, initAuth } from '$lib/stores/auth';
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
	function openModal(name: string, type: 'pesas' | 'cardio') {
		modalExercise = name; modalType = type; modalVisible = true;
	}
	function showToast(msg: string) { toast?.show(msg); }
	function onWizardComplete() { isOnboarded = true; wizardVisible = false; }
	function relaunchWizard() { wizardVisible = true; }

	async function onAuthComplete() {
		showAuth = false;
		const currentUser = get(user);
		if (currentUser) {
			await db.init();
			db.setOnboarded();
			isOnboarded = true;
			const data = get(db);
			const hasRoutine = Object.values(data.routine).some(d => d.exercises?.length > 0);
			if (!hasRoutine) wizardVisible = true;
		} else {
			isOnboarded = db.isOnboarded();
			if (!isOnboarded) wizardVisible = true;
		}
	}

	onMount(async () => {
		try {
			await initAuth();
		} catch (e) {
			console.error('initAuth error:', e);
		}

		const currentUser = get(user);
		isOnboarded = db.isOnboarded();

		if (currentUser) {
			await db.init();
			isOnboarded = true;
			db.setOnboarded();
		} else if (!isOnboarded) {
			showAuth = true;
		}

		ready = true;
	});
</script>

{#if !ready}
	<div style="position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;">
		<div style="text-align:center;">
			<div style="font-family:'Bebas Neue',sans-serif;font-size:48px;color:#E8FF3A;letter-spacing:2px;">GYM</div>
			<div style="font-family:'DM Mono',monospace;font-size:11px;color:#555;">Cargando...</div>
		</div>
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
