<script lang="ts">
	import { db } from '$lib/stores/db';
	import { onMount } from 'svelte';
	import { fmtD } from '$lib/utils/format';
	import {
		entryMaxWeight,
		entryVolume,
		entryBest1RM,
		linearRegression,
		detectPlateau
	} from '$lib/utils/calculations';
	import { getExerciseInfo, getExerciseMuscleGroup } from '$lib/data/exercises';
	import type { Entry, WeightEntry, CardioEntry, Session } from '$lib/stores/db';

	// Chart.js loaded dynamically
	let Chart: any;
	let chartInstance: any = null;
	let chartCanvas: HTMLCanvasElement;
	let chartReady = $state(false);

	onMount(async () => {
		Chart = (await import('chart.js/auto')).default;
		chartReady = true;
	});

	// ── State ──
	let progPeriodDays = $state(30);
	let selectedExercise: string | null = $state(null);
	let searchQuery = $state('');

	// ── Period sessions ──
	let periodSessions = $derived.by(() => {
		const sessions = $db.sessions.filter((s: Session) => s.entries?.length > 0);
		if (progPeriodDays === 0) return sessions;
		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - progPeriodDays);
		const cutoffStr = cutoff.toISOString().split('T')[0];
		return sessions.filter((s: Session) => s.date >= cutoffStr);
	});

	// ── Summary stats ──
	let totalSessions = $derived(periodSessions.length);

	let totalVolume = $derived(
		periodSessions.reduce(
			(a: number, s: Session) =>
				a + s.entries.reduce((b: number, e: Entry) => b + entryVolume(e), 0),
			0
		)
	);

	let totalSets = $derived(
		periodSessions.reduce(
			(a: number, s: Session) =>
				a +
				s.entries.reduce((b: number, e: Entry) => {
					if ('sets' in e && e.sets) return b + e.sets.filter((st) => !st.warmup).length;
					return b;
				}, 0),
			0
		)
	);

	let formattedVolume = $derived(
		totalVolume >= 1000 ? (totalVolume / 1000).toFixed(1) + 'k' : String(Math.round(totalVolume))
	);

	// ── Logged exercises ──
	function getLoggedExercises(): Set<string> {
		const names = new Set<string>();
		$db.sessions.forEach((s: Session) =>
			s.entries?.forEach((e: Entry) => names.add(e.exercise))
		);
		return names;
	}

	// ── Exercise trend ──
	function getExerciseTrend(name: string): 'up' | 'down' | 'stable' | 'new' {
		const sessions = $db.sessions
			.filter((s: Session) => s.entries?.some((e: Entry) => e.exercise === name))
			.sort((a: Session, b: Session) => b.date.localeCompare(a.date))
			.slice(0, 3);
		if (sessions.length < 2) return 'new';
		const weights = sessions.map((s: Session) => {
			const e = s.entries.find((e: Entry) => e.exercise === name);
			return entryMaxWeight(e) || 0;
		});
		if (weights[0] > weights[1]) return 'up';
		if (weights[0] < weights[1]) return 'down';
		return 'stable';
	}

	// ── Recent PRs ──
	let recentPRs = $derived.by(() => {
		const prs: { exercise: string; weight: number; unit: string; date: string }[] = [];
		const bestByExercise: Record<string, number> = {};
		const sorted = [...$db.sessions].sort((a: Session, b: Session) =>
			a.date.localeCompare(b.date)
		);
		sorted.forEach((sess: Session) => {
			(sess.entries || []).forEach((e: Entry) => {
				if (e.type === 'cardio') return;
				const mx = entryMaxWeight(e);
				if (!mx) return;
				if (!bestByExercise[e.exercise] || mx > bestByExercise[e.exercise]) {
					if (bestByExercise[e.exercise])
						prs.push({
							exercise: e.exercise,
							weight: mx,
							unit: (e as WeightEntry).unit || 'kg',
							date: sess.date
						});
					bestByExercise[e.exercise] = mx;
				}
			});
		});
		return prs
			.sort((a, b) => b.date.localeCompare(a.date))
			.slice(0, 3)
			.sort((a, b) => b.weight - a.weight);
	});

	const prColors = ['var(--accent)', 'var(--muted2)', 'var(--orange)'];

	// ── Exercise list ──
	let exerciseList = $derived.by(() => {
		const logged = getLoggedExercises();
		const q = searchQuery.trim().toLowerCase();
		let exercises = [...logged].filter((name) => {
			if (q && !name.toLowerCase().includes(q)) return false;
			return true;
		});
		// Sort by most recent
		const lastDate: Record<string, string> = {};
		[...$db.sessions]
			.sort((a: Session, b: Session) => b.date.localeCompare(a.date))
			.forEach((s: Session) =>
				s.entries?.forEach((e: Entry) => {
					if (!lastDate[e.exercise]) lastDate[e.exercise] = s.date;
				})
			);
		exercises.sort((a, b) => (lastDate[b] || '').localeCompare(lastDate[a] || ''));
		return exercises;
	});

	const trendIcons: Record<string, string> = { up: '\u2191', down: '\u2193', stable: '\u2192', new: '\u25CF' };
	const trendColors: Record<string, string> = {
		up: 'var(--green)',
		down: 'var(--red)',
		stable: 'var(--muted2)',
		new: 'var(--blue)'
	};

	// ── Select exercise ──
	function selectEx(name: string) {
		selectedExercise = selectedExercise === name ? null : name;
	}

	// ── Exercise detail data ──
	let isCardio = $derived.by(() => {
		if (!selectedExercise) return false;
		const info = getExerciseInfo(selectedExercise);
		if (info?.type === 'cardio') return true;
		return $db.sessions.some((s: Session) =>
			s.entries?.find((e: Entry) => e.exercise === selectedExercise && e.type === 'cardio')
		);
	});

	let exerciseMG = $derived(selectedExercise ? getExerciseMuscleGroup(selectedExercise) : '');

	// ── Cardio data points ──
	let cardioPoints = $derived.by(() => {
		if (!selectedExercise || !isCardio) return [];
		const cpts: { date: string; min: number; km: number; cal: number; intensity: string; notes?: string }[] = [];
		$db.sessions.forEach((s: Session) => {
			const e = s.entries?.find(
				(e: Entry) => e.exercise === selectedExercise && e.type === 'cardio'
			) as CardioEntry | undefined;
			if (e && e.min)
				cpts.push({
					date: s.date,
					min: e.min || 0,
					km: e.km || 0,
					cal: e.cal || 0,
					intensity: e.intensity || 'media',
					notes: e.notes
				});
		});
		cpts.sort((a, b) => a.date.localeCompare(b.date));
		return cpts;
	});

	// ── Weight data points ──
	let weightPoints = $derived.by(() => {
		if (!selectedExercise || isCardio) return [];
		const pts: { date: string; mx: number; vol: number; unit: string; notes?: string; rm: number }[] = [];
		$db.sessions.forEach((s: Session) => {
			const e = s.entries?.find((e: Entry) => e.exercise === selectedExercise);
			if (e) {
				const mx = entryMaxWeight(e);
				const vol = entryVolume(e);
				const unit = (e as WeightEntry).unit || 'kg';
				const rm = entryBest1RM(e);
				if (mx) pts.push({ date: s.date, mx, vol, unit, notes: e.notes, rm });
			}
		});
		pts.sort((a, b) => a.date.localeCompare(b.date));
		return pts;
	});

	// ── Weight stats ──
	let weightStats = $derived.by(() => {
		if (!weightPoints.length) return null;
		const mxVals = weightPoints.map((p) => p.mx);
		const maxV = Math.max(...mxVals);
		const unit = weightPoints[0].unit;
		const totalVol = weightPoints.reduce((a, p) => a + p.vol, 0);
		const isPR = mxVals[mxVals.length - 1] === maxV;
		const best1rm = Math.max(...weightPoints.map((p) => p.rm || 0));
		const plateau = detectPlateau(mxVals);
		return { mxVals, maxV, unit, totalVol, isPR, best1rm, plateau, count: weightPoints.length };
	});

	// ── Cardio stats ──
	let cardioStats = $derived.by(() => {
		if (!cardioPoints.length) return null;
		const minVals = cardioPoints.map((p) => p.min);
		const maxMin = Math.max(...minVals);
		const totalMin = minVals.reduce((a, v) => a + v, 0);
		const totalKm = cardioPoints.reduce((a, p) => a + p.km, 0);
		const totalCal = cardioPoints.reduce((a, p) => a + p.cal, 0);
		return { minVals, maxMin, totalMin, totalKm, totalCal, count: cardioPoints.length };
	});

	// ── Best sets by reps (weight only) ──
	let bestByReps = $derived.by(() => {
		if (!selectedExercise || isCardio) return [];
		const allSets: { w: number; r: number; date: string; unit: string }[] = [];
		$db.sessions.forEach((s: Session) => {
			const e = s.entries?.find((e: Entry) => e.exercise === selectedExercise);
			if (e && 'sets' in e && e.sets)
				e.sets
					.filter((st) => !st.warmup)
					.forEach((st) =>
						allSets.push({
							w: parseFloat(String(st.w)) || 0,
							r: parseInt(String(st.r)) || 0,
							date: s.date,
							unit: (e as WeightEntry).unit || 'kg'
						})
					);
		});
		const best: Record<number, { w: number; r: number; date: string; unit: string }> = {};
		allSets.forEach((s) => {
			if (!best[s.r] || s.w > best[s.r].w) best[s.r] = s;
		});
		return Object.keys(best)
			.map(Number)
			.sort((a, b) => a - b)
			.map((r) => best[r]);
	});

	// ── Recent sessions for exercise ──
	let recentExSessions = $derived.by(() => {
		if (!selectedExercise) return [];
		if (isCardio) {
			return cardioPoints
				.slice()
				.reverse()
				.slice(0, 5);
		}
		return [...$db.sessions]
			.filter((s: Session) =>
				s.entries?.some((e: Entry) => e.exercise === selectedExercise)
			)
			.sort((a: Session, b: Session) => b.date.localeCompare(a.date))
			.slice(0, 5);
	});

	// ── Notes ──
	let notesData = $derived.by(() => {
		if (!selectedExercise) return [];
		if (isCardio) {
			return cardioPoints
				.filter((p) => p.notes)
				.reverse()
				.slice(0, 5)
				.map((p) => ({ date: p.date, text: p.notes!, value: p.min, unit: 'min' }));
		}
		return weightPoints
			.filter((p) => p.notes)
			.reverse()
			.slice(0, 5)
			.map((p) => ({ date: p.date, text: p.notes!, value: p.mx, unit: p.unit }));
	});

	// ── Has enough data for chart ──
	let hasChartData = $derived(
		isCardio ? cardioPoints.length >= 2 : weightPoints.length >= 2
	);

	// ── Chart rendering via $effect ──
	$effect(() => {
		// Dependencies: selectedExercise, isCardio, cardioPoints, weightPoints, Chart, chartCanvas
		const _ex = selectedExercise;
		const _isC = isCardio;
		const _cpts = cardioPoints;
		const _wpts = weightPoints;

		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		if (!_ex || !Chart || !chartCanvas) return;

		if (_isC) {
			if (_cpts.length < 2) return;
			const minVals = _cpts.map((p) => p.min);
			const lr = linearRegression(minVals);
			const trendData = minVals.map((_, i) =>
				Math.round((lr.intercept + lr.slope * i) * 10) / 10
			);

			chartInstance = new Chart(chartCanvas.getContext('2d'), {
				type: 'line',
				data: {
					labels: _cpts.map((p) => fmtD(p.date)),
					datasets: [
						{
							data: minVals,
							borderColor: '#38bdf8',
							backgroundColor: (ctx: any) => {
								const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
								g.addColorStop(0, 'rgba(56,189,248,0.2)');
								g.addColorStop(1, 'rgba(56,189,248,0)');
								return g;
							},
							borderWidth: 2.5,
							pointBackgroundColor: '#38bdf8',
							pointBorderColor: 'rgba(56,189,248,0.3)',
							pointBorderWidth: 1,
							pointRadius: 3,
							pointHoverRadius: 7,
							fill: true,
							tension: 0.35
						},
						{
							data: trendData,
							borderColor: 'rgba(232,255,58,0.4)',
							borderWidth: 1.5,
							borderDash: [6, 4],
							pointRadius: 0,
							fill: false,
							tension: 0
						}
					]
				},
				options: chartOptions((ctx: any) => {
					const p = _cpts[ctx.dataIndex];
					const parts: string[] = [];
					if (p?.intensity !== 'media') parts.push(p?.intensity || '');
					if (p?.km) parts.push(p.km + 'km');
					if (p?.cal) parts.push(p.cal + 'kcal');
					return parts.length ? parts.join(' \u00B7 ') : '';
				}, 'min')
			});
		} else {
			if (_wpts.length < 2) return;
			const mxVals = _wpts.map((p) => p.mx);
			const maxV = Math.max(...mxVals);
			const unit = _wpts[0].unit;
			const prIdx = mxVals.lastIndexOf(maxV);
			const lr = linearRegression(mxVals);
			const trendData = mxVals.map((_, i) =>
				Math.round((lr.intercept + lr.slope * i) * 10) / 10
			);

			chartInstance = new Chart(chartCanvas.getContext('2d'), {
				type: 'line',
				data: {
					labels: _wpts.map((p) => fmtD(p.date)),
					datasets: [
						{
							data: mxVals,
							borderColor: '#E8FF3A',
							backgroundColor: (ctx: any) => {
								const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
								g.addColorStop(0, 'rgba(232,255,58,0.2)');
								g.addColorStop(1, 'rgba(232,255,58,0)');
								return g;
							},
							borderWidth: 2.5,
							pointBackgroundColor: mxVals.map((_, i) =>
								i === prIdx ? '#000' : '#E8FF3A'
							),
							pointBorderColor: mxVals.map((_, i) =>
								i === prIdx ? '#E8FF3A' : 'rgba(232,255,58,0.3)'
							),
							pointBorderWidth: mxVals.map((_, i) => (i === prIdx ? 2.5 : 1)),
							pointRadius: mxVals.map((_, i) => (i === prIdx ? 6 : 3)),
							pointHoverRadius: 7,
							fill: true,
							tension: 0.35
						},
						{
							data: trendData,
							borderColor: 'rgba(58,180,255,0.4)',
							borderWidth: 1.5,
							borderDash: [6, 4],
							pointRadius: 0,
							fill: false,
							tension: 0
						}
					]
				},
				options: chartOptions((ctx: any) => {
					const p = _wpts[ctx.dataIndex];
					return p?.notes ? `\u270E ${p.notes}` : '';
				}, unit)
			});
		}

		return () => {
			if (chartInstance) {
				chartInstance.destroy();
				chartInstance = null;
			}
		};
	});

	function chartOptions(afterLabelCb: (ctx: any) => string, unitLabel: string) {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					backgroundColor: '#1a1a1a',
					titleColor: '#888',
					bodyColor: '#f2f2f2',
					borderColor: '#202020',
					borderWidth: 1,
					padding: 9,
					filter: (item: any) => item.datasetIndex === 0,
					callbacks: {
						label: (ctx: any) => `${ctx.raw} ${unitLabel}`,
						afterLabel: afterLabelCb
					}
				}
			},
			scales: {
				x: {
					ticks: { color: '#666', font: { size: 8, family: "'DM Mono',monospace" } },
					grid: { color: 'rgba(255,255,255,0.03)' },
					border: { color: '#202020' }
				},
				y: {
					ticks: { color: '#666', font: { size: 8, family: "'DM Mono',monospace" } },
					grid: { color: 'rgba(255,255,255,0.03)' },
					border: { color: '#202020' }
				}
			}
		};
	}

	// ── Scroll to detail when exercise selected ──
	let detailEl: HTMLElement;
	$effect(() => {
		if (selectedExercise && detailEl) {
			setTimeout(
				() => detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' }),
				100
			);
		}
	});

	// ── Cardio session summary ──
	function cardioSessionParts(p: { min: number; intensity: string; km: number; cal: number }): string {
		const parts = [p.min + 'min'];
		if (p.intensity !== 'media') parts.push(p.intensity);
		if (p.km) parts.push(p.km + 'km');
		if (p.cal) parts.push(p.cal + 'kcal');
		return parts.join(' \u00B7 ');
	}

	// ── Period buttons ──
	const periods = [
		{ days: 7, label: '7d' },
		{ days: 30, label: '30d' },
		{ days: 90, label: '90d' },
		{ days: 0, label: 'Todo' }
	];
</script>

<!-- Period Selector -->
<div class="prog-periods">
	{#each periods as p}
		<button
			class="prog-period"
			class:active={progPeriodDays === p.days}
			onclick={() => (progPeriodDays = p.days)}
		>
			{p.label}
		</button>
	{/each}
</div>

<!-- Summary Cards -->
<div class="prog-cards">
	<div class="prog-card">
		<div class="prog-card-ico">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
			</svg>
		</div>
		<div class="prog-card-val">{totalSessions}</div>
		<div class="prog-card-lbl">Sesiones</div>
	</div>
	<div class="prog-card">
		<div class="prog-card-ico">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
			</svg>
		</div>
		<div class="prog-card-val" style="color:var(--orange)">{formattedVolume}</div>
		<div class="prog-card-lbl">kg volumen</div>
	</div>
	<div class="prog-card">
		<div class="prog-card-ico">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
			</svg>
		</div>
		<div class="prog-card-val" style="color:var(--blue)">{totalSets}</div>
		<div class="prog-card-lbl">Sets totales</div>
	</div>
</div>

<!-- Recent PRs -->
{#if recentPRs.length > 0}
	<div class="slbl slbl-ico">
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M6 9H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h0"/><path d="M18 9h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4h0"/><path d="M7 4h10v7a5 5 0 0 1-10 0V4z"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>
		</svg>
		PRs RECIENTES
	</div>
	<div class="prog-pr-list">
		{#each recentPRs as pr, i}
			<div class="prog-pr-item">
				<span class="prog-pr-icon" style="color:{prColors[i] || 'var(--muted2)'}">{i + 1}</span>
				<span class="prog-pr-name">{pr.exercise}</span>
				<span class="prog-pr-val">{pr.weight}{pr.unit}</span>
				<span class="prog-pr-date">{fmtD(pr.date)}</span>
			</div>
		{/each}
	</div>
{/if}

<!-- Exercise List -->
<div class="prog-ex-card">
	<div class="slbl" id="prog-ex-title">EJERCICIOS ({exerciseList.length})</div>
	<input
		class="prog-search"
		type="text"
		placeholder="Buscar ejercicio..."
		bind:value={searchQuery}
	/>

	{#if exerciseList.length === 0}
		<div style="padding:20px 0;text-align:center;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted2)">
			{searchQuery ? 'Sin resultados' : 'Registra ejercicios para ver progreso'}
		</div>
	{:else}
		<div class="prog-ex-list">
			{#each exerciseList as name}
				{@const lastSess = [...$db.sessions]
					.sort((a, b) => b.date.localeCompare(a.date))
					.find((s) => s.entries?.some((e) => e.exercise === name))}
				{@const lastEntry = lastSess?.entries?.find((e) => e.exercise === name)}
				{@const mx = entryMaxWeight(lastEntry)}
				{@const unit = lastEntry && 'unit' in lastEntry ? (lastEntry as WeightEntry).unit || 'kg' : 'kg'}
				{@const trend = getExerciseTrend(name)}
				{@const mg = getExerciseMuscleGroup(name)}
				<button
					class="prog-ex-item"
					class:active={selectedExercise === name}
					onclick={() => selectEx(name)}
				>
					<div class="prog-ex-left">
						<span class="prog-ex-name">{name}</span>
						<span class="prog-ex-mg">{mg}</span>
					</div>
					<div class="prog-ex-right">
						<span class="prog-ex-weight">{mx || '\u2014'}{mx ? unit : ''}</span>
						<span class="prog-ex-trend" style="color:{trendColors[trend]}">{trendIcons[trend]}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Exercise Detail Panel -->
{#if selectedExercise}
	<div class="prog-detail" bind:this={detailEl}>
		<!-- Header -->
		<div class="prog-detail-title">{selectedExercise}</div>
		<div class="prog-detail-mg">{exerciseMG}</div>

		{#if hasChartData}
			<!-- Stat Boxes -->
			<div class="stat-row">
				{#if isCardio && cardioStats}
					<div class="sbox">
						<div class="slb">MAXIMO</div>
						<div class="sv">{cardioStats.maxMin}</div>
						<div class="su">min max</div>
					</div>
					<div class="sbox">
						<div class="slb">TOTAL</div>
						<div class="sv">{Math.round(cardioStats.totalMin)}</div>
						<div class="su">min total</div>
					</div>
					<div class="sbox">
						<div class="slb">{cardioStats.totalKm ? 'DISTANCIA' : 'CALORIAS'}</div>
						<div class="sv">{cardioStats.totalKm ? cardioStats.totalKm.toFixed(1) : (cardioStats.totalCal || '\u2014')}</div>
						<div class="su">{cardioStats.totalKm ? 'km total' : 'kcal'}</div>
					</div>
					<div class="sbox">
						<div class="slb">SESIONES</div>
						<div class="sv">{cardioStats.count}</div>
					</div>
				{:else if weightStats}
					<div class="sbox">
						<div class="slb">RECORD</div>
						<div class="sv">{weightStats.maxV}</div>
						<div class="su">{weightStats.unit}</div>
					</div>
					<div class="sbox">
						<div class="slb">1RM EST</div>
						<div class="sv">{weightStats.best1rm || '\u2014'}</div>
						<div class="su">{weightStats.unit}</div>
					</div>
					<div class="sbox">
						<div class="slb">VOLUMEN</div>
						<div class="sv">{Math.round(weightStats.totalVol).toLocaleString()}</div>
						<div class="su">kg</div>
					</div>
					<div class="sbox">
						<div class="slb">SESIONES</div>
						<div class="sv">{weightStats.count}</div>
					</div>
				{/if}
			</div>

			<!-- PR Badge (weight only) -->
			{#if !isCardio && weightStats?.isPR}
				<div style="margin-bottom:8px">
					<span class="pr-badge">PR ACTUAL</span>
				</div>
			{/if}

			<!-- Plateau Alert (weight only) -->
			{#if !isCardio && weightStats?.plateau.isPlateaued && (weightStats?.mxVals.length ?? 0) >= 4}
				<div class="plateau-alert">
					<span class="plateau-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="3" y1="17" x2="8" y2="12"/><line x1="8" y1="12" x2="21" y2="12" stroke-dasharray="3 2"/>
						</svg>
					</span>
					<div>
						<div class="plateau-title">Meseta detectada &mdash; {weightStats.plateau.sessionsStuck} sesiones sin progreso</div>
						<div class="plateau-tip">Prueba: subir reps, reducir peso 10%, o cambiar variante</div>
					</div>
				</div>
			{/if}

			<!-- Chart -->
			<div class="chart-box">
				{#if chartReady}
					<div class="chart-top">
						<span class="chart-title">{isCardio ? 'TIEMPO POR SESION' : 'PESO MAXIMO POR SESION'}</span>
					</div>
					<div class="chart-canvas-wrap">
						<canvas bind:this={chartCanvas}></canvas>
					</div>
				{:else}
					<div style="padding:12px">
						<div class="skeleton skeleton-text short" style="margin-bottom:16px"></div>
						<div class="skeleton" style="height:200px;border-radius:12px"></div>
					</div>
				{/if}
			</div>

			<!-- Best Sets by Reps (weight only) -->
			{#if !isCardio && bestByReps.length > 0}
				<div class="slbl slbl-ico">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
					</svg>
					MEJORES SETS POR REPS
				</div>
				<div class="prog-best-list">
					{#each bestByReps as s}
						<div class="prog-best-row">
							<span class="prog-best-reps">{s.r} rep{s.r > 1 ? 's' : ''}</span>
							<span class="prog-best-weight">{s.w}{s.unit}</span>
							<span class="prog-best-date">{fmtD(s.date)}</span>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Recent Sessions -->
			{#if recentExSessions.length > 0}
				<div class="slbl slbl-ico">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
					</svg>
					ULTIMAS SESIONES
				</div>
				<div class="prog-recent-list">
					{#if isCardio}
						{#each recentExSessions as p}
							<div class="prog-recent-row">
								<span class="prog-recent-date">{fmtD(p.date)}</span>
								<span class="prog-recent-info">{cardioSessionParts(p)}</span>
							</div>
						{/each}
					{:else}
						{#each recentExSessions as s}
							{@const e = s.entries.find((e) => e.exercise === selectedExercise)}
							{@const mx = entryMaxWeight(e)}
							{@const vol = entryVolume(e)}
							{@const sc = e && 'sets' in e ? e.sets?.filter((st) => !st.warmup).length || 0 : 0}
							<div class="prog-recent-row">
								<span class="prog-recent-date">{fmtD(s.date)}</span>
								<span class="prog-recent-info">{sc}&times;{mx}{e && 'unit' in e ? (e as WeightEntry).unit || 'kg' : 'kg'}</span>
								<span class="prog-recent-vol">{Math.round(vol)}kg vol</span>
							</div>
						{/each}
					{/if}
				</div>
			{/if}

			<!-- Notes -->
			{#if notesData.length > 0}
				<div class="slbl slbl-ico" style="margin-top:8px">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
					</svg>
					NOTAS
				</div>
				{#each notesData as n}
					<div class="note-row">
						<div class="note-date">{fmtD(n.date)}</div>
						<div class="note-text">{n.text}</div>
						<div class="note-wt">{n.value}<span style="font-size:8px;color:var(--muted2)"> {n.unit}</span></div>
					</div>
				{/each}
			{/if}
		{:else}
			<!-- Not enough data -->
			<div class="chart-box">
				<div class="chart-empty">
					{isCardio ? 'Registra al menos 2 sesiones de cardio para ver progreso' : 'Registra al menos 2 sesiones para ver la grafica'}
				</div>
			</div>
		{/if}
	</div>
{/if}
