/**
 * @file localization.ts — Localización por país para el quiz funnel V2.
 *
 * Países soportados: CL, CO, MX, PE, US. Argentina (AR) y Brasil (BR) NO
 * están: Argentina ya no se vende desde este proyecto, y Brasil queda
 * bloqueado a nivel middleware.
 *
 * Moneda: USD para los 5 países. El producto es un único "info-product"
 * de Hotmart cobrado en dólares (Hotmart hace la conversión local en el
 * checkout según el país detectado en su lado).
 *
 * Imagen de prueba social (newspaper) por país: cada país muestra una nota
 * de prensa simulando un periódico local. La ruta de la imagen sale de
 * `socialProofImage` y vive en `/public/img/noticia-viral-{cc}.jpg` —
 * el slug es el código de país en minúscula (ver SlideViralNews).
 *
 * PARA AGREGAR UN PAÍS NUEVO:
 *   1. Agregar el código al type `CountryCode`.
 *   2. Agregar entrada en `PRICING_BY_COUNTRY` (puede ser un alias del USD base).
 *   3. Agregar entrada en `TEXTS_BY_COUNTRY` (copiar uno parecido y ajustar).
 *   4. Agregar entrada en `QUIZ_OVERRIDES` (overrides puntuales — el resto cae
 *      al base del quiz).
 *   5. Agregar entrada en `SOCIAL_PROOF_OVERRIDES` con la `socialProofImage`.
 *   6. Sumar el código al CHECK de `country` en `supabase/setup.sql` y al
 *     `isValidCountry()` de abajo.
 *   7. Crear la ruta SEO en `app/{slug}/page.tsx` (ver app/chile/page.tsx).
 *   8. Subir la imagen del periódico a `/public/img/noticia-viral-{cc}.jpg`.
 */

export type CountryCode = 'CL' | 'CO' | 'MX' | 'PE' | 'US';

export interface CountryPricing {
  currency: string;       // ISO 4217 (siempre 'USD' por ahora).
  symbol: string;         // Glyph para mostrar (ej: '$', 'US$').
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
// PRECIOS POR PAÍS — TODOS EN USD (un solo producto Hotmart en dólares)
// ═══════════════════════════════════════════════════════════════════════════
//
// Como es un solo producto en USD, los 5 países comparten EXACTAMENTE los
// mismos precios. Mantenemos la estructura por país por si en el futuro
// querés diferenciarlos (precio promocional para un mercado, por ejemplo).
//
// La estructura conserva 3 planes (1sem/4sem/8sem) por compatibilidad con el
// código actual; el funnel solo usa el plan `1sem` en la sales page (front).
// El upsell/downsell tienen sus propios precios (ver lib/quiz-v2/config.ts →
// PRICING).

const USD_PRICING: CountryPricing = {
  currency: 'USD',
  symbol: 'US$',
  plans: {
    '1sem': { price: 'US$19', originalPrice: 'US$49',  perDay: 'US$2.71/día' },
    '4sem': { price: 'US$39', originalPrice: 'US$99',  perDay: 'US$1.30/día' },
    '8sem': { price: 'US$59', originalPrice: 'US$149', perDay: 'US$0.98/día' },
  },
  valueStack: {
    protocolo:  'US$59',
    recetas:    'US$39',
    kitExpress: 'US$19',
    diario:     'US$29',
    totalValue: 'US$146',
  },
  comparison: {
    nutricionista: 'US$80–150/mes',
    gastro:        'US$200 consulta',
    protocolo:     'desde US$0.98/día',
  },
};

export const PRICING_BY_COUNTRY: Record<CountryCode, CountryPricing> = {
  CL: USD_PRICING,
  CO: USD_PRICING,
  MX: USD_PRICING,
  PE: USD_PRICING,
  US: USD_PRICING,
};


// ═══════════════════════════════════════════════════════════════════════════
// TEXTOS POR PAÍS
// Español neutro variando algunos modismos (panza/barriga/guata/pancita) y
// los métodos de pago disponibles. US arranca como "neutro" porque la
// audiencia objetivo son hispanohablantes en EE.UU.
// ═══════════════════════════════════════════════════════════════════════════

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
    { q: 'Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
  ],
  testimonials: [
    { quote: 'Al día 4 se me deshinchó la guata. ¡No lo podía creer!', author: 'Constanza', age: 38 },
    { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Francisca', age: 44 },
    { quote: 'Por fin caché qué me inflamaba. Años sin cachar.', author: 'Javiera', age: 33 },
  ],
  discountText: (time) => `🔥 64% de descuento por ${time}`,
  paymentBadges: '💳 Visa · Mastercard · Webpay',
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
    { q: 'Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
  ],
  testimonials: [
    { quote: 'Al día 4 se me deshinchó la barriga. ¡No lo podía creer!', author: 'Catalina', age: 39 },
    { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Valentina', age: 51 },
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
    { q: 'Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
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
    { q: 'Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
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

// US apunta a la audiencia hispanohablante en Estados Unidos. Tono neutro,
// sin modismos regionales fuertes (para que se sienta natural a una mexicana,
// una colombiana o una venezolana en EE.UU.).
const TEXTS_US: CountryTexts = {
  heroHeadline: (nombre) => `${nombre ? `${nombre}, ` : ''}¡deshincha tu abdomen en 7 días!`,
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
    { week: 3, title: 'Abdomen plano', desc: 'Reincorpora alimentos seguros y consolida resultados' },
    { week: 4, title: 'Mantenimiento de por vida', desc: 'Tu nuevo estilo de vida sin hinchazón' },
  ],
  faqItems: [
    { q: '¿El plan se adapta a mi situación particular?', a: '¡Sí! Tu plan está hiper-personalizado según tus respuestas. Además, puedes ajustar preferencias dentro de la app.' },
    { q: '¿Cómo accedo al plan?', a: 'Inmediatamente después del pago recibes acceso a la app Chau Hinchazón en tu celular. Es una PWA — no necesitas descargar nada de la tienda.' },
    { q: '¿Qué pasa si me cuesta mantener la motivación?', a: 'El plan está diseñado para ser gradual. Empiezas con solo 5 minutos al día y la app te guía paso a paso con recordatorios.' },
    { q: 'Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?', a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.' },
  ],
  testimonials: [
    { quote: 'Al día 4 se me deshinchó el abdomen. ¡No lo podía creer!', author: 'Gabriela', age: 39 },
    { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Mariana', age: 44 },
    { quote: 'Por fin entendí qué me inflamaba. Años sin saberlo.', author: 'Sofía', age: 36 },
  ],
  discountText: (time) => `🔥 64% de descuento por ${time}`,
  paymentBadges: '💳 Visa · Mastercard · Amex · PayPal',
  securityBadge: '🔒 Pago seguro SSL',
};

export const TEXTS_BY_COUNTRY: Record<CountryCode, CountryTexts> = {
  CL: TEXTS_CL,
  CO: TEXTS_CO,
  PE: TEXTS_PE,
  MX: TEXTS_MX,
  US: TEXTS_US,
};


// ═══════════════════════════════════════════════════════════════════════════
// TEXTOS DEL QUIZ (preguntas) POR PAÍS
// Solo overrides puntuales — el resto cae al texto base de data.ts.
// ═══════════════════════════════════════════════════════════════════════════

export interface QuizQuestionOverride {
  question?: string;
  subtitle?: string;
  options?: { value: string; label: string; emoji?: string }[];
}

export const QUIZ_OVERRIDES: Record<CountryCode, Record<string, QuizQuestionOverride>> = {
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
  US: {
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
      question: '¿Cómo te hace sentir tener el abdomen hinchado?',
    },
    impacto_social: {
      question: '¿Evitas situaciones sociales por la hinchazón?',
    },
    objetivo: {
      question: '¿Qué resultado quieres lograr en los próximos 7 días?',
      options: [
        { value: 'panza_plana', label: 'Bajar 2-3 cm de abdomen', emoji: '📏' },
        { value: 'liviana', label: 'Sentirme ligera después de comer', emoji: '🌿' },
        { value: 'digestion', label: 'Mejorar mi digestión', emoji: '✨' },
        { value: 'todo', label: 'Todo lo anterior', emoji: '🎯' },
      ],
    },
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// PRUEBA SOCIAL POR PAÍS — slide "noticia viral" + testimonios localizados
// ═══════════════════════════════════════════════════════════════════════════
//
// `socialProofImage` apunta a la imagen del periódico local (slide 4 del quiz).
// Las imágenes viven en `/public/img/noticia-viral-{cc}.jpg` (cc = código en
// minúscula). Si la imagen no existe, SlideViralNews muestra el fallback de
// texto con el nombre del medio sugerido.
//
// SUGERENCIAS DE PERIÓDICO POR PAÍS (para que el equipo creativo cree el mockup):
//   CL → BioBio Chile o La Tercera
//   CO → El Tiempo o Semana
//   MX → El Universal o Milenio
//   PE → El Comercio o RPP
//   US → USA Today o CNN en Español

export interface CountrySocialProof {
  /** Texto del slide 1 (social proof "X mujeres bajaron Y de panza..."). */
  slide1Text: string;
  /** Testimonios alternativos para slide 3 (opcional). */
  testimonials?: { quote: string; author: string }[];
  /** Imagen del periódico que se muestra en el slide "noticia viral" (slide 4). */
  socialProofImage: string;
  /** Nombre del medio (para el alt text de la imagen y el fallback). */
  socialProofSource: string;
}

export const SOCIAL_PROOF_OVERRIDES: Record<CountryCode, CountrySocialProof> = {
  CL: {
    slide1Text: 'de guata en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya la guata estaba deshinchada. ¡No lo podía creer!', author: 'Constanza, 38 · Santiago' },
      { quote: 'En 7 días caché cuál era el alimento que me inflamaba hace años.', author: 'Javiera, 33 · Viña del Mar' },
    ],
    socialProofImage: '/img/noticia-viral-cl.jpg',
    socialProofSource: 'BioBio Chile',
  },
  CO: {
    slide1Text: 'de barriga en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya la barriga estaba deshinchada. ¡No lo podía creer!', author: 'Catalina, 39 · Bogotá' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Valentina, 42 · Medellín' },
    ],
    socialProofImage: '/img/noticia-viral-co.jpg',
    socialProofSource: 'El Tiempo',
  },
  PE: {
    slide1Text: 'de barriga en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya la barriga estaba deshinchada. ¡No lo podía creer!', author: 'Milagros, 37 · Lima' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Claudia, 43 · Arequipa' },
    ],
    socialProofImage: '/img/noticia-viral-pe.jpg',
    socialProofSource: 'El Comercio',
  },
  MX: {
    slide1Text: 'de pancita en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya la pancita estaba deshinchada. ¡No lo podía creer!', author: 'Fernanda, 40 · CDMX' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Alejandra, 47 · Guadalajara' },
    ],
    socialProofImage: '/img/noticia-viral-mx.jpg',
    socialProofSource: 'El Universal',
  },
  US: {
    slide1Text: 'de abdomen en 7 días. Es lo que reportan en promedio las mujeres que completan el protocolo.',
    testimonials: [
      { quote: 'Al día 4 ya el abdomen estaba deshinchado. ¡No lo podía creer!', author: 'Gabriela, 39 · Miami' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Mariana, 44 · Houston' },
    ],
    socialProofImage: '/img/noticia-viral-us.jpg',
    socialProofSource: 'CNN en Español',
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// HELPER: DEFAULT COUNTRY + VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * País por defecto cuando no se puede detectar nada (URL/path/localStorage/IP).
 * Lo usamos como fallback razonable (uno de los 5 países soportados, no
 * necesariamente el más grande del mercado).
 */
export const DEFAULT_COUNTRY: CountryCode = 'CL';

const SUPPORTED_COUNTRIES: ReadonlyArray<CountryCode> = ['CL', 'CO', 'MX', 'PE', 'US'];

export function isValidCountry(code: string | null | undefined): code is CountryCode {
  if (!code) return false;
  return (SUPPORTED_COUNTRIES as ReadonlyArray<string>).includes(code.toUpperCase());
}
