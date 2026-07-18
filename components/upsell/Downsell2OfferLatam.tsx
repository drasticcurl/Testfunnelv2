'use client';

/**
 * Downsell2OfferLatam — bloque de oferta del DOWNSELL 2 (segunda chance del VIP).
 *
 * Fork conceptual de DownsellOfferLatam adaptado al producto VIP: ofrece el
 * MISMO Acceso VIP de por vida que el upsell 2, pero al precio menor
 * (PRICING_LATAM.downsell2, US$17). El ancla es lo que el usuario recién vio
 * (PRICING_LATAM.upsell2.display, US$27).
 *
 * Toda la lógica con efecto secundario vive en `upsell2-latam-logic.ts`.
 *
 * Flujo:
 *   CTA "SÍ"     → fbq InitiateCheckout (USD, downsell2) + POST /api/track ('latam')
 *                  → checkout Hotmart (LATAM_DOWNSELL2_CHECKOUT_URL)
 *   "No gracias" → PWA_BASE_URL_LATAM (fin del embudo LATAM)
 */

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { getMetaCookies } from '@/lib/cookies';
import {
  PRICING_LATAM,
  LATAM_DOWNSELL2_CHECKOUT_URL,
  UPSELL2_PRODUCT_NAME_LATAM,
} from '@/lib/quiz-v2/config-latam';
import {
  runDownsell2Accept,
  runDownsell2Skip,
  type VipTrackBody,
} from './upsell2-latam-logic';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

interface Downsell2OfferLatamProps {
  /** Texto del CTA principal (opcional). */
  ctaLabel?: string;
}

export function Downsell2OfferLatam({ ctaLabel }: Downsell2OfferLatamProps) {
  const [pendingConfig, setPendingConfig] = useState(false);

  const handleAccept = () => {
    if (typeof window === 'undefined') return;
    const w = window as FbqWindow;
    runDownsell2Accept({
      fbq: w.fbq,
      meta: getMetaCookies(),
      postTrack: (body: VipTrackBody) => {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify(body),
        }).catch(() => {
          /* no-op */
        });
      },
      checkoutBaseUrl: LATAM_DOWNSELL2_CHECKOUT_URL,
      navigate: (url) => {
        window.location.href = url;
      },
      onMissingCheckout: () => setPendingConfig(true),
    });
  };

  const handleSkip = () => {
    const w = (typeof window !== 'undefined' ? window : undefined) as FbqWindow | undefined;
    runDownsell2Skip({
      fbq: w?.fbq,
      navigate: (url) => {
        if (typeof window !== 'undefined') window.location.href = url;
      },
    });
  };

  return (
    <section className="bg-[#0F1116] pb-12 md:pb-20">
      <div className="max-w-content mx-auto px-4">
        <div className="bg-[#16181F] rounded-xl shadow-xl border border-white/10 p-6 md:p-10">
          <div className="text-center">
            <span className="inline-block bg-coral/15 text-coral font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              Espera — última oportunidad
            </span>
          </div>

          <h2 className="mt-6 font-serif text-2xl md:text-4xl text-white text-center font-semibold leading-tight">
            No quiero que pierdas el Acceso VIP{' '}
            <span className="text-coral">solo por el precio.</span>
          </h2>

          <p className="mt-4 font-sans text-base md:text-lg text-white/60 text-center max-w-xl mx-auto leading-relaxed">
            Es <strong className="text-white">exactamente el mismo {UPSELL2_PRODUCT_NAME_LATAM}</strong>{' '}
            — con todo el contenido premium, las masterclasses y el acceso de por vida. Solo que,
            por única vez, te dejo un precio que no vas a volver a ver.
          </p>

          {/* Ancla: lo que recién vio (US$27) → precio final (US$17) */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-5 md:p-6 text-center">
            <p className="font-sans text-sm text-white/60">
              Recién lo viste a <span className="line-through">{PRICING_LATAM.upsell2.display}</span>.
            </p>
            <p className="mt-4 font-sans text-sm text-coral font-semibold uppercase tracking-wider">
              Solo ahora, precio final:
            </p>
            <p className="font-serif text-5xl md:text-6xl font-bold text-coral mt-1">
              {PRICING_LATAM.downsell2.display}
            </p>
            <p className="font-sans text-sm text-white/60 mt-2">
              Pago único · Acceso de por vida · Garantía de actualizaciones
            </p>
          </div>

          {pendingConfig && (
            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <p className="font-sans text-sm text-warning font-semibold uppercase tracking-wider">
                Configuración pendiente
              </p>
              <p className="mt-2 font-sans text-sm text-white/60">
                Setear{' '}
                <code className="bg-white/10 px-2 py-0.5 rounded">
                  NEXT_PUBLIC_LATAM_DOWNSELL2_CHECKOUT_URL
                </code>{' '}
                (checkout de Hotmart) en Vercel.
              </p>
            </div>
          )}

          <div className="mt-8">
            <Button variant="primary" size="xl" onClick={handleAccept} className="w-full">
              {ctaLabel ?? `SÍ, QUIERO EL ACCESO VIP POR ${PRICING_LATAM.downsell2.display} →`}
            </Button>
            <p className="mt-3 text-center font-sans text-xs text-white/40">
              🔒 Pago 100% seguro · 🛡️ Garantía de actualizaciones · ✅ Acceso de por vida
            </p>
          </div>

          {/* skip → PWA (fin del embudo LATAM) */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-block font-sans text-xs md:text-sm text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-full px-4 py-2 transition-colors"
            >
              No gracias, continuar a mi app →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
