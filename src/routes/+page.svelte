<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/stores/db';
	import Nav from '$lib/components/Nav.svelte';
	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import ViewHoy from '$lib/components/ViewHoy.svelte';
	import ViewProgreso from '$lib/components/ViewProgreso.svelte';
	import ViewHistorial from '$lib/components/ViewHistorial.svelte';
	import ViewPerfil from '$lib/components/ViewPerfil.svelte';
	import ExerciseModal from '$lib/components/ExerciseModal.svelte';
	import Wizard from '$lib/components/Wizard.svelte';

	let activeView = $state('hoy');
	let isOnboarded = $state(false);
	let mounted = $state(false);

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

	onMount(() => {
		isOnboarded = db.isOnboarded();
		mounted = true;
		if (!isOnboarded) {
			wizardVisible = true;
		}
	});
</script>

{#if mounted}
	{#if !isOnboarded || wizardVisible}
		<Wizard
			bind:visible={wizardVisible}
			oncomplete={onWizardComplete}
		/>
	{/if}

	{#if isOnboarded}
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
