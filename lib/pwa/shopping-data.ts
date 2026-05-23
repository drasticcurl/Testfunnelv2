// lib/pwa/shopping-data.ts — Shopping list data for 4 weeks

export type ShoppingCategory =
  | 'verduras'
  | 'frutas'
  | 'proteinas'
  | 'lacteos'
  | 'despensa'
  | 'especias'
  | 'bebidas';

export type ShoppingItem = {
  id: string;
  name: string;
  category: ShoppingCategory;
};

export type WeekData = {
  weekNumber: number;
  label: string;
  items: ShoppingItem[];
};

const CATEGORIES_META: Record<ShoppingCategory, { label: string; emoji: string }> = {
  verduras: { label: 'Verduras', emoji: '🥬' },
  frutas: { label: 'Frutas', emoji: '🍎' },
  proteinas: { label: 'Proteínas', emoji: '🍗' },
  lacteos: { label: 'Lácteos OK', emoji: '🥛' },
  despensa: { label: 'Despensa', emoji: '🌾' },
  especias: { label: 'Especias y condimentos', emoji: '🌿' },
  bebidas: { label: 'Bebidas', emoji: '🥤' },
};

export function getCategoryMeta(category: ShoppingCategory) {
  return CATEGORIES_META[category];
}

export function getAllCategories(): ShoppingCategory[] {
  return ['verduras', 'frutas', 'proteinas', 'lacteos', 'despensa', 'especias', 'bebidas'];
}



// ═══════════════════════════════════════════════════════════
// SEMANA 1 — Exacta del PDF Protocolo 7 Días (Página 14)
// ═══════════════════════════════════════════════════════════

const WEEK_1: ShoppingItem[] = [
  // Verduras
  { id: 'w1-v01', name: 'Espinaca (2 atados o 2 bolsas baby)', category: 'verduras' },
  { id: 'w1-v02', name: 'Rúcula (1 atado)', category: 'verduras' },
  { id: 'w1-v03', name: 'Acelga (1 atado, opcional reemplaza espinaca)', category: 'verduras' },
  { id: 'w1-v04', name: 'Lechuga mantecosa (1 planta)', category: 'verduras' },
  { id: 'w1-v05', name: 'Brócoli (2 unidades)', category: 'verduras' },
  { id: 'w1-v06', name: 'Zucchini / calabacín (4 unidades)', category: 'verduras' },
  { id: 'w1-v07', name: 'Calabaza (1 mediana, tipo butternut o anco)', category: 'verduras' },
  { id: 'w1-v08', name: 'Zanahorias (8 unidades)', category: 'verduras' },
  { id: 'w1-v09', name: 'Tomates (6 unidades)', category: 'verduras' },
  { id: 'w1-v10', name: 'Tomates cherry (1 bandeja)', category: 'verduras' },
  { id: 'w1-v11', name: 'Pepinos (3 unidades)', category: 'verduras' },
  { id: 'w1-v12', name: 'Cebolla común (3 unidades)', category: 'verduras' },
  { id: 'w1-v13', name: 'Cebolla morada (1 unidad)', category: 'verduras' },
  { id: 'w1-v14', name: 'Puerro (1 unidad)', category: 'verduras' },
  { id: 'w1-v15', name: 'Ajo (1 cabeza)', category: 'verduras' },
  { id: 'w1-v16', name: 'Jengibre fresco (1 mano grande)', category: 'verduras' },
  { id: 'w1-v17', name: 'Pimientos rojos (3 unidades)', category: 'verduras' },
  { id: 'w1-v18', name: 'Apio (1 atado)', category: 'verduras' },
  { id: 'w1-v19', name: 'Hongos / champiñones (1 bandeja)', category: 'verduras' },
  { id: 'w1-v20', name: 'Brotes de alfalfa (1 bandeja, opcional)', category: 'verduras' },
  { id: 'w1-v21', name: 'Batata / camote (2 unidades)', category: 'verduras' },
  { id: 'w1-v22', name: 'Perejil + eneldo + romero (atados frescos o secos)', category: 'verduras' },
  // Frutas
  { id: 'w1-f01', name: 'Bananas (5 unidades)', category: 'frutas' },
  { id: 'w1-f02', name: 'Manzanas verdes (4 unidades)', category: 'frutas' },
  { id: 'w1-f03', name: 'Peras (3 unidades)', category: 'frutas' },
  { id: 'w1-f04', name: 'Kiwis (4 unidades)', category: 'frutas' },
  { id: 'w1-f05', name: 'Papaya / mamón (1 unidad mediana, o ananá si no conseguís)', category: 'frutas' },
  { id: 'w1-f06', name: 'Ananá / piña (½ unidad si no usás papaya)', category: 'frutas' },
  { id: 'w1-f07', name: 'Limones (5 unidades)', category: 'frutas' },
  { id: 'w1-f08', name: 'Frutos rojos (1 bolsa congelada de 300g)', category: 'frutas' },
  // Proteínas
  { id: 'w1-p01', name: 'Salmón fresco o congelado (3 filetes)', category: 'proteinas' },
  { id: 'w1-p02', name: 'Pollo (2 pechugas)', category: 'proteinas' },
  { id: 'w1-p03', name: 'Pescado blanco: merluza, lenguado o tilapia (1 filete)', category: 'proteinas' },
  { id: 'w1-p04', name: 'Huevos (1 docena)', category: 'proteinas' },
  { id: 'w1-p05', name: 'Tofu firme (1 bloque, opcional)', category: 'proteinas' },
  { id: 'w1-p06', name: 'Lentejas (1 paquete 500g, o 1 lata)', category: 'proteinas' },
  { id: 'w1-p07', name: 'Garbanzos (1 lata)', category: 'proteinas' },
  // Lácteos OK
  { id: 'w1-l01', name: 'Yogur natural sin azúcar (1 pote 1kg)', category: 'lacteos' },
  { id: 'w1-l02', name: 'Kéfir de leche o de agua (1 botella 1L)', category: 'lacteos' },
  { id: 'w1-l03', name: 'Leche de almendras o avena sin azúcar (1 cartón 1L, opcional)', category: 'lacteos' },
  // Despensa
  { id: 'w1-d01', name: 'Quinoa (1 paquete 500g)', category: 'despensa' },
  { id: 'w1-d02', name: 'Avena tradicional, no instantánea (1 paquete 500g)', category: 'despensa' },
  { id: 'w1-d03', name: 'Arroz integral (1 paquete 500g)', category: 'despensa' },
  { id: 'w1-d04', name: 'Pan de centeno integral o masa madre (1 unidad o 4 rebanadas)', category: 'despensa' },
  { id: 'w1-d05', name: 'Almendras naturales sin sal (1 paquete 200g)', category: 'despensa' },
  { id: 'w1-d06', name: 'Nueces (1 paquete 200g)', category: 'despensa' },
  { id: 'w1-d07', name: 'Nueces de Brasil (5 unidades)', category: 'despensa' },
  { id: 'w1-d08', name: 'Semillas de chía (1 paquete 250g)', category: 'despensa' },
  { id: 'w1-d09', name: 'Lino / linaza molida (1 paquete 250g)', category: 'despensa' },
  { id: 'w1-d10', name: 'Semillas de girasol y sésamo (cantidad chica)', category: 'despensa' },
  { id: 'w1-d11', name: 'Coco rallado sin azúcar (cantidad chica)', category: 'despensa' },
  { id: 'w1-d12', name: 'Tahini (1 frasco)', category: 'despensa' },
  { id: 'w1-d13', name: 'Aceite de oliva extra virgen (1 botella 500ml)', category: 'despensa' },
  { id: 'w1-d14', name: 'Miel cruda (1 frasco chico)', category: 'despensa' },
  { id: 'w1-d15', name: 'Chocolate amargo 70% mínimo (1 tableta)', category: 'despensa' },
  // Especias y condimentos
  { id: 'w1-e01', name: 'Cúrcuma en polvo', category: 'especias' },
  { id: 'w1-e02', name: 'Comino', category: 'especias' },
  { id: 'w1-e03', name: 'Pimentón dulce', category: 'especias' },
  { id: 'w1-e04', name: 'Canela', category: 'especias' },
  { id: 'w1-e05', name: 'Pimienta negra (clave para la cúrcuma)', category: 'especias' },
  { id: 'w1-e06', name: 'Sal marina o del Himalaya', category: 'especias' },
  { id: 'w1-e07', name: 'Orégano', category: 'especias' },
  { id: 'w1-e08', name: 'Mostaza Dijon', category: 'especias' },
  { id: 'w1-e09', name: 'Salsa de soja baja en sodio o tamari (sin gluten)', category: 'especias' },
  // Bebidas
  { id: 'w1-b01', name: 'Té verde en saquitos o hebras (1 caja)', category: 'bebidas' },
  { id: 'w1-b02', name: 'Agua mineral o filtrada (sumá si no tomás de la canilla)', category: 'bebidas' },
  { id: 'w1-b03', name: 'Agua de coco (1 botella, opcional)', category: 'bebidas' },
];



// ═══════════════════════════════════════════════════════════
// SEMANA 2 — Deducida de programa-30-dias-semana-2.md
// Reincorporación estratégica (Días 8–14)
// ═══════════════════════════════════════════════════════════

const WEEK_2: ShoppingItem[] = [
  // Verduras
  { id: 'w2-v01', name: 'Espinaca baby (2 bolsas)', category: 'verduras' },
  { id: 'w2-v02', name: 'Hojas verdes mix (1 bolsa)', category: 'verduras' },
  { id: 'w2-v03', name: 'Zapallito / calabacín (3 unidades)', category: 'verduras' },
  { id: 'w2-v04', name: 'Pimiento rojo (3 unidades)', category: 'verduras' },
  { id: 'w2-v05', name: 'Berenjena (2 unidades)', category: 'verduras' },
  { id: 'w2-v06', name: 'Brócoli (2 unidades)', category: 'verduras' },
  { id: 'w2-v07', name: 'Zanahoria (6 unidades)', category: 'verduras' },
  { id: 'w2-v08', name: 'Apio (1 atado)', category: 'verduras' },
  { id: 'w2-v09', name: 'Puerro (2 unidades)', category: 'verduras' },
  { id: 'w2-v10', name: 'Pepino (2 unidades)', category: 'verduras' },
  { id: 'w2-v11', name: 'Tomate cherry (1 bandeja)', category: 'verduras' },
  { id: 'w2-v12', name: 'Tomates (4 unidades)', category: 'verduras' },
  { id: 'w2-v13', name: 'Champiñones (1 bandeja)', category: 'verduras' },
  { id: 'w2-v14', name: 'Calabaza (1 mediana)', category: 'verduras' },
  { id: 'w2-v15', name: 'Chauchas / judías verdes (200g)', category: 'verduras' },
  { id: 'w2-v16', name: 'Jengibre fresco (1 trozo grande)', category: 'verduras' },
  { id: 'w2-v17', name: 'Ajo (1 cabeza)', category: 'verduras' },
  { id: 'w2-v18', name: 'Cebolla (2 unidades)', category: 'verduras' },
  { id: 'w2-v19', name: 'Lechuga (1 planta)', category: 'verduras' },
  { id: 'w2-v20', name: 'Perejil fresco (1 atado)', category: 'verduras' },
  // Frutas
  { id: 'w2-f01', name: 'Banana (4 unidades)', category: 'frutas' },
  { id: 'w2-f02', name: 'Arándanos o frutillas (1 bandeja)', category: 'frutas' },
  { id: 'w2-f03', name: 'Kiwi (3 unidades)', category: 'frutas' },
  { id: 'w2-f04', name: 'Papaya o ananá (1 unidad)', category: 'frutas' },
  { id: 'w2-f05', name: 'Manzana (3 unidades)', category: 'frutas' },
  { id: 'w2-f06', name: 'Limones (4 unidades)', category: 'frutas' },
  { id: 'w2-f07', name: 'Mango (1 unidad, opcional)', category: 'frutas' },
  { id: 'w2-f08', name: 'Fruta de temporada (3 unidades)', category: 'frutas' },
  // Proteínas
  { id: 'w2-p01', name: 'Pollo (2 pechugas)', category: 'proteinas' },
  { id: 'w2-p02', name: 'Salmón (2 filetes)', category: 'proteinas' },
  { id: 'w2-p03', name: 'Pescado blanco: merluza o tilapia (2 filetes)', category: 'proteinas' },
  { id: 'w2-p04', name: 'Huevos (1 docena)', category: 'proteinas' },
  { id: 'w2-p05', name: 'Tofu firme (1 bloque)', category: 'proteinas' },
  { id: 'w2-p06', name: 'Lentejas rojas (1 paquete 500g)', category: 'proteinas' },
  { id: 'w2-p07', name: 'Edamame congelado (1 bolsa, opcional)', category: 'proteinas' },
  // Lácteos OK
  { id: 'w2-l01', name: 'Yogur natural sin azúcar (1 pote 1kg)', category: 'lacteos' },
  { id: 'w2-l02', name: 'Kéfir natural (1 botella 1L)', category: 'lacteos' },
  { id: 'w2-l03', name: 'Leche de almendras o avena (1 cartón 1L)', category: 'lacteos' },
  { id: 'w2-l04', name: 'Leche de coco (1 lata, para sopa)', category: 'lacteos' },
  // Despensa
  { id: 'w2-d01', name: 'Arroz integral (reponer si hace falta)', category: 'despensa' },
  { id: 'w2-d02', name: 'Avena en copos (certificada sin gluten)', category: 'despensa' },
  { id: 'w2-d03', name: 'Pan de arroz o maíz (1 paquete tostadas)', category: 'despensa' },
  { id: 'w2-d04', name: 'Almendras (1 paquete 200g)', category: 'despensa' },
  { id: 'w2-d05', name: 'Nueces (1 paquete 150g)', category: 'despensa' },
  { id: 'w2-d06', name: 'Nueces de Brasil (5 unidades)', category: 'despensa' },
  { id: 'w2-d07', name: 'Semillas de chía (reponer si hace falta)', category: 'despensa' },
  { id: 'w2-d08', name: 'Semillas de lino molido (reponer)', category: 'despensa' },
  { id: 'w2-d09', name: 'Semillas de sésamo (cantidad chica)', category: 'despensa' },
  { id: 'w2-d10', name: 'Mantequilla de almendras (1 frasco)', category: 'despensa' },
  { id: 'w2-d11', name: 'Hummus casero o comprado (1 pote)', category: 'despensa' },
  { id: 'w2-d12', name: 'Aceite de oliva extra virgen (reponer)', category: 'despensa' },
  { id: 'w2-d13', name: 'Miel cruda (reponer si hace falta)', category: 'despensa' },
  { id: 'w2-d14', name: 'Bicarbonato de sodio (para remojo legumbres)', category: 'despensa' },
  // Especias y condimentos
  { id: 'w2-e01', name: 'Cúrcuma en polvo', category: 'especias' },
  { id: 'w2-e02', name: 'Comino', category: 'especias' },
  { id: 'w2-e03', name: 'Canela', category: 'especias' },
  { id: 'w2-e04', name: 'Pimienta negra', category: 'especias' },
  { id: 'w2-e05', name: 'Sal rosa o marina', category: 'especias' },
  { id: 'w2-e06', name: 'Tamari o salsa de soja sin gluten', category: 'especias' },
  { id: 'w2-e07', name: 'Hierbas frescas (albahaca, cilantro)', category: 'especias' },
  // Bebidas
  { id: 'w2-b01', name: 'Té verde (reponer si hace falta)', category: 'bebidas' },
  { id: 'w2-b02', name: 'Infusión de jengibre (saquitos o fresco)', category: 'bebidas' },
  { id: 'w2-b03', name: 'Agua mineral o filtrada', category: 'bebidas' },
];



// ═══════════════════════════════════════════════════════════
// SEMANA 3 — Optimización Digestiva (Días 15–21)
// Combinación inteligente + cronobiología
// ═══════════════════════════════════════════════════════════

const WEEK_3: ShoppingItem[] = [
  // Verduras
  { id: 'w3-v01', name: 'Espinaca (2 atados)', category: 'verduras' },
  { id: 'w3-v02', name: 'Kale / col rizada (1 atado)', category: 'verduras' },
  { id: 'w3-v03', name: 'Rúcula (1 atado)', category: 'verduras' },
  { id: 'w3-v04', name: 'Brócoli (2 unidades)', category: 'verduras' },
  { id: 'w3-v05', name: 'Coliflor (1 unidad pequeña)', category: 'verduras' },
  { id: 'w3-v06', name: 'Zucchini (3 unidades)', category: 'verduras' },
  { id: 'w3-v07', name: 'Zanahoria (6 unidades)', category: 'verduras' },
  { id: 'w3-v08', name: 'Remolacha / betabel (2 unidades)', category: 'verduras' },
  { id: 'w3-v09', name: 'Batata / camote (3 unidades)', category: 'verduras' },
  { id: 'w3-v10', name: 'Pimiento rojo y amarillo (2 de cada uno)', category: 'verduras' },
  { id: 'w3-v11', name: 'Tomates (4 unidades)', category: 'verduras' },
  { id: 'w3-v12', name: 'Cebolla (3 unidades)', category: 'verduras' },
  { id: 'w3-v13', name: 'Ajo (1 cabeza)', category: 'verduras' },
  { id: 'w3-v14', name: 'Jengibre fresco (1 trozo)', category: 'verduras' },
  { id: 'w3-v15', name: 'Puerro (2 unidades)', category: 'verduras' },
  { id: 'w3-v16', name: 'Pepino (2 unidades)', category: 'verduras' },
  { id: 'w3-v17', name: 'Repollo morado (½ unidad)', category: 'verduras' },
  { id: 'w3-v18', name: 'Espárragos (1 atado)', category: 'verduras' },
  { id: 'w3-v19', name: 'Perejil + cilantro (atados frescos)', category: 'verduras' },
  // Frutas
  { id: 'w3-f01', name: 'Banana (4 unidades)', category: 'frutas' },
  { id: 'w3-f02', name: 'Palta / aguacate (3 unidades)', category: 'frutas' },
  { id: 'w3-f03', name: 'Limones (4 unidades)', category: 'frutas' },
  { id: 'w3-f04', name: 'Naranja (3 unidades)', category: 'frutas' },
  { id: 'w3-f05', name: 'Frutos rojos congelados (1 bolsa 300g)', category: 'frutas' },
  { id: 'w3-f06', name: 'Manzana verde (3 unidades)', category: 'frutas' },
  { id: 'w3-f07', name: 'Kiwi (3 unidades)', category: 'frutas' },
  { id: 'w3-f08', name: 'Granada (1 unidad, opcional)', category: 'frutas' },
  // Proteínas
  { id: 'w3-p01', name: 'Salmón o trucha (2 filetes)', category: 'proteinas' },
  { id: 'w3-p02', name: 'Pollo (2 pechugas)', category: 'proteinas' },
  { id: 'w3-p03', name: 'Sardinas en lata al natural (2 latas)', category: 'proteinas' },
  { id: 'w3-p04', name: 'Huevos (1 docena)', category: 'proteinas' },
  { id: 'w3-p05', name: 'Lentejas (1 paquete o lata)', category: 'proteinas' },
  { id: 'w3-p06', name: 'Porotos negros / frijoles (1 lata)', category: 'proteinas' },
  { id: 'w3-p07', name: 'Tofu o tempeh (1 bloque)', category: 'proteinas' },
  // Lácteos OK
  { id: 'w3-l01', name: 'Yogur natural sin azúcar (1 pote 1kg)', category: 'lacteos' },
  { id: 'w3-l02', name: 'Kéfir (1 botella 1L)', category: 'lacteos' },
  { id: 'w3-l03', name: 'Queso de cabra o feta (150g)', category: 'lacteos' },
  { id: 'w3-l04', name: 'Leche vegetal sin azúcar (1 cartón)', category: 'lacteos' },
  // Despensa
  { id: 'w3-d01', name: 'Quinoa (reponer si hace falta)', category: 'despensa' },
  { id: 'w3-d02', name: 'Arroz integral o basmati (reponer)', category: 'despensa' },
  { id: 'w3-d03', name: 'Avena en copos (reponer)', category: 'despensa' },
  { id: 'w3-d04', name: 'Fideos de arroz o trigo sarraceno (1 paquete)', category: 'despensa' },
  { id: 'w3-d05', name: 'Pan integral de masa madre (1 unidad)', category: 'despensa' },
  { id: 'w3-d06', name: 'Almendras y nueces (reponer)', category: 'despensa' },
  { id: 'w3-d07', name: 'Semillas de calabaza (1 paquete chico)', category: 'despensa' },
  { id: 'w3-d08', name: 'Semillas de chía y lino (reponer)', category: 'despensa' },
  { id: 'w3-d09', name: 'Tahini (reponer si hace falta)', category: 'despensa' },
  { id: 'w3-d10', name: 'Aceite de oliva extra virgen (reponer)', category: 'despensa' },
  { id: 'w3-d11', name: 'Vinagre de manzana orgánico (1 botella)', category: 'despensa' },
  { id: 'w3-d12', name: 'Caldo de huesos o caldo casero (1L)', category: 'despensa' },
  // Especias y condimentos
  { id: 'w3-e01', name: 'Cúrcuma fresca o en polvo', category: 'especias' },
  { id: 'w3-e02', name: 'Comino', category: 'especias' },
  { id: 'w3-e03', name: 'Pimentón ahumado', category: 'especias' },
  { id: 'w3-e04', name: 'Curry en polvo', category: 'especias' },
  { id: 'w3-e05', name: 'Canela', category: 'especias' },
  { id: 'w3-e06', name: 'Pimienta negra', category: 'especias' },
  { id: 'w3-e07', name: 'Sal marina', category: 'especias' },
  { id: 'w3-e08', name: 'Vinagre balsámico (cantidad chica)', category: 'especias' },
  // Bebidas
  { id: 'w3-b01', name: 'Té verde o matcha (reponer)', category: 'bebidas' },
  { id: 'w3-b02', name: 'Infusión digestiva (manzanilla + menta)', category: 'bebidas' },
  { id: 'w3-b03', name: 'Agua mineral o filtrada', category: 'bebidas' },
  { id: 'w3-b04', name: 'Kombucha natural (1 botella, opcional)', category: 'bebidas' },
];



// ═══════════════════════════════════════════════════════════
// SEMANA 4 — Mantenimiento Autónomo (Días 22–30)
// Autonomía digestiva + plan sostenible
// ═══════════════════════════════════════════════════════════

const WEEK_4: ShoppingItem[] = [
  // Verduras
  { id: 'w4-v01', name: 'Espinaca o acelga (2 atados)', category: 'verduras' },
  { id: 'w4-v02', name: 'Mix de hojas verdes (1 bolsa)', category: 'verduras' },
  { id: 'w4-v03', name: 'Brócoli o broccolini (2 unidades)', category: 'verduras' },
  { id: 'w4-v04', name: 'Zucchini (3 unidades)', category: 'verduras' },
  { id: 'w4-v05', name: 'Zanahoria (6 unidades)', category: 'verduras' },
  { id: 'w4-v06', name: 'Batata / camote (3 unidades)', category: 'verduras' },
  { id: 'w4-v07', name: 'Calabaza (1 mediana)', category: 'verduras' },
  { id: 'w4-v08', name: 'Pimiento rojo (2 unidades)', category: 'verduras' },
  { id: 'w4-v09', name: 'Tomates (4 unidades)', category: 'verduras' },
  { id: 'w4-v10', name: 'Cebolla (3 unidades)', category: 'verduras' },
  { id: 'w4-v11', name: 'Ajo (1 cabeza)', category: 'verduras' },
  { id: 'w4-v12', name: 'Jengibre fresco (1 trozo)', category: 'verduras' },
  { id: 'w4-v13', name: 'Puerro (1 unidad)', category: 'verduras' },
  { id: 'w4-v14', name: 'Pepino (2 unidades)', category: 'verduras' },
  { id: 'w4-v15', name: 'Hongos variados (shiitake, portobello)', category: 'verduras' },
  { id: 'w4-v16', name: 'Espárragos o chauchas (1 atado)', category: 'verduras' },
  { id: 'w4-v17', name: 'Alcachofas (2 unidades, si es temporada)', category: 'verduras' },
  { id: 'w4-v18', name: 'Perejil + menta fresca (atados)', category: 'verduras' },
  // Frutas
  { id: 'w4-f01', name: 'Banana (4 unidades)', category: 'frutas' },
  { id: 'w4-f02', name: 'Palta / aguacate (3 unidades)', category: 'frutas' },
  { id: 'w4-f03', name: 'Limones (4 unidades)', category: 'frutas' },
  { id: 'w4-f04', name: 'Frutos rojos congelados (1 bolsa 300g)', category: 'frutas' },
  { id: 'w4-f05', name: 'Manzana o pera (4 unidades)', category: 'frutas' },
  { id: 'w4-f06', name: 'Kiwi (3 unidades)', category: 'frutas' },
  { id: 'w4-f07', name: 'Fruta de estación a elección (4 unidades)', category: 'frutas' },
  // Proteínas
  { id: 'w4-p01', name: 'Salmón o pescado azul (2 filetes)', category: 'proteinas' },
  { id: 'w4-p02', name: 'Pollo orgánico (2 pechugas o muslos)', category: 'proteinas' },
  { id: 'w4-p03', name: 'Pescado blanco (2 filetes)', category: 'proteinas' },
  { id: 'w4-p04', name: 'Huevos (1 docena)', category: 'proteinas' },
  { id: 'w4-p05', name: 'Lentejas o garbanzos (1 paquete o lata)', category: 'proteinas' },
  { id: 'w4-p06', name: 'Tofu o tempeh (1 bloque)', category: 'proteinas' },
  { id: 'w4-p07', name: 'Carne magra: lomo o bife (1 pieza, opcional)', category: 'proteinas' },
  // Lácteos OK
  { id: 'w4-l01', name: 'Yogur natural sin azúcar (1 pote 1kg)', category: 'lacteos' },
  { id: 'w4-l02', name: 'Kéfir (1 botella 1L)', category: 'lacteos' },
  { id: 'w4-l03', name: 'Queso de cabra o feta (150g)', category: 'lacteos' },
  { id: 'w4-l04', name: 'Leche vegetal sin azúcar (1 cartón)', category: 'lacteos' },
  // Despensa
  { id: 'w4-d01', name: 'Quinoa o trigo sarraceno (reponer)', category: 'despensa' },
  { id: 'w4-d02', name: 'Arroz integral o basmati (reponer)', category: 'despensa' },
  { id: 'w4-d03', name: 'Avena en copos (reponer)', category: 'despensa' },
  { id: 'w4-d04', name: 'Pan integral de masa madre (1 unidad)', category: 'despensa' },
  { id: 'w4-d05', name: 'Pasta integral o de legumbres (1 paquete)', category: 'despensa' },
  { id: 'w4-d06', name: 'Frutos secos mix (almendras, nueces, castañas)', category: 'despensa' },
  { id: 'w4-d07', name: 'Semillas mix (chía, lino, girasol, calabaza)', category: 'despensa' },
  { id: 'w4-d08', name: 'Tahini o mantequilla de almendras (reponer)', category: 'despensa' },
  { id: 'w4-d09', name: 'Aceite de oliva extra virgen (reponer)', category: 'despensa' },
  { id: 'w4-d10', name: 'Vinagre de manzana orgánico (reponer)', category: 'despensa' },
  { id: 'w4-d11', name: 'Caldo de huesos o casero (1L)', category: 'despensa' },
  { id: 'w4-d12', name: 'Chocolate amargo 85% (1 tableta)', category: 'despensa' },
  // Especias y condimentos
  { id: 'w4-e01', name: 'Cúrcuma', category: 'especias' },
  { id: 'w4-e02', name: 'Comino', category: 'especias' },
  { id: 'w4-e03', name: 'Curry o garam masala', category: 'especias' },
  { id: 'w4-e04', name: 'Canela', category: 'especias' },
  { id: 'w4-e05', name: 'Pimienta negra', category: 'especias' },
  { id: 'w4-e06', name: 'Sal marina', category: 'especias' },
  { id: 'w4-e07', name: 'Tamari o salsa de soja', category: 'especias' },
  { id: 'w4-e08', name: 'Pesto casero o comprado (sin lácteos, opcional)', category: 'especias' },
  // Bebidas
  { id: 'w4-b01', name: 'Té verde o matcha (reponer)', category: 'bebidas' },
  { id: 'w4-b02', name: 'Infusiones digestivas variadas', category: 'bebidas' },
  { id: 'w4-b03', name: 'Kombucha (1 botella)', category: 'bebidas' },
  { id: 'w4-b04', name: 'Agua mineral o filtrada', category: 'bebidas' },
];

// ═══════════════════════════════════════════════════════════
// EXPORT — 4 semanas completas
// ═══════════════════════════════════════════════════════════

export const SHOPPING_WEEKS: WeekData[] = [
  { weekNumber: 1, label: 'Semana 1', items: WEEK_1 },
  { weekNumber: 2, label: 'Semana 2', items: WEEK_2 },
  { weekNumber: 3, label: 'Semana 3', items: WEEK_3 },
  { weekNumber: 4, label: 'Semana 4', items: WEEK_4 },
];

export function getWeekItems(weekNumber: number): ShoppingItem[] {
  const week = SHOPPING_WEEKS.find((w) => w.weekNumber === weekNumber);
  return week?.items ?? [];
}

export function getItemsByCategory(items: ShoppingItem[]): Record<ShoppingCategory, ShoppingItem[]> {
  const grouped = {} as Record<ShoppingCategory, ShoppingItem[]>;
  for (const cat of getAllCategories()) {
    grouped[cat] = items.filter((item) => item.category === cat);
  }
  return grouped;
}
