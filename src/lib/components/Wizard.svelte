<script lang="ts">
	import { db } from '$lib/stores/db';
	import { get } from 'svelte/store';
	import type { DayKey, Goal, Experience, Sex, Routine, ExerciseEntry } from '$lib/types';
	import type { DayRoutine } from '$lib/data/types';
	import {
		selectTemplate,
		buildRoutineFromWizard,
		adaptExercises,
		getDaysWarning,
		getSuggestedDays,
		goalToObjective
	} from '$lib/utils/routine-builder';
	import { EXERCISE_DB, getExerciseInfo } from '$lib/data/exercises';

	// ── Props ──
	let { visible = $bindable(false), oncomplete }: {
		visible: boolean;
		oncomplete?: () => void;
	} = $props();

	// ── Wizard State ──
	let step = $state<number | 'manual_days' | 'result' | 'manual_build'>(0);
	let wizName = $state('');
	let wizAge = $state('');
	let wizSex = $state<Sex>('H');
	let wizHeight = $state('');
	let wizWeight = $state('');
	let wizUnit = $state<'kg' | 'lb'>('kg');
	let wizHeightUnit = $state<'cm' | 'ft'>('cm');
	let wizFeet = $state('');
	let wizInches = $state('');
	let wizActivityLevel = $state(-1);
	let wizGoal = $state<Goal | null>(null);
	let wizExperience = $state<Experience | null>(null);
	let wizSelectedDays = $state<DayKey[]>([]);
	let wizMode = $state<'auto' | 'manual' | 'import' | null>(null);

	// Manual builder state
	let manualRoutine = $state<Record<string, { label: string; rest: boolean; exercises: ExerciseEntry[] }>>({});
	let showCopyPopupFor = $state<DayKey | null>(null);

	// Exercise picker for manual mode
	let pickerVisible = $state(false);
	let pickerDay = $state<DayKey | null>(null);
	let pickerSearch = $state('');
	let pickerSelected = $state<string[]>([]);

	// Result screen state
	let resultRoutine = $state<Routine | null>(null);
	let expandedDays = $state<Set<string>>(new Set());

	// Toast
	let toastMsg = $state('');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	function showToast(msg: string) {
		toastMsg = msg;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => { toastMsg = ''; }, 2000);
	}

	// ── Derived ──
	const ALL_DAY_KEYS: DayKey[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
	const DAY_LABELS: Record<string, string> = {
		lunes: 'Lunes', martes: 'Martes', miercoles: 'Miercoles',
		jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sabado', domingo: 'Domingo'
	};
	const DAY_SHORT: Record<string, string> = {
		lunes: 'Lun', martes: 'Mar', miercoles: 'Mie', jueves: 'Jue',
		viernes: 'Vie', sabado: 'Sab', domingo: 'Dom'
	};
	const DAY_LETTER: Record<string, string> = {
		lunes: 'L', martes: 'M', miercoles: 'X', jueves: 'J',
		viernes: 'V', sabado: 'S', domingo: 'D'
	};

	const MUSCLE_COLORS: Record<string, string> = {
		'Pecho': '#f87171',
		'Tríceps': '#fb923c',
		'Hombros': '#fbbf24',
		'Espalda': '#60a5fa',
		'Bíceps': '#818cf8',
		'Cuádriceps': '#4ade80',
		'Isquiotibiales': '#34d399',
		'Glúteos': '#2dd4bf',
		'Pantorrillas': '#6ee7b7',
		'Core': '#f59e0b',
		'Cardio': '#38bdf8',
	};

	function getExColor(e: ExerciseEntry): string | null {
		if (e.type === 'cardio') return MUSCLE_COLORS['Cardio'];
		const info = getExerciseInfo(e.name);
		if (info?.muscleGroup?.length) return MUSCLE_COLORS[info.muscleGroup[0]] || null;
		return null;
	}

	let totalDots = $derived(
		wizMode === 'auto' ? 6 : wizMode === 'manual' ? 3 : 1
	);
	let dotStep = $derived.by(() => {
		if (step === 'manual_days') return totalDots; // Last dot for manual day selection
		if (typeof step === 'number') return step > totalDots ? totalDots : step;
		return 1;
	});

	let isInstalled = $derived(
		typeof window !== 'undefined' &&
		(window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true)
	);

	let isIOS = $derived(
		typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
	);

	let suggested = $derived(
		wizMode === 'manual' ? 4 :
		wizExperience ? getSuggestedDays(wizActivityLevel, wizExperience) : 4
	);

	let daysWarning = $derived(
		wizMode !== 'manual' && wizSelectedDays.length && wizExperience
			? getDaysWarning(wizExperience, wizSelectedDays.length)
			: null
	);

	let totalManualEx = $derived(
		wizSelectedDays.reduce((a, dk) => a + (manualRoutine[dk]?.exercises?.length || 0), 0)
	);

	// ── Activity options ──
	const ACTIVITY_OPTS = [
		{ i: 0, l: 'Sedentario', d: 'Trabajo de oficina, sin ejercicio' },
		{ i: 1, l: 'Ligero', d: 'Caminas a diario o 1-2 dias de gym' },
		{ i: 2, l: 'Moderado', d: '3-4 dias de gym por semana' },
		{ i: 3, l: 'Activo', d: '5-6 dias de gym o deporte frecuente' },
		{ i: 4, l: 'Muy activo', d: 'Entrenas 2 veces al dia o trabajo fisico' },
	];

	// Goal options adapted by sex
	let goalOptions = $derived(
		wizSex === 'M' ? [
			{ key: 'musculo' as Goal, title: 'Tonificar y definir', desc: 'Hipertrofia \u00b7 3-4 series \u00d7 10-15 reps \u00b7 Enfoque en gluteos, piernas y core' },
			{ key: 'fuerza' as Goal, title: 'Ganar fuerza', desc: 'Fuerza funcional \u00b7 4-5 series \u00d7 5-8 reps \u00b7 Sentadilla, peso muerto, hip thrust' },
			{ key: 'grasa' as Goal, title: 'Perder grasa', desc: 'Resistencia + cardio \u00b7 3 series \u00d7 15-20 reps \u00b7 Circuitos y HIIT' },
			{ key: 'general' as Goal, title: 'Estar en forma', desc: 'General \u00b7 3 series \u00d7 10-12 reps \u00b7 Equilibrio de todo el cuerpo' },
		] : [
			{ key: 'musculo' as Goal, title: 'Ganar musculo', desc: 'Hipertrofia \u00b7 3-4 series \u00d7 8-12 reps' },
			{ key: 'fuerza' as Goal, title: 'Ganar fuerza', desc: 'Fuerza \u00b7 4-5 series \u00d7 3-6 reps' },
			{ key: 'grasa' as Goal, title: 'Perder grasa', desc: 'Resistencia + cardio \u00b7 3 series \u00d7 12-15 reps' },
			{ key: 'general' as Goal, title: 'Estar en forma', desc: 'General \u00b7 3 series \u00d7 8-12 reps' },
		]
	);

	// ── Picker derived ──
	let pickerFiltered = $derived.by(() => {
		const q = pickerSearch.trim().toLowerCase();
		if (!q) return EXERCISE_DB;
		return EXERCISE_DB.filter(e =>
			e.name.toLowerCase().includes(q) ||
			e.muscleGroup.some(m => m.toLowerCase().includes(q))
		);
	});

	const PICKER_ZONES = [
		{ key: 'superior', label: 'TREN SUPERIOR' },
		{ key: 'inferior', label: 'TREN INFERIOR' },
		{ key: 'core', label: 'CORE' },
		{ key: 'cardio', label: 'CARDIO' },
	];

	// ── Init ──
	$effect(() => {
		if (visible) {
			initWizard();
		}
	});

	// Auto-skip install screen if already installed as PWA
	$effect(() => {
		if (step === 0 && isInstalled) {
			step = 1;
		}
	});

	function initWizard() {
		const current = db.isOnboarded();
		let dbData = get(db);

		if (current) {
			step = 1; // Skip install for re-launch
		} else {
			step = 0;
		}

		const objToGoal: Record<string, Goal> = {
			hipertrofia: 'musculo', fuerza: 'fuerza', resistencia: 'grasa'
		};

		wizName = dbData?.profile?.name || '';
		wizAge = dbData?.profile?.age || '';
		wizSex = dbData?.profile?.sex || 'H';
		wizHeight = dbData?.profile?.height || '';
		wizWeight = dbData?.profile?.weight || '';
		wizUnit = dbData?.profile?.weightUnit || 'kg';
		wizHeightUnit = dbData?.profile?.heightUnit || 'cm';
		if (wizHeightUnit === 'ft' && wizHeight) {
			const totalIn = Math.round(parseFloat(wizHeight) / 2.54);
			wizFeet = String(Math.floor(totalIn / 12));
			wizInches = String(totalIn % 12);
		}
		wizActivityLevel = dbData?.profile?.activityLevel ?? -1;
		wizGoal = null;
		wizExperience = null;
		wizSelectedDays = [];
		wizMode = null;
		manualRoutine = {};
		resultRoutine = null;
		expandedDays = new Set();
		showCopyPopupFor = null;
	}

	function getHeightCm(): string {
		if (wizHeightUnit === 'ft') {
			const ft = parseInt(wizFeet) || 0;
			const inc = parseInt(wizInches) || 0;
			return String(Math.round((ft * 12 + inc) * 2.54));
		}
		return wizHeight;
	}

	// ── Navigation helpers ──
	function goBack() {
		if (step === 'result') { step = 6; return; }
		if (step === 'manual_build') { step = 'manual_days'; return; }
		if (step === 'manual_days') { step = 2; return; }
		if (typeof step === 'number' && step > 1) step = (step - 1) as typeof step;
	}

	function nextProfile() {
		step = 2;
	}

	function selectMode(mode: 'auto' | 'manual') {
		wizMode = mode;
		setTimeout(() => {
			if (mode === 'auto') {
				step = 3;
			} else {
				step = 'manual_days';
			}
		}, 300);
	}

	function importRoutine() {
		// Save profile first
		let dbData = get(db);

		db.saveProfile({
			...dbData.profile,
			name: wizName || dbData.profile.name,
			age: wizAge || dbData.profile.age,
			sex: wizSex || dbData.profile.sex,
			height: getHeightCm() || dbData.profile.height, heightUnit: wizHeightUnit,
			weight: wizWeight || dbData.profile.weight,
			weightUnit: wizUnit || 'kg',
			activityLevel: wizActivityLevel ?? 2,
		});
		db.setOnboarded();
		visible = false;

		// Trigger file picker
		if (typeof document !== 'undefined') {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.json';
			input.onchange = (e: Event) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (!file) return;
				const reader = new FileReader();
				reader.onload = () => {
					const success = db.importData(reader.result as string);
					if (success) {
						showToast('Rutina importada');
						oncomplete?.();
					} else {
						showToast('Error al importar');
					}
				};
				reader.readAsText(file);
			};
			input.click();
		}
	}

	function selectActivity(level: number) {
		wizActivityLevel = level;
		setTimeout(() => { step = 4; }, 300);
	}

	function selectGoal(g: Goal) {
		wizGoal = g;
		setTimeout(() => { step = 5; }, 300);
	}

	function selectExperience(exp: Experience) {
		wizExperience = exp;
		setTimeout(() => { step = 6; }, 300);
	}

	function toggleDay(dk: DayKey) {
		const idx = wizSelectedDays.indexOf(dk);
		if (idx >= 0) {
			wizSelectedDays = wizSelectedDays.filter(d => d !== dk);
		} else if (wizSelectedDays.length < 6) {
			wizSelectedDays = [...wizSelectedDays, dk].sort(
				(a, b) => ALL_DAY_KEYS.indexOf(a) - ALL_DAY_KEYS.indexOf(b)
			);
		}
	}

	// ── Result screen ──
	function showResult() {
		if (!wizExperience || !wizGoal) return;
		const numDays = wizSelectedDays.length;
		const { key: templateKey, templates } = selectTemplate(wizExperience, numDays, wizGoal, wizSex);
		const rawRoutine = buildRoutineFromWizard(templateKey, wizSelectedDays, templates);
		resultRoutine = adaptExercises(rawRoutine, {
			age: wizAge, weight: wizWeight, height: getHeightCm(), heightUnit: wizHeightUnit,
			experience: wizExperience, sex: wizSex, goal: wizGoal,
			activityLevel: wizActivityLevel
		});
		step = 'result';
		expandedDays = new Set();
	}

	function toggleResultDay(dk: string) {
		const next = new Set(expandedDays);
		if (next.has(dk)) next.delete(dk); else next.add(dk);
		expandedDays = next;
	}

	function applyAutoRoutine() {
		if (!resultRoutine) return;
		db.saveRoutine(resultRoutine!);
		db.saveObjective(goalToObjective(wizGoal!));
		db.saveProfile({
			name: wizName || 'Usuario',
			age: wizAge || '25',
			sex: wizSex || 'H',
			height: getHeightCm() || '175', heightUnit: wizHeightUnit,
			weight: wizWeight || '75',
			weightUnit: wizUnit || 'kg',
			restTimerSeconds: 90,
			activityLevel: wizActivityLevel ?? 2,
		});
		db.setOnboarded();
		visible = false;
		showToast('Rutina creada');
		oncomplete?.();
	}

	// ── Manual builder ──
	function initManualBuilder() {
		if (!Object.keys(manualRoutine).length) {
			const r: typeof manualRoutine = {};
			ALL_DAY_KEYS.forEach(dk => {
				if (wizSelectedDays.includes(dk)) {
					r[dk] = { label: 'Entrenamiento', rest: false, exercises: [] };
				} else {
					r[dk] = { label: 'Descanso', rest: true, exercises: [] };
				}
			});
			manualRoutine = r;
		}
		step = 'manual_build';
	}

	function openDayPicker(dk: DayKey) {
		pickerDay = dk;
		pickerSelected = (manualRoutine[dk]?.exercises || []).map(e => e.name);
		pickerSearch = '';
		pickerVisible = true;
	}

	function togglePickerEx(name: string) {
		const idx = pickerSelected.indexOf(name);
		if (idx >= 0) {
			pickerSelected = pickerSelected.filter(n => n !== name);
		} else {
			pickerSelected = [...pickerSelected, name];
		}
	}

	function donePickerManual() {
		if (!pickerDay) return;
		const updated = { ...manualRoutine };
		updated[pickerDay] = {
			...updated[pickerDay],
			exercises: pickerSelected.map(name => {
				const info = getExerciseInfo(name);
				return { name, type: info?.type || 'pesas' } as ExerciseEntry;
			})
		};
		manualRoutine = updated;
		pickerVisible = false;
	}

	function closePicker(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains('overlay')) {
			pickerVisible = false;
		}
	}

	function toggleCopyPopup(dk: DayKey) {
		showCopyPopupFor = showCopyPopupFor === dk ? null : dk;
	}

	function copyDayTo(from: DayKey, to: DayKey) {
		const updated = { ...manualRoutine };
		updated[to] = {
			...updated[to],
			exercises: [...(updated[from]?.exercises || []).map(e => ({ ...e }))]
		};
		manualRoutine = updated;
		showCopyPopupFor = null;
		showToast('Copiado');
	}

	function applyManualRoutine() {
		const full: Record<string, DayRoutine> = {};
		ALL_DAY_KEYS.forEach(dk => {
			full[dk] = manualRoutine[dk] || { label: 'Descanso', rest: true, exercises: [] };
		});
		db.saveRoutine(full as Routine);
		db.saveProfile({
			name: wizName || 'Usuario',
			age: wizAge || '25',
			sex: wizSex || 'H',
			height: getHeightCm() || '175', heightUnit: wizHeightUnit,
			weight: wizWeight || '75',
			weightUnit: wizUnit || 'kg',
			restTimerSeconds: 90,
			activityLevel: wizActivityLevel ?? 2,
		});
		db.saveObjective('hipertrofia');
		db.setOnboarded();
		manualRoutine = {};
		visible = false;
		showToast('Rutina creada');
		oncomplete?.();
	}

	// ── Copy import prompt ──
	function copyImportPrompt() {
		const prompt = `Convierte mi rutina de gym al siguiente formato JSON. Responde SOLO con el JSON, sin explicaciones.

El formato es:
{
  "routine": {
    "lunes": { "label": "Nombre del dia", "rest": false, "exercises": [{"name": "Nombre ejercicio", "type": "pesas"}] },
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
- Los dias siempre son: lunes, martes, miercoles, jueves, viernes, sabado, domingo (sin tildes)
- "type" es "pesas" para ejercicios con peso y "cardio" para cardio
- "rest": true para dias de descanso, false para dias de entrenamiento
- "label" es el nombre del tipo de entrenamiento (ej: "Push", "Pull", "Legs", "Full Body")
- "objective" puede ser: "hipertrofia", "fuerza" o "resistencia"

Mi rutina es:
`;
		navigator.clipboard.writeText(prompt)
			.then(() => showToast('Prompt copiado'))
			.catch(() => showToast('No se pudo copiar'));
	}

	// ── Template name mapping ──
	const SPLIT_NAMES: Record<string, string> = {
		fullbody_3: 'Full Body',
		fullbody_cardio_3: 'Full Body + Cardio',
		upperlower_4: 'Upper / Lower',
		pplul_5: 'PPLUL',
		ppl_6: 'Push / Pull / Legs'
	};
</script>

{#if visible}
<div class="wizard-overlay">
	<div class="wizard">
		<!-- Navigation -->
		{#if step !== 0 && step !== 'result' && step !== 'manual_build'}
			<div style="display:flex;align-items:center;padding:16px var(--margin) 0">
				{#if typeof step === 'number' ? step > 1 : true}
					<button onclick={goBack} style="background:none;border:none;color:var(--muted2);font-family:'DM Mono',monospace;font-size:11px;cursor:pointer;padding:4px 8px;display:flex;align-items:center;gap:4px;-webkit-tap-highlight-color:transparent" aria-label="Volver">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
						Volver
					</button>
				{:else}
					<div style="width:60px"></div>
				{/if}
				<div class="wizard-dots" style="flex:1;justify-content:center">
					{#each Array.from({ length: totalDots }, (_, i) => i + 1) as n}
						<span
							class="wiz-dot"
							class:active={n === dotStep}
							class:done={n < dotStep}
						></span>
					{/each}
				</div>
				<div style="width:60px"></div>
			</div>
		{/if}

		<div class="wizard-content">

			<!-- ═══ STEP 0: INSTALL SCREEN ═══ -->
			{#if step === 0}
				{#if isInstalled}
					<!-- Auto-skip: effect will move to step 1 -->
				{:else}
					<div style="text-align:center;margin-bottom:20px">
						<div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:16px;background:rgba(232,255,58,0.08);border:1px solid rgba(232,255,58,0.2);margin-bottom:16px">
							<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#E8FF3A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
								<polyline points="7 10 12 15 17 10"/>
								<line x1="12" y1="15" x2="12" y2="3"/>
							</svg>
						</div>
						<div class="wiz-title" style="margin-bottom:4px">Instala la app</div>
						<div class="wiz-subtitle">Para que tus datos no se pierdan</div>
					</div>

					{#if isIOS}
						<div class="wiz-install-steps">
							<div class="wiz-is"><span class="wiz-is-n">1</span>Toca el boton de <b>compartir</b> <span style="font-size:16px">&#x2399;</span> en Safari</div>
							<div class="wiz-is"><span class="wiz-is-n">2</span>Selecciona <b>"Anadir a pantalla de inicio"</b></div>
							<div class="wiz-is"><span class="wiz-is-n">3</span>Toca <b>"Anadir"</b> y abre la app desde tu pantalla</div>
						</div>
					{:else}
						<div class="wiz-install-steps">
							<div class="wiz-is"><span class="wiz-is-n">1</span>Toca los <b>tres puntos &#x22ee;</b> en Chrome</div>
							<div class="wiz-is"><span class="wiz-is-n">2</span>Selecciona <b>"Instalar app"</b> o <b>"Anadir a pantalla de inicio"</b></div>
							<div class="wiz-is"><span class="wiz-is-n">3</span>Abre la app desde tu pantalla de inicio</div>
						</div>
					{/if}

					<div style="display:flex;align-items:flex-start;gap:8px;margin-top:14px;padding:10px 12px;background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.15);border-radius:10px">
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f87171" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px">
							<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
						</svg>
						<p style="font-family:'DM Mono',monospace;font-size:10px;color:#999;line-height:1.6;margin:0">
							Si completas el cuestionario en el navegador y luego instalas, <span style="color:#f87171">tendras que repetirlo</span>.
						</p>
					</div>

					<button class="sbtn" onclick={() => { step = 1; }} style="margin-top:20px">YA LA INSTALE</button>
					<button class="wiz-skip-btn" onclick={() => { step = 1; }}>Continuar sin instalar</button>
				{/if}

			<!-- ═══ STEP 1: PERSONAL DATA ═══ -->
			{:else if step === 1}
				<div class="wiz-title">Sobre ti</div>
				<div class="wiz-subtitle">Si no sabes algun dato, dejalo vacio</div>
				<div class="wiz-form">
					<div class="wiz-field">
						<label class="wiz-label">NOMBRE</label>
						<input class="wiz-input" type="text" bind:value={wizName} placeholder="Tu nombre">
					</div>
					<div class="wiz-row">
						<div class="wiz-field">
							<label class="wiz-label">EDAD</label>
							<input class="wiz-input wiz-num" type="number" bind:value={wizAge} placeholder="25" min="10" max="99">
						</div>
						<div class="wiz-field">
							<label class="wiz-label">SEXO</label>
							<div class="wiz-sex-row">
								<div class="wiz-sex" class:active={wizSex === 'H'} onclick={() => { wizSex = 'H'; }}>H</div>
								<div class="wiz-sex" class:active={wizSex === 'M'} onclick={() => { wizSex = 'M'; }}>M</div>
							</div>
						</div>
					</div>
					<div class="wiz-row">
						<div class="wiz-field">
							<label class="wiz-label">ALTURA ({wizHeightUnit === 'ft' ? 'ft/in' : 'cm'})</label>
							<div style="display:flex;gap:4px;align-items:center">
								{#if wizHeightUnit === 'ft'}
									<input class="wiz-input wiz-num" type="number" bind:value={wizFeet} placeholder="5" min="3" max="7" style="flex:1">
									<span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--muted2)">ft</span>
									<input class="wiz-input wiz-num" type="number" bind:value={wizInches} placeholder="10" min="0" max="11" style="flex:1">
									<span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--muted2)">in</span>
								{:else}
									<input class="wiz-input wiz-num" type="number" bind:value={wizHeight} placeholder="175" min="100" max="230" style="flex:1">
								{/if}
								<div class="wiz-sex-row" style="min-width:64px">
									<div class="wiz-sex" class:active={wizHeightUnit === 'cm'} onclick={() => { wizHeightUnit = 'cm'; }} style="font-size:12px;padding:8px">cm</div>
									<div class="wiz-sex" class:active={wizHeightUnit === 'ft'} onclick={() => { wizHeightUnit = 'ft'; }} style="font-size:12px;padding:8px">ft</div>
								</div>
							</div>
						</div>
						<div class="wiz-field">
							<label class="wiz-label">PESO ({wizUnit})</label>
							<div style="display:flex;gap:6px;align-items:center">
								<input class="wiz-input wiz-num" type="number" bind:value={wizWeight} placeholder={wizUnit === 'lb' ? '165' : '75'} min="30" max={wizUnit === 'lb' ? '660' : '300'} step="0.1" style="flex:1">
								<div class="wiz-sex-row" style="min-width:70px">
									<div class="wiz-sex" class:active={wizUnit === 'kg'} onclick={() => { wizUnit = 'kg'; }}>kg</div>
									<div class="wiz-sex" class:active={wizUnit === 'lb'} onclick={() => { wizUnit = 'lb'; }}>lb</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<button class="sbtn" onclick={nextProfile} style="margin-top:16px">CONTINUAR</button>

			<!-- ═══ STEP 2: MODE SELECTION ═══ -->
			{:else if step === 2}
				<div class="wiz-title">Como quieres tu rutina?</div>
				<div class="wiz-subtitle">Elige la opcion que mejor te venga</div>
				<div class="wiz-options">
					<!-- Auto -->
					<div class="wiz-opt" class:active={wizMode === 'auto'} onclick={() => selectMode('auto')}>
						<span class="wiz-emoji wiz-svg-ico">
							<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
							</svg>
						</span>
						<div>
							<span class="wiz-opt-title">Sugiereme una rutina</span>
							<span class="wiz-opt-desc">Te creamos una rutina personalizada segun tus datos y objetivos</span>
						</div>
					</div>
					<!-- Manual -->
					<div class="wiz-opt" class:active={wizMode === 'manual'} onclick={() => selectMode('manual')}>
						<span class="wiz-emoji wiz-svg-ico">
							<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
							</svg>
						</span>
						<div>
							<span class="wiz-opt-title">Crear la mia</span>
							<span class="wiz-opt-desc">Elige tus dias y ejercicios a tu gusto</span>
						</div>
					</div>
					<!-- Import -->
					<div class="wiz-opt" onclick={importRoutine}>
						<span class="wiz-emoji wiz-svg-ico">
							<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
								<polyline points="7 10 12 15 17 10"/>
								<line x1="12" y1="15" x2="12" y2="3"/>
							</svg>
						</span>
						<div>
							<span class="wiz-opt-title">Importar rutina</span>
							<span class="wiz-opt-desc">Importa un JSON de una rutina existente</span>
						</div>
					</div>
				</div>

				<!-- Import tip -->
				<div class="wiz-import-tip">
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
					</svg>
					<div>
						<p>Ya tienes una rutina? Copia el prompt, pegalo en <b>ChatGPT</b> junto con tu rutina y te devolvera un JSON para importar.</p>
						<button class="wiz-copy-prompt" onclick={copyImportPrompt}>COPIAR PROMPT</button>
					</div>
				</div>

			<!-- ═══ STEP 3: ACTIVITY LEVEL ═══ -->
			{:else if step === 3}
				<div class="wiz-title">Tu estilo de vida</div>
				<div class="wiz-subtitle">Esto nos ayuda a calcular tus calorias y sugerirte dias de entrenamiento</div>
				<div class="wiz-options">
					{#each ACTIVITY_OPTS as act}
						<div class="wiz-opt" class:active={wizActivityLevel === act.i} onclick={() => selectActivity(act.i)}>
							<span class="wiz-emoji wiz-svg-ico">
								{#if act.i === 0}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
									</svg>
								{:else if act.i === 1}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M13 4v16"/><path d="M17 4v16"/><rect x="5" y="8" width="14" height="8" rx="1" fill="none"/>
									</svg>
								{:else if act.i === 2}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<line x1="4" y1="12" x2="20" y2="12"/><rect x="2" y="9" width="4" height="6" rx="1.5"/><rect x="18" y="9" width="4" height="6" rx="1.5"/>
									</svg>
								{:else if act.i === 3}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
									</svg>
								{:else}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M12 22c4.97 0 7-3.58 7-7.5 0-4.05-3.5-7.5-7-10.5-3.5 3-7 6.45-7 10.5C5 18.42 7.03 22 12 22z"/>
										<path d="M12 22c2 0 3.5-1.5 3.5-4 0-2.5-1.75-4-3.5-5.5C10.25 14 8.5 15.5 8.5 18c0 2.5 1.5 4 3.5 4z"/>
									</svg>
								{/if}
							</span>
							<div>
								<span class="wiz-opt-title">{act.l}</span>
								<span class="wiz-opt-desc">{act.d}</span>
							</div>
						</div>
					{/each}
				</div>

			<!-- ═══ STEP 4: GOAL ═══ -->
			{:else if step === 4}
				<div class="wiz-title">Cual es tu objetivo?</div>
				<div class="wiz-subtitle">Adaptamos ejercicios, series y repeticiones</div>
				<div class="wiz-options">
					{#each goalOptions as g}
						<div class="wiz-opt" class:active={wizGoal === g.key} onclick={() => selectGoal(g.key)}>
							<span class="wiz-emoji wiz-svg-ico">
								{#if g.key === 'musculo'}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
									</svg>
								{:else if g.key === 'fuerza'}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<line x1="4" y1="12" x2="20" y2="12"/><rect x="2" y="9" width="4" height="6" rx="1.5"/><rect x="18" y="9" width="4" height="6" rx="1.5"/>
									</svg>
								{:else if g.key === 'grasa'}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M12 22c4.97 0 7-3.58 7-7.5 0-4.05-3.5-7.5-7-10.5-3.5 3-7 6.45-7 10.5C5 18.42 7.03 22 12 22z"/>
									</svg>
								{:else}
									<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
									</svg>
								{/if}
							</span>
							<div>
								<span class="wiz-opt-title">{g.title}</span>
								<span class="wiz-opt-desc">{g.desc}</span>
							</div>
						</div>
					{/each}
				</div>

			<!-- ═══ STEP 5: EXPERIENCE ═══ -->
			{:else if step === 5}
				<div class="wiz-title">Cuanta experiencia tienes?</div>
				<div class="wiz-subtitle">Esto define la complejidad de tu rutina</div>
				<div class="wiz-options">
					<div class="wiz-opt" class:active={wizExperience === 'principiante'} onclick={() => selectExperience('principiante')}>
						<span class="wiz-emoji wiz-svg-ico">
							<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="3"/><path d="M12 3v3"/><path d="M12 18v3"/>
							</svg>
						</span>
						<div>
							<span class="wiz-opt-title">Nunca he entrenado</span>
							<span class="wiz-opt-desc">Empezamos con lo basico -- ejercicios compuestos</span>
						</div>
					</div>
					<div class="wiz-opt" class:active={wizExperience === 'intermedio'} onclick={() => selectExperience('intermedio')}>
						<span class="wiz-emoji wiz-svg-ico">
							<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
							</svg>
						</span>
						<div>
							<span class="wiz-opt-title">Menos de 1 ano</span>
							<span class="wiz-opt-desc">Ya conoces los ejercicios -- mas variedad y volumen</span>
						</div>
					</div>
					<div class="wiz-opt" class:active={wizExperience === 'avanzado'} onclick={() => selectExperience('avanzado')}>
						<span class="wiz-emoji wiz-svg-ico">
							<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<path d="M6 9H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h0"/><path d="M18 9h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4h0"/>
								<path d="M7 4h10v7a5 5 0 0 1-10 0V4z"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>
							</svg>
						</span>
						<div>
							<span class="wiz-opt-title">Mas de 1 ano</span>
							<span class="wiz-opt-desc">Rutinas avanzadas -- mayor frecuencia y especificidad</span>
						</div>
					</div>
				</div>

			<!-- ═══ STEP 6 / manual_days: DAY SELECTION ═══ -->
			{:else if step === 6 || step === 'manual_days'}
				{@const isManual = wizMode === 'manual'}
				{@const minDays = isManual ? 1 : 3}
				<div class="wiz-title">Que dias entrenas?</div>
				<div class="wiz-subtitle">
					{#if isManual}
						Selecciona los dias que quieras entrenar
					{:else}
						Basado en tu actividad y nivel, te recomendamos <strong>{suggested} dias</strong>
					{/if}
				</div>
				<div class="wiz-day-picker">
					{#each ALL_DAY_KEYS as dk}
						<div
							class="wiz-day-btn"
							class:active={wizSelectedDays.includes(dk)}
							onclick={() => toggleDay(dk)}
						>{DAY_LETTER[dk]}</div>
					{/each}
				</div>
				<div class="wiz-day-count">{wizSelectedDays.length} dias seleccionados</div>
				{#if daysWarning}
					<div class="wiz-warning">{daysWarning}</div>
				{/if}
				{#if wizSelectedDays.length >= minDays}
					<button class="sbtn" onclick={() => { if (isManual) initManualBuilder(); else showResult(); }} style="margin-top:16px">
						{isManual ? 'ELEGIR EJERCICIOS' : 'VER MI RUTINA'}
					</button>
				{:else}
					<div class="wiz-hint">Selecciona al menos {minDays} dia{minDays > 1 ? 's' : ''}</div>
				{/if}

			<!-- ═══ RESULT SCREEN ═══ -->
			{:else if step === 'result' && resultRoutine}
				{@const trainDays = ALL_DAY_KEYS.filter(dk => !resultRoutine![dk].rest)}
				{@const restCount = 7 - trainDays.length}
				<button onclick={goBack} style="background:none;border:none;color:var(--muted2);font-family:'DM Mono',monospace;font-size:11px;cursor:pointer;padding:4px 0;display:flex;align-items:center;gap:4px;margin-bottom:8px;-webkit-tap-highlight-color:transparent">
					<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
					Cambiar opciones
				</button>
				<div class="wiz-title">Tu rutina personalizada</div>
				<div class="wiz-subtitle">{trainDays.length} dias de entrenamiento &middot; {restCount} de descanso</div>
				<div class="wiz-result-scroll">
					<div class="wiz-preview">
						{#each trainDays as dk}
							{@const day = resultRoutine![dk]}
							<div
								class="wiz-day-preview"
								class:expanded={expandedDays.has(dk)}
								onclick={() => toggleResultDay(dk)}
							>
								<div class="wiz-dp-top">
									<span class="wiz-dp-day">{DAY_SHORT[dk]}</span>
									<span class="wiz-dp-label">{day.label}</span>
									<div class="wiz-dp-right">
										<span class="wiz-dp-count">{day.exercises.length}</span>
										<span class="wiz-dp-arrow">&#x203a;</span>
									</div>
								</div>
								<div class="wiz-dp-exlist">
									{#each day.exercises as ex}
										{@const c = getExColor(ex)}
										<span
											class="wiz-dp-ex"
											style={c ? `color:${c};border-color:${c}33;background:${c}0d` : ''}
										>{ex.name}</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
				<div class="wiz-result-note">Toca un dia para ver los ejercicios &middot; Personaliza en <b>Perfil &rarr; Mi Rutina</b></div>
				<div class="wiz-result-actions">
					<button class="sbtn" onclick={applyAutoRoutine}>EMPEZAR A ENTRENAR</button>
				</div>

			<!-- ═══ MANUAL BUILDER ═══ -->
			{:else if step === 'manual_build'}
				<div class="wiz-title">Elige tus ejercicios</div>
				<div class="wiz-subtitle">Toca cada dia para agregar ejercicios</div>
				<div class="wiz-manual-steps">
					<div class="wiz-ms"><span class="wiz-ms-n">1</span>Toca un dia para abrir el catalogo</div>
					<div class="wiz-ms"><span class="wiz-ms-n">2</span>Selecciona los ejercicios que quieras</div>
					<div class="wiz-ms"><span class="wiz-ms-n">3</span>Usa el icono de copiar para repetir un dia</div>
				</div>
				<div class="wiz-manual-days">
					{#each wizSelectedDays as dk}
						{@const exCount = manualRoutine[dk]?.exercises?.length || 0}
						<div class="wiz-manual-day" onclick={() => openDayPicker(dk)}>
							<span class="wiz-md-name">{DAY_LABELS[dk]}</span>
							<span class="wiz-md-count">{exCount} ej.</span>
							{#if exCount > 0}
								<span
									class="wiz-md-copy"
									onclick={(e) => { e.stopPropagation(); toggleCopyPopup(dk); }}
									title="Copiar a otro dia"
								>
									<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
									</svg>
								</span>
							{/if}
							<span class="wiz-md-arrow">&#x203a;</span>
						</div>
					{/each}
				</div>

				{#if showCopyPopupFor}
					{@const targets = wizSelectedDays.filter(dk => dk !== showCopyPopupFor)}
					{#if targets.length > 0}
						<div class="wiz-copy-popup">
							<div class="wiz-copy-label">Copiar a:</div>
							<div class="wiz-copy-targets">
								{#each targets as dk}
									<div class="wiz-copy-target" onclick={() => copyDayTo(showCopyPopupFor!, dk)}>{DAY_SHORT[dk]}</div>
								{/each}
							</div>
						</div>
					{/if}
				{/if}

				<div class="wiz-manual-note">Puedes modificar tu rutina cuando quieras desde <b>Perfil &rarr; Mi Rutina</b></div>
				{#if totalManualEx > 0}
					<button class="sbtn" onclick={applyManualRoutine} style="margin-top:12px">EMPEZAR A ENTRENAR</button>
				{:else}
					<div class="wiz-hint">Agrega al menos un ejercicio</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<!-- ═══ EXERCISE PICKER OVERLAY (for manual builder) ═══ -->
{#if pickerVisible}
	<div class="overlay open" style="z-index:400" onclick={closePicker}>
		<div class="modal" style="max-height:85dvh">
			<div class="mhandle"></div>
			<div class="mtitle">AGREGAR EJERCICIOS</div>
			<div class="msub">Toca para seleccionar o quitar</div>
			<input
				class="prog-search"
				type="text"
				placeholder="Buscar ejercicio..."
				bind:value={pickerSearch}
				style="margin-top:0"
			>
			<div style="max-height:50dvh;overflow-y:auto;margin:8px 0 12px;scrollbar-width:none">
				{#each PICKER_ZONES as zone}
					{@const zoneExs = pickerFiltered.filter(e => e.zone === zone.key)}
					{#if zoneExs.length > 0}
						<div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--accent);letter-spacing:1.5px;padding:8px 0 4px">{zone.label}</div>
						{#each zoneExs as ex}
							<div
								class="pick-item"
								class:selected={pickerSelected.includes(ex.name)}
								onclick={() => togglePickerEx(ex.name)}
							>
								<span>{ex.name}</span>
								<span class="pick-mg">{ex.muscleGroup[0]}</span>
							</div>
						{/each}
					{/if}
				{/each}
			</div>
			<button class="sbtn" onclick={donePickerManual}>LISTO</button>
		</div>
	</div>
{/if}

<!-- Toast -->
{#if toastMsg}
	<div class="toast show">{toastMsg}</div>
{/if}
{/if}
