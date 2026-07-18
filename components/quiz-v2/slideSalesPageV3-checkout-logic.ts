/**
 * slideSalesPageV3-checkout-logic — lógica pura y testeable del checkout del
 * FRONT de Argentina (botón "Pagar" de SlideSalesPageV3).
 *
 * Este módulo NO importa React ni next: contiene solo builders deterministas +
 * un orquestador (`runFrontCheckout`) con TODAS las dependencias con efecto
 * secundario INYECTADAS (espejo de `components/upsell/upsell2-latam-logic.ts`).
 * Así se testea en entorno `node` y el componente client queda como wrapper
 * fino que inyecta `window.fbq`, `fetch`, `getMetaCookies`, `getUTMs`, etc.
 *
 * Flujo del front AR:
 *  - El cobro del front AR es Shopify (GET a un link/permalink de carrito).
 *  - El tracking (`fbq InitiateCheckout` + `POST /api/track` con quiz_version
 *    'ar' y keepalive) SIEMPRE ocurre ANTES de la salida.
 *
 * El Purchase real lo dispara el webhook server-side de Shopify
 * (app/api/shopify-webhook); acá solo va el evento de intención
 * (InitiateCheckout).
 */

import { PRICING, PRICING_CURRENCY } from '@/lib/quiz-v2/config';

export interface MetaCookies {
  fbc?: string;
  fbp?: string;
}

type Fbq = (...args: unknown[]) => void;

/** Cuerpo del POST /api/track del CTA "Pagar" del front AR. */
export interface FrontCheckoutTrackBody {
  event: 'InitiateCheckout';
  value: number;
  currency: string;
  fbc?: string;
  fbp?: string;
  custom: {
    quiz_version: 'ar';
    utms?: Record<string, string>;
    ab_variant?: string;
  };
}

// ─── Builders puros (deterministas, sin efectos) ────────────────────────────

/**
 * Body del `POST /api/track` del evento InitiateCheckout del front AR.
 * Lleva value/currency en ARS, fbc/fbp, custom.quiz_version 'ar', utms y
 * ab_variant.
 */
export function buildInitiateCheckoutTrackBody(
  meta: MetaCookies,
  utms?: Record<string, string>,
  variant?: string | null,
): FrontCheckoutTrackBody {
  return {
    event: 'InitiateCheckout',
    value: PRICING.front.amount,
    currency: PRICING_CURRENCY,
    fbc: meta.fbc,
    fbp: meta.fbp,
    custom: {
      quiz_version: 'ar',
      utms,
      ab_variant: variant ?? undefined,
    },
  };
}

// ─── Orquestador con dependencias inyectadas ────────────────────────────────

export interface FrontCheckoutDeps {
  /** `window.fbq` si está disponible (puede ser undefined). */
  fbq?: Fbq;
  /** Cookies de Meta (_fbc/_fbp). */
  meta: MetaCookies;
  /** UTMs best-effort (de localStorage). */
  utms?: Record<string, string>;
  /** Variante del test A/B/C de entrada (read-only). */
  variant?: string | null;
  /** Reenvía el body al endpoint de tracking (keepalive lo aplica el wrapper). */
  postTrack: (body: FrontCheckoutTrackBody) => void;
  /** Salida: abre el checkout Shopify (GET). */
  openShopify: () => void;
}

/**
 * Orquesta el click en "Pagar" del front AR:
 *   1. `fbq('track','InitiateCheckout')` (si hay fbq).
 *   2. `postTrack(...)` con quiz_version 'ar'.
 *   3. salida: `openShopify()`.
 *
 * El tracking (1 y 2) SIEMPRE ocurre ANTES de la salida (3).
 */
export function runFrontCheckout(deps: FrontCheckoutDeps): void {
  if (deps.fbq) {
    deps.fbq('track', 'InitiateCheckout');
  }
  deps.postTrack(buildInitiateCheckoutTrackBody(deps.meta, deps.utms, deps.variant));
  deps.openShopify();
}
