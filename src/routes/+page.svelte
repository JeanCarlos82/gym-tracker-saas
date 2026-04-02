<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/stores/db';
	import { user, authLoading, initAuth, signOut } from '$lib/stores/auth';
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
	let mounted = $state(false);
	let showAuth = $state(false);

	// Modal state
	let modalVisible = $state(false);
	let modalExercise = $state('');
	let modalType = $state<'pesas' | 'cardio'>('pesas');

	// Wizard state
	let wizardVisible = $state(false);

	let toast: Toast;

	function switchView(view: string) {
		activeView = view;
	}

	function openModal(name: string, type: 'pesas' | 'cardio') {
		modalExercise = name;
		modalType = type;
		modalVisible = true;
	}

	function showToast(msg: string) {
		toast?.show(msg);
	}

	function onWizardComplete() {
		isOnboarded = true;
		wizardVisible = false;
	}

	function relaunchWizard() {
		wizardVisible = true;
	}

	async function onAuthComplete() {
		showAuth = false;
		// Re-check auth state
		await initAuth();
		if ($user) {
			await db.init();
			if (!db.isOnboarded()) {
				await db.migrateToCloud();
			}
		}
		isOnboarded = db.isOnboarded();
		if (!isOnboarded) {
			wizardVisible = true;
		}
	}

	onMount(async () => {
		await initAuth();
		isOnboarded = db.isOnboarded();

		if (!isOnboarded) {
			// Not onboarded — show auth screen
			showAuth = true;
			mounted = true;
			return;
		}

		// Onboarded — load data
		if ($user) {
			await db.init();
		}
		mounted = true;
	});
</script>

{#if !mounted || $authLoading}
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
		<Wizard
			bind:visible={wizardVisible}
			oncomplete={onWizardComplete}
		/>
	{/if}

	{#if !showAuth && isOnboarded}
		<div id="app">
			<Header />

			<div class="scroll" id="scroll">
				{#if activeView === 'hoy'}
					<div class="view active">
						<ViewHoy
							onopenmodal={openModal}
							ontoast={showToast}
						/>
					</div>
				{:else if activeView === 'prog'}
					<div class="view active">
						<ViewProgreso ontoast={showToast} />
					</div>
				{:else if activeView === 'hist'}
					<div class="view active">
						<ViewHistorial />
					</div>
				{:else if activeView === 'perfil'}
					<div class="view active">
						<ViewPerfil
							ontoast={showToast}
							onrelaunch={relaunchWizard}
						/>
					</div>
				{/if}
			</div>

			<Nav active={activeView} onswitch={switchView} />
		</div>
	{/if}

	<ExerciseModal
		bind:visible={modalVisible}
		exerciseName={modalExercise}
		exerciseType={modalType}
		ontoast={showToast}
	/>
{/if}

<Toast bind:this={toast} />
