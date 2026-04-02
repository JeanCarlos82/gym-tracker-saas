<script lang="ts">
	import { signIn, signUp, signInWithGoogle, resetPassword } from '$lib/stores/auth';

	let { oncomplete }: { oncomplete: () => void } = $props();

	let mode = $state<'login' | 'register' | 'reset'>('login');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let message = $state('');

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
		} catch (e: any) {
			error = e.message || 'Error desconocido';
		} finally {
			loading = false;
		}
	}

	async function handleGoogle() {
		error = '';
		loading = true;
		try {
			await signInWithGoogle();
		} catch (e: any) {
			error = e.message || 'Error con Google';
			loading = false;
		}
	}
</script>

<div style="position:fixed;inset:0;background:#0a0a0a;z-index:300;display:flex;align-items:center;justify-content:center;padding:16px;">
	<div style="width:100%;max-width:380px;">
		<div style="text-align:center;margin-bottom:32px;">
			<div style="font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:2px;">
				<span style="color:#E8FF3A">GYM</span> Tracker
			</div>
			<p style="color:#888;font-size:13px;margin-top:4px;">
				{mode === 'login' ? 'Inicia sesión para sincronizar tus datos' : mode === 'register' ? 'Crea tu cuenta gratuita' : 'Recupera tu contraseña'}
			</p>
		</div>

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div style="margin-bottom:12px;">
				<input
					type="email"
					bind:value={email}
					placeholder="tu@email.com"
					required
					style="width:100%;background:#141414;border:1px solid #2a2a2a;border-radius:10px;color:#f2f2f2;font-family:'DM Sans',sans-serif;font-size:14px;padding:14px 16px;outline:none;"
				/>
			</div>

			{#if mode !== 'reset'}
				<div style="margin-bottom:12px;">
					<input
						type="password"
						bind:value={password}
						placeholder="Contraseña"
						required
						minlength="6"
						style="width:100%;background:#141414;border:1px solid #2a2a2a;border-radius:10px;color:#f2f2f2;font-family:'DM Sans',sans-serif;font-size:14px;padding:14px 16px;outline:none;"
					/>
				</div>
			{/if}

			{#if error}
				<p style="color:#f87171;font-family:'DM Mono',monospace;font-size:11px;margin-bottom:12px;padding:8px 12px;background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.15);border-radius:8px;">{error}</p>
			{/if}

			{#if message}
				<p style="color:#4ade80;font-family:'DM Mono',monospace;font-size:11px;margin-bottom:12px;padding:8px 12px;background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:8px;">{message}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="sbtn"
				style="width:100%;margin-bottom:10px;"
			>
				{loading ? '...' : mode === 'login' ? 'ENTRAR' : mode === 'register' ? 'CREAR CUENTA' : 'ENVIAR EMAIL'}
			</button>
		</form>

		<button
			onclick={handleGoogle}
			disabled={loading}
			style="width:100%;padding:12px;background:#141414;border:1px solid #2a2a2a;border-radius:10px;color:#f2f2f2;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;"
		>
			<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
			Continuar con Google
		</button>

		<div style="text-align:center;">
			{#if mode === 'login'}
				<button onclick={() => { mode = 'register'; error = ''; message = ''; }} style="background:none;border:none;color:#888;font-family:'DM Mono',monospace;font-size:11px;cursor:pointer;">
					¿No tienes cuenta? <span style="color:#E8FF3A;">Regístrate</span>
				</button>
				<br/>
				<button onclick={() => { mode = 'reset'; error = ''; message = ''; }} style="background:none;border:none;color:#555;font-family:'DM Mono',monospace;font-size:10px;cursor:pointer;margin-top:8px;">
					Olvidé mi contraseña
				</button>
			{:else if mode === 'register'}
				<button onclick={() => { mode = 'login'; error = ''; message = ''; }} style="background:none;border:none;color:#888;font-family:'DM Mono',monospace;font-size:11px;cursor:pointer;">
					¿Ya tienes cuenta? <span style="color:#E8FF3A;">Inicia sesión</span>
				</button>
			{:else}
				<button onclick={() => { mode = 'login'; error = ''; message = ''; }} style="background:none;border:none;color:#888;font-family:'DM Mono',monospace;font-size:11px;cursor:pointer;">
					Volver a iniciar sesión
				</button>
			{/if}
		</div>

		<div style="text-align:center;margin-top:24px;">
			<button onclick={oncomplete} style="background:none;border:none;color:#555;font-family:'DM Mono',monospace;font-size:10px;cursor:pointer;">
				Continuar sin cuenta (datos solo locales)
			</button>
		</div>
	</div>
</div>
