'use client';

/**
 * @file SlideSalesPage.tsx — Pagina de ventas embebida al final del quiz V2.
 *
 * PARA REUTILIZAR:
 * Esta es la "carta de ventas" que aparece despues de que el usuario completa
 * el quiz. La mayoria del contenido viene de:
 *  - config.ts → producto, experta, tipos, bullets de dolor, bonus
 *  - localization.ts → pricing, textos CTA, FAQ, testimonios por pais
 *
 * Estructura (MusesAcademy style):
 *  1. Countdown bar (urgencia con descuento por tiempo limitado)
 *  2. Hero con headline personalizada + before/after + tipo detectado
 *  3. Reframe ("no es tu culpa") con bullets por tipo
 *  4. Comparativa de precio (nutricionista vs protocolo)
 *  5. Autoridad (foto + bio de la experta)
 *  6. Pricing card con CTA
 *  7. Plan semanal highlights
 *  8. Value stack (todo lo que incluye)
 *  9. Bonus desbloqueado por respuestas
 * 10. Comparativa con/sin protocolo
 * 11. Testimonios formato chat
 * 12. Garantia
 * 13. FAQ
 * 14. CTA final
 *
 * PARA PERSONALIZAR: cambia textos en config.ts y localization.ts.
 * Solo toca este archivo si necesitas cambiar la ESTRUCTURA/ORDEN de secciones.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuizStoreV2 } from '@/lib/quiz-v2/store';
import { calcularTipoV2 } from '@/lib/quiz-v2/helpers';
import { getMetaCookies, getUTMs } from '@/lib/cookies';
import { useCountry } from '@/lib/quiz-v2/CountryContext';
import {
  CHECKOUT_URL,
  QUIZ_RESULT_TYPE_NAMES,
  SEASON_DISCOUNT,
  REFRAME_BULLETS,
  EXTRA_VALUE_ITEMS,
  OBJETIVO_LABEL,
  EXPERT_NAME,
  EXPERT_TITLE,
  EXPERT_IMAGE,
  getBonusTitle,
  getBonusDesc,
} from '@/lib/quiz-v2/config';
import { STORAGE_KEYS } from '@/lib/constants';


export function SlideSalesPage() {
  const answers = useQuizStoreV2((s) => s.answers);
  const nombre = typeof answers.nombre === 'string' ? answers.nombre : undefined;
  const tipo = calcularTipoV2(answers);
  const objetivo = typeof answers.objetivo === 'string' ? answers.objetivo : 'panza_plana';
  const { pricing, texts, country } = useCountry();

  // Countdown timer (10 minutes)
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
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
        custom: {
          quiz_version: 'v2',
          tipo,
          country,
          utms,
        },
      }),
    }).catch(() => {});
  }, [tipo, country]);

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
    let storedUtms: Record<string, string> = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.utm);
      if (stored) {
        const utms = JSON.parse(stored);
        storedUtms = (typeof utms === 'object' && utms) ? utms : {};
        const p = new URLSearchParams();
        for (const [k, v] of Object.entries(utms)) {
          if (typeof v === 'string' && v.length > 0) p.set(k, v);
        }
        if (p.toString()) utmParams = `&${p.toString()}`;
      }
    } catch {}

    // Tag UTMs for tracking
    const taggedUtms = storedUtms;

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event: 'InitiateCheckout',
        custom: {
          plan: '1sem',
          quiz_version: 'v2',
          country,
          utms: taggedUtms,
        },
      }),
    }).catch(() => {});

    // Single checkout URL — upsell handled by Hotmart post-purchase
    const sep = CHECKOUT_URL.includes('?') ? '&' : '?';
    setTimeout(() => {
      window.open(`${CHECKOUT_URL}${sep}src=quiz_v2${utmParams}`, '_self');
    }, 150);
  }, [country]);

  return (
    <div className="min-h-screen bg-cream">
      {/* COUNTDOWN BAR — normal inline element, scrolls with page, NEVER overlaps */}
      <div className="bg-coral text-white py-2.5 px-4 flex items-center justify-between text-sm font-sans">
        <span className="font-medium">
          {(SEASON_DISCOUNT[country] || SEASON_DISCOUNT.AR)(timeStr)}
        </span>
        <button
          type="button"
          onClick={handleCheckout}
          className="bg-white text-coral font-bold text-xs px-4 py-1.5 rounded-full hover:bg-cream transition-colors"
        >
          {texts.ctaButton}
        </button>
      </div>

      {/* HERO */}
      <section className="px-5 py-8 text-center">
        <div className="max-w-md mx-auto">
          {/* Headline first — the user sees their personalized message immediately */}
          <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-bold leading-tight">
            {texts.heroHeadline(nombre)}
          </h1>

          {/* Social proof */}
          <p className="mt-3 font-sans text-sm text-[#5C5852]">
            <strong className="text-charcoal">{texts.socialProofCount}</strong> {texts.socialProofText} {OBJETIVO_LABEL[objetivo] || 'deshincharse'}.
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
                {QUIZ_RESULT_TYPE_NAMES[tipo]}
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


      {/* REFRAME — "No es tu culpa" */}
      <section className="px-5 py-6 bg-cream-warm">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-serif text-xl text-charcoal font-semibold leading-tight">
            {texts.reframeTitle}
          </h2>
          <p className="mt-3 font-sans text-sm text-[#5C5852] leading-relaxed">
            {texts.reframeBody}
          </p>

          {/* Bullets personalizados por tipo */}
          <div className="mt-4 text-left space-y-2">
            {getReframeBullets(tipo).map((bullet, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sage mt-0.5 flex-shrink-0">•</span>
                <p className="font-sans text-sm text-[#5C5852]">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVA DE PRECIO */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-4">
            ¿Cuánto cuesta resolver esto?
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[#EFECE7]">
              <span className="font-sans text-sm text-[#5C5852]">Nutricionista</span>
              <span className="font-sans text-sm text-[#9B9890] line-through">{pricing.comparison.nutricionista}</span>
            </div>
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[#EFECE7]">
              <span className="font-sans text-sm text-[#5C5852]">Gastroenterólogo</span>
              <span className="font-sans text-sm text-[#9B9890] line-through">{pricing.comparison.gastro}</span>
            </div>
            <div className="flex items-center justify-between bg-sage-soft rounded-lg px-4 py-3 border-2 border-sage">
              <span className="font-sans text-sm font-semibold text-charcoal">Protocolo Anti-Hinchazón</span>
              <span className="font-sans text-sm font-bold text-sage">{pricing.comparison.protocolo}</span>
            </div>
          </div>
        </div>
      </section>

      {/* AUTORIDAD — Quién diseñó este protocolo */}
      <section className="px-5 py-6 bg-cream-warm">
        <div className="max-w-md mx-auto flex items-start gap-4">
          <img
            src={EXPERT_IMAGE}
            alt={EXPERT_NAME}
            className="w-16 h-16 rounded-full object-cover border-2 border-sage flex-shrink-0 bg-sage-soft"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
            <p className="font-sans text-sm font-semibold text-charcoal">
              {EXPERT_NAME}
            </p>
            <p className="font-sans text-xs text-sage font-medium">
              {EXPERT_TITLE}
            </p>
            <p className="mt-2 font-sans text-sm text-[#5C5852] leading-relaxed">
              Diseñó el Protocolo Chau Hinchazón basándose en las últimas
              investigaciones sobre microbiota intestinal e inflamación crónica.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-5">
            {texts.choosePlanTitle}
          </h2>

          <div className="space-y-3">
            <PricingCard
              label="Protocolo Chau Hinchazón · 7 días"
              perDay={pricing.plans['1sem'].perDay}
              total={pricing.plans['1sem'].price}
              originalTotal={pricing.plans['1sem'].originalPrice}
              selected={true}
              onSelect={() => {}}
              badge="ACCESO INMEDIATO"
            />
          </div>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={handleCheckout}
            whileTap={{ scale: 0.97 }}
            className="mt-5 w-full bg-coral text-white font-sans font-bold text-base uppercase tracking-wider py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {texts.ctaButton}
          </motion.button>

          {/* Security badges */}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-[#9B9890] font-sans">
            <span>{texts.securityBadge}</span>
            <span>{texts.paymentBadges}</span>
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
            {texts.weeklyHighlights.map((w) => (
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

      {/* VALUE STACK — Grand Slam Offer */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-2">
            Todo lo que incluye tu protocolo
          </h2>
          <p className="font-sans text-xs text-[#9B9890] text-center mb-5">Acceso inmediato después del pago</p>

          <div className="space-y-3">
            {[
              { icon: '📋', title: 'Protocolo de 7 días personalizado', desc: 'Adaptado a tu Tipo de Hinchazón. Paso a paso, 10 min/día.', value: pricing.valueStack.protocolo },
              { icon: '🍽️', title: '28 recetas + lista de compras', desc: 'Desayuno, almuerzo, cena y snacks. Sabés exactamente qué comprar y cocinar.', value: pricing.valueStack.recetas },
              { icon: '⚡', title: 'Kit Express de emergencia', desc: 'Deshinchate en 20 min cuando lo necesites. Funciona siempre.', value: pricing.valueStack.kitExpress },
              { icon: '📊', title: 'Diario + calculadora de progreso', desc: 'Medí tu hinchazón y tu microbiota. Ves resultados concretos día a día.', value: pricing.valueStack.diario },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#EFECE7]">
                <span className="text-xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-sans text-sm font-semibold text-charcoal">{f.title}</p>
                    <span className="font-sans text-xs text-[#9B9890] line-through whitespace-nowrap">{f.value}</span>
                  </div>
                  <p className="font-sans text-xs text-[#5C5852] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}

            {/* Items extra personalizados por tipo de hinchazón */}
            {getExtraValueItems(tipo).map((item, i) => (
              <div key={`extra-${i}`} className="flex items-start gap-3 bg-sage-soft rounded-xl p-4 border border-sage/20">
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-sans text-sm font-semibold text-charcoal">{item.title}</p>
                    <span className="font-sans text-xs text-sage font-medium whitespace-nowrap">INCLUIDO</span>
                  </div>
                  <p className="font-sans text-xs text-[#5C5852] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total value vs actual price */}
          <div className="mt-4 bg-sage-soft rounded-xl p-4 text-center border border-sage/20">
            <p className="font-sans text-xs text-[#5C5852]">Valor total del protocolo</p>
            <p className="font-sans text-2xl font-bold text-[#9B9890] line-through">{pricing.valueStack.totalValue}</p>
            <p className="font-sans text-sm font-semibold text-charcoal mt-1">Hoy accedés por <span className="text-sage text-lg font-bold">{pricing.plans['1sem'].perDay}</span></p>
            <p className="font-sans text-xs text-[#5C5852] mt-1">93% menos que un nutricionista</p>
          </div>
        </div>
      </section>


      {/* BONUS DESBLOQUEADO */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-sage-soft to-cream-warm rounded-xl p-5 border border-sage/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎁</span>
              <p className="font-sans text-xs text-sage font-bold uppercase tracking-wider">
                Bonus desbloqueado por tus respuestas
              </p>
            </div>
            <p className="font-sans text-base font-semibold text-charcoal">
              {getBonusTitle(answers)}
            </p>
            <p className="mt-1 font-sans text-xs text-[#5C5852]">
              {getBonusDesc(answers)}
            </p>
          </div>
        </div>
      </section>

      {/* COMPARATIVA — Sin protocolo vs Con protocolo */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {/* Sin protocolo */}
            <div className="bg-white rounded-xl p-4 border border-[#EFECE7]">
              <p className="font-sans text-xs font-bold text-[#C25450] uppercase mb-3">
                Sin protocolo
              </p>
              <div className="space-y-2 text-xs text-[#5C5852] font-sans">
                <p>❌ Seguís hinchada 6+ meses</p>
                <p>❌ Probás dietas que no funcionan</p>
                <p>❌ Gastás en consultas sin resultado</p>
                <p>❌ Seguís sin saber la causa</p>
              </div>
            </div>
            {/* Con protocolo */}
            <div className="bg-sage-soft rounded-xl p-4 border border-sage/30">
              <p className="font-sans text-xs font-bold text-sage uppercase mb-3">
                Con protocolo
              </p>
              <div className="space-y-2 text-xs text-charcoal font-sans">
                <p>✅ Día 3: sentís la diferencia</p>
                <p>✅ Día 7: resultados visibles</p>
                <p>✅ Sabés exactamente qué te inflama</p>
                <p>✅ Plan hecho a tu medida</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS — formato mensaje de chat */}
      <section className="px-5 py-6 bg-cream-warm">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-5">
            Lo que nos escriben
          </h2>

          <div className="space-y-3">
            {texts.testimonials.map((t, i) => (
              <div key={i} className="flex items-end gap-2">
                {/* Avatar circle */}
                <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-sans text-xs font-bold text-sage">{t.author[0]}</span>
                </div>
                {/* Chat bubble */}
                <div className="bg-[#E8F5E1] rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] shadow-sm">
                  <p className="font-sans text-sm text-charcoal leading-relaxed">{t.quote}</p>
                  <p className="mt-1 font-sans text-[11px] text-[#6B7B5E] text-right">
                    {t.author}, {t.age} años
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GARANTÍA */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl p-5 border-2 border-sage">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-sage font-semibold">cero riesgo</p>
                <h3 className="font-serif text-lg text-charcoal font-semibold">Garantía 7 días</h3>
              </div>
            </div>
            <p className="font-sans text-sm text-[#5C5852] leading-relaxed">
              {texts.guaranteeText}
            </p>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-xl text-charcoal font-semibold text-center mb-5">
            Preguntas frecuentes
          </h2>
          <div className="space-y-2">
            {texts.faqItems.map((item, i) => (
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
            {texts.finalCtaHeadline(nombre)}
          </h2>
          <p className="mt-2 font-sans text-sm text-[#5C5852]">
            {texts.finalCtaSubtext}
          </p>
          <motion.button
            type="button"
            onClick={handleCheckout}
            whileTap={{ scale: 0.97 }}
            className="mt-5 w-full bg-coral text-white font-sans font-bold text-base uppercase tracking-wider py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {texts.ctaButton}
          </motion.button>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-[#9B9890] font-sans">
            <span>{texts.securityBadge}</span>
            <span>{texts.paymentBadges}</span>
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


// ─── Helper functions ────────────────────────────────────────────────────────
// Los datos vienen de config.ts. Estas funciones solo hacen lookup.

function getReframeBullets(tipo: number): string[] {
  return REFRAME_BULLETS[tipo] || REFRAME_BULLETS[3];
}

function getExtraValueItems(tipo: number): { icon: string; title: string; desc: string }[] {
  return EXTRA_VALUE_ITEMS[tipo] || EXTRA_VALUE_ITEMS[3];
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
            <p className="font-sans text-xs text-[#9B9890]">Total: {total} <span className="line-through">{originalTotal}</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-sans text-lg font-bold text-sage">{perDay}</p>
        </div>
      </div>
    </button>
  );
}
