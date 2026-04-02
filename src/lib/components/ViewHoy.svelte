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

	// ── Touch drag reorder ──
	let dragIdx = $state<number | null>(null);
	let dragOverIdx = $state<number | null>(null);
	let dragY = $state(0);
	let landedIdx = $state<number | null>(null);
	let dragStartY = 0;
	let cardHeight = 0;

	function onDragStart(idx: number, e: TouchEvent) {
		e.preventDefault();
		dragIdx = idx;
		dragOverIdx = idx;
		dragStartY = e.touches[0].clientY;
		dragY = 0;
		landedIdx = null;
		const card = (e.target as HTMLElement).closest('.ex-card');
		cardHeight = card?.getBoundingClientRect().height ?? 56;
		if (navigator.vibrate) navigator.vibrate(15);
	}

	function onDragMove(e: TouchEvent) {
		if (dragIdx === null) return;
		e.preventDefault();
		dragY = e.touches[0].clientY - dragStartY;
		const offset = Math.round(dragY / (cardHeight + 6));
		const newIdx = Math.max(0, Math.min(exercises.length - 1, dragIdx + offset));
		if (newIdx !== dragOverIdx) {
			dragOverIdx = newIdx;
			if (navigator.vibrate) navigator.vibrate(10);
		}
	}

	function onDragEnd() {
		const fromIdx = dragIdx;
		const toIdx = dragOverIdx;
		dragY = 0;
		dragIdx = null;
		dragOverIdx = null;

		if (fromIdx === null || toIdx === null || fromIdx === toIdx) return;

		const routine = { ...$db.routine };
		const exs = [...routine[dayKey].exercises];
		const [moved] = exs.splice(fromIdx, 1);
		exs.splice(toIdx, 0, moved);
		routine[dayKey] = { ...routine[dayKey], exercises: exs };
		db.saveRoutine(routine);

		landedIdx = toIdx;
		if (navigator.vibrate) navigator.vibrate(25);
		setTimeout(() => { landedIdx = null; }, 250);
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
				<!-- Reorder mode card with touch drag -->
				{@const isDragging = dragIdx === exIdx}
				{@const isOver = dragOverIdx === exIdx && dragIdx !== null && dragIdx !== exIdx}
				{@const isLanded = landedIdx === exIdx}
				<div
					class="ex-card reorder"
					class:reorder-dragging={isDragging}
					class:reorder-over={isOver}
					class:reorder-landed={isLanded}
					style={isDragging ? `transform:translateY(${dragY}px) scale(1.03);z-index:10;` : ''}
					ontouchmove={onDragMove}
					ontouchend={onDragEnd}
				>
					<div class="reorder-handle" ontouchstart={(e) => onDragStart(exIdx, e)}>
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>
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
