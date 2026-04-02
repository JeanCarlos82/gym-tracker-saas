<script lang="ts">
	import { db, todayDayKey, todaySession } from '$lib/stores/db';
	import { calcStreak, calcProgressStreak } from '$lib/utils/streaks';

	const DL: Record<string, string> = {
		domingo: 'Domingo', lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
		jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado'
	};
	const MO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

	let dayName = $derived(DL[$todayDayKey] || '—');
	let dateStr = $derived.by(() => {
		const d = new Date();
		return `${d.getDate()} ${MO[d.getMonth()]}`;
	});
	let badge = $derived.by(() => {
		const day = $db.routine[$todayDayKey];
		return day?.rest ? 'DESCANSO' : (day?.label || '—');
	});
	let constancia = $derived(calcStreak($db.sessions, $db.routine));
	let progreso = $derived(calcProgressStreak($db.sessions));
</script>

<div class="hdr">
	<div>
		<div class="hdr-day">{dayName} <span class="hdr-date">{dateStr}</span></div>
	</div>
	<div class="hdr-right">
		{#if constancia >= 1}
			<div class="streak-chip fire">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z"/></svg>
				<span>{constancia}</span>
			</div>
		{/if}
		{#if progreso >= 1}
			<div class="streak-chip bolt">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
				<span>{progreso}</span>
			</div>
		{/if}
		<div class="hdr-badge" class:rest={badge === 'DESCANSO'}>{badge}</div>
	</div>
</div>
