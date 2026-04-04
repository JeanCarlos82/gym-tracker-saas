import type { TemplateCollection } from '$lib/types';

// ── TEMPLATES MASCULINOS ──
// Enfoque: compuestos pesados como base, progresión de fuerza,
// equilibrio push/pull, piernas 2x/semana mínimo
export const TEMPLATES_M: TemplateCollection = {
  // 3 días: Full body — compuestos + máquinas de aislamiento
  fullbody_3: {
    exercises: [
      [
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'press_banca_barra', name: 'Press banca', type: 'pesas' },
        { id: 'remo_barra', name: 'Remo con barra', type: 'pesas' },
        { id: 'press_militar_barra', name: 'Press militar', type: 'pesas' },
        { id: 'curl_barra', name: 'Curl con barra', type: 'pesas' },
        { id: 'triceps_polea', name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'press_inclinado_barra', name: 'Press inclinado', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones laterales', type: 'pesas' },
        { id: 'curl_martillo', name: 'Curl martillo', type: 'pesas' },
        { id: 'press_frances', name: 'Press francés', type: 'pesas' }
      ],
      [
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'press_banca_mancuernas', name: 'Press con mancuernas', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'press_arnold', name: 'Press Arnold', type: 'pesas' },
        { id: 'face_pull', name: 'Face pull', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ]
    ],
    labels: ['Full Body A', 'Full Body B', 'Full Body C']
  },

  fullbody_cardio_3: {
    exercises: [
      [
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'press_banca_barra', name: 'Press banca', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'press_militar_barra', name: 'Press militar', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ],
      [
        { id: 'correr', name: 'Correr', type: 'cardio' },
        { id: 'eliptica', name: 'Elíptica', type: 'cardio' }
      ],
      [
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'press_inclinado_barra', name: 'Press inclinado', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones laterales', type: 'pesas' },
        { id: 'crunch', name: 'Crunch', type: 'pesas' }
      ]
    ],
    labels: ['Full Body', 'Cardio', 'Full Body']
  },

  // 4 días: Upper/Lower — máquinas para aislamiento, peso libre para compuestos
  upperlower_4: {
    exercises: [
      [
        { id: 'press_banca_barra', name: 'Press banca', type: 'pesas' },
        { id: 'remo_barra', name: 'Remo con barra', type: 'pesas' },
        { id: 'press_militar_barra', name: 'Press militar', type: 'pesas' },
        { id: 'curl_barra', name: 'Curl con barra', type: 'pesas' },
        { id: 'triceps_polea', name: 'Tríceps en polea', type: 'pesas' },
        { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones laterales', type: 'pesas' }
      ],
      [
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', type: 'pesas' },
        { id: 'pantorrillas_prensa', name: 'Pantorrillas en prensa', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ],
      [
        { id: 'press_inclinado_barra', name: 'Press inclinado', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'press_arnold', name: 'Press Arnold', type: 'pesas' },
        { id: 'curl_martillo', name: 'Curl martillo', type: 'pesas' },
        { id: 'triceps_maquina', name: 'Tríceps en máquina', type: 'pesas' },
        { id: 'face_pull', name: 'Face pull', type: 'pesas' }
      ],
      [
        { id: 'sentadilla_bulgara', name: 'Sentadilla búlgara', type: 'pesas' },
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'extensiones_cuadriceps', name: 'Extensiones cuádriceps', type: 'pesas' },
        { id: 'curl_femoral', name: 'Curl femoral', type: 'pesas' },
        { id: 'pantorrillas_pie', name: 'Pantorrillas', type: 'pesas' },
        { id: 'elevacion_piernas', name: 'Elevación de piernas', type: 'pesas' }
      ]
    ],
    labels: ['Upper A', 'Lower A', 'Upper B', 'Lower B']
  },

  // 5 días: PPL + Upper/Lower — mix peso libre y máquinas
  pplul_5: {
    exercises: [
      [
        { id: 'press_banca_barra', name: 'Press banca', type: 'pesas' },
        { id: 'press_inclinado_barra', name: 'Press inclinado', type: 'pesas' },
        { id: 'contractor_pecho', name: 'Contractor de pecho', type: 'pesas' },
        { id: 'press_militar_barra', name: 'Press militar', type: 'pesas' },
        { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones laterales', type: 'pesas' },
        { id: 'triceps_polea', name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'remo_barra', name: 'Remo con barra', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'face_pull', name: 'Face pull', type: 'pesas' },
        { id: 'curl_barra', name: 'Curl con barra', type: 'pesas' },
        { id: 'curl_martillo', name: 'Curl martillo', type: 'pesas' }
      ],
      [
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', type: 'pesas' },
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'pantorrillas_prensa', name: 'Pantorrillas en prensa', type: 'pesas' }
      ],
      [
        { id: 'press_inclinado_barra', name: 'Press inclinado', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'press_hombro_maquina', name: 'Press de hombro en máquina', type: 'pesas' },
        { id: 'curl_maquina', name: 'Curl en máquina', type: 'pesas' },
        { id: 'triceps_maquina', name: 'Tríceps en máquina', type: 'pesas' },
        { id: 'elevaciones_laterales_maquina', name: 'Elevaciones laterales en máquina', type: 'pesas' }
      ],
      [
        { id: 'sentadilla_bulgara', name: 'Sentadilla búlgara', type: 'pesas' },
        { id: 'extensiones_cuadriceps', name: 'Extensiones cuádriceps', type: 'pesas' },
        { id: 'curl_femoral', name: 'Curl femoral', type: 'pesas' },
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'pantorrillas_pie', name: 'Pantorrillas', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ]
    ],
    labels: ['Push', 'Pull', 'Legs', 'Upper', 'Lower']
  },

  // 6 días: PPL x2 — día 1 peso libre, día 2 más máquinas (variedad de estímulo)
  ppl_6: {
    exercises: [
      [
        { id: 'press_banca_barra', name: 'Press banca', type: 'pesas' },
        { id: 'press_inclinado_barra', name: 'Press inclinado', type: 'pesas' },
        { id: 'aperturas_mancuernas', name: 'Aperturas mancuernas', type: 'pesas' },
        { id: 'press_militar_barra', name: 'Press militar', type: 'pesas' },
        { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones laterales', type: 'pesas' },
        { id: 'triceps_polea', name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { id: 'dominadas', name: 'Dominadas', type: 'pesas' },
        { id: 'remo_barra', name: 'Remo con barra', type: 'pesas' },
        { id: 'remo_mancuerna', name: 'Remo con mancuerna', type: 'pesas' },
        { id: 'face_pull', name: 'Face pull', type: 'pesas' },
        { id: 'curl_barra', name: 'Curl con barra', type: 'pesas' },
        { id: 'curl_martillo', name: 'Curl martillo', type: 'pesas' }
      ],
      [
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', type: 'pesas' },
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'pantorrillas_pie', name: 'Pantorrillas', type: 'pesas' }
      ],
      [
        { id: 'press_inclinado_maquina', name: 'Press inclinado en máquina', type: 'pesas' },
        { id: 'contractor_pecho', name: 'Contractor de pecho', type: 'pesas' },
        { id: 'press_hombro_maquina', name: 'Press de hombro en máquina', type: 'pesas' },
        { id: 'elevaciones_laterales_maquina', name: 'Elevaciones laterales en máquina', type: 'pesas' },
        { id: 'triceps_maquina', name: 'Tríceps en máquina', type: 'pesas' },
        { id: 'press_frances', name: 'Press francés', type: 'pesas' }
      ],
      [
        { id: 'pulldown_maquina', name: 'Pulldown en máquina', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'remo_tbar', name: 'Remo T-bar', type: 'pesas' },
        { id: 'curl_maquina', name: 'Curl en máquina', type: 'pesas' },
        { id: 'curl_predicador', name: 'Curl predicador', type: 'pesas' },
        { id: 'face_pull', name: 'Face pull', type: 'pesas' }
      ],
      [
        { id: 'hack_squat', name: 'Hack squat', type: 'pesas' },
        { id: 'zancadas', name: 'Zancadas', type: 'pesas' },
        { id: 'extensiones_cuadriceps', name: 'Extensiones cuádriceps', type: 'pesas' },
        { id: 'curl_femoral', name: 'Curl femoral', type: 'pesas' },
        { id: 'pantorrillas_prensa', name: 'Pantorrillas en prensa', type: 'pesas' },
        { id: 'crunch_maquina', name: 'Crunch en máquina', type: 'pesas' }
      ]
    ],
    labels: ['Push Libre', 'Pull Libre', 'Legs Libre', 'Push Máquinas', 'Pull Máquinas', 'Legs Máquinas']
  }
};

// ── TEMPLATES FEMENINOS ──
// Basado en evidencia: glúteos 2-3x/semana, más lower que upper,
// hip thrust como movimiento principal, ejercicios unilaterales para
// estabilidad de cadera, cardio con Stairmaster para activar glúteos.
// Las mujeres recuperan más rápido (24-48h vs 48-72h hombres) permitiendo
// mayor frecuencia de glúteos.
export const TEMPLATES_F: TemplateCollection = {
  // 3 días: Full body con prioridad glúteos + máquinas de aislamiento
  fullbody_3: {
    exercises: [
      [
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'press_banca_mancuernas', name: 'Press con mancuernas', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'abductores_maquina', name: 'Abductores en máquina', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ],
      [
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'zancadas', name: 'Zancadas', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'press_hombro_maquina', name: 'Press de hombro en máquina', type: 'pesas' },
        { id: 'patada_gluteo_maquina', name: 'Patada de glúteo en máquina', type: 'pesas' },
        { id: 'elevacion_piernas', name: 'Elevación de piernas', type: 'pesas' }
      ],
      [
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'puente_gluteo', name: 'Puente de glúteo', type: 'pesas' },
        { id: 'press_banca_mancuernas', name: 'Press con mancuernas', type: 'pesas' },
        { id: 'remo_polea_baja', name: 'Remo en polea baja', type: 'pesas' },
        { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', type: 'pesas' },
        { id: 'crunch', name: 'Crunch', type: 'pesas' }
      ]
    ],
    labels: ['Full Body A', 'Full Body B', 'Full Body C']
  },

  fullbody_cardio_3: {
    exercises: [
      [
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'press_banca_mancuernas', name: 'Press con mancuernas', type: 'pesas' },
        { id: 'abductores_maquina', name: 'Abductores en máquina', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ],
      [
        { id: 'stairmaster', name: 'Stairmaster', type: 'cardio' },
        { id: 'eliptica', name: 'Elíptica', type: 'cardio' }
      ],
      [
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'press_hombro_maquina', name: 'Press de hombro en máquina', type: 'pesas' },
        { id: 'patada_gluteo_maquina', name: 'Patada de glúteo en máquina', type: 'pesas' },
        { id: 'elevacion_piernas', name: 'Elevación de piernas', type: 'pesas' }
      ]
    ],
    labels: ['Full Body', 'Cardio', 'Full Body']
  },

  // 4 días: 2 lower + 2 upper — máquinas integradas
  upperlower_4: {
    exercises: [
      [
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', type: 'pesas' },
        { id: 'abductores_maquina', name: 'Abductores en máquina', type: 'pesas' },
        { id: 'patada_gluteo_maquina', name: 'Patada de glúteo en máquina', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ],
      [
        { id: 'press_banca_mancuernas', name: 'Press con mancuernas', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'press_hombro_maquina', name: 'Press de hombro en máquina', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones laterales', type: 'pesas' },
        { id: 'triceps_polea', name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'extensiones_cuadriceps', name: 'Extensiones cuádriceps', type: 'pesas' },
        { id: 'puente_gluteo', name: 'Puente de glúteo', type: 'pesas' },
        { id: 'pantorrillas_prensa', name: 'Pantorrillas en prensa', type: 'pesas' },
        { id: 'elevacion_piernas', name: 'Elevación de piernas', type: 'pesas' }
      ],
      [
        { id: 'press_inclinado_barra', name: 'Press inclinado', type: 'pesas' },
        { id: 'remo_polea_baja', name: 'Remo en polea baja', type: 'pesas' },
        { id: 'face_pull', name: 'Face pull', type: 'pesas' },
        { id: 'curl_mancuernas', name: 'Curl con mancuernas', type: 'pesas' },
        { id: 'elevaciones_laterales_maquina', name: 'Elevaciones laterales en máquina', type: 'pesas' },
        { id: 'crunch', name: 'Crunch', type: 'pesas' }
      ]
    ],
    labels: ['Glúteos & Piernas A', 'Upper A', 'Glúteos & Piernas B', 'Upper B']
  },

  // 5 días: 3 lower + 2 upper — glúteos 3x/semana con variedad máquina/libre
  pplul_5: {
    exercises: [
      [
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', type: 'pesas' },
        { id: 'abductores_maquina', name: 'Abductores en máquina', type: 'pesas' },
        { id: 'patada_gluteo_maquina', name: 'Patada de glúteo en máquina', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ],
      [
        { id: 'press_banca_mancuernas', name: 'Press con mancuernas', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'press_hombro_maquina', name: 'Press de hombro en máquina', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones laterales', type: 'pesas' },
        { id: 'triceps_polea', name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'extensiones_cuadriceps', name: 'Extensiones cuádriceps', type: 'pesas' },
        { id: 'puente_gluteo', name: 'Puente de glúteo', type: 'pesas' },
        { id: 'pantorrillas_prensa', name: 'Pantorrillas en prensa', type: 'pesas' },
        { id: 'elevacion_piernas', name: 'Elevación de piernas', type: 'pesas' }
      ],
      [
        { id: 'press_inclinado_barra', name: 'Press inclinado', type: 'pesas' },
        { id: 'remo_polea_baja', name: 'Remo en polea baja', type: 'pesas' },
        { id: 'face_pull', name: 'Face pull', type: 'pesas' },
        { id: 'curl_mancuernas', name: 'Curl con mancuernas', type: 'pesas' },
        { id: 'elevaciones_laterales_maquina', name: 'Elevaciones laterales en máquina', type: 'pesas' },
        { id: 'crunch', name: 'Crunch', type: 'pesas' }
      ],
      [
        { id: 'hip_thrust_maquina', name: 'Hip thrust en máquina', type: 'pesas' },
        { id: 'zancadas', name: 'Zancadas', type: 'pesas' },
        { id: 'peso_muerto_sumo', name: 'Peso muerto sumo', type: 'pesas' },
        { id: 'curl_femoral', name: 'Curl femoral', type: 'pesas' },
        { id: 'abductores_maquina', name: 'Abductores en máquina', type: 'pesas' },
        { id: 'stairmaster', name: 'Stairmaster', type: 'cardio' }
      ]
    ],
    labels: ['Glúteos Heavy', 'Upper Push', 'Piernas & Core', 'Upper Pull', 'Glúteos & Cardio']
  },

  // 6 días: 3 lower + 2 upper + 1 cardio/core — días alternos libre/máquina
  ppl_6: {
    exercises: [
      [
        { id: 'hip_thrust_barra', name: 'Hip thrust', type: 'pesas' },
        { id: 'sentadilla_barra', name: 'Sentadilla', type: 'pesas' },
        { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', type: 'pesas' },
        { id: 'abductores_maquina', name: 'Abductores en máquina', type: 'pesas' },
        { id: 'patada_gluteo', name: 'Patada de glúteo', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ],
      [
        { id: 'press_banca_mancuernas', name: 'Press con mancuernas', type: 'pesas' },
        { id: 'jalon_pecho', name: 'Jalón al pecho', type: 'pesas' },
        { id: 'press_hombro_maquina', name: 'Press de hombro en máquina', type: 'pesas' },
        { id: 'remo_maquina', name: 'Remo en máquina', type: 'pesas' },
        { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones laterales', type: 'pesas' },
        { id: 'triceps_polea', name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { id: 'peso_muerto_rumano', name: 'Peso muerto rumano', type: 'pesas' },
        { id: 'prensa_pierna', name: 'Prensa de pierna', type: 'pesas' },
        { id: 'extensiones_cuadriceps', name: 'Extensiones cuádriceps', type: 'pesas' },
        { id: 'puente_gluteo', name: 'Puente de glúteo', type: 'pesas' },
        { id: 'pantorrillas_prensa', name: 'Pantorrillas en prensa', type: 'pesas' },
        { id: 'elevacion_piernas', name: 'Elevación de piernas', type: 'pesas' }
      ],
      [
        { id: 'press_inclinado_maquina', name: 'Press inclinado en máquina', type: 'pesas' },
        { id: 'contractor_pecho', name: 'Contractor de pecho', type: 'pesas' },
        { id: 'remo_polea_baja', name: 'Remo en polea baja', type: 'pesas' },
        { id: 'face_pull', name: 'Face pull', type: 'pesas' },
        { id: 'curl_maquina', name: 'Curl en máquina', type: 'pesas' },
        { id: 'crunch_maquina', name: 'Crunch en máquina', type: 'pesas' }
      ],
      [
        { id: 'hip_thrust_maquina', name: 'Hip thrust en máquina', type: 'pesas' },
        { id: 'zancadas', name: 'Zancadas', type: 'pesas' },
        { id: 'peso_muerto_sumo', name: 'Peso muerto sumo', type: 'pesas' },
        { id: 'aductores_maquina', name: 'Aductores en máquina', type: 'pesas' },
        { id: 'curl_femoral', name: 'Curl femoral', type: 'pesas' },
        { id: 'abductores_maquina', name: 'Abductores en máquina', type: 'pesas' }
      ],
      [
        { id: 'stairmaster', name: 'Stairmaster', type: 'cardio' },
        { id: 'eliptica', name: 'Elíptica', type: 'cardio' },
        { id: 'crunch', name: 'Crunch', type: 'pesas' },
        { id: 'russian_twist', name: 'Russian twist', type: 'pesas' },
        { id: 'elevacion_piernas', name: 'Elevación de piernas', type: 'pesas' },
        { id: 'plancha', name: 'Plancha', type: 'pesas' }
      ]
    ],
    labels: ['Glúteos Libre', 'Upper Libre', 'Piernas Libre', 'Upper Máquinas', 'Glúteos Máquinas', 'Cardio & Core']
  }
};
