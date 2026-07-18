// lib/pwa/supplement-guide.ts — Guía de suplementación natural

export type Supplement = {
  name: string;
  emoji: string;
  purpose: string;
  /** Qué muestra la evidencia (en lenguaje claro, con la fuente al pie). */
  evidence: string;
  whatToLookFor: string;
  dose: string;
  when: string;
  naturalAlternative: string;
  brands?: { country: string; brand: string }[];
};

export type WeekProtocol = {
  weeks: string;
  title: string;
  supplements: { name: string; dose: string; moment: string; objective: string }[];
};

export const MEDICAL_DISCLAIMER = `Este contenido es únicamente informativo y educativo. No constituye consejo médico, diagnóstico ni prescripción. Antes de iniciar cualquier suplemento, consultá con tu médico, nutricionista o farmacéutico, especialmente si estás embarazada o en período de lactancia, tomás medicación de uso crónico, tenés enfermedades diagnosticadas o alergias conocidas. Los suplementos no reemplazan una alimentación equilibrada. Son un apoyo, no una solución autónoma.`;

export const SUPPLEMENTS: Supplement[] = [
  {
    name: 'Probióticos',
    emoji: '🦠',
    purpose: 'Repoblar la microbiota con bacterias beneficiosas. Cuando tu flora está desequilibrada, hay más bacterias productoras de gas que las que debería. Los probióticos reequilibran eso.',
    evidence: 'Las revisiones muestran beneficios en ciertos síntomas digestivos, pero son cepa- y dosis-dependientes (no todos sirven para lo mismo). Ojo: la calidad comercial varía mucho y muchos productos traen menos CFU vivos de los que prometen.',
    whatToLookFor: 'Cepas: Lactobacillus acidophilus + Bifidobacterium longum (mínimo). CFU: mínimo 10.000 millones por cápsula. Con cápsula entérica (que llega intacta al intestino). Refrigerado o con tecnología de liberación retardada.',
    dose: '1 cápsula (10.000 millones CFU)',
    when: 'Por la mañana, en ayunas o con el desayuno. Duración mínima: 30 días.',
    naturalAlternative: 'Kéfir de agua o leche casero: 200ml por día, en ayunas o con el desayuno. Es la fuente de probióticos más potente en forma alimentaria. También: yogur natural con cultivos vivos, chucrut, kimchi, kombucha sin azúcar.',
    brands: [
      { country: '🇦🇷 Argentina', brand: 'Lacteol, Floratil, Lacrobact' },
      { country: '🇲🇽 México', brand: 'Florajen, Lacteol' },
      { country: '🇨🇴 Colombia', brand: 'Floratil, Enterobactiol' },
      { country: '🇪🇸 España', brand: 'Vivomixx, Lacteol' },
    ],
  },
  {
    name: 'Magnesio (glicinato o citrato)',
    emoji: '✨',
    purpose: 'Regula la contracción y relajación muscular intestinal. Su deficiencia es una de las causas más frecuentes de estreñimiento y tensión abdominal. El glicinato tiene mejor tolerancia digestiva y efecto relajante.',
    evidence: 'Una mayor ingesta de magnesio se asocia a menos estreñimiento crónico en estudios poblacionales. El citrato suma un efecto osmótico suave que ablanda y moviliza (útil si tendés a estreñimiento).',
    whatToLookFor: 'Magnesio glicinato: mejor tolerancia, efecto relajante. Magnesio citrato: buena absorción, suave efecto laxante (ideal si tenés estreñimiento). Evitar: óxido de magnesio (mala absorción, efecto laxante agresivo).',
    dose: '200-400mg por día',
    when: 'Con la cena. Ayuda a la relajación nocturna y al tránsito intestinal matutino.',
    naturalAlternative: 'Semillas de calabaza (1 puñado = 150mg), almendras, espinaca cocida, banana, chocolate 85%+ cacao. Baño de sales de Epsom (20 min, 2-3 veces/semana): el magnesio se absorbe por la piel.',
    brands: [
      { country: '🇦🇷 Argentina', brand: 'Magnesium B6, Natural Health' },
      { country: '🇲🇽 México', brand: "Mag-L, Nature's Way" },
      { country: '🇨🇴 Colombia', brand: 'MagNature' },
      { country: '🇪🇸 España', brand: 'Solgar, Natural Point' },
    ],
  },
  {
    name: 'L-Glutamina',
    emoji: '🧬',
    purpose: 'El aminoácido favorito del intestino. Es el principal combustible de las células del epitelio intestinal. Repara la permeabilidad intestinal aumentada ("leaky gut"). Especialmente útil si tuviste muchos antibióticos o inflamación crónica.',
    evidence: 'Estudios muestran que la glutamina ayuda a proteger las uniones estrechas (tight junctions) y a reducir la hiperpermeabilidad intestinal. La mayor parte de la evidencia es preclínica o en poblaciones específicas.',
    whatToLookFor: 'L-Glutamina en polvo puro (sin saborizantes ni aditivos). Genérica y económica. Se vende en dietéticas y tiendas deportivas.',
    dose: '5g por día en polvo (no tiene sabor)',
    when: 'Disuelto en agua tibia, en ayunas. Ciclos de 30 días.',
    naturalAlternative: 'Caldo de huesos casero: cocción prolongada (12-24h) de huesos de res o pollo con vinagre de manzana. Rico en glutamina, colágeno y glicina. 1 taza al día en ayunas.',
    brands: [
      { country: '🇦🇷 Argentina', brand: 'L-Glutamine polvo (dietéticas/deportivas)' },
      { country: '🇲🇽 México', brand: 'Optimum Nutrition, GNC' },
      { country: '🇨🇴 Colombia', brand: 'GNC, tiendas deportivas' },
      { country: '🇪🇸 España', brand: 'Myprotein L-Glutamine, Amazon' },
    ],
  },
  {
    name: 'Zinc',
    emoji: '🛡️',
    purpose: 'Cofactor de más de 300 enzimas digestivas. Su deficiencia impacta directamente en la integridad de la mucosa intestinal. Señales de que te falta: uñas frágiles, cicatrización lenta, baja inmunidad.',
    evidence: 'El zinc es cofactor enzimático esencial; junto con glutamina, vitamina D y fibra se estudia por su rol en la barrera intestinal. Suplementar tiene más sentido si hay déficit real.',
    whatToLookFor: 'Gluconato de zinc o bisglicinato de zinc (mejor absorción que sulfato). Disponible en farmacias como "Zinc + Vitamina C" o solo Zinc.',
    dose: '15-25mg por día',
    when: 'Con el almuerzo (en ayunas puede generar náuseas). No tomar junto con hierro (compiten por absorción).',
    naturalAlternative: 'Alimentos altos en zinc: semillas de calabaza, carne roja magra 2x/semana, legumbres con vitamina C (el limón ayuda a absorber el zinc), germen de trigo, nueces de cajú.',
    brands: [
      { country: '🇦🇷 Argentina', brand: 'Zinc (farmacia genérica)' },
      { country: '🇲🇽 México', brand: 'Zinc de farmacia / GNC' },
      { country: '🇨🇴 Colombia', brand: 'Zinc farmacias' },
      { country: '🇪🇸 España', brand: 'Solgar Zinc, Amazon' },
    ],
  },
  {
    name: 'Curcumina con piperina',
    emoji: '🌿',
    purpose: 'El antiinflamatorio natural más estudiado para el intestino. Inhibe las vías inflamatorias NF-κB directamente en el tejido intestinal. La piperina (pimienta negra) es indispensable porque sin ella se absorbe menos del 5%.',
    evidence: 'La curcumina sola tiene biodisponibilidad muy baja; el estudio clásico de Shoba mostró que la piperina aumenta enormemente su absorción. Revisiones la han evaluado para molestias digestivas y SII, con resultados prometedores pero aún heterogéneos.',
    whatToLookFor: 'Extracto estandarizado al 95% de curcuminoides + piperina (pimienta negra). Sin piperina, la curcumina tiene biodisponibilidad bajísima. Con piperina, sube al 60%.',
    dose: '500-1000mg de extracto de curcumina por día',
    when: 'Con las comidas (almuerzo idealmente). Se puede dividir en 2 tomas.',
    naturalAlternative: 'Pasta de oro casera: ¼ taza cúrcuma + ½ taza agua + 1 cdita pimienta negra + 1 cdita aceite de oliva. Cocinar a fuego bajo 5 min. Guardar en frasco. Usar 1 cdita/día en infusiones o leche vegetal.',
    brands: [
      { country: '🇦🇷 Argentina', brand: 'Cúrcumin Bioperine (dietéticas/MercadoLibre)' },
      { country: '🇲🇽 México', brand: 'Curcumin C3 Complex, GNC' },
      { country: '🇨🇴 Colombia', brand: "Nature's Plus" },
      { country: '🇪🇸 España', brand: 'Solgar Full Spectrum Curcumin, Amazon' },
    ],
  },
];

export const PROTOCOL_BY_WEEK: WeekProtocol[] = [
  {
    weeks: '1-2',
    title: 'Base intestinal',
    supplements: [
      { name: 'Probiótico', dose: '1 cápsula (10B CFU)', moment: 'Mañana, desayuno', objective: 'Repoblar microbiota' },
      { name: 'Magnesio', dose: '200mg', moment: 'Cena', objective: 'Relajar intestino' },
      { name: 'L-Glutamina', dose: '5g en polvo', moment: 'Ayunas', objective: 'Reparar mucosa' },
    ],
  },
  {
    weeks: '3-4',
    title: 'Soporte antiinflamatorio',
    supplements: [
      { name: 'Probiótico', dose: '1 cápsula (10B CFU)', moment: 'Mañana', objective: 'Mantener microbiota' },
      { name: 'Magnesio', dose: '300mg', moment: 'Cena', objective: 'Función motora' },
      { name: 'Curcumina + Piperina', dose: '500mg', moment: 'Almuerzo', objective: 'Antiinflamatorio' },
      { name: 'Zinc', dose: '15mg', moment: 'Almuerzo', objective: 'Integridad mucosa' },
    ],
  },
  {
    weeks: '5+',
    title: 'Mantenimiento',
    supplements: [
      { name: 'Probiótico', dose: '1 cápsula', moment: '3-5 días/semana, mañana', objective: 'Sostener flora' },
      { name: 'Magnesio', dose: '200mg', moment: 'Cena', objective: 'Relajación continua' },
      { name: 'Curcumina', dose: '500mg', moment: '3-4 días/semana, con comida', objective: 'Prevención' },
    ],
  },
];

export const SUPPLEMENTS_TO_AVOID: { name: string; reason: string }[] = [
  {
    name: 'Detox, cleanses y "drenantes intestinales"',
    reason: 'Generalmente contienen laxantes estimulantes (senna, cáscara sagrada) que irritan la mucosa, diuréticos que deshidratan, y rellenos sin evidencia. Tu hígado y riñones ya hacen el trabajo de detox.',
  },
  {
    name: 'Enzimas digestivas de uso permanente',
    reason: 'Útiles temporariamente si tu digestión está comprometida. Pero si las necesitás para siempre, es señal de que hay algo subyacente sin resolver. El protocolo apunta a que tu cuerpo genere las propias.',
  },
  {
    name: 'Colágeno hidrolizado "intestinal" caro',
    reason: 'El colágeno marino o bovino aporta glicina y prolina para el epitelio. Pero es caro. El caldo de huesos casero da el mismo resultado a una fracción del precio.',
  },
  {
    name: 'Probióticos de bajo costo (menos de $2 USD)',
    reason: 'Si el probiótico es muy barato, la concentración de CFU es insuficiente o las bacterias están muertas en el frasco. Invertí en uno de calidad o usá kéfir.',
  },
];

export const INTERACTIONS: { medication: string; supplement: string; reason: string }[] = [
  {
    medication: 'Anticoagulantes (warfarina, acenocumarol)',
    supplement: 'Curcumina, Omega-3',
    reason: 'Potencian el efecto anticoagulante. Riesgo de sangrado aumentado.',
  },
  {
    medication: 'Antibióticos',
    supplement: 'Probióticos',
    reason: 'Tomar el probiótico al menos 2 horas después del antibiótico, nunca juntos.',
  },
  {
    medication: 'Antidepresivos ISRS',
    supplement: 'Probióticos cepa L. reuteri',
    reason: 'Puede potenciar el efecto serotoninérgico. Consultar con el médico.',
  },
  {
    medication: 'Metformina (diabetes)',
    supplement: 'Magnesio',
    reason: 'Puede alterar la absorción del magnesio. Separar la toma al menos 2 horas.',
  },
  {
    medication: 'Hierro terapéutico',
    supplement: 'Zinc',
    reason: 'Compiten por el mismo transportador intestinal. Tomar separados (mañana/noche).',
  },
  {
    medication: 'Anticonceptivos hormonales',
    supplement: 'Zinc, Magnesio',
    reason: 'No hay interacción de riesgo, pero los anticonceptivos reducen estos minerales. Buena razón para suplementar.',
  },
];
