'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QuizResult, InsomniaTipo } from '@/lib/types';

// ═══════ DATA ═══════

const REFRAME: Record<InsomniaTipo, { titulo: string; texto: string }> = {
  mente_acelerada: {
    titulo: 'No es que "pensás demasiado"',
    texto: 'Tu sistema nervioso se quedó atrapado en modo alerta. No es un defecto tuyo — es un patrón aprendido que se puede revertir en días, no meses. Tu mente necesita que le enseñes una nueva señal de "apagado".',
  },
  despertador: {
    titulo: 'No es insomnio "normal"',
    texto: 'Despertarte a las 2-4am no es "así sos vos". Es una señal de que tu cortisol se dispara fuera de hora. Es tratable, predecible, y se corrige más rápido de lo que pensás.',
  },
  zombi: {
    titulo: 'No es que necesitás "dormir más"',
    texto: 'El problema no es la cantidad de horas — es que no llegás a las fases profundas del sueño. Tu cuerpo pasa la noche en modo superficial sin completar la reparación real.',
  },
  irregular: {
    titulo: 'No es falta de disciplina',
    texto: 'Tu reloj biológico perdió su referencia. Sin las señales correctas de luz y rutina, tu cuerpo no sabe cuándo producir melatonina. Se puede resetear en 5-7 días con el protocolo correcto.',
  },
};

const COMPARATIVA = [
  { item: 'Pastillas para dormir', precio: '$3.000-8.000/mes', contra: 'Dependencia + efectos secundarios' },
  { item: 'Psicólogo del sueño', precio: '$8.000-15.000/sesión', contra: 'Semanas para ver resultados' },
  { item: 'Suplementos variados', precio: '$2.000-5.000/mes', contra: 'Tratan síntoma, no causa' },
  { item: 'Apps de meditación', precio: '$1.500-3.000/mes', contra: 'Genéricas, no personalizadas' },
];

const VALUE_STACK = [
  { item: 'Protocolo de 7 Noches personalizado', valor: '$15.000' },
  { item: 'Guía de suplementos naturales con dosis', valor: '$5.000' },
  { item: 'Diario de sueño digital con gráficos', valor: '$4.000' },
  { item: 'Guías de alimentación pro-sueño', valor: '$4.000' },
  { item: 'Rutina nocturna personalizada', valor: '$3.000' },
  { item: 'Acceso de por vida + actualizaciones', valor: '$5.000' },
];

const WEEKLY_HIGHLIGHTS = [
  { noche: '1-2', titulo: 'Reset', desc: 'Eliminás disruptores y establecés tu horario base' },
  { noche: '3-4', titulo: 'Técnicas', desc: 'Respiración 4-7-8, body scan, y optimización del ambiente' },
  { noche: '5-6', titulo: 'Profundizar', desc: 'Alimentación pro-sueño y protocolo anti-rumiación' },
  { noche: '7', titulo: 'Consolidar', desc: 'Plan de mantenimiento para que los resultados duren' },
];

const TESTIMONIOS = [
  { name: 'Anabel', age: 38, text: 'Llevaba 2 años sin dormir una noche completa. En la noche 3 me dormí en 10 minutos. Lloré de la emoción.' },
  { name: 'Martín', age: 45, text: 'Me despertaba a las 3am todas las noches. Después del protocolo duermo de corrido. Mi pareja no lo puede creer.' },
  { name: 'Carolina', age: 52, text: 'Probé melatonina, apps, de todo. Esto atacó la causa real. En 7 noches cambió mi calidad de vida.' },
];

const FAQ = [
  { q: '¿Cómo accedo?', a: 'Inmediatamente después de la compra recibís un email con acceso a la app. La instalás en tu celular en 10 segundos.' },
  { q: '¿Funciona si ya probé melatonina?', a: 'Sí. El protocolo trabaja sobre la causa real (hábitos, rutinas, ambiente), no solo sobre el síntoma. Por eso funciona cuando lo demás falla.' },
  { q: '¿Es sin pastillas?', a: '100%. Técnicas naturales basadas en evidencia. Cero dependencia, cero efectos secundarios. Solo ciencia del sueño aplicada.' },
  { q: '¿Cuánto tiempo lleva ver resultados?', a: 'La mayoría nota cambios desde la noche 2-3. El protocolo completo son 7 noches, pero los primeros resultados son inmediatos.' },
];

// ═══════ SUBCOMPONENTS ═══════

function CountdownBar() {
  const [seconds, setSeconds] = useState(600);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const expired = seconds === 0;

  return (
    <div className={`sticky top-0 z-50 py-2.5 px-4 text-center text-sm font-medium ${
      expired ? 'bg-red-900/80 text-red-200' : 'bg-accent/90 text-night-900'
    } backdrop-blur-sm`}>
      {expired
        ? '⏰ Tiempo agotado — pero todavía podés acceder'
        : `🔥 Precio especial por ${mins}:${secs.toString().padStart(2, '0')} — 67% OFF`}
    </div>
  );
}

function Testimonial({ name, age, text }: { name: string; age: number; text: string }) {
  return (
    <div className="bg-night-800 border border-night-600 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="text-accent text-sm font-bold">{name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">{name}, {age}</p>
          <p className="text-gray-300 text-sm mt-1 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-night-600 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 flex justify-between items-center gap-3">
        <span className="text-white text-sm font-medium">{q}</span>
        <span className="text-accent text-lg flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-gray-300 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ═══════ MAIN COMPONENT ═══════

interface SlideSalesPageProps {
  result: QuizResult;
}

export default function SlideSalesPage({ result }: SlideSalesPageProps) {
  // Fire ViewContent on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).fbq) {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('track', 'ViewContent');
    }
  }, []);

  const handleCheckout = useCallback(() => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).fbq) {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('track', 'InitiateCheckout');
    }
    const baseUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL;
    if (!baseUrl || baseUrl === '[NEEDS_INPUT]') {
      console.warn('NEXT_PUBLIC_HOTMART_CHECKOUT_URL not configured');
      return;
    }
    try {
      const utmData = localStorage.getItem('dormibien_utms');
      const utms = utmData ? JSON.parse(utmData) : {};
      const url = new URL(baseUrl);
      Object.entries(utms).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value as string);
      });
      url.searchParams.set('email', result.email);
      window.open(url.toString(), '_blank');
    } catch {
      window.open(baseUrl, '_blank');
    }
  }, [result.email]);

  const reframe = REFRAME[result.tipo];
  const totalValor = VALUE_STACK.reduce((sum, item) => {
    return sum + parseInt(item.valor.replace(/[$.]/g, ''));
  }, 0);
  const nombre = result.nombre;

  return (
    <div className="min-h-screen bg-night-900 -mx-4 -mt-4">
      <CountdownBar />

      <div className="px-4 py-6 space-y-8">

        {/* ═══ 1. HERO — Resultado personalizado ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            Tu protocolo está listo
          </p>
          <h1 className="font-serif text-3xl text-white mb-3 leading-tight">
            {nombre ? `${nombre}, tu` : 'Tu'} plan de 7 noches para dormir{' '}
            <span className="text-accent">de verdad</span>
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Basado en tu diagnóstico: <span className="text-white font-medium">{result.tipoNombre}</span> (severidad {result.severidad}/10)
          </p>

          {/* Before/After mini */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-red-400 text-xs font-medium mb-1">AHORA</p>
              <p className="text-white text-sm">Dormís mal, sin energía, irritable</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
              <p className="text-green-400 text-xs font-medium mb-1">EN 7 DÍAS</p>
              <p className="text-white text-sm">Te dormís rápido, descansás de verdad</p>
            </div>
          </div>
        </motion.section>

        {/* ═══ 2. REFRAME — No es tu culpa ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-serif text-xl text-white mb-3">{reframe.titulo}</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{reframe.texto}</p>
        </motion.section>

        {/* ═══ 3. TABLA COMPARATIVA vs alternativas ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-serif text-lg text-white mb-3 text-center">
            ¿Cuánto cuesta seguir durmiendo mal?
          </h3>
          <div className="space-y-2">
            {COMPARATIVA.map((item) => (
              <div key={item.item} className="flex items-center gap-3 bg-night-800/60 rounded-lg p-3 border border-night-700/50">
                <span className="text-red-400 flex-shrink-0">✗</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{item.item}</p>
                  <p className="text-gray-500 text-xs">{item.contra}</p>
                </div>
                <span className="text-red-300 text-xs font-medium flex-shrink-0">{item.precio}</span>
              </div>
            ))}
            {/* Our solution */}
            <div className="flex items-center gap-3 bg-accent/10 rounded-lg p-3 border border-accent/30">
              <span className="text-accent flex-shrink-0">✓</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">Protocolo DormíBien</p>
                <p className="text-accent/70 text-xs">Personalizado + resultados en 3-5 noches</p>
              </div>
              <span className="text-accent text-sm font-bold flex-shrink-0">$713/día</span>
            </div>
          </div>
        </motion.section>

        {/* ═══ 4. PRICING — Precio por día destacado ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card-quiz text-center"
        >
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Acceso completo al protocolo</p>

          {/* Price per day - BIG */}
          <div className="mb-1">
            <span className="text-5xl font-bold text-white">$713</span>
            <span className="text-gray-400 text-lg">/día</span>
          </div>
          <p className="text-gray-500 text-xs mb-4">
            Menos que un café. Pago único de <span className="line-through">$14.990</span>{' '}
            <span className="text-white font-semibold">$4.990</span>
          </p>

          <button onClick={handleCheckout} className="btn-primary w-full text-lg py-4 mb-3">
            Desbloquear mi protocolo →
          </button>
          <p className="text-gray-500 text-xs">Pago único • Acceso de por vida • Satisfacción garantizada</p>
        </motion.section>

        {/* ═══ 5. CTA after pricing ═══ */}

        {/* ═══ 6. WEEKLY HIGHLIGHTS — Plan semana a semana ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="font-serif text-lg text-white mb-3 text-center">Qué vas a hacer cada noche</h3>
          <div className="space-y-2">
            {WEEKLY_HIGHLIGHTS.map((week) => (
              <div key={week.noche} className="flex gap-3 items-start bg-night-800/40 rounded-lg p-3 border border-night-700/30">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent text-xs font-bold">N{week.noche}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{week.titulo}</p>
                  <p className="text-gray-400 text-xs">{week.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ═══ 7. VALUE STACK — Hormozi style ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-serif text-lg text-white mb-3 text-center">Todo lo que incluye</h3>
          <div className="space-y-2 mb-4">
            {VALUE_STACK.map((item) => (
              <div key={item.item} className="flex items-center justify-between bg-night-800/40 rounded-lg px-4 py-2.5 border border-night-700/30">
                <div className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span className="text-gray-200 text-sm">{item.item}</span>
                </div>
                <span className="text-gray-500 text-xs line-through">{item.valor}</span>
              </div>
            ))}
          </div>
          <div className="text-center bg-night-800 rounded-xl p-4 border border-night-600">
            <p className="text-gray-400 text-xs mb-1">Valor total: <span className="line-through">${totalValor.toLocaleString()}</span></p>
            <p className="text-white text-2xl font-bold">Hoy: $4.990</p>
            <p className="text-accent text-sm font-medium">($713/día durante 7 noches)</p>
          </div>
        </motion.section>

        {/* ═══ 8. TESTIMONIOS — Chat format ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <h3 className="font-serif text-lg text-white mb-3 text-center">
            Lo que dicen quienes ya lo hicieron
          </h3>
          <div className="space-y-3">
            {TESTIMONIOS.map((t) => (
              <Testimonial key={t.name} {...t} />
            ))}
          </div>
          <p className="text-gray-500 text-xs text-center mt-2">
            Más de 200 personas completaron el protocolo
          </p>
        </motion.section>

        {/* ═══ 9. GARANTÍA — 7 días ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="border-2 border-accent/30 rounded-xl p-5 text-center bg-accent/5">
            <div className="text-3xl mb-2">🛡️</div>
            <h4 className="font-serif text-lg text-white mb-2">Garantía de 7 días</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Seguí el protocolo 7 noches. Si no notás mejora en tu sueño, te devolvemos el 100% de tu dinero. Sin preguntas, sin vueltas. El riesgo es cero.
            </p>
          </div>
        </motion.section>

        {/* ═══ 10. FAQ ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <h3 className="font-serif text-lg text-white mb-3 text-center">Preguntas frecuentes</h3>
          <div className="space-y-2">
            {FAQ.map((item) => (
              <FAQItem key={item.q} {...item} />
            ))}
          </div>
        </motion.section>

        {/* ═══ 11. CTA FINAL ═══ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4"
        >
          <button onClick={handleCheckout} className="btn-primary w-full text-lg py-4">
            Quiero dormir bien desde esta noche →
          </button>

          {/* Payment badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['Visa', 'Mastercard', 'Mercado Pago', 'PayPal'].map((badge) => (
              <span key={badge} className="px-2.5 py-1 bg-night-800 border border-night-600 rounded text-[10px] text-gray-400">
                {badge}
              </span>
            ))}
          </div>

          <p className="text-gray-600 text-[10px]">
            Pago seguro procesado por Hotmart. Al comprar aceptás los términos del servicio.
          </p>
        </motion.section>

      </div>
    </div>
  );
}
