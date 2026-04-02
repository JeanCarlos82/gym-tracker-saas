<script lang="ts">
	import { EXERCISE_DB, type Exercise } from '$lib/data/exercises';

	let { visible = $bindable(false), onselect, selected = [] }: {
		visible: boolean;
		onselect: (exercises: string[]) => void;
		selected: string[];
	} = $props();

	let search = $state('');
	let picked = $state<string[]>([]);

	$effect(() => {
		if (visible) {
			picked = [...selected];
			search = '';
		}
	});

	const zones = [
		{ key: 'superior', label: 'TREN SUPERIOR' },
		{ key: 'inferior', label: 'TREN INFERIOR' },
		{ key: 'core', label: 'CORE' },
		{ key: 'cardio', label: 'CARDIO' },
	];

	let filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		if (!q) return EXERCISE_DB;
		return EXERCISE_DB.filter(e =>
			e.name.toLowerCase().includes(q) ||
			e.muscleGroup.some(m => m.toLowerCase().includes(q))
		);
	});

	function toggle(name: string) {
		const idx = picked.indexOf(name);
		if (idx >= 0) picked = picked.filter(n => n !== name);
		else picked = [...picked, name];
	}

	function done() {
		onselect(picked);
		visible = false;
	}

	function close(e: MouseEvent) {
		if ((e.target as HTMLElement).id === 'picker-overlay') visible = false;
	}
</script>

<div class="overlay" class:open={visible} id="picker-overlay" onclick={close}>
	<div class="modal" style="max-height:85dvh">
		<div class="mhandle"></div>
		<div class="mtitle">AGREGAR EJERCICIOS</div>
		<div class="msub">Toca para seleccionar o quitar</div>
		<input
			class="prog-search"
			type="text"
			placeholder="Buscar ejercicio..."
			bind:value={search}
			style="margin-top:0"
		/>
		<div style="max-height:50dvh;overflow-y:auto;margin:8px 0 12px;scrollbar-width:none">
			{#each zones as zone}
				{@const exs = filtered.filter(e => e.zone === zone.key)}
				{#if exs.length > 0}
					<div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--accent);letter-spacing:1.5px;padding:8px 0 4px">
						{zone.label}
					</div>
					{#each exs as ex}
						<div
							class="pick-item"
							class:selected={picked.includes(ex.name)}
							onclick={() => toggle(ex.name)}
						>
							<span>{ex.name}</span>
							<span class="pick-mg">{ex.muscleGroup[0]}</span>
						</div>
					{/each}
				{/if}
			{/each}
		</div>
		<button class="sbtn" onclick={done}>LISTO</button>
	</div>
</div>
