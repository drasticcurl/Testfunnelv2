// lib/pwa/morning-ritual.ts — Ritual de mañana 5 minutos (Método del Agua de Arroz)

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
    duration: '2 min',
    title: 'Agua de Arroz en ayunas',
    description: 'Tomá 1 vaso (200ml) de agua de arroz tibia a temperatura ambiente, despacio, antes de cualquier otra cosa. Preparación la noche anterior: lavá ½ taza de arroz blanco, cubrí con 2 tazas de agua y dejá remojar 8 horas. Por la mañana, colá y tomá el agua. Podés agregar unas gotas de limón.',
    benefit: 'El agua de arroz contiene almidón resistente y amilosa en suspensión que actúan como prebióticos: alimentan las bacterias beneficiosas (Lactobacillus, Bifidobacterium) y aumentan la producción de butirato, un ácido graso de cadena corta que reduce la inflamación intestinal y mejora la permeabilidad de la mucosa. Fuente: Biomolecules 2024, MDPI/NIH.',
    emoji: '🌾',
  },
  {
    order: 2,
    duration: '1 min',
    title: 'Respiración diafragmática',
    description: '5 respiraciones profundas: inhalá 4 segundos por nariz (inflá la panza), retené 4 segundos, exhalá 6 segundos por boca. Lento y controlado.',
    benefit: 'Activa el nervio vago → modo "descanso y digestión" (parasimpático). Tu intestino se relaja y se prepara para absorber los nutrientes del agua de arroz correctamente.',
    emoji: '🫁',
  },
  {
    order: 3,
    duration: '1 min',
    title: 'Auto-masaje abdominal',
    description: 'Con las manos tibias, hacé círculos suaves en sentido horario sobre tu abdomen. 10 círculos completos. Empezá suave, sin presión fuerte.',
    benefit: 'Estimula el peristaltismo (movimiento intestinal), moviliza gases atrapados y ayuda al almidón resistente del agua de arroz a llegar al intestino grueso donde genera más beneficios.',
    emoji: '🤲',
  },
  {
    order: 4,
    duration: '1 min',
    title: 'Estiramiento del psoas',
    description: 'De pie, dá un paso largo hacia adelante (estocada) y bajá la cadera suavemente. Mantené 30 segundos de cada lado. Respirá profundo.',
    benefit: 'El psoas está conectado al intestino. Si está contracturado (por estar sentada todo el día), comprime el colon. Estirarlo libera presión abdominal y potencia el efecto desinflamatorio del protocolo.',
    emoji: '🧘',
  },
  {
    order: 5,
    duration: '1 min',
    title: 'Intención del día',
    description: 'Mientras terminás el agua de arroz, pensá en 1 acción concreta que vas a hacer hoy por tu intestino: "hoy evito el pan blanco", "hoy camino 10 min después de almorzar", "hoy ceno 3 horas antes de dormir".',
    benefit: 'El compromiso consciente activa el circuito de recompensa del cerebro. Un mini-contrato con vos misma que te mantiene enfocada todo el día.',
    emoji: '✨',
  },
];

export const RITUAL_INTRO = `Este ritual de 5 minutos es el núcleo del Método del Agua de Arroz. Lo hacés todos los días, ni bien te levantás, antes del desayuno.

El agua de arroz es el primer paso — y el más importante. Los 4 pasos siguientes amplifican su efecto: la respiración activa el nervio vago, el masaje moviliza lo que el agua de arroz acaba de nutrir, y el estiramiento libera la compresión abdominal.`;

export const RITUAL_SCIENCE = `¿Por qué funciona el Agua de Arroz?

El agua de arroz en remojo (sin cocinar) libera almidón resistente tipo RS2 y amilosa en el agua. Estos compuestos llegan intactos al intestino grueso, donde las bacterias beneficiosas los fermentan y producen ácidos grasos de cadena corta (AGCC), especialmente butirato.

El butirato tiene 3 efectos medibles:
1. Reduce la inflamación intestinal de bajo grado (inhibe NF-κB, la principal vía proinflamatoria)
2. Fortalece la barrera intestinal (tight junctions), reduciendo la "permeabilidad intestinal" que causa hinchazón
3. Mejora la motilidad intestinal, reduciendo la retención de gases y líquidos

Además, el agua de arroz fermentada contiene postbióticos (metabolitos bacterianos) que promueven la salud del colonocito.

Fuentes científicas: Biomolecules 2024 (MDPI/NIH), Food Chemistry X 2024 (NIH), Harvard Health 2024, MDPI Fermentation 2023.`;


export const RITUAL_WEIGHT_LOSS = `Adelgazá sin dieta restrictiva

Sí, podés bajar de peso SIN dietas de moda, SIN pasar hambre y SIN contar calorías. ¿Cómo? Porque este método no se trata de comer menos, sino de comer distinto: cambiás los alimentos que te inflaman por otros que desinflaman. Tu cuerpo deja de retener y empieza a soltar.

El agua de arroz es la chispa que enciende todo cada mañana. Así trabaja a tu favor:

1. Menos hambre, sin esfuerzo. Tomada en ayunas, tibia y despacio, te hidrata y "ocupa" el estómago al arrancar el día. Llegás al desayuno tranquila, sin esa ansiedad que te hace picar todo.

2. Tu microbiota hace el trabajo por vos. El almidón resistente y los prebióticos alimentan tus bacterias buenas. Un estudio de 2024 en Nature Metabolism mostró que el almidón resistente facilita la pérdida de peso al reconfigurar la microbiota intestinal.

3. Adiós montaña rusa de azúcar y antojos. El almidón resistente baja el pico de insulina después de comer y activa tus hormonas de saciedad (GLP-1, PYY). Menos antojos, menos atracones.

4. Desinflamás y "te cierra el jean" rápido. En los primeros días soltás la inflamación y los líquidos retenidos: por eso notás la panza más plana enseguida. Después, la grasa baja de forma sostenida con el plan.

Nada de morirte de hambre: el agua de arroz en ayunas + reemplazar los alimentos inflamatorios + el plan de comidas hacen el trabajo juntos. Comés rico, comés suficiente, y bajás. Eso es adelgazar sin dieta restrictiva.

Fuentes: Nature Metabolism 2024, revisión de almidón resistente y balance energético (NIH/PMC), Harvard Health 2024.`;

