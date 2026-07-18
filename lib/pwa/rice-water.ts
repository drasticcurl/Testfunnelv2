// lib/pwa/rice-water.ts — Guía del Método: Agua de Arroz Prebiótica
//
// Fuente única de verdad de la receta del Agua de Arroz, el elemento central
// del método. Cualquier mención al "agua de arroz" en la PWA debería enlazar a
// /pwa/guias/agua-de-arroz, que renderiza este contenido.
//
// IMPORTANTE (seguridad): a diferencia de la versión vieja de "remojo de arroz
// crudo", esta receta usa arroz COCIDO. El arroz cocido NUNCA debe quedar a
// temperatura ambiente: debe refrigerarse para activar el almidón resistente y,
// sobre todo, para evitar la proliferación de Bacillus cereus (el "síndrome del
// arroz recalentado"). Por eso el paso de la heladera no es opcional.

/** Ruta canónica de la sección dedicada del Agua de Arroz. */
export const RICE_WATER_PATH = '/pwa/guias/agua-de-arroz';

export type RiceWaterStep = {
  order: number;
  emoji: string;
  title: string;
  description: string;
};

/** Cuándo y cómo tomarla. */
export const RICE_WATER_TIMING = {
  emoji: '🕒',
  title: 'Momento de consumo',
  text: 'Apenas te levantás, antes de cualquier otra cosa, tomá 1 vaso (200 ml) de agua de arroz tibia, despacio. Esto rehidrata tu sistema digestivo de forma noble tras el ayuno nocturno.',
};

/** Resumen corto para usar en tarjetas, rituales y meals del plan. */
export const RICE_WATER_SHORT =
  'Tomá 1 vaso (200 ml) de agua de arroz tibia en ayunas, despacio, antes de cualquier otra cosa. Se prepara con arroz cocido, enfriado 12-24 h en la heladera (así se activa el almidón resistente) y reposado en agua dentro de la heladera durante la noche. A la mañana colás el líquido, lo entibiás (sin hervir), le agregás unas gotas de limón y lo tomás. El arroz cocido nunca queda a temperatura ambiente.';

/**
 * Preparación correcta y segura, paso a paso.
 * Activa el almidón resistente mediante cocción → enfriamiento → reposo.
 */
export const RICE_WATER_STEPS: RiceWaterStep[] = [
  {
    order: 1,
    emoji: '🍚',
    title: 'La cocción',
    description:
      'Cociná ½ taza de arroz blanco convencional en 2 tazas de agua purificada, de forma tradicional (sin agregar sal, aceites, especias ni condimentos). Dejalo enfriar pronto y, en cuanto deje de largar vapor (máximo 1-2 horas), pasalo a la heladera. No lo dejes enfriando toda la tarde sobre la mesada.',
  },
  {
    order: 2,
    emoji: '❄️',
    title: 'La activación (almidón resistente)',
    description:
      'Guardá el arroz cocido en un recipiente cerrado dentro del refrigerador durante 12 a 24 horas. El frío altera la estructura molecular del almidón, convirtiéndolo en un potente prebiótico que tu intestino no absorbe como azúcar simple.',
  },
  {
    order: 3,
    emoji: '🌙',
    title: 'El reposo nocturno',
    description:
      'Por la noche, tomá 2 cucharadas soperas de ese arroz cocido y frío, colocalas en un vaso limpio y cubrí con 200 ml de agua purificada. Tapalo y dejalo reposar SIEMPRE en la heladera durante la noche (nunca a temperatura ambiente).',
  },
  {
    order: 4,
    emoji: '🫗',
    title: 'El filtrado',
    description:
      'A la mañana siguiente, colá el líquido blanquecino hacia una taza limpia. El arroz restante se descarta (o se puede consumir en las comidas).',
  },
  {
    order: 5,
    emoji: '🍋',
    title: 'El toque final',
    description:
      'Entibiá el líquido levemente (evitá que hierva, para cuidar sus propiedades). Agregá unas gotas de jugo de limón fresco y tomalo.',
  },
];

/** Advertencia de seguridad. El paso de la heladera es obligatorio. */
export const RICE_WATER_SAFETY = {
  emoji: '⚠️',
  title: 'Seguridad: la heladera no es opcional',
  text: 'El arroz cocido nunca debe quedar a temperatura ambiente, ni mientras se enfría ni durante el reposo nocturno. El arroz que queda tibio o a temperatura ambiente por varias horas puede desarrollar Bacillus cereus (el llamado "síndrome del arroz recalentado"), una bacteria que produce una toxina que el recalentado NO elimina. Regla práctica: enfriá el arroz rápido y metelo a la heladera dentro de las 2 horas de cocido; conservalo tapado y descartalo después de 24 horas. Usá siempre agua purificada y utensilios limpios. Si el agua de arroz huele raro o lleva más de un día, no la tomes.',
};

/** Por qué funciona — ciencia resumida para la sección dedicada. */
export const RICE_WATER_SCIENCE =
  'Al cocinar, enfriar y reposar el arroz, parte de su almidón se convierte en almidón resistente: en lugar de digerirse como azúcar, llega intacto al intestino grueso. Ahí tus bacterias beneficiosas (Lactobacillus, Bifidobacterium) lo fermentan y producen butirato, un ácido graso de cadena corta que reduce la inflamación intestinal, fortalece la barrera de la mucosa y mejora la motilidad. Por eso el agua de arroz prebiótica desinflama y ayuda a controlar el hambre, sin elevar el azúcar en sangre.';
