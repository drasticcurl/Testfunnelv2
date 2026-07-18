/**
 * @file config-latam.ts — Configuración del funnel PARALELO LATAM.
 *
 * Este archivo es la configuración del funnel LATAM (Hotmart, USD, español
 * neutro con "tú"), que corre EN PARALELO al funnel argentino.
 *
 * Diferencias clave respecto al funnel AR:
 *  - PRECIOS en USD (dólares). Esta es la fuente única de verdad para los
 *    precios que se muestran en pantalla y los `value` de los eventos de
 *    intención (InitiateCheckout/ViewContent) del funnel LATAM.
 *  - El CHECKOUT es vía Hotmart (URLs desde nuevas env vars NEXT_PUBLIC_LATAM_*).
 *  - Los textos usan español neutro tratando de "tú".
 *
 * IMPORTANTE: El funnel ARGENTINO usa `config.ts` (Shopify, ARS) y es
 * totalmente INDEPENDIENTE de este archivo. No modificar config.ts: ambos
 * funnels coexisten sin pisarse.
 *
 * NOTA (tracking): el Purchase REAL lo dispara server-side el webhook de
 * Hotmart con el monto que cobra Hotmart. Los `amount` de acá se usan para
 * los eventos de intención, no para el Purchase.
 */

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTO (español neutro, "tú")
// ═══════════════════════════════════════════════════════════════════════════

/** Nombre del producto como aparece en la sales page y la app (LATAM). */
export const PRODUCT_NAME_LATAM = 'Protocolo Chau Hinchazón';

/** Nombre corto para badges, CTAs compactos (LATAM). */
export const PRODUCT_SHORT_NAME_LATAM = 'Chau Hinchazón';

/**
 * Nombre del producto del UPSELL/DOWNSELL (LATAM). Es el MISMO Programa de 30
 * Días, con la marca "TURBO" del VSL del upsell.
 */
export const UPSELL_PRODUCT_NAME_LATAM = 'Programa de 30 Días TURBO';

/**
 * Nombre del producto del UPSELL 2 / DOWNSELL 2 (LATAM): el Acceso VIP de por
 * vida. Es el MISMO producto VIP tanto en el upsell 2 (US$27) como en el
 * downsell 2 (US$17) — solo cambia el precio. Por eso ambos comparten este
 * nombre y desbloquean la misma sección VIP con el mismo código.
 */
export const UPSELL2_PRODUCT_NAME_LATAM = 'Acceso VIP de por vida';

/** Nombre de la profesional/experta que respalda el producto. */
export const EXPERT_NAME = 'Natalia Reyes';

/** Título profesional de la experta. */
export const EXPERT_TITLE = 'Nutricionista · Especialista en salud digestiva';

/** Imagen de la experta (ruta en /public). */
export const EXPERT_IMAGE = '/img/natalia-reyes.jpg';

// ═══════════════════════════════════════════════════════════════════════════
// PRECIOS DEL FUNNEL LATAM — FUENTE ÚNICA DE VERDAD (todo en USD)
//
// Reglas:
//  - `amount` = número crudo en USD. Es lo que se manda a Meta como value
//    (currency = USD) en los eventos de intención.
//  - `display` = string formateado para mostrar en pantalla.
//  - `displayOriginal` = ancla de precio "antes" (tachado) para mostrar el descuento.
//  - Cambiar un precio se hace SOLO acá y se propaga a todas las páginas LATAM.
// ═══════════════════════════════════════════════════════════════════════════

export const PRICING_CURRENCY_LATAM = 'USD';

export const PRICING_LATAM = {
  /** Producto principal (final del quiz). Plan 7 días + app. */
  front:    { amount: 14.90, display: 'US$14.90', displayOriginal: 'US$39.90' },
  /** Upsell post-compra: Programa 30 días completo. */
  upsell:   { amount: 19.90, display: 'US$19.90', displayOriginal: 'US$49.90' },
  /** Downsell: mismo Programa 30 días, solo bajada de precio si rechazan el upsell. */
  downsell: { amount: 12.90, display: 'US$12.90', displayOriginal: 'US$19.90' },
  /**
   * Upsell 2: Acceso VIP de por vida (pago único). Es MÁS CARO que el upsell 1.
   * Regla de negocio: `upsell2.amount` > `upsell.amount` (27 > 13.90). Ancla US$97.
   */
  upsell2:  { amount: 27.00, display: 'US$27', displayOriginal: 'US$97' },
  /**
   * Downsell 2: MISMO producto VIP que el upsell 2, a precio MENOR (segunda
   * chance). Regla de negocio: `downsell2.amount` < `upsell2.amount` (17 < 27).
   * Ancla US$97 (mismo valor percibido del VIP).
   */
  downsell2:{ amount: 17.00, display: 'US$17', displayOriginal: 'US$97' },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT (Hotmart) — URLs desde nuevas env vars
//
// Fallback a string vacío para que los componentes muestren un aviso de
// "config pendiente" en lugar de romper (mismo patrón que config.ts).
// ═══════════════════════════════════════════════════════════════════════════

/** URL de checkout Hotmart del producto FRONT (LATAM). */
export const LATAM_CHECKOUT_URL = process.env.NEXT_PUBLIC_LATAM_CHECKOUT_URL || '';

/** URL de checkout Hotmart del UPSELL (LATAM). */
export const LATAM_UPSELL_CHECKOUT_URL = process.env.NEXT_PUBLIC_LATAM_UPSELL_CHECKOUT_URL || '';

/** URL de checkout Hotmart del DOWNSELL (LATAM). */
export const LATAM_DOWNSELL_CHECKOUT_URL = process.env.NEXT_PUBLIC_LATAM_DOWNSELL_CHECKOUT_URL || '';

/**
 * URL de checkout Hotmart del UPSELL 2 / Acceso VIP (LATAM).
 * Fallback a '' → el componente de oferta muestra aviso de "config pendiente".
 */
export const LATAM_UPSELL2_CHECKOUT_URL = process.env.NEXT_PUBLIC_LATAM_UPSELL2_CHECKOUT_URL || '';

/**
 * URL de checkout Hotmart del DOWNSELL 2 (mismo producto VIP, precio menor).
 * Fallback a '' → el componente de oferta muestra aviso de "config pendiente".
 */
export const LATAM_DOWNSELL2_CHECKOUT_URL = process.env.NEXT_PUBLIC_LATAM_DOWNSELL2_CHECKOUT_URL || '';

/**
 * Código estático que desbloquea la sección VIP de la PWA (`/pwa/vip`).
 *
 * NO es seguridad fuerte: es exclusividad percibida (es compartible, trade-off
 * aceptado a propósito — no hay SQL ni autenticación detrás). Se entrega por el
 * email NATIVO de Hotmart post-compra, tanto para el upsell 2 como para el
 * downsell 2 (ambos son el mismo producto VIP). Default `'VIPLATAM'`.
 */
export const VIP_CODE_LATAM = process.env.NEXT_PUBLIC_VIP_CODE_LATAM || 'VIPLATAM';

// ═══════════════════════════════════════════════════════════════════════════
// PWA (LATAM)
// La PWA tiene registro abierto, así que el destino post-funnel es la página
// de registro de la PWA.
// ═══════════════════════════════════════════════════════════════════════════

/** URL base de la PWA LATAM (destino post-funnel: registro abierto). */
export const PWA_BASE_URL_LATAM =
  process.env.NEXT_PUBLIC_PWA_BASE_URL || 'https://chauhinchazon.hilvanapp.com/pwa/registro';
