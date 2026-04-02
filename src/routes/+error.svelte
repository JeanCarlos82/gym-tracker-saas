<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="error-page">
	<div class="error-content">
		<div class="error-icon">
			<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="8" x2="12" y2="12"/>
				<line x1="12" y1="16" x2="12.01" y2="16"/>
			</svg>
		</div>
		<h1 class="error-title">Algo salió mal</h1>
		<p class="error-message">{$page.error?.message || 'Error inesperado'}</p>
		<button class="error-btn" onclick={() => window.location.href = '/'}>
			VOLVER AL INICIO
		</button>
	</div>
</div>

<style>
	.error-page {
		position: fixed;
		inset: 0;
		background: #0a0a0a;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	.error-content {
		text-align: center;
		max-width: 320px;
	}
	.error-icon {
		color: #f87171;
		margin-bottom: 20px;
	}
	.error-title {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 28px;
		color: #f2f2f2;
		letter-spacing: 2px;
		margin-bottom: 8px;
	}
	.error-message {
		font-family: 'DM Mono', monospace;
		font-size: 12px;
		color: #777;
		margin-bottom: 24px;
		line-height: 1.6;
	}
	.error-btn {
		background: #E8FF3A;
		color: #000;
		border: none;
		border-radius: 12px;
		padding: 14px 28px;
		font-family: 'Bebas Neue', sans-serif;
		font-size: 16px;
		letter-spacing: 2px;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.error-btn:active {
		transform: scale(0.97);
	}
</style>
