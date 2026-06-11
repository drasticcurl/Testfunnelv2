// lib/pwa/bump-content.ts
// Contenido del Kit Anti-Excusas (Order Bump $7)
// Menú de Emergencia SOS + Guía de Meal Prep Dominical + Tabla de Swaps

export interface EmergencyMeal {
  id: string;
  name: string;
  emoji: string;
  ingredients: [string, string, string]; // Exactamente 3
  instruction: string; // 1 sola línea
  time: string; // ≤ 5 min
}

export interface MealPrepStep {
  id: string;
  timeRange: string; // "0-15 min", "15-30 min", etc.
  action: string;
  detail: string;
}

export interface SwapEntry {
  id: string;
  original: string;
  substitute: string;
  reason: string;
}

// ═══════════════════════════════════════════════════════════
// MENÚ DE EMERGENCIA SOS — 7 comidas, 3 ingredientes, ≤ 5 min
// ═══════════════════════════════════════════════════════════

export const emergencyMeals: EmergencyMeal[] = [
  {
    id: 'sos-01',
    name: 'Tostada de Palta',
    emoji: '🥑',
    ingredients: ['Pan de arroz', 'Palta', 'Limón y sal'],
    instruction: 'Tostá el pan, pisá la palta con limón y sal, untá y listo.',
    time: '3 min',
  },
  {
    id: 'sos-02',
    name: 'Bowl Cero Esfuerzo',
    emoji: '🥣',
    ingredients: ['Yogur natural', 'Banana', 'Chía'],
    instruction: 'Volcá el yogur, cortá la banana encima, espolvoreá chía.',
    time: '2 min',
  },
  {
    id: 'sos-03',
    name: 'Huevos Express',
    emoji: '🍳',
    ingredients: ['2 huevos', 'Espinaca', 'Aceite de oliva'],
    instruction: 'Calentá aceite, tirá la espinaca 30 seg, volcá los huevos y revolvé.',
    time: '3 min',
  },
  {
    id: 'sos-04',
    name: 'Bowl de Atún',
    emoji: '🐟',
    ingredients: ['Atún en lata', 'Palta', 'Tomate cherry'],
    instruction: 'Abrí el atún, cortá palta y tomates, mezclá todo en un bowl.',
    time: '3 min',
  },
  {
    id: 'sos-05',
    name: 'Smoothie SOS',
    emoji: '🥤',
    ingredients: ['Banana congelada', 'Espinaca', 'Leche vegetal'],
    instruction: 'Tirá todo en la licuadora, 30 segundos a velocidad alta.',
    time: '2 min',
  },
  {
    id: 'sos-06',
    name: 'Avena Overnight',
    emoji: '🌙',
    ingredients: ['Avena', 'Leche vegetal', 'Frutos rojos'],
    instruction: 'Mezclá avena + leche la noche anterior, a la mañana sumá frutos rojos.',
    time: '0 min (preparás la noche anterior)',
  },
  {
    id: 'sos-07',
    name: 'Wrap de Lechuga',
    emoji: '🥬',
    ingredients: ['Hojas de lechuga', 'Pollo cocido (sobras)', 'Palta'],
    instruction: 'Poné el pollo y palta sobre las hojas de lechuga, enrollá y comé.',
    time: '2 min',
  },
];

// ═══════════════════════════════════════════════════════════
// GUÍA DE MEAL PREP DOMINICAL — 1 hora, paso a paso
// ═══════════════════════════════════════════════════════════

export const mealPrepSteps: MealPrepStep[] = [
  {
    id: 'prep-01',
    timeRange: '0–15 min',
    action: 'Poner quinoa + arroz integral a cocinar',
    detail: 'No requiere atención — hierven solos.',
  },
  {
    id: 'prep-02',
    timeRange: '0–15 min',
    action: 'Cortar TODAS las verduras de la semana',
    detail: 'Zucchini, brócoli, pimientos, zanahoria y cebolla.',
  },
  {
    id: 'prep-03',
    timeRange: '15–30 min',
    action: 'Meter al horno 2 pechugas + bandeja de verduras',
    detail: '200°C, las verduras cortadas van con aceite de oliva y sal.',
  },
  {
    id: 'prep-04',
    timeRange: '15–30 min',
    action: 'Cocinar 1 taza de lentejas en olla',
    detail: 'Hierven solas — solo checkeá que no se seque el agua.',
  },
  {
    id: 'prep-05',
    timeRange: '30–45 min',
    action: 'Preparar 3 aderezos',
    detail: 'Tahini+limón, vinagreta AOVE+mostaza, yogur+hierbas.',
  },
  {
    id: 'prep-06',
    timeRange: '45–60 min',
    action: 'Portionar todo en tuppers',
    detail: '5 almuerzos + 4 cenas. Etiquetar, guardar en heladera.',
  },
];

export const mealPrepResult =
  'Lunes a jueves comida resuelta. Solo calentás y armás el plato.';

// ═══════════════════════════════════════════════════════════
// TABLA DE SWAPS — 20 sustituciones reales
// ═══════════════════════════════════════════════════════════

export const swapTable: SwapEntry[] = [
  {
    id: 'swap-01',
    original: 'Salmón',
    substitute: 'Sardinas en lata',
    reason: 'Mismo omega-3, 1/4 del precio',
  },
  {
    id: 'swap-02',
    original: 'Quinoa',
    substitute: 'Arroz integral',
    reason: 'Perfil similar, más accesible en LATAM',
  },
  {
    id: 'swap-03',
    original: 'Kale',
    substitute: 'Espinaca',
    reason: 'Mismos beneficios, se consigue en cualquier verdulería',
  },
  {
    id: 'swap-04',
    original: 'Tahini',
    substitute: 'Mantequilla de maní natural sin azúcar',
    reason: 'Textura similar, más fácil de encontrar',
  },
  {
    id: 'swap-05',
    original: 'Palta',
    substitute: 'Hummus',
    reason: 'Cuando la palta está cara',
  },
  {
    id: 'swap-06',
    original: 'Kéfir',
    substitute: 'Yogur natural sin azúcar',
    reason: 'Leer etiqueta: "cultivos vivos"',
  },
  {
    id: 'swap-07',
    original: 'Cúrcuma fresca',
    substitute: 'Cúrcuma en polvo',
    reason: '½ cdita = 1 trozo de 2 cm',
  },
  {
    id: 'swap-08',
    original: 'Pan de masa madre',
    substitute: 'Pan de centeno integral',
    reason: 'Fermentación larga similar, baja FODMAPs',
  },
  {
    id: 'swap-09',
    original: 'Leche de almendras',
    substitute: 'Leche de avena casera',
    reason: 'Avena + agua + licuadora = listo',
  },
  {
    id: 'swap-10',
    original: 'Jengibre fresco',
    substitute: 'Jengibre en polvo',
    reason: '½ cdita = 1 rodaja',
  },
  {
    id: 'swap-11',
    original: 'Frutos rojos frescos',
    substitute: 'Frutos rojos congelados',
    reason: 'Mismos nutrientes, duran 3 meses',
  },
  {
    id: 'swap-12',
    original: 'Nueces',
    substitute: 'Semillas de girasol',
    reason: 'Omega-3 vegetal, mucho más baratas',
  },
  {
    id: 'swap-13',
    original: 'Papaya',
    substitute: 'Ananá',
    reason: 'Ambos tienen enzimas digestivas',
  },
  {
    id: 'swap-14',
    original: 'Tofu',
    substitute: 'Huevos',
    reason: 'Proteína equivalente, más fácil de conseguir',
  },
  {
    id: 'swap-15',
    original: 'Aceite de coco',
    substitute: 'Aceite de oliva extra virgen',
    reason: 'Más antiinflamatorio y accesible',
  },
  {
    id: 'swap-16',
    original: 'Chía',
    substitute: 'Lino molido',
    reason: 'Mismo efecto fibra soluble',
  },
  {
    id: 'swap-17',
    original: 'Caldo de huesos',
    substitute: 'Caldo de verduras casero con cúrcuma y jengibre',
    reason: 'Antiinflamatorio sin necesitar huesos',
  },
  {
    id: 'swap-18',
    original: 'Chocolate 70%',
    substitute: 'Cacao puro en polvo + ½ cdita miel',
    reason: 'Mismos polifenoles, sin azúcar agregada',
  },
  {
    id: 'swap-19',
    original: 'Agua de coco',
    substitute: 'Agua con limón + pizca de sal marina',
    reason: 'Hidratación con electrolitos caseros',
  },
  {
    id: 'swap-20',
    original: 'Tamari',
    substitute: 'Salsa de soja reducida en sodio',
    reason: 'Mismo umami, menos sodio',
  },
];
