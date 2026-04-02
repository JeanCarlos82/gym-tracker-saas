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

<style>
	.nav {
		display: flex;
		justify-content: space-around;
		align-items: center;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: #0a0a0a;
		border-top: 1px solid #1a1a1a;
		padding: 6px 0 env(safe-area-inset-bottom, 8px);
	}

	.ni {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		min-width: 44px;
		min-height: 44px;
		padding: 6px 12px;
		color: #555;
		cursor: pointer;
		position: relative;
		transition: color 0.25s ease, transform 0.15s ease;

		/* Reset button defaults */
		background: none;
		border: none;
		outline: none;
		font: inherit;
		-webkit-tap-highlight-color: transparent;
	}

	.ni:active {
		transform: scale(0.9);
	}

	.ni:focus-visible {
		outline: 2px solid #E8FF3A;
		outline-offset: 2px;
		border-radius: 8px;
	}

	/* Accent underline indicator */
	.ni::after {
		content: '';
		position: absolute;
		bottom: 2px;
		left: 50%;
		transform: translateX(-50%) scaleX(0);
		width: 20px;
		height: 2.5px;
		border-radius: 2px;
		background: #E8FF3A;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
		opacity: 0;
	}

	.ni.active::after {
		transform: translateX(-50%) scaleX(1);
		opacity: 1;
	}

	.ni svg {
		width: 22px;
		height: 22px;
		transition: color 0.25s ease;
	}

	.ni.active {
		color: #E8FF3A;
	}

	.nlbl {
		font-family: 'DM Mono', monospace;
		font-size: 9px;
		letter-spacing: 1px;
		text-transform: uppercase;
		transition: color 0.25s ease;
	}
</style>
