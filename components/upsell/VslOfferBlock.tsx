'use client';

/**
 * VslOfferBlock — bloque de oferta que aparece DEBAJO del VSL en /upsell, recién
 * cuando el video llega al punto "[ACÁ SALE EL PRECIO]" (clip ~#73 del guion).
 *
 * Hasta ese momento permanece oculto para no spoilear el precio antes de que el
 * deseo esté instalado (igual que el VSL de referencia). El retraso se controla
 * con NEXT_PUBLIC_VSL_OFFER_DELAY_SEC (default 700s ≈ 11:40).
 *
 * Contenido (según brief):
 *  - "978 personas están mirando este video ahora mismo"
 *  - CTA gradiente naranja→rosa: "🔥 ¡Quiero Acelerar mis Resultados! 🔥"
 *  - Sub-CTA: garantía 30 días
 *  - 4 burbujas de beneficio (🧬 ⚡ 🛡️ ⏰)
 *  - Contador "TU OFERTA ESPECIAL EXPIRA EN mm:ss"
 *  - Prueba social en 2 columnas
 *  - CTA repetido al final
 *
 * Tracking:
 *  - Click CTA  → fbq InitiateCheckout (PRICING.upsell, USD) + POST /api/track
 *                 → redirige DIRECTO al checkout de Hotmart (UPSELL_CHECKOUT_URL).
 *                 La atribución (UTMs + country) viaja codificada en `xcod`
 *                 vía `withCheckoutAttribution`. Ver lib/cookies.ts.
 *  - Skip       → fbq trackCustom UpsellSkip → /downsell
 *
 * El Purchase del front lo dispara el webhook server-side de Hotmart
 * (/api/hotmart-webhook); este componente NO lo toca.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMetaCookies, withCheckoutAttribution } from '@/lib/cookies';
import { PRICING, PRICING_CURRENCY, UPSELL_CHECKOUT_URL } from '@/lib/quiz-v2/config';

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
    desc: 'El deshinchado se activa mientras dormís, sin dietas restrictivas ni pasar hambre.',
  },
  {
    icon: '🛡️',
    title: 'Multiplica los resultados de tu plan actual',
    desc: 'El Protocolo TURBO complementa y potencia el Plan de 7 días que ya tenés.',
  },
  {
    icon: '⏰',
    title: 'Precio de lanzamiento solo mientras mirás el video',
    desc: 'Cuando el temporizador llegue a cero, el precio vuelve a su valor normal sin excepción.',
  },
];

const SOCIAL_PROOF = [
  { nombre: 'Lucía de Córdoba', accion: 'compró el Programa TURBO', min: 2 },
  { nombre: 'Valentina de CABA', accion: 'aseguró su acceso', min: 5 },
  { nombre: 'Florencia de Rosario', accion: 'compró el Programa TURBO', min: 3 },
  { nombre: 'Camila de Mendoza', accion: 'aseguró su acceso', min: 7 },
  { nombre: 'Sofía de La Plata', accion: 'compró el Programa TURBO', min: 4 },
  { nombre: 'Martina de Tucumán', accion: 'aseguró su acceso', min: 6 },
];

function format(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** % de descuento calculado desde la config (queda correcto si cambian precios). */
const ORIGINAL_AMOUNT = Number(PRICING.upsell.displayOriginal.replace(/[^0-9]/g, '')) || 0;
const DISCOUNT_PCT =
  ORIGINAL_AMOUNT > 0 ? Math.round((1 - PRICING.upsell.amount / ORIGINAL_AMOUNT) * 100) : 0;

export function VslOfferBlock() {
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
          value: PRICING.upsell.amount,
          currency: PRICING_CURRENCY,
          content_name: 'Programa 30 Dias Upsell',
          content_category: 'Upsell',
        });
      }
      const meta = getMetaCookies();
      // keepalive: la request de tracking sobrevive a la navegación al
      // checkout externo de Shopify (si no, se cancela al cambiar de página).
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event: 'InitiateCheckout',
          fbc: meta.fbc,
          fbp: meta.fbp,
          contentName: 'Programa 30 Dias Upsell',
          contentCategory: 'Upsell',
          value: PRICING.upsell.amount,
          currency: PRICING_CURRENCY,
        }),
      }).catch(() => {
        /* no-op: nunca bloquees al usuario por tracking */
      });

      // Redirige DIRECTO al checkout de Shopify (ya no existe la página /upsell2).
      if (UPSELL_CHECKOUT_URL) {
        // UTMs como cart attributes para que la venta del upsell también se
        // atribuya en /admin/ventas (antes caía siempre en "(directo)").
        window.location.href = withCheckoutAttribution(UPSELL_CHECKOUT_URL);
      } else {
        // Fallback dev/staging: la env var no está configurada.
        console.warn('[upsell] NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL no está configurada');
      }
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) w.fbq('trackCustom', 'UpsellSkip');
    }
    router.push('/downsell');
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
            <span className="line-through decoration-alert/70">{PRICING.upsell.displayOriginal}</span>
          </p>
          <p className="mt-1 font-sans text-xs uppercase tracking-widest text-coral font-semibold">
            Hoy pagás solo
          </p>
          <p className="mt-1 font-serif text-6xl md:text-7xl font-bold text-coral leading-none tabular-nums">
            {PRICING.upsell.display}
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

        {/* skip → downsell. Hecho intencionalmente VISIBLE (no minúsculo)
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
