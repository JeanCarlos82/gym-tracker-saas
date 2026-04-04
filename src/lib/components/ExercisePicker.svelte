<script lang="ts">
	import { EXERCISE_DB, CATEGORIES, CATEGORY_COLORS, type Exercise, type Category, type Equipment, type Difficulty } from '$lib/data/exercises';

	let { visible = $bindable(false), onselect, selected = [] }: {
		visible: boolean;
		onselect: (exercises: string[]) => void;
		selected: string[];
	} = $props();

	let search = $state('');
	let picked = $state<string[]>([]);
	let activeFilter = $state<'cat' | 'equip' | 'diff' | ''>('');
	let filterCat = $state<Category | ''>('');
	let filterEquip = $state<Equipment | ''>('');
	let filterDiff = $state<Difficulty | ''>('');

	$effect(() => {
		if (visible) {
			picked = [...selected];
			search = '';
			activeFilter = '';
			filterCat = '';
			filterEquip = '';
			filterDiff = '';
		}
	});

	const equipments: Equipment[] = ['Barra', 'Mancuernas', 'Máquina', 'Polea', 'Peso corporal', 'Barra Z'];
	const difficulties: Difficulty[] = ['Principiante', 'Intermedio', 'Avanzado'];

	/** Strip accents: "Glúteos" → "gluteos", "Bíceps" → "biceps" */
	function norm(s: string): string {
		return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
	}

	let filtered = $derived.by(() => {
		let results = EXERCISE_DB;
		if (filterCat) results = results.filter(e => e.category === filterCat);
		if (filterEquip) results = results.filter(e => e.equipment === filterEquip);
		if (filterDiff) results = results.filter(e => e.difficulty === filterDiff);
		const q = norm(search.trim());
		if (q) {
			results = results.filter(e =>
				norm(e.name).includes(q) ||
				norm(e.category).includes(q) ||
				norm(e.muscle_primary).includes(q) ||
				e.muscle_secondary.some(m => norm(m).includes(q)) ||
				norm(e.equipment).includes(q)
			);
		}
		return results;
	});

	// Active filter count for badge
	let filterCount = $derived((filterCat ? 1 : 0) + (filterEquip ? 1 : 0) + (filterDiff ? 1 : 0));

	// Group filtered exercises by category
	let grouped = $derived.by(() => {
		const cats = filterCat ? [filterCat] : CATEGORIES;
		return cats.map(cat => ({
			cat,
			color: CATEGORY_COLORS[cat],
			exercises: filtered.filter(e => e.category === cat),
		})).filter(g => g.exercises.length > 0);
	});

	function toggle(id: string) {
		const idx = picked.indexOf(id);
		if (idx >= 0) picked = picked.filter(i => i !== id);
		else picked = [...picked, id];
	}

	function clearFilters() {
		filterCat = '';
		filterEquip = '';
		filterDiff = '';
		activeFilter = '';
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

		<!-- Search + filter toggle row -->
		<div class="ep-search-row">
			<input
				class="ep-search"
				type="text"
				placeholder="Buscar ejercicio..."
				bind:value={search}
			/>
			<button type="button" class="ep-filter-btn" class:active={activeFilter !== '' || filterCount > 0}
				onclick={() => activeFilter = activeFilter ? '' : 'cat'}
			>
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
				{#if filterCount > 0}
					<span class="ep-filter-badge">{filterCount}</span>
				{/if}
			</button>
		</div>

		<!-- Collapsible filter panel -->
		{#if activeFilter !== '' || filterCount > 0}
			<div class="ep-filters">
				<!-- Filter type tabs -->
				<div class="ep-ftabs">
					<button type="button" class="ep-ftab" class:active={activeFilter === 'cat'} onclick={() => activeFilter = 'cat'}>Músculo</button>
					<button type="button" class="ep-ftab" class:active={activeFilter === 'equip'} onclick={() => activeFilter = 'equip'}>Equipo</button>
					<button type="button" class="ep-ftab" class:active={activeFilter === 'diff'} onclick={() => activeFilter = 'diff'}>Nivel</button>
					{#if filterCount > 0}
						<button type="button" class="ep-fclear" onclick={clearFilters}>Limpiar</button>
					{/if}
				</div>
				<!-- Filter options based on active tab -->
				<div class="ep-fopts">
					{#if activeFilter === 'cat'}
						{#each CATEGORIES as cat}
							<button type="button"
								class="ep-fopt"
								class:active={filterCat === cat}
								onclick={() => filterCat = filterCat === cat ? '' : cat}
							>
								<span class="cat-dot" style="background:{CATEGORY_COLORS[cat]}"></span>
								{cat}
							</button>
						{/each}
					{:else if activeFilter === 'equip'}
						{#each equipments as eq}
							<button type="button"
								class="ep-fopt"
								class:active={filterEquip === eq}
								onclick={() => filterEquip = filterEquip === eq ? '' : eq}
							>{eq}</button>
						{/each}
					{:else if activeFilter === 'diff'}
						{#each difficulties as diff}
							<button type="button"
								class="ep-fopt"
								class:active={filterDiff === diff}
								onclick={() => filterDiff = filterDiff === diff ? '' : diff}
							>{diff}</button>
						{/each}
					{/if}
				</div>
			</div>
		{/if}

		<!-- Exercise list -->
		<div class="ep-list">
			{#each grouped as group}
				<div class="ep-cat-hdr" style="color:{group.color}">
					<span class="cat-dot" style="background:{group.color}"></span>
					{group.cat}
					<span class="ep-cat-n">{group.exercises.length}</span>
				</div>
				{#each group.exercises as ex}
					{@const sel = picked.includes(ex.id)}
					<button type="button"
						class="ep-item"
						class:selected={sel}
						onclick={() => toggle(ex.id)}
					>
						<div class="ep-checkbox" class:checked={sel}>
							{#if sel}
								<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							{/if}
						</div>
						<span class="ep-dot" style="background:{group.color}"></span>
						<div class="ep-info">
							<span class="ep-name">{ex.name}</span>
							<span class="ep-detail">{ex.equipment} · {ex.muscle_primary}</span>
						</div>
					</button>
				{/each}
			{/each}
			{#if filtered.length === 0}
				<div class="ep-empty">No se encontraron ejercicios</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="ep-footer">
			<span class="ep-count">{filtered.length} ejercicios</span>
			<button class="sbtn" onclick={done}>LISTO ({picked.length})</button>
		</div>
	</div>
</div>

<style>
	/* Search row */
	.ep-search-row{display:flex;gap:8px;align-items:center;margin-bottom:8px;}
	.ep-search{
		flex:1;font-family:'DM Mono',monospace;font-size:12px;
		background:var(--card2);border:1px solid var(--border);border-radius:10px;
		padding:10px 14px;color:var(--text);outline:none;min-height:44px;
	}
	.ep-search:focus{border-color:var(--accent);}
	.ep-search::placeholder{color:var(--muted);}
	.ep-filter-btn{
		position:relative;width:44px;height:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
		background:var(--card2);border:1px solid var(--border);border-radius:10px;color:var(--muted2);cursor:pointer;
	}
	.ep-filter-btn.active{border-color:var(--accent);color:var(--accent);}
	.ep-filter-badge{
		position:absolute;top:4px;right:4px;width:14px;height:14px;border-radius:50%;
		background:var(--accent);color:#000;font-size:8px;font-family:'DM Mono',monospace;
		display:flex;align-items:center;justify-content:center;font-weight:bold;
	}

	/* Filter panel */
	.ep-filters{margin-bottom:8px;}
	.ep-ftabs{display:flex;gap:4px;margin-bottom:6px;}
	.ep-ftab{
		font-family:'DM Mono',monospace;font-size:10px;padding:5px 12px;border-radius:6px;
		border:1px solid var(--border);background:transparent;color:var(--muted2);cursor:pointer;
	}
	.ep-ftab.active{background:var(--card3);color:var(--text);border-color:var(--border2);}
	.ep-fclear{
		margin-left:auto;font-family:'DM Mono',monospace;font-size:9px;padding:5px 10px;
		border-radius:6px;border:1px solid var(--red);background:transparent;color:var(--red);cursor:pointer;
	}
	.ep-fopts{display:flex;flex-wrap:wrap;gap:4px;}
	.ep-fopt{
		font-family:'DM Mono',monospace;font-size:10px;padding:5px 10px;border-radius:5px;
		border:1px solid var(--border);background:transparent;color:var(--muted2);cursor:pointer;
		display:flex;align-items:center;gap:5px;min-height:32px;
	}
	.ep-fopt.active{background:rgba(232,255,58,0.06);color:var(--accent);border-color:var(--accent);}

	/* Exercise list */
	.ep-list{max-height:48dvh;overflow-y:auto;margin:4px 0 8px;scrollbar-width:none;}
	.ep-list::-webkit-scrollbar{display:none;}

	.ep-cat-hdr{
		font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;
		padding:12px 0 4px;display:flex;align-items:center;gap:6px;
		position:sticky;top:0;background:var(--card);z-index:1;
	}
	.ep-cat-n{font-size:8px;color:var(--muted);margin-left:auto;}

	/* Exercise item — proper touch target */
	.ep-item{
		display:flex;align-items:center;gap:10px;width:100%;text-align:left;
		padding:10px 8px;min-height:48px;border:none;background:transparent;
		border-bottom:1px solid var(--border);cursor:pointer;
		-webkit-tap-highlight-color:transparent;transition:all 0.15s ease;
		border-left:3px solid transparent;
	}
	.ep-item:active{background:rgba(255,255,255,0.03);transform:scale(0.98);}
	.ep-item.selected{
		background:rgba(232,255,58,0.06);
		border-left-color:var(--accent);
	}
	.ep-item.selected .ep-name{color:var(--accent);font-weight:500;}
	.ep-item.selected .ep-detail{color:var(--muted2);}

	/* Checkbox */
	.ep-checkbox{
		width:22px;height:22px;border-radius:6px;flex-shrink:0;
		border:1.5px solid var(--border2);background:transparent;
		display:flex;align-items:center;justify-content:center;
		transition:all 0.15s ease;
	}
	.ep-checkbox.checked{
		background:var(--accent);border-color:var(--accent);
		box-shadow:0 0 8px rgba(232,255,58,0.3);
	}

	.ep-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
	.ep-info{display:flex;flex-direction:column;flex:1;min-width:0;}
	.ep-name{font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.15s;}
	.ep-detail{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-top:1px;transition:color 0.15s;}

	.ep-empty{text-align:center;color:var(--muted);padding:32px 0;font-size:12px;}

	/* Footer */
	.ep-footer{display:flex;align-items:center;gap:12px;padding-top:4px;}
	.ep-count{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);}
	.ep-footer .sbtn{flex:1;}
</style>
