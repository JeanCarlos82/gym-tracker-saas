<script lang="ts">
	let { active = 'hoy', onswitch }: { active: string; onswitch: (view: string) => void } = $props();
</script>

<nav class="nav">
	<div class="ni" class:active={active === 'hoy'} onclick={() => onswitch('hoy')}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
		<span class="nlbl">HOY</span>
	</div>
	<div class="ni" class:active={active === 'prog'} onclick={() => onswitch('prog')}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
		<span class="nlbl">PROGRESO</span>
	</div>
	<div class="ni" class:active={active === 'hist'} onclick={() => onswitch('hist')}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
		<span class="nlbl">HISTORIAL</span>
	</div>
	<div class="ni" class:active={active === 'perfil'} onclick={() => onswitch('perfil')}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
		<span class="nlbl">PERFIL</span>
	</div>
</nav>
