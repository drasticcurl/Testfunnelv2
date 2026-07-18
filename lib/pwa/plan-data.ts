// lib/pwa/plan-data.ts — Contenido completo de los 30 días del plan

import { RICE_WATER_PATH } from '@/lib/pwa/rice-water';

export type Meal = {
  moment: string;
  emoji: string;
  name: string;
  time: string;
  description: string;
  ingredients?: string[];
  /** Enlace opcional a una guía relacionada (ej. la receta del Agua de Arroz). */
  link?: { href: string; label: string };
};

export type DayPlan = {
  day: number;
  title: string;
  subtitle: string;
  meals: Meal[];
  tip: string;
  requiresUpsell: boolean;
};

// Array base con el contenido de cada día. NO se consume directo: se exporta
// `PLAN_DATA` (más abajo) que le antepone el Agua de Arroz en ayunas a TODOS
// los días — el método central del Protocolo TURBO se hace todas las mañanas.
const PLAN_DAYS_BASE: DayPlan[] = [
  // ═══════════════════════════════════════════════════════════
  // SEMANA 1 — Agua de Arroz + Desinflamación base (Días 1-7)
  // ═══════════════════════════════════════════════════════════
  {
    day: 1,
    title: 'Día 1 — Tu primer Agua de Arroz',
    subtitle: 'Empezamos activando tu microbiota con el método central',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Yogur natural con kiwi y chía',
        time: '5 min',
        description:
          '1 vaso de yogur natural sin azúcar (si no tolerás lácteos, usá kéfir de agua o yogur de coco). Cortá 1 kiwi en cubos y agregalo arriba. Espolvoreá 1 cucharada de chía. Si querés, sumale media cucharadita de miel cruda.',
        ingredients: ['Yogur natural sin azúcar', 'Kiwi', 'Chía', 'Miel cruda (opcional)'],
      },
      {
        moment: 'Snack mañana',
        emoji: '☕',
        name: 'Manzana verde + 6 almendras',
        time: '2 min',
        description:
          'Una manzana verde (más antiinflamatoria que la roja por su pectina) con 6 almendras naturales sin sal. La fibra de la manzana + grasa buena de las almendras te sostiene hasta el almuerzo.',
        ingredients: ['Manzana verde', 'Almendras naturales sin sal'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Bowl de quinoa con salmón y palta',
        time: '20 min',
        description:
          'Cociná ½ taza de quinoa (10 min). Mientras, cociná 1 filete de salmón a la plancha 4 min por lado, con sal y limón. Armá el bowl: quinoa de base, salmón desmenuzado, ½ palta en cubos, hojas de espinaca cruda, tomate cherry. Aliño: aceite de oliva + limón + sal.',
        ingredients: ['Quinoa', 'Salmón', 'Palta', 'Espinaca', 'Tomate cherry', 'Aceite de oliva', 'Limón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🌿',
        name: 'Té verde + 2 cuadraditos de chocolate 70%',
        time: '1 min',
        description:
          'Un té verde sin azúcar (caliente o frío). Acompañalo con 2 cuadraditos de chocolate amargo 70% mínimo. La cafeína del té verde es más suave que la del café y no te genera el rebote de cortisol.',
        ingredients: ['Té verde', 'Chocolate amargo 70%'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Crema de calabaza con jengibre + 1 huevo poché',
        time: '25 min',
        description:
          'Herví 2 tazas de calabaza en cubos con 1 trozo de jengibre fresco rallado y 1 diente de ajo (15 min). Procesá. Salpimentá. Serví con 1 huevo poché arriba (3 min en agua hirviendo con un chorro de vinagre). Decorá con perejil.',
        ingredients: ['Calabaza', 'Jengibre fresco', 'Ajo', 'Huevo', 'Vinagre', 'Perejil'],
      },
    ],
    tip: 'Primer agua de arroz: el secreto está en el frío. Cociná ½ taza de arroz blanco, dejalo enfriar y, dentro de las 2 horas, guardalo tapado en la heladera 12-24 h para activar el almidón resistente. A la noche, poné 2 cucharadas de ese arroz frío en un vaso con 200 ml de agua y dejalo reposar en la heladera. Al levantarte, colás, entibiás (sin hervir), le ponés unas gotas de limón y tomás en ayunas. Nunca dejes el arroz cocido fuera de la heladera. Este es el paso más importante del método.',
    requiresUpsell: false,
  },
  {
    day: 2,
    title: 'Sumamos antioxidantes',
    subtitle: 'Más color, más nutrientes antiinflamatorios',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Avena tibia con banana, lino y canela',
        time: '8 min',
        description:
          '½ taza de avena tradicional (no instantánea) con 1 taza de leche de almendras o agua. Cociná 5 min revolviendo. Apagá. Agregá 1 banana en rodajas, 1 cucharadita de lino molido, canela. Si querés, 4 nueces picadas.',
        ingredients: ['Avena tradicional', 'Leche de almendras', 'Banana', 'Lino molido', 'Canela', 'Nueces (opcional)'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍐',
        name: 'Pera + puñado de nueces (5 unidades)',
        time: '1 min',
        description:
          'La pera tiene fibra soluble que alimenta tu microbiota. Las nueces aportan omega 3. Combo simple, máxima saciedad.',
        ingredients: ['Pera', 'Nueces'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Wrap de hojas verdes con pollo y palta',
        time: '15 min',
        description:
          'Cociná 1 pechuga de pollo a la plancha (8 min) y cortala en tiras. Tomá 4 hojas grandes de lechuga mantecosa o acelga blanqueada. Rellená con: pollo, ½ palta en láminas, tomate, zanahoria rallada, brote de alfalfa. Cerralas como wraps. Aliño: yogur natural + limón + mostaza Dijon.',
        ingredients: ['Pollo', 'Lechuga mantecosa', 'Palta', 'Tomate', 'Zanahoria', 'Brote de alfalfa', 'Yogur natural', 'Limón', 'Mostaza Dijon'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥛',
        name: 'Kéfir + frutos rojos',
        time: '1 min',
        description:
          '1 vaso de kéfir (de leche o de agua) con un puñado de frutos rojos congelados (frutillas, arándanos, frambuesas). Si te queda dulzón, está perfecto, no le sumes azúcar.',
        ingredients: ['Kéfir', 'Frutos rojos congelados'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa de verduras + tortilla de espinaca',
        time: '25 min',
        description:
          'Sopa: rehogá 1 cebolla, 1 zanahoria, 1 puerro y 1 zucchini en aceite de oliva (5 min). Cubrí con caldo casero o agua + sal (15 min). Procesá si querés crema, o dejá rústica. Tortilla: batí 2 huevos, agregá 1 taza de espinaca cocida y picada, sal, pimienta. Cociná en sartén con poco aceite (5 min cada lado).',
        ingredients: ['Cebolla', 'Zanahoria', 'Puerro', 'Zucchini', 'Aceite de oliva', 'Huevos', 'Espinaca'],
      },
    ],
    tip: 'Hoy probá masticar 20 veces cada bocado, en serio. Vas a sentir el almuerzo más liviano que ayer.',
    requiresUpsell: false,
  },
  {
    day: 3,
    title: 'Empezás a notar la diferencia',
    subtitle: 'Tu sistema digestivo ya está respondiendo',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Smoothie verde anti-hinchazón',
        time: '5 min',
        description:
          'En la licuadora: 1 taza de espinaca cruda, ½ banana, ½ pepino sin cáscara, 1 cucharadita de jengibre fresco rallado, jugo de ½ limón, 1 cucharada de chía, 1 vaso de agua de coco o agua común. Procesá 30 seg. Tomalo enseguida.',
        ingredients: ['Espinaca', 'Banana', 'Pepino', 'Jengibre fresco', 'Limón', 'Chía', 'Agua de coco'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍈',
        name: 'Papaya con limón',
        time: '1 min',
        description:
          '1 taza de papaya / mamón en cubos con jugo de limón. La papaína es la enzima digestiva más potente que vas a comer en estos 7 días. Si no conseguís papaya, reemplazá por ananá.',
        ingredients: ['Papaya', 'Limón'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Salmón al horno con brócoli y batata',
        time: '25 min',
        description:
          'Salmón (1 filete) al horno 12 min a 200°C con limón, eneldo y aceite de oliva. Brócoli al vapor 6 min. Batata (camote) en cubos al horno 20 min con aceite de oliva, romero y pimentón.',
        ingredients: ['Salmón', 'Limón', 'Eneldo', 'Aceite de oliva', 'Brócoli', 'Batata', 'Romero', 'Pimentón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥕',
        name: 'Hummus casero + bastones de zanahoria y apio',
        time: '5 min',
        description:
          'Procesá 1 lata de garbanzos escurridos, 2 cdas de tahini, jugo de 1 limón, 1 diente de ajo, sal, aceite de oliva, 2 cdas de agua. Cortá zanahoria y apio en bastones. Mojá y disfrutá.',
        ingredients: ['Garbanzos', 'Tahini', 'Limón', 'Ajo', 'Aceite de oliva', 'Zanahoria', 'Apio'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Ensalada tibia de quinoa con hojas y huevo duro',
        time: '20 min',
        description:
          'Quinoa cocida (½ taza) con rúcula, espinaca, tomate cherry, pepino, 1 huevo duro picado, semillas de girasol. Aliño: aceite de oliva + limón + sal + pizca de cúrcuma.',
        ingredients: ['Quinoa', 'Rúcula', 'Espinaca', 'Tomate cherry', 'Pepino', 'Huevo', 'Semillas de girasol', 'Cúrcuma'],
      },
    ],
    tip: 'Mirate al espejo de costado a la mañana y a la noche. Anotá en tu Diario de Síntomas cuánta hinchazón sentís del 1 al 10. Vas a querer ver el cambio en gráfico.',
    requiresUpsell: false,
  },
  {
    day: 4,
    title: 'Estás a la mitad',
    subtitle: 'Medio camino recorrido, tu cuerpo responde',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Tostadas de pan de centeno con palta y tomate',
        time: '7 min',
        description:
          '2 rebanadas de pan de centeno integral (o pan de masa madre 100% si conseguís) tostadas. Pisá ½ palta con limón, sal y pimienta. Untá. Arriba: rodajas finas de tomate, una pizca de orégano fresco y semillas de sésamo.',
        ingredients: ['Pan de centeno integral', 'Palta', 'Limón', 'Tomate', 'Orégano', 'Semillas de sésamo'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥄',
        name: 'Yogur natural con miel cruda y cúrcuma',
        time: '2 min',
        description:
          '1 vaso de yogur natural sin azúcar + ½ cdita de miel cruda + ¼ cdita de cúrcuma + pizca de pimienta negra (la pimienta multiplica la absorción de la cúrcuma por 20). Mezclá bien.',
        ingredients: ['Yogur natural', 'Miel cruda', 'Cúrcuma', 'Pimienta negra'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Bowl de pollo, arroz integral y verduras asadas',
        time: '20 min',
        description:
          '½ taza de arroz integral cocido. Pollo a la plancha (1 pechuga, 8 min) cortado en cubos. Mix de pimientos rojos, zucchini y cebolla morada al horno con aceite de oliva (15 min a 200°C). Armá bowl. Aliño: tahini + limón + agua + sal.',
        ingredients: ['Arroz integral', 'Pollo', 'Pimientos rojos', 'Zucchini', 'Cebolla morada', 'Aceite de oliva', 'Tahini', 'Limón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍵',
        name: 'Té de jengibre + 5 nueces',
        time: '5 min',
        description:
          'Herví 2 rodajas de jengibre fresco en agua 5 min. Colá. Sumá medio limón exprimido. Tomalo caliente con 5 nueces al lado. Es el snack más antiinflamatorio del plan.',
        ingredients: ['Jengibre fresco', 'Limón', 'Nueces'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Pescado blanco al limón con zucchini grillado',
        time: '22 min',
        description:
          'Filete de merluza, lenguado o tilapia (10 min al horno con limón, ajo, perejil y aceite de oliva). Zucchini en rodajas a la plancha 4 min cada lado, con sal y pimienta. Acompañá con ensalada de hojas verdes.',
        ingredients: ['Merluza/lenguado/tilapia', 'Limón', 'Ajo', 'Perejil', 'Aceite de oliva', 'Zucchini', 'Hojas verdes'],
      },
    ],
    tip: 'Si venís cumpliendo bien las 4 reglas, hoy el espejo te sorprende. Sacate una foto de costado en ropa interior, igual que el día 1. Guardala.',
    requiresUpsell: false,
  },
  {
    day: 5,
    title: 'Cuerpo más liviano, cabeza más clara',
    subtitle: 'Tu intestino está en su mejor momento',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Bowl de papaya, chía y kiwi',
        time: '5 min',
        description:
          '1 taza de papaya en cubos + 1 kiwi en rodajas + 1 cda de chía hidratada (dejala 10 min antes en 3 cdas de agua o leche vegetal) + 1 cdita de coco rallado sin azúcar. Si querés, un chorrito de jugo de naranja exprimida.',
        ingredients: ['Papaya', 'Kiwi', 'Chía', 'Coco rallado', 'Jugo de naranja (opcional)'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥜',
        name: 'Mix anti-hinchazón: 8 almendras + 2 cuadraditos de chocolate 70%',
        time: '1 min',
        description:
          'Es el "snack de oficina" más fácil. Llevalo en un frasquito chiquito.',
        ingredients: ['Almendras', 'Chocolate amargo 70%'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥘',
        name: 'Lentejas guisadas con verduras',
        time: '25 min',
        description:
          'Rehogá cebolla, ajo, zanahoria y morrón rojo en aceite de oliva (5 min). Sumá 1 taza de lentejas previamente cocidas (o lata escurrida y enjuagada), tomate picado, comino, cúrcuma, sal, pimienta. Cubrí con caldo de verduras y cociná 15 min. Serví con perejil fresco arriba.',
        ingredients: ['Lentejas', 'Cebolla', 'Ajo', 'Zanahoria', 'Morrón rojo', 'Aceite de oliva', 'Tomate', 'Comino', 'Cúrcuma', 'Perejil'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍎',
        name: 'Manzana asada con canela',
        time: '7 min',
        description:
          'Cortá 1 manzana en 8 gajos. Espolvoreá canela. Microondas 4 min o sartén tapada con un toque de agua 7 min. Riquísima caliente con 4 nueces picadas arriba.',
        ingredients: ['Manzana', 'Canela', 'Nueces'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Tortilla de zucchini al horno + ensalada verde',
        time: '25 min',
        description:
          'Rallá 2 zucchinis grandes, salalos y dejalos escurrir 10 min (sacale el agua apretando con las manos). Mezclá con 3 huevos batidos, 2 cdas de queso rallado (opcional), perejil, sal, pimienta. Volcá en fuente y horno 18 min a 180°C. Serví con ensalada de rúcula, espinaca y tomate.',
        ingredients: ['Zucchini', 'Huevos', 'Queso rallado (opcional)', 'Perejil', 'Rúcula', 'Espinaca', 'Tomate'],
      },
    ],
    tip: 'Hoy tu intestino está en su mejor momento desde que arrancaste. Si todavía no estás haciendo la caminata post-cena, hoy es el día. Solo 10 minutos, en serio.',
    requiresUpsell: false,
  },

  {
    day: 6,
    title: 'Falta poco',
    subtitle: 'Penúltimo día, tu energía digestiva cambió',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Huevos revueltos con espinaca y tomate',
        time: '8 min',
        description:
          '2 huevos batidos. En sartén con un chorrito de aceite de oliva, sumá 1 taza de espinaca cruda hasta que se reduzca. Agregá los huevos. Revolvé suave. Apagá. Sumá ½ tomate en cubos arriba. Serví con 1 rebanada de pan de centeno tostado.',
        ingredients: ['Huevos', 'Espinaca', 'Tomate', 'Aceite de oliva', 'Pan de centeno'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍍',
        name: 'Smoothie de ananá y jengibre',
        time: '3 min',
        description:
          '1 taza de ananá (fresco o congelado), 1 cdita de jengibre rallado, ½ pepino, jugo de ½ limón, 1 vaso de agua. Licuá. Tomalo de inmediato. Es diurético natural.',
        ingredients: ['Ananá', 'Jengibre', 'Pepino', 'Limón'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Bowl de pollo grillado con quinoa y palta',
        time: '20 min',
        description:
          'Pollo a la plancha (1 pechuga, condimentada con cúrcuma, comino, sal). Quinoa cocida ½ taza. ½ palta en cubos. Pepino picado, tomate cherry, hojas verdes. Aliño: tahini + limón + agua + ajo rallado.',
        ingredients: ['Pollo', 'Cúrcuma', 'Comino', 'Quinoa', 'Palta', 'Pepino', 'Tomate cherry', 'Hojas verdes', 'Tahini', 'Limón', 'Ajo'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥛',
        name: 'Yogur natural con frutos rojos y semillas',
        time: '1 min',
        description:
          '1 vaso de yogur natural + ½ taza de frutos rojos + 1 cdita de semillas de girasol o calabaza.',
        ingredients: ['Yogur natural', 'Frutos rojos', 'Semillas de girasol/calabaza'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Wok de vegetales con tofu o pollo',
        time: '20 min',
        description:
          'En wok o sartén grande, sofreí ajo y jengibre rallado (1 min). Sumá brócoli, pimientos, zanahoria en juliana, hongos. Cociná 5 min revolviendo. Agregá tofu en cubos (o pollo previamente cocido) y un chorrito de salsa de soja baja en sodio o tamari. Cociná 3 min más. Serví solo o con ½ taza de arroz integral.',
        ingredients: ['Ajo', 'Jengibre', 'Brócoli', 'Pimientos', 'Zanahoria', 'Hongos', 'Tofu/Pollo', 'Salsa de soja/Tamari', 'Arroz integral (opcional)'],
      },
    ],
    tip: 'Si seguiste el plan, tu energía digestiva post-comida hoy es muy distinta a la del día 1. Anotá en tu Diario cómo te sentís después de comer (1–10). Compará con el día 1.',
    requiresUpsell: false,
  },
  {
    day: 7,
    title: 'Cerrá la semana fuerte',
    subtitle: 'Último día de la fase de limpieza',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Pancakes de avena y banana (sin harina)',
        time: '10 min',
        description:
          'En licuadora: 1 banana madura, 2 huevos, ½ taza de avena, ½ cdita de canela, pizca de sal. Procesá. Cociná en sartén antiadherente con un toque de aceite, 2 min cada lado. Salen 4 panqueques. Servilos con ½ taza de frutos rojos y 1 cdita de miel cruda.',
        ingredients: ['Banana', 'Huevos', 'Avena', 'Canela', 'Frutos rojos', 'Miel cruda'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍐',
        name: 'Pera + 8 almendras',
        time: '1 min',
        description:
          'Si la pera está bien madura, mejor. La fibra soluble de la pera es lo que tu microbiota necesita en el cierre.',
        ingredients: ['Pera', 'Almendras'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Salmón con ensalada tibia de espinaca',
        time: '22 min',
        description:
          'Salmón al horno 12 min con limón y eneldo. Mientras: en sartén, salteá 2 dientes de ajo en aceite de oliva, sumá 2 tazas de espinaca y cociná 1 min. Apagá. Mezclá con tomate cherry, palta en cubos, semillas de girasol. Aliño: aceite de oliva + limón + sal.',
        ingredients: ['Salmón', 'Limón', 'Eneldo', 'Ajo', 'Aceite de oliva', 'Espinaca', 'Tomate cherry', 'Palta', 'Semillas de girasol'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍵',
        name: 'Té verde + 2 nueces de Brasil',
        time: '2 min',
        description:
          '2 nueces de Brasil tienen tu requerimiento diario de selenio, mineral antiinflamatorio que sostiene la tiroides. No comas más de 3 por día.',
        ingredients: ['Té verde', 'Nueces de Brasil'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Crema de zanahoria con jengibre + huevo duro',
        time: '20 min',
        description:
          '4 zanahorias en rodajas, 1 trozo de jengibre, 1 diente de ajo, ½ cebolla. Hervir 18 min en caldo o agua con sal. Procesar. Servir con 1 huevo duro picado arriba y semillas de sésamo.',
        ingredients: ['Zanahorias', 'Jengibre', 'Ajo', 'Cebolla', 'Huevo', 'Semillas de sésamo'],
      },
    ],
    tip: 'Volvé a completar el Diario de Síntomas. Sacate la foto de costado. Compará con la del día 1. Esa diferencia es lo que el espejo te va a mostrar todas las mañanas si seguís adelante.',
    requiresUpsell: false,
  },

  // ═══════════════════════════════════════════════════════════
  // SEMANA 2 — Reincorporación estratégica (Días 8-14)
  // ═══════════════════════════════════════════════════════════
  {
    day: 8,
    title: 'Tu intestino post-limpieza',
    subtitle: 'Transición y consolidación — sin reincorporaciones',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Bowl de kéfir con frutas antiinflamatorias',
        time: '10 min',
        description:
          '200g kéfir natural sin azúcar, ½ taza de arándanos o frutillas, 1 cucharada de semillas de chía, miel cruda a gusto (opcional), canela en polvo. El kéfir aporta probióticos vivos que continúan el trabajo de reequilibrio intestinal.',
        ingredients: ['Kéfir natural', 'Arándanos/frutillas', 'Chía', 'Miel cruda (opcional)', 'Canela'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥜',
        name: '1 puñado de nueces + 1 fruta de temporada',
        time: '5 min',
        description:
          '15-20g de nueces naturales con una fruta de estación. Omega 3 vegetal + fibra + vitaminas.',
        ingredients: ['Nueces', 'Fruta de temporada'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Ensalada tibia de pollo y vegetales asados',
        time: '20 min',
        description:
          '150g pechuga de pollo a la plancha. Zapallito, pimiento rojo y berenjena asados al horno. Hojas verdes de base. Aderezo: aceite de oliva extra virgen + limón + cúrcuma.',
        ingredients: ['Pollo', 'Zapallito', 'Pimiento rojo', 'Berenjena', 'Hojas verdes', 'Aceite de oliva', 'Limón', 'Cúrcuma'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥕',
        name: 'Bastones de zanahoria + hummus casero',
        time: '5 min',
        description:
          'Bastones de zanahoria con 2 cucharadas de hummus casero (garbanzos + tahini + limón + ajo).',
        ingredients: ['Zanahoria', 'Hummus casero'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa de verduras con jengibre',
        time: '20 min',
        description:
          'Caldo casero de verduras con zanahoria, apio, espinaca, puerro. 1 cm de jengibre fresco rallado. Cúrcuma, pimienta negra, sal marina. Reconfortante y digestiva.',
        ingredients: ['Caldo de verduras', 'Zanahoria', 'Apio', 'Espinaca', 'Puerro', 'Jengibre', 'Cúrcuma', 'Pimienta negra'],
      },
    ],
    tip: 'El día 8 es de transición. Tu sistema digestivo viene de una semana de trabajo intenso. Hoy simplemente seguís el plan limpio y empezás a observar tu cuerpo con más atención.',
    requiresUpsell: true,
  },
  {
    day: 9,
    title: 'Reincorporación de legumbres',
    subtitle: 'Lentejas rojas con técnica de remojo',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Smoothie verde digestivo',
        time: '10 min',
        description:
          '1 puñado de espinaca baby, ½ banana madura, 200ml leche de almendras (o avena), 1 cucharada de semillas de lino molido, jengibre fresco (1 cm), hielo a gusto. Procesá y tomalo enseguida.',
        ingredients: ['Espinaca baby', 'Banana', 'Leche de almendras', 'Lino molido', 'Jengibre fresco'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥒',
        name: 'Rodajas de pepino con sal marina y limón',
        time: '5 min',
        description:
          'Pepino fresco en rodajas con sal marina y jugo de limón. Hidratante y digestivo.',
        ingredients: ['Pepino', 'Sal marina', 'Limón'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥘',
        name: 'Lentejas rojas con vegetales (reincorporación)',
        time: '25 min',
        description:
          '100g lentejas rojas (remojadas 12h con bicarbonato, escurridas y enjuagadas). Cociná con zanahoria, tomate, espinaca, comino, cúrcuma, jengibre. 1 cucharada de aceite de oliva al final. Porción moderada. Observá en las próximas 3 horas si sentís gases o hinchazón.',
        ingredients: ['Lentejas rojas', 'Zanahoria', 'Tomate', 'Espinaca', 'Comino', 'Cúrcuma', 'Jengibre', 'Aceite de oliva'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥝',
        name: '1 kiwi o papaya (enzimas digestivas)',
        time: '1 min',
        description:
          'Kiwi o papaya frescos. Las enzimas naturales (actinidina y papaína) ayudan a digerir la reincorporación del almuerzo.',
        ingredients: ['Kiwi o papaya'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Pescado blanco al vapor con limón y hierbas',
        time: '15 min',
        description:
          '150g merluza, corvina o tilapia al vapor. Brócoli y chauchas al vapor. Perejil fresco, limón, aceite de oliva extra virgen.',
        ingredients: ['Merluza/corvina/tilapia', 'Brócoli', 'Chauchas', 'Perejil', 'Limón', 'Aceite de oliva'],
      },
    ],
    tip: 'Las lentejas rojas peladas son las más digestivas. Si nunca toleraste legumbres, empezá por ahí. Remojalas 12 horas con una pizca de bicarbonato.',
    requiresUpsell: true,
  },
  {
    day: 10,
    title: 'Reincorporación de lácteos',
    subtitle: 'Testeamos lácteos fermentados vs. enteros',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Tostadas de pan de arroz con palta y huevo',
        time: '10 min',
        description:
          '2 tostadas de arroz (o maíz), ½ palta en rodajas, 1 huevo pasado por agua. Cúrcuma, pimienta negra, sal rosa.',
        ingredients: ['Tostadas de arroz', 'Palta', 'Huevo', 'Cúrcuma', 'Pimienta negra', 'Sal rosa'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥜',
        name: 'Mix: almendras + nueces de Brasil',
        time: '1 min',
        description:
          '1 puñado de almendras + 5 nueces de Brasil. Selenio + omega 3 + vitamina E.',
        ingredients: ['Almendras', 'Nueces de Brasil'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Ensalada de pollo con yogur natural (reincorporación)',
        time: '20 min',
        description:
          '130g pollo a la plancha, lechuga, tomate cherry, pepino. Aderezo: 150g yogur natural + jugo de limón + hierbas (en lugar de mayonesa). Observá digestión en las próximas 3 horas.',
        ingredients: ['Pollo', 'Lechuga', 'Tomate cherry', 'Pepino', 'Yogur natural', 'Limón', 'Hierbas'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍍',
        name: 'Fruta: mango o ananá',
        time: '5 min',
        description:
          'Mango fresco o ananá en cubos. La bromelina del ananá ayuda con la digestión del lácteo testeado.',
        ingredients: ['Mango o ananá'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Wok de vegetales con tofu firme',
        time: '20 min',
        description:
          'Tofu firme salteado en aceite de oliva con brócoli, zanahoria, champiñones, puerro. Salsa: tamari (sin gluten) + jengibre + ajo. Servir con ½ taza de arroz integral previamente cocido.',
        ingredients: ['Tofu firme', 'Aceite de oliva', 'Brócoli', 'Zanahoria', 'Champiñones', 'Puerro', 'Tamari', 'Jengibre', 'Ajo', 'Arroz integral'],
      },
    ],
    tip: 'Si en la Semana 1 ya usaste kéfir o yogur y no tuviste reacción, hoy ya lo tenés confirmado. Podés pasar directo a testear queso fresco mañana.',
    requiresUpsell: true,
  },
  {
    day: 11,
    title: 'Reincorporación de cereales',
    subtitle: 'Testeamos avena y cereales integrales',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Avena integral con frutas (reincorporación)',
        time: '10 min',
        description:
          '50g avena en copos, 200ml leche vegetal, ½ banana + 5 frutillas, 1 cucharada de semillas de chía, canela. Observá durante las primeras 4 horas. La avena es el cereal más tolerado.',
        ingredients: ['Avena en copos', 'Leche vegetal', 'Banana', 'Frutillas', 'Chía', 'Canela'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍎',
        name: 'Rodajas de manzana con mantequilla de almendras',
        time: '2 min',
        description:
          'Manzana cortada en gajos con 1 cucharada de mantequilla de almendras natural (sin azúcar agregada).',
        ingredients: ['Manzana', 'Mantequilla de almendras'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Bowl de salmón con arroz integral',
        time: '20 min',
        description:
          '150g salmón a la plancha, 80g arroz integral cocido, edamame o chauchas al vapor. Aderezo: limón, aceite de oliva, semillas de sésamo.',
        ingredients: ['Salmón', 'Arroz integral', 'Edamame/chauchas', 'Limón', 'Aceite de oliva', 'Semillas de sésamo'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥛',
        name: 'Yogur natural con semillas de lino',
        time: '1 min',
        description:
          'Yogur natural sin azúcar con 1 cucharada de semillas de lino molido. Probióticos + fibra antiinflamatoria.',
        ingredients: ['Yogur natural', 'Semillas de lino molido'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa de calabaza con cúrcuma y jengibre',
        time: '25 min',
        description:
          '300g calabaza cocida y procesada con caldo de verduras. 1 lata de leche de coco (opcional, para cremosidad). Cúrcuma, jengibre, comino, aceite de oliva.',
        ingredients: ['Calabaza', 'Caldo de verduras', 'Leche de coco (opcional)', 'Cúrcuma', 'Jengibre', 'Comino', 'Aceite de oliva'],
      },
    ],
    tip: 'No necesitás eliminar el gluten para siempre. Solo necesitás saber si te afecta. Hoy lo descubrís con la avena — el cereal más amigable.',
    requiresUpsell: true,
  },
  {
    day: 12,
    title: 'Test de tolerancia personal',
    subtitle: 'Revisá todo lo que observaste en los últimos 4 días',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Bowl de frutas tropicales con chía',
        time: '5 min',
        description:
          'Papaya, mango y kiwi en cubos con 1 cucharada de chía hidratada y un chorrito de limón. Enzimas digestivas naturales para empezar el día.',
        ingredients: ['Papaya', 'Mango', 'Kiwi', 'Chía', 'Limón'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥕',
        name: 'Bastones de zanahoria y apio con hummus',
        time: '5 min',
        description:
          'Vegetales crujientes con 2 cucharadas de hummus casero. Fibra + proteína vegetal.',
        ingredients: ['Zanahoria', 'Apio', 'Hummus'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Ensalada completa con proteína',
        time: '15 min',
        description:
          'Hojas verdes mixtas, pollo o salmón a la plancha, palta, tomate cherry, pepino, semillas de girasol. Aliño: aceite de oliva + limón + sal. Sin reincorporaciones nuevas hoy.',
        ingredients: ['Hojas verdes', 'Pollo/salmón', 'Palta', 'Tomate cherry', 'Pepino', 'Semillas de girasol', 'Aceite de oliva', 'Limón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍵',
        name: 'Té de jengibre con limón + nueces',
        time: '5 min',
        description:
          'Infusión de jengibre fresco con limón. Acompañá con 5 nueces. Antiinflamatorio y saciante.',
        ingredients: ['Jengibre fresco', 'Limón', 'Nueces'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Crema de brócoli con huevo duro',
        time: '20 min',
        description:
          'Brócoli hervido 8 min, procesado con caldo de verduras, ajo, aceite de oliva. Servir con 1 huevo duro picado y semillas de sésamo.',
        ingredients: ['Brócoli', 'Caldo de verduras', 'Ajo', 'Aceite de oliva', 'Huevo', 'Semillas de sésamo'],
      },
    ],
    tip: 'Hoy no incorporás nada nuevo. Usá la Calculadora de Microbiota para revisar qué alimentos te cayeron bien y cuáles no. Armá tu mapa de tolerancias personal.',
    requiresUpsell: true,
  },
  {
    day: 13,
    title: 'Día de consolidación',
    subtitle: 'Afianzá lo aprendido con tus alimentos verdes',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Avena con banana y mantequilla de almendras',
        time: '8 min',
        description:
          '½ taza de avena con leche vegetal (si la toleraste el día 11). Banana en rodajas y 1 cucharada de mantequilla de almendras. Canela al gusto.',
        ingredients: ['Avena', 'Leche vegetal', 'Banana', 'Mantequilla de almendras', 'Canela'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥝',
        name: 'Kiwi + puñado de almendras',
        time: '1 min',
        description:
          '1 kiwi fresco con 8 almendras naturales. Vitamina C + grasas saludables.',
        ingredients: ['Kiwi', 'Almendras'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥘',
        name: 'Bowl libre con alimentos verdes confirmados',
        time: '20 min',
        description:
          'Combiná proteína (pollo, pescado o huevo) + vegetal base (hojas verdes) + cereal tolerado (quinoa o arroz integral) + grasa buena (palta o aceite de oliva). Usá solo alimentos de tu lista verde.',
        ingredients: ['Proteína a elección', 'Hojas verdes', 'Cereal tolerado', 'Palta/aceite de oliva'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍎',
        name: 'Fruta de temporada + chocolate 70%',
        time: '2 min',
        description:
          'Una fruta que te guste + 2 cuadraditos de chocolate amargo. El día de consolidación es para disfrutar lo que funciona.',
        ingredients: ['Fruta de temporada', 'Chocolate amargo 70%'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa reconfortante + proteína liviana',
        time: '20 min',
        description:
          'Sopa de verduras de tu preferencia (calabaza, zanahoria o brócoli) con 1 huevo duro o pollo desmenuzado. Jengibre rallado para potenciar la digestión nocturna.',
        ingredients: ['Verduras variadas', 'Huevo/pollo', 'Jengibre', 'Caldo casero'],
      },
    ],
    tip: 'Dos semanas de protocolo generan cambios en la microbiota que se mantienen si seguís comiendo el 80% del tiempo con los alimentos que te sientan bien. El 20% restante es vida real.',
    requiresUpsell: true,
  },
  {
    day: 14,
    title: 'Balance de 2 semanas',
    subtitle: 'Mirá lo que lograste y preparate para lo que viene',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Pancakes de avena con frutos rojos',
        time: '10 min',
        description:
          '1 banana + 2 huevos + ½ taza avena (si tolerás). Procesá y cociná en sartén antiadherente. Serví con frutos rojos y una cucharadita de miel. Celebrá 2 semanas de progreso.',
        ingredients: ['Banana', 'Huevos', 'Avena', 'Frutos rojos', 'Miel cruda'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥛',
        name: 'Kéfir con semillas y canela',
        time: '2 min',
        description:
          '1 vaso de kéfir con 1 cucharada de semillas de chía y canela. El probiótico que te acompañó desde el día 1.',
        ingredients: ['Kéfir', 'Chía', 'Canela'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Salmón con quinoa y vegetales grillados',
        time: '25 min',
        description:
          'Salmón al horno con limón y eneldo. Quinoa cocida. Vegetales grillados (zucchini, pimientos, berenjena). Aliño de tahini. Una comida que resume lo mejor de estas 2 semanas.',
        ingredients: ['Salmón', 'Quinoa', 'Zucchini', 'Pimientos', 'Berenjena', 'Limón', 'Eneldo', 'Tahini'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍵',
        name: 'Té verde + nueces de Brasil',
        time: '2 min',
        description:
          'Tu combo antiinflamatorio favorito: té verde + 2 nueces de Brasil por el selenio.',
        ingredients: ['Té verde', 'Nueces de Brasil'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Crema de calabaza y zanahoria con cúrcuma',
        time: '20 min',
        description:
          'Calabaza y zanahoria hervidas con jengibre y cúrcuma. Procesá con caldo hasta lograr cremosidad. 1 huevo duro picado arriba. Cena liviana para cerrar estas 2 semanas.',
        ingredients: ['Calabaza', 'Zanahoria', 'Jengibre', 'Cúrcuma', 'Caldo', 'Huevo'],
      },
    ],
    tip: 'Respondete estas 3 preguntas: ¿Qué síntoma mejoró más? ¿Qué alimento te sorprendió? Del 1 al 10, ¿cómo está tu hinchazón hoy vs. hace 14 días?',
    requiresUpsell: true,
  },

  // ═══════════════════════════════════════════════════════════
  // SEMANA 3 — Optimización digestiva (Días 15-21)
  // ═══════════════════════════════════════════════════════════
  {
    day: 15,
    title: 'Combinación inteligente de alimentos',
    subtitle: 'Aprendé qué comer junto y qué separar',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Bowl de papaya con granola casera',
        time: '8 min',
        description:
          '1 taza de papaya en cubos + granola casera (avena tostada con coco rallado, semillas de girasol y canela, sin azúcar agregada). Chorrito de miel cruda.',
        ingredients: ['Papaya', 'Avena', 'Coco rallado', 'Semillas de girasol', 'Canela', 'Miel cruda'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥒',
        name: 'Pepino con hummus de palta',
        time: '5 min',
        description:
          'Rodajas de pepino con hummus de palta: ½ palta procesada con limón, ajo, sal y un toque de comino.',
        ingredients: ['Pepino', 'Palta', 'Limón', 'Ajo', 'Comino'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Pollo con batata y ensalada de rúcula',
        time: '25 min',
        description:
          'Pechuga de pollo al horno con cúrcuma y romero. Batata asada en cubos. Ensalada de rúcula con tomate cherry y semillas de calabaza. Aliño: aceite de oliva + limón.',
        ingredients: ['Pollo', 'Cúrcuma', 'Romero', 'Batata', 'Rúcula', 'Tomate cherry', 'Semillas de calabaza', 'Aceite de oliva', 'Limón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍐',
        name: 'Pera asada con canela y nueces',
        time: '7 min',
        description:
          '1 pera cortada al medio, al horno 7 min con canela. Servir con 4 nueces picadas. Dulzura natural + omega 3.',
        ingredients: ['Pera', 'Canela', 'Nueces'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa de lentejas rojas con espinaca',
        time: '20 min',
        description:
          'Lentejas rojas cocidas con espinaca, zanahoria, cúrcuma y jengibre en caldo de verduras. Porción liviana para la noche. Proteína vegetal de fácil digestión.',
        ingredients: ['Lentejas rojas', 'Espinaca', 'Zanahoria', 'Cúrcuma', 'Jengibre', 'Caldo de verduras'],
      },
    ],
    tip: 'Regla de oro: no mezcles fruta dulce con proteína animal en la misma comida. La fruta se digiere rápido; si queda "atrapada" detrás de proteína, fermenta y produce gas.',
    requiresUpsell: true,
  },
  {
    day: 16,
    title: 'Horarios óptimos de comida',
    subtitle: 'Cronobiología digestiva: cuándo comer qué',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Smoothie de ananá, espinaca y jengibre',
        time: '5 min',
        description:
          '1 taza de ananá, 1 puñado de espinaca, 1 cm de jengibre, jugo de ½ limón, 1 cucharada de chía, agua. Procesá y tomá en ayunas (30 min después del agua con limón).',
        ingredients: ['Ananá', 'Espinaca', 'Jengibre', 'Limón', 'Chía'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥜',
        name: 'Mix de frutos secos antiinflamatorios',
        time: '1 min',
        description:
          '5 nueces + 5 almendras + 2 nueces de Brasil. Grasas omega 3, vitamina E y selenio en un puñado.',
        ingredients: ['Nueces', 'Almendras', 'Nueces de Brasil'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Salmón a la plancha con arroz integral y brócoli',
        time: '20 min',
        description:
          'Salmón con limón y eneldo (5 min cada lado). Arroz integral cocido. Brócoli al vapor con aceite de oliva y semillas de sésamo. Tu almuerzo más completo: omega 3 + fibra + antioxidantes.',
        ingredients: ['Salmón', 'Limón', 'Eneldo', 'Arroz integral', 'Brócoli', 'Aceite de oliva', 'Semillas de sésamo'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥛',
        name: 'Kéfir con cúrcuma y pimienta',
        time: '2 min',
        description:
          '1 vaso de kéfir + ¼ cdita de cúrcuma + pizca de pimienta negra + miel (opcional). El "golden milk" probiótico.',
        ingredients: ['Kéfir', 'Cúrcuma', 'Pimienta negra', 'Miel (opcional)'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Tortilla de vegetales al horno',
        time: '22 min',
        description:
          '3 huevos batidos con espinaca, pimientos asados, cebolla caramelizada y hierbas frescas. Al horno 18 min. Cena liviana 3 horas antes de dormir.',
        ingredients: ['Huevos', 'Espinaca', 'Pimientos', 'Cebolla', 'Hierbas frescas'],
      },
    ],
    tip: 'Tu sistema digestivo es más fuerte entre las 10am y las 2pm. Hacé de tu almuerzo la comida más abundante del día y mantené la cena liviana.',
    requiresUpsell: true,
  },
  {
    day: 17,
    title: 'Prebióticos: alimentá tus bacterias buenas',
    subtitle: 'Los alimentos que nutren tu microbiota',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Yogur natural con banana verde y lino',
        time: '5 min',
        description:
          'Yogur natural sin azúcar + ½ banana (idealmente no muy madura, más almidón resistente = más prebiótico) + 1 cucharada de lino molido + canela.',
        ingredients: ['Yogur natural', 'Banana', 'Lino molido', 'Canela'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍎',
        name: 'Manzana verde con canela',
        time: '1 min',
        description:
          'Manzana verde en gajos espolvoreados con canela. La pectina de la manzana verde es alimento directo para tus bacterias buenas.',
        ingredients: ['Manzana verde', 'Canela'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Bowl de pollo con cebolla caramelizada y quinoa',
        time: '25 min',
        description:
          'Pollo grillado + quinoa cocida + cebolla caramelizada (la cebolla cocida es prebiótica) + hojas verdes + palta. Aliño: aceite de oliva + limón + ajo.',
        ingredients: ['Pollo', 'Quinoa', 'Cebolla', 'Hojas verdes', 'Palta', 'Aceite de oliva', 'Limón', 'Ajo'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍵',
        name: 'Té de jengibre y cúrcuma + almendras',
        time: '5 min',
        description:
          'Infusión de jengibre fresco + ½ cdita de cúrcuma + limón. 6 almendras al costado. Antiinflamatorio potente.',
        ingredients: ['Jengibre', 'Cúrcuma', 'Limón', 'Almendras'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa de puerro y papa con ajo asado',
        time: '25 min',
        description:
          'Puerro (altamente prebiótico) + papa + ajo asado, hervidos y procesados en crema suave. Servir con perejil y aceite de oliva. El puerro alimenta las bifidobacterias.',
        ingredients: ['Puerro', 'Papa', 'Ajo', 'Perejil', 'Aceite de oliva'],
      },
    ],
    tip: 'Los prebióticos (puerro, ajo, cebolla, banana verde, espárragos) son el alimento de tus bacterias buenas. Incluí al menos uno en cada comida principal.',
    requiresUpsell: true,
  },
  {
    day: 18,
    title: 'Grasas antiinflamatorias',
    subtitle: 'Las grasas que desinflan vs. las que inflaman',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Tostadas con palta y semillas de chía',
        time: '7 min',
        description:
          '2 rebanadas de pan de masa madre o centeno. Palta pisada con limón y sal. Arriba: semillas de chía, sésamo y un hilo de aceite de oliva. Grasas saludables desde temprano.',
        ingredients: ['Pan de centeno/masa madre', 'Palta', 'Limón', 'Chía', 'Sésamo', 'Aceite de oliva'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥜',
        name: '8 nueces + 2 cuadraditos de chocolate 85%',
        time: '1 min',
        description:
          'Nueces (omega 3 vegetal) + chocolate extra amargo (polifenoles). Más amargo = más beneficio antiinflamatorio.',
        ingredients: ['Nueces', 'Chocolate 85%'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Sardinas al horno con ensalada mediterránea',
        time: '20 min',
        description:
          'Sardinas frescas (o en lata al natural) al horno con limón y ajo. Ensalada: tomate, pepino, aceitunas negras, hojas verdes. Aliño: aceite de oliva extra virgen abundante.',
        ingredients: ['Sardinas', 'Limón', 'Ajo', 'Tomate', 'Pepino', 'Aceitunas negras', 'Hojas verdes', 'Aceite de oliva'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥑',
        name: 'Guacamole con bastones de zanahoria',
        time: '5 min',
        description:
          '1 palta pisada con tomate picado, cebolla morada, cilantro, limón y sal. Mojá con bastones de zanahoria y apio.',
        ingredients: ['Palta', 'Tomate', 'Cebolla morada', 'Cilantro', 'Limón', 'Zanahoria', 'Apio'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Crema de zapallo con leche de coco',
        time: '22 min',
        description:
          'Zapallo/calabaza hervido con jengibre y cúrcuma. Procesá con leche de coco (triglicéridos de cadena media, antiinflamatorios). Servir con semillas de calabaza tostadas.',
        ingredients: ['Zapallo/calabaza', 'Jengibre', 'Cúrcuma', 'Leche de coco', 'Semillas de calabaza'],
      },
    ],
    tip: 'Aceite de oliva extra virgen, palta, nueces, semillas y pescados azules: esas son las grasas que desinflan. Las frituras y aceites vegetales refinados hacen lo opuesto.',
    requiresUpsell: true,
  },
  {
    day: 19,
    title: 'Proteínas de fácil digestión',
    subtitle: 'Aprendé a elegir y cocinar proteínas que no inflaman',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Huevos pochados sobre espinaca salteada',
        time: '10 min',
        description:
          '2 huevos pochados (3 min en agua con vinagre) sobre un colchón de espinaca salteada con ajo en aceite de oliva. 1 rebanada de pan de centeno. Proteína completa + hierro.',
        ingredients: ['Huevos', 'Espinaca', 'Ajo', 'Aceite de oliva', 'Pan de centeno', 'Vinagre'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍈',
        name: 'Papaya con semillas de girasol',
        time: '2 min',
        description:
          '1 taza de papaya fresca + 1 cucharada de semillas de girasol. Papaína + vitamina E.',
        ingredients: ['Papaya', 'Semillas de girasol'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Bowl de quinoa con huevo, palta y vegetales',
        time: '15 min',
        description:
          'Quinoa cocida + 2 huevos duros + ½ palta + tomate cherry + espinaca + pepino. Aliño: tahini + limón + agua. La quinoa es proteína completa vegetal.',
        ingredients: ['Quinoa', 'Huevos', 'Palta', 'Tomate cherry', 'Espinaca', 'Pepino', 'Tahini', 'Limón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥛',
        name: 'Yogur griego natural con nueces',
        time: '2 min',
        description:
          'Yogur griego natural (más proteína, menos lactosa por la fermentación) + 5 nueces picadas + canela.',
        ingredients: ['Yogur griego natural', 'Nueces', 'Canela'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Pescado blanco al papillote con vegetales',
        time: '18 min',
        description:
          'Filete de merluza envuelto en papel aluminio con rodajas de limón, zucchini, tomate y albahaca fresca. Al horno 15 min. La cocción al vapor preserva nutrientes y es ultra digestiva.',
        ingredients: ['Merluza', 'Limón', 'Zucchini', 'Tomate', 'Albahaca'],
      },
    ],
    tip: 'Las proteínas más digestivas son: huevo, pescado blanco, pollo sin piel y legumbres bien cocidas. Evitá carnes rojas y embutidos que enlentecen el tránsito.',
    requiresUpsell: true,
  },
  {
    day: 20,
    title: 'Hidratación avanzada',
    subtitle: 'Más allá del agua: infusiones y caldos',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Smoothie de kéfir con frutos rojos y lino',
        time: '5 min',
        description:
          '200ml kéfir + ½ taza de frutos rojos congelados + 1 cucharada de lino molido + ½ banana. Procesá hasta cremoso. Probiótico + antioxidantes.',
        ingredients: ['Kéfir', 'Frutos rojos', 'Lino molido', 'Banana'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍵',
        name: 'Caldo de huesos casero (1 taza)',
        time: '5 min',
        description:
          '1 taza de caldo de huesos caliente (prepará una olla grande los domingos y congelá porciones). Colágeno + minerales que reparan la mucosa intestinal.',
        ingredients: ['Caldo de huesos'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥘',
        name: 'Curry suave de pollo con arroz integral',
        time: '25 min',
        description:
          'Pollo en cubos salteado con cebolla, ajo, jengibre. Sumar leche de coco + cúrcuma + comino + una pizca de curry. Cocinar 15 min. Servir con arroz integral. Antiinflamatorio y saciante.',
        ingredients: ['Pollo', 'Cebolla', 'Ajo', 'Jengibre', 'Leche de coco', 'Cúrcuma', 'Comino', 'Curry', 'Arroz integral'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥒',
        name: 'Agua de pepino y menta + almendras',
        time: '5 min',
        description:
          'Jarra de agua con pepino en rodajas y hojas de menta (preparala a la mañana). 1 vaso + 6 almendras. Hidratación con sabor + grasas saludables.',
        ingredients: ['Pepino', 'Menta', 'Almendras'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa miso con tofu y vegetales',
        time: '15 min',
        description:
          'Caldo caliente + 1 cucharada de pasta miso (disuelta al final, no hervir). Tofu en cubos, alga wakame (opcional), cebolla de verdeo, zanahoria rallada. Probiótico natural japonés.',
        ingredients: ['Pasta miso', 'Tofu', 'Cebolla de verdeo', 'Zanahoria', 'Alga wakame (opcional)'],
      },
    ],
    tip: 'El caldo de huesos y la sopa miso son las dos mejores bebidas para tu intestino. Reparación de mucosa + probióticos. Incorporá 1 taza diaria como ritual.',
    requiresUpsell: true,
  },
  {
    day: 21,
    title: 'Cierre de semana 3: tu rutina óptima',
    subtitle: 'Consolidá tu nuevo estilo alimentario',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Bowl de avena overnight con chía y frutas',
        time: '2 min (prep noche anterior)',
        description:
          'Preparado la noche anterior: ½ taza avena + 1 cda chía + leche vegetal. A la mañana sumar: kiwi en rodajas, frutos rojos, nueces picadas. El almidón resistente de la avena overnight es más prebiótico.',
        ingredients: ['Avena', 'Chía', 'Leche vegetal', 'Kiwi', 'Frutos rojos', 'Nueces'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥕',
        name: 'Zanahoria rallada con limón y semillas',
        time: '3 min',
        description:
          '2 zanahorias ralladas con jugo de limón, semillas de girasol y una pizca de comino. Fibra + vitamina A + digestión.',
        ingredients: ['Zanahorias', 'Limón', 'Semillas de girasol', 'Comino'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Salmón teriyaki casero con vegetales',
        time: '20 min',
        description:
          'Salmón glaseado con salsa casera (tamari + miel + jengibre rallado + ajo). Servir sobre arroz integral con brócoli y edamame al vapor. Tu comida estrella de la semana.',
        ingredients: ['Salmón', 'Tamari', 'Miel', 'Jengibre', 'Ajo', 'Arroz integral', 'Brócoli', 'Edamame'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍎',
        name: 'Manzana con mantequilla de almendras',
        time: '2 min',
        description:
          'Gajos de manzana con 1 cucharada de mantequilla de almendras. Simple, saciante y sin inflamación.',
        ingredients: ['Manzana', 'Mantequilla de almendras'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Ensalada tibia de lentejas con huevo pochado',
        time: '15 min',
        description:
          'Lentejas cocidas tibias + espinaca + tomate seco + palta + 1 huevo pochado arriba. Aliño: aceite de oliva + vinagre balsámico + mostaza. Cena completa y liviana.',
        ingredients: ['Lentejas', 'Espinaca', 'Tomate seco', 'Palta', 'Huevo', 'Aceite de oliva', 'Vinagre balsámico', 'Mostaza'],
      },
    ],
    tip: 'Ya pasaron 3 semanas. Tu microbiota cambió significativamente. De acá en más, el objetivo es mantener: 80% alimentos antiinflamatorios, 20% flexibilidad social.',
    requiresUpsell: true,
  },

  // ═══════════════════════════════════════════════════════════
  // SEMANA 4 — Mantenimiento y autonomía (Días 22-30)
  // ═══════════════════════════════════════════════════════════
  {
    day: 22,
    title: 'Meal prep dominical',
    subtitle: 'Prepará la semana en 2 horas y no pensés más',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Pancakes de banana y avena con frutos rojos',
        time: '10 min',
        description:
          '1 banana + 2 huevos + ½ taza avena + canela. Procesá y cociná. Serví con frutos rojos frescos y un hilo de miel. Hoy es día de preparación, arrancá con energía.',
        ingredients: ['Banana', 'Huevos', 'Avena', 'Canela', 'Frutos rojos', 'Miel'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥝',
        name: 'Kiwi + yogur natural',
        time: '2 min',
        description:
          '1 kiwi en rodajas sobre yogur natural. Enzimas digestivas + probióticos para arrancar el prep.',
        ingredients: ['Kiwi', 'Yogur natural'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Bowl de quinoa con vegetales asados y tahini',
        time: '25 min',
        description:
          'Quinoa cocida en cantidad (guardá para la semana). Vegetales asados: batata, brócoli, pimientos, cebolla morada. Proteína: pollo o garbanzos. Aliño de tahini + limón. Preparalo doble.',
        ingredients: ['Quinoa', 'Batata', 'Brócoli', 'Pimientos', 'Cebolla morada', 'Pollo/garbanzos', 'Tahini', 'Limón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍵',
        name: 'Té verde + nueces',
        time: '3 min',
        description:
          'Tu ritual de la tarde: té verde + 5 nueces. Mientras tomás, planificá las comidas de mañana con lo que preparaste.',
        ingredients: ['Té verde', 'Nueces'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa de lentejas rojas (batch cooking)',
        time: '25 min',
        description:
          'Hacé una olla grande: lentejas rojas + zanahoria + tomate + cúrcuma + jengibre + comino. Congelá en porciones individuales. Cena lista para 3 noches de la semana.',
        ingredients: ['Lentejas rojas', 'Zanahoria', 'Tomate', 'Cúrcuma', 'Jengibre', 'Comino', 'Caldo de verduras'],
      },
    ],
    tip: 'El secreto del mantenimiento es la preparación. 2 horas el domingo = 0 excusas de lunes a viernes. Cociná quinoa, lavá hojas verdes, hacé sopa y cortá vegetales.',
    requiresUpsell: true,
  },
  {
    day: 23,
    title: 'Comer afuera sin inflamarte',
    subtitle: 'Estrategias para restaurantes y delivery',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Avena overnight con mango y coco',
        time: '2 min (prep noche anterior)',
        description:
          '½ taza avena + chía + leche de coco (preparada anoche). A la mañana: mango en cubos + coco rallado + almendras fileteadas. Tropical y antiinflamatoria.',
        ingredients: ['Avena', 'Chía', 'Leche de coco', 'Mango', 'Coco rallado', 'Almendras'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍎',
        name: 'Manzana verde + mantequilla de almendras',
        time: '2 min',
        description:
          'Gajos de manzana verde con 1 cucharada de mantequilla de almendras. Pectina + grasas saludables.',
        ingredients: ['Manzana verde', 'Mantequilla de almendras'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Simulación restaurante: pescado + ensalada',
        time: '20 min',
        description:
          'Practicá lo que pedirías afuera: pescado a la plancha (sin salsas pesadas) + ensalada verde grande + aceite de oliva como aderezo. Sin pan de cortesía. Esta es tu orden ideal en cualquier restaurante.',
        ingredients: ['Pescado blanco', 'Hojas verdes variadas', 'Tomate', 'Aceite de oliva', 'Limón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥛',
        name: 'Kéfir con semillas de calabaza',
        time: '1 min',
        description:
          'Kéfir natural + 1 cucharada de semillas de calabaza (zinc + probióticos). Snack que podés llevar en tupper.',
        ingredients: ['Kéfir', 'Semillas de calabaza'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Wok casero estilo delivery saludable',
        time: '15 min',
        description:
          'Vegetales salteados (brócoli, zanahoria, pimientos, hongos) + pollo o tofu + tamari + jengibre + ajo. Servir sobre arroz integral. Más rico que cualquier delivery y sin ingredientes ocultos.',
        ingredients: ['Brócoli', 'Zanahoria', 'Pimientos', 'Hongos', 'Pollo/tofu', 'Tamari', 'Jengibre', 'Ajo', 'Arroz integral'],
      },
    ],
    tip: 'En un restaurante: pedí pescado/pollo a la plancha + ensalada o verduras. Evitá salsas cremosas, pan de cortesía y gaseosas. Si te tienta el postre, elegí fruta.',
    requiresUpsell: true,
  },
  {
    day: 24,
    title: 'Fermentados: tu farmacia natural',
    subtitle: 'Kéfir, chucrut, miso y más probióticos reales',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Bowl de kéfir con granola y semillas',
        time: '5 min',
        description:
          '200ml kéfir + granola casera (avena tostada, coco, semillas) + 1 cucharada de miel. Probiótico vivo + fibra prebiótica.',
        ingredients: ['Kéfir', 'Avena tostada', 'Coco rallado', 'Semillas mixtas', 'Miel'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥒',
        name: 'Pepinillos fermentados + nueces',
        time: '1 min',
        description:
          '3-4 pepinillos fermentados naturalmente (no en vinagre) + 5 nueces. Probióticos + omega 3.',
        ingredients: ['Pepinillos fermentados', 'Nueces'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Bowl de pollo con chucrut y batata',
        time: '20 min',
        description:
          'Pollo grillado + batata asada + 2 cucharadas de chucrut crudo (no pasteurizado) + hojas verdes + semillas de girasol. El chucrut es uno de los fermentados más potentes.',
        ingredients: ['Pollo', 'Batata', 'Chucrut crudo', 'Hojas verdes', 'Semillas de girasol'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍵',
        name: 'Kombucha natural + almendras',
        time: '1 min',
        description:
          '1 vaso de kombucha natural (sin azúcar agregada) + 6 almendras. Probióticos efervescentes + grasas saludables.',
        ingredients: ['Kombucha', 'Almendras'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa miso con salmón y vegetales',
        time: '18 min',
        description:
          'Caldo caliente + pasta miso (disuelta al final). Salmón desmenuzado + espinaca + cebolla de verdeo + semillas de sésamo. Doble probiótico: miso + fermentación.',
        ingredients: ['Pasta miso', 'Salmón', 'Espinaca', 'Cebolla de verdeo', 'Semillas de sésamo'],
      },
    ],
    tip: 'Los fermentados (kéfir, chucrut, miso, kombucha) son probióticos naturales. Incluí al menos 1 porción diaria. Empezá de a poco si no estás acostumbrada.',
    requiresUpsell: true,
  },
  {
    day: 25,
    title: 'Fibra inteligente',
    subtitle: 'Cuánta, cuándo y de qué tipo',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Porridge de avena con pera y nueces',
        time: '8 min',
        description:
          '½ taza avena + agua o leche vegetal, cocida 5 min. Arriba: pera en cubos (fibra soluble) + nueces picadas + canela + chía. La fibra de la mañana activa el tránsito.',
        ingredients: ['Avena', 'Leche vegetal', 'Pera', 'Nueces', 'Canela', 'Chía'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥕',
        name: 'Zanahoria y hummus',
        time: '3 min',
        description:
          'Bastones de zanahoria (fibra insoluble) con hummus (fibra soluble de los garbanzos). Combinación perfecta para regular el tránsito.',
        ingredients: ['Zanahoria', 'Hummus'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥘',
        name: 'Guiso de garbanzos con espinaca y tomate',
        time: '25 min',
        description:
          'Garbanzos cocidos + espinaca + tomate + cebolla + ajo + pimentón + comino + aceite de oliva. Servir con arroz integral. Alta fibra + proteína vegetal.',
        ingredients: ['Garbanzos', 'Espinaca', 'Tomate', 'Cebolla', 'Ajo', 'Pimentón', 'Comino', 'Aceite de oliva', 'Arroz integral'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍐',
        name: 'Pera + chocolate 70%',
        time: '2 min',
        description:
          '1 pera madura + 2 cuadraditos de chocolate 70%. Fibra soluble + polifenoles. Dulzura sin inflación.',
        ingredients: ['Pera', 'Chocolate 70%'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Crema de brócoli y puerro',
        time: '20 min',
        description:
          'Brócoli + puerro + papa (poca) hervidos y procesados. Aceite de oliva + semillas de calabaza arriba. Fibra + prebióticos en formato suave para la noche.',
        ingredients: ['Brócoli', 'Puerro', 'Papa', 'Aceite de oliva', 'Semillas de calabaza'],
      },
    ],
    tip: 'No toda la fibra es igual. La soluble (avena, chía, pera) calma. La insoluble (hojas verdes, zanahoria cruda) activa. Necesitás las dos, pero si tenés gases, priorizá la soluble.',
    requiresUpsell: true,
  },
  {
    day: 26,
    title: 'Manejo del estrés digestivo',
    subtitle: 'El eje intestino-cerebro en la práctica',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Smoothie adaptógeno de cacao y banana',
        time: '5 min',
        description:
          '1 banana + 1 cda de cacao puro + 200ml leche de almendras + 1 cda de mantequilla de almendras + canela + hielo. El cacao es rico en magnesio, mineral anti-estrés.',
        ingredients: ['Banana', 'Cacao puro', 'Leche de almendras', 'Mantequilla de almendras', 'Canela'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍵',
        name: 'Infusión de manzanilla + nueces',
        time: '5 min',
        description:
          'Manzanilla (relajante del sistema nervioso entérico) + 5 nueces. Tomate 10 minutos para respirar mientras lo tomás.',
        ingredients: ['Manzanilla', 'Nueces'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Bowl de salmón con palta y arroz integral',
        time: '20 min',
        description:
          'Salmón (omega 3, antiinflamatorio cerebral) + arroz integral + palta + edamame + pepino + semillas de sésamo. Tamari + jengibre como aliño. Comida que nutre cerebro e intestino.',
        ingredients: ['Salmón', 'Arroz integral', 'Palta', 'Edamame', 'Pepino', 'Semillas de sésamo', 'Tamari', 'Jengibre'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥑',
        name: 'Tostada de palta con semillas',
        time: '5 min',
        description:
          '1 tostada de pan de centeno con palta, sal rosa y semillas de sésamo + chía. Grasas que calman la inflamación nerviosa.',
        ingredients: ['Pan de centeno', 'Palta', 'Sal rosa', 'Sésamo', 'Chía'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa de verduras reconfortante con cúrcuma',
        time: '20 min',
        description:
          'Zanahoria + zapallo + cebolla + apio hervidos en caldo con cúrcuma y jengibre. Procesá suave. La cena más reconfortante y anti-estrés del plan. Comela despacio, sin pantalla.',
        ingredients: ['Zanahoria', 'Zapallo', 'Cebolla', 'Apio', 'Cúrcuma', 'Jengibre', 'Caldo'],
      },
    ],
    tip: 'El estrés crónico inflama tu intestino directamente (eje intestino-cerebro). Hoy cená sin pantalla, masticá despacio y antes de dormir hacé 5 respiraciones profundas con exhalación lenta.',
    requiresUpsell: true,
  },
  {
    day: 27,
    title: 'Snacks que no inflaman',
    subtitle: 'Tu arsenal de colaciones inteligentes',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Tostadas de centeno con huevo y palta',
        time: '8 min',
        description:
          '2 rebanadas de pan de centeno tostado + 1 huevo revuelto + ½ palta + tomate cherry cortado + orégano. Proteína + grasas buenas desde temprano.',
        ingredients: ['Pan de centeno', 'Huevo', 'Palta', 'Tomate cherry', 'Orégano'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥜',
        name: 'Trail mix antiinflamatorio casero',
        time: '1 min',
        description:
          'Mix preparado: nueces + almendras + semillas de calabaza + coco rallado + chips de chocolate 85%. Porción: 1 puñado. Llevalo siempre en la cartera.',
        ingredients: ['Nueces', 'Almendras', 'Semillas de calabaza', 'Coco rallado', 'Chocolate 85%'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Ensalada césar antiinflamatoria',
        time: '15 min',
        description:
          'Hojas verdes + pollo grillado + palta (reemplaza el queso parmesano) + huevo duro + semillas. Aderezo: yogur natural + limón + mostaza + ajo. Sin crutones.',
        ingredients: ['Hojas verdes', 'Pollo', 'Palta', 'Huevo', 'Semillas', 'Yogur natural', 'Limón', 'Mostaza', 'Ajo'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍎',
        name: 'Rodajas de manzana con tahini',
        time: '2 min',
        description:
          'Manzana en rodajas finas con 1 cucharada de tahini y una pizca de sal. Nuevo favorito dulce-salado sin inflamación.',
        ingredients: ['Manzana', 'Tahini', 'Sal'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Omelette de hongos y espinaca',
        time: '12 min',
        description:
          '3 huevos batidos con champiñones salteados, espinaca y cebolla de verdeo. Cocinar a fuego bajo. Servir con ensalada verde. Cena rápida, liviana y alta en proteína.',
        ingredients: ['Huevos', 'Champiñones', 'Espinaca', 'Cebolla de verdeo', 'Ensalada verde'],
      },
    ],
    tip: 'Los mejores snacks anti-hinchazón: fruta + grasa buena (manzana + almendras), vegetal + hummus, o kéfir + semillas. Evitá barritas, galletitas y snacks de paquete.',
    requiresUpsell: true,
  },
  {
    day: 28,
    title: 'Tu plan de emergencia',
    subtitle: 'Qué hacer cuando te pasaste de largo',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Smoothie de rescate digestivo',
        time: '5 min',
        description:
          'Ananá + jengibre + espinaca + limón + chía + agua. Este es tu smoothie de "día después" cuando sentís hinchazón por excesos. Las enzimas + el jengibre resetean tu digestión.',
        ingredients: ['Ananá', 'Jengibre', 'Espinaca', 'Limón', 'Chía'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🍵',
        name: 'Té de jengibre fuerte + limón',
        time: '5 min',
        description:
          'Hervir 3 rodajas gruesas de jengibre 10 min. Exprimir ½ limón. Tomar caliente, despacio. El remedio exprés post-exceso más efectivo.',
        ingredients: ['Jengibre fresco', 'Limón'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🥗',
        name: 'Ensalada depurativa de hojas verdes',
        time: '10 min',
        description:
          'Rúcula + espinaca + pepino + apio + palta + semillas de girasol. Solo aceite de oliva + limón. Mínimo procesamiento, máxima frescura. Tu almuerzo post-excesos.',
        ingredients: ['Rúcula', 'Espinaca', 'Pepino', 'Apio', 'Palta', 'Semillas de girasol', 'Aceite de oliva', 'Limón'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🥝',
        name: 'Papaya o kiwi (enzimas de rescate)',
        time: '2 min',
        description:
          'Papaya fresca (papaína) o kiwi (actinidina). Las enzimas naturales aceleran la digestión estancada. Comé 1 taza entera.',
        ingredients: ['Papaya o kiwi'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Caldo depurativo con jengibre',
        time: '15 min',
        description:
          'Caldo de verduras casero + jengibre + cúrcuma + pimienta. Tomá 2 tazas. Sin sólidos pesados. Tu intestino necesita descanso, no más trabajo. Mañana volvés al plan normal.',
        ingredients: ['Caldo de verduras', 'Jengibre', 'Cúrcuma', 'Pimienta'],
      },
    ],
    tip: 'Plan de emergencia post-exceso: día siguiente = smoothie enzimático + ensalada liviana + caldo. Nada de culpa. Un día no arruina 4 semanas. Volvé al plan y listo.',
    requiresUpsell: true,
  },
  {
    day: 29,
    title: 'Suplementación inteligente',
    subtitle: 'Qué suplementos ayudan (y cuáles son marketing)',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Bowl de yogur con semillas y cúrcuma',
        time: '5 min',
        description:
          'Yogur natural + semillas de lino + chía + cúrcuma + pimienta negra + frutas frescas. Si sumás un probiótico en cápsula, tomalo con este desayuno.',
        ingredients: ['Yogur natural', 'Lino', 'Chía', 'Cúrcuma', 'Pimienta negra', 'Frutas frescas'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥜',
        name: 'Nueces de Brasil + fruta',
        time: '1 min',
        description:
          '3 nueces de Brasil (selenio) + 1 fruta de temporada. Mineral esencial para tiroides y sistema inmune.',
        ingredients: ['Nueces de Brasil', 'Fruta de temporada'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Caballa al horno con vegetales y arroz integral',
        time: '22 min',
        description:
          'Caballa (pescado azul económico, alto en omega 3) al horno con tomate cherry, aceitunas y ajo. Arroz integral + espinaca salteada. Omega 3 real, mejor que cualquier cápsula.',
        ingredients: ['Caballa', 'Tomate cherry', 'Aceitunas', 'Ajo', 'Arroz integral', 'Espinaca'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍵',
        name: 'Té verde matcha + almendras',
        time: '3 min',
        description:
          '½ cdita de matcha en agua caliente (batir con mini batidor). 6 almendras. Catequinas concentradas + vitamina E. Antioxidante potente.',
        ingredients: ['Matcha', 'Almendras'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Sopa de miso con tofu y algas',
        time: '12 min',
        description:
          'Caldo + miso + tofu + alga wakame + cebolla de verdeo. El miso aporta probióticos, el alga aporta yodo y minerales. Cena liviana y medicinal.',
        ingredients: ['Miso', 'Tofu', 'Alga wakame', 'Cebolla de verdeo'],
      },
    ],
    tip: 'Los 3 suplementos que sí valen la pena: probiótico de calidad (multi-cepa), omega 3 (si no comés pescado 3x/semana) y magnesio glicinato (antes de dormir). El resto es opcional.',
    requiresUpsell: true,
  },
  {
    day: 30,
    title: '¡Lo lograste! Tu nuevo estilo de vida',
    subtitle: '30 días de transformación digestiva completados',
    meals: [
      {
        moment: 'Desayuno',
        emoji: '🌅',
        name: 'Brunch de celebración antiinflamatorio',
        time: '15 min',
        description:
          'Pancakes de avena y banana + huevo pochado + palta + frutos rojos + café o té verde. Celebrá 30 días de cuidado con la mejor versión de tu desayuno favorito. Te lo ganaste.',
        ingredients: ['Avena', 'Banana', 'Huevos', 'Palta', 'Frutos rojos', 'Café/Té verde'],
      },
      {
        moment: 'Snack mañana',
        emoji: '🥛',
        name: 'Smoothie de kéfir con todo',
        time: '5 min',
        description:
          'Kéfir + banana + frutos rojos + espinaca + chía + lino + jengibre. Tu smoothie ALL-STAR con todos los antiinflamatorios del plan en un vaso.',
        ingredients: ['Kéfir', 'Banana', 'Frutos rojos', 'Espinaca', 'Chía', 'Lino', 'Jengibre'],
      },
      {
        moment: 'Almuerzo',
        emoji: '🐟',
        name: 'Tu plato favorito del plan (el que más te gustó)',
        time: '25 min',
        description:
          'Hoy elegís vos. ¿Cuál fue tu comida preferida de estos 30 días? Preparala con cariño. Puede ser el bowl de salmón, el curry de pollo, las lentejas, lo que sea. Hoy cocinás tu favorito.',
        ingredients: ['A tu elección del plan'],
      },
      {
        moment: 'Snack tarde',
        emoji: '🍫',
        name: 'Chocolate 85% + nueces de Brasil + té verde',
        time: '3 min',
        description:
          '3 cuadraditos de chocolate 85% + 2 nueces de Brasil + té verde. El snack más antiinflamatorio posible. Premio de cierre.',
        ingredients: ['Chocolate 85%', 'Nueces de Brasil', 'Té verde'],
      },
      {
        moment: 'Cena',
        emoji: '🌙',
        name: 'Crema de calabaza y jengibre (como el día 1)',
        time: '20 min',
        description:
          'La misma crema de calabaza con jengibre del día 1. Cerrá el ciclo donde empezaste. Pero ahora notá la diferencia: cómo la sentís, cómo la digerís, cómo te vas a dormir. Eso es progreso real.',
        ingredients: ['Calabaza', 'Jengibre', 'Ajo', 'Caldo', 'Huevo pochado', 'Perejil'],
      },
    ],
    tip: '30 días. Lo hiciste. Tu microbiota es otra, tu relación con la comida es otra. De acá en adelante: 80% plan, 20% vida real. Y si algún día te pasás, ya sabés: smoothie de rescate al día siguiente y seguís.',
    requiresUpsell: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// AGUA DE ARROZ EN AYUNAS — el ritual central del Protocolo TURBO
// El VSL del upsell promete que el agua de arroz se toma SIEMPRE en ayunas,
// todos los días. Para garantizar coherencia, se antepone como primer "meal"
// de cada uno de los 30 días, sin tener que repetirlo a mano en cada bloque.
// ═══════════════════════════════════════════════════════════════════════════

const AGUA_DE_ARROZ_EN_AYUNAS: Meal = {
  moment: 'En ayunas',
  emoji: '🍚',
  name: 'Vaso de Agua de Arroz (ritual TURBO)',
  time: '2 min',
  description:
    'Apenas te levantás, antes de cualquier otra cosa, tomá 1 vaso (200 ml) de agua de arroz tibia, despacio. Se prepara con arroz cocido y enfriado en la heladera 12-24 h (así se activa el almidón resistente), reposado en agua dentro de la heladera durante la noche y colado a la mañana; entibialo sin hervir y sumale unas gotas de limón. Importante: el arroz cocido siempre va a la heladera, nunca queda a temperatura ambiente. Es el paso más importante del método: el almidón resistente alimenta tu microbiota, desinflama el intestino y activa el modo TURBO. Tocá "Ver receta completa" para el paso a paso seguro.',
  ingredients: ['Arroz blanco', 'Agua purificada', 'Limón'],
  link: { href: RICE_WATER_PATH, label: 'Ver receta completa y segura' },
};

/**
 * PLAN_DATA — los 30 días, cada uno con el Agua de Arroz en ayunas al inicio.
 * Es lo que consumen las páginas del plan (índice y detalle por día).
 */
export const PLAN_DATA: DayPlan[] = PLAN_DAYS_BASE.map((day) => ({
  ...day,
  meals: [AGUA_DE_ARROZ_EN_AYUNAS, ...day.meals],
}));
