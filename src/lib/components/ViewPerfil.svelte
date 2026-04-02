<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/stores/db';
	import { signOut } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { getExerciseInfo, getExerciseMuscleGroup } from '$lib/data/exercises';
	import ExercisePicker from '$lib/components/ExercisePicker.svelte';

	let userEmail = $state<string | null>(null);
	let emailLoading = $state(true);

	onMount(async () => {
		const { data } = await supabase.auth.getSession();
		userEmail = data.session?.user?.email ?? null;
		emailLoading = false;
	});
	import type { Profile, DayRoutine, ExerciseRef } from '$lib/data/types';

	// ── Constants ──
	const FEEDBACK_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfLQckaUxUdv0gEPzD7PS1UxdjiTVidmkqTCDjPf9IgBLU29A/viewform';

	const IMC_C = [
		{ max: 18.5, label: 'Bajo peso', color: '#3ab4ff' },
		{ max: 25, label: 'Peso normal', color: '#3aff8a' },
		{ max: 30, label: 'Sobrepeso', color: '#ffaa3a' },
		{ max: 35, label: 'Obesidad I', color: '#ff4d4d' },
		{ max: 999, label: 'Obesidad II+', color: '#ff4d4d' }
	];

	const DK_WEEK = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;
	const DL: Record<string, string> = {
		lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
		jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
	};
	const DK_MAP = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

	const MUSCLE_COLORS: Record<string, string> = {
		'Pecho': '#f87171', 'Tríceps': '#fb923c', 'Hombros': '#fbbf24',
		'Espalda': '#60a5fa', 'Bíceps': '#818cf8', 'Cuádriceps': '#4ade80',
		'Isquiotibiales': '#34d399', 'Glúteos': '#2dd4bf', 'Pantorrillas': '#6ee7b7',
		'Core': '#f59e0b', 'Cardio': '#38bdf8'
	};

	const ACT_MULT = [1.2, 1.375, 1.55, 1.725, 1.9];
	const ACT_LABELS = ['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy activo'];
	const ACT_EXAMPLES = [
		'Oficina, sin ejercicio', 'Caminar, 1-2 días gym',
		'3-4 días gym', '5-6 días gym', '2x al día, trabajo físico'
	];

	const IMPORT_PROMPT = `Convierte mi rutina de gym al siguiente formato JSON. Responde SOLO con el JSON, sin explicaciones.

El formato es:
{
  "routine": {
    "lunes": { "label": "Nombre del día", "rest": false, "exercises": [{"name": "Nombre ejercicio", "type": "pesas"}] },
    "martes": { "label": "Descanso", "rest": true, "exercises": [] },
    "miercoles": { "label": "...", "rest": false, "exercises": [...] },
    "jueves": { "label": "...", "rest": false, "exercises": [...] },
    "viernes": { "label": "...", "rest": false, "exercises": [...] },
    "sabado": { "label": "Descanso", "rest": true, "exercises": [] },
    "domingo": { "label": "Descanso", "rest": true, "exercises": [] }
  },
  "sessions": [],
  "profile": { "name": "", "age": "", "sex": "H", "height": "", "weight": "" },
  "objective": "hipertrofia",
  "bw": []
}

Reglas:
- Los días siempre son: lunes, martes, miercoles, jueves, viernes, sabado, domingo (sin tildes)
- "type" es "pesas" para ejercicios con peso y "cardio" para cardio
- "rest": true para días de descanso, false para días de entrenamiento
- "label" es el nombre del tipo de entrenamiento (ej: "Push", "Pull", "Legs", "Full Body")
- "objective" puede ser: "hipertrofia", "fuerza" o "resistencia"

Mi rutina es:
`;

	// ── Props ──
	let { ontoast = (msg: string) => {}, onopenguide = () => {}, onrelaunch = () => {} }: {
		ontoast?: (msg: string) => void;
		onopenguide?: () => void;
		onrelaunch?: () => void;
	} = $props();

	// ── Reactive DB state ──
	// $db auto-subscribes in .svelte files; alias for readability
	let dbData = $derived($db);

	// ── Local state ──
	let bwInput = $state('');
	let bwExpanded = $state(false);
	let bwChartCanvas: HTMLCanvasElement;
	let bwChartInstance: { destroy: () => void } | null = null;

	// Dropdowns
	let rutinaOpen = $state(false);
	let datosOpen = $state(false);
	let appOpen = $state(false);
	let openDays = $state<Record<string, boolean>>({});
	let confirmDelete = $state(false);

	let profileSaved = $state(false);

	// Derived weight unit from profile
	let weightUnit = $derived(dbData.profile.weightUnit || 'kg');

	// Profile form local values
	let pName = $state('');
	let pAge = $state('');
	let pHeight = $state('');
	let pWeight = $state('');
	let pSex = $state<'H' | 'M'>('H');
	let pWeightUnit = $state<'kg' | 'lb'>('kg');
	let pActivityLevel = $state(2);

	// File input ref
	let fileInput: HTMLInputElement;

	// PWA install
	let deferredPrompt: Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null = null;
	let showInstall = $state(false);

	// ── Derived: profile header stats ──
	let profileName = $derived(dbData.profile.name || 'Usuario');

	let totalSessions = $derived(
		dbData.sessions.filter(s => s.entries?.length).length
	);

	let totalExercises = $derived.by(() => {
		const names = new Set<string>();
		dbData.sessions.forEach(s => s.entries?.forEach(e => names.add(e.exercise)));
		return names.size;
	});

	let latestBW = $derived(
		dbData.bw.length ? dbData.bw[dbData.bw.length - 1].v : (parseFloat(dbData.profile.weight) || '—')
	);

	let streak = $derived.by(() => calcStreak());

	// ── Derived: body weight history ──
	let bwRecords = $derived(dbData.bw);
	let bwReversed = $derived([...bwRecords].reverse());
	let bwVisible = $derived(bwExpanded ? bwReversed : bwReversed.slice(0, 3));
	let bwHasMore = $derived(bwReversed.length > 3);

	// ── Derived: health metrics ──
	let healthMetrics = $derived.by(() => computeHealth());

	// ── Derived: routine ──
	let routine = $derived(dbData.routine);

	// ── Lifecycle ──
	onMount(() => {
		// Load profile into form
		const p = dbData.profile;
		pName = p.name || '';
		pAge = p.age || '';
		pHeight = p.height || '';
		pWeight = p.weight || '';
		pSex = p.sex || 'H';
		pWeightUnit = p.weightUnit || 'kg';
		pActivityLevel = p.activityLevel ?? 2;

		// Render BW chart
		renderBWChart();

		// PWA install event
		window.addEventListener('beforeinstallprompt', (e: Event) => {
			e.preventDefault();
			deferredPrompt = e as typeof deferredPrompt;
			showInstall = true;
		});

		return () => {
			if (bwChartInstance) bwChartInstance.destroy();
		};
	});

	// Re-render chart when bw data changes
	$effect(() => {
		// track bwRecords
		const _len = bwRecords.length;
		if (bwChartCanvas) renderBWChart();
	});

	// ── Helper functions ──
	function today(): string {
		return new Date().toISOString().split('T')[0];
	}

	function fmtD(dateStr: string): string {
		if (!dateStr) return '';
		const parts = dateStr.split('-');
		if (parts.length < 3) return dateStr;
		return `${parts[2]}/${parts[1]}`;
	}

	function fmtDF(dateStr: string): string {
		if (!dateStr) return '';
		const parts = dateStr.split('-');
		if (parts.length < 3) return dateStr;
		return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
	}

	function calcStreak(): number {
		const hasTrainingDays = Object.values(dbData.routine).some(d => d && !d.rest);
		if (!hasTrainingDays || !dbData.sessions.length) return 0;

		const dates = new Set(
			dbData.sessions.filter(s => s.entries?.length > 0).map(s => s.date)
		);
		let n = 0;
		const d = new Date();
		if (!dates.has(today())) d.setDate(d.getDate() - 1);
		let maxIter = 400;
		while (maxIter-- > 0) {
			const k = d.toISOString().split('T')[0];
			const dk = DK_MAP[d.getDay()];
			const isRest = dbData.routine[dk]?.rest;
			if (isRest) { d.setDate(d.getDate() - 1); continue; }
			if (!dates.has(k)) break;
			n++;
			d.setDate(d.getDate() - 1);
		}
		return n;
	}

	function getDayFocus(exercises: ExerciseRef[]): string {
		if (!exercises || !exercises.length) return '';
		const counts: Record<string, number> = {};
		exercises.forEach(ex => {
			const info = getExerciseInfo(ex.name);
			const primary = info?.muscleGroup?.[0] || getExerciseMuscleGroup(ex.name);
			if (primary && primary !== 'Otro') counts[primary] = (counts[primary] || 0) + 1;
		});
		const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
		if (!sorted.length) return '';
		if (sorted[0][0] === 'Cardio' && sorted[0][1] >= exercises.length * 0.5) return 'Cardio';
		const main = sorted.filter(([, c]) => c >= 2).slice(0, 3);
		if (!main.length) return sorted.slice(0, 2).map(([g]) => g).join(' + ');
		return main.map(([g]) => g).join(' + ');
	}

	function otherDaysWithExercises(dk: string): string[] {
		return DK_WEEK.filter(d =>
			d !== dk && dbData.routine[d] && !dbData.routine[d].rest && dbData.routine[d].exercises?.length > 0
		);
	}

	// ── Health metrics computation ──
	function computeHealth() {
		const h = parseFloat(pHeight);
		const wRaw = parseFloat(pWeight);
		const age = parseInt(pAge) || 25;
		const sex = pSex;
		const actLevel = pActivityLevel;
		const unit = pWeightUnit;

		if (!h || !wRaw || h < 50 || wRaw < 20) return null;

		// Convert to kg for internal calculations
		const w = unit === 'lb' ? wRaw * 0.453592 : wRaw;
		const hm = h / 100;

		// Helper to display weight in user's unit
		const toDisplay = (kg: number) => unit === 'lb' ? kg / 0.453592 : kg;

		// IMC (always in kg/m^2)
		const imc = w / (hm * hm);
		const cat = IMC_C.find(c => imc < c.max) || IMC_C[IMC_C.length - 1];

		// Peso ideal (4 formulas average) - these formulas return kg
		const hInches = (h / 2.54) - 60;
		const devine = sex === 'H' ? 50 + 2.3 * hInches : 45.5 + 2.3 * hInches;
		const robinson = sex === 'H' ? 52 + 1.9 * hInches : 49 + 1.7 * hInches;
		const miller = sex === 'H' ? 56.2 + 1.41 * hInches : 53.1 + 1.36 * hInches;
		const hamwi = sex === 'H' ? 48 + 2.7 * hInches : 45.5 + 2.2 * hInches;
		const idealMinKg = Math.min(devine, robinson, miller, hamwi);
		const idealMaxKg = Math.max(devine, robinson, miller, hamwi);
		const idealAvg = (devine + robinson + miller + hamwi) / 4;
		const idealMin = toDisplay(idealMinKg).toFixed(1);
		const idealMax = toDisplay(idealMaxKg).toFixed(1);
		const diffIdeal = toDisplay(w - idealAvg).toFixed(1);
		const diffStr = parseFloat(diffIdeal) > 0 ? `+${diffIdeal}${unit}` : `${diffIdeal}${unit}`;

		// TMB (Mifflin-St Jeor) - needs kg and cm
		const tmb = sex === 'H' ? (10 * w + 6.25 * h - 5 * age + 5) : (10 * w + 6.25 * h - 5 * age - 161);

		// TDEE
		const tdee = tmb * ACT_MULT[actLevel];

		// IMC bar segments
		const segments = IMC_C.filter(c => c.max < 999).map((c, i, arr) => {
			const prev = arr[i - 1]?.max || 0;
			const active = imc >= prev && imc < c.max;
			return { color: c.color, active };
		});

		return { imc, cat, idealMin, idealMax, diffStr, tmb, tdee, segments, actLevel };
	}

	// ── Profile save ──
	function saveProfileData() {
		db.saveProfile({
			...dbData.profile,
			name: pName,
			age: pAge,
			height: pHeight,
			weight: pWeight,
			weightUnit: pWeightUnit,
			sex: pSex,
			activityLevel: pActivityLevel
		});
		profileSaved = true;
		setTimeout(() => (profileSaved = false), 1500);
	}

	function handleProfileInput() {
		saveProfileData();
	}

	function setSex(s: 'H' | 'M') {
		pSex = s;
		saveProfileData();
	}

	function setActivity(level: number) {
		pActivityLevel = level;
		saveProfileData();
	}

	// ── Body weight ──
	function logBW() {
		const v = parseFloat(bwInput);
		if (!v || v < 20 || v > 400) { ontoast('Peso no valido'); return; }
		const newBW = [...dbData.bw, { date: today(), v }].sort((a, b) => a.date.localeCompare(b.date));
		db.saveBW(newBW);
		bwInput = '';
		pWeight = String(v);
		saveProfileData();
		ontoast('Peso registrado');
	}

	function delBW(originalIndex: number) {
		const newBW = [...dbData.bw];
		newBW.splice(originalIndex, 1);
		db.saveBW(newBW);
	}

	async function renderBWChart() {
		if (!bwChartCanvas) return;
		const bws = dbData.bw;
		if (bws.length < 2) {
			if (bwChartInstance) { bwChartInstance.destroy(); bwChartInstance = null; }
			return;
		}
		const ChartModule = await import('chart.js/auto');
		const Chart = ChartModule.default;
		if (bwChartInstance) { bwChartInstance.destroy(); bwChartInstance = null; }
		bwChartInstance = new Chart(bwChartCanvas.getContext('2d')!, {
			type: 'line',
			data: {
				labels: bws.map(b => fmtD(b.date)),
				datasets: [{
					data: bws.map(b => b.v),
					borderColor: '#3ab4ff',
					backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
						const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 100);
						g.addColorStop(0, 'rgba(58,180,255,0.18)');
						g.addColorStop(1, 'rgba(58,180,255,0)');
						return g;
					},
					borderWidth: 2,
					pointBackgroundColor: '#3ab4ff',
					pointRadius: 3,
					fill: true,
					tension: 0.35
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#1a1a1a',
						bodyColor: '#f2f2f2',
						callbacks: { label: (ctx: { raw: number }) => `${ctx.raw} ${weightUnit}` }
					}
				},
				scales: {
					x: { ticks: { color: '#666', font: { size: 8 } }, grid: { color: 'rgba(255,255,255,0.03)' }, border: { color: '#202020' } },
					y: { ticks: { color: '#666', font: { size: 8 } }, grid: { color: 'rgba(255,255,255,0.03)' }, border: { color: '#202020' } }
				}
			}
		});
	}

	// ── Routine management ──
	function toggleDay(dk: string) {
		openDays = { ...openDays, [dk]: !openDays[dk] };
	}

	function toggleRest(dk: string) {
		const newRoutine = { ...dbData.routine };
		newRoutine[dk] = { ...newRoutine[dk], rest: !newRoutine[dk].rest };
		db.saveRoutine(newRoutine);
	}

	function removeEx(dk: string, i: number) {
		const newRoutine = { ...dbData.routine };
		const newExs = [...(newRoutine[dk].exercises || [])];
		newExs.splice(i, 1);
		newRoutine[dk] = { ...newRoutine[dk], exercises: newExs };
		db.saveRoutine(newRoutine);
	}

	function copyDayTo(fromDk: string, toDk: string) {
		const newRoutine = { ...dbData.routine };
		newRoutine[toDk] = {
			...newRoutine[toDk],
			rest: false,
			exercises: [...(newRoutine[fromDk].exercises || [])]
		};
		db.saveRoutine(newRoutine);
		ontoast(`Copiado de ${DL[fromDk]}`);
	}

	let pickerDayKey = $state('');
	let pickerVisible = $state(false);

	function openExercisePicker(dk: string) {
		pickerDayKey = dk;
		pickerVisible = true;
	}

	function onPickerSelect(names: string[]) {
		if (!pickerDayKey) return;
		const newRoutine = { ...dbData.routine };
		const exs = names.map(name => {
			const info = getExerciseInfo(name);
			return { name, type: (info?.zone === 'cardio' ? 'cardio' : 'pesas') as 'pesas' | 'cardio' };
		});
		newRoutine[pickerDayKey] = { ...newRoutine[pickerDayKey], exercises: exs, rest: false };
		db.saveRoutine(newRoutine);
	}

	function moveEx(dk: string, from: number, to: number) {
		if (to < 0) return;
		const newRoutine = { ...dbData.routine };
		const exs = [...(newRoutine[dk].exercises || [])];
		if (to >= exs.length) return;
		const [item] = exs.splice(from, 1);
		exs.splice(to, 0, item);
		newRoutine[dk] = { ...newRoutine[dk], exercises: exs };
		db.saveRoutine(newRoutine);
	}

	// ── Export / Import ──
	async function deleteAllData() {
		// Only clear gym data, not auth tokens
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('gym_sessions');
			localStorage.removeItem('gym_routine');
			localStorage.removeItem('gym_profile');
			localStorage.removeItem('gym_objective');
			localStorage.removeItem('gym_bw');
			localStorage.removeItem('gym_onboarded');
		}
		// Reload store with empty data
		db.reload();
		ontoast('Datos borrados');
		// Launch wizard
		onrelaunch();
		confirmDelete = false;
	}

	function exportData() {
		const json = db.exportData();
		const blob = new Blob([json], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `gym-backup-${today()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		ontoast('Backup exportado');
	}

	function handleImport(ev: Event) {
		const input = ev.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const result = e.target?.result as string;
				const success = db.importData(result);
				if (success) {
					// Reload form values
					const p = dbData.profile;
					pName = p.name || '';
					pAge = p.age || '';
					pHeight = p.height || '';
					pWeight = p.weight || '';
					pSex = p.sex || 'H';
					pActivityLevel = p.activityLevel ?? 2;
					ontoast('Backup restaurado');
				} else {
					ontoast('Error al importar');
				}
			} catch {
				ontoast('Error al importar');
			}
		};
		reader.readAsText(file);
		input.value = '';
	}

	function copyImportPrompt() {
		navigator.clipboard.writeText(IMPORT_PROMPT)
			.then(() => ontoast('Prompt copiado'))
			.catch(() => ontoast('No se pudo copiar'));
	}

	function openFeedback() {
		window.open(FEEDBACK_URL, '_blank');
	}

	function installPWA() {
		if (!deferredPrompt) { ontoast('Abre en tu navegador para instalar'); return; }
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then((r: { outcome: string }) => {
			if (r.outcome === 'accepted') ontoast('App instalada');
			deferredPrompt = null;
			showInstall = false;
		});
	}
</script>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 1. PROFILE HEADER (Greeting + 4 stat cards)           -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="profile-header">
	<div class="ph-greeting">Hola, <span class="ph-name">{profileName}</span></div>
	<div class="ph-stats">
		<div class="ph-stat">
			<span class="ph-stat-ico">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4"/><circle cx="12" cy="3" r="1"/><path d="M6.5 10L12 7l5.5 3"/><rect x="4" y="14" width="16" height="4" rx="2"/><line x1="8" y1="18" x2="8" y2="20"/><line x1="16" y1="18" x2="16" y2="20"/></svg>
			</span>
			<span class="ph-stat-val">{latestBW}</span>
			<span class="ph-stat-lbl">{weightUnit}</span>
		</div>
		<div class="ph-stat">
			<span class="ph-stat-ico">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
			</span>
			<span class="ph-stat-val">{totalSessions}</span>
			<span class="ph-stat-lbl">sesiones</span>
		</div>
		<div class="ph-stat">
			<span class="ph-stat-ico">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><rect x="2" y="9" width="4" height="6" rx="1.5"/><rect x="18" y="9" width="4" height="6" rx="1.5"/></svg>
			</span>
			<span class="ph-stat-val">{totalExercises}</span>
			<span class="ph-stat-lbl">ejercicios</span>
		</div>
		<div class="ph-stat">
			<span class="ph-stat-ico">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4.97 0 7-3.58 7-7.5 0-4.05-3.5-7.5-7-10.5-3.5 3-7 6.45-7 10.5C5 18.42 7.03 22 12 22z"/><path d="M12 22c2 0 3.5-1.5 3.5-4 0-2.5-1.75-4-3.5-5.5C10.25 14 8.5 15.5 8.5 18c0 2.5 1.5 4 3.5 4z"/></svg>
			</span>
			<span class="ph-stat-val">{streak}</span>
			<span class="ph-stat-lbl">racha</span>
		</div>
	</div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 2. BODY WEIGHT REGISTRATION                            -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="psec">
	<div class="plbl plbl-ico">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4"/><circle cx="12" cy="3" r="1"/><path d="M6.5 10L12 7l5.5 3"/><rect x="4" y="14" width="16" height="4" rx="2"/><line x1="8" y1="18" x2="8" y2="20"/><line x1="16" y1="18" x2="16" y2="20"/></svg>
		REGISTRAR PESO
	</div>
	<div class="bw-row">
		<div class="bw-wrap">
			<input class="bwinput" type="number" bind:value={bwInput} placeholder="75.5" step="0.1" min="30" max="300"
				onkeydown={(e) => { if (e.key === 'Enter') logBW(); }}>
			<span class="bwunit">{weightUnit}</span>
		</div>
		<button class="bw-addbtn" onclick={logBW}>+</button>
	</div>

	<div class="bw-chart-box">
		{#if bwRecords.length < 2}
			<div class="bw-chart-empty">Registra al menos 2 pesos para ver la grafica</div>
		{:else}
			<div class="bw-canvas-wrap" style="height:120px;position:relative">
				<canvas bind:this={bwChartCanvas}></canvas>
			</div>
		{/if}
	</div>

	<div class="bw-hist">
		{#each bwVisible as bw, i}
			{@const originalIndex = bwRecords.length - 1 - i}
			<div class="bw-hrow">
				<span class="bw-hdate">{fmtDF(bw.date)}</span>
				<span class="bw-hval">{bw.v} {weightUnit}</span>
				<button class="bw-hdel" onclick={() => { const idx = bwRecords.indexOf(bw); if (idx >= 0) delBW(idx); }}>x</button>
			</div>
		{/each}
		{#if bwHasMore}
			{#if !bwExpanded}
				<button class="bw-more" onclick={() => bwExpanded = true}>Ver {bwReversed.length - 3} mas</button>
			{:else}
				<button class="bw-more" onclick={() => bwExpanded = false}>Ver menos</button>
			{/if}
		{/if}
	</div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 3. HEALTH METRICS (IMC, Peso Ideal, TMB, TDEE)        -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="psec">
	<div class="plbl plbl-ico" style="margin-bottom:8px">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>
		METRICAS DE SALUD
	</div>

	{#if healthMetrics}
		<div class="health-grid">
			<div class="health-card">
				<div class="health-label">IMC</div>
				<div class="health-value" style="color:{healthMetrics.cat.color}">{healthMetrics.imc.toFixed(1)}</div>
				<div class="health-sub" style="color:{healthMetrics.cat.color}">{healthMetrics.cat.label}</div>
			</div>
			<div class="health-card">
				<div class="health-label">PESO IDEAL</div>
				<div class="health-value">{healthMetrics.idealMin}–{healthMetrics.idealMax}</div>
				<div class="health-sub">{healthMetrics.diffStr} del promedio</div>
			</div>
			<div class="health-card">
				<div class="health-label">TMB</div>
				<div class="health-value" style="color:var(--blue)">{Math.round(healthMetrics.tmb)}</div>
				<div class="health-sub">kcal/dia en reposo</div>
			</div>
			<div class="health-card">
				<div class="health-label">TDEE</div>
				<div class="health-value" style="color:var(--green)">{Math.round(healthMetrics.tdee)}</div>
				<div class="health-sub">kcal/dia total</div>
			</div>
		</div>

		<!-- IMC bar -->
		<div class="imc-bar">
			{#each healthMetrics.segments as seg}
				<div class="imc-seg" style="background:{seg.color};opacity:{seg.active ? 1 : 0.15}"></div>
			{/each}
		</div>

		<!-- 4. Disclaimer -->
		<div class="health-disclaimer">Estos valores son aproximaciones orientativas. No sustituyen una valoracion medica profesional.</div>

		<!-- Activity level selector -->
		<div class="health-activity">
			<div class="act-header">
				<span class="act-header-ico">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>
				</span>
				<span class="health-label" style="margin:0">NIVEL DE ACTIVIDAD</span>
			</div>
			<div class="act-row">
				{#each ACT_LABELS as label, i}
					<div class="act-dot" class:active={pActivityLevel === i} onclick={() => setActivity(i)}>
						<span class="act-dot-ico">
							{#if i === 0}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
							{:else if i === 1}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 8H5c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V9c0-.6-.4-1-1-1z" fill="none"/></svg>
							{:else if i === 2}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><rect x="2" y="9" width="4" height="6" rx="1.5"/><rect x="18" y="9" width="4" height="6" rx="1.5"/></svg>
							{:else if i === 3}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4.97 0 7-3.58 7-7.5 0-4.05-3.5-7.5-7-10.5-3.5 3-7 6.45-7 10.5C5 18.42 7.03 22 12 22z"/><path d="M12 22c2 0 3.5-1.5 3.5-4 0-2.5-1.75-4-3.5-5.5C10.25 14 8.5 15.5 8.5 18c0 2.5 1.5 4 3.5 4z"/></svg>
							{/if}
						</span>
					</div>
				{/each}
			</div>
			<div class="act-detail">
				<div class="act-detail-name">{ACT_LABELS[pActivityLevel]}</div>
				<div class="act-detail-desc">{ACT_EXAMPLES[pActivityLevel]} &middot; multiplicador x{ACT_MULT[pActivityLevel]}</div>
			</div>
		</div>
	{:else}
		<div style="color:var(--muted2);font-size:11px;text-align:center;padding:10px 0;font-family:'DM Mono',monospace">
			Completa tus datos para ver metricas
		</div>
	{/if}
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 5. MI RUTINA (7 days, expandable)                      -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="psec drop-card">
	<div class="drop-header" onclick={() => rutinaOpen = !rutinaOpen}>
		<span class="drop-title drop-title-ico">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>
			MI RUTINA
		</span>
		<span class="drop-arrow" style="transform:{rutinaOpen ? 'rotate(90deg)' : ''}">&#x203A;</span>
	</div>
	{#if rutinaOpen}
		<div class="drop-body open">
			{#each DK_WEEK as dk}
				{@const day = routine[dk] || { label: '', rest: true, exercises: [] }}
				{@const isRest = day.rest}
				{@const exList = day.exercises || []}
				{@const focus = getDayFocus(exList)}
				{@const exCount = exList.length}
				{@const dayOpen = openDays[dk] || false}

				<div class="day-block" class:day-rest={isRest}>
					<div class="day-hdr" onclick={() => toggleDay(dk)}>
						<div class="day-hdr-left">
							<span class="day-letter">{DL[dk].charAt(0)}</span>
							<div>
								<div class="day-name">
									{DL[dk].toUpperCase()}
									{#if !isRest && day.label}
										<span class="day-label-tag">{day.label}</span>
									{/if}
								</div>
								<div class="day-sub">
									{#if isRest}
										Descanso
									{:else if exCount}
										{exCount} ejercicios &middot; {focus}
									{:else}
										Toca para configurar
									{/if}
								</div>
							</div>
						</div>
						<div class="day-tog" style="transform:{dayOpen ? 'rotate(90deg)' : ''}">&#x203A;</div>
					</div>

					{#if dayOpen}
						<div class="day-body open">
							<!-- Rest toggle -->
							<div class="tog-row">
								<div class="tog" class:on={isRest} onclick={() => toggleRest(dk)}>
									<div class="tog-knob"></div>
								</div>
								<span class="tog-lbl">Dia de descanso</span>
							</div>

							{#if !isRest}
								<div>
									<!-- Exercise list -->
									{#each exList as ex, i}
										{@const mg = getExerciseInfo(ex.name)?.muscleGroup?.[0] || 'Otro'}
										{@const color = MUSCLE_COLORS[mg] || '#777'}
										<div class="exrow">
											<span class="exrow-num">{i + 1}</span>
											<span class="exrow-name">{ex.name}</span>
											<span class="exrow-mg" style="color:{color};border-color:{color}33;background:{color}0d">{mg}</span>
											<button class="exrow-del" style="margin-left:auto" onclick={() => {
												if (i > 0) moveEx(dk, i, i - 1);
											}}>&#x2191;</button>
											<button class="exrow-del" onclick={() => {
												if (i < exList.length - 1) moveEx(dk, i, i + 1);
											}}>&#x2193;</button>
											<button class="exrow-del" onclick={() => removeEx(dk, i)}>x</button>
										</div>
									{/each}

									<!-- Add exercise -->
									<button class="copy-day-btn" style="margin-top:8px;width:100%;padding:10px;font-size:11px" onclick={() => openExercisePicker(dk)}>
										+ AGREGAR EJERCICIOS
									</button>

									<!-- Copy from other day -->
									{#if otherDaysWithExercises(dk).length}
										<div class="routine-actions" style="margin-top:6px">
											<span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted)">Copiar de:</span>
											{#each otherDaysWithExercises(dk) as fromDk}
												<button class="copy-day-btn" onclick={() => copyDayTo(fromDk, dk)} style="font-size:10px;margin:2px">
													{DL[fromDk]}
												</button>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 6. DATOS PERSONALES (Personal data form)               -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="psec drop-card">
	<div class="drop-header" onclick={() => datosOpen = !datosOpen}>
		<span class="drop-title drop-title-ico">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
			DATOS PERSONALES
			{#if profileSaved}<span class="save-indicator">✓</span>{/if}
		</span>
		<span class="drop-arrow" style="transform:{datosOpen ? 'rotate(90deg)' : ''}">&#x203A;</span>
	</div>
	{#if datosOpen}
		<div class="drop-body open">
			<div class="pfield">
				<div class="plbl">NOMBRE</div>
				<input class="pinput" type="text" bind:value={pName} placeholder="Tu nombre" oninput={handleProfileInput}>
			</div>
			<div class="p2">
				<div class="pfield">
					<div class="plbl">EDAD</div>
					<input class="pinput pnum" type="number" bind:value={pAge} placeholder="25" min="10" max="99" oninput={handleProfileInput}>
				</div>
				<div class="pfield">
					<div class="plbl">SEXO</div>
					<div class="sex-row">
						<div class="sex-btn" class:active={pSex === 'H'} onclick={() => setSex('H')}>HOMBRE</div>
						<div class="sex-btn" class:active={pSex === 'M'} onclick={() => setSex('M')}>MUJER</div>
					</div>
				</div>
			</div>
			<div class="p2">
				<div class="pfield">
					<div class="plbl">ALTURA (cm)</div>
					<input class="pinput pnum" type="number" bind:value={pHeight} placeholder="175" min="100" max="230" oninput={handleProfileInput}>
				</div>
				<div class="pfield">
					<div class="plbl">PESO ({pWeightUnit})</div>
					<div style="display:flex;gap:6px;align-items:center">
						<input class="pinput pnum" type="number" bind:value={pWeight} placeholder={pWeightUnit === 'lb' ? '165' : '75'} min="30" max={pWeightUnit === 'lb' ? '660' : '300'} step="0.1" oninput={handleProfileInput} style="flex:1">
						<div class="sex-row" style="min-width:80px">
							<div class="sex-btn" class:active={pWeightUnit === 'kg'} onclick={() => { pWeightUnit = 'kg'; saveProfileData(); }}>kg</div>
							<div class="sex-btn" class:active={pWeightUnit === 'lb'} onclick={() => { pWeightUnit = 'lb'; saveProfileData(); }}>lb</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 7. GUIA DEL GYM                                        -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="psec drop-card">
	<div class="drop-header" onclick={onopenguide}>
		<span class="drop-title drop-title-ico">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
			GUIA DEL GYM
		</span>
		<span class="drop-arrow">&#x203A;</span>
	</div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 8. APP (feedback, export, import, prompt, install)     -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="psec drop-card">
	<div class="drop-header" onclick={() => appOpen = !appOpen}>
		<span class="drop-title drop-title-ico">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
			APP
		</span>
		<span class="drop-arrow" style="transform:{appOpen ? 'rotate(90deg)' : ''}">&#x203A;</span>
	</div>
	{#if appOpen}
		<div class="drop-body open">
			<!-- Feedback -->
			<div style="text-align:center;padding:0 0 10px">
				<div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2);margin-bottom:8px">Ayudanos a mejorar la app</div>
				<button class="feedback-btn" onclick={openFeedback}>ENVIAR FEEDBACK</button>
			</div>

			<div style="border-top:1px solid var(--border);padding-top:10px">
				<!-- Export / Import -->
				<div class="backup-row">
					<div class="backup-btn exp" onclick={exportData}>
						<div class="backup-lbl">EXPORTAR</div>
						<div class="backup-sub">Guardar JSON</div>
					</div>
					<label class="backup-btn imp" style="cursor:pointer">
						<div class="backup-lbl">IMPORTAR</div>
						<div class="backup-sub">Restaurar JSON</div>
						<input type="file" accept=".json" style="display:none" bind:this={fileInput} onchange={handleImport}>
					</label>
				</div>

				<!-- Import prompt tip -->
				<div class="import-tip">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
					<div>
						<p>Ya tienes una rutina? Copia el prompt, pegalo en <b>ChatGPT</b> junto con tu rutina y te devolvera un JSON para importar.</p>
						<button class="wiz-copy-prompt" onclick={copyImportPrompt} style="margin-top:6px">COPIAR PROMPT</button>
					</div>
				</div>

				<!-- Install PWA -->
				{#if showInstall}
					<button class="install-btn" onclick={installPWA}>INSTALAR APP</button>
				{/if}
			</div>

			<!-- Delete all data -->
			<div style="border-top:1px solid var(--border);padding-top:14px;margin-top:14px">
				{#if !confirmDelete}
					<button style="width:100%;padding:12px;background:none;border:1px solid var(--red);color:var(--red);border-radius:var(--radius-md);font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1.5px;cursor:pointer;-webkit-tap-highlight-color:transparent" onclick={() => confirmDelete = true}>
						BORRAR TODOS LOS DATOS
					</button>
					<div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);text-align:center;margin-top:8px;line-height:1.5">
						Esto eliminara todas tus sesiones, rutina, perfil y peso registrado. No se puede deshacer.
					</div>
				{:else}
					<div style="text-align:center;padding:8px 0">
						<div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--red);margin-bottom:12px">
							¿Estas seguro? Se borrara todo.
						</div>
						<div style="display:flex;gap:8px">
							<button style="flex:1;padding:12px;background:var(--red);color:#fff;border:none;border-radius:var(--radius-md);font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;cursor:pointer" onclick={deleteAllData}>
								SI, BORRAR TODO
							</button>
							<button style="flex:1;padding:12px;background:var(--card2);color:var(--text);border:1px solid var(--border2);border-radius:var(--radius-md);font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;cursor:pointer" onclick={() => confirmDelete = false}>
								CANCELAR
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 9. CREATOR SECTION                                     -->
<!-- ═══════════════════════════════════════════════════════ -->
<!-- ═══════════════════════════════════════════════════════ -->
<!-- ACCOUNT SECTION                                        -->
<!-- ═══════════════════════════════════════════════════════ -->
{#if emailLoading}
<div class="psec" style="text-align:center;padding:16px;">
	<div class="skeleton skeleton-text" style="width:100px;margin:0 auto 8px"></div>
	<div class="skeleton skeleton-text" style="width:180px;margin:0 auto 12px"></div>
</div>
{:else if userEmail}
<div class="psec" style="text-align:center;padding:16px;">
	<div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2);margin-bottom:8px;">Conectado como</div>
	<div style="font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);margin-bottom:12px;">{userEmail}</div>
	<button
		onclick={async () => {
			await signOut();
			if (typeof window !== 'undefined') {
				localStorage.clear();
				window.location.href = '/';
			}
		}}
		style="width:100%;padding:12px;background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.2);border-radius:10px;color:#f87171;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;cursor:pointer;-webkit-tap-highlight-color:transparent;"
	>
		CERRAR SESIÓN
	</button>
</div>
{:else}
<div class="psec" style="text-align:center;padding:16px;">
	<div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2);margin-bottom:8px;">No has iniciado sesión</div>
	<div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:12px;">Tus datos solo están en este dispositivo</div>
	<button
		onclick={() => { localStorage.clear(); window.location.href = '/'; }}
		style="width:100%;padding:12px;background:rgba(232,255,58,0.06);border:1px solid rgba(232,255,58,0.2);border-radius:10px;color:var(--accent);font-family:'DM Mono',monospace;font-size:11px;font-weight:500;cursor:pointer;-webkit-tap-highlight-color:transparent;"
	>
		INICIAR SESIÓN
	</button>
</div>
{/if}

<div class="creator">
	<div class="creator-line"></div>
	<div class="creator-info">
		<span class="creator-by">Creado por</span>
		<span class="creator-name">Jean Carlos</span>
	</div>
	<div class="creator-links">
		<a href="https://www.tiktok.com/@naej_lil" target="_blank" rel="noopener" class="creator-link">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
			<span>TikTok</span>
		</a>
		<a href="https://www.instagram.com/naej_lil" target="_blank" rel="noopener" class="creator-link">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
			<span>Instagram</span>
		</a>
		<a href="https://www.paypal.com/paypalme/naejlil" target="_blank" rel="noopener noreferrer" class="creator-link">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
			<span>Apoyar</span>
		</a>
	</div>
</div>

<ExercisePicker bind:visible={pickerVisible} selected={pickerDayKey ? (dbData.routine[pickerDayKey]?.exercises || []).map(e => e.name) : []} onselect={onPickerSelect} />
