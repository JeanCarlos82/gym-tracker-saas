<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { db } from '$lib/stores/db';
	import { user, initAuth } from '$lib/stores/auth';
	import { startReminderCheck } from '$lib/stores/notifications';
	import Nav from '$lib/components/Nav.svelte';
	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import ViewHoy from '$lib/components/ViewHoy.svelte';
	import ViewProgreso from '$lib/components/ViewProgreso.svelte';
	import ViewHistorial from '$lib/components/ViewHistorial.svelte';
	import ViewPerfil from '$lib/components/ViewPerfil.svelte';
	import ExerciseModal from '$lib/components/ExerciseModal.svelte';
	import Wizard from '$lib/components/Wizard.svelte';
	import Auth from '$lib/components/Auth.svelte';
	import GymGuide from '$lib/components/GymGuide.svelte';
	import OfflineBanner from '$lib/components/OfflineBanner.svelte';
	import { fetchSharedRoutine } from '$lib/utils/share';

	let activeView = $state('hoy');
	let isOnboarded = $state(false);
	let ready = $state(false);
	let showAuth = $state(false);
	let showLanding = $state(false);
	let modalVisible = $state(false);
	let modalExercise = $state('');
	let modalType = $state<'pesas' | 'cardio'>('pesas');
	let wizardVisible = $state(false);
	let guideVisible = $state(false);
	let toast: Toast;
	const VIEW_INDEX: Record<string, number> = { hoy: 0, prog: 1, hist: 2, perfil: 3 };
	let slideDir = $state<'left' | 'right'>('left');

	function switchView(view: string) { slideDir = VIEW_INDEX[view] > VIEW_INDEX[activeView] ? 'left' : 'right'; activeView = view; }
	function openModal(name: string, type: 'pesas' | 'cardio') { modalExercise = name; modalType = type; modalVisible = true; }
	function showToast(msg: string) { toast?.show(msg); }
	function onWizardComplete() { isOnboarded = true; wizardVisible = false; }
	function relaunchWizard() { wizardVisible = true; }
	function openGuide() { guideVisible = true; }
	function openLogin() { showAuth = true; }
	async function startFromLanding() {
		showLanding = false;
		const u = get(user);
		if (u) {
			await db.init();
			db.setOnboarded();
			isOnboarded = true;
			const data = get(db);
			if (!Object.values(data.routine).some(d => d.exercises?.length > 0)) {
				wizardVisible = true;
			}
		} else {
			showAuth = true;
		}
	}
	function skipToWizard() { showLanding = false; wizardVisible = true; }

	async function onAuthComplete() {
		showAuth = false;
		const u = get(user);
		if (u) {
			await db.init();
			db.setOnboarded();
			isOnboarded = true;
			const data = get(db);
			if (!Object.values(data.routine).some(d => d.exercises?.length > 0)) {
				wizardVisible = true;
			}
		} else {
			if (!db.isOnboarded()) wizardVisible = true;
			else isOnboarded = true;
		}
	}

	let initError = $state('');

	function enterApp(runWizardCheck = false) {
		isOnboarded = true;
		ready = true;
		db.init().then(() => {
			if (runWizardCheck) {
				const data = get(db);
				if (!Object.values(data.routine).some(d => d.exercises?.length > 0)) {
					wizardVisible = true;
				}
			}
		}).catch(() => {});
	}

	onMount(async () => {
		const wasOnboarded = db.isOnboarded();
		const hasCode = typeof window !== 'undefined' && window.location.search.includes('code=');

		// 1. Wait for Supabase to process everything (including PKCE exchange if ?code= present)
		try {
			await initAuth();
		} catch {}

		// Clean up OAuth code from URL after PKCE exchange (codes are single-use)
		if (hasCode) {
			window.history.replaceState({}, '', window.location.pathname);
		}

		const u = get(user);

		// 2. Decide what to show
		if (u) {
			// Logged in user → app
			db.setOnboarded();
			enterApp(!wasOnboarded);
		} else if (wasOnboarded) {
			// Guest who was onboarded → app with local data
			isOnboarded = true;
			ready = true;
		} else {
			// New user → landing
			showLanding = true;
			ready = true;
		}

		// 3. Start notification reminder
		startReminderCheck(() => {
			const today = new Date().toISOString().split('T')[0];
			const data = get(db);
			return data.sessions.some(s => s.date === today && s.entries?.length > 0);
		});

		// 4. Check for shared routine import
		if (typeof window !== 'undefined' && window.location.hash.startsWith('#r=')) {
			const code = window.location.hash.slice(3);
			if (code) {
				const imported = await fetchSharedRoutine(code);
				if (imported && window.confirm('Quieres importar esta rutina compartida?')) {
					db.saveRoutine(imported);
					db.setOnboarded();
					isOnboarded = true;
					showToast('Rutina importada');
				}
			}
			window.history.replaceState({}, '', window.location.pathname);
		}

		// 5. Listen for auth from Auth screen (Google login from within the app)
		return user.subscribe(u => {
			if (u && (showAuth || showLanding)) {
				showAuth = false;
				showLanding = false;
				db.setOnboarded();
				enterApp(true);
			}
		});
	});
</script>

{#if initError}
	<div style="position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:20px;">
		<div style="color:#f87171;margin-bottom:8px;">
			<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
		</div>
		<div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:#f2f2f2;">Error al cargar</div>
		<div style="font-family:'DM Mono',monospace;font-size:11px;color:#777;text-align:center;max-width:300px;">{initError}</div>
		<button onclick={() => window.location.reload()} style="background:#E8FF3A;color:#000;border:none;border-radius:12px;padding:12px 24px;font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;cursor:pointer;margin-top:8px;">
			REINTENTAR
		</button>
	</div>
{:else if !ready}
	<div style="position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;">
		<div style="text-align:center;">
			<div style="
				font-family:'Bebas Neue',sans-serif;
				font-size:56px;
				color:#E8FF3A;
				letter-spacing:6px;
				animation:logoGlow 2s ease-in-out infinite;
				text-shadow:0 0 20px rgba(232,255,58,0.4), 0 0 40px rgba(232,255,58,0.15);
			">GYM</div>
			<div style="
				display:flex;
				align-items:center;
				justify-content:center;
				gap:4px;
				margin-top:16px;
				font-family:'DM Mono',monospace;
				font-size:11px;
				color:#444;
				letter-spacing:2px;
			">
				<span style="animation:dotPulse 1.4s ease-in-out infinite 0s;">.</span>
				<span style="animation:dotPulse 1.4s ease-in-out infinite 0.2s;">.</span>
				<span style="animation:dotPulse 1.4s ease-in-out infinite 0.4s;">.</span>
			</div>
		</div>
		{@html `<style>
			@keyframes logoGlow {
				0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(232,255,58,0.4), 0 0 40px rgba(232,255,58,0.15); }
				50% { opacity: 0.85; text-shadow: 0 0 30px rgba(232,255,58,0.6), 0 0 60px rgba(232,255,58,0.25); }
			}
			@keyframes dotPulse {
				0%, 100% { opacity: 0.2; transform: translateY(0); }
				50% { opacity: 1; transform: translateY(-3px); }
			}
		</style>`}
	</div>
{:else}
	<OfflineBanner />

	{#if showLanding}
		<div class="landing">
			<!-- Hero -->
			<div class="landing-section landing-hero-section">
				<div class="landing-logo">GYM</div>
				<div class="landing-tagline">Tu entrenamiento, simplificado</div>
				<div class="landing-hero-sub">Registra, analiza y mejora. Gratis.</div>
			</div>

			<!-- Features -->
			<div class="landing-section">
				<div class="landing-section-title">Todo lo que necesitas</div>
				<div class="landing-grid">
					<div class="landing-feat">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><rect x="2" y="9" width="4" height="6" rx="1.5"/><rect x="18" y="9" width="4" height="6" rx="1.5"/></svg>
						<div><b>Registra ejercicios</b><span>Series, reps, peso, cardio y mas</span></div>
					</div>
					<div class="landing-feat">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
						<div><b>Visualiza tu progreso</b><span>Graficas, PRs y tendencias</span></div>
					</div>
					<div class="landing-feat">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
						<div><b>Funciona sin internet</b><span>Entrena donde sea</span></div>
					</div>
					<div class="landing-feat">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.52 0 7-3.58 7-7.5 0-4.05-3.5-7.5-7-10.5-3.5 3-7 6.45-7 10.5C5 18.42 7.03 22 12 22z"/></svg>
						<div><b>Rutinas personalizadas</b><span>Adaptadas a tu nivel y objetivo</span></div>
					</div>
					<div class="landing-feat">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>
						<div><b>Metricas de salud</b><span>IMC, TMB, TDEE, peso ideal</span></div>
					</div>
					<div class="landing-feat">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
						<div><b>Sync en la nube</b><span>Tus datos seguros con cuenta</span></div>
					</div>
				</div>
			</div>

			<!-- Testimonials -->
			<div class="landing-section">
				<div class="landing-section-title">Lo que dicen los usuarios</div>
				<div class="landing-testimonials">
					<div class="landing-testimonial">
						<div class="landing-testimonial-text">"Por fin una app de gym que no tiene anuncios y es facil de usar. La uso todos los dias."</div>
						<div class="landing-testimonial-author">— Carlos M.</div>
					</div>
					<div class="landing-testimonial">
						<div class="landing-testimonial-text">"Me encanta ver mi progreso en las graficas. Me motiva a seguir entrenando."</div>
						<div class="landing-testimonial-author">— Maria L.</div>
					</div>
					<div class="landing-testimonial">
						<div class="landing-testimonial-text">"La sugerencia de peso es genial. Ya no tengo que pensar cuanto poner."</div>
						<div class="landing-testimonial-author">— Andres R.</div>
					</div>
				</div>
			</div>

			<!-- CTA -->
			<div class="landing-section" style="text-align:center;padding-bottom:48px">
				<div class="landing-section-title">Empieza gratis hoy</div>
				<div style="color:var(--muted);font-family:'DM Mono',monospace;font-size:11px;margin-bottom:24px">Sin anuncios. Sin limites. Para siempre.</div>
				<button class="landing-cta" onclick={startFromLanding}>COMENZAR</button>
				<button class="landing-skip" onclick={skipToWizard}>Continuar sin cuenta</button>
			</div>
		</div>
	{/if}

	{#if showAuth}
		<Auth oncomplete={onAuthComplete} />
	{/if}

	{#if !showAuth && !showLanding && (!isOnboarded || wizardVisible)}
		<Wizard bind:visible={wizardVisible} oncomplete={onWizardComplete} />
	{/if}

	{#if !showAuth && !showLanding && isOnboarded}
		<div id="app">
			<Header />
			<div class="scroll" id="scroll">
				{#if activeView === 'hoy'}
					<div class="view active slide-{slideDir}"><ViewHoy onopenmodal={openModal} ontoast={showToast} /></div>
				{:else if activeView === 'prog'}
					<div class="view active slide-{slideDir}"><ViewProgreso ontoast={showToast} /></div>
				{:else if activeView === 'hist'}
					<div class="view active slide-{slideDir}"><ViewHistorial /></div>
				{:else if activeView === 'perfil'}
					<div class="view active slide-{slideDir}"><ViewPerfil ontoast={showToast} onrelaunch={relaunchWizard} onopenguide={openGuide} onlogin={openLogin} /></div>
				{/if}
			</div>
			<Nav active={activeView} onswitch={switchView} />
		</div>
	{/if}

	<ExerciseModal bind:visible={modalVisible} exerciseName={modalExercise} exerciseType={modalType} ontoast={showToast} />
	<GymGuide bind:visible={guideVisible} />
{/if}

<Toast bind:this={toast} />
