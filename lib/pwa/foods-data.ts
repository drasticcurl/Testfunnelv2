// lib/pwa/foods-data.ts — Contenido de alimentos inflamatorios y antiinflamatorios

export type InflammatoryFood = {
  name: string;
  emoji: string;
  reason: string;
  alternative: string;
};

export type AntiInflammatoryFood = {
  name: string;
  emoji: string;
  benefit: string;
  howToUse: string;
};

export const INFLAMMATORY_FOODS: InflammatoryFood[] = [
  {
    name: 'Lácteos enteros y quesos duros',
    emoji: '🧀',
    reason: 'La lactosa fermenta en el intestino y produce gas. Las grasas saturadas alimentan bacterias proinflamatorias.',
    alternative: 'Kéfir, yogur natural sin azúcar o leche de almendras/avena sin azúcar agregada.',
  },
  {
    name: 'Gluten en exceso (pan blanco, facturas, galletitas)',
    emoji: '🍞',
    reason: 'Aumenta la permeabilidad intestinal en personas sensibles. No hace falta ser celíaca para sentirlo.',
    alternative: 'Pan de masa madre 100%, pan de centeno integral o tostadas de arroz.',
  },
  {
    name: 'Ultraprocesados (snacks de bolsa)',
    emoji: '🥨',
    reason: 'Aditivos, emulsionantes y conservantes alteran la microbiota en menos de 72 horas.',
    alternative: 'Frutos secos naturales, bastones de zanahoria con hummus o frutas frescas.',
  },
  {
    name: 'Edulcorantes artificiales (sucralosa, aspartamo)',
    emoji: '🧪',
    reason: 'Modifican las bacterias intestinales y disparan distensión en horas.',
    alternative: 'Miel cruda en pequeñas cantidades, stevia de hoja real o fruta madura para endulzar.',
  },
  {
    name: 'Harinas refinadas',
    emoji: '🥐',
    reason: 'Pico de glucosa → pico de insulina → más inflamación sistémica. Cero fibra, cero nutrientes.',
    alternative: 'Harina de almendras, avena integral o quinoa como base de tus comidas.',
  },
  {
    name: 'Embutidos y fiambres',
    emoji: '🥓',
    reason: 'Nitritos + sodio + grasas saturadas. Triple combo inflamatorio que irrita la mucosa.',
    alternative: 'Pollo a la plancha desmenuzado, huevo duro o hummus como relleno de sándwich.',
  },
  {
    name: 'Alcohol',
    emoji: '🍷',
    reason: 'Irrita la mucosa gástrica y altera la microbiota. Hasta una copa cuenta durante estos 7 días.',
    alternative: 'Agua con gas + limón + jengibre. Kombucha sin azúcar. Té helado casero.',
  },
  {
    name: 'Gaseosas (incluso light)',
    emoji: '🥤',
    reason: 'Gas + edulcorantes + acidez. La hinchazón es inmediata y la inflamación se acumula.',
    alternative: 'Agua con rodajas de pepino y menta. Té verde frío. Agua de coco natural.',
  },
  {
    name: 'Frituras y aceites recalentados',
    emoji: '🍟',
    reason: 'Generan compuestos oxidados que inflaman a nivel celular y sobrecargan el hígado.',
    alternative: 'Cocciones al horno, plancha, vapor o salteados rápidos con aceite de oliva virgen.',
  },
  {
    name: 'Soja procesada',
    emoji: '🫘',
    reason: 'No es la soja en sí, es lo que le agregan. Lectinas + aislados proteicos + aditivos industriales.',
    alternative: 'Tofu firme orgánico, tempeh o edamame al natural (formas fermentadas o enteras).',
  },
  {
    name: 'Exceso de cafeína (más de 3 tazas)',
    emoji: '☕',
    reason: 'Estresa la mucosa intestinal y dispara cortisol, que ralentiza la digestión.',
    alternative: 'Máximo 1-2 cafés por día. Reemplazá el resto por té verde o infusión de jengibre.',
  },
  {
    name: 'Exceso de sal y caldos en cubo',
    emoji: '🧂',
    reason: 'Retención de líquidos e hinchazón generalizada. Los cubitos traen glutamato y aditivos.',
    alternative: 'Sal marina en cantidad moderada, hierbas frescas, limón y especias para condimentar.',
  },
  {
    name: 'Azúcar refinada y jarabe de maíz',
    emoji: '🍬',
    reason: 'Alimenta bacterias patógenas, dispara inflamación sistémica y altera la microbiota en horas. Está oculta en jugos envasados, cereales comerciales y golosinas.',
    alternative: 'Fruta fresca para lo dulce, miel cruda o dátiles en cantidades pequeñas.',
  },
  {
    name: 'Alimentos fermentables sin preparación adecuada',
    emoji: '🫛',
    reason: 'Legumbres sin remojo y crucíferas crudas en grandes cantidades generan gases excesivos al fermentar sin control en el intestino.',
    alternative: 'Remojar legumbres 12h con bicarbonato. Cocinar bien las crucíferas o comerlas en porciones chicas.',
  },
];

export const ANTI_INFLAMMATORY_FOODS: AntiInflammatoryFood[] = [
  {
    name: 'Jengibre',
    emoji: '🫚',
    benefit: 'Acelera el vaciado gástrico y reduce la sensación de distensión en menos de 30 minutos.',
    howToUse: 'Rallá 1 cm en tus infusiones, smoothies o sopas. También funciona en rodajas hervidas como té.',
  },
  {
    name: 'Cúrcuma',
    emoji: '🟡',
    benefit: 'Antiinflamatorio natural. Su curcumina calma la mucosa intestinal directamente.',
    howToUse: 'Agregá ¼ cdita a yogur, sopas o huevos. Siempre con pimienta negra (multiplica absorción x20).',
  },
  {
    name: 'Palta / aguacate',
    emoji: '🥑',
    benefit: 'Grasas monoinsaturadas que nutren bacterias amigas. Saciedad real sin inflamar.',
    howToUse: 'Media palta al día: en tostadas, bowls, ensaladas o como reemplazo de manteca.',
  },
  {
    name: 'Salmón (o sardinas/caballa)',
    emoji: '🐟',
    benefit: 'Omega 3 EPA y DHA. Bajan la inflamación a nivel sistémico y protegen la mucosa.',
    howToUse: '2-3 veces por semana a la plancha con limón. Las sardinas en lata son igual de buenas.',
  },
  {
    name: 'Kiwi',
    emoji: '🥝',
    benefit: 'Su enzima actinidina mejora la digestión de proteínas y combate el estreñimiento naturalmente.',
    howToUse: '1 kiwi al día con el desayuno o como snack. Mejor maduro y a temperatura ambiente.',
  },
  {
    name: 'Papaya / mamón',
    emoji: '🍈',
    benefit: 'Papaína: enzima digestiva natural que descompone proteínas y reduce la hinchazón post-comida.',
    howToUse: 'Una rodaja en ayunas cambia tu mañana. Si no conseguís, reemplazá por ananá.',
  },
  {
    name: 'Ananá / piña',
    emoji: '🍍',
    benefit: 'Bromelina: otra enzima potente que reduce inflamación intestinal y mejora la digestión.',
    howToUse: 'En cubos como snack, en smoothies o como postre después del almuerzo.',
  },
  {
    name: 'Hojas verdes (espinaca, rúcula, kale)',
    emoji: '🥬',
    benefit: 'Magnesio + clorofila + fibra suave. Antiretención y alimentan tu microbiota.',
    howToUse: 'Base de tus ensaladas y bowls. 2 puñados grandes por día. Crudas o salteadas 1 minuto.',
  },
  {
    name: 'Kéfir (leche o agua)',
    emoji: '🥛',
    benefit: 'Probiótico real con más de 30 cepas. Repobla la microbiota mejor que cualquier yogur comercial.',
    howToUse: '200ml por día, en ayunas o con el desayuno. El de agua es ideal si no tolerás lácteos.',
  },
  {
    name: 'Yogur natural sin azúcar',
    emoji: '🍶',
    benefit: 'Probióticos vivos si la etiqueta dice solo "leche + cultivos". Mejora la flora sin inflamar.',
    howToUse: 'Como base de desayunos con frutas y semillas. Evitá los que tienen azúcar o saborizantes.',
  },
  {
    name: 'Nueces',
    emoji: '🌰',
    benefit: 'Omega 3 vegetal y polifenoles antiinflamatorios. Mejoran la diversidad de tu microbiota.',
    howToUse: 'Un puñado (5-7 unidades) por día como snack o picadas sobre ensaladas y bowls.',
  },
  {
    name: 'Chía',
    emoji: '🫘',
    benefit: 'Fibra soluble que forma un gel protector de la mucosa y mejora el tránsito intestinal.',
    howToUse: '1 cucharada en yogur, smoothies o agua con limón. Dejala hidratar 10 min antes.',
  },
  {
    name: 'Lino / linaza molida',
    emoji: '🌾',
    benefit: 'Lignanos antiinflamatorios + omega 3 vegetal. Se absorben mucho mejor molida que entera.',
    howToUse: '1 cucharadita sobre avena, ensaladas o yogur. Guardala en la heladera una vez molida.',
  },
  {
    name: 'Té verde',
    emoji: '🍵',
    benefit: 'Catequinas (EGCG): potente antiinflamatorio que protege la mucosa intestinal.',
    howToUse: 'Reemplazá tu segundo café del día por un té verde. Funciona caliente o frío.',
  },
  {
    name: 'Agua tibia con limón',
    emoji: '🍋',
    benefit: 'Estimula la producción de bilis y prepara el sistema digestivo para el día.',
    howToUse: 'Primera cosa de la mañana, antes de cualquier alimento. Agua tibia (no hirviendo) + ½ limón.',
  },
  {
    name: 'Banana',
    emoji: '🍌',
    benefit: 'Prebiótico natural que alimenta bacterias buenas (fructooligosacáridos). Suave y fácil de digerir.',
    howToUse: 'Como snack, en smoothies o rodajas sobre avena. Mejor no demasiado verde (puede dar gases).',
  },
  {
    name: 'Ajo',
    emoji: '🧄',
    benefit: 'Alicina: antimicrobiano natural que equilibra la microbiota y reduce bacterias patógenas.',
    howToUse: '1-2 dientes por día en cocciones. Picalo y dejalo reposar 10 min antes de cocinar para activar la alicina.',
  },
  {
    name: 'Caldo de huesos',
    emoji: '🍲',
    benefit: 'Glutamina + colágeno + glicina: los tres reparadores más potentes para la mucosa intestinal.',
    howToUse: '1 taza en ayunas o como base de sopas. Cocción lenta de huesos (12-24h) con vinagre de manzana.',
  },
  {
    name: 'Manzana verde',
    emoji: '🍏',
    benefit: 'Pectina: fibra soluble que calma la inflamación y alimenta las bacterias beneficiosas.',
    howToUse: 'Como snack con almendras, asada con canela o rallada sobre la avena del desayuno.',
  },
  {
    name: 'Pepino',
    emoji: '🥒',
    benefit: 'Hidratante natural + antiretención. Bajísimo en FODMAPs, así que no genera gases.',
    howToUse: 'En ensaladas, en agua saborizada o como bastones para dippear con hummus.',
  },
  {
    name: 'Semillas de calabaza',
    emoji: '🎃',
    benefit: 'Zinc + magnesio: los 2 minerales clave para la integridad intestinal y la función enzimática.',
    howToUse: '1 puñado (30g) como snack, sobre ensaladas o en yogur. Tostadas en sartén quedan riquísimas.',
  },
];
