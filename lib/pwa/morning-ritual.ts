// lib/pwa/morning-ritual.ts — Ritual de mañana 5 minutos

export type RitualStep = {
  order: number;
  duration: string;
  title: string;
  description: string;
  benefit: string;
  emoji: string;
};

export const MORNING_RITUAL: RitualStep[] = [
  {
    order: 1,
    duration: '1 min',
    title: 'Agua tibia con limón',
    description: 'Al levantarte, antes de cualquier otra cosa: 1 vaso de agua tibia (no hirviendo) + jugo de ½ limón. Tomalo despacio, en 4-5 tragos.',
    benefit: 'Estimula la producción de bilis, activa el sistema digestivo que estuvo en reposo durante la noche y rehidrata tu cuerpo después de 7-8 horas sin agua.',
    emoji: '🍋',
  },
  {
    order: 2,
    duration: '1 min',
    title: 'Respiración diafragmática',
    description: '5 respiraciones profundas: inhalá 4 segundos por nariz (inflá la panza), retené 4 segundos, exhalá 6 segundos por boca. Lento y controlado.',
    benefit: 'Activa el nervio vago → modo "descanso y digestión" (parasimpático). Tu intestino literalmente se relaja y se prepara para digerir bien todo el día.',
    emoji: '🫁',
  },
  {
    order: 3,
    duration: '1 min',
    title: 'Auto-masaje abdominal',
    description: 'Con las manos tibias, hacé círculos suaves en sentido horario sobre tu abdomen. 10 círculos completos. Empezá suave, sin presión fuerte.',
    benefit: 'Estimula el peristaltismo (movimiento intestinal), reduce la retención de gases y mejora la circulación local en la zona abdominal.',
    emoji: '🤲',
  },
  {
    order: 4,
    duration: '1 min',
    title: 'Estiramiento del psoas',
    description: 'De pie, dá un paso largo hacia adelante (como estocada/lunge) y bajá la cadera suavemente. Mantené 30 segundos de cada lado. Respirá profundo.',
    benefit: 'El psoas está conectado al intestino. Si está contracturado (por estar sentada todo el día), comprime el colon. Estirarlo libera presión abdominal.',
    emoji: '🧘',
  },
  {
    order: 5,
    duration: '1 min',
    title: 'Intención del día',
    description: 'Mientras tomás el último trago del agua con limón, pensá en 1 cosa que vas a hacer hoy por tu intestino: "hoy mastico 20 veces", "hoy camino 10 min después de almorzar", "hoy ceno 3 horas antes de dormir".',
    benefit: 'El compromiso consciente activa el circuito de recompensa del cerebro. Es como un mini-contrato con vos misma que te mantiene enfocada.',
    emoji: '✨',
  },
];

export const RITUAL_INTRO = `Este ritual de 5 minutos activa tu sistema digestivo antes del desayuno. Lo hacés todos los días, ni bien te levantás. No necesitás nada especial — solo un limón, tus manos y 5 minutos de silencio.

Es cortito a propósito: si fuera más largo, no lo harías. Y 5 minutos consistentes le ganan a 30 minutos que hacés una vez por semana.`;

export const RITUAL_SCIENCE = `¿Por qué funciona? Tu intestino tiene su propio sistema nervioso (el "segundo cerebro") y está conectado al cerebro por el nervio vago. Cuando activás el nervio vago con la respiración, tu intestino pasa de modo "alerta" a modo "digestión".

El auto-masaje sigue el recorrido natural del colon (sentido horario) y mueve los gases atrapados. El estiramiento del psoas libera la compresión sobre el intestino grueso. Y la intención consciente le dice a tu cerebro que hoy la digestión es prioridad.

Total: 5 minutos. Se hace ANTES del desayuno, todos los días.`;
