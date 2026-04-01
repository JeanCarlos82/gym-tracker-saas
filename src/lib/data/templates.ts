import type { TemplateCollection } from '$lib/types';

// ── TEMPLATES MASCULINOS ──
// Enfoque: compuestos pesados como base, progresión de fuerza,
// equilibrio push/pull, piernas 2x/semana mínimo
export const TEMPLATES_M: TemplateCollection = {
  // 3 días: Full body — compuestos + máquinas de aislamiento
  fullbody_3: {
    exercises: [
      [
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Press banca', type: 'pesas' },
        { name: 'Remo con barra', type: 'pesas' },
        { name: 'Press militar', type: 'pesas' },
        { name: 'Curl con barra', type: 'pesas' },
        { name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Press inclinado', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Elevaciones laterales', type: 'pesas' },
        { name: 'Curl martillo', type: 'pesas' },
        { name: 'Press francés', type: 'pesas' }
      ],
      [
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Press con mancuernas', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Press Arnold', type: 'pesas' },
        { name: 'Face pull', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ]
    ],
    labels: ['Full Body A', 'Full Body B', 'Full Body C']
  },

  fullbody_cardio_3: {
    exercises: [
      [
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Press banca', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Press militar', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ],
      [
        { name: 'Correr', type: 'cardio' },
        { name: 'Elíptica', type: 'cardio' }
      ],
      [
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Press inclinado', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Elevaciones laterales', type: 'pesas' },
        { name: 'Crunch', type: 'pesas' }
      ]
    ],
    labels: ['Full Body', 'Cardio', 'Full Body']
  },

  // 4 días: Upper/Lower — máquinas para aislamiento, peso libre para compuestos
  upperlower_4: {
    exercises: [
      [
        { name: 'Press banca', type: 'pesas' },
        { name: 'Remo con barra', type: 'pesas' },
        { name: 'Press militar', type: 'pesas' },
        { name: 'Curl con barra', type: 'pesas' },
        { name: 'Tríceps en polea', type: 'pesas' },
        { name: 'Elevaciones laterales', type: 'pesas' }
      ],
      [
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Curl femoral sentado', type: 'pesas' },
        { name: 'Pantorrillas en prensa', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ],
      [
        { name: 'Press inclinado', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Press Arnold', type: 'pesas' },
        { name: 'Curl martillo', type: 'pesas' },
        { name: 'Tríceps en máquina', type: 'pesas' },
        { name: 'Face pull', type: 'pesas' }
      ],
      [
        { name: 'Sentadilla búlgara', type: 'pesas' },
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Extensiones cuádriceps', type: 'pesas' },
        { name: 'Curl femoral', type: 'pesas' },
        { name: 'Pantorrillas', type: 'pesas' },
        { name: 'Elevación de piernas', type: 'pesas' }
      ]
    ],
    labels: ['Upper A', 'Lower A', 'Upper B', 'Lower B']
  },

  // 5 días: PPL + Upper/Lower — mix peso libre y máquinas
  pplul_5: {
    exercises: [
      [
        { name: 'Press banca', type: 'pesas' },
        { name: 'Press inclinado', type: 'pesas' },
        { name: 'Contractor de pecho', type: 'pesas' },
        { name: 'Press militar', type: 'pesas' },
        { name: 'Elevaciones laterales', type: 'pesas' },
        { name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Remo con barra', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Face pull', type: 'pesas' },
        { name: 'Curl con barra', type: 'pesas' },
        { name: 'Curl martillo', type: 'pesas' }
      ],
      [
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Curl femoral sentado', type: 'pesas' },
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Pantorrillas en prensa', type: 'pesas' }
      ],
      [
        { name: 'Press inclinado', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Press de hombro en máquina', type: 'pesas' },
        { name: 'Curl en máquina', type: 'pesas' },
        { name: 'Tríceps en máquina', type: 'pesas' },
        { name: 'Elevaciones laterales en máquina', type: 'pesas' }
      ],
      [
        { name: 'Sentadilla búlgara', type: 'pesas' },
        { name: 'Extensiones cuádriceps', type: 'pesas' },
        { name: 'Curl femoral', type: 'pesas' },
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Pantorrillas', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ]
    ],
    labels: ['Push', 'Pull', 'Legs', 'Upper', 'Lower']
  },

  // 6 días: PPL x2 — día 1 peso libre, día 2 más máquinas (variedad de estímulo)
  ppl_6: {
    exercises: [
      [
        { name: 'Press banca', type: 'pesas' },
        { name: 'Press inclinado', type: 'pesas' },
        { name: 'Aperturas mancuernas', type: 'pesas' },
        { name: 'Press militar', type: 'pesas' },
        { name: 'Elevaciones laterales', type: 'pesas' },
        { name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { name: 'Dominadas', type: 'pesas' },
        { name: 'Remo con barra', type: 'pesas' },
        { name: 'Remo con mancuerna', type: 'pesas' },
        { name: 'Face pull', type: 'pesas' },
        { name: 'Curl con barra', type: 'pesas' },
        { name: 'Curl martillo', type: 'pesas' }
      ],
      [
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Curl femoral sentado', type: 'pesas' },
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Pantorrillas', type: 'pesas' }
      ],
      [
        { name: 'Press inclinado en máquina', type: 'pesas' },
        { name: 'Contractor de pecho', type: 'pesas' },
        { name: 'Press de hombro en máquina', type: 'pesas' },
        { name: 'Elevaciones laterales en máquina', type: 'pesas' },
        { name: 'Tríceps en máquina', type: 'pesas' },
        { name: 'Press francés', type: 'pesas' }
      ],
      [
        { name: 'Pulldown en máquina', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Remo T-bar', type: 'pesas' },
        { name: 'Curl en máquina', type: 'pesas' },
        { name: 'Curl predicador', type: 'pesas' },
        { name: 'Face pull', type: 'pesas' }
      ],
      [
        { name: 'Hack squat', type: 'pesas' },
        { name: 'Zancadas', type: 'pesas' },
        { name: 'Extensiones cuádriceps', type: 'pesas' },
        { name: 'Curl femoral', type: 'pesas' },
        { name: 'Pantorrillas en prensa', type: 'pesas' },
        { name: 'Crunch en máquina', type: 'pesas' }
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
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Press con mancuernas', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Abductores en máquina', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ],
      [
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Zancadas', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Press de hombro en máquina', type: 'pesas' },
        { name: 'Patada de glúteo en máquina', type: 'pesas' },
        { name: 'Elevación de piernas', type: 'pesas' }
      ],
      [
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Puente de glúteo', type: 'pesas' },
        { name: 'Press con mancuernas', type: 'pesas' },
        { name: 'Remo en polea baja', type: 'pesas' },
        { name: 'Curl femoral sentado', type: 'pesas' },
        { name: 'Crunch', type: 'pesas' }
      ]
    ],
    labels: ['Full Body A', 'Full Body B', 'Full Body C']
  },

  fullbody_cardio_3: {
    exercises: [
      [
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Press con mancuernas', type: 'pesas' },
        { name: 'Abductores en máquina', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ],
      [
        { name: 'Stairmaster', type: 'cardio' },
        { name: 'Elíptica', type: 'cardio' }
      ],
      [
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Press de hombro en máquina', type: 'pesas' },
        { name: 'Patada de glúteo en máquina', type: 'pesas' },
        { name: 'Elevación de piernas', type: 'pesas' }
      ]
    ],
    labels: ['Full Body', 'Cardio', 'Full Body']
  },

  // 4 días: 2 lower + 2 upper — máquinas integradas
  upperlower_4: {
    exercises: [
      [
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Curl femoral sentado', type: 'pesas' },
        { name: 'Abductores en máquina', type: 'pesas' },
        { name: 'Patada de glúteo en máquina', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ],
      [
        { name: 'Press con mancuernas', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Press de hombro en máquina', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Elevaciones laterales', type: 'pesas' },
        { name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Extensiones cuádriceps', type: 'pesas' },
        { name: 'Puente de glúteo', type: 'pesas' },
        { name: 'Pantorrillas en prensa', type: 'pesas' },
        { name: 'Elevación de piernas', type: 'pesas' }
      ],
      [
        { name: 'Press inclinado', type: 'pesas' },
        { name: 'Remo en polea baja', type: 'pesas' },
        { name: 'Face pull', type: 'pesas' },
        { name: 'Curl con mancuernas', type: 'pesas' },
        { name: 'Elevaciones laterales en máquina', type: 'pesas' },
        { name: 'Crunch', type: 'pesas' }
      ]
    ],
    labels: ['Glúteos & Piernas A', 'Upper A', 'Glúteos & Piernas B', 'Upper B']
  },

  // 5 días: 3 lower + 2 upper — glúteos 3x/semana con variedad máquina/libre
  pplul_5: {
    exercises: [
      [
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Curl femoral sentado', type: 'pesas' },
        { name: 'Abductores en máquina', type: 'pesas' },
        { name: 'Patada de glúteo en máquina', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ],
      [
        { name: 'Press con mancuernas', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Press de hombro en máquina', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Elevaciones laterales', type: 'pesas' },
        { name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Extensiones cuádriceps', type: 'pesas' },
        { name: 'Puente de glúteo', type: 'pesas' },
        { name: 'Pantorrillas en prensa', type: 'pesas' },
        { name: 'Elevación de piernas', type: 'pesas' }
      ],
      [
        { name: 'Press inclinado', type: 'pesas' },
        { name: 'Remo en polea baja', type: 'pesas' },
        { name: 'Face pull', type: 'pesas' },
        { name: 'Curl con mancuernas', type: 'pesas' },
        { name: 'Elevaciones laterales en máquina', type: 'pesas' },
        { name: 'Crunch', type: 'pesas' }
      ],
      [
        { name: 'Hip thrust en máquina', type: 'pesas' },
        { name: 'Zancadas', type: 'pesas' },
        { name: 'Peso muerto sumo', type: 'pesas' },
        { name: 'Curl femoral', type: 'pesas' },
        { name: 'Abductores en máquina', type: 'pesas' },
        { name: 'Stairmaster', type: 'cardio' }
      ]
    ],
    labels: ['Glúteos Heavy', 'Upper Push', 'Piernas & Core', 'Upper Pull', 'Glúteos & Cardio']
  },

  // 6 días: 3 lower + 2 upper + 1 cardio/core — días alternos libre/máquina
  ppl_6: {
    exercises: [
      [
        { name: 'Hip thrust', type: 'pesas' },
        { name: 'Sentadilla', type: 'pesas' },
        { name: 'Curl femoral sentado', type: 'pesas' },
        { name: 'Abductores en máquina', type: 'pesas' },
        { name: 'Patada de glúteo', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ],
      [
        { name: 'Press con mancuernas', type: 'pesas' },
        { name: 'Jalón al pecho', type: 'pesas' },
        { name: 'Press de hombro en máquina', type: 'pesas' },
        { name: 'Remo en máquina', type: 'pesas' },
        { name: 'Elevaciones laterales', type: 'pesas' },
        { name: 'Tríceps en polea', type: 'pesas' }
      ],
      [
        { name: 'Peso muerto rumano', type: 'pesas' },
        { name: 'Prensa de pierna', type: 'pesas' },
        { name: 'Extensiones cuádriceps', type: 'pesas' },
        { name: 'Puente de glúteo', type: 'pesas' },
        { name: 'Pantorrillas en prensa', type: 'pesas' },
        { name: 'Elevación de piernas', type: 'pesas' }
      ],
      [
        { name: 'Press inclinado en máquina', type: 'pesas' },
        { name: 'Contractor de pecho', type: 'pesas' },
        { name: 'Remo en polea baja', type: 'pesas' },
        { name: 'Face pull', type: 'pesas' },
        { name: 'Curl en máquina', type: 'pesas' },
        { name: 'Crunch en máquina', type: 'pesas' }
      ],
      [
        { name: 'Hip thrust en máquina', type: 'pesas' },
        { name: 'Zancadas', type: 'pesas' },
        { name: 'Peso muerto sumo', type: 'pesas' },
        { name: 'Aductores en máquina', type: 'pesas' },
        { name: 'Curl femoral', type: 'pesas' },
        { name: 'Abductores en máquina', type: 'pesas' }
      ],
      [
        { name: 'Stairmaster', type: 'cardio' },
        { name: 'Elíptica', type: 'cardio' },
        { name: 'Crunch', type: 'pesas' },
        { name: 'Russian twist', type: 'pesas' },
        { name: 'Elevación de piernas', type: 'pesas' },
        { name: 'Plancha', type: 'pesas' }
      ]
    ],
    labels: ['Glúteos Libre', 'Upper Libre', 'Piernas Libre', 'Upper Máquinas', 'Glúteos Máquinas', 'Cardio & Core']
  }
};
