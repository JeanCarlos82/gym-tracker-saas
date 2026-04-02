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

	let swipeStartY = 0;
	let swipeCurrentY = 0;
	let isSwiping = $state(false);
	let isClosing = $state(false);
	let modalTransform = $state('');
	let overlayOpacity = $state('');

	function onTouchStart(e: TouchEvent) {
		const modal = (e.currentTarget as HTMLElement);
		if (modal.scrollTop > 0) return;
		swipeStartY = e.touches[0].clientY;
		isSwiping = true;
		swipeCurrentY = 0;
	}
	function onTouchMove(e: TouchEvent) {
		if (!isSwiping) return;
		swipeCurrentY = e.touches[0].clientY - swipeStartY;
		if (swipeCurrentY > 0) {
			const dampened = swipeCurrentY * 0.6;
			modalTransform = `translateY(${dampened}px)`;
			overlayOpacity = String(Math.max(0.3, 1 - dampened / 400));
		} else { swipeCurrentY = 0; }
	}
	function onTouchEnd() {
		if (!isSwiping) return;
		isSwiping = false;
		if (swipeCurrentY > 80) {
			isClosing = true;
			modalTransform = 'translateY(100%)';
			overlayOpacity = '0';
			setTimeout(() => { visible = false; isClosing = false; modalTransform = ''; overlayOpacity = ''; }, 350);
		} else { modalTransform = ''; overlayOpacity = ''; }
	}
</script>

<div class="overlay" class:open={visible} id="picker-overlay" onclick={close}
	style:opacity={overlayOpacity || undefined}
	style:transition={isClosing ? 'opacity 0.35s ease' : isSwiping ? 'none' : undefined}
>
	<div class="modal modal-scroll" onclick={(e) => e.stopPropagation()}
		ontouchstart={onTouchStart} ontouchmove={onTouchMove} ontouchend={onTouchEnd}
		style:transform={modalTransform || undefined}
		style:transition={isClosing ? 'transform 0.35s cubic-bezier(0.32,0.72,0,1)' : isSwiping ? 'none' : undefined}
	>
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
