'use client';

/**
 * DownsellOfferLatam - bloque central de /downsell-latam (funnel LATAM).
 *
 * Fork del DownsellOffer argentino, adaptado al funnel PARALELO LATAM:
 *  - CHECKOUT vía Hotmart (LATAM_DOWNSELL_CHECKOUT_URL), no Shopify.
 *  - PRECIOS en USD (PRICING_LATAM, fuente única de verdad LATAM).
 *  - COPY en español neutro tratando de "tú".
 *
 * Segunda (y última) chance del embudo LATAM: la persona rechazó el upsell de
 * US$13.90, así que le ofrecemos EXACTAMENTE el mismo Programa de 30 Días pero
 * a precio menor (PRICING_LATAM.downsell, US$9.90). No cambia el producto.
 *
 * Al aceptar, REDIRIGIMOS en la misma pestaña al checkout de Hotmart
 * (LATAM_DOWNSELL_CHECKOUT_URL con atribución de tracking).
 *
 * El "no gracias" final manda a la PWA de registro (PWA_BASE_URL_LATAM): la
 * PWA tiene registro abierto, así que ahí termina el funnel.
 *
 * Tracking:
 *  - Al entrar: ViewContent (vía UpsellPageTracker en la page).
 *  - Click en CTA: InitiateCheckout (USD). El Purchase real lo dispara el
 *    webhook de Hotmart server-side.
 */

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { getMetaCookies, withHotmartCheckout } from '@/lib/cookies';
import {
  PRICING_LATAM,
  PRICING_CURRENCY_LATAM,
  PWA_BASE_URL_LATAM,
  LATAM_DOWNSELL_CHECKOUT_URL,
  UPSELL_PRODUCT_NAME_LATAM,
} from '@/lib/quiz-v2/config-latam';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

export function DownsellOfferLatam() {
  const [pendingConfig, setPendingConfig] = useState(false);

  const checkoutUrl = LATAM_DOWNSELL_CHECKOUT_URL;
  const hasCheckout = checkoutUrl.length > 0;

  const trackInitiate = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        w.fbq('track', 'InitiateCheckout', {
          value: PRICING_LATAM.downsell.amount,
          currency: PRICING_CURRENCY_LATAM,
          content_name: 'Programa 30 Dias Downsell LATAM',
          content_category: 'Downsell',
        });
      }
      const meta = getMetaCookies();
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'InitiateCheckout',
          fbc: meta.fbc,
          fbp: meta.fbp,
          contentName: 'Programa 30 Dias Downsell LATAM',
          contentCategory: 'Downsell',
          value: PRICING_LATAM.downsell.amount,
          currency: PRICING_CURRENCY_LATAM,
        }),
      }).catch(() => { /* no-op */ });
    }
  };

  const handleAccept = () => {
    trackInitiate();
    if (hasCheckout) {
      // Checkout de Hotmart con atribución de tracking (src/sck + UTMs).
      window.location.href = withHotmartCheckout(checkoutUrl, { src: 'downsell_latam' });
    } else {
      // Sin URL configurada (staging/dev): mostramos aviso en vez de romper.
      setPendingConfig(true);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) w.fbq('trackCustom', 'DownsellSkip');
    }
    // La PWA tiene registro abierto → mandamos a la página de registro.
    window.location.href = PWA_BASE_URL_LATAM;
  };

  return (
    <section className="bg-[#0F1116] pb-12 md:pb-20">
      <div className="max-w-content mx-auto px-4">
        <div className="bg-[#16181F] rounded-xl shadow-xl border border-white/10 p-6 md:p-10">
          {/* Pill */}
          <div className="text-center">
            <span className="inline-block bg-coral/15 text-coral font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              Espera — última oportunidad
            </span>
          </div>

          <h2 className="mt-6 font-serif text-2xl md:text-4xl text-white text-center font-semibold leading-tight">
            Lo entiendo. No quiero que te lo pierdas{' '}
            <span className="text-coral">solo por el precio.</span>
          </h2>

          <p className="mt-4 font-sans text-base md:text-lg text-white/60 text-center max-w-xl mx-auto leading-relaxed">
            Es <strong className="text-white">el mismo {UPSELL_PRODUCT_NAME_LATAM} completo</strong>{' '}
            — con las +60 recetas, el recetario de postres y todo lo demás. Solo que,
            por única vez, te dejo un precio que no vas a volver a ver.
          </p>

          {/* Ancla de precio */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-5 md:p-6 text-center">
            <p className="font-sans text-sm text-white/60">
              Recién lo viste a <span className="line-through">{PRICING_LATAM.upsell.display}</span>.
            </p>
            <p className="mt-4 font-sans text-sm text-coral font-semibold uppercase tracking-wider">
              Solo ahora, precio final:
            </p>
            <p className="font-serif text-5xl md:text-6xl font-bold text-coral mt-1">
              {PRICING_LATAM.downsell.display}
            </p>
            <p className="font-sans text-sm text-white/60 mt-2">
              Pago único · Acceso inmediato · Garantía 7 días
            </p>
          </div>

          {/* prueba social de compras en vivo (coherente con /upsell) */}
          <p className="mt-5 text-center font-sans text-sm text-white/70 font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse-soft mr-2 align-middle" />
            <strong className="text-white">+40 personas</strong> aprovecharon esta segunda oportunidad hoy
          </p>

          {pendingConfig && (
            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <p className="font-sans text-sm text-warning font-semibold uppercase tracking-wider">
                Configuración pendiente
              </p>
              <p className="mt-2 font-sans text-sm text-white/60">
                Setear{' '}
                <code className="bg-white/10 px-2 py-0.5 rounded">NEXT_PUBLIC_LATAM_DOWNSELL_CHECKOUT_URL</code>{' '}
                (checkout de Hotmart) en Vercel.
              </p>
            </div>
          )}

          <div className="mt-8">
            <Button variant="primary" size="xl" onClick={handleAccept} className="w-full">
              SÍ, LO QUIERO POR {PRICING_LATAM.downsell.display} →
            </Button>
            <p className="mt-3 text-center font-sans text-xs text-white/40">
              🔒 Pago 100% seguro · 🛡️ Garantía 7 días · ✅ Acceso instantáneo
            </p>
          </div>

          {/* skip → PWA de registro. Hecho VISIBLE para que las clientas que ya
              pagaron el front encuentren la salida sin frustrarse. */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-block font-sans text-xs md:text-sm text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-full px-4 py-2 transition-colors"
            >
              No gracias, continuar a mi Plan de 7 Días (ya pagado) →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
