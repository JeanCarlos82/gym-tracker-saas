<script lang="ts">
	let { active = 'hoy', onswitch }: { active: string; onswitch: (view: string) => void } = $props();

	function handleKey(view: string, e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onswitch(view);
		}
	}
</script>

<nav class="nav" role="navigation" aria-label="Main navigation">
	<button class="ni" class:active={active === 'hoy'} onclick={() => onswitch('hoy')} onkeydown={(e) => handleKey('hoy', e)} aria-label="Hoy" aria-current={active === 'hoy' ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
		<span class="nlbl">HOY</span>
	</button>
	<button class="ni" class:active={active === 'prog'} onclick={() => onswitch('prog')} onkeydown={(e) => handleKey('prog', e)} aria-label="Progreso" aria-current={active === 'prog' ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
		<span class="nlbl">PROGRESO</span>
	</button>
	<button class="ni" class:active={active === 'hist'} onclick={() => onswitch('hist')} onkeydown={(e) => handleKey('hist', e)} aria-label="Historial" aria-current={active === 'hist' ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
		<span class="nlbl">HISTORIAL</span>
	</button>
	<button class="ni" class:active={active === 'perfil'} onclick={() => onswitch('perfil')} onkeydown={(e) => handleKey('perfil', e)} aria-label="Perfil" aria-current={active === 'perfil' ? 'page' : undefined}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
		<span class="nlbl">PERFIL</span>
	</button>
</nav>
