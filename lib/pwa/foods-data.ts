// lib/pwa/foods-data.ts — Contenido de alimentos inflamatorios y antiinflamatorios
//
// Revisado con evidencia (2024-2025):
//  - Alimentos antiinflamatorios y patrón mediterráneo: Harvard Health.
//  - Mecanismo FODMAP de la hinchazón (fermentación + arrastre de agua → gas):
//    Monash FODMAP, Harvard Health, MedlinePlus.
//  - Fibra/almidón resistente → AGCC/butirato → barrera intestinal: NIH/PMC, MDPI.
// Las fuentes completas se citan al pie de cada guía (componente GuideSources).

export type FoodMechanism =
  | 'Proinflamatorio'
  | 'FODMAP (fermenta)'
  | 'Irritante de la mucosa'
  | 'Retención de líquidos'
  | 'Aditivos / procesado';

export type InflammatoryFood = {
  name: string;
  emoji: string;
  /** Por qué molesta, clasificado por mecanismo principal. */
  mechanism: FoodMechanism;
  reason: string;
  alternative: string;
};

export type AntiInflammatoryFood = {
  name: string;
  emoji: string;
  /** Compuesto/principio activo principal (lo que lo hace funcionar). */
  compound: string;
  benefit: string;
  howToUse: string;
};

/** Intro educativa de la guía de inflamatorios. */
export const INFLAMMATORY_INTRO = `Hay dos motivos distintos por los que un alimento te puede caer mal: porque favorece la inflamación de bajo grado (grasas saturadas, ultraprocesados, azúcar) o porque fermenta en el intestino y produce gas (los FODMAPs: lactosa, fructanos del trigo/cebolla/ajo, legumbres, polioles). Por eso al lado de cada uno te marcamos su mecanismo. No los demonices: sacalos estos 7 días y observá tu cambio.`;

export const INFLAMMATORY_FOODS: InflammatoryFood[] = [
  {
    name: 'Lácteos enteros y quesos duros',
    emoji: '🧀',
    mechanism: 'FODMAP (fermenta)',
    reason: 'La lactosa es un FODMAP: si no la digerís bien, fermenta en el intestino y produce gas y distensión. Las grasas saturadas, además, favorecen la inflamación.',
    alternative: 'Kéfir o yogur natural (tienen menos lactosa por fermentación), o leches de almendras/avena sin azúcar. Quesos madurados duros suelen tener muy poca lactosa.',
  },
  {
    name: 'Trigo refinado (pan blanco, facturas, galletitas)',
    emoji: '🍞',
    mechanism: 'FODMAP (fermenta)',
    reason: 'El trigo es alto en fructanos (un FODMAP): para la mayoría, esa fermentación —más que el gluten en sí— es la que hincha. En personas sensibles, además aumenta la permeabilidad intestinal.',
    alternative: 'Pan de masa madre de fermentación larga (menos fructanos), pan de centeno integral o tostadas de arroz.',
  },
  {
    name: 'Ultraprocesados (snacks de paquete)',
    emoji: '🥨',
    mechanism: 'Aditivos / procesado',
    reason: 'Los emulsionantes y aditivos pueden alterar la microbiota y la capa de moco intestinal, favoreciendo la inflamación. Aportan poco más que calorías vacías.',
    alternative: 'Frutos secos naturales, bastones de zanahoria con hummus o fruta fresca.',
  },
  {
    name: 'Edulcorantes y polioles (sorbitol, manitol, xilitol)',
    emoji: '🧪',
    mechanism: 'FODMAP (fermenta)',
    reason: 'Los polioles son FODMAPs: se absorben mal y fermentan, dando gas y a veces efecto laxante. Están en chicles "sin azúcar", caramelos light y productos diet.',
    alternative: 'Cantidades chicas de miel cruda, fruta madura para endulzar, o stevia de hoja real.',
  },
  {
    name: 'Harinas refinadas',
    emoji: '🥐',
    mechanism: 'Proinflamatorio',
    reason: 'Pico de glucosa e insulina y casi nada de fibra. Picos repetidos se asocian a más inflamación de bajo grado.',
    alternative: 'Avena integral, quinoa o harina de almendras como base de tus comidas.',
  },
  {
    name: 'Embutidos y fiambres',
    emoji: '🥓',
    mechanism: 'Proinflamatorio',
    reason: 'Carnes procesadas: grasas saturadas + sodio + nitritos. Las carnes rojas y procesadas se asocian a mayor producción de compuestos proinflamatorios.',
    alternative: 'Pollo a la plancha desmenuzado, huevo duro o hummus como relleno.',
  },
  {
    name: 'Alcohol',
    emoji: '🍷',
    mechanism: 'Irritante de la mucosa',
    reason: 'Irrita la mucosa digestiva y altera la microbiota. Durante estos 7 días, hasta una copa cuenta.',
    alternative: 'Agua con gas + limón + jengibre, o té helado casero sin azúcar.',
  },
  {
    name: 'Gaseosas (incluso light)',
    emoji: '🥤',
    mechanism: 'FODMAP (fermenta)',
    reason: 'Doble golpe: el gas distiende directamente y los edulcorantes/polioles fermentan. La hinchazón suele ser inmediata.',
    alternative: 'Agua con rodajas de pepino y menta, o agua de coco natural.',
  },
  {
    name: 'Frituras y aceites recalentados',
    emoji: '🍟',
    mechanism: 'Proinflamatorio',
    reason: 'Las grasas oxidadas por el recalentado generan compuestos que inflaman a nivel celular y sobrecargan la digestión.',
    alternative: 'Horno, plancha, vapor o salteados rápidos con aceite de oliva virgen.',
  },
  {
    name: 'Legumbres y crucíferas mal preparadas',
    emoji: '🫘',
    mechanism: 'FODMAP (fermenta)',
    reason: 'Las legumbres (GOS) y las crucíferas crudas en cantidad fermentan y dan gases. El problema no es el alimento: es la cantidad y la preparación.',
    alternative: 'Remojá las legumbres 12 h y cocinalas bien; empezá con porciones chicas. Cociná las crucíferas (mejor toleradas que crudas).',
  },
  {
    name: 'Exceso de cafeína (más de 2-3 tazas)',
    emoji: '☕',
    mechanism: 'Irritante de la mucosa',
    reason: 'En exceso estimula de más la motilidad y la secreción ácida, y eleva el cortisol, que enlentece la digestión.',
    alternative: 'Máximo 1-2 cafés por día; reemplazá el resto por té verde o infusión de jengibre.',
  },
  {
    name: 'Exceso de sal y caldos en cubo',
    emoji: '🧂',
    mechanism: 'Retención de líquidos',
    reason: 'El sodio en exceso retiene líquidos e hincha. Los cubitos suman glutamato y aditivos.',
    alternative: 'Sal marina con moderación, hierbas frescas, limón y especias. Caldo casero en lugar de cubo.',
  },
  {
    name: 'Azúcar refinada y jarabe de maíz',
    emoji: '🍬',
    mechanism: 'Proinflamatorio',
    reason: 'Favorece bacterias menos beneficiosas y la inflamación de bajo grado. Está oculta en jugos envasados, cereales y golosinas.',
    alternative: 'Fruta fresca para lo dulce, o miel cruda y dátiles en cantidades pequeñas.',
  },
  {
    name: 'Exceso de fructosa (jugos, miel en cantidad, frutas muy dulces juntas)',
    emoji: '🍯',
    mechanism: 'FODMAP (fermenta)',
    reason: 'En exceso, la fructosa se absorbe mal y fermenta (es un FODMAP). Un vaso de jugo concentra la fructosa de varias frutas sin su fibra.',
    alternative: 'Comé la fruta entera (con su fibra) y de a una porción. Mejor manzana, kiwi o frutos rojos que jugos.',
  },
];

/** Intro educativa de la guía de antiinflamatorios. */
export const ANTI_INFLAMMATORY_INTRO = `Estos alimentos trabajan por tres vías: aportan polifenoles y omega-3 que bajan la inflamación (la base del patrón mediterráneo), enzimas que mejoran la digestión, y fibra/almidón resistente que tus bacterias convierten en butirato —un compuesto que nutre y protege la pared del intestino. Al lado de cada uno te marcamos su principio activo.`;

export const ANTI_INFLAMMATORY_FOODS: AntiInflammatoryFood[] = [
  {
    name: 'Jengibre',
    emoji: '🫚',
    compound: 'Gingeroles',
    benefit: 'Acelera el vaciado gástrico y ayuda con la dispepsia y la sensación de pesadez después de comer.',
    howToUse: 'Rallá 1 cm en infusiones, sopas o smoothies. También en rodajas hervidas como té.',
  },
  {
    name: 'Cúrcuma',
    emoji: '🟡',
    compound: 'Curcumina',
    benefit: 'La curcumina modula vías inflamatorias. Ojo: sola se absorbe muy poco; la pimienta negra multiplica su biodisponibilidad.',
    howToUse: 'Agregá ¼ cdita a yogur, sopas o huevos, SIEMPRE con pimienta negra y algo de grasa (mejora la absorción).',
  },
  {
    name: 'Palta / aguacate',
    emoji: '🥑',
    compound: 'Grasas monoinsaturadas',
    benefit: 'Grasas buenas + fibra que dan saciedad real y nutren bacterias amigas, sin hinchar.',
    howToUse: 'Media palta al día: en tostadas, bowls o como reemplazo de manteca.',
  },
  {
    name: 'Salmón (o sardinas / caballa)',
    emoji: '🐟',
    compound: 'Omega-3 EPA y DHA',
    benefit: 'Los omega-3 EPA y DHA son de los antiinflamatorios alimentarios más respaldados por la evidencia.',
    howToUse: '2-3 veces por semana a la plancha con limón. Las sardinas en lata son igual de válidas y baratas.',
  },
  {
    name: 'Kiwi',
    emoji: '🥝',
    compound: 'Actinidina (enzima)',
    benefit: 'Su enzima actinidina ayuda a digerir proteínas y mejora el tránsito (útil si tendés al estreñimiento).',
    howToUse: '1 kiwi al día, mejor maduro y a temperatura ambiente.',
  },
  {
    name: 'Papaya / mamón',
    emoji: '🍈',
    compound: 'Papaína (enzima)',
    benefit: 'Enzima digestiva que ayuda a descomponer proteínas y a reducir la pesadez post-comida.',
    howToUse: 'Una rodaja en ayunas. Si no conseguís, reemplazá por ananá.',
  },
  {
    name: 'Ananá / piña',
    emoji: '🍍',
    compound: 'Bromelina (enzima)',
    benefit: 'La bromelina ayuda a la digestión de proteínas y tiene efecto antiinflamatorio.',
    howToUse: 'En cubos como snack o postre después del almuerzo.',
  },
  {
    name: 'Hojas verdes (espinaca, rúcula, kale)',
    emoji: '🥬',
    compound: 'Polifenoles + magnesio',
    benefit: 'Verdura de hoja rica en polifenoles antiinflamatorios, magnesio y fibra suave. Pilar del patrón mediterráneo.',
    howToUse: 'Base de ensaladas y bowls: 2 puñados por día, crudas o salteadas 1 minuto.',
  },
  {
    name: 'Kéfir (de leche o de agua)',
    emoji: '🥛',
    compound: 'Probióticos (multicepa)',
    benefit: 'Fermentado con muchas cepas vivas: aporta probióticos para diversificar la microbiota.',
    howToUse: '~200 ml por día, en ayunas o con el desayuno. El de agua va si no tolerás lácteos.',
  },
  {
    name: 'Yogur natural sin azúcar',
    emoji: '🍶',
    compound: 'Probióticos',
    benefit: 'Si la etiqueta dice solo "leche + cultivos", aporta bacterias vivas. La fermentación baja su lactosa.',
    howToUse: 'Base de desayunos con fruta y semillas. Evitá los azucarados o saborizados.',
  },
  {
    name: 'Nueces',
    emoji: '🌰',
    compound: 'Omega-3 vegetal (ALA) + polifenoles',
    benefit: 'Omega-3 vegetal y polifenoles que mejoran la diversidad de la microbiota.',
    howToUse: 'Un puñado (5-7) por día como snack o sobre ensaladas.',
  },
  {
    name: 'Chía',
    emoji: '🫘',
    compound: 'Fibra soluble + ALA',
    benefit: 'Fibra soluble que forma un gel, mejora el tránsito y alimenta bacterias productoras de butirato.',
    howToUse: '1 cda en yogur, smoothies o agua. Dejala hidratar 10 min antes.',
  },
  {
    name: 'Lino / linaza molida',
    emoji: '🌾',
    compound: 'Lignanos + ALA',
    benefit: 'Lignanos antiinflamatorios y omega-3 vegetal. Se aprovecha mucho mejor molida que entera.',
    howToUse: '1 cdita sobre avena, ensaladas o yogur. Guardala en la heladera una vez molida.',
  },
  {
    name: 'Té verde',
    emoji: '🍵',
    compound: 'Catequinas (EGCG)',
    benefit: 'Polifenoles (EGCG) con efecto antiinflamatorio y antioxidante.',
    howToUse: 'Reemplazá tu segundo café por un té verde. Caliente o frío.',
  },
  {
    name: 'Agua tibia con limón',
    emoji: '🍋',
    compound: 'Hidratación + vitamina C',
    benefit: 'Hidrata al despertar y suma un gesto suave para arrancar el día (la hidratación ayuda al tránsito).',
    howToUse: 'Primera cosa de la mañana: agua tibia (no hirviendo) + ½ limón.',
  },
  {
    name: 'Banana',
    emoji: '🍌',
    compound: 'Prebióticos (fructooligosacáridos)',
    benefit: 'Prebiótico que alimenta bacterias buenas. Mejor algo madura pero no en exceso (muy verde puede dar gases).',
    howToUse: 'Como snack, en smoothies o sobre la avena.',
  },
  {
    name: 'Ajo',
    emoji: '🧄',
    compound: 'Alicina',
    benefit: 'La alicina tiene efecto antimicrobiano. (Es alto en fructanos: si te hincha, usá poca cantidad o aceite de ajo.)',
    howToUse: '1-2 dientes por día en cocciones. Picalo y dejalo reposar 10 min antes de cocinar para activar la alicina.',
  },
  {
    name: 'Caldo de huesos',
    emoji: '🍲',
    compound: 'Glutamina + colágeno + glicina',
    benefit: 'Aporta glutamina y glicina, nutrientes que se estudian por su rol en la barrera intestinal.',
    howToUse: '1 taza en ayunas o como base de sopas. Cocción lenta (12-24 h) con un chorrito de vinagre de manzana.',
  },
  {
    name: 'Manzana verde',
    emoji: '🍏',
    compound: 'Pectina (fibra soluble)',
    benefit: 'La pectina alimenta bacterias beneficiosas. (Cocida o rallada se tolera mejor que cruda en cantidad.)',
    howToUse: 'Como snack con almendras, asada con canela o rallada sobre la avena.',
  },
  {
    name: 'Pepino',
    emoji: '🥒',
    compound: 'Agua + bajo en FODMAP',
    benefit: 'Hidratante, refrescante y bajo en FODMAPs: no genera gases, ideal contra la retención.',
    howToUse: 'En ensaladas, en agua saborizada o en bastones para dippear con hummus.',
  },
  {
    name: 'Semillas de calabaza',
    emoji: '🎃',
    compound: 'Zinc + magnesio',
    benefit: 'Zinc y magnesio, dos minerales clave para las enzimas digestivas y la función intestinal.',
    howToUse: 'Un puñado (30 g) como snack, sobre ensaladas o en yogur. Quedan ricas tostadas en sartén.',
  },
];
