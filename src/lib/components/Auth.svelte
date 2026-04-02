<script lang="ts">
	import { signIn, signUp, signInWithGoogle, resetPassword } from '$lib/stores/auth';

	let { oncomplete }: { oncomplete: () => void } = $props();

	let mode = $state<'login' | 'register' | 'reset'>('login');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let message = $state('');
	let showPassword = $state(false);

	let subtitle = $derived(
		mode === 'login'
			? 'Inicia sesión para sincronizar tus datos'
			: mode === 'register'
				? 'Crea tu cuenta gratuita'
				: 'Recupera tu contraseña'
	);

	let submitLabel = $derived(
		mode === 'login' ? 'ENTRAR' : mode === 'register' ? 'CREAR CUENTA' : 'ENVIAR EMAIL'
	);

	function switchMode(next: 'login' | 'register' | 'reset') {
		mode = next;
		error = '';
		message = '';
		showPassword = false;
	}

	async function handleSubmit() {
		error = '';
		message = '';
		loading = true;
		try {
			if (mode === 'login') {
				await signIn(email, password);
				oncomplete();
			} else if (mode === 'register') {
				await signUp(email, password);
				message = 'Revisa tu email para confirmar tu cuenta';
			} else if (mode === 'reset') {
				await resetPassword(email);
				message = 'Te enviamos un email para restablecer tu contraseña';
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			loading = false;
		}
	}

	async function handleGoogle() {
		error = '';
		loading = true;
		try {
			await signInWithGoogle();
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Error con Google';
			loading = false;
		}
	}
</script>

<!-- Background overlay -->
<div class="auth-overlay">
	<!-- Subtle accent glow behind the form -->
	<div class="auth-glow"></div>

	<div class="auth-card">
		<!-- Logo area -->
		<div class="auth-logo-area">
			<div class="auth-logo-glow"></div>
			<div class="auth-logo">
				<span class="auth-logo-accent">GYM</span> Tracker
			</div>
			<p class="auth-subtitle" key={mode}>{subtitle}</p>
		</div>

		<!-- Form section with transitions -->
		<div class="auth-form-wrapper" data-mode={mode}>
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="auth-field">
					<label class="auth-label" for="auth-email">EMAIL</label>
					<input
						id="auth-email"
						class="auth-input"
						type="email"
						bind:value={email}
						placeholder="tu@email.com"
						required
						autocomplete="email"
					/>
				</div>

				{#if mode !== 'reset'}
					<div class="auth-field auth-field-animated">
						<label class="auth-label" for="auth-password">CONTRASEÑA</label>
						<div class="auth-password-wrapper">
							<input
								id="auth-password"
								class="auth-input auth-input-password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="Mínimo 6 caracteres"
								required
								minlength="6"
								autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
							/>
							<button
								type="button"
								class="auth-eye-btn"
								onclick={() => showPassword = !showPassword}
								aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
								tabindex="-1"
							>
								{#if showPassword}
									<!-- Eye-off icon -->
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
										<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
										<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
										<line x1="1" y1="1" x2="23" y2="23"/>
									</svg>
								{:else}
									<!-- Eye icon -->
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
										<circle cx="12" cy="12" r="3"/>
									</svg>
								{/if}
							</button>
						</div>
					</div>
				{/if}

				<!-- Error message -->
				{#if error}
					<div class="auth-message auth-message-error">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
						</svg>
						<span>{error}</span>
					</div>
				{/if}

				<!-- Success message -->
				{#if message}
					<div class="auth-message auth-message-success">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
						</svg>
						<span>{message}</span>
					</div>
				{/if}

				<!-- Submit button -->
				<button
					type="submit"
					disabled={loading}
					class="auth-submit-btn"
				>
					{#if loading}
						<span class="auth-spinner"></span>
						<span>PROCESANDO...</span>
					{:else}
						<span>{submitLabel}</span>
					{/if}
				</button>
			</form>

			<!-- Divider -->
			{#if mode !== 'reset'}
				<div class="auth-divider">
					<div class="auth-divider-line"></div>
					<span class="auth-divider-text">o</span>
					<div class="auth-divider-line"></div>
				</div>

				<!-- Google button -->
				<button
					onclick={handleGoogle}
					disabled={loading}
					class="auth-google-btn"
				>
					<svg width="18" height="18" viewBox="0 0 24 24">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
					</svg>
					<span>Continuar con Google</span>
				</button>
			{/if}
		</div>

		<!-- Mode switcher -->
		<div class="auth-switch-section">
			{#if mode === 'login'}
				<button class="auth-switch-btn" onclick={() => switchMode('register')}>
					¿No tienes cuenta? <span class="auth-switch-accent">Regístrate</span>
				</button>
				<button class="auth-switch-btn auth-switch-btn-subtle" onclick={() => switchMode('reset')}>
					Olvidé mi contraseña
				</button>
			{:else if mode === 'register'}
				<button class="auth-switch-btn" onclick={() => switchMode('login')}>
					¿Ya tienes cuenta? <span class="auth-switch-accent">Inicia sesión</span>
				</button>
			{:else}
				<button class="auth-switch-btn" onclick={() => switchMode('login')}>
					<span class="auth-switch-accent">Volver</span> a iniciar sesión
				</button>
			{/if}
		</div>

		<!-- Continue without account -->
		<div class="auth-skip-section">
			<button class="auth-skip-btn" onclick={oncomplete}>
				Continuar sin cuenta
			</button>
			<p class="auth-skip-hint">Tus datos se guardarán solo en este dispositivo</p>
		</div>
	</div>
</div>

<style>
	/* ── OVERLAY ── */
	.auth-overlay {
		position: fixed;
		inset: 0;
		background: #0a0a0a;
		z-index: 300;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		overflow-y: auto;
	}

	/* ── BACKGROUND GLOW ── */
	.auth-glow {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(232, 255, 58, 0.04) 0%, transparent 70%);
		pointer-events: none;
		z-index: 0;
	}

	/* ── CARD ── */
	.auth-card {
		width: 100%;
		max-width: 400px;
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	/* ── LOGO AREA ── */
	.auth-logo-area {
		text-align: center;
		padding: 8px 0 0;
		position: relative;
	}

	.auth-logo-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -60%);
		width: 180px;
		height: 80px;
		background: radial-gradient(ellipse, rgba(232, 255, 58, 0.10) 0%, transparent 70%);
		pointer-events: none;
		filter: blur(20px);
	}

	.auth-logo {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 56px;
		letter-spacing: 3px;
		color: #f2f2f2;
		position: relative;
		line-height: 1;
	}

	.auth-logo-accent {
		color: #E8FF3A;
		text-shadow: 0 0 30px rgba(232, 255, 58, 0.3);
	}

	.auth-subtitle {
		color: #888;
		font-family: 'DM Sans', sans-serif;
		font-size: 13px;
		margin: 8px 0 0;
		transition: opacity 0.25s ease;
	}

	/* ── FORM WRAPPER ── */
	.auth-form-wrapper {
		background: #141414;
		border: 1px solid #1e1e1e;
		border-radius: 12px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 0;
		animation: authFadeIn 0.3s ease;
	}

	@keyframes authFadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* ── FIELDS ── */
	.auth-field {
		margin-bottom: 12px;
	}

	.auth-field-animated {
		animation: authFieldIn 0.25s ease;
	}

	@keyframes authFieldIn {
		from { opacity: 0; max-height: 0; margin-bottom: 0; }
		to { opacity: 1; max-height: 100px; margin-bottom: 12px; }
	}

	.auth-label {
		display: block;
		font-family: 'DM Mono', monospace;
		font-size: 10px;
		letter-spacing: 1.5px;
		color: #555;
		margin-bottom: 6px;
	}

	.auth-input {
		width: 100%;
		background: #0e0e0e;
		border: 1.5px solid #2a2a2a;
		border-radius: 10px;
		color: #f2f2f2;
		font-family: 'DM Sans', sans-serif;
		font-size: 14px;
		padding: 14px 16px;
		outline: none;
		transition: border-color 0.25s ease, box-shadow 0.25s ease;
		box-sizing: border-box;
	}

	.auth-input::placeholder {
		color: #444;
	}

	.auth-input:focus {
		border-color: #E8FF3A;
		box-shadow: 0 0 0 3px rgba(232, 255, 58, 0.08);
	}

	/* ── PASSWORD WRAPPER ── */
	.auth-password-wrapper {
		position: relative;
	}

	.auth-input-password {
		padding-right: 48px;
	}

	.auth-eye-btn {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #555;
		cursor: pointer;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: color 0.2s ease;
	}

	.auth-eye-btn:hover {
		color: #888;
	}

	/* ── MESSAGES ── */
	.auth-message {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-family: 'DM Mono', monospace;
		font-size: 11px;
		line-height: 1.5;
		padding: 10px 14px;
		border-radius: 8px;
		margin-bottom: 12px;
		animation: authMsgSlide 0.3s ease;
	}

	.auth-message svg {
		flex-shrink: 0;
		margin-top: 1px;
	}

	@keyframes authMsgSlide {
		from { opacity: 0; transform: translateX(-8px); }
		to { opacity: 1; transform: translateX(0); }
	}

	.auth-message-error {
		color: #f87171;
		background: rgba(248, 113, 113, 0.06);
		border: 1px solid rgba(248, 113, 113, 0.15);
	}

	.auth-message-success {
		color: #4ade80;
		background: rgba(74, 222, 128, 0.06);
		border: 1px solid rgba(74, 222, 128, 0.15);
	}

	/* ── SUBMIT BUTTON ── */
	.auth-submit-btn {
		width: 100%;
		background: #E8FF3A;
		color: #000;
		border: none;
		font-family: 'Bebas Neue', sans-serif;
		font-size: 18px;
		letter-spacing: 2px;
		padding: 15px;
		border-radius: 10px;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: transform 0.1s, opacity 0.1s, box-shadow 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		box-shadow: 0 2px 16px rgba(232, 255, 58, 0.15);
	}

	.auth-submit-btn:hover:not(:disabled) {
		box-shadow: 0 4px 24px rgba(232, 255, 58, 0.25);
	}

	.auth-submit-btn:active:not(:disabled) {
		opacity: 0.85;
		transform: scale(0.98);
	}

	.auth-submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* ── SPINNER ── */
	.auth-spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2.5px solid rgba(0, 0, 0, 0.2);
		border-top-color: #000;
		border-radius: 50%;
		animation: authSpin 0.6s linear infinite;
	}

	@keyframes authSpin {
		to { transform: rotate(360deg); }
	}

	/* ── DIVIDER ── */
	.auth-divider {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 18px 0;
	}

	.auth-divider-line {
		flex: 1;
		height: 1px;
		background: #222;
	}

	.auth-divider-text {
		font-family: 'DM Sans', sans-serif;
		font-size: 12px;
		color: #444;
		text-transform: lowercase;
	}

	/* ── GOOGLE BUTTON ── */
	.auth-google-btn {
		width: 100%;
		padding: 13px 16px;
		background: #1a1a1a;
		border: 1.5px solid #2a2a2a;
		border-radius: 10px;
		color: #f2f2f2;
		font-family: 'DM Sans', sans-serif;
		font-size: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.auth-google-btn:hover:not(:disabled) {
		background: #222;
		border-color: #444;
		box-shadow: 0 2px 12px rgba(255, 255, 255, 0.04);
	}

	.auth-google-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.auth-google-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ── MODE SWITCH ── */
	.auth-switch-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.auth-switch-btn {
		background: none;
		border: none;
		color: #888;
		font-family: 'DM Mono', monospace;
		font-size: 11px;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 6px;
		transition: color 0.2s ease;
	}

	.auth-switch-btn:hover {
		color: #aaa;
	}

	.auth-switch-btn-subtle {
		color: #555;
		font-size: 10px;
	}

	.auth-switch-btn-subtle:hover {
		color: #777;
	}

	.auth-switch-accent {
		color: #E8FF3A;
		transition: text-shadow 0.2s ease;
	}

	.auth-switch-btn:hover .auth-switch-accent {
		text-shadow: 0 0 8px rgba(232, 255, 58, 0.3);
	}

	/* ── SKIP / CONTINUE WITHOUT ACCOUNT ── */
	.auth-skip-section {
		text-align: center;
		padding-top: 4px;
		border-top: 1px solid #1a1a1a;
	}

	.auth-skip-btn {
		background: none;
		border: 1px solid #222;
		color: #555;
		font-family: 'DM Mono', monospace;
		font-size: 11px;
		cursor: pointer;
		padding: 8px 20px;
		border-radius: 24px;
		transition: color 0.2s ease, border-color 0.2s ease;
	}

	.auth-skip-btn:hover {
		color: #888;
		border-color: #333;
	}

	.auth-skip-hint {
		color: #444;
		font-family: 'DM Sans', sans-serif;
		font-size: 10px;
		margin: 8px 0 0;
		line-height: 1.4;
	}
</style>
