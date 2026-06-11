/**
 * @file localization.ts — Localizacion por pais para el quiz funnel V2.
 *
 * PARA REUTILIZAR:
 * Este archivo contiene TODOS los textos y precios por pais. Para adaptar
 * el funnel a tu nicho:
 *
 *  1. PRECIOS (PRICING_BY_COUNTRY):
 *     Cambia los precios de cada plan en cada pais. Manten la estructura
 *     de 3 planes (o ajusta si tu producto tiene otros). El pricing se
 *     muestra en la sales page automaticamente.
 *
 *  2. TEXTOS (TEXTS_BY_COUNTRY):
 *     Cambia headlines, CTAs, FAQ, testimonios, weekly highlights.
 *     Cada pais puede tener su propio tono (vos/tu/usted).
 *
 *  3. QUIZ OVERRIDES (QUIZ_OVERRIDES):
 *     Si una pregunta se dice distinto en otro pais (ej: "panza" vs "barriga"
 *     vs "guata"), agrega un override. El componente hace merge automatico.
 *
 *  4. AGREGAR UN PAIS NUEVO:
 *     a. Agrega el codigo al type CountryCode (ej: 'EC')
 *     b. Agrega entrada en PRICING_BY_COUNTRY
 *     c. Agrega texto base en TEXTS_BY_COUNTRY (podes copiar CO y ajustar)
 *     d. Agrega overrides en QUIZ_OVERRIDES si hay diferencias
 *     e. Agrega en SOCIAL_PROOF_OVERRIDES
 *     f. Agrega el codigo en isValidCountry()
 *
 * Paises soportados: AR, CO, PE, MX, CL
 */

export type CountryCode = 'AR' | 'CO' | 'PE' | 'MX' | 'CL';

export interface CountryPricing {
  currency: string;
  symbol: string;
  plans: {
    '1sem': { price: string; originalPrice: string; perDay: string };
    '4sem': { price: string; originalPrice: string; perDay: string };
    '8sem': { price: string; originalPrice: string; perDay: string };
  };
  valueStack: {
    protocolo: string;
    recetas: string;
    kitExpress: string;
    diario: string;
    totalValue: string;
  };
  comparison: {
    nutricionista: string;
    gastro: string;
    protocolo: string;
  };
}

export interface CountryTexts {
  // Headlines & CTAs
  heroHeadline: (nombre?: string) => string;
  socialProofCount: string;
  socialProofText: string;
  reframeTitle: string;
  reframeBody: string;
  ctaButton: string;
  finalCtaHeadline: (nombre?: string) => string;
  finalCtaSubtext: string;
  guaranteeText: string;
  // Plan labels
  choosePlanTitle: string;
  weeklyHighlights: { week: number; title: string; desc: string }[];
  // FAQ
  faqItems: { q: string; a: string }[];
  // Testimonials
  testimonials: { quote: string; author: string; age: number }[];
  // Misc
  discountText: (time: string) => string;
  paymentBadges: string;
  securityBadge: string;
}


// ═══════════════════════════════════════════════════════════════════════════
// PRECIOS POR PAÍS
// ═══════════════════════════════════════════════════════════════════════════

export const PRICING_BY_COUNTRY: Record<CountryCode, CountryPricing> = {
  AR: {
    currency: 'ARS',
    symbol: '$',
    plans: {
      '1sem': { price: '$9.900', originalPrice: '$27.500', perDay: '$1.414/día' },
      '4sem': { price: '$19.900', originalPrice: '$55.000', perDay: '$710/día' },
      '8sem': { price: '$29.900', originalPrice: '$82.500', perDay: '$535/día' },
    },
    valueStack: {
      protocolo: '$25.000',
      recetas: '$15.000',
      kitExpress: '$8.000',
      diario: '$10.000',
      totalValue: '$58.000',
    },
    comparison: {
      nutricionista: '$30.000–60.000/mes',
      gastro: '$45.000 consulta',
      protocolo: 'desde $535/día',
    },
  },
  CO: {
    currency: 'COP',
    symbol: '$',
    plans: {
      '1sem': { price: '$29.900', originalPrice: '$89.900', perDay: '$4.271/día' },
      '4sem': { price: '$59.900', originalPrice: '$179.900', perDay: '$2.139/día' },
      '8sem': { price: '$89.900', originalPrice: '$269.900', perDay: '$1.605/día' },
    },
    valueStack: {
      protocolo: '$79.900',
      recetas: '$49.900',
      kitExpress: '$29.900',
      diario: '$39.900',
      totalValue: '$199.600',
    },
    comparison: {
      nutricionista: '$150.000–300.000/mes',
      gastro: '$200.000 consulta',
      protocolo: 'desde $4.271/día',
    },
  },
  PE: {
    currency: 'PEN',
    symbol: 'S/',
    plans: {
      '1sem': { price: 'S/29', originalPrice: 'S/79', perDay: 'S/4.14/día' },
      '4sem': { price: 'S/49', originalPrice: 'S/139', perDay: 'S/1.75/día' },
      '8sem': { price: 'S/69', originalPrice: 'S/199', perDay: 'S/1.23/día' },
    },
    valueStack: {
      protocolo: 'S/59',
      recetas: 'S/39',
      kitExpress: 'S/19',
      diario: 'S/29',
      totalValue: 'S/146',
    },
    comparison: {
      nutricionista: 'S/150–300/mes',
      gastro: 'S/200 consulta',
      protocolo: 'desde S/1.23/día',
    },
  },
  MX: {
    currency: 'MXN',
    symbol: '$',
    plans: {
      '1sem': { price: '$149', originalPrice: '$449', perDay: '$21/día' },
      '4sem': { price: '$299', originalPrice: '$899', perDay: '$10.68/día' },
      '8sem': { price: '$449', originalPrice: '$1,349', perDay: '$8.02/día' },
    },
    valueStack: {
      protocolo: '$399',
      recetas: '$249',
      kitExpress: '$149',
      diario: '$199',
      totalValue: '$996',
    },
    comparison: {
      nutricionista: '$1,500–3,000/mes',
      gastro: '$2,000 consulta',
      protocolo: 'desde $8.02/día',
    },
  },
  CL: {
    currency: 'CLP',
    symbol: '$',
    plans: {
      '1sem': { price: '$6.990', originalPrice: '$19.990', perDay: '$999/día' },
      '4sem': { price: '$12.990', originalPrice: '$39.990', perDay: '$464/día' },
      '8sem': { price: '$18.990', originalPrice: '$56.990', perDay: '$339/día' },
    },
    valueStack: {
      protocolo: '$14.990',
      recetas: '$9.990',
      kitExpress: '$4.990',
      diario: '$6.990',
      totalValue: '$36.960',
    },
    comparison: {
      nutricionista: '$40.000–80.000/mes',
      gastro: '$50.000 consulta',
      protocolo: 'desde $339/día',
    },
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// TEXTOS POR PAÍS
// ═══════════════════════════════════════════════════════════════════════════

const TEXTS_AR: CountryTexts = {
  heroHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}¡deshinchá tu panza en 7 días!`,
  socialProofCount: '237 mujeres esta semana',
  socialProofText: 'empezaron el protocolo para',
  reframeTitle: 'No es falta de voluntad. Es inflamación.',
  reframeBody: 'Tu hinchazón no es porque "comés mal". Es una respuesta inflamatoria a alimentos que creés saludables pero que tu intestino no tolera. El protocolo identifica cuáles son y los elimina en 7 días.',
  ctaButton: 'OBTENER MI PLAN →',
  finalCtaHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}tu plan te está esperando`,
  finalCtaSubtext: 'Aprovechá el 64% de descuento antes de que expire.',
  guaranteeText: 'Tenés 7 días para probarlo. Si no ves resultados, te devolvemos la plata sin preguntas. Un email y listo.',
  choosePlanTitle: 'Elegí tu plan',
  weeklyHighlights: [
    { week: 1, title: 'Limpieza intestinal', desc: 'Eliminá los 7 alimentos que te inflaman sin saberlo' },
    { week: 2, title: 'Sentite liviana', desc: 'Restaurá tu microbiota con el protocolo antiinflamatorio' },
    { week: 3, title: 'Panza plana', desc: 'Reincorporá alimentos seguros y consolidá resultados' },
    { week: 4, title: 'Mantenimiento de por vida', desc: 'Tu nuevo estilo de vida sin hinchazón' },
  ],
  faqItems: [
    { q: '¿El plan se adapta a mi situación particular?', a: '¡Sí! Tu plan está hiper-personalizado según tus respuestas. Además, podés ajustar preferencias dentro de la app.' },
    { q: '¿Cómo accedo al plan?', a: 'Inmediatamente después del pago recibís acceso a la app Chau Hinchazón en tu celular. Es una PWA — no necesitás descargar nada del App Store.' },
    { q: '¿Qué pasa si me cuesta mantener la motivación?', a: 'El plan está diseñado para ser gradual. Empezás con solo 5 minutos al día y la app te guía paso a paso con recordatorios.' },
    { q: '¿Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
  ],
  testimonials: [
    { quote: 'Al día 4 se me deshinchó la panza. No lo podía creer.', author: 'Anabela', age: 41 },
    { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Verónica', age: 51 },
    { quote: 'Por fin entendí qué me inflamaba. Años sin saberlo.', author: 'Lucía', age: 38 },
  ],
  discountText: (time) => `🔥 64% descuento por ${time}`,
  paymentBadges: '💳 Visa · Mastercard · Amex',
  securityBadge: '🔒 Pago seguro SSL',
};


const TEXTS_CO: CountryTexts = {
  heroHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}¡deshincha tu barriga en 7 días!`,
  socialProofCount: '237 mujeres esta semana',
  socialProofText: 'empezaron el protocolo para',
  reframeTitle: 'No es falta de voluntad. Es inflamación.',
  reframeBody: 'Tu hinchazón no es porque "comes mal". Es una respuesta inflamatoria a alimentos que crees saludables pero que tu intestino no tolera. El protocolo identifica cuáles son y los elimina en 7 días.',
  ctaButton: 'OBTENER MI PLAN →',
  finalCtaHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}tu plan te está esperando`,
  finalCtaSubtext: 'Aprovecha el 64% de descuento antes de que expire.',
  guaranteeText: 'Tienes 7 días para probarlo. Si no ves resultados, te devolvemos la plata sin preguntas. Un email y listo.',
  choosePlanTitle: 'Elige tu plan',
  weeklyHighlights: [
    { week: 1, title: 'Limpieza intestinal', desc: 'Elimina los 7 alimentos que te inflaman sin que lo sepas' },
    { week: 2, title: 'Siéntete liviana', desc: 'Restaura tu microbiota con el protocolo antiinflamatorio' },
    { week: 3, title: 'Barriga plana', desc: 'Reincorpora alimentos seguros y consolida resultados' },
    { week: 4, title: 'Mantenimiento de por vida', desc: 'Tu nuevo estilo de vida sin hinchazón' },
  ],
  faqItems: [
    { q: '¿El plan se adapta a mi situación particular?', a: '¡Sí! Tu plan está hiper-personalizado según tus respuestas. Además, puedes ajustar preferencias dentro de la app.' },
    { q: '¿Cómo accedo al plan?', a: 'Inmediatamente después del pago recibes acceso a la app Chau Hinchazón en tu celular. Es una PWA — no necesitas descargar nada de la tienda.' },
    { q: '¿Qué pasa si me cuesta mantener la motivación?', a: 'El plan está diseñado para ser gradual. Empiezas con solo 5 minutos al día y la app te guía paso a paso con recordatorios.' },
    { q: '¿Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
  ],
  testimonials: [
    { quote: 'Al día 4 se me deshinchó la barriga. ¡No lo podía creer!', author: 'Catalina', age: 39 },
    { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Valentina', age: 45 },
    { quote: 'Por fin entendí qué me inflamaba. Años sin saberlo.', author: 'Daniela', age: 36 },
  ],
  discountText: (time) => `🔥 64% de descuento por ${time}`,
  paymentBadges: '💳 Visa · Mastercard · PSE',
  securityBadge: '🔒 Pago seguro SSL',
};


const TEXTS_PE: CountryTexts = {
  heroHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}¡deshincha tu barriga en 7 días!`,
  socialProofCount: '237 mujeres esta semana',
  socialProofText: 'empezaron el protocolo para',
  reframeTitle: 'No es falta de voluntad. Es inflamación.',
  reframeBody: 'Tu hinchazón no es porque "comes mal". Es una respuesta inflamatoria a alimentos que crees saludables pero que tu intestino no tolera. El protocolo identifica cuáles son y los elimina en 7 días.',
  ctaButton: 'OBTENER MI PLAN →',
  finalCtaHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}tu plan te está esperando`,
  finalCtaSubtext: 'Aprovecha el 64% de descuento antes de que expire.',
  guaranteeText: 'Tienes 7 días para probarlo. Si no ves resultados, te devolvemos tu dinero sin preguntas. Un email y listo.',
  choosePlanTitle: 'Elige tu plan',
  weeklyHighlights: [
    { week: 1, title: 'Limpieza intestinal', desc: 'Elimina los 7 alimentos que te inflaman sin que lo sepas' },
    { week: 2, title: 'Siéntete liviana', desc: 'Restaura tu microbiota con el protocolo antiinflamatorio' },
    { week: 3, title: 'Barriga plana', desc: 'Reincorpora alimentos seguros y consolida resultados' },
    { week: 4, title: 'Mantenimiento de por vida', desc: 'Tu nuevo estilo de vida sin hinchazón' },
  ],
  faqItems: [
    { q: '¿El plan se adapta a mi situación particular?', a: '¡Sí! Tu plan está hiper-personalizado según tus respuestas. Además, puedes ajustar preferencias dentro de la app.' },
    { q: '¿Cómo accedo al plan?', a: 'Inmediatamente después del pago recibes acceso a la app Chau Hinchazón en tu celular. Es una PWA — no necesitas descargar nada de la tienda.' },
    { q: '¿Qué pasa si me cuesta mantener la motivación?', a: 'El plan está diseñado para ser gradual. Empiezas con solo 5 minutos al día y la app te guía paso a paso con recordatorios.' },
    { q: '¿Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
  ],
  testimonials: [
    { quote: 'Al día 4 se me deshinchó la barriga. ¡No lo podía creer!', author: 'Milagros', age: 37 },
    { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Claudia', age: 43 },
    { quote: 'Por fin entendí qué me inflamaba. Años sin saberlo.', author: 'Jimena', age: 35 },
  ],
  discountText: (time) => `🔥 64% de descuento por ${time}`,
  paymentBadges: '💳 Visa · Mastercard · Yape',
  securityBadge: '🔒 Pago seguro SSL',
};


const TEXTS_MX: CountryTexts = {
  heroHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}¡deshincha tu pancita en 7 días!`,
  socialProofCount: '237 mujeres esta semana',
  socialProofText: 'empezaron el protocolo para',
  reframeTitle: 'No es falta de voluntad. Es inflamación.',
  reframeBody: 'Tu hinchazón no es porque "comes mal". Es una respuesta inflamatoria a alimentos que crees saludables pero que tu intestino no tolera. El protocolo identifica cuáles son y los elimina en 7 días.',
  ctaButton: 'OBTENER MI PLAN →',
  finalCtaHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}tu plan te está esperando`,
  finalCtaSubtext: 'Aprovecha el 64% de descuento antes de que expire.',
  guaranteeText: 'Tienes 7 días para probarlo. Si no ves resultados, te devolvemos tu dinero sin preguntas. Un email y listo.',
  choosePlanTitle: 'Elige tu plan',
  weeklyHighlights: [
    { week: 1, title: 'Limpieza intestinal', desc: 'Elimina los 7 alimentos que te inflaman sin que lo sepas' },
    { week: 2, title: 'Siéntete ligera', desc: 'Restaura tu microbiota con el protocolo antiinflamatorio' },
    { week: 3, title: 'Pancita plana', desc: 'Reincorpora alimentos seguros y consolida resultados' },
    { week: 4, title: 'Mantenimiento de por vida', desc: 'Tu nuevo estilo de vida sin hinchazón' },
  ],
  faqItems: [
    { q: '¿El plan se adapta a mi situación particular?', a: '¡Sí! Tu plan está hiper-personalizado según tus respuestas. Además, puedes ajustar preferencias dentro de la app.' },
    { q: '¿Cómo accedo al plan?', a: 'Inmediatamente después del pago recibes acceso a la app Chau Hinchazón en tu celular. Es una PWA — no necesitas descargar nada de la tienda.' },
    { q: '¿Qué pasa si me cuesta mantener la motivación?', a: 'El plan está diseñado para ser gradual. Empiezas con solo 5 minutos al día y la app te guía paso a paso con recordatorios.' },
    { q: '¿Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
  ],
  testimonials: [
    { quote: 'Al día 4 se me deshinchó la pancita. ¡No lo podía creer!', author: 'Fernanda', age: 40 },
    { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Alejandra', age: 47 },
    { quote: 'Por fin entendí qué me inflamaba. Años sin saberlo.', author: 'Karla', age: 34 },
  ],
  discountText: (time) => `🔥 64% de descuento por ${time}`,
  paymentBadges: '💳 Visa · Mastercard · OXXO',
  securityBadge: '🔒 Pago seguro SSL',
};


const TEXTS_CL: CountryTexts = {
  heroHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}¡deshincha tu guata en 7 días!`,
  socialProofCount: '237 mujeres esta semana',
  socialProofText: 'empezaron el protocolo para',
  reframeTitle: 'No es falta de voluntad. Es inflamación.',
  reframeBody: 'Tu hinchazón no es porque "comes mal". Es una respuesta inflamatoria a alimentos que crees saludables pero que tu intestino no tolera. El protocolo identifica cuáles son y los elimina en 7 días.',
  ctaButton: 'OBTENER MI PLAN →',
  finalCtaHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}tu plan te está esperando`,
  finalCtaSubtext: 'Aprovecha el 64% de descuento antes de que expire.',
  guaranteeText: 'Tienes 7 días para probarlo. Si no ves resultados, te devolvemos tu plata sin preguntas. Un email y listo.',
  choosePlanTitle: 'Elige tu plan',
  weeklyHighlights: [
    { week: 1, title: 'Limpieza intestinal', desc: 'Elimina los 7 alimentos que te inflaman sin que lo sepas' },
    { week: 2, title: 'Siéntete liviana', desc: 'Restaura tu microbiota con el protocolo antiinflamatorio' },
    { week: 3, title: 'Guata plana', desc: 'Reincorpora alimentos seguros y consolida resultados' },
    { week: 4, title: 'Mantenimiento de por vida', desc: 'Tu nuevo estilo de vida sin hinchazón' },
  ],
  faqItems: [
    { q: '¿El plan se adapta a mi situación particular?', a: '¡Sí! Tu plan está hiper-personalizado según tus respuestas. Además, puedes ajustar preferencias dentro de la app.' },
    { q: '¿Cómo accedo al plan?', a: 'Inmediatamente después del pago recibes acceso a la app Chau Hinchazón en tu celular. Es una PWA — no necesitas descargar nada de la tienda.' },
    { q: '¿Qué pasa si me cuesta mantener la motivación?', a: 'El plan está diseñado para ser gradual. Empiezas con solo 5 minutos al día y la app te guía paso a paso con recordatorios.' },
    { q: '¿Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
  ],
  testimonials: [
    { quote: 'Al día 4 se me deshinchó la guata. ¡No lo podía creer!', author: 'Constanza', age: 38 },
    { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Francisca', age: 44 },
    { quote: 'Por fin caché qué me inflamaba. Años sin cachar.', author: 'Javiera', age: 33 },
  ],
  discountText: (time) => `🔥 64% de descuento por ${time}`,
  paymentBadges: '💳 Visa · Mastercard · Redcompra',
  securityBadge: '🔒 Pago seguro SSL',
};

export const TEXTS_BY_COUNTRY: Record<CountryCode, CountryTexts> = {
  AR: TEXTS_AR,
  CO: TEXTS_CO,
  PE: TEXTS_PE,
  MX: TEXTS_MX,
  CL: TEXTS_CL,
};


// ═══════════════════════════════════════════════════════════════════════════
// TEXTOS DEL QUIZ (preguntas) POR PAÍS
// Solo las variaciones significativas — el resto se usa como fallback de AR
// ═══════════════════════════════════════════════════════════════════════════

export interface QuizQuestionOverride {
  question?: string;
  subtitle?: string;
  options?: { value: string; label: string; emoji?: string }[];
}

/**
 * Overrides por país para los slides del quiz.
 * Solo se incluyen los que tienen diferencias significativas con AR.
 * La lógica de merge está en el hook useCountryLocale.
 */
export const QUIZ_OVERRIDES: Record<CountryCode, Record<string, QuizQuestionOverride>> = {
  AR: {}, // base — sin overrides
  CO: {
    situacion_actual: {
      question: '¿Cuál es tu situación actual con la hinchazón?',
      options: [
        { value: 'todos_dias', label: 'Me hincho todos los días', emoji: '😩' },
        { value: 'no_se_causa', label: 'No sé qué me la causa', emoji: '🤔' },
        { value: 'probe_todo', label: 'Ya probé de todo sin resultados', emoji: '😤' },
        { value: 'comoda', label: 'Quiero sentirme cómoda con mi cuerpo', emoji: '✨' },
      ],
    },
    momento_hinchazon: {
      question: '¿En qué momento del día sientes MÁS la hinchazón?',
      options: [
        { value: 'manana', label: 'Apenas me levanto', emoji: '🌅' },
        { value: 'almuerzo', label: 'Después del almuerzo', emoji: '🍽️' },
        { value: 'tarde_noche', label: 'En la tarde / noche', emoji: '🌙' },
        { value: 'todo_el_dia', label: 'Todo el día sin parar', emoji: '😩' },
      ],
    },
    frecuencia: {
      question: '¿Con qué frecuencia te sientes hinchada?',
    },
    impacto_emocional: {
      question: '¿Cómo te hace sentir tener la barriga hinchada?',
    },
    impacto_social: {
      question: '¿Evitas situaciones sociales por la hinchazón?',
      options: [
        { value: 'si_mucho', label: 'Sí, bastante seguido' },
        { value: 'a_veces', label: 'A veces evito salir o ponerme cierta ropa' },
        { value: 'poco', label: 'Casi nunca, pero me incomoda' },
        { value: 'no', label: 'No, no me afecta socialmente' },
      ],
    },
  },
  PE: {
    momento_hinchazon: {
      question: '¿En qué momento del día sientes MÁS la hinchazón?',
      options: [
        { value: 'manana', label: 'Apenas me levanto', emoji: '🌅' },
        { value: 'almuerzo', label: 'Después del almuerzo', emoji: '🍽️' },
        { value: 'tarde_noche', label: 'En la tarde / noche', emoji: '🌙' },
        { value: 'todo_el_dia', label: 'Todo el día sin parar', emoji: '😩' },
      ],
    },
    frecuencia: {
      question: '¿Con qué frecuencia te sientes hinchada?',
    },
    impacto_emocional: {
      question: '¿Cómo te hace sentir tener la barriga hinchada?',
    },
    impacto_social: {
      question: '¿Evitas situaciones sociales por la hinchazón?',
    },
  },
  MX: {
    momento_hinchazon: {
      question: '¿En qué momento del día sientes MÁS la hinchazón?',
      options: [
        { value: 'manana', label: 'Apenas me levanto', emoji: '🌅' },
        { value: 'almuerzo', label: 'Después de comer', emoji: '🍽️' },
        { value: 'tarde_noche', label: 'En la tarde / noche', emoji: '🌙' },
        { value: 'todo_el_dia', label: 'Todo el día sin parar', emoji: '😩' },
      ],
    },
    frecuencia: {
      question: '¿Con qué frecuencia te sientes hinchada?',
    },
    impacto_emocional: {
      question: '¿Cómo te hace sentir tener la pancita hinchada?',
    },
    impacto_social: {
      question: '¿Evitas situaciones sociales por la hinchazón?',
    },
    objetivo: {
      question: '¿Qué resultado quieres lograr en los próximos 7 días?',
      options: [
        { value: 'panza_plana', label: 'Bajar 2-3 cm de pancita', emoji: '📏' },
        { value: 'liviana', label: 'Sentirme ligera después de comer', emoji: '🌿' },
        { value: 'digestion', label: 'Mejorar mi digestión', emoji: '✨' },
        { value: 'todo', label: 'Todo lo anterior', emoji: '🎯' },
      ],
    },
  },
  CL: {
    momento_hinchazon: {
      question: '¿En qué momento del día sientes MÁS la hinchazón?',
      options: [
        { value: 'manana', label: 'Apenas me levanto', emoji: '🌅' },
        { value: 'almuerzo', label: 'Después de almorzar', emoji: '🍽️' },
        { value: 'tarde_noche', label: 'En la tarde / noche', emoji: '🌙' },
        { value: 'todo_el_dia', label: 'Todo el día sin parar', emoji: '😩' },
      ],
    },
    frecuencia: {
      question: '¿Con qué frecuencia te sientes hinchada?',
    },
    impacto_emocional: {
      question: '¿Cómo te hace sentir tener la guata hinchada?',
    },
    objetivo: {
      question: '¿Qué resultado quieres lograr en los próximos 7 días?',
      options: [
        { value: 'panza_plana', label: 'Bajar 2-3 cm de guata', emoji: '📏' },
        { value: 'liviana', label: 'Sentirme liviana después de comer', emoji: '🌿' },
        { value: 'digestion', label: 'Mejorar mi digestión', emoji: '✨' },
        { value: 'todo', label: 'Todo lo anterior', emoji: '🎯' },
      ],
    },
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// SOCIAL PROOF OVERRIDES POR PAÍS
// ═══════════════════════════════════════════════════════════════════════════

export const SOCIAL_PROOF_OVERRIDES: Record<CountryCode, { slide1Text: string; testimonials?: { quote: string; author: string }[] }> = {
  AR: {
    slide1Text: 'de panza en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya no me cerraba el jean. No lo podía creer.', author: 'Anabela, 41 · Buenos Aires' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Lucía, 38 · Córdoba' },
    ],
  },
  CO: {
    slide1Text: 'de barriga en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya la barriga estaba deshinchada. ¡No lo podía creer!', author: 'Catalina, 39 · Bogotá' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Valentina, 42 · Medellín' },
    ],
  },
  PE: {
    slide1Text: 'de barriga en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya la barriga estaba deshinchada. ¡No lo podía creer!', author: 'Milagros, 37 · Lima' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Claudia, 43 · Arequipa' },
    ],
  },
  MX: {
    slide1Text: 'de pancita en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya la pancita estaba deshinchada. ¡No lo podía creer!', author: 'Fernanda, 40 · CDMX' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Alejandra, 47 · Guadalajara' },
    ],
  },
  CL: {
    slide1Text: 'de guata en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya la guata estaba deshinchada. ¡No lo podía creer!', author: 'Constanza, 38 · Santiago' },
      { quote: 'En 7 días caché cuál era el alimento que me inflamaba hace años.', author: 'Javiera, 33 · Viña del Mar' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: DEFAULT COUNTRY
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_COUNTRY: CountryCode = 'AR';

export function isValidCountry(code: string | null | undefined): code is CountryCode {
  return !!code && ['AR', 'CO', 'PE', 'MX', 'CL'].includes(code.toUpperCase());
}
