<script lang="ts">
	import { db, todayDayKey, todaySession, todayDate } from '$lib/stores/db';
	import { OBJS } from '$lib/data/constants';
	import {
		entryMaxWeight,
		entryBest1RM,
		entrySetCount,
		entrySummaryText,
		smartSuggestion
	} from '$lib/utils/calculations';
	import { today } from '$lib/utils/format';
	import { calcStreak, calcProgressStreak } from '$lib/utils/streaks';
	import type { Entry, WeightEntry, CardioEntry, ExerciseRef, Objective } from '$lib/data/types';

	// ── Props ──
	interface Props {
		onOpenModal?: (exerciseName: string, type: 'pesas' | 'cardio') => void;
		onToast?: (msg: string) => void;
	}

	let { onopenmodal: onOpenModal, ontoast: onToast }: { onopenmodal?: (name: string, type: 'pesas' | 'cardio') => void; ontoast?: (msg: string) => void } = $props();

	// ── Local state ──
	let reorderMode = $state(false);
	let reorderSelected: number | null = $state(null);

	// ── Derived store values ──
	let dayKey = $derived($todayDayKey);
	let dayRoutine = $derived($db.routine[dayKey]);
	let session = $derived($todaySession);
	let objective = $derived($db.objective as Objective);
	let exercises = $derived(dayRoutine?.exercises ?? []);
	let isRestDay = $derived(!dayRoutine || dayRoutine.rest);
	let exCount = $derived(exercises.length);

	// ── Streaks ──
	let constancia = $derived(calcStreak($db.sessions, $db.routine));
	let progreso = $derived(calcProgressStreak($db.sessions));

	// ── Helpers ──

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

	function getEntry(exerciseName: string): Entry | undefined {
		return session?.entries?.find((e) => e.exercise === exerciseName);
	}

	function getSuggestion(exerciseName: string) {
		const lastEntries = getLastEntries(exerciseName);
		return smartSuggestion(exerciseName, lastEntries, objective);
	}

	// ── Intensity display helpers ──
	const intColors: Record<string, string> = { baja: 'g', media: 'y', alta: 'r' };
	const intLabels: Record<string, string> = { baja: 'Baja', media: 'Media', alta: 'Alta' };

	// ── Reorder ──

	function toggleReorder() {
		reorderMode = !reorderMode;
		reorderSelected = null;
	}

	let reorderAnimating = $state<number | null>(null);

	function moveUp(idx: number) {
		if (idx <= 0) return;
		reorderAnimating = idx;
		setTimeout(() => {
			const routine = { ...$db.routine };
			const exs = [...routine[dayKey].exercises];
			[exs[idx - 1], exs[idx]] = [exs[idx], exs[idx - 1]];
			routine[dayKey] = { ...routine[dayKey], exercises: exs };
			db.saveRoutine(routine);
			reorderAnimating = null;
		}, 150);
		if (navigator.vibrate) navigator.vibrate(20);
	}

	function moveDown(idx: number) {
		if (idx >= exercises.length - 1) return;
		reorderAnimating = idx;
		setTimeout(() => {
			const routine = { ...$db.routine };
			const exs = [...routine[dayKey].exercises];
			[exs[idx], exs[idx + 1]] = [exs[idx + 1], exs[idx]];
			routine[dayKey] = { ...routine[dayKey], exercises: exs };
			db.saveRoutine(routine);
			reorderAnimating = null;
		}, 150);
		if (navigator.vibrate) navigator.vibrate(20);
	}

	function removeExercise(idx: number) {
		const routine = { ...$db.routine };
		const exs = [...routine[dayKey].exercises];
		exs.splice(idx, 1);
		routine[dayKey] = { ...routine[dayKey], exercises: exs };
		db.saveRoutine(routine);
		onToast?.('Eliminado');
		if (navigator.vibrate) navigator.vibrate(30);
	}

	function handleCardClick(exerciseName: string, type: 'pesas' | 'cardio') {
		if (reorderMode) return;
		onOpenModal?.(exerciseName, type);
	}
</script>

<!-- Streaks display -->
{#if constancia >= 1 || progreso >= 1}
	<div class="hdr-streaks">
		{#if constancia >= 1}
			<div class="hdr-streak fire">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
					<path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z"/>
				</svg>
				<span>{constancia}</span>
			</div>
		{/if}
		{#if progreso >= 1}
			<div class="hdr-streak bolt">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
					<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
				</svg>
				<span>{progreso}</span>
			</div>
		{/if}
	</div>
{/if}

<!-- Main content -->
{#if isRestDay}
	<!-- Rest day display -->
	<div class="rest-day">
		<div class="rest-emo">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M2 4h4l2-2h8l2 2h4"/>
				<path d="M3 4v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4"/>
				<path d="M12 10v4"/>
				<path d="M10 12h4"/>
			</svg>
		</div>
		<div class="rest-t">DIA DE DESCANSO</div>
		<div class="rest-s">Descansa hoy.<br>Manana mas fuerte.</div>
	</div>
{:else}
	<!-- Exercise list -->
	<div class="ex-list">
		{#each exercises as ex, exIdx (ex.name)}
			{#if reorderMode}
				<!-- Reorder mode card -->
				<div
					class="ex-card reorder"
					class:reorder-moving={reorderAnimating === exIdx}
				>
					<div class="reorder-arrows">
						<button class="reorder-arrow" disabled={exIdx === 0} onclick={() => moveUp(exIdx)} aria-label="Subir">
							<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
						</button>
						<button class="reorder-arrow" disabled={exIdx === exercises.length - 1} onclick={() => moveDown(exIdx)} aria-label="Bajar">
							<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
						</button>
					</div>
					<span class="reorder-num">{exIdx + 1}</span>
					<div class="reorder-info">
						<div class="reorder-name">{ex.name}</div>
						<div class="reorder-hint">{ex.type === 'cardio' ? 'Cardio' : 'Pesas'}</div>
					</div>
					<button class="reorder-del" onclick={() => removeExercise(exIdx)} aria-label="Eliminar">
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
			{:else if ex.type === 'cardio'}
				<!-- Cardio card -->
				{@const entry = getEntry(ex.name) as CardioEntry | undefined}
				{@const logged = !!entry}
				<div
					class="ex-card {logged ? 'logged' : ''}"
										role="button"
					tabindex="0"
					onclick={() => handleCardClick(ex.name, 'cardio')}
					onkeydown={(e) => { if (e.key === 'Enter') handleCardClick(ex.name, 'cardio'); }}
				>
					<div class="ex-l">
						<div class="ex-name">{ex.name}</div>
						<div class="ex-sub">
							{#if logged}
								{entrySummaryText(entry)}
							{:else}
								Toca para registrar
							{/if}
						</div>
						<div class="ex-chips">
							<span class="chip y">Cardio</span>
							{#if logged && entry?.intensity}
								<span class="chip {intColors[entry.intensity] || 'y'}">
									{intLabels[entry.intensity] || 'Media'}
								</span>
							{/if}
							{#if logged && entry?.cal}
								<span class="chip b">
									{entry.calEstimated ? '~' : ''}{entry.cal} kcal
								</span>
							{/if}
							{#if logged}
								<span class="chip g">&#10003;</span>
							{/if}
						</div>
					</div>
					<div class="ex-r">
						{#if logged}
							<div class="ex-check">
								<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
							</div>
						{:else}
							<span class="ex-arrow">&#8250;</span>
						{/if}
					</div>
				</div>
			{:else}
				<!-- Weight exercise card -->
				{@const entry = getEntry(ex.name) as WeightEntry | undefined}
				{@const logged = !!entry}
				{@const prev = prevEntry(ex.name)}
				{@const mx = entryMaxWeight(entry ?? null)}
				{@const prevMx = entryMaxWeight(prev)}
				{@const unit = entry?.unit || (prev && 'unit' in prev ? (prev as WeightEntry).unit : null) || 'kg'}
				{@const best1rm = logged ? entryBest1RM(entry) : 0}
				{@const suggestion = !logged ? getSuggestion(ex.name) : null}
				<div
					class="ex-card {logged ? 'logged' : ''}"
										role="button"
					tabindex="0"
					onclick={() => handleCardClick(ex.name, 'pesas')}
					onkeydown={(e) => { if (e.key === 'Enter') handleCardClick(ex.name, 'pesas'); }}
				>
					<div class="ex-l">
						<div class="ex-name">{ex.name}</div>
						<div class="ex-sub">
							{#if logged}
								{entrySummaryText(entry)}
							{:else}
								Toca para registrar
							{/if}
						</div>
						<div class="ex-chips">
							{#if prevMx}
								<span class="chip b">Prev: {prevMx}{prev && 'unit' in prev ? (prev as WeightEntry).unit || 'kg' : 'kg'}</span>
							{/if}
							{#if suggestion}
								<span class="chip {suggestion.color}">{suggestion.msg}</span>
							{/if}
							{#if best1rm}
								<span class="chip o">1RM: {best1rm}{unit}</span>
							{/if}
						</div>
					</div>
					<div class="ex-r">
						<div class="ex-num">
							<div class="ex-weight">{mx ?? '—'}</div>
							{#if mx}
								<div class="ex-wunit">{unit}</div>
							{/if}
						</div>
						{#if logged}
							<div class="ex-check">
								<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
							</div>
						{:else}
							<span class="ex-arrow">&#8250;</span>
						{/if}
					</div>
				</div>
			{/if}
		{/each}

		<!-- Reorder instruction note -->
		{#if reorderMode && exCount > 1}
			<div class="reorder-note">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" y1="16" x2="12" y2="12"/>
					<line x1="12" y1="8" x2="12.01" y2="8"/>
				</svg>
				<p><b>1.</b> Toca el ejercicio que quieras mover &middot; <b>2.</b> Toca la posicion donde colocarlo</p>
			</div>
		{/if}
	</div>

	<!-- FAB reorder button -->
	{#if exCount > 1}
		<button
			class="fab-reorder {reorderMode ? 'active' : ''}"
			onclick={toggleReorder}
			aria-label={reorderMode ? 'Salir de reordenar' : 'Reordenar ejercicios'}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="3" y1="6" x2="21" y2="6"/>
				<line x1="3" y1="12" x2="21" y2="12"/>
				<line x1="3" y1="18" x2="21" y2="18"/>
				<polyline points="7 3 3 6 7 9"/>
				<polyline points="17 15 21 18 17 21"/>
			</svg>
			<span>{reorderMode ? 'Listo' : 'Reordenar'}</span>
		</button>
	{/if}
{/if}
