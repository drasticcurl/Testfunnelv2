/**
 * @file config.ts — Configuración centralizada del quiz funnel.
 *
 * PARA REUTILIZAR CON OTRO NICHO:
 * Es EL archivo principal a tocar. Acá vive todo lo que define la "temática"
 * del funnel: nombre del producto, experta, checkout URL, banners
 * estacionales, tipos de problema, textos de dolor, y bonus por respuesta.
 *
 * Junto con `data.ts` (preguntas) y `localization.ts` (precios y textos por
 * país), son los 3 archivos que definen el contenido del funnel. El resto
 * es infraestructura reutilizable.
 *
 * Cobro: TODOS los países (CL/CO/MX/PE/US) cobran con UN ÚNICO producto
 * de Hotmart en USD. Argentina ya no se vende desde este proyecto.
 */

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTO
// ═══════════════════════════════════════════════════════════════════════════

/** Nombre del producto como aparece en la sales page y la app. */
export const PRODUCT_NAME = 'Protocolo Chau Hinchazón';

/** Nombre corto para badges, CTAs compactos. */
export const PRODUCT_SHORT_NAME = 'Chau Hinchazón';

/** Nombre del producto del UPSELL/DOWNSELL (Programa 30 días TURBO). */
export const UPSELL_PRODUCT_NAME = 'Programa de 30 Días TURBO';

/** Nombre de la profesional/experta que respalda el producto. */
export const EXPERT_NAME = 'Natalia Reyes';

/** Título profesional de la experta. */
export const EXPERT_TITLE = 'Nutricionista · Especialista en salud digestiva';

/** Imagen de la experta (ruta en /public). */
export const EXPERT_IMAGE = '/img/natalia-reyes.jpg';


// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT URLS — Hotmart (un solo producto en USD para todos los países)
// ═══════════════════════════════════════════════════════════════════════════
//
// Hotmart hace la conversión de moneda en su checkout: el comprador ve los
// precios en su moneda local pero la venta se cobra en USD a nuestra cuenta.
// Por eso necesitamos UNA sola URL por etapa del embudo (front/upsell/downsell)
// y no una por país.
//
// Las env vars son `NEXT_PUBLIC_*` porque la URL la usa el cliente para
// abrir/redirigir al checkout (no es un secreto — lo ve el navegador).
//
// Si alguna queda vacía, los CTAs muestran un placeholder que no procesa
// pagos (útil en staging para no cobrar de verdad).

const PLACEHOLDER_CHECKOUT = 'https://checkout.placeholder.invalid/PLACEHOLDER';

/** Checkout del producto FRONT (lo que vende el quiz al final). */
export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL || PLACEHOLDER_CHECKOUT;

/** Checkout del UPSELL (Programa 30 días TURBO post-compra del front). */
export const UPSELL_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL || '';

/** Checkout del DOWNSELL (mismo programa 30 días, precio menor si rechazan). */
export const DOWNSELL_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_HOTMART_DOWNSELL_CHECKOUT_URL || '';

/** URL base de la PWA (a donde va el "no gracias" final del downsell). */
export const PWA_BASE_URL =
  process.env.NEXT_PUBLIC_PWA_BASE_URL || 'https://chauhinchazon.hilvanapp.com/pwa/login';


// ═══════════════════════════════════════════════════════════════════════════
// PRECIOS DEL FUNNEL — fuente única de verdad (todo en USD)
// ═══════════════════════════════════════════════════════════════════════════
//
// Reglas:
//  - `amount`  = número crudo en USD. Es lo que se manda a Meta (value+currency).
//  - `display` = string formateado para mostrar en pantalla ("US$19").
//  - Cambiar un precio se hace SOLO acá.
//
// Tracking: el Purchase REAL lo dispara el webhook de Hotmart server-side con
// el monto que cobra Hotmart. Estos `amount` se usan para los eventos de
// intención (InitiateCheckout / ViewContent), NO para el Purchase final.
//
// Los precios que ve el comprador en la sales page vienen de
// `localization.ts → PRICING_BY_COUNTRY[country].plans` (mismos USD, repetidos
// por país para preservar la API). Acá guardamos los amounts numéricos y los
// displays "canónicos" que usan las páginas que NO tienen contexto de país
// (oferta/upsell/downsell, que ya están en USD para todos).

export const PRICING_CURRENCY = 'USD';

export const PRICING = {
  /** Producto principal (final del quiz). Plan 7 días + app. */
  front:    { amount: 19, display: 'US$19', displayOriginal: 'US$49' },
  /** Upsell post-compra: Programa 30 días TURBO (incluye recetario de postres). */
  upsell:   { amount: 39, display: 'US$39', displayOriginal: 'US$99' },
  /** Downsell: mismo Programa 30 días, US$10 menos si rechazan el upsell. */
  downsell: { amount: 29, display: 'US$29' },
} as const;


// ═══════════════════════════════════════════════════════════════════════════
// BANNERS ESTACIONALES POR HEMISFERIO
// ═══════════════════════════════════════════════════════════════════════════
//
// CL está en hemisferio sur (otoño/invierno desfasado). CO/MX/PE/US tienen
// estaciones menos marcadas o están en el hemisferio norte → tono "verano /
// oferta de temporada" más neutro.

import type { CountryCode } from './localization';

/** Banner de la landing cover (slide 0). */
export const SEASON_BANNER: Record<CountryCode, string> = {
  CL: 'Últimos días de otoño — arranca antes del invierno',
  CO: 'Oferta especial de temporada',
  MX: 'Oferta especial de temporada',
  PE: 'Oferta especial de temporada',
  US: 'Oferta especial de temporada',
};

/** Banner de la countdown bar en la sales page. Recibe el tiempo restante. */
export const SEASON_DISCOUNT: Record<CountryCode, (time: string) => string> = {
  CL: (t) => `❄️ Precio especial fin de otoño: 64% off por ${t}`,
  CO: (t) => `🔥 Oferta de temporada: 64% off por ${t}`,
  MX: (t) => `🔥 Oferta de temporada: 64% off por ${t}`,
  PE: (t) => `🔥 Oferta de temporada: 64% off por ${t}`,
  US: (t) => `🔥 Oferta de temporada: 64% off por ${t}`,
};


// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DE RESULTADO DEL QUIZ — única fuente de verdad
// ═══════════════════════════════════════════════════════════════════════════
//
// PARA REUTILIZAR CON OTRO NICHO: cambiá SOLO los valores (los strings que
// ve el usuario). El scoring usa los números 1-4, no los textos.

export const QUIZ_RESULT_TYPE_NAMES: Record<number, string> = {
  1: 'Hinchazón Matutina',
  2: 'Hinchazón Postprandial',
  3: 'Hinchazón Vespertina',
  4: 'Hinchazón Crónica',
};

/**
 * @deprecated Usar `QUIZ_RESULT_TYPE_NAMES`. Alias para compat.
 */
export const TIPO_NOMBRES = QUIZ_RESULT_TYPE_NAMES;

/**
 * Bullets del "espejo de dolor" por tipo (sales page → sección Reframe).
 */
export const REFRAME_BULLETS: Record<number, string[]> = {
  1: [
    'Tu inflamación matutina indica que tu intestino no descansa bien durante la noche.',
    'El protocolo incluye una rutina nocturna que resetea tu sistema digestivo.',
    'Desde el día 2 vas a notar que te levantas con la panza plana.',
  ],
  2: [
    'Tu intestino no procesa bien ciertas combinaciones de alimentos.',
    'El protocolo identifica los 7 alimentos que te fermentan y los elimina.',
    'Desde el día 3 vas a poder almorzar sin inflarte después.',
  ],
  3: [
    'La hinchazón que se acumula durante el día indica estrés digestivo crónico.',
    'El protocolo incluye una rutina antiinflamatoria vespertina de 5 minutos.',
    'En 7 días tu panza va a dejar de "crecer" a lo largo del día.',
  ],
  4: [
    'La hinchazón constante indica disbiosis intestinal avanzada.',
    'El protocolo hace un reset completo de tu microbiota en 7 días.',
    'Es el caso que más mejora porque tenés más margen de cambio.',
  ],
};

/**
 * Items extra del value stack por tipo (bonus específico del subtipo).
 */
export const EXTRA_VALUE_ITEMS: Record<number, { icon: string; title: string; desc: string }[]> = {
  1: [
    { icon: '🌙', title: 'Guía de rutina nocturna reparadora', desc: 'Protocolo pre-sueño para que tu intestino descanse y te levantes deshinchada.' },
  ],
  2: [
    { icon: '🥗', title: 'Tabla de combinación de alimentos', desc: 'Sabes exactamente qué mezclar y qué no para evitar fermentación post-comida.' },
  ],
  3: [
    { icon: '🧘', title: 'Rutina antiinflamatoria vespertina (5 min)', desc: 'Ejercicios de respiración + masaje abdominal para deshinchar al final del día.' },
  ],
  4: [
    { icon: '🔄', title: 'Protocolo de reset intestinal intensivo', desc: 'Plan reforzado de 3 días para los casos más persistentes. Reset completo.' },
  ],
};


// ═══════════════════════════════════════════════════════════════════════════
// BONUS POR RESPUESTA
// ═══════════════════════════════════════════════════════════════════════════

/** Título del bonus desbloqueado según las respuestas del quiz. */
export function getBonusTitle(answers: Record<string, unknown>): string {
  if (answers.estres === 'alto') return 'Guía de manejo del estrés digestivo';
  if (answers.evento_importante && answers.evento_importante !== 'no')
    return 'Plan express pre-evento (deshinchate en 48hs)';
  if (answers.ejercicio === 'no') return 'Rutina de 5 minutos sin ejercicio';
  return 'Checklist de alimentos antiinflamatorios por tipo';
}

/** Descripción del bonus desbloqueado. */
export function getBonusDesc(answers: Record<string, unknown>): string {
  if (answers.estres === 'alto')
    return 'Tu estrés alto activa la inflamación intestinal. Esta guía te enseña técnicas rápidas para cortarlo.';
  if (answers.evento_importante && answers.evento_importante !== 'no')
    return 'Protocolo intensivo de 48hs para llegar deshinchada a tu evento. Funciona siempre.';
  if (answers.ejercicio === 'no')
    return 'No necesitas moverte mucho. 5 minutos de auto-masaje abdominal + respiración = panza plana.';
  return 'Lista personalizada de qué comer y qué evitar según tu Tipo de Hinchazón.';
}


// ═══════════════════════════════════════════════════════════════════════════
// LABELS DE OBJETIVO
// ═══════════════════════════════════════════════════════════════════════════

export const OBJETIVO_LABEL: Record<string, string> = {
  panza_plana: 'Deshinchar tu panza',
  liviana: 'Sentirte liviana después de comer',
  digestion: 'Mejorar tu digestión',
  todo: 'Deshincharte, sentirte liviana y mejorar tu digestión',
};
