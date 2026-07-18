'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/lib/quiz-v2/store';
import { calcularDiagnostico, calcularPesoProyectado, getNombre, getInformeResumen, getRecomendaciones } from '@/lib/quiz-v2/helpers';
import { getMetaCookies, getUTMs, withHotmartCheckout } from '@/lib/cookies';
import { PRICING_LATAM, PRICING_CURRENCY_LATAM, LATAM_CHECKOUT_URL } from '@/lib/quiz-v2/config-latam';

const PRECIO        = PRICING_LATAM.front.display;
const VALOR_TOTAL   = 'US$72';
const COUNTDOWN_SECS = 15 * 60;

const VALUE_STACK = [
  { icon: '🌾', title: 'Guía completa del Método Agua de Arroz', desc: 'El paso a paso exacto: cómo prepararlo, cuándo tomarlo, qué esperar cada día.', value: 'US$12' },
  { icon: '📋', title: 'Protocolo de 7 días personalizado',      desc: 'Adaptado a tu perfil digestivo. 10-15 min/día, sin dieta restrictiva.',          value: 'US$19' },
  { icon: '🍽️', title: '21 recetas antiinflamatorias fáciles',   desc: 'Desayunos, almuerzos y cenas. Lista de compras incluida.',                        value: 'US$15' },
  { icon: '⚡', title: 'Kit Express deshinchate en 20 minutos',   desc: 'Para cuando necesitas resultados rápidos. Funciona siempre.',                     value: 'US$9' },
  { icon: '📱', title: 'Acceso a la app con tu plan diario',      desc: 'Sigues el protocolo desde el celular, día a día, con recordatorios.',              value: 'US$17' },
];

const TESTIMONIOS = [
  { quote: 'Al día 4 ya no me cerraba el jean. No lo podía creer. El agua de arroz en ayunas fue un antes y un después.', author: 'Anabela', age: 41, city: 'México' },
  { quote: 'En 7 días entendí qué alimento me inflamaba hace años. Nunca lo hubiera descubierto sola.', author: 'Lucía', age: 38, city: 'Colombia' },
  { quote: 'Bajé 3 cm de barriga sin hacer dieta. Solo cambié el desayuno y empecé con el agua de arroz.', author: 'Verónica', age: 51, city: 'Perú' },
];

const FAQ = [
  { q: '¿Cómo accedo al plan?', a: 'Inmediatamente después del pago recibes acceso a la app en tu celular. Es una PWA — no necesitas descargar nada del App Store.' },
  { q: '¿El plan está personalizado a mis respuestas?', a: 'Sí. Todo el protocolo está calibrado según tu peso, tu rutina y tu perfil digestivo determinado en el test.' },
  { q: '¿Cuánto tiempo necesito por día?', a: 'Mínimo 5 minutos (preparar el agua de arroz). El protocolo completo lleva 15-20 min.' },
  { q: '¿Y si no funciona para mí?', a: `Tienes 30 días de garantía completa. Si no ves resultados, te devolvemos los ${PRECIO} sin preguntas. Un email y listo.` },
  { q: '¿Necesito comprar suplementos o productos especiales?', a: 'No. Todo el método usa ingredientes que ya tienes en tu casa: arroz, agua, limón y especias básicas.' },
  { q: '¿Hay alguien que no debería hacer el protocolo?', a: 'Sí. Es un programa alimentario educativo, no reemplaza el consejo médico. Si tienes diabetes, una condición médica diagnosticada (renal, cardíaca, gastrointestinal, etc.), un trastorno alimentario, estás embarazada o amamantando, tomas medicación o eres menor de edad, consulta con tu médico antes de empezar. Ante cualquier malestar, interrumpe y consulta a un profesional.' },
];

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function SlideSalesPageLatam() {
  const answers     = useQuizStore((s) => s.answers);
  const nombre      = getNombre(answers);
  const diagnostico = calcularDiagnostico(answers);
  const peso        = calcularPesoProyectado(answers);
  const informe       = getInformeResumen(answers);
  const recomendaciones = getRecomendaciones(answers);

  const [timeLeft, setTimeLeft]   = useState(COUNTDOWN_SECS);
  const [faqOpen, setFaqOpen]     = useState<number | null>(null);
  const trackedRef                 = useRef(false);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // ViewContent tracking
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) w.fbq('track', 'ViewContent', { content_name: 'Sales Page LATAM' });
    }
    const meta = getMetaCookies();
    const utms = getUTMs();
    fetch('/api/track', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ViewContent', fbc: meta.fbc, fbp: meta.fbp,
        contentName: 'Sales Page LATAM',
        custom: { quiz_version: 'latam', nivel_inflamacion: diagnostico.nivelInflamacion, utms },
      }),
    }).catch(() => {});
  }, [diagnostico.nivelInflamacion]);

  const handleCheckout = useCallback(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) w.fbq('track', 'InitiateCheckout');
    }
    // Registramos el click en "comprar" server-side. El store de /admin/funnel
    // lo cuenta como checkoutClick. Mandamos los UTMs (capturados en cookies)
    // para que el click quede atribuido a la campaña, igual que ViewContent.
    const meta = getMetaCookies();
    const utms = getUTMs();
    fetch('/api/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({
        event: 'InitiateCheckout',
        value: PRICING_LATAM.front.amount,
        currency: PRICING_CURRENCY_LATAM,
        fbc: meta.fbc, fbp: meta.fbp,
        custom: { quiz_version: 'latam', utms },
      }),
    }).catch(() => {});
    // Checkout vía Hotmart. NO se pasa email ni PII: el funnel /latam no captura
    // email (la PWA tiene registro abierto) y el comprador lo ingresa en Hotmart.
    const checkoutUrl = withHotmartCheckout(LATAM_CHECKOUT_URL, { src: 'quiz_latam' });
    if (!checkoutUrl) {
      console.warn('[latam/sales] NEXT_PUBLIC_LATAM_CHECKOUT_URL no configurada');
      return;
    }
    setTimeout(() => { window.open(checkoutUrl, '_self'); }, 150);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--warm)' }}>

      {/* ── HERO ── */}
      <section className="px-5 pt-8 pb-6">
        <div className="max-w-sm mx-auto text-center">
          {/* Experta */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/img/natalia-reyes.jpg"
              alt="Lic. Natalia Reyes"
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor: 'var(--terracotta)' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Lic. Natalia Reyes</p>
              <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>Nutricionista</p>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl leading-tight mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
            {nombre ? `${nombre}, analicé tus respuestas` : 'Analicé tus respuestas'} y preparé tu plan personalizado
          </h1>

          <p className="text-sm mb-2" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            Basado en tu perfil digestivo y tus objetivos
          </p>
        </div>
      </section>

      {/* ── INFORME PERSONALIZADO (justo debajo de "Basado en tu perfil") ── */}
      <section className="px-5 pb-6">
        <div className="max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            {/* Diagnóstico inicial (bullets, escaneable) */}
            <div className="rounded-2xl border p-4 mb-4" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                {nombre ? `¡Hola ${nombre}! Esto es lo que vi:` : 'Esto es lo que vi:'}
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
                Ya armé un plan con el <strong>Método del Agua de Arroz</strong> pensado especialmente para ti.
              </p>
            </div>
          </motion.div>

          {/* Recomendaciones para ti */}
          <p className="text-sm font-bold text-center mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
            Recomendaciones para ti
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

          {/* Cierre firmado (fondo terracota, texto blanco) */}
          <motion.div
            className="mt-4 rounded-2xl p-5 text-center"
            style={{ backgroundColor: 'var(--terracotta)' }}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-sm leading-relaxed text-white" style={{ fontFamily: 'var(--font-sans)' }}>
              {nombre ? `${nombre}, tu cuerpo ya está preparado para transformarse.` : 'Tu cuerpo ya está preparado para transformarse.'} Vas a ver cambios antes de lo que imaginas. ¡Confía en el proceso!
            </p>
            <p className="mt-3 text-base text-white/90" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              Lic. Natalia Reyes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PROYECCIÓN PERSONALIZADA (imagen arriba + peso, sin IMC) ── */}
      <section className="px-5 pb-6">
        <div className="max-w-sm mx-auto text-center">
          <div className="rounded-2xl border p-4" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
            <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
              Tu proyección personalizada
            </p>

            {/* Imagen antes / después (ARRIBA del peso) */}
            <div className="mb-4 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--warm-border)' }}>
              <img
                src="/img/before-after.png"
                alt="Antes: hinchada — Después: barriga plana"
                className="block w-full h-auto"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            {/* Peso */}
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

      {/* ── VALOR EXTRA: timeline de transformación ── */}
      <section className="px-5 py-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-center mb-1" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
            {nombre ? `${nombre}, esto es lo que vas a sentir` : 'Esto es lo que vas a sentir'}
          </h2>
          <p className="text-sm text-center mb-5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            Tu transformación con el método, día a día
          </p>
          <div className="flex flex-col gap-3">
            {[
              { tag: 'Día 1-2', icon: '🌱', title: 'Arranca el reset digestivo', desc: 'Tu intestino empieza a desinflamarse y a soltar líquidos retenidos.' },
              { tag: 'Día 3-4', icon: '✨', title: 'Te levantas más liviana', desc: 'Notas la barriga más plana al despertar y menos hinchazón después de comer.' },
              { tag: 'Día 5-7', icon: '👖', title: 'La ropa te queda distinto', desc: 'Más energía durante el día y la ropa que te apretaba empieza a entrar mejor.' },
              { tag: 'Día 7+', icon: '🧭', title: 'Ya sabes qué te inflama', desc: 'Entiendes tu cuerpo y tienes el plan para mantener los resultados.' },
            ].map((step) => (
              <div key={step.tag} className="flex items-start gap-3 rounded-2xl p-4 border" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
                <span className="text-2xl flex-shrink-0">{step.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--terracotta-soft)', color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>{step.tag}</span>
                    <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>{step.title}</p>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-4" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
            Todo guiado paso a paso desde la app, sin dietas restrictivas.
          </p>
        </div>
      </section>

      {/* ── EL MÉTODO ── */}
      <section className="px-5 py-6" style={{ backgroundColor: 'var(--terracotta-soft)' }}>
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-center mb-4" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>¿Por qué funciona el Agua de Arroz?</h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: '🔬', text: 'El almidón resistente es un prebiótico natural que alimenta las bacterias buenas de tu intestino' },
              { icon: '🔥', text: 'Reduce la inflamación intestinal en 48-72hs — medible, no placebo' },
              { icon: '💧', text: 'Regula el tránsito, elimina retención de líquidos y deshincha la barriga desde adentro' },
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
          <h2 className="text-xl text-center mb-5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Todo lo que incluye tu protocolo</h2>
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
      <section className="px-5 py-6">
        <div className="max-w-sm mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 animate-pulse-soft"
            style={{ backgroundColor: '#FDECEA', color: 'var(--alert)', fontFamily: 'var(--font-sans)' }}
          >
            ⏰ Solo por hoy · vence en {formatTime(timeLeft)}
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
              Protocolo Agua de Arroz — Acceso completo
            </p>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-sm line-through" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>{VALOR_TOTAL}</span>
            </div>
            <div className="my-1">
              <span className="text-4xl font-bold" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>{PRECIO}</span>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>menos que un café</p>

            <button type="button" onClick={handleCheckout} className="btn-primary mb-3">
              QUIERO MI PLAN PERSONALIZADO →
            </button>

            <div className="flex items-center justify-center gap-3 text-xs" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
              <span>🔒 Pago seguro SSL</span>
              <span>·</span>
              <span>💳 Visa · Mastercard · PayPal</span>
            </div>
          </div>

          {/* Comparativa */}
          <div className="mt-4 flex flex-col gap-2">
            {[
              { label: 'Nutricionista privada', value: 'US$80/mes', crossed: true },
              { label: 'Gastroenterólogo', value: 'US$60 consulta', crossed: true },
              { label: 'Protocolo Agua de Arroz', value: PRECIO + ' total', crossed: false },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl px-4 py-3 border"
                style={{
                  backgroundColor: row.crossed ? '#fff' : 'var(--terracotta-soft)',
                  borderColor: row.crossed ? 'var(--warm-border)' : 'var(--terracotta)',
                }}
              >
                <span className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row.label}</span>
                <span
                  className={`text-sm font-bold ${row.crossed ? 'line-through' : ''}`}
                  style={{ color: row.crossed ? 'var(--muted-light)' : 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="px-5 py-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-center mb-5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Lo que nos escriben</h2>
          <div className="flex flex-col gap-3">
            {TESTIMONIOS.map((t) => (
              <div key={t.author} className="flex items-end gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ backgroundColor: 'var(--terracotta-soft)', color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
                >
                  {t.author[0]}
                </div>
                <div className="rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]" style={{ backgroundColor: '#E8F5E1' }}>
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

      {/* ── SIN / CON ── */}
      <section className="px-5 py-6">
        <div className="max-w-sm mx-auto grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}>
            <p className="text-xs font-bold uppercase mb-3" style={{ color: 'var(--alert)', fontFamily: 'var(--font-sans)' }}>Sin protocolo</p>
            {['Sigues hinchada 6+ meses', 'Pruebas dietas que no funcionan', 'Gastas en consultas sin resultado', 'Sin saber qué te inflama'].map((t) => (
              <p key={t} className="text-xs mb-1.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>❌ {t}</p>
            ))}
          </div>
          <div className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--terracotta-soft)', borderColor: 'rgba(192,85,58,0.2)' }}>
            <p className="text-xs font-bold uppercase mb-3" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>Con protocolo</p>
            {['Día 3: sientes la diferencia', 'Día 7: resultados visibles', 'Sabes qué te inflama', 'Plan hecho a tu medida'].map((t) => (
              <p key={t} className="text-xs mb-1.5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>✅ {t}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── GARANTÍA ── */}
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
              <h3 className="text-lg" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Garantía 30 días</h3>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            Si en 30 días no ves resultados, te devolvemos los {PRECIO} sin preguntas. Un email y listo.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-center mb-5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Preguntas frecuentes</h2>
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
            {nombre ? `${nombre}, tu plan te está esperando` : 'Tu plan te está esperando'}
          </h2>
          <p className="text-sm mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            El precio especial de {PRECIO} vence en:
          </p>
          <p className="text-2xl font-bold mb-5" style={{ color: 'var(--alert)', fontFamily: 'var(--font-sans)' }}>
            {formatTime(timeLeft)}
          </p>
          <motion.button
            type="button"
            onClick={handleCheckout}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
          >
            QUIERO MI PLAN POR {PRECIO} →
          </motion.button>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
            <span>🔒 Pago seguro</span><span>·</span>
            <span>⚡ Acceso inmediato</span><span>·</span>
            <span>✅ Garantía 30 días</span>
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

    </div>
  );
}
