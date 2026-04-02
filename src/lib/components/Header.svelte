<script lang="ts">
	import { db, todayDayKey, todaySession } from '$lib/stores/db';

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
</script>

<div class="hdr">
	<div>
		<div class="hdr-eyebrow">ENTRENAMIENTO HOY</div>
		<div class="hdr-day">{dayName}</div>
		<div class="hdr-date">{dateStr}</div>
	</div>
	<div class="hdr-right">
		<div class="hdr-badge">{badge}</div>
		<div class="hdr-timer" id="hdr-timer" style="display:none"></div>
	</div>
</div>
