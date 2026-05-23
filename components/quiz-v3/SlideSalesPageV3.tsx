'use client';

/**
 * SlideSalesPageV3 — página de ventas compacta para Google Ads.
 *
 * Misma estructura que V2 pero más concisa:
 * - Countdown sticky
 * - Headline + tipo detectado
 * - Pricing 3 planes
 * - Features compactas
 * - 3 testimonios
 * - FAQ corto (3 preguntas)
 * - CTA final
 *
 * Sin: before/after visual, featured in, weekly highlights (ya los vio en paso anterior).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuizStoreV3 } from '@/lib/quiz-v3/store';
import { calcularTipoV3 } from '@/lib/quiz-v3/helpers';
import { trackV3Event } from '@/lib/quiz-v3/track';

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

const FAQ_ITEMS = [
  { q: '¿Cómo accedo?', a: 'Inmediatamente después del pago accedés a la app desde tu celular. No necesitás descargar nada.' },
  { q: '¿Es difícil de seguir?', a: 'No. Son 10 minutos al día con instrucciones paso a paso.' },
  { q: '¿Funciona si ya probé de todo?', a: 'Sí. No es una dieta genérica — es un protocolo basado en tu tipo específico de hinchazón.' },
];

const TESTIMONIALS = [
  { quote: 'Al día 4 se me deshinchó. No lo podía creer.', author: 'Anabela, 41' },
  { quote: 'Bajé 3 cm sin hacer dieta.', author: 'Verónica, 51' },
  { quote: 'Por fin entendí qué me inflamaba.', author: 'Lucía, 38' },
];

export function SlideSalesPageV3() {
  const answers = useQuizStoreV3((s) => s.answers);
  const tipo = calcularTipoV3(answers);
  const objetivo = typeof answers.objetivo === 'string' ? answers.objetivo : 'panza_plana';

  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [selectedPlan, setSelectedPlan] = useState<'1sem' | '4sem' | '8sem'>('4sem');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Track ViewContent when sales page mounts (= user reached results)
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
          content_category: 'Quiz Anti-Hinchazón V3',
        });
      }
    }

    trackV3Event('ViewContent', { tipo });
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
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) w.fbq('track', 'InitiateCheckout');
    }

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

    trackV3Event('InitiateCheckout', { plan: selectedPlan });

    const checkoutUrl = CHECKOUT_URLS[selectedPlan] || CHECKOUT_URLS['4sem'];
    const sep = checkoutUrl.includes('?') ? '&' : '?';
    // sendBeacon fires synchronously — safe to navigate immediately
    window.open(`${checkoutUrl}${sep}src=quiz_v3&plan=${selectedPlan}${utmParams}`, '_self');
  }, [selectedPlan]);

  return (
    <div className="min-h-screen bg-cream">
      {/* COUNTDOWN — normal inline element, scrolls with page, NEVER overlaps */}
      <div className="bg-coral text-white py-2.5 px-4 flex items-center justify-between text-sm font-sans">
        <span className="font-medium">
          🔥 64% off por <strong className="tabular-nums">{timeStr}</strong>
        </span>
        <button type="button" onClick={handleCheckout} className="bg-white text-coral font-bold text-xs px-4 py-1.5 rounded-full">
          OBTENER PLAN
        </button>
      </div>

      {/* HERO */}
      <section className="px-5 py-8 text-center">
        <div className="max-w-md mx-auto">
          <span className="inline-block bg-coral-soft px-3 py-1 rounded-full font-sans text-xs font-semibold text-coral mb-3">
            Tipo {tipo}: {TIPO_NOMBRES[tipo]}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-bold leading-tight">
            Tu protocolo personalizado para deshincharte en 7 días
          </h1>
          <p className="mt-3 font-sans text-sm text-[#5C5852]">
            Basado en tu diagnóstico. <strong>12,847 mujeres</strong> ya lo usan.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto space-y-3">
          <PricingCard label="1 semana" perDay="$1.414/día" total="$9.900" original="$27.500" selected={selectedPlan === '1sem'} onSelect={() => setSelectedPlan('1sem')} badge={null} />
          <PricingCard label="4 semanas" perDay="$710/día" total="$19.900" original="$55.000" selected={selectedPlan === '4sem'} onSelect={() => setSelectedPlan('4sem')} badge="MÁS POPULAR" />
          <PricingCard label="8 semanas" perDay="$535/día" total="$29.900" original="$82.500" selected={selectedPlan === '8sem'} onSelect={() => setSelectedPlan('8sem')} badge="MEJOR PRECIO" />

          <motion.button type="button" onClick={handleCheckout} whileTap={{ scale: 0.97 }} className="w-full bg-coral text-white font-sans font-bold text-base uppercase tracking-wider py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
            OBTENER MI PLAN →
          </motion.button>
          <p className="text-center text-xs text-[#9B9890] font-sans">🔒 Pago seguro · 💳 Todas las tarjetas</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-5 py-6 bg-sage-soft">
        <div className="max-w-md mx-auto grid gap-2">
          {[
            '📋 Plan de 7 días personalizado a tu tipo',
            '🍽️ Recetas antiinflamatorias fáciles',
            '🛒 Lista de compras inteligente',
            '📝 Diario para trackear tu progreso',
            '⚡ Kit de emergencia para deshincharte YA',
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-lg px-4 py-3 font-sans text-sm text-charcoal border border-sage/10">
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto space-y-2">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-[#EFECE7]">
              <div className="flex mb-1">{[1,2,3,4,5].map(s => <span key={s} className="text-[#00B67A] text-sm">★</span>)}</div>
              <p className="font-sans text-sm text-charcoal italic">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-1 font-sans text-xs text-[#9B9890]">— {t.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-6">
        <div className="max-w-md mx-auto space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#EFECE7] overflow-hidden">
              <button type="button" onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full text-left px-4 py-3 flex items-center justify-between font-sans text-sm font-medium text-charcoal">
                <span>{item.q}</span>
                <span className="text-[#9B9890]">{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && <p className="px-4 pb-3 font-sans text-sm text-[#5C5852]">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-8 bg-sage-soft">
        <div className="max-w-md mx-auto text-center">
          <p className="font-sans text-sm text-[#5C5852]">64% de descuento por tiempo limitado.</p>
          <motion.button type="button" onClick={handleCheckout} whileTap={{ scale: 0.97 }} className="mt-4 w-full bg-coral text-white font-sans font-bold text-base uppercase py-4 rounded-full shadow-lg transition-all">
            OBTENER MI PLAN →
          </motion.button>
          <p className="mt-2 text-xs text-[#9B9890]">🔒 SSL · 💳 Visa · Mastercard · Amex</p>
        </div>
      </section>

      <footer className="py-4 px-5 text-center">
        <p className="text-xs text-[#9B9890]">© {new Date().getFullYear()} Chau Hinchazón · <a href="/legal/privacidad" className="underline">Privacidad</a> · <a href="/legal/terminos" className="underline">Términos</a></p>
      </footer>
    </div>
  );
}

function PricingCard({ label, perDay, total, original, selected, onSelect, badge }: { label: string; perDay: string; total: string; original: string; selected: boolean; onSelect: () => void; badge: string | null }) {
  return (
    <button type="button" onClick={onSelect} className={`relative w-full text-left rounded-xl p-4 border-2 transition-all ${selected ? 'border-sage bg-sage-soft shadow-md' : 'border-[#EFECE7] bg-white hover:border-sage/50'}`}>
      {badge && <span className="absolute -top-2.5 right-3 bg-coral text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">{badge}</span>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-sage bg-sage' : 'border-[#9B9890]'}`}>
            {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
          </div>
          <div>
            <p className="font-sans text-base font-semibold text-charcoal">{label}</p>
            <p className="font-sans text-xs text-[#5C5852]">{perDay}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-sans text-base font-bold text-charcoal">{total}</p>
          <p className="font-sans text-xs text-[#9B9890] line-through">{original}</p>
        </div>
      </div>
    </button>
  );
}
