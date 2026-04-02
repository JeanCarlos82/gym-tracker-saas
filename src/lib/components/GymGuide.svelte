<script lang="ts">
	let { visible = $bindable(false) }: { visible: boolean } = $props();

	interface GuideItem {
		ico: string;
		term: string;
		name: string;
		desc: string;
		example: string;
	}
	interface GuideCategory {
		cat: string;
		color: string;
		items: GuideItem[];
	}

	const GUIDE_DATA: GuideCategory[] = [
		{cat:'MEDIDAS DE FUERZA',color:'var(--accent)',items:[
			{ico:'dumbbell',term:'1RM',name:'1 Rep Max',desc:'El peso máximo que puedes levantar en una sola repetición. Es la referencia universal de fuerza.',example:'Si haces 80kg × 5 reps en press banca, tu 1RM estimado es ~93kg. No necesitas intentar tu máximo real — la app lo calcula por ti.'},
			{ico:'trophy',term:'PR',name:'Personal Record',desc:'Tu récord personal — el mejor rendimiento que has logrado en un ejercicio.',example:'Si antes tu máximo en sentadilla era 100kg y hoy levantas 105kg, ¡ese es tu nuevo PR!'},
			{ico:'gauge',term:'Peso máximo',name:'Max Weight',desc:'El peso más alto que usaste en tus sets de trabajo (sin contar calentamiento) durante una sesión.',example:'Si hiciste 3 series de press banca: 60kg, 70kg y 75kg — tu peso máximo es 75kg.'},
		]},
		{cat:'VOLUMEN Y CARGA',color:'var(--orange)',items:[
			{ico:'bars',term:'Volumen',name:'Total Volume',desc:'La cantidad total de peso que moviste. Se calcula: peso × repeticiones, sumado en todas las series.',example:'3 series de 80kg × 10 reps = 2,400kg de volumen. Más volumen = más estímulo muscular.'},
			{ico:'layers',term:'Series (Sets)',name:'Working Sets',desc:'Cada grupo de repeticiones que haces de un ejercicio. Las series "de trabajo" son las que cuentan — no el calentamiento.',example:'Si haces 4 × 10 en curl de bíceps, son 4 series de 10 repeticiones cada una.'},
			{ico:'cycle',term:'Reps',name:'Repeticiones',desc:'El número de veces que repites un movimiento dentro de una serie.',example:'Si subes y bajas la barra 10 veces en press banca, hiciste 10 reps.'},
			{ico:'warmup',term:'Calentamiento',name:'Warm-up Set',desc:'Series ligeras que haces antes de tus sets de trabajo para preparar músculos y articulaciones. No cuentan en los cálculos.',example:'Antes de hacer sentadilla con 100kg, haces 1 serie con 40kg y otra con 70kg. Esas son de calentamiento.'},
		]},
		{cat:'PROGRESO',color:'var(--blue)',items:[
			{ico:'trend',term:'Sobrecarga progresiva',name:'Progressive Overload',desc:'El principio fundamental del gym: aumentar gradualmente la dificultad (peso, reps o series) para que tus músculos sigan creciendo.',example:'Semana 1: 60kg × 8 reps. Semana 2: 60kg × 10 reps. Semana 3: 62.5kg × 8 reps. Eso es sobrecarga progresiva.'},
			{ico:'plateau',term:'Plateau',name:'Estancamiento',desc:'Cuando dejas de progresar durante varias semanas. Es normal y tiene solución: cambiar ejercicios, volumen o descanso.',example:'Si llevas 3 semanas haciendo press banca con 70kg × 8 y no logras subir, estás en un plateau.'},
			{ico:'flame',term:'Streak de constancia',name:'Consistency Streak',desc:'Días consecutivos que has entrenado según tu rutina. Mide tu disciplina.',example:'Si tu rutina es Lun-Mié-Vie y entrenas los 3 días durante 4 semanas sin fallar, tu streak crece.'},
			{ico:'bolt',term:'Streak de progreso',name:'Progress Streak',desc:'Sesiones consecutivas donde mejoraste vs. la sesión anterior (más peso, más reps o más volumen).',example:'Si cada sesión de pecho superas algo de la anterior, tu streak de progreso sube.'},
		]},
		{cat:'CUERPO',color:'var(--green)',items:[
			{ico:'scale',term:'IMC',name:'Índice de Masa Corporal',desc:'Una medida básica que relaciona tu peso y altura. Útil como referencia general, pero no distingue entre músculo y grasa.',example:'Peso 75kg, mido 1.75m → IMC = 75 ÷ (1.75²) = 24.5 (normal). Un fisicoculturista de 95kg puede tener IMC "alto" pero poca grasa.'},
			{ico:'expand',term:'Hipertrofia',name:'Muscle Growth',desc:'El objetivo de aumentar el tamaño muscular. Se logra con 8-12 reps por serie y descansos de 60-90 segundos.',example:'Si tu objetivo es que los músculos se vean más grandes, entrenas en rango de hipertrofia.'},
			{ico:'target',term:'Fuerza',name:'Strength',desc:'El objetivo de levantar el máximo peso posible. Se entrena con 1-5 reps por serie con pesos altos y descansos largos (3-5 min).',example:'Un powerlifter entrena fuerza: pocas reps, mucho peso, mucho descanso entre series.'},
			{ico:'pulse',term:'Resistencia',name:'Endurance',desc:'La capacidad de mantener el esfuerzo por más tiempo. Se entrena con 15+ reps, poco peso y descansos cortos.',example:'Hacer 20 reps de sentadilla con peso ligero entrena resistencia muscular.'},
		]},
	];

	let expanded = $state<string | null>(null);

	function toggleItem(term: string) {
		expanded = expanded === term ? null : term;
	}

	function close(e: MouseEvent) {
		if ((e.target as HTMLElement).id === 'guide-overlay') visible = false;
	}

	// Swipe to dismiss
	let swipeStartY = 0;
	let swipeY = $state(0);
	let swiping = $state(false);

	function onTouchStart(e: TouchEvent) {
		const modal = (e.target as HTMLElement).closest('.modal');
		if (modal && modal.scrollTop > 0) return;
		swipeStartY = e.touches[0].clientY;
		swiping = true;
	}

	function onTouchMove(e: TouchEvent) {
		if (!swiping) return;
		const delta = e.touches[0].clientY - swipeStartY;
		swipeY = Math.max(0, delta);
	}

	function onTouchEnd() {
		if (swipeY > 100) {
			visible = false;
		}
		swipeY = 0;
		swiping = false;
	}
</script>

<div class="overlay" class:open={visible} id="guide-overlay" onclick={close}
	style:opacity={swiping && swipeY > 0 ? Math.max(0.3, 1 - swipeY / 300) : undefined}
>
	<div class="modal modal-scroll" onclick={(e) => e.stopPropagation()}
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
		style:transform={swipeY > 0 ? `translateY(${swipeY}px)` : undefined}
		style:transition={swiping ? 'none' : 'transform 0.35s cubic-bezier(0.32,0.72,0,1)'}
	>
		<div class="mhandle"></div>
		<div class="mtitle">GUÍA DEL GYM</div>
		<div class="msub">Todo lo que necesitas saber para empezar</div>

		{#each GUIDE_DATA as cat}
			<div class="guide-cat">
				<div class="guide-cat-hdr" style="--cat-color:{cat.color}">{cat.cat}</div>
				{#each cat.items as item}
					<div
						class="guide-card"
						class:expanded={expanded === item.term}
						onclick={() => toggleItem(item.term)}
						style="--cat-color:{cat.color}"
					>
						<div class="guide-card-top">
							<span class="guide-card-ico">
								<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
									{#if item.ico === 'dumbbell'}
										<line x1="4" y1="12" x2="20" y2="12"/><rect x="2" y="9" width="4" height="6" rx="1.5"/><rect x="18" y="9" width="4" height="6" rx="1.5"/>
									{:else if item.ico === 'trophy'}
										<path d="M6 9H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h0"/><path d="M18 9h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4h0"/><path d="M7 4h10v7a5 5 0 0 1-10 0V4z"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>
									{:else if item.ico === 'gauge'}
										<path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12"/><line x1="12" y1="12" x2="17" y2="7"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
									{:else if item.ico === 'bars'}
										<line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
									{:else if item.ico === 'layers'}
										<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
									{:else if item.ico === 'cycle'}
										<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
									{:else if item.ico === 'warmup'}
										<path d="M9 18a3 3 0 0 0 6 0c0-2-1.5-3-3-4.5C10.5 15 9 16 9 18z"/><path d="M12 2C8.5 5 5 8.5 5 13a7 7 0 0 0 14 0c0-4.5-3.5-8-7-11z" stroke-dasharray="3 2"/>
									{:else if item.ico === 'trend'}
										<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
									{:else if item.ico === 'plateau'}
										<line x1="3" y1="17" x2="8" y2="12"/><line x1="8" y1="12" x2="21" y2="12" stroke-dasharray="3 2"/>
									{:else if item.ico === 'flame'}
										<path d="M12 22c4.97 0 7-3.58 7-7.5 0-4.05-3.5-7.5-7-10.5-3.5 3-7 6.45-7 10.5C5 18.42 7.03 22 12 22z"/><path d="M12 22c2 0 3.5-1.5 3.5-4 0-2.5-1.75-4-3.5-5.5C10.25 14 8.5 15.5 8.5 18c0 2.5 1.5 4 3.5 4z"/>
									{:else if item.ico === 'bolt'}
										<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
									{:else if item.ico === 'scale'}
										<path d="M12 3v4"/><circle cx="12" cy="3" r="1"/><path d="M6.5 10L12 7l5.5 3"/><rect x="4" y="14" width="16" height="4" rx="2"/><line x1="8" y1="18" x2="8" y2="20"/><line x1="16" y1="18" x2="16" y2="20"/>
									{:else if item.ico === 'expand'}
										<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
									{:else if item.ico === 'target'}
										<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
									{:else if item.ico === 'pulse'}
										<path d="M3 12h4l3-9 4 18 3-9h4"/>
									{/if}
								</svg>
							</span>
							<div class="guide-card-info">
								<div class="guide-card-term">{item.term}</div>
								<div class="guide-card-name">{item.name}</div>
							</div>
							<span class="guide-card-arrow">›</span>
						</div>
						{#if expanded === item.term}
							<div class="guide-card-body">
								<p class="guide-card-desc">{item.desc}</p>
								<div class="guide-card-example">
									<div class="guide-card-ex-label">EJEMPLO</div>
									<p>{item.example}</p>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
