'use client';

/**
 * OfertaContent — contenido principal de /oferta.
 *
 * Landing de nurture para email campaign: educa sobre el problema de la
 * hinchazón, genera deseo con prueba social, y revela un 20% OFF exclusivo
 * con countdown para generar urgencia.
 *
 * Client component porque usa:
 *  - useState/useEffect para countdown
 *  - window.location para redirect al checkout
 *  - fbq para tracking
 */

import { useEffect, useState } from 'react';
import { getMetaCookies, withCheckoutAttribution } from '@/lib/cookies';
import { PRICING, PRICING_CURRENCY, CHECKOUT_URL } from '@/lib/quiz-v2/config';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

/** Precio con 20% OFF. */
const DISCOUNT_PERCENT = 20;
const DISCOUNTED_AMOUNT = Math.round(PRICING.front.amount * (1 - DISCOUNT_PERCENT / 100));
const DISCOUNTED_DISPLAY = `$${DISCOUNTED_AMOUNT.toLocaleString('es-AR')}`;

/** Countdown de 30 minutos (1800 segundos). */
const COUNTDOWN_MINUTES = 30;

const TESTIMONIALS = [
  {
    name: 'Lucía M.',
    location: 'Córdoba',
    text: 'En 4 días ya noté la diferencia. Me levanto sin esa panza inflada que tenía hace meses. No puedo creer que algo tan simple funcione.',
    result: '-3cm de cintura en 7 días',
  },
  {
    name: 'Valentina R.',
    location: 'CABA',
    text: 'Probé mil cosas antes y nada. Con el protocolo del agua de arroz empecé a ir al baño todos los días y la hinchazón bajó muchísimo.',
    result: 'Regularizó su digestión en 5 días',
  },
  {
    name: 'Camila G.',
    location: 'Mendoza',
    text: 'Lo mejor es que no tenés que dejar de comer nada. Seguí comiendo normal y la panza se fue desinflando sola. Mi marido no lo podía creer.',
    result: '-2 talles en 3 semanas',
  },
];

const BENEFITS = [
  { icon: '🥣', text: 'El método del agua de arroz paso a paso (ritual matutino de 3 min)' },
  { icon: '📋', text: 'Plan de 21 días personalizado según tu tipo de hinchazón' },
  { icon: '🥗', text: 'Guía completa de alimentos antiinflamatorios vs. inflamatorios' },
  { icon: '📱', text: 'App con seguimiento diario y calculadora de progreso' },
  { icon: '🧘', text: 'Técnicas de deshinchado express para emergencias' },
  { icon: '💬', text: 'Acceso inmediato — empezás hoy mismo' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function OfertaContent() {
  const [remaining, setRemaining] = useState(COUNTDOWN_MINUTES * 60);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track ViewContent on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        w.fbq('track', 'ViewContent', {
          content_name: 'Oferta Email 20% OFF',
          content_category: 'Email Campaign',
          value: DISCOUNTED_AMOUNT,
          currency: PRICING_CURRENCY,
        });
      }
    }
  }, []);

  const handleCta = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        w.fbq('track', 'InitiateCheckout', {
          value: DISCOUNTED_AMOUNT,
          currency: PRICING_CURRENCY,
          content_name: 'Protocolo Chau Hinchazón - 20% OFF',
          content_category: 'Email Campaign',
        });
      }
      const meta = getMetaCookies();
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event: 'InitiateCheckout',
          fbc: meta.fbc,
          fbp: meta.fbp,
          contentName: 'Protocolo Chau Hinchazón - 20% OFF',
          contentCategory: 'Email Campaign',
          value: DISCOUNTED_AMOUNT,
          currency: PRICING_CURRENCY,
        }),
      }).catch(() => {});

      // Redirect al checkout con discount code.
      // El código QUIZ20 se aplica via ?discount=QUIZ20 en Shopify.
      if (CHECKOUT_URL) {
        const url = withCheckoutAttribution(CHECKOUT_URL);
        const separator = url.includes('?') ? '&' : '?';
        window.location.href = `${url}${separator}discount=QUIZ20`;
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      {/* ─── HERO: Gancho empático ─────────────────────────────────── */}
      <section className="text-center mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 font-sans text-[11px] md:text-xs font-bold uppercase tracking-[0.12em] text-coral">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
          </span>
          Oferta exclusiva para vos
        </span>

        <h1 className="mt-6 font-serif text-3xl md:text-5xl text-white font-semibold leading-[1.15]">
          Hiciste el test.
          <br />
          <span className="text-coral">Ya sabés qué tenés.</span>
        </h1>

        <p className="mt-5 font-sans text-base md:text-lg text-white/60 leading-relaxed max-w-lg mx-auto">
          Completaste el diagnóstico y descubrimos tu tipo de hinchazón. Pero todavía
          no empezaste a tratarla. Hoy eso cambia.
        </p>
      </section>

      {/* ─── EDUCACIÓN: Por qué no se va sola ──────────────────────── */}
      <section className="mb-12 bg-[#16181F] rounded-xl border border-white/10 p-6 md:p-8">
        <h2 className="font-serif text-xl md:text-2xl text-white font-semibold leading-tight">
          Por qué la hinchazón <span className="text-coral">no se va sola</span>
        </h2>

        <div className="mt-5 space-y-4 font-sans text-sm md:text-base leading-relaxed">
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            La hinchazón abdominal no es solo &ldquo;comer mucho&rdquo;. Es una señal de que
            tu sistema digestivo está <strong className="text-coral font-semibold">inflamado</strong> y
            no está procesando bien lo que comés.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            Con el tiempo, esa inflamación se vuelve crónica: te levantás hinchada,
            te acostás hinchada, y sentís que nada funciona.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            El <strong className="text-coral font-semibold">Método del Agua de Arroz</strong> actúa
            directamente sobre la mucosa intestinal. Es un protocolo que lleva{' '}
            <strong className="text-coral font-semibold">3 minutos por la mañana</strong> y empieza
            a desinflamar desde el primer día.
          </p>
        </div>

        {/* Mini stat */}
        <div className="mt-6 flex items-center gap-3 bg-success/10 border border-success/20 rounded-lg px-4 py-3">
          <span className="text-2xl">📊</span>
          <p className="font-sans text-sm text-white/80">
            <strong className="text-success">87% de las mujeres</strong> que empezaron el
            protocolo notaron menos hinchazón en los primeros 5 días.
          </p>
        </div>
      </section>

      {/* ─── QUÉ INCLUYE ───────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="font-serif text-xl md:text-2xl text-white font-semibold text-center mb-6">
          Qué incluye tu protocolo
        </h2>
        <div className="grid gap-3">
          {BENEFITS.map((b) => (
            <div
              key={b.text}
              className="flex items-start gap-3 bg-[#16181F] border border-white/10 rounded-lg px-4 py-3"
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{b.icon}</span>
              <p className="font-sans text-sm md:text-base text-white/80 leading-relaxed">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRUEBA SOCIAL ─────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="font-serif text-xl md:text-2xl text-white font-semibold text-center mb-6">
          Ellas ya lo hicieron
        </h2>
        <div className="space-y-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-[#16181F] border border-white/10 rounded-xl p-5 md:p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-full bg-coral/20 text-coral flex items-center justify-center font-sans font-bold text-sm">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="font-sans text-sm font-semibold text-white">{t.name}</p>
                  <p className="font-sans text-xs text-white/40">{t.location}</p>
                </div>
              </div>
              <p className="font-sans text-sm text-white/70 leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="mt-3 font-sans text-xs font-semibold text-success uppercase tracking-wider">
                {t.result}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── REVEAL: 20% OFF + COUNTDOWN ──────────────────────────── */}
      <section className="mb-8">
        <div className="bg-[#16181F] border border-coral/30 rounded-xl p-6 md:p-8 text-center shadow-xl">
          {/* Badge */}
          <span className="inline-block bg-coral text-white font-sans text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
            🎁 Exclusivo para vos
          </span>

          <h2 className="mt-5 font-serif text-2xl md:text-3xl text-white font-semibold leading-tight">
            Hoy tenés un <span className="text-coral">20% OFF</span>
          </h2>

          <p className="mt-3 font-sans text-sm text-white/50">
            Precio normal{' '}
            <span className="line-through decoration-coral/60">{PRICING.front.display}</span>
          </p>

          <p className="mt-1 font-sans text-xs uppercase tracking-widest text-coral font-semibold">
            Tu precio exclusivo
          </p>
          <p className="mt-1 font-serif text-5xl md:text-6xl font-bold text-coral leading-none">
            {DISCOUNTED_DISPLAY}
          </p>

          <p className="mt-3 font-sans text-sm text-white/50">
            Pago único · Acceso inmediato · Sin suscripción
          </p>

          {/* Countdown */}
          <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="font-sans text-xs uppercase tracking-widest text-white/40">
              Esta oferta expira en
            </p>
            <p className="mt-2 font-serif text-4xl md:text-5xl font-bold text-warning tabular-nums">
              {formatTime(remaining)}
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleCta}
            className="mt-6 w-full rounded-full px-8 py-5 text-white font-sans font-bold text-lg md:text-xl leading-tight shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-transform"
            style={{ background: 'linear-gradient(135deg, #C0553A 0%, #D4785C 100%)', boxShadow: '0 4px 20px rgba(192,85,58,0.45)' }}
          >
            QUIERO MI 20% OFF →
            <span className="block font-sans text-sm font-medium mt-1 opacity-90">
              Empezar el protocolo hoy por {DISCOUNTED_DISPLAY}
            </span>
          </button>

          <p className="mt-3 font-sans text-xs text-white/40">
            🔒 Pago seguro · 🛡️ Garantía 7 días · ✅ Acceso instantáneo
          </p>
        </div>
      </section>

      {/* ─── URGENCIA FINAL ────────────────────────────────────────── */}
      <section className="text-center pb-8">
        <p className="font-sans text-sm text-white/50 leading-relaxed max-w-md mx-auto">
          Este descuento es exclusivo para quienes completaron el test.
          Cuando el contador llegue a cero, el precio vuelve a{' '}
          <strong className="text-white/70">{PRICING.front.display}</strong> sin excepción.
        </p>
      </section>
    </div>
  );
}
