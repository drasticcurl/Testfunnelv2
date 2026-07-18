/**
 * upsell2-latam-logic — lógica pura y testeable del upsell 2 / downsell 2 (VIP).
 *
 * Este módulo NO importa React ni next/navigation: contiene solo la lógica de
 * tracking + checkout de los CTAs del Acceso VIP (upsell 2 y downsell 2), con
 * todas las dependencias con efecto secundario INYECTADAS. Así se puede testear
 * en entorno `node` (sin jsdom) y los componentes client quedan como wrappers
 * finos que inyectan `window.fbq`, `fetch`, `getMetaCookies`, etc.
 *
 * Reusa los patrones verificados de VslOfferBlockLatam / DownsellOfferLatam:
 *  - fbq InitiateCheckout en USD (PRICING_LATAM, currency USD)
 *  - POST /api/track con quiz_version 'latam' + fbc/fbp (catch no-op)
 *  - redirección al checkout de Hotmart vía withHotmartCheckout
 *
 * El Purchase real lo dispara el webhook server-side de Hotmart; acá solo va
 * el evento de intención (InitiateCheckout).
 */

import { withHotmartCheckout } from '@/lib/cookies';
import {
  PRICING_LATAM,
  PRICING_CURRENCY_LATAM,
  UPSELL2_PRODUCT_NAME_LATAM,
  PWA_BASE_URL_LATAM,
} from '@/lib/quiz-v2/config-latam';

export interface MetaCookies {
  fbc?: string;
  fbp?: string;
}

type Fbq = (...args: unknown[]) => void;

/** Cuerpo del POST /api/track del CTA del VIP (forma compartida). */
export interface VipTrackBody {
  event: 'InitiateCheckout';
  value: number;
  currency: string;
  contentName: string;
  contentCategory: 'Upsell2' | 'Downsell2';
  custom: { quiz_version: 'latam' };
  fbc?: string;
  fbp?: string;
}

/** Parámetros del evento fbq `InitiateCheckout` (forma compartida). */
export interface VipFbqParams {
  value: number;
  currency: string;
  content_name: string;
  content_category: 'Upsell2' | 'Downsell2';
}

// ─── Builders puros (deterministas, sin efectos) ────────────────────────────

export function buildUpsell2FbqParams(): VipFbqParams {
  return {
    value: PRICING_LATAM.upsell2.amount,
    currency: PRICING_CURRENCY_LATAM,
    content_name: UPSELL2_PRODUCT_NAME_LATAM,
    content_category: 'Upsell2',
  };
}

export function buildUpsell2TrackBody(meta: MetaCookies): VipTrackBody {
  return {
    event: 'InitiateCheckout',
    value: PRICING_LATAM.upsell2.amount,
    currency: PRICING_CURRENCY_LATAM,
    contentName: UPSELL2_PRODUCT_NAME_LATAM,
    contentCategory: 'Upsell2',
    custom: { quiz_version: 'latam' },
    fbc: meta.fbc,
    fbp: meta.fbp,
  };
}

export function buildDownsell2FbqParams(): VipFbqParams {
  return {
    value: PRICING_LATAM.downsell2.amount,
    currency: PRICING_CURRENCY_LATAM,
    content_name: UPSELL2_PRODUCT_NAME_LATAM,
    content_category: 'Downsell2',
  };
}

export function buildDownsell2TrackBody(meta: MetaCookies): VipTrackBody {
  return {
    event: 'InitiateCheckout',
    value: PRICING_LATAM.downsell2.amount,
    currency: PRICING_CURRENCY_LATAM,
    contentName: UPSELL2_PRODUCT_NAME_LATAM,
    contentCategory: 'Downsell2',
    custom: { quiz_version: 'latam' },
    fbc: meta.fbc,
    fbp: meta.fbp,
  };
}

// ─── Orquestadores con dependencias inyectadas ──────────────────────────────

export interface AcceptDeps {
  /** `window.fbq` si está disponible (puede ser undefined). */
  fbq?: Fbq;
  /** Cookies de Meta (_fbc/_fbp). */
  meta: MetaCookies;
  /** Reenvía el body al endpoint de tracking (no debe lanzar). */
  postTrack: (body: VipTrackBody) => void;
  /** URL base del checkout de Hotmart (LATAM_*_CHECKOUT_URL). Puede ser ''. */
  checkoutBaseUrl: string;
  /** Navega a la URL final (window.location.href = url). */
  navigate: (url: string) => void;
}

export interface Upsell2AcceptDeps extends AcceptDeps {
  /** Se invoca cuando la URL de checkout está vacía (config pendiente). */
  onMissingCheckout: () => void;
}

/**
 * CTA "SÍ" del upsell 2.
 *  - Dispara EXACTAMENTE un InitiateCheckout (USD, value = upsell2.amount) si hay fbq.
 *  - POST /api/track con quiz_version 'latam' (+ fbc/fbp).
 *  - Si la URL de checkout es no-vacía → navega; si es vacía → onMissingCheckout (warn).
 *  - El tracking nunca bloquea la navegación.
 */
export function runUpsell2Accept(deps: Upsell2AcceptDeps): void {
  if (deps.fbq) {
    deps.fbq('track', 'InitiateCheckout', buildUpsell2FbqParams());
  }
  deps.postTrack(buildUpsell2TrackBody(deps.meta));
  const url = withHotmartCheckout(deps.checkoutBaseUrl, { src: 'upsell2_latam' });
  if (url) {
    deps.navigate(url);
  } else {
    deps.onMissingCheckout();
  }
}

export interface SkipDeps {
  fbq?: Fbq;
  navigate: (url: string) => void;
}

/** CTA "No gracias" del upsell 2 → SIEMPRE redirige a /downsell2-latam. */
export function runUpsell2Skip(deps: SkipDeps): void {
  if (deps.fbq) deps.fbq('trackCustom', 'Upsell2Skip');
  deps.navigate('/downsell2-latam');
}

export interface Downsell2AcceptDeps extends AcceptDeps {
  /** Se invoca cuando la URL de checkout está vacía (config pendiente). */
  onMissingCheckout: () => void;
}

/**
 * CTA "SÍ" del downsell 2.
 *  - Dispara EXACTAMENTE un InitiateCheckout (USD, value = downsell2.amount) si hay fbq.
 *  - POST /api/track con quiz_version 'latam' (+ fbc/fbp).
 *  - Si la URL de checkout es no-vacía → navega; si es vacía → onMissingCheckout
 *    (aviso "config pendiente", no navega).
 */
export function runDownsell2Accept(deps: Downsell2AcceptDeps): void {
  if (deps.fbq) {
    deps.fbq('track', 'InitiateCheckout', buildDownsell2FbqParams());
  }
  deps.postTrack(buildDownsell2TrackBody(deps.meta));
  const url = withHotmartCheckout(deps.checkoutBaseUrl, { src: 'downsell2_latam' });
  if (url) {
    deps.navigate(url);
  } else {
    deps.onMissingCheckout();
  }
}

/** CTA "No gracias" del downsell 2 → redirige a la PWA (fin del embudo LATAM). */
export function runDownsell2Skip(deps: SkipDeps): void {
  if (deps.fbq) deps.fbq('trackCustom', 'Downsell2Skip');
  deps.navigate(PWA_BASE_URL_LATAM);
}

/** % de descuento calculado desde la config (robusto a cambios de precio). */
export function discountPct(displayOriginal: string, amount: number): number {
  const original = Number(displayOriginal.replace(/[^0-9.]/g, '')) || 0;
  return original > 0 ? Math.round((1 - amount / original) * 100) : 0;
}
