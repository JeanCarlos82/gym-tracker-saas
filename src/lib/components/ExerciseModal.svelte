<script lang="ts">
	import { db, todayDate, todayDayKey } from '$lib/stores/db';
	import {
		calc1RM,
		entryMaxWeight,
		entryVolume,
		entrySetCount,
		smartSuggestion,
		estimateCalories
	} from '$lib/utils/calculations';
	import { today } from '$lib/utils/format';
	import type {
		Entry,
		WeightEntry,
		CardioEntry,
		Session,
		Objective
	} from '$lib/data/types';

	// ── Props ──
	interface Props {
		exerciseName: string;
		exerciseType: 'pesas' | 'cardio';
		visible: boolean;
		onSave?: () => void;
		onDelete?: () => void;
		onClose?: () => void;
		onToast?: (msg: string) => void;
	}

	let {
		exerciseName,
		exerciseType,
		visible = $bindable(false),
		onSave,
		onDelete,
		onClose,
		ontoast: onToast
	}: { exerciseName: string; exerciseType: 'pesas' | 'cardio'; visible: boolean; onSave?: () => void; onDelete?: () => void; onClose?: () => void; ontoast?: (msg: string) => void } = $props();

	// ── Local state ──
	interface SetRow {
		w: string;
		r: string;
		warmup: boolean;
	}

	let currentSets: SetRow[] = $state([]);
	let curUnit: 'kg' | 'lb' = $state('kg');
	let noteText = $state('');
	let noteOpen = $state(false);

	// Cardio fields
	let cardioMin = $state('');
	let cardioKm = $state('');
	let cardioCal = $state('');
	let cardioIntensity: 'baja' | 'media' | 'alta' = $state('media');

	// Save feedback state
	let saving = $state(false);
	let shakeError = $state(false);

	// Swipe state
	let swipeStartY = $state(0);
	let swipeCurrentY = $state(0);
	let isSwiping = $state(false);
	let modalTransform = $state('');
	let overlayOpacity = $state('');
	let isClosingSwipe = $state(false);

	// ── Derived values ──
	let todayStr = $derived($todayDate);
	let dayKey = $derived($todayDayKey);
	let objective = $derived($db.objective as Objective);

	// Check if there's an existing entry for today
	let existingSession = $derived($db.sessions.find((s) => s.date === todayStr) || null);
	let existingEntry = $derived(
		existingSession?.entries?.find((e) => e.exercise === exerciseName) || null
	);
	let hasExistingEntry = $derived(!!existingEntry);

	// ── Previous entry helpers ──
	function prevEntry(name: string): Entry | null {
		const t = today();
		const past = $db.sessions
			.filter((s) => s.date !== t)
			.sort((a, b) => b.date.localeCompare(a.date));
		for (const s of past) {
			const e = s.entries?.find((e) => e.exercise === name);
			if (e) return e;
		}
		return null;
	}

	function getLastEntries(name: string, count = 3): Entry[] {
		const results: Entry[] = [];
		const t = today();
		const past = $db.sessions
			.filter((s) => s.date !== t)
			.sort((a, b) => b.date.localeCompare(a.date));
		for (const s of past) {
			const e = s.entries?.find((e) => e.exercise === name);
			if (e) {
				results.push(e);
				if (results.length >= count) break;
			}
		}
		return results;
	}

	// ── Averages card data ──
	let prev = $derived(prevEntry(exerciseName));
	let last3 = $derived(getLastEntries(exerciseName, 3));
	let suggestion = $derived.by(() => {
		if (exerciseType === 'cardio') return null;
		const entries = getLastEntries(exerciseName);
		return smartSuggestion(exerciseName, entries, objective);
	});

	// Averages
	let avgData = $derived.by(() => {
		if (exerciseType === 'cardio' || !prev) return null;
		const prevW = prev as WeightEntry;
		const unit = prevW.unit || 'kg';
		if (last3.length >= 2) {
			const avgWeight =
				Math.round(
					(last3.reduce((a, e) => a + (entryMaxWeight(e) || 0), 0) / last3.length) * 10
				) / 10;
			const avgReps = Math.round(
				last3.reduce((a, e) => {
					const ws = 'sets' in e ? (e as WeightEntry).sets?.filter((s) => !s.warmup) || [] : [];
					return a + (ws.length ? Math.max(...ws.map((s) => parseInt(String(s.r)) || 0)) : 0);
				}, 0) / last3.length
			);
			const avgVol = Math.round(
				last3.reduce((a, e) => a + entryVolume(e), 0) / last3.length
			);
			const avgSets = Math.round(
				last3.reduce(
					(a, e) => a + ('sets' in e ? (e as WeightEntry).sets?.filter((s) => !s.warmup).length || 0 : 0),
					0
				) / last3.length
			);
			return {
				mode: 'avg' as const,
				count: last3.length,
				weight: avgWeight,
				reps: avgReps,
				vol: avgVol,
				sets: avgSets,
				unit
			};
		} else if ('sets' in prev && (prev as WeightEntry).sets?.length) {
			const mx = entryMaxWeight(prev);
			const sc = entrySetCount(prev);
			return {
				mode: 'single' as const,
				weight: mx,
				sets: sc.working,
				unit
			};
		}
		return null;
	});

	// ── Volume summary ──
	let workingSets = $derived(currentSets.filter((s) => s.w && s.r && !s.warmup));
	let allValidSets = $derived(currentSets.filter((s) => s.w && s.r));

	let volSummary = $derived.by(() => {
		if (!workingSets.length && !allValidSets.length)
			return { visible: false, sets: '', max: 0, vol: 0, oneRM: 0 };
		const warmupCount = currentSets.filter((s) => s.warmup && s.w && s.r).length;
		const mx = workingSets.length
			? Math.max(...workingSets.map((s) => parseFloat(s.w)))
			: 0;
		const vol = workingSets.reduce(
			(a, s) => a + (parseFloat(s.w) || 0) * (parseInt(s.r) || 0),
			0
		);
		const best1rm = workingSets.length
			? Math.max(
					...workingSets.map((s) => calc1RM(parseFloat(s.w) || 0, parseInt(s.r) || 0))
				)
			: 0;
		const setsLabel = `${warmupCount ? warmupCount + 'C+' : ''}${workingSets.length}N`;
		return { visible: true, sets: setsLabel, max: mx, vol: Math.round(vol), oneRM: best1rm };
	});

	// ── Calorie estimate ──
	let calEstimate = $derived.by(() => {
		const min = parseFloat(cardioMin) || 0;
		const w = parseFloat($db.profile.weight) || 70;
		if (min > 0) {
			return estimateCalories(exerciseName, cardioIntensity, min, w);
		}
		return 0;
	});

	// ── Initialize on visibility change ──
	$effect(() => {
		if (visible) {
			initModal();
		}
	});

	function initModal() {
		noteText = '';
		noteOpen = false;
		cardioMin = '';
		cardioKm = '';
		cardioCal = '';
		cardioIntensity = 'media';
		currentSets = [];

		const entry = existingEntry;
		const pr = prev;

		if (exerciseType !== 'cardio') {
			if (entry && 'sets' in entry && entry.sets?.length) {
				currentSets = entry.sets.map((s) => ({
					w: String(s.w),
					r: String(s.r),
					warmup: !!s.warmup
				}));
				if ((entry as WeightEntry).unit) curUnit = (entry as WeightEntry).unit as 'kg' | 'lb';
			} else if (pr && 'sets' in pr && (pr as WeightEntry).sets?.length) {
				currentSets = (pr as WeightEntry).sets.map((s) => ({
					w: String(s.w),
					r: String(s.r),
					warmup: !!s.warmup
				}));
				curUnit = ((pr as WeightEntry).unit as 'kg' | 'lb') || 'kg';
			} else if (pr && 'weight' in pr) {
				currentSets = [
					{ w: String((pr as Record<string, unknown>).weight), r: '', warmup: false }
				];
				curUnit = ((pr as WeightEntry).unit as 'kg' | 'lb') || 'kg';
			} else {
				const rd = objective === 'fuerza' ? '3' : objective === 'hipertrofia' ? '10' : '15';
				currentSets = [{ w: '', r: rd, warmup: false }];
			}
		}

		if (entry) {
			noteText = entry.notes || '';
			if (entry.notes) noteOpen = true;

			if (exerciseType === 'cardio' && entry.type === 'cardio') {
				const ce = entry as CardioEntry;
				cardioMin = ce.min ? String(ce.min) : '';
				cardioKm = ce.km ? String(ce.km) : '';
				cardioCal = ce.cal && !ce.calEstimated ? String(ce.cal) : '';
				if (ce.intensity) cardioIntensity = ce.intensity;
			}
		}
	}

	// ── Set manipulation ──
	function addSet() {
		const last = currentSets.length > 0 ? currentSets[currentSets.length - 1] : null;
		currentSets = [...currentSets, { w: last?.w || '', r: last?.r || '', warmup: false }];
		// Focus the new weight input after DOM update
		requestAnimationFrame(() => {
			const rows = document.querySelectorAll<HTMLInputElement>('.set-w');
			if (rows.length) rows[rows.length - 1].focus();
		});
	}

	function removeSet(i: number) {
		currentSets = currentSets.filter((_, idx) => idx !== i);
	}

	function toggleWarmup(i: number) {
		currentSets = currentSets.map((s, idx) =>
			idx === i ? { ...s, warmup: !s.warmup } : s
		);
	}

	function updateSetWeight(i: number, val: string) {
		currentSets = currentSets.map((s, idx) =>
			idx === i ? { ...s, w: val } : s
		);
	}

	function updateSetReps(i: number, val: string) {
		currentSets = currentSets.map((s, idx) =>
			idx === i ? { ...s, r: val } : s
		);
	}

	function setUnit(u: 'kg' | 'lb') {
		curUnit = u;
	}

	function setIntensity(val: 'baja' | 'media' | 'alta') {
		cardioIntensity = val;
	}

	// ── Save ──
	function saveEntry() {
		const t = todayStr;
		const dk = dayKey;
		let entry: Entry;

		if (exerciseType === 'cardio') {
			const min = parseFloat(cardioMin) || 0;
			const userCal = parseFloat(cardioCal) || 0;
			const cal =
				userCal || estimateCalories(exerciseName, cardioIntensity, min, parseFloat($db.profile.weight) || 70);
			entry = {
				exercise: exerciseName,
				type: 'cardio',
				min,
				intensity: cardioIntensity,
				km: parseFloat(cardioKm) || 0,
				cal,
				calEstimated: !userCal,
				notes: noteText.trim()
			};
		} else {
			const valid = currentSets.filter((s) => s.w !== '' && s.r !== '');
			if (!valid.length) {
				onToast?.('Agrega al menos una serie');
				shakeError = true;
				setTimeout(() => (shakeError = false), 500);
				return;
			}
			entry = {
				exercise: exerciseName,
				type: 'pesas',
				sets: valid.map((s) => ({
					w: parseFloat(s.w),
					r: parseInt(s.r),
					warmup: !!s.warmup
				})),
				unit: curUnit,
				notes: noteText.trim()
			};
		}

		// Update or create session
		$db.sessions = (() => {
			const sessions = [...$db.sessions];
			let sessIdx = sessions.findIndex((s) => s.date === t);
			let sess: Session;
			if (sessIdx < 0) {
				sess = {
					date: t,
					dayKey: dk,
					entries: [],
					startTime: new Date().toISOString()
				};
				sessions.push(sess);
				sessIdx = sessions.length - 1;
			} else {
				sess = { ...sessions[sessIdx] };
				sessions[sessIdx] = sess;
			}
			if (!sess.startTime) sess.startTime = new Date().toISOString();
			sess.endTime = new Date().toISOString();

			const entryIdx = sess.entries.findIndex((e) => e.exercise === exerciseName);
			if (entryIdx >= 0) {
				sess.entries = [...sess.entries];
				sess.entries[entryIdx] = entry;
			} else {
				sess.entries = [...sess.entries, entry];
			}
			return sessions;
		})();
		db.saveSessions($db.sessions);

		saving = true;
		setTimeout(() => {
			saving = false;
			visible = false;
			onSave?.();
			onToast?.('Guardado \u2713');
		}, 400);
	}

	// ── Delete ──
	function deleteEntry() {
		const t = todayStr;
		let sessions = [...$db.sessions];
		const sessIdx = sessions.findIndex((s) => s.date === t);
		if (sessIdx < 0) return;

		const sess = { ...sessions[sessIdx] };
		sess.entries = sess.entries.filter((e) => e.exercise !== exerciseName);
		if (!sess.entries.length) {
			sessions = sessions.filter((s) => s.date !== t);
		} else {
			sessions[sessIdx] = sess;
		}
		$db.sessions = sessions;
		db.saveSessions($db.sessions);

		visible = false;
		onDelete?.();
	}

	// ── Close ──
	function closeModal(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			visible = false;
			onClose?.();
		}
	}

	// ── Swipe to close ──
	function onTouchStart(e: TouchEvent) {
		const modal = (e.currentTarget as HTMLElement).querySelector('.modal') as HTMLElement;
		if (!modal || modal.scrollTop > 0) return;
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
		} else {
			swipeCurrentY = 0;
		}
	}

	function onTouchEnd() {
		if (!isSwiping) return;
		isSwiping = false;

		if (swipeCurrentY > 80) {
			// Close with animation
			isClosingSwipe = true;
			modalTransform = 'translateY(100%)';
			overlayOpacity = '0';
			setTimeout(() => {
				visible = false;
				isClosingSwipe = false;
				modalTransform = '';
				overlayOpacity = '';
				onClose?.();
			}, 400);
		} else {
			modalTransform = '';
			overlayOpacity = '';
		}
		swipeCurrentY = 0;
	}

	// Format volume for display
	function fmtVol(v: number): string {
		return v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="overlay"
	class:open={visible}
	onclick={closeModal}
	ontouchstart={onTouchStart}
	ontouchmove={onTouchMove}
	ontouchend={onTouchEnd}
	style:opacity={overlayOpacity || undefined}
	style:transition={isClosingSwipe ? 'opacity 0.35s ease' : isSwiping ? 'none' : undefined}
>
	<div
		class="modal"
		style:transform={modalTransform || undefined}
		style:transition={isClosingSwipe
			? 'transform 0.4s cubic-bezier(0.32,0.72,0,1)'
			: isSwiping
				? 'none'
				: undefined}
	>
		<div class="mhandle"></div>
		<div class="mtitle">{exerciseName}</div>
		<div class="msub">
			{exerciseType === 'cardio' ? 'REGISTRA TU CARDIO' : 'REGISTRA TU ENTRENAMIENTO'}
		</div>

		<!-- Hints -->
		{#if exerciseType !== 'cardio' && suggestion}
			<div class="mhint {suggestion.color}">
				<span class="mhint-l">{suggestion.reason}</span>
				<span class="mhint-v {suggestion.color}">{suggestion.msg}</span>
			</div>
		{/if}

		<!-- ═══ PESAS SECTION ═══ -->
		{#if exerciseType !== 'cardio'}
			<!-- Previous averages card -->
			{#if avgData}
				<div class="prev-avg-card">
					{#if avgData.mode === 'avg'}
						<div class="prev-avg-title">
							<span class="prev-avg-ico">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
									<path d="M12 8v8"/><path d="M8 12h8"/><circle cx="12" cy="12" r="10"/>
								</svg>
							</span>
							TU PROMEDIO
							<span class="prev-avg-sub">ultimas {avgData.count} sesiones</span>
						</div>
						<div class="prev-avg-grid">
							<div class="prev-avg-item">
								<span class="prev-avg-item-ico">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<line x1="4" y1="12" x2="20" y2="12"/><rect x="2" y="9" width="4" height="6" rx="1.5"/><rect x="18" y="9" width="4" height="6" rx="1.5"/>
									</svg>
								</span>
								<span class="prev-avg-val">{avgData.weight}</span>
								<span class="prev-avg-lbl">{avgData.unit} max</span>
							</div>
							<div class="prev-avg-item">
								<span class="prev-avg-item-ico">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
									</svg>
								</span>
								<span class="prev-avg-val">{avgData.reps}</span>
								<span class="prev-avg-lbl">reps max</span>
							</div>
							<div class="prev-avg-item">
								<span class="prev-avg-item-ico">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
									</svg>
								</span>
								<span class="prev-avg-val">{avgData.sets}</span>
								<span class="prev-avg-lbl">series</span>
							</div>
							<div class="prev-avg-item">
								<span class="prev-avg-item-ico">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
									</svg>
								</span>
								<span class="prev-avg-val">{fmtVol(avgData.vol)}</span>
								<span class="prev-avg-lbl">{avgData.unit} vol</span>
							</div>
						</div>
					{:else}
						<div class="prev-avg-title">
							<span class="prev-avg-ico">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
								</svg>
							</span>
							SESION ANTERIOR
						</div>
						<div class="prev-avg-grid">
							<div class="prev-avg-item">
								<span class="prev-avg-item-ico">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<line x1="4" y1="12" x2="20" y2="12"/><rect x="2" y="9" width="4" height="6" rx="1.5"/><rect x="18" y="9" width="4" height="6" rx="1.5"/>
									</svg>
								</span>
								<span class="prev-avg-val">{avgData.weight}</span>
								<span class="prev-avg-lbl">{avgData.unit} max</span>
							</div>
							<div class="prev-avg-item">
								<span class="prev-avg-item-ico">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
									</svg>
								</span>
								<span class="prev-avg-val">{avgData.sets}</span>
								<span class="prev-avg-lbl">series</span>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Sets header with unit toggle -->
			<div class="sets-header">
				<div class="sets-title">SERIES DE HOY</div>
				<div class="unit-group">
					<button type="button" class="unit-toggle" class:active={curUnit === 'kg'} onclick={() => setUnit('kg')}>kg</button>
					<button type="button" class="unit-toggle" class:active={curUnit === 'lb'} onclick={() => setUnit('lb')}>lb</button>
				</div>
			</div>

			<!-- Sets list -->
			<div id="sets-list" class:shake={shakeError}>
				{#each currentSets as set, i}
					<div class="set-row" class:set-warmup={set.warmup}>
						<span
							class="set-warm"
							class:on={set.warmup}
							onclick={() => toggleWarmup(i)}
							role="button"
							tabindex="0"
						>{set.warmup ? 'C' : 'N'}</span>
						<div class="set-inputs">
							<div class="set-input-group">
								<span class="set-input-lbl">{curUnit}</span>
								<input
									class="set-w"
									type="number"
									inputmode="decimal"
									min="0"
									step="0.5"
									placeholder="0"
									value={set.w}
									oninput={(e) => updateSetWeight(i, (e.target as HTMLInputElement).value)}
								/>
							</div>
							<span class="set-x-label">&times;</span>
							<div class="set-input-group">
								<span class="set-input-lbl">REPS</span>
								<input
									class="set-r"
									type="number"
									inputmode="numeric"
									min="0"
									step="1"
									placeholder="0"
									value={set.r}
									oninput={(e) => updateSetReps(i, (e.target as HTMLInputElement).value)}
								/>
							</div>
						</div>
						<div class="set-actions">
							<button class="set-del" onclick={() => removeSet(i)}>&times;</button>
						</div>
					</div>
				{/each}
			</div>

			<button class="add-set-btn" onclick={addSet}>+ ANADIR SERIE</button>

			<!-- Volume summary -->
			{#if volSummary.visible}
				<div class="vol-summary">
					<div class="vol-box">
						<div class="vol-label">SERIES</div>
						<div class="vol-val">{volSummary.sets}</div>
					</div>
					<div class="vol-box">
						<div class="vol-label">MAXIMO</div>
						<div class="vol-val" style="color:var(--accent)">{volSummary.max}</div>
					</div>
					<div class="vol-box">
						<div class="vol-label">VOLUMEN</div>
						<div class="vol-val" style="color:var(--orange)">{volSummary.vol}</div>
					</div>
					<div class="vol-box">
						<div class="vol-label">1RM EST</div>
						<div class="vol-val" style="color:var(--blue)">{volSummary.oneRM || '\u2014'}</div>
					</div>
				</div>
			{/if}
		{/if}

		<!-- ═══ CARDIO SECTION ═══ -->
		{#if exerciseType === 'cardio'}
			<div class="c-info-banner">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
				</svg>
				<p>La distancia y calorias son opcionales. Si no las pones, <b>calculamos las calorias</b> segun tu peso, el ejercicio y la intensidad. Es una <b>aproximacion</b>, no un valor exacto.</p>
			</div>

			<div class="cfields">
				<div class="cfield">
					<div class="cflabel">Tiempo (min)</div>
					<input
						class="cinput"
						type="number"
						placeholder="30"
						min="0"
						bind:value={cardioMin}
					/>
				</div>
				<div class="cfield">
					<div class="cflabel">Intensidad</div>
					<div class="c-intensity">
						<div
							class="c-int-opt"
							class:active={cardioIntensity === 'baja'}
							data-val="baja"
							onclick={() => setIntensity('baja')}
							role="button"
							tabindex="0"
						>Baja</div>
						<div
							class="c-int-opt"
							class:active={cardioIntensity === 'media'}
							data-val="media"
							onclick={() => setIntensity('media')}
							role="button"
							tabindex="0"
						>Media</div>
						<div
							class="c-int-opt"
							class:active={cardioIntensity === 'alta'}
							data-val="alta"
							onclick={() => setIntensity('alta')}
							role="button"
							tabindex="0"
						>Alta</div>
					</div>
				</div>
			</div>

			<div class="cfields" style="margin-top:6px">
				<div class="cfield">
					<div class="cflabel">Distancia km (opcional)</div>
					<input
						class="cinput"
						type="number"
						placeholder="\u2014"
						min="0"
						step="0.1"
						bind:value={cardioKm}
					/>
				</div>
				<div class="cfield">
					<div class="cflabel">Calorias (opcional)</div>
					<input
						class="cinput"
						type="number"
						placeholder={calEstimate > 0 ? String(calEstimate) : '\u2014'}
						min="0"
						bind:value={cardioCal}
					/>
					{#if calEstimate > 0}
						<div class="c-cal-est">~{calEstimate} kcal aprox.</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Note expand area -->
		<div class="note-expand" class:open={noteOpen}>
			<textarea
				class="ninput"
				placeholder="Escribe una nota... Se guardara en tu historial y progreso."
				rows="2"
				bind:value={noteText}
			></textarea>
		</div>

		<!-- Action buttons -->
		<div class="modal-actions">
			<button class="note-btn" onclick={() => (noteOpen = !noteOpen)}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
				</svg>
			</button>
			<button class="sbtn" class:sbtn-saving={saving} disabled={saving} onclick={saveEntry}>{saving ? '✓' : 'GUARDAR'}</button>
		</div>

		{#if hasExistingEntry}
			<button class="dbtn" onclick={deleteEntry}>BORRAR REGISTRO</button>
		{/if}
	</div>
</div>
