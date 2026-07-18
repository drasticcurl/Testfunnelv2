'use client';

/**
 * Upsell2Offer — bloque de oferta del UPSELL 2 (Acceso VIP de por vida) del
 * embudo ARGENTINO (Shopify, ARS, voseo).
 *
 * Es el equivalente AR de Upsell2OfferLatam: mismo formato TSL (Text Sales
 * Letter) sin video ni delay — la oferta es visible desde el inicio porque el
 * deseo ya se construyó con el copy de la página. Conserva el patrón de precio
 * (ancla + descuento calculado desde config) y los CTAs "SÍ" / "No gracias".
 *
 * Diferencias con la versión LATAM:
 *  - Precios en ARS desde PRICING (config.ts), no USD.
 *  - Checkout vía Shopify: redirige DIRECTO a UPSELL2_CHECKOUT_URL con la
 *    atribución de UTMs (withCheckoutAttribution), igual que VslOfferBlock (AR).
 *  - Textos en español de Argentina (voseo).
 *  - "No gracias" → /pwa/registro (el usuario ya compró; sin downsell en AR).
 *
 * Tracking (idéntico al patrón AR de VslOfferBlock — NO romper el embudo):
 *  - Click CTA  → fbq InitiateCheckout (PRICING.upsell2, ARS) + POST /api/track
 *                 → redirige al checkout de Shopify (UPSELL2_CHECKOUT_URL)
 *  - Skip       → fbq trackCustom Upsell2Skip → REGISTER_URL (/pwa/registro)
 *
 * El Purchase real lo dispara el webhook server-side de Shopify
 * (/api/shopify-webhook); este componente NO lo toca.
 */

import { useState } from 'react';
import { getMetaCookies, withCheckoutAttribution } from '@/lib/cookies';
import {
  PRICING,
  PRICING_CURRENCY,
  UPSELL2_PRODUCT_NAME,
  UPSELL2_CHECKOUT_URL,
  REGISTER_URL,
} from '@/lib/quiz-v2/config';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

interface Upsell2OfferProps {
  /** Texto del CTA principal (opcional). */
  ctaLabel?: string;
}

/** % de descuento calculado desde la config (robusto a cambios de precio). */
const ORIGINAL_AMOUNT = Number(PRICING.upsell2.displayOriginal.replace(/[^0-9]/g, '')) || 0;
const DISCOUNT_PCT =
  ORIGINAL_AMOUNT > 0 ? Math.round((1 - PRICING.upsell2.amount / ORIGINAL_AMOUNT) * 100) : 0;

const VIP_BENEFITS = [
  {
    icon: '♾️',
    title: 'Acceso de por vida a la app y todo el contenido',
    desc: 'Entrás cuando quieras, para siempre — con todas las actualizaciones futuras incluidas.',
  },
  {
    icon: '🍲',
    title: 'Recetario premium ampliado',
    desc: '50–100 recetas nuevas, club mensual de recetas y ediciones estacionales.',
  },
  {
    icon: '📖',
    title: 'Biblioteca de masterclasses en texto',
    desc: 'Sueño, estrés-cortisol, ejercicio de bajo impacto y ayuno, explicados paso a paso.',
  },
  {
    icon: '🧭',
    title: 'Protocolo de mantenimiento anti-rebote',
    desc: 'La hoja de ruta para sostener tus resultados sin volver atrás.',
  },
];

export function Upsell2Offer({ ctaLabel }: Upsell2OfferProps) {
  const [pendingConfig, setPendingConfig] = useState(false);

  const handleAccept = () => {
    if (typeof window === 'undefined') return;
    const w = window as FbqWindow;

    if (w.fbq) {
      w.fbq('track', 'InitiateCheckout', {
        value: PRICING.upsell2.amount,
        currency: PRICING_CURRENCY,
        content_name: UPSELL2_PRODUCT_NAME,
        content_category: 'Upsell2',
      });
    }

    const meta = getMetaCookies();
    // keepalive: la request de tracking sobrevive a la navegación al checkout
    // externo de Shopify (si no, se cancela al cambiar de página).
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event: 'InitiateCheckout',
        fbc: meta.fbc,
        fbp: meta.fbp,
        contentName: UPSELL2_PRODUCT_NAME,
        contentCategory: 'Upsell2',
        value: PRICING.upsell2.amount,
        currency: PRICING_CURRENCY,
      }),
    }).catch(() => {
      /* no-op: nunca bloquees al usuario por tracking */
    });

    // Redirige DIRECTO al checkout de Shopify con la atribución de UTMs.
    if (UPSELL2_CHECKOUT_URL) {
      window.location.href = withCheckoutAttribution(UPSELL2_CHECKOUT_URL, { src: 'upsell2' });
    } else {
      // Fallback dev/staging: la env var no está configurada.
      console.warn('[upsell2] NEXT_PUBLIC_UPSELL2_CHECKOUT_URL no está configurada');
      setPendingConfig(true);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) w.fbq('trackCustom', 'Upsell2Skip');
      // El usuario ya compró el programa: lo mandamos directo a crear su cuenta.
      window.location.href = REGISTER_URL;
    }
  };

  return (
    <section className="bg-[#0F1116] pb-16 pt-8">
      <div className="max-w-content mx-auto px-4">
        {/* Precio: ancla $49.990 → $19.990 con % de descuento */}
        <div className="mb-5 bg-[#16181F] rounded-xl border border-white/10 shadow-xl p-6 text-center">
          {DISCOUNT_PCT > 0 && (
            <span className="inline-block bg-alert text-white font-sans text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              🔥 {DISCOUNT_PCT}% OFF · solo en esta página
            </span>
          )}
          <p className="font-sans text-sm text-white/50">
            Valor normal del Acceso VIP{' '}
            <span className="line-through decoration-alert/70">
              {PRICING.upsell2.displayOriginal}
            </span>
          </p>
          <p className="mt-1 font-sans text-xs uppercase tracking-widest text-coral font-semibold">
            Hoy, pago único de
          </p>
          <p className="mt-1 font-serif text-6xl md:text-7xl font-bold text-coral leading-none tabular-nums">
            {PRICING.upsell2.display}
          </p>
          <p className="mt-3 font-sans text-sm text-white/60">
            Pago único · Acceso de por vida · Sin suscripción
          </p>
        </div>

        {/* CTA principal */}
        <CtaButton onClick={handleAccept} label={ctaLabel} />
        <p className="mt-3 text-center font-sans text-sm text-white/60">
          🛡️ Garantía de actualizaciones de por vida
        </p>

        {pendingConfig && (
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="font-sans text-sm text-warning font-semibold uppercase tracking-wider">
              Configuración pendiente
            </p>
            <p className="mt-2 font-sans text-sm text-white/60">
              Setear{' '}
              <code className="bg-white/10 px-2 py-0.5 rounded">
                NEXT_PUBLIC_UPSELL2_CHECKOUT_URL
              </code>{' '}
              (permalink de carrito de Shopify) en Vercel.
            </p>
          </div>
        )}

        {/* Beneficios del VIP */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {VIP_BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-[#16181F] rounded-xl border border-white/10 shadow-sm p-5"
            >
              <div className="text-3xl mb-2" aria-hidden="true">{b.icon}</div>
              <h3 className="font-serif text-lg text-white leading-snug">{b.title}</h3>
              <p className="mt-2 font-sans text-sm text-white/60 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA repetido */}
        <div className="mt-10">
          <CtaButton onClick={handleAccept} label={ctaLabel} />
          <p className="mt-3 text-center font-sans text-sm text-white/60">
            🛡️ Garantía de actualizaciones de por vida
          </p>
        </div>

        {/* skip → PWA (el usuario ya compró el programa) */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-block font-sans text-xs md:text-sm text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-full px-4 py-2 transition-colors"
          >
            No gracias, quiero crear mi cuenta y empezar →
          </button>
        </div>
      </div>
    </section>
  );
}

function CtaButton({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-full px-8 py-5 text-white font-sans font-bold text-lg md:text-xl leading-tight shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-transform animate-bounce-cta"
      style={{ background: 'linear-gradient(135deg, #F5821F 0%, #EC4899 100%)' }}
    >
      {label ?? '👑 ¡Quiero el Acceso VIP de por vida! 👑'}
      <span className="block font-sans text-sm font-semibold mt-1 opacity-95">
        Sí, sumalo a mi compra ahora →
      </span>
    </button>
  );
}
