'use client';

/**
 * VslOfferBlockLatam — fork LATAM de VslOfferBlock.
 *
 * Bloque de oferta que aparece DEBAJO del VSL en /upsell-latam, recién cuando
 * el video llega al punto "[ACÁ SALE EL PRECIO]". Hasta ese momento permanece
 * oculto para no spoilear el precio antes de que el deseo esté instalado.
 *
 * Diferencias vs el AR (VslOfferBlock):
 *  - Precios en USD desde config-latam (PRICING_LATAM.upsell, currency USD).
 *  - Checkout vía HOTMART (withHotmartCheckout + LATAM_UPSELL_CHECKOUT_URL),
 *    sin email, sin cart attributes de Shopify.
 *  - Skip ("no gracias") → /downsell-latam (NO /downsell).
 *  - Copy en español neutro tratando de "tú"; "panza" → "barriga".
 *  - Prueba social con ciudades neutras de LATAM.
 *
 * Tracking (idéntico en estructura al AR — NO romper el embudo):
 *  - Click CTA  → fbq InitiateCheckout (PRICING_LATAM.upsell, USD) + POST /api/track
 *                 → redirige DIRECTO al checkout de Hotmart (LATAM_UPSELL_CHECKOUT_URL)
 *  - Skip       → fbq trackCustom UpsellSkip → /downsell-latam
 *
 * El Purchase real lo dispara el webhook server-side de Hotmart; este
 * componente NO lo toca.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMetaCookies, withHotmartCheckout } from '@/lib/cookies';
import {
  PRICING_LATAM,
  PRICING_CURRENCY_LATAM,
  LATAM_UPSELL_CHECKOUT_URL,
} from '@/lib/quiz-v2/config-latam';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

/** Segundos hasta que aparece el bloque de oferta (sincronizar con el VSL). */
const OFFER_DELAY_SEC = Number(process.env.NEXT_PUBLIC_VSL_OFFER_DELAY_SEC) || 700;
/** Duración del contador de escasez, en segundos (07:47 = 467). */
const COUNTDOWN_SEC = Number(process.env.NEXT_PUBLIC_VSL_COUNTDOWN_SEC) || 467;

const BENEFITS = [
  {
    icon: '🧬',
    title: 'El truco del almidón resistente que nadie te contó',
    desc: 'Cómo la combinación exacta de ingredientes activa tu metabolismo desde el día 1.',
  },
  {
    icon: '⚡',
    title: 'Resultados visibles desde la primera semana',
    desc: 'El desinflamado se activa mientras duermes, sin dietas restrictivas ni pasar hambre.',
  },
  {
    icon: '🛡️',
    title: 'Multiplica los resultados de tu plan actual',
    desc: 'El Protocolo TURBO complementa y potencia el Plan de 7 días que ya tienes.',
  },
  {
    icon: '⏰',
    title: 'Precio de lanzamiento solo mientras miras el video',
    desc: 'Cuando el temporizador llegue a cero, el precio vuelve a su valor normal sin excepción.',
  },
];

const SOCIAL_PROOF = [
  { nombre: 'Lucía de Bogotá', accion: 'compró el Programa TURBO', min: 2 },
  { nombre: 'Valentina de CDMX', accion: 'aseguró su acceso', min: 5 },
  { nombre: 'Florencia de Lima', accion: 'compró el Programa TURBO', min: 3 },
  { nombre: 'Camila de Guadalajara', accion: 'aseguró su acceso', min: 7 },
  { nombre: 'Sofía de Monterrey', accion: 'compró el Programa TURBO', min: 4 },
  { nombre: 'Martina de Medellín', accion: 'aseguró su acceso', min: 6 },
];

function format(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** % de descuento calculado desde la config (queda correcto si cambian precios). */
const ORIGINAL_AMOUNT = Number(PRICING_LATAM.upsell.displayOriginal.replace(/[^0-9.]/g, '')) || 0;
const DISCOUNT_PCT =
  ORIGINAL_AMOUNT > 0 ? Math.round((1 - PRICING_LATAM.upsell.amount / ORIGINAL_AMOUNT) * 100) : 0;

export function VslOfferBlockLatam() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(OFFER_DELAY_SEC <= 0);
  const [remaining, setRemaining] = useState(COUNTDOWN_SEC);
  const [viewers, setViewers] = useState(27);

  // Revela el bloque cuando el VSL llega al punto de precio.
  //
  // Para TESTEAR sin esperar ni redeployar, la URL admite overrides:
  //   ?offer=now  → revela la oferta al instante
  //   ?delay=5    → fuerza el delay a 5 segundos (ignora la env var)
  // En producción (sin querystring) usa NEXT_PUBLIC_VSL_OFFER_DELAY_SEC.
  useEffect(() => {
    if (revealed) return;

    let delaySec = OFFER_DELAY_SEC;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('offer') === 'now') {
        setRevealed(true);
        return;
      }
      const d = Number(params.get('delay'));
      if (params.has('delay') && !Number.isNaN(d)) delaySec = d;
    }

    if (delaySec <= 0) {
      setRevealed(true);
      return;
    }

    const t = setTimeout(() => setRevealed(true), delaySec * 1000);
    return () => clearTimeout(t);
  }, [revealed]);

  // Contador de escasez: arranca cuando el bloque se revela.
  useEffect(() => {
    if (!revealed) return;
    const i = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(i);
  }, [revealed]);

  // Viewers en vivo (20–40) con leve fluctuación, al revelarse la oferta.
  useEffect(() => {
    if (!revealed) return;
    setViewers(20 + Math.floor(Math.random() * 21));
    const i = setInterval(() => {
      setViewers((v) => {
        const next = v + (Math.random() < 0.5 ? -1 : 1);
        return next < 20 ? 20 : next > 40 ? 40 : next;
      });
    }, 4000 + Math.floor(Math.random() * 3000));
    return () => clearInterval(i);
  }, [revealed]);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        w.fbq('track', 'InitiateCheckout', {
          value: PRICING_LATAM.upsell.amount,
          currency: PRICING_CURRENCY_LATAM,
          content_name: 'Programa 30 Dias Upsell LATAM',
          content_category: 'Upsell',
        });
      }
      const meta = getMetaCookies();
      // keepalive: la request de tracking sobrevive a la navegación al
      // checkout externo de Hotmart (si no, se cancela al cambiar de página).
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event: 'InitiateCheckout',
          fbc: meta.fbc,
          fbp: meta.fbp,
          contentName: 'Programa 30 Dias Upsell LATAM',
          contentCategory: 'Upsell',
          value: PRICING_LATAM.upsell.amount,
          currency: PRICING_CURRENCY_LATAM,
        }),
      }).catch(() => {
        /* no-op: nunca bloquees al usuario por tracking */
      });

      // Redirige DIRECTO al checkout de Hotmart. Sin email ni cart attributes.
      const checkoutUrl = withHotmartCheckout(LATAM_UPSELL_CHECKOUT_URL, { src: 'upsell_latam' });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        // Fallback dev/staging: la env var no está configurada → no navegamos.
        console.warn('[latam/upsell] NEXT_PUBLIC_LATAM_UPSELL_CHECKOUT_URL no configurada');
      }
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) w.fbq('trackCustom', 'UpsellSkip');
    }
    router.push('/downsell-latam');
  };

  if (!revealed) return null;

  return (
    <section className="bg-[#0F1116] pb-16 pt-8 animate-fade-in">
      <div className="max-w-content mx-auto px-4">
        {/* viewers + cupos en vivo */}
        <p className="text-center font-sans text-sm text-white/60 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-alert animate-pulse-soft mr-2 align-middle" />
          <strong className="text-white">{viewers} personas</strong> están mirando este video ahora mismo
        </p>
        <p className="text-center font-sans text-sm text-white/70 mb-5">
          <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse-soft mr-2 align-middle" />
          <strong className="text-white">16 personas</strong> ya aseguraron su lugar ·{' '}
          <strong className="text-warning">quedan solo 9 cupos</strong>
        </p>

        {/* Precio: anclaje precio normal (tachado) → precio de hoy */}
        <div className="mb-5 bg-[#16181F] rounded-xl border border-white/10 shadow-xl p-6 text-center">
          {DISCOUNT_PCT > 0 && (
            <span className="inline-block bg-alert text-white font-sans text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              🔥 {DISCOUNT_PCT}% OFF · solo mientras dura el video
            </span>
          )}
          <p className="font-sans text-sm text-white/50">
            Precio normal{' '}
            <span className="line-through decoration-alert/70">{PRICING_LATAM.upsell.displayOriginal}</span>
          </p>
          <p className="mt-1 font-sans text-xs uppercase tracking-widest text-coral font-semibold">
            Hoy pagas solo
          </p>
          <p className="mt-1 font-serif text-6xl md:text-7xl font-bold text-coral leading-none tabular-nums">
            {PRICING_LATAM.upsell.display}
          </p>
          <p className="mt-3 font-sans text-sm text-white/60">
            Pago único · Acceso inmediato · Sin suscripción
          </p>
        </div>

        {/* CTA principal */}
        <CtaButton onClick={handleAccept} />
        <p className="mt-3 text-center font-sans text-sm text-white/60">
          🛡️ Garantía de satisfacción 30 días · Sin preguntas
        </p>

        {/* 4 burbujas de beneficio */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
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

        {/* contador */}
        <div className="mt-10 bg-[#16181F] rounded-xl border border-white/10 shadow-md p-6 text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-white/40">
            Tu oferta especial expira en
          </p>
          <p className="mt-2 font-serif text-6xl md:text-7xl font-bold text-alert tabular-nums">
            {format(remaining)}
          </p>
          <p className="mt-2 font-sans text-sm text-white/60">
            El precio sube cuando el tiempo se agota
          </p>
        </div>

        {/* prueba social en 2 columnas — COMPRAS recientes */}
        <p className="mt-10 mb-3 text-center font-sans text-xs uppercase tracking-widest text-white/40">
          Compras de los últimos minutos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_PROOF.map((s) => (
            <div
              key={s.nombre}
              className="flex items-center gap-3 bg-[#16181F] rounded-lg border border-white/10 px-4 py-3"
            >
              <span className="relative flex-shrink-0">
                <span className="w-8 h-8 rounded-full bg-sage-soft text-sage-dark flex items-center justify-center font-sans font-bold text-sm">
                  {s.nombre.charAt(0)}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success text-white flex items-center justify-center ring-2 ring-[#16181F]">
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
              <p className="font-sans text-xs text-white leading-snug">
                <strong>{s.nombre}</strong>
                <br />
                <span className="text-white/60">🛒 {s.accion}</span>
                <span className="text-white/40"> · hace {s.min} min</span>
              </p>
            </div>
          ))}
        </div>

        {/* CTA repetido */}
        <div className="mt-10">
          <CtaButton onClick={handleAccept} />
          <p className="mt-3 text-center font-sans text-sm text-white/60">
            🛡️ Garantía de satisfacción 30 días · Sin preguntas
          </p>
        </div>

        {/* skip → downsell-latam. Hecho intencionalmente VISIBLE (no minúsculo)
            porque varias clientas no veían el botón después de pagar el front
            y pensaban que se las había estafado al cobrarles sin entregar
            nada. El texto deja claro que YA tienen su producto. */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-block font-sans text-xs md:text-sm text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 rounded-full px-4 py-2 transition-colors"
          >
            No gracias, continuar a mi Plan de 7 Días (ya pagado) →
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Botón CTA con gradiente naranja→rosa (pedido explícito del cliente).
 * No usa el Button del design system porque ese es terracotta sólido.
 */
function CtaButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-full px-8 py-5 text-white font-sans font-bold text-lg md:text-xl leading-tight shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-transform animate-bounce-cta"
      style={{ background: 'linear-gradient(135deg, #F5821F 0%, #EC4899 100%)' }}
    >
      🔥 ¡Quiero Acelerar mis Resultados! 🔥
      <span className="block font-sans text-sm font-semibold mt-1 opacity-95">
        Sí, quiero el método completo ahora →
      </span>
    </button>
  );
}
