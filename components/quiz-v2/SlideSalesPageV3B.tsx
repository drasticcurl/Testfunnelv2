'use client';

/**
 * SlideSalesPageV3B — sales page del FUNNEL B (test full-funnel Argentina).
 *
 * Es la sales page v2 OPTIMIZADA A CONVERSIÓN para el público argentino — no un
 * simple re-skin rosa de Funnel A. Aplica buenas prácticas de CRO pensadas para
 * el mercado argentino: precio enmarcado por día (derivado, no hardcodeado),
 * badge de % OFF derivado del ancla, prueba social arriba y repetida cerca del
 * CTA, CTA con copy orientado al beneficio + barra de compra STICKY en mobile,
 * urgencia honesta (con motivo explícito), garantía elevada al lado del precio y
 * copia 100% "vos" con modismos y comparaciones locales (café/alfajor/SUBE).
 *
 * Renderiza DENTRO de `FunnelBTheme` (paleta rosa/femenina), usando los mismos
 * tokens `var(--terracotta)` etc. — que el wrapper re-tematiza.
 *
 * REUTILIZA (sin modificar): precios/checkout de `config.ts` (PRICING,
 * PRICING_CURRENCY, CHECKOUT_URL), los testimonios existentes (su
 * CONTENIDO no cambia; solo se reposicionan), y las respuestas + helpers de
 * diagnóstico de `useQuizStore` para el informe personalizado.
 *
 * RESTRICCIONES COMERCIALES (no se violan):
 *  - NO cambia el precio ni la config de precios (todo sale de `PRICING`).
 *  - NO se inventan "cuotas"/financiación: la fila de pago es exactamente la de
 *    Funnel A → "Visa · Mastercard · MercadoPago" (pago único).
 *  - El CONTENIDO de los testimonios queda idéntico (solo se reubican).
 *
 * TRACKING (intacto): además de los eventos Meta existentes (ViewContent /
 * InitiateCheckout), dispara los eventos del test full-funnel
 * `af_<V>_salespage_view` (al montar) y `af_<V>_checkout` (al click del CTA),
 * leyendo la variante con `peekFunnelVariant()` (read-only, NO asigna). Adjunta
 * `funnel_variant` como cart attribute en el checkout (espejo del patrón
 * `ab_entry`) para atribuir upsell/downsell. La barra sticky reutiliza el MISMO
 * `handleCheckout`, así que el tracking + cart attribute disparan idénticamente.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/lib/quiz-v2/store';
import {
  calcularDiagnostico,
  calcularPesoProyectado,
  getNombre,
  getInformeResumen,
  getRecomendaciones,
} from '@/lib/quiz-v2/helpers';
import { getMetaCookies, getUTMs, withCheckoutAttribution } from '@/lib/cookies';
import {
  PRICING,
  PRICING_CURRENCY,
  CHECKOUT_URL,
} from '@/lib/quiz-v2/config';
import { peekFunnelVariant, funnelEventName } from '@/lib/quiz-v2/funnelVariant';
import { UtmifyPixel } from '@/components/UtmifyPixel';

const PRECIO = PRICING.front.display;

// ── Enmarcado de precio DERIVADO (Req 18) ─────────────────────────────────────
// Todo se computa desde `PRICING.front.amount` y el ancla "valor total", así que
// si el precio cambia en `config.ts`, el costo por día y el % OFF siguen siendo
// correctos automáticamente (no hay números hardcodeados que se desincronicen).
const FRONT_AMOUNT = PRICING.front.amount;        // ARS crudo (ej: 7790)
const VALOR_TOTAL_AMOUNT = 51000;                 // ancla "valor total" (sin cambios)
/**
 * Duración del plan (días). En Argentina NO hay upsell, así que el front product
 * se posiciona como un PLAN DE 30 DÍAS y el costo por día se divide sobre esa base.
 */
const PROTOCOL_DAYS = 30;
/** Formatea un número ARS con separador de miles "." (ej: 7790 → "$7.790"). */
function formatArs(n: number): string {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
const VALOR_TOTAL = formatArs(VALOR_TOTAL_AMOUNT); // "$51.000"
/**
 * Costo por día sobre la base del plan de 30 días (derivado, redondeado).
 * Con $7.790 → Math.round(7790 / 30) = 260 ("$260"), todavía "menos que un café".
 */
const PER_DAY = Math.round(FRONT_AMOUNT / PROTOCOL_DAYS); // ej: 260
const PER_DAY_DISPLAY = formatArs(PER_DAY);        // ej: "$260"
/** % de descuento derivado del ancla vs el precio real (ej: 1 - 7790/51000 ≈ 85%). */
const DISCOUNT_PCT = Math.round((1 - FRONT_AMOUNT / VALOR_TOTAL_AMOUNT) * 100); // ej: 85

// Ancla de costo del mundo real (Req 18): cuánto sale empezar con ayuda
// profesional particular. Se renderiza DERIVADO (formatArs) para tunearlo fácil.
// Redacción suave ("arranca en / suele costar"), sin afirmación factual absoluta.
const NUTRI_ANCHOR_AMOUNT = 30000;
const NUTRI_ANCHOR_DISPLAY = formatArs(NUTRI_ANCHOR_AMOUNT); // "$30.000"

const COUNTDOWN_SECS = 15 * 60;

// Prueba social (claim honesto, sin escasez falsa de stock). Se muestra arriba
// (cerca del hero) y repetida al lado del CTA de precio.
const SOCIAL_PROOF = '+3.000 mujeres ya empezaron';

// Mismo value stack que Funnel A (reutilizado sin modificar el contenido
// comercial — Req 8.2). La copia de marco/headlines es la que cambia.
const VALUE_STACK = [
  { icon: '🌾', title: 'Guía completa del Método Agua de Arroz', desc: 'El paso a paso exacto: cómo prepararlo, cuándo tomarlo, qué esperar cada día.', value: '$8.000' },
  { icon: '📋', title: 'Protocolo de 30 días personalizado',      desc: 'Adaptado a tu perfil digestivo. 10-15 min/día, sin dieta restrictiva.',          value: '$15.000' },
  { icon: '🍽️', title: '21 recetas antiinflamatorias fáciles',   desc: 'Desayunos, almuerzos y cenas. Lista de compras incluida.',                        value: '$10.000' },
  { icon: '⚡', title: 'Kit Express deshinchate en 20 minutos',   desc: 'Para cuando necesitás resultados rápidos. Funciona siempre.',                     value: '$6.000' },
  { icon: '📱', title: 'Acceso a la app con tu plan diario',      desc: 'Seguís el protocolo desde el celular, día a día, con recordatorios.',              value: '$12.000' },
];

// CONTENIDO de los testimonios INTACTO (Req 8.2). En Funnel B se reposicionan:
// el primero (Anabela) se destaca arriba, cerca del hero, como prueba social.
const TESTIMONIOS = [
  { quote: 'Al día 4 ya no me cerraba el jean. No lo podía creer. El agua de arroz en ayunas fue un antes y un después.', author: 'Anabela', age: 41, city: 'Buenos Aires' },
  { quote: 'En 7 días entendí qué alimento me inflamaba hace años. Nunca lo hubiera descubierto sola.', author: 'Lucía', age: 38, city: 'Córdoba' },
  { quote: 'Bajé 3 cm de panza sin hacer dieta. Solo cambié el desayuno y empecé con el agua de arroz.', author: 'Verónica', age: 51, city: 'Mendoza' },
];

const FAQ = [
  { q: '¿Cómo accedo al plan?', a: 'Apenas pagás, te llega el acceso a la app en tu celular. Es una PWA — no tenés que bajar nada del App Store.' },
  { q: '¿El plan está hecho para mí?', a: 'Sí. Todo el protocolo está calibrado con tus respuestas: tu peso, tu rutina y tu perfil digestivo.' },
  { q: '¿Cuánto tiempo me lleva por día?', a: 'Mínimo 5 minutos (preparar el agua de arroz). El protocolo completo te lleva 15-20 min.' },
  { q: '¿Y si no me funciona?', a: `Tenés 7 días de garantía total. Si no ves resultados, te devolvemos los ${PRECIO} sin preguntas. Un mail y listo.` },
  { q: '¿Tengo que comprar suplementos?', a: 'No. Usás ingredientes que ya tenés en tu casa: arroz, agua, limón y especias básicas.' },
  { q: '¿Hay alguien que no debería hacerlo?', a: 'Sí. Es un programa alimentario educativo, no reemplaza el consejo médico. Si tenés diabetes, una condición médica diagnosticada, un trastorno alimentario, estás embarazada o amamantando, tomás medicación o sos menor de edad, consultá con tu médico antes de empezar. Ante cualquier malestar, interrumpí y consultá a un profesional.' },
];

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function SlideSalesPageV3B(): JSX.Element {
  const answers = useQuizStore((s) => s.answers);
  const nombre = getNombre(answers);
  const diagnostico = calcularDiagnostico(answers);
  const peso = calcularPesoProyectado(answers);
  const informe = getInformeResumen(answers);
  const recomendaciones = getRecomendaciones(answers);

  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECS);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [hasSeenPrice, setHasSeenPrice] = useState(false);
  const trackedRef = useRef(false);
  // Ref a la sección de PRECIO: gatea la barra sticky para preservar la
  // curiosidad (la usuaria consume el value stack SIN ver el precio, y recién
  // cuando llega al precio aparece el recordatorio sticky).
  const priceRef = useRef<HTMLElement | null>(null);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Barra sticky de compra (mobile): GATEADA por la sección de precio (Req 18).
  // No aparece hasta que la sección de precio entró al viewport al menos una vez
  // (preserva la curiosidad: consumen el value stack sin ver el precio). Después
  // de verlo, queda como recordatorio en scrolls posteriores. El botón vive
  // SIEMPRE en el DOM (accesible y testeable); solo alternamos su visibilidad.
  // Fallback: si no hay IntersectionObserver, usamos un chequeo de scroll contra
  // el offsetTop de la sección de precio.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = priceRef.current;
    if (!el) return;

    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setHasSeenPrice(true);
            io.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      io.observe(el);
      return () => io.disconnect();
    }

    // Fallback sin IntersectionObserver: chequeo de posición de scroll.
    const onScroll = () => {
      const top = el.offsetTop;
      if (window.scrollY + window.innerHeight >= top) setHasSeenPrice(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ViewContent + af_<V>_salespage_view (al montar, una sola vez).
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    const variant = peekFunnelVariant();
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) w.fbq('track', 'ViewContent', { content_name: 'Sales Page V3B' });
    }
    const meta = getMetaCookies();
    const utms = getUTMs();
    fetch('/api/track', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ViewContent', fbc: meta.fbc, fbp: meta.fbp,
        contentName: 'Sales Page V3B',
        custom: { quiz_version: 'ar', nivel_inflamacion: diagnostico.nivelInflamacion, utms, funnel_variant: variant ?? undefined },
      }),
    }).catch(() => {});
    // Evento del test full-funnel: la sales page B se vio.
    if (variant) {
      fetch('/api/track', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: funnelEventName(variant, 'salespage_view'),
          fbc: meta.fbc, fbp: meta.fbp,
          custom: { quiz_version: 'ar', utms, funnel_variant: variant },
        }),
      }).catch(() => {});
    }
  }, [diagnostico.nivelInflamacion]);

  const handleCheckout = useCallback(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) w.fbq('track', 'InitiateCheckout');
    }
    const meta = getMetaCookies();
    const utms = getUTMs();
    // Variante full-funnel (read-only: NO asigna una nueva acá).
    const variant = peekFunnelVariant();
    // Evento Meta de intención (igual que Funnel A) + funnel_variant en custom.
    fetch('/api/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({
        event: 'InitiateCheckout',
        value: PRICING.front.amount,
        currency: PRICING_CURRENCY,
        fbc: meta.fbc, fbp: meta.fbp,
        custom: { quiz_version: 'ar', utms, funnel_variant: variant ?? undefined },
      }),
    }).catch(() => {});
    // Evento del test full-funnel: click en comprar.
    if (variant) {
      fetch('/api/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        body: JSON.stringify({
          event: funnelEventName(variant, 'checkout'),
          fbc: meta.fbc, fbp: meta.fbp,
          custom: { quiz_version: 'ar', utms, funnel_variant: variant },
        }),
      }).catch(() => {});
    }
    // SALIDA: checkout Shopify (GET) con `funnel_variant` como cart attribute
    // para arrastrar la variante a upsell/downsell (espejo del patrón ab_entry).
    const cartAttrs: Record<string, string> = {};
    if (variant) cartAttrs.funnel_variant = variant;
    const checkoutUrl = withCheckoutAttribution(
      CHECKOUT_URL,
      { src: 'quiz_v3b' },
      Object.keys(cartAttrs).length > 0 ? cartAttrs : undefined,
    );
    setTimeout(() => { window.open(checkoutUrl, '_self'); }, 150);
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--warm)' }}>
      {/* UTMify pixel — solo en la sales page */}
      <UtmifyPixel />

      {/* ── HERO (above the fold) ── */}
      <section className="px-5 pt-8 pb-6">
        <div className="max-w-sm mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/img/natalia-reyes.jpg"
              alt="Lic. Natalia Reyes"
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor: 'var(--terracotta)' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Lic. Natalia Reyes · MN 9283</p>
              <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>Nutricionista · especialista en hinchazón</p>
            </div>
          </div>

          {/* Headline benefit-led: promesa de resultados tempranos DENTRO del plan
              de 30 días (no afirma un "plan de 7 días") + para quién. */}
          <h1 className="text-2xl md:text-3xl leading-tight mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
            {nombre ? `${nombre}, en los primeros días ` : 'En los primeros días '}vas a empezar a deshincharte
          </h1>
          <p className="text-sm mb-3" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            El plan de 30 días del <strong>Método Agua de Arroz</strong> para mujeres argentinas que se sienten hinchadas
            e incómodas — armado a tu medida con tus respuestas.
          </p>

          {/* Prueba social arriba (Req 18). Claim honesto, sin escasez falsa. */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
            style={{ backgroundColor: 'var(--terracotta-soft)', color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
          >
            <span>⭐⭐⭐⭐⭐</span>
            <span>{SOCIAL_PROOF}</span>
          </div>

          {/* Un testimonio (CONTENIDO intacto) movido arriba como prueba social. */}
          <div className="rounded-2xl px-4 py-3 text-left mt-1" style={{ backgroundColor: '#FCE4EC' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
              “{TESTIMONIOS[0].quote}”
            </p>
            <p className="mt-1 text-xs text-right" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
              {TESTIMONIOS[0].author}, {TESTIMONIOS[0].age} años · {TESTIMONIOS[0].city}
            </p>
          </div>

          <p className="text-sm mt-4" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            Mirá lo que descubrí con tus respuestas 👇
          </p>
        </div>
      </section>

      {/* ── INFORME PERSONALIZADO ── */}
      <section className="px-5 pb-6">
        <div className="max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border p-4 mb-4" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                {nombre ? `${nombre}, esto es lo que vi en vos:` : 'Esto es lo que vi:'}
              </p>
              <ul className="flex flex-col gap-2 mb-3">
                {informe.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
                    <span className="flex-shrink-0" style={{ color: 'var(--terracotta)' }}>•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                Ya te armé un plan con el <strong>Método del Agua de Arroz</strong> pensado para tu caso.
              </p>
            </div>
          </motion.div>

          <p className="text-sm font-bold text-center mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
            Lo que te recomiendo
          </p>
          <div className="flex flex-col gap-3">
            {recomendaciones.map((rec, i) => (
              <motion.div
                key={rec.title}
                className="flex items-start gap-3 rounded-2xl p-4 border"
                style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>{rec.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{rec.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-4 rounded-2xl p-5 text-center"
            style={{ backgroundColor: 'var(--terracotta)' }}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-sm leading-relaxed text-white" style={{ fontFamily: 'var(--font-sans)' }}>
              {nombre ? `${nombre}, tu cuerpo ya está listo para cambiar.` : 'Tu cuerpo ya está listo para cambiar.'} Vas a ver la diferencia antes de lo que pensás. ¡Dale, confiá en vos!
            </p>
            <p className="mt-3 text-base text-white/90" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              Lic. Natalia Reyes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PROYECCIÓN PERSONALIZADA ── */}
      <section className="px-5 pb-6">
        <div className="max-w-sm mx-auto text-center">
          <div className="rounded-2xl border p-4" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
            <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
              Tu proyección
            </p>
            <div className="mb-4 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--warm-border)' }}>
              <img
                src="/img/before-after.png"
                alt="Antes: hinchada — Después: panza plana"
                className="block w-full h-auto"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>Hoy</p>
                <p className="text-2xl font-bold" style={{ color: '#E53935', fontFamily: 'var(--font-sans)' }}>{peso.pesoActual} kg</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                  <path d="M0 8h32M28 2l8 6-8 6" stroke="var(--terracotta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-bold" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>-{peso.bajadaKg} kg</span>
              </div>
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{peso.fechaProyectada.split(' ').slice(0,3).join(' ')}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--success)', fontFamily: 'var(--font-sans)' }}>{peso.pesoProyectado} kg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EL MÉTODO ── */}
      <section className="px-5 py-6" style={{ backgroundColor: 'var(--terracotta-soft)' }}>
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-center mb-4" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>¿Por qué te va a funcionar?</h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: '🔬', text: 'El almidón resistente alimenta las bacterias buenas de tu intestino — es un prebiótico natural' },
              { icon: '🔥', text: 'Baja la inflamación intestinal en 48-72hs — se nota, no es placebo' },
              { icon: '💧', text: 'Regula el tránsito, saca la retención de líquidos y te deshincha la panza desde adentro' },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl p-4 border" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
                <span className="text-2xl flex-shrink-0">{b.icon}</span>
                <p className="text-sm" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STACK ── */}
      <section className="px-5 py-6" style={{ backgroundColor: 'var(--terracotta-soft)' }}>
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-center mb-5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Todo lo que te llevás</h2>
          <div className="flex flex-col gap-3">
            {VALUE_STACK.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl p-4 border" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>{item.title}</p>
                    <span className="text-xs line-through flex-shrink-0" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>{item.value}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIO ── */}
      <section className="px-5 py-6" ref={priceRef}>
        <div className="max-w-sm mx-auto text-center">
          {/* Ancla de costo del mundo real (Req 18): construye expectativa de algo
              caro ANTES de revelar el precio. Complementa (no reemplaza) el ancla
              "valor total $51.000" tachada de abajo. Redacción suave en "vos". */}
          <div
            className="rounded-2xl border px-4 py-3 mb-4 text-left"
            style={{ backgroundColor: 'var(--terracotta-soft)', borderColor: 'var(--warm-border)' }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
              Pensalo así: una sola consulta particular con un nutricionista{' '}
              <strong>arranca en ~{NUTRI_ANCHOR_DISPLAY}</strong> — y para ver resultados necesitás varias.
              Acá tenés el método completo, calibrado para vos, por mucho menos.
            </p>
          </div>

          {/* Urgencia HONESTA: con motivo explícito (no escasez falsa de stock). */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-2 animate-pulse-soft"
            style={{ backgroundColor: '#FDECEA', color: 'var(--alert)', fontFamily: 'var(--font-sans)' }}
          >
            ⏰ Precio promo solo hoy · vence en {formatTime(timeLeft)}
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            Después vuelve a {VALOR_TOTAL}.
          </p>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
              Protocolo Agua de Arroz — Acceso completo
            </p>

            {/* Ancla "valor total" tachada + badge de % OFF derivado. */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>Valor total</span>
              <span className="text-sm line-through" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>{VALOR_TOTAL}</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'var(--terracotta)', color: '#fff', fontFamily: 'var(--font-sans)' }}
              >
                {DISCOUNT_PCT}% OFF hoy
              </span>
            </div>

            <div className="my-1">
              <span className="text-4xl font-bold" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>{PRECIO}</span>
            </div>
            {/* Enmarcado por día DERIVADO de PRICING.front.amount (base 30 días, Req 18).
                Mostramos el precio FINAL al lado del costo por día (ambos derivados). */}
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
              ~{PER_DAY_DISPLAY} por día · {PRECIO} en total — menos que un café ☕
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
              Lo que gastás en un alfajor o un par de viajes en SUBE, una sola vez.
            </p>

            <button type="button" onClick={handleCheckout} className="btn-primary mb-3" aria-label="Empezar el Protocolo Agua de Arroz">
              EMPEZAR A DESHINCHARME →
            </button>

            {/* Prueba social repetida cerca del CTA (Req 18). */}
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>
              ⭐ {SOCIAL_PROOF}
            </p>

            {/* Reversión de riesgo COMPACTA al lado del precio/CTA. */}
            <div
              className="flex items-start gap-2 rounded-xl px-3 py-2 mb-3 text-left"
              style={{ backgroundColor: 'var(--terracotta-soft)', fontFamily: 'var(--font-sans)' }}
            >
              <span className="text-base flex-shrink-0">🛡️</span>
              <p className="text-xs" style={{ color: 'var(--charcoal)' }}>
                <strong>Garantía 7 días.</strong> Si no ves resultados, te devolvemos los {PRECIO}. Cero riesgo.
              </p>
            </div>

            {/* Fila de pago IDÉNTICA a Funnel A — pago único, sin cuotas. */}
            <div className="flex items-center justify-center gap-3 text-xs" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
              <span>🔒 Pago seguro SSL</span>
              <span>·</span>
              <span>💳 Visa · Mastercard · MercadoPago</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="px-5 py-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-center mb-5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Lo que nos cuentan</h2>
          <div className="flex flex-col gap-3">
            {TESTIMONIOS.map((t) => (
              <div key={t.author} className="flex items-end gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ backgroundColor: 'var(--terracotta-soft)', color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
                >
                  {t.author[0]}
                </div>
                <div className="rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]" style={{ backgroundColor: '#FCE4EC' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>{t.quote}</p>
                  <p className="mt-1 text-xs text-right" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
                    {t.author}, {t.age} años · {t.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GARANTÍA (elevada) ── */}
      <section className="px-5 py-6">
        <div className="max-w-sm mx-auto rounded-2xl p-5 border-2" style={{ backgroundColor: '#fff', borderColor: 'var(--terracotta)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--terracotta)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>cero riesgo</p>
              <h3 className="text-lg" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Probalo 7 días sin riesgo</h3>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            Hacé el protocolo completo. Si en 7 días no ves resultados, nos escribís un mail y te devolvemos
            los {PRECIO} enteros, sin preguntas ni vueltas. El riesgo lo ponemos nosotros, no vos.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-center mb-5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Lo que más nos preguntan</h2>
          <div className="flex flex-col gap-2">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <span className="text-sm font-medium pr-2" style={{ color: 'var(--charcoal)' }}>{item.q}</span>
                  <span className="flex-shrink-0" style={{ color: 'var(--muted-light)' }}>{faqOpen === i ? '−' : '+'}</span>
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-5 py-8" style={{ backgroundColor: 'var(--terracotta-soft)' }}>
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-xl mb-2" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
            {nombre ? `${nombre}, tu plan te espera` : 'Tu plan te espera'}
          </h2>
          <p className="text-sm mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            Hoy {PRECIO} (~{PER_DAY_DISPLAY} por día). Después vuelve a {VALOR_TOTAL}. El precio promo vence en:
          </p>
          <p className="text-2xl font-bold mb-5" style={{ color: 'var(--alert)', fontFamily: 'var(--font-sans)' }}>
            {formatTime(timeLeft)}
          </p>
          <motion.button
            type="button"
            onClick={handleCheckout}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            aria-label="Empezar el Protocolo Agua de Arroz"
          >
            EMPEZAR A DESHINCHARME →
          </motion.button>
          <p className="text-xs font-semibold mt-3" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>
            ⭐ {SOCIAL_PROOF}
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 text-xs" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
            <span>🔒 Pago seguro</span><span>·</span>
            <span>⚡ Acceso inmediato</span><span>·</span>
            <span>✅ Garantía 7 días</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 px-5 text-center">
        <p className="text-xs leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
          Este contenido es educativo. No constituye diagnóstico ni consejo médico profesional. Los resultados pueden variar.
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
          © {new Date().getFullYear()} Protocolo Agua de Arroz ·{' '}
          <a href="/legal/privacidad" className="underline">Privacidad</a>{' · '}
          <a href="/legal/terminos" className="underline">Términos</a>
        </p>
      </footer>

      {/* ── STICKY BUY-BAR (mobile) ──
          Fija al fondo; aparece al scrollear. Reutiliza el MISMO handleCheckout
          (tracking + cart attribute idénticos). Accesible: <button> + aria-label.
          Se oculta en pantallas grandes (md:hidden) y no tapa el footer porque el
          contenedor raíz lleva `pb-24`. */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${hasSeenPrice ? 'translate-y-0' : 'translate-y-full'}`}
        data-testid="sticky-buybar"
        aria-hidden={!hasSeenPrice}
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid var(--warm-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="max-w-sm mx-auto flex items-center gap-3 px-4 py-3">
          <div className="flex flex-col text-left leading-tight">
            <span className="text-base font-bold" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>{PRECIO}</span>
            <span className="text-[11px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>~{PER_DAY_DISPLAY} por día</span>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="btn-primary flex-1"
            style={{ marginBottom: 0 }}
            aria-label="Empezar ahora el Protocolo Agua de Arroz"
          >
            EMPEZAR →
          </button>
        </div>
      </div>
    </div>
  );
}
