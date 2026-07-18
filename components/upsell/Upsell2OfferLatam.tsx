'use client';

/**
 * Upsell2OfferLatam — bloque de oferta del UPSELL 2 (Acceso VIP de por vida).
 *
 * Fork conceptual de VslOfferBlockLatam, pero en formato TSL (Text Sales
 * Letter): NO tiene delay de revelado ni countdown atado a un video. La oferta
 * es visible desde el inicio (el deseo ya se construyó con el copy de la
 * página). Conserva el patrón de precio (ancla + descuento calculado desde
 * config) y CTAs "SÍ"/"No gracias" con tracking.
 *
 * Toda la lógica con efecto secundario vive en `upsell2-latam-logic.ts`
 * (testeable en node); este componente solo inyecta `window.fbq`, `fetch`,
 * `getMetaCookies`, el router y `console.warn`.
 *
 * Flujo:
 *   CTA "SÍ"     → fbq InitiateCheckout (USD) + POST /api/track ('latam')
 *                  → checkout Hotmart (LATAM_UPSELL2_CHECKOUT_URL)
 *   "No gracias" → /downsell2-latam (segunda chance del embudo)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMetaCookies } from '@/lib/cookies';
import {
  PRICING_LATAM,
  LATAM_UPSELL2_CHECKOUT_URL,
} from '@/lib/quiz-v2/config-latam';
import {
  runUpsell2Accept,
  runUpsell2Skip,
  discountPct,
  type VipTrackBody,
} from './upsell2-latam-logic';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

interface Upsell2OfferLatamProps {
  /** Texto del CTA principal (opcional). */
  ctaLabel?: string;
}

const DISCOUNT_PCT = discountPct(
  PRICING_LATAM.upsell2.displayOriginal,
  PRICING_LATAM.upsell2.amount,
);

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

export function Upsell2OfferLatam({ ctaLabel }: Upsell2OfferLatamProps) {
  const router = useRouter();
  const [pendingConfig, setPendingConfig] = useState(false);

  const handleAccept = () => {
    if (typeof window === 'undefined') return;
    const w = window as FbqWindow;
    runUpsell2Accept({
      fbq: w.fbq,
      meta: getMetaCookies(),
      postTrack: (body: VipTrackBody) => {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify(body),
        }).catch(() => {
          /* no-op: nunca bloquees al usuario por tracking */
        });
      },
      checkoutBaseUrl: LATAM_UPSELL2_CHECKOUT_URL,
      navigate: (url) => {
        window.location.href = url;
      },
      onMissingCheckout: () => {
        console.warn('[latam/upsell2] NEXT_PUBLIC_LATAM_UPSELL2_CHECKOUT_URL no configurada');
        setPendingConfig(true);
      },
    });
  };

  const handleSkip = () => {
    const w = (typeof window !== 'undefined' ? window : undefined) as FbqWindow | undefined;
    runUpsell2Skip({
      fbq: w?.fbq,
      navigate: (url) => router.push(url),
    });
  };

  return (
    <section className="bg-[#0F1116] pb-16 pt-8">
      <div className="max-w-content mx-auto px-4">
        {/* Precio: ancla US$97 → US$27 con % de descuento */}
        <div className="mb-5 bg-[#16181F] rounded-xl border border-white/10 shadow-xl p-6 text-center">
          {DISCOUNT_PCT > 0 && (
            <span className="inline-block bg-alert text-white font-sans text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              🔥 {DISCOUNT_PCT}% OFF · solo en esta página
            </span>
          )}
          <p className="font-sans text-sm text-white/50">
            Valor normal del Acceso VIP{' '}
            <span className="line-through decoration-alert/70">
              {PRICING_LATAM.upsell2.displayOriginal}
            </span>
          </p>
          <p className="mt-1 font-sans text-xs uppercase tracking-widest text-coral font-semibold">
            Hoy, pago único de
          </p>
          <p className="mt-1 font-serif text-6xl md:text-7xl font-bold text-coral leading-none tabular-nums">
            {PRICING_LATAM.upsell2.display}
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
                NEXT_PUBLIC_LATAM_UPSELL2_CHECKOUT_URL
              </code>{' '}
              (checkout de Hotmart) en Vercel.
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

        {/* skip → downsell2-latam (segunda chance) */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-block font-sans text-xs md:text-sm text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-full px-4 py-2 transition-colors"
          >
            No gracias, no quiero el Acceso VIP →
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
        Sí, súmenlo a mi compra ahora →
      </span>
    </button>
  );
}
