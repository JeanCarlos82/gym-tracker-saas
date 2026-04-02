<script lang="ts">
	import { db } from '$lib/stores/db';
	import { DL, MO } from '$lib/data/constants';
	import { fmtDF, fmtDuration, fmtWeekRange, getWeekRange } from '$lib/utils/format';
	import {
		entryMaxWeight,
		entrySetCount,
		entryBest1RM,
		escapeHtml
	} from '$lib/utils/calculations';
	import type { Session, Entry, WeightEntry, CardioEntry } from '$lib/data/types';

	// ── Reactive state from store ──
	let dbVal = $derived($db);

	// ── Collapse state ──
	// Track which months & weeks are open by key
	let openMonths = $state<Record<string, boolean>>({});
	let openWeeks = $state<Record<string, boolean>>({});
	// Track which session cards are expanded by date
	let openSessions = $state<Record<string, boolean>>({});

	// ── Month grouping structure ──
	interface WeekGroup {
		label: string;
		key: string;
		sessions: Session[];
	}
	interface MonthGroup {
		key: string;
		label: string;
		weeks: WeekGroup[];
		totalSessions: number;
	}

	// ── Derived: sorted sessions grouped by month -> week ──
	let months = $derived.by(() => {
		const sorted = [...dbVal.sessions].sort((a, b) => b.date.localeCompare(a.date));
		if (!sorted.length) return [] as MonthGroup[];

		const monthMap = new Map<
			string,
			{ label: string; weeks: Map<string, { label: string; sessions: Session[] }> }
		>();

		for (const sess of sorted) {
			const [y, m] = sess.date.split('-');
			const monthKey = `${y}-${m}`;
			const monthLabel = `${MO[parseInt(m) - 1]} ${y}`.toUpperCase();

			if (!monthMap.has(monthKey)) {
				monthMap.set(monthKey, { label: monthLabel, weeks: new Map() });
			}

			const wk = getWeekRange(sess.date);
			const weekLabel = fmtWeekRange(wk.start, wk.end);
			const mo = monthMap.get(monthKey)!;

			if (!mo.weeks.has(wk.key)) {
				mo.weeks.set(wk.key, { label: weekLabel, sessions: [] });
			}
			mo.weeks.get(wk.key)!.sessions.push(sess);
		}

		const result: MonthGroup[] = [];
		let isFirstMonth = true;

		for (const [key, mo] of monthMap) {
			const weeks: WeekGroup[] = [];
			let isFirstWeek = true;

			for (const [wKey, wk] of mo.weeks) {
				// Auto-open first week of first month
				if (isFirstMonth && isFirstWeek && !(wKey in openWeeks)) {
					openWeeks[wKey] = true;
				}
				weeks.push({ key: wKey, label: wk.label, sessions: wk.sessions });
				isFirstWeek = false;
			}

			const totalSessions = weeks.reduce((a, w) => a + w.sessions.length, 0);

			// Auto-open first month
			if (isFirstMonth && !(key in openMonths)) {
				openMonths[key] = true;
			}

			result.push({ key, label: mo.label, weeks, totalSessions });
			isFirstMonth = false;
		}

		return result;
	});

	// ── Toggle helpers ──
	function toggleMonth(key: string) {
		openMonths[key] = !openMonths[key];
	}

	function toggleWeek(key: string) {
		openWeeks[key] = !openWeeks[key];
	}

	function toggleSession(date: string) {
		openSessions[date] = !openSessions[date];
	}

	// ── Entry display helpers ──
	function getSessionLabel(sess: Session): string {
		return dbVal.routine[sess.dayKey]?.label || sess.dayKey;
	}

	function getSessionDuration(sess: Session): string {
		if (sess.startTime && sess.endTime) {
			return fmtDuration(sess.startTime, sess.endTime);
		}
		return '';
	}

	function getDayName(sess: Session): string {
		return (DL[sess.dayKey] || sess.dayKey).toUpperCase();
	}

	function getWorkingSets(e: WeightEntry) {
		return (e.sets || []).filter((s) => !s.warmup);
	}

	function getAvgWeight(e: WeightEntry): number {
		const working = getWorkingSets(e);
		if (!working.length) return 0;
		return Math.round((working.reduce((a, s) => a + (parseFloat(String(s.w)) || 0), 0) / working.length) * 10) / 10;
	}

	function getVolume(e: WeightEntry): number {
		const working = getWorkingSets(e);
		return working.reduce(
			(a, s) => a + (parseFloat(String(s.w)) || 0) * (parseInt(String(s.r)) || 0),
			0
		);
	}

</script>

{#if months.length === 0}
	<!-- Empty state -->
	<div class="empty">
		<div class="empty-ico">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="4" width="18" height="18" rx="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		</div>
		<div class="empty-txt">
			Aun no hay sesiones registradas.<br/>Ve a <b style="color:var(--accent)">Hoy</b> y registra tu primer ejercicio.
		</div>
	</div>
{:else}
	<div id="sess-list">
		{#each months as month (month.key)}
			<div class="hist-month-block">
				<!-- Month header -->
				<div
					class="hist-month-hdr"
					onclick={() => toggleMonth(month.key)}
					role="button"
					tabindex="0"
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleMonth(month.key); }}
				>
					<div class="hist-month-left">
						<span class="hist-month-name">{month.label}</span>
						<span class="hist-month-count">{month.totalSessions} sesiones</span>
					</div>
					<span class="hist-month-arrow" class:rot={openMonths[month.key]}>›</span>
				</div>

				<!-- Month body -->
				<div class="hist-month-body" class:open={openMonths[month.key]}>
					{#each month.weeks as week (week.key)}
						<div class="hist-week-block">
							<!-- Week header -->
							<div
								class="hist-week-hdr"
								onclick={() => toggleWeek(week.key)}
								role="button"
								tabindex="0"
								onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleWeek(week.key); }}
							>
								<span class="hist-week-dates">Semana del {week.label}</span>
								<div class="hist-week-right">
									<span class="hist-week-count">
										{week.sessions.length}
										{week.sessions.length === 1 ? 'dia' : 'dias'}
									</span>
									<span class="hist-week-arrow" class:rot={openWeeks[week.key]}>›</span>
								</div>
							</div>

							<!-- Week body -->
							<div class="hist-week-body" class:open={openWeeks[week.key]}>
								{#each week.sessions as sess (sess.date)}
									{@const label = getSessionLabel(sess)}
									{@const dur = getSessionDuration(sess)}
									{@const dayName = getDayName(sess)}
									{@const sessKey = sess.date}

									<div class="sess-card">
										<!-- Session header -->
										<div
											class="sess-hdr"
											onclick={() => toggleSession(sessKey)}
											role="button"
											tabindex="0"
											onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSession(sessKey); }}
										>
											<div>
												<div class="sess-day">{dayName}</div>
												<div class="sess-date">
													{fmtDF(sess.date)}{dur ? ` \u00B7 ${dur}` : ''}
												</div>
											</div>
											<div class="sess-tag">{label.toUpperCase()}</div>
										</div>

										<!-- Session body (exercise rows) -->
										<div class="sess-body" class:open={openSessions[sessKey]}>
											{#if !sess.entries || sess.entries.length === 0}
												<div class="sess-empty">Sin ejercicios registrados</div>
											{:else}
												{#each sess.entries as entry}
													<div class="sess-row">
														<div class="sess-row-top">
															<div class="sess-exname">{entry.exercise}</div>
															<div class="sess-maxval">
																{#if entry.type === 'cardio'}
																	{@const ce = entry as CardioEntry}
																	<div class="sess-val">
																		{ce.min || 0}<small> min</small>
																	</div>
																{:else}
																	{@const we = entry as WeightEntry}
																	{@const mx = entryMaxWeight(we)}
																	{@const sc = entrySetCount(we)}
																	<div class="sess-val">
																		{mx || '?'}<small> {we.unit || 'kg'}</small>
																	</div>
																	<div class="sess-val-sub">{sc.working} series</div>
																{/if}
															</div>
														</div>

														<!-- Set chips (weight entries only) -->
														{#if entry.type === 'pesas'}
															{@const we = entry as WeightEntry}
															{#if we.sets && we.sets.length > 0}
																<div class="sess-sets-grid">
																	{#each we.sets as s}
																		<div class="sess-set-chip" class:warmup={s.warmup}>
																			{s.w}<small>{we.unit || 'kg'}</small> &times; {s.r}{#if s.warmup}
																				{' '}<span class="sess-set-w">C</span>
																			{/if}
																		</div>
																	{/each}
																</div>

																<!-- Stats bar for working sets -->
																{@const working = getWorkingSets(we)}
																{#if working.length > 0}
																	{@const avg = getAvgWeight(we)}
																	{@const vol = getVolume(we)}
																	{@const best1rm = entryBest1RM(we)}
																	{@const unit = we.unit || 'kg'}
																	<div class="sess-stats">
																		<span>Promedio <b>{avg} {unit}</b></span>
																		<span>Volumen <b>{vol} {unit}</b></span>
																		{#if best1rm}
																			<span>1RM <b>{best1rm} {unit}</b></span>
																		{/if}
																	</div>
																{/if}
															{/if}
														{/if}

														<!-- Notes -->
														{#if entry.notes}
															<div class="sess-note">{entry.notes}</div>
														{/if}
													</div>
												{/each}
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
