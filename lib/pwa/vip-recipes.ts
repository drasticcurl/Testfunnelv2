// lib/pwa/vip-recipes.ts — Recetario premium VIP.
//
// EXTRA del recetario base (lib/pwa/recipes-data.ts): suma postres ricos que
// no inflan y recetas premium que no están en el Front ni en el Programa de 30
// Días. Estructura simple y autocontenida, renderizada como sección extra en
// /pwa/recetas (componente VipRecipeSection), visible solo si el VIP está
// desbloqueado.

export type VipRecipeCategory = 'postre' | 'premium';

export type VipRecipe = {
  id: string;
  name: string;
  emoji: string;
  category: VipRecipeCategory;
  time: string;
  ingredients: string[];
  steps: string[];
  tip: string;
};

export const VIP_RECIPES: VipRecipe[] = [
  // ─────────────────── POSTRES QUE NO INFLAN ───────────────────
  {
    id: 'mousse-cacao-palta',
    name: 'Mousse de cacao y palta',
    emoji: '🍫',
    category: 'postre',
    time: '10 min',
    ingredients: [
      '1 palta madura',
      '2 cdas de cacao amargo en polvo',
      '2 cdas de miel cruda o dátiles procesados',
      '1 chorrito de leche vegetal',
      'Una pizca de sal',
    ],
    steps: [
      'Procesá la palta hasta que quede bien cremosa.',
      'Agregá el cacao, el endulzante, la sal y un poco de leche vegetal.',
      'Procesá de nuevo hasta lograr textura de mousse.',
      'Llevá a la heladera 30 minutos y serví frío.',
    ],
    tip: 'La palta aporta grasas buenas y cremosidad sin lácteos. El cacao amargo es antiinflamatorio y rico en magnesio.',
  },
  {
    id: 'helado-banana-1ingrediente',
    name: 'Helado de banana (1 ingrediente)',
    emoji: '🍌',
    category: 'postre',
    time: '5 min + freezer',
    ingredients: [
      '2 bananas maduras congeladas en rodajas',
      'Opcional: canela, cacao o un poco de mantequilla de maní',
    ],
    steps: [
      'Congelá las rodajas de banana al menos 3 horas.',
      'Procesá hasta que se forme una crema tipo helado.',
      'Agregá canela o cacao si querés y serví al momento.',
    ],
    tip: 'Cero azúcar agregada y textura de helado real. La banana congelada engaña al antojo de dulce de la noche.',
  },
  {
    id: 'galletas-avena-banana',
    name: 'Galletitas de avena y banana',
    emoji: '🍪',
    category: 'postre',
    time: '20 min',
    ingredients: [
      '1 banana madura pisada',
      '1 taza de avena',
      '1 puñado de nueces picadas',
      'Canela a gusto',
      'Opcional: chips de chocolate 70%',
    ],
    steps: [
      'Pisá la banana y mezclá con la avena, las nueces y la canela.',
      'Formá montañitas en una placa con papel manteca.',
      'Horneá 12-15 min a 180°C hasta que estén doradas.',
    ],
    tip: 'Sin azúcar ni harina refinada. La avena aporta fibra que alimenta tu microbiota buena.',
  },
  {
    id: 'chia-pudding-frutos-rojos',
    name: 'Pudding de chía y frutos rojos',
    emoji: '🫐',
    category: 'postre',
    time: '5 min + reposo',
    ingredients: [
      '3 cdas de semillas de chía',
      '1 taza de leche vegetal',
      '½ cdita de esencia de vainilla',
      'Frutos rojos para decorar',
      'Opcional: 1 cdita de miel',
    ],
    steps: [
      'Mezclá la chía con la leche vegetal y la vainilla.',
      'Revolvé bien y dejá reposar en la heladera al menos 2 horas (o toda la noche).',
      'Servila con frutos rojos por encima.',
    ],
    tip: 'La chía es fibra soluble pura: regula el tránsito y da saciedad larga. Ideal como postre o desayuno.',
  },
  {
    id: 'manzana-horno-canela',
    name: 'Manzana al horno con canela',
    emoji: '🍎',
    category: 'postre',
    time: '30 min',
    ingredients: [
      '2 manzanas',
      'Canela en polvo',
      '1 puñado de nueces',
      'Opcional: un hilo de miel',
    ],
    steps: [
      'Descorazoná las manzanas y ponelas en una fuente.',
      'Rellená el centro con nueces y espolvoreá canela.',
      'Horneá 25-30 min a 180°C hasta que estén tiernas.',
    ],
    tip: 'La manzana cocida es más fácil de digerir que cruda y la canela ayuda a regular el azúcar en sangre.',
  },

  // ─────────────────── RECETAS PREMIUM ───────────────────
  {
    id: 'salmon-miso-verduras',
    name: 'Salmón al miso con verduras al vapor',
    emoji: '🐟',
    category: 'premium',
    time: '25 min',
    ingredients: [
      '1 filete de salmón',
      '1 cda de pasta de miso',
      '1 cdita de jengibre rallado',
      'Brócoli y zanahoria',
      'Semillas de sésamo',
    ],
    steps: [
      'Mezclá el miso con el jengibre y un poco de agua, y pincelá el salmón.',
      'Horneá el salmón 12-15 min a 200°C.',
      'Cociná el brócoli y la zanahoria al vapor.',
      'Serví con sésamo por encima.',
    ],
    tip: 'El miso es un fermentado que suma probióticos. El salmón aporta omega-3, el antiinflamatorio más potente.',
  },
  {
    id: 'curry-suave-lentejas',
    name: 'Curry suave de lentejas y calabaza',
    emoji: '🍲',
    category: 'premium',
    time: '35 min',
    ingredients: [
      '1 taza de lentejas cocidas',
      '2 tazas de calabaza en cubos',
      '1 taza de leche de coco',
      '1 cdita de curry suave + cúrcuma',
      'Jengibre y cebolla',
    ],
    steps: [
      'Rehogá la cebolla y el jengibre.',
      'Sumá la calabaza, las especias y la leche de coco.',
      'Cociná 20 min hasta que la calabaza esté tierna.',
      'Agregá las lentejas y cociná 5 min más.',
    ],
    tip: 'Introducí las legumbres de a poco para evitar gases. La cúrcuma y el jengibre lo hacen muy antiinflamatorio.',
  },
  {
    id: 'bowl-buddha-tahini',
    name: 'Buddha bowl con aderezo de tahini',
    emoji: '🥗',
    category: 'premium',
    time: '20 min',
    ingredients: [
      '½ taza de quinoa cocida',
      'Garbanzos al horno',
      'Hojas verdes, zanahoria rallada, palta',
      '1 cda de tahini + limón + agua (aderezo)',
    ],
    steps: [
      'Armá el bowl con la quinoa de base y los demás ingredientes alrededor.',
      'Mezclá el tahini con limón y un poco de agua hasta que quede cremoso.',
      'Aliñá y serví.',
    ],
    tip: 'Plato completo y antiinflamatorio. El tahini aporta calcio y grasas buenas sin lácteos.',
  },
  {
    id: 'sopa-crema-zanahoria-jengibre',
    name: 'Crema de zanahoria y jengibre',
    emoji: '🥕',
    category: 'premium',
    time: '30 min',
    ingredients: [
      '4 zanahorias',
      '1 trozo de jengibre fresco',
      '1 cebolla',
      'Caldo de verduras',
      'Un chorrito de leche de coco',
    ],
    steps: [
      'Rehogá la cebolla y el jengibre.',
      'Sumá la zanahoria y el caldo, y cociná 20 min.',
      'Procesá hasta lograr una crema y terminá con leche de coco.',
    ],
    tip: 'Reconfortante y fácil de digerir. Ideal como cena liviana anti-rebote en días fríos.',
  },
  {
    id: 'wok-pollo-vegetales',
    name: 'Wok de pollo y vegetales con jengibre',
    emoji: '🍗',
    category: 'premium',
    time: '20 min',
    ingredients: [
      '1 pechuga de pollo en tiras',
      'Morrón, zucchini y cebolla de verdeo',
      '1 cdita de jengibre rallado',
      '1 cda de salsa de soja baja en sodio',
      'Sésamo',
    ],
    steps: [
      'Saltéa el pollo a fuego fuerte hasta dorar.',
      'Sumá las verduras y el jengibre, y cociná 5 min (que queden crocantes).',
      'Terminá con la salsa de soja y sésamo.',
    ],
    tip: 'Rápido y liviano. Cocinar las verduras al dente conserva nutrientes; el jengibre activa la digestión.',
  },
];

/** Devuelve las recetas premium de una categoría. */
export function getVipRecipesByCategory(category: VipRecipeCategory): VipRecipe[] {
  return VIP_RECIPES.filter((r) => r.category === category);
}
