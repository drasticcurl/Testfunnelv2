'use client';

/**
 * SlideSalesPage — página de ventas embebida al final del quiz V2.
 *
 * Estructura (MusesAcademy style):
 *  1. Countdown bar sticky (64% off por X:XX min)
 *  2. Before/After visual con tipo detectado
 *  3. Headline personalizada con nombre
 *  4. Social proof
 *  5. Pricing (3 opciones: 1 semana / 4 semanas / 8 semanas)
 *  6. Plan highlights por semana
 *  7. Badges de confianza
 *  8. FAQ
 *  9. Footer con testimonios + badges de pago
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuizStoreV2 } from '@/lib/quiz-v2/store';
import { calcularTipoV2 } from '@/lib/quiz-v2/helpers';
import { getMetaCookies, getUTMs } from '@/lib/cookies';

// Each plan has its own Hotmart checkout URL
const CHECKOUT_URLS: Record<string, string> = {
  '1sem': process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_1SEM || 'https://pay.hotmart.com/PLACEHOLDER_1SEM',
  '4sem': process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_4SEM || 'https://pay.hotmart.com/PLACEHOLDER_4SEM',
  '8sem': process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_8SEM || 'https://pay.hotmart.com/PLACEHOLDER_8SEM',
};


const TIPO_NOMBRES: Record<number, string> = {
  1: 'Hinchazón Matutina',
  2: 'Hinchazón Postprandial',
  3: 'Hinchazón Vespertina',
  4: 'Hinchazón Crónica',
};

const WEEKLY_HIGHLIGHTS = [
  { week: 1, title: 'Limpieza intestinal', desc: 'Eliminá los 7 alimentos que te inflaman sin saberlo' },
  { week: 2, title: 'Sentite liviana', desc: 'Restaurá tu microbiota con el protocolo antiinflamatorio' },
  { week: 3, title: 'Panza plana', desc: 'Reincorporá alimentos seguros y consolidá resultados' },
  { week: 4, title: 'Mantenimiento de por vida', desc: 'Tu nuevo estilo de vida sin hinchazón' },
];

const FAQ_ITEMS = [
  {
    q: '¿El plan se adapta a mi situación particular?',
    a: '¡Sí! Tu plan está hiper-personalizado según tus respuestas. Además, podés ajustar preferencias dentro de la app.',
  },
  {
    q: '¿Cómo accedo al plan?',
    a: 'Inmediatamente después del pago recibís acceso a la app Chau Hinchazón en tu celular. Es una PWA — no necesitás descargar nada del App Store.',
  },
  {
    q: '¿Qué pasa si me cuesta mantener la motivación?',
    a: 'El plan está diseñado para ser gradual. Empezás con solo 5 minutos al día y la app te guía paso a paso con recordatorios.',
  },
  {
    q: '¿Probé muchas cosas y nada funcionó. ¿Por qué esto sería diferente?',
    a: 'Porque no es una dieta genérica. Es un protocolo basado en tu tipo específico de hinchazón que ataca la causa real (inflamación intestinal), no solo los síntomas.',
  },
];

const TESTIMONIALS = [
  { quote: 'Al día 4 se me deshinchó la panza. No lo podía creer.', author: 'Anabela, 41 · Bs As', stars: 5 },
  { quote: 'Bajé 3 cm sin hacer dieta. Solo cambié 7 alimentos.', author: 'Verónica, 51 · Mendoza', stars: 5 },
  { quote: 'Por fin entendí qué me inflamaba. Años sin saberlo.', author: 'Lucía, 38 · Córdoba', stars: 5 },
  { quote: 'La app es re fácil de usar. 10 min al día y listo.', author: 'Gabriela, 44 · Rosario', stars: 5 },
];


export function SlideSalesPage() {
  const answers = useQuizStoreV2((s) => s.answers);
  const nombre = typeof answers.nombre === 'string' ? answers.nombre : undefined;
  const tipo = calcularTipoV2(answers);
  const objetivo = typeof answers.objetivo === 'string' ? answers.objetivo : 'panza_plana';

  // Countdown timer (10 minutes)
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [selectedPlan, setSelectedPlan] = useState<'1sem' | '4sem' | '8sem'>('4sem');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // ViewContent is now fired from SlideLoadingWithQuestions (on last question answer)
  // to capture the moment the user commits to seeing results.
  // ALSO fire here as backup in case user skipped loading or came back via persisted state.
  const trackedViewContent = useRef(false);
  useEffect(() => {
    if (trackedViewContent.current) return;
    trackedViewContent.current = true;

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) {
        w.fbq('track', 'ViewContent', {
          content_name: `Resultados Tipo ${tipo}`,
          content_category: 'Quiz Anti-Hinchazón V2',
        });
      }
    }

    const meta = getMetaCookies();
    const utms = getUTMs();
    fetch('/api/track', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ViewContent',
        fbc: meta.fbc,
        fbp: meta.fbp,
        contentName: `Resultados Tipo ${tipo}`,
        contentCategory: 'Quiz Anti-Hinchazón V2',
        custom: { quiz_version: 'v2', tipo, utms },
      }),
    }).catch(() => {});
  }, [tipo]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleCheckout = useCallback(() => {
    // Track checkout click
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) w.fbq('track', 'InitiateCheckout');
    }
    // Get UTMs from localStorage for attribution
    let utmParams = '';
    try {
      const stored = localStorage.getItem('anti-hinchazon-utms');
      if (stored) {
        const utms = JSON.parse(stored);
        const p = new URLSearchParams();
        for (const [k, v] of Object.entries(utms)) {
          if (typeof v === 'string' && v.length > 0) p.set(k, v);
        }
        if (p.toString()) utmParams = `&${p.toString()}`;
      }
    } catch {}

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event: 'InitiateCheckout',
        custom: { plan: selectedPlan, quiz_version: 'v2' },
      }),
    }).catch(() => {});

    // Small delay to ensure tracking request is sent before navigation
    const checkoutUrl = CHECKOUT_URLS[selectedPlan] || CHECKOUT_URLS['4sem'];
    const sep = checkoutUrl.includes('?') ? '&' : '?';
    setTimeout(() => {
      window.open(`${checkoutUrl}${sep}src=quiz_v2&plan=${selectedPlan}${utmParams}`, '_self');
    }, 150);
  }, [selectedPlan]);

  const OBJETIVO_LABEL: Record<string, string> = {
    panza_plana: 'Deshinchar tu panza',
    liviana: 'Sentirte liviana después de comer',
    digestion: 'Mejorar tu digestión',
    todo: 'Deshincharte, sentirte liviana y mejorar tu digestión',
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* COUNTDOWN BAR — normal inline element, scrolls with page, NEVER overlaps */}
      <div className="bg-coral text-white py-2.5 px-4 flex items-center justify-between text-sm font-sans">
        <span className="font-medium">
          🔥 64% descuento por{' '}
          <strong className="tabular-nums">{timeStr}</strong>
        </span>
        <button
          type="button"
          onClick={handleCheckout}
          className="bg-white text-coral font-bold text-xs px-4 py-1.5 rounded-full hover:bg-cream transition-colors"
        >
          OBTENER MI PLAN
        </button>
      </div>

      {/* HERO */}
      <section className="px-5 py-8 text-center">
        <div className="max-w-md mx-auto">
          {/* Headline first — the user sees their personalized message immediately */}
          <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-bold leading-tight">
            {nombre ? `${nombre}, ` : ''}¡deshinchá tu panza en 7 días!
          </h1>

          {/* Social proof */}
          <p className="mt-3 font-sans text-sm text-[#5C5852]">
            Sumate a las <strong className="text-charcoal">12,847 mujeres</strong> que
            lograron {OBJETIVO_LABEL[objetivo] || 'deshincharse'} con nuestro protocolo personalizado.
          </p>

          {/* Before / After — integrated card with overlaid labels */}
          <div className="mt-6 rounded-2xl overflow-hidden border border-[#EFECE7] shadow-sm">
            <img
              src="/img/before-after.png"
              alt="Antes: hinchada — Después: panza plana"
              className="w-full h-auto"
            />
          </div>

          {/* Status badges — inline, compact, below the image */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#FDE8E8] rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C25450]" />
              <span className="font-sans text-xs font-medium text-[#C25450]">
                {TIPO_NOMBRES[tipo]}
              </span>
            </div>
            <span className="text-[#9B9890] text-lg">→</span>
            <div className="flex items-center gap-1.5 bg-sage-soft rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-sage" />
              <span className="font-sans text-xs font-medium text-sage">
                {OBJETIVO_LABEL[objetivo] || 'Panza plana'}
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* PRICING */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-5">
            Elegí tu plan
          </h2>

          <div className="space-y-3">
            <PricingCard
              label="1 semana"
              perDay="$1.414/día"
              total="$9.900"
              originalTotal="$27.500"
              selected={selectedPlan === '1sem'}
              onSelect={() => setSelectedPlan('1sem')}
              badge={null}
            />
            <PricingCard
              label="4 semanas"
              perDay="$710/día"
              total="$19.900"
              originalTotal="$55.000"
              selected={selectedPlan === '4sem'}
              onSelect={() => setSelectedPlan('4sem')}
              badge="MÁS POPULAR"
            />
            <PricingCard
              label="8 semanas"
              perDay="$535/día"
              total="$29.900"
              originalTotal="$82.500"
              selected={selectedPlan === '8sem'}
              onSelect={() => setSelectedPlan('8sem')}
              badge="MEJOR PRECIO"
            />
          </div>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={handleCheckout}
            whileTap={{ scale: 0.97 }}
            className="mt-5 w-full bg-coral text-white font-sans font-bold text-base uppercase tracking-wider py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            OBTENER MI PLAN →
          </motion.button>

          {/* Security badges */}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-[#9B9890] font-sans">
            <span>🔒 Pago seguro SSL</span>
            <span>💳 Todas las tarjetas</span>
          </div>
        </div>
      </section>


      {/* WEEKLY HIGHLIGHTS */}
      <section className="px-5 py-6 bg-sage-soft">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-5">
            Tu plan semana a semana
          </h2>
          <div className="space-y-3">
            {WEEKLY_HIGHLIGHTS.map((w) => (
              <div
                key={w.week}
                className="bg-white rounded-xl p-4 border border-sage/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sage text-white flex items-center justify-center font-sans text-sm font-bold flex-shrink-0">
                    {w.week}
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-charcoal">
                      {w.title}
                    </p>
                    <p className="font-sans text-xs text-[#5C5852]">{w.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BADGES / FEATURES */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-5">
            Qué incluye tu plan
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: '📋', title: 'Plan personalizado de 7 días', desc: 'Basado en tu tipo de hinchazón y hábitos' },
              { icon: '🍽️', title: 'Recetas antiinflamatorias', desc: 'Fáciles, ricas, y diseñadas para deshinchar' },
              { icon: '🛒', title: 'Lista de compras inteligente', desc: 'Sabé exactamente qué comprar' },
              { icon: '📝', title: 'Diario de síntomas', desc: 'Medí tu progreso día a día' },
              { icon: '🧬', title: 'Calculadora de microbiota', desc: 'Medí el estado de tu salud intestinal' },
              { icon: '📊', title: 'Registro de estados', desc: 'Seguí cómo evoluciona tu hinchazón' },
              { icon: '⚡', title: 'Kit Express de emergencia', desc: 'Para cuando necesitás deshincharte YA' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#EFECE7]">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="font-sans text-sm font-semibold text-charcoal">{f.title}</p>
                  <p className="font-sans text-xs text-[#5C5852]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* TRUSTPILOT-STYLE REVIEWS */}
      <section className="px-5 py-6 bg-cream-warm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-sans text-sm font-bold text-charcoal">Excelente</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-[#00B67A] text-lg">★</span>
              ))}
            </div>
            <span className="font-sans text-xs text-[#5C5852]">4.8 de 5</span>
          </div>
          <p className="text-center font-sans text-xs text-[#9B9890] mb-4">
            Basado en 847 reseñas verificadas
          </p>

          <div className="space-y-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-[#EFECE7]">
                <div className="flex mb-1">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-[#00B67A] text-sm">★</span>
                  ))}
                </div>
                <p className="font-sans text-sm text-charcoal italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-1 font-sans text-xs text-[#9B9890]">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AS FEATURED IN (fake logos) */}
      <section className="px-5 py-6 text-center">
        <p className="font-sans text-xs text-[#9B9890] uppercase tracking-wider mb-3">
          Como se vio en
        </p>
        <div className="flex items-center justify-center gap-6 opacity-40">
          <span className="font-serif text-lg font-bold text-charcoal">Clarín</span>
          <span className="font-serif text-lg font-bold text-charcoal">Infobae</span>
          <span className="font-serif text-lg font-bold text-charcoal">La Nación</span>
        </div>
      </section>


      {/* FAQ */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-5">
            Preguntas frecuentes
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#EFECE7] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between font-sans text-sm font-medium text-charcoal"
                >
                  <span>{item.q}</span>
                  <span className="text-[#9B9890] ml-2 flex-shrink-0">
                    {faqOpen === i ? '−' : '+'}
                  </span>
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-3.5">
                    <p className="font-sans text-sm text-[#5C5852] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-8 bg-sage-soft">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-serif text-xl text-charcoal font-semibold">
            {nombre ? `${nombre}, ` : ''}tu plan te está esperando
          </h2>
          <p className="mt-2 font-sans text-sm text-[#5C5852]">
            Aprovechá el 64% de descuento antes de que expire.
          </p>
          <motion.button
            type="button"
            onClick={handleCheckout}
            whileTap={{ scale: 0.97 }}
            className="mt-5 w-full bg-coral text-white font-sans font-bold text-base uppercase tracking-wider py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            OBTENER MI PLAN →
          </motion.button>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-[#9B9890] font-sans">
            <span>🔒 SSL seguro</span>
            <span>💳 Visa · Mastercard · Amex</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-5 px-5 text-center">
        <p className="text-xs font-sans text-[#9B9890] max-w-lg mx-auto leading-relaxed">
          Este contenido es educativo. No constituye diagnóstico ni consejo médico profesional.
          Los resultados pueden variar.
        </p>
        <p className="text-xs font-sans text-[#9B9890] mt-2">
          © {new Date().getFullYear()} Chau Hinchazón ·{' '}
          <a href="/legal/privacidad" className="underline">Privacidad</a>
          {' · '}
          <a href="/legal/terminos" className="underline">Términos</a>
        </p>
      </footer>
    </div>
  );
}


// ─── Sub-components ─────────────────────────────────────────────────────────

function PricingCard({
  label,
  perDay,
  total,
  originalTotal,
  selected,
  onSelect,
  badge,
}: {
  label: string;
  perDay: string;
  total: string;
  originalTotal: string;
  selected: boolean;
  onSelect: () => void;
  badge: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left rounded-xl p-4 border-2 transition-all ${
        selected
          ? 'border-sage bg-sage-soft shadow-md'
          : 'border-[#EFECE7] bg-white hover:border-sage/50'
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 right-3 bg-coral text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selected ? 'border-sage bg-sage' : 'border-[#9B9890]'
            }`}
          >
            {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
          </div>
          <div>
            <p className="font-sans text-base font-semibold text-charcoal">{label}</p>
            <p className="font-sans text-xs text-[#5C5852]">{perDay}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-sans text-base font-bold text-charcoal">{total}</p>
          <p className="font-sans text-xs text-[#9B9890] line-through">{originalTotal}</p>
        </div>
      </div>
    </button>
  );
}
