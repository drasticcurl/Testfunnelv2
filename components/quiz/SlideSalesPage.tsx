'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QuizResult, InsomniaTipo } from '@/lib/types';

// ============ COPY POR TIPO ============

const EXPLICACION: Record<InsomniaTipo, string[]> = {
  mente_acelerada: [
    'Tu sistema nervioso está atrapado en modo "alerta" a la hora de dormir. En vez de bajar revoluciones, tu cerebro interpreta la oscuridad y el silencio como una señal para procesar todo lo pendiente.',
    'Esto no es un defecto tuyo — es un patrón aprendido que se puede revertir. Tu mente necesita una rutina de "apagado" específica que le enseñe a frenar.',
    'Sin intervención, este patrón se refuerza cada noche: cuanto más intentás dormir, más se activa la mente. El protocolo rompe ese ciclo desde la primera noche.',
  ],
  despertador: [
    'Tu ciclo de sueño se fragmenta en la fase más vulnerable: entre las 2 y las 4 de la mañana, cuando tu cuerpo debería estar en sueño profundo reparador.',
    'Esto suele estar relacionado con picos de cortisol fuera de hora, fluctuaciones de glucosa nocturna, o un ambiente que no sostiene el sueño profundo.',
    'Cada despertar nocturno interrumpe la consolidación de memoria y la reparación celular. Tu cuerpo no completa los ciclos que necesita para recuperarse.',
  ],
  zombi: [
    'Dormís las horas pero no llegás a las fases profundas del sueño. Tu cuerpo pasa la noche en sueño liviano, sin alcanzar la reparación real.',
    'Las causas más comunes son: respiración subóptima, temperatura corporal elevada, alimentación nocturna inadecuada, o estrés crónico que impide la relajación profunda.',
    'Sin sueño profundo, tu cuerpo no produce hormona de crecimiento, no consolida memoria, y no elimina las toxinas cerebrales acumuladas durante el día.',
  ],
  irregular: [
    'Tu reloj biológico interno (ritmo circadiano) perdió su referencia. Sin horarios consistentes, tu cuerpo no sabe cuándo producir melatonina ni cuándo activar el cortisol matutino.',
    'Esto genera un efecto dominó: te acostás cada vez más tarde, te levantás sin energía, y compensás con estimulantes que empeoran el ciclo.',
    'La buena noticia es que el reloj circadiano se puede resetear en 5-7 días con las señales correctas de luz, alimentación y rutina.',
  ],
};

const CONSECUENCIAS = [
  'Envejecimiento acelerado (tu piel, tu cerebro, tus células)',
  'Mayor riesgo de sobrepeso y resistencia a la insulina',
  'Deterioro progresivo de la memoria y concentración',
  'Irritabilidad crónica que afecta tus relaciones',
  'Sistema inmune debilitado (te enfermás más seguido)',
  'Menor rendimiento laboral y productividad',
];

const INCLUYE = [
  'Plan noche a noche (7 noches con instrucciones específicas)',
  'Guía de suplementos naturales con dosis exactas',
  'Lista de alimentos pro-sueño y disruptores',
  'Diario de sueño digital con gráficos de progreso',
  'Rutina nocturna personalizada para tu tipo',
  'Acceso inmediato desde tu celular (PWA instalable)',
];

const TESTIMONIOS = [
  { name: 'Anabel', age: 38, text: 'Llevaba 2 años sin dormir bien. En la noche 3 ya me dormí en menos de 15 minutos. Increíble.' },
  { name: 'Martín', age: 45, text: 'Me despertaba todas las noches a las 3am. Después de la semana del protocolo, duermo de corrido.' },
  { name: 'Carolina', age: 52, text: 'Probé melatonina, apps, de todo. Esto fue lo primero que realmente funcionó. Me levanto con energía.' },
];

const FAQ = [
  {
    q: '¿Cómo accedo al protocolo?',
    a: 'Inmediatamente después de la compra recibís un email con acceso a la app. Podés instalarla en tu celular como una aplicación normal.',
  },
  {
    q: '¿Funciona si ya probé melatonina u otros suplementos?',
    a: 'Sí. El protocolo va mucho más allá de suplementos: trabaja sobre tus hábitos, rutinas, ambiente y técnicas de relajación específicas para tu tipo de insomnio.',
  },
  {
    q: '¿Es sin pastillas?',
    a: '100%. Usamos técnicas naturales basadas en evidencia científica. Cero dependencia, cero efectos secundarios.',
  },
];

// ============ SUBCOMPONENTS ============

function CountdownBar() {
  const [seconds, setSeconds] = useState(600); // 10 min

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
    <div className={`py-2.5 px-4 text-center text-sm font-medium rounded-lg mb-6 ${
      expired ? 'bg-red-500/20 text-red-300' : 'bg-accent/10 text-accent'
    }`}>
      {expired
        ? 'Oferta expirada — pero todavía podés acceder'
        : `🔥 75% OFF por ${mins}:${secs.toString().padStart(2, '0')}`}
    </div>
  );
}

function Testimonial({ name, age, text }: { name: string; age: number; text: string }) {
  return (
    <div className="bg-night-800 border border-night-600 rounded-2xl p-4 relative">
      <p className="text-gray-200 text-sm italic mb-3">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-accent text-xs font-bold">{name[0]}</span>
        </div>
        <span className="text-gray-400 text-sm">{name}, {age}</span>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-night-600 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex justify-between items-center"
      >
        <span className="text-white text-sm font-medium pr-4">{q}</span>
        <span className="text-accent text-lg flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-gray-300 text-sm">{a}</p>
        </div>
      )}
    </div>
  );
}

function PaymentBadges() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {['Visa', 'Mastercard', 'Mercado Pago', 'PayPal'].map((badge) => (
        <span key={badge} className="px-3 py-1.5 bg-night-800 border border-night-600 rounded text-xs text-gray-300">
          {badge}
        </span>
      ))}
    </div>
  );
}

// ============ MAIN COMPONENT ============

interface SlideSalesPageProps {
  result: QuizResult;
}

export default function SlideSalesPage({ result }: SlideSalesPageProps) {
  const handleCheckout = useCallback(() => {
    // Fire Meta Pixel event
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).fbq) {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('track', 'InitiateCheckout');
    }

    // Build checkout URL with UTMs
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

  const explicacion = EXPLICACION[result.tipo];

  return (
    <div className="min-h-screen bg-night-900 -mx-4 px-4 py-6">
      <CountdownBar />

      {/* Section 1: Resultado personalizado */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <p className="text-gray-400 text-sm mb-1">Tu perfil:</p>
        <h2 className="font-serif text-3xl text-white mb-2">{result.tipoNombre}</h2>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
          result.severidad > 6
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : result.severidad > 3
            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            : 'bg-green-500/20 text-green-400 border-green-500/30'
        }`}>
          Severidad: {result.severidad}/10
        </span>
      </motion.section>

      {/* Section 2: Explicación */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h3 className="font-serif text-xl text-white mb-4">¿Por qué te pasa esto?</h3>
        <div className="space-y-3">
          {explicacion.map((p, i) => (
            <p key={i} className="text-gray-300 text-sm leading-relaxed">{p}</p>
          ))}
        </div>
      </motion.section>

      {/* Section 3: Consecuencias */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="font-serif text-xl text-white mb-4">
          ¿Qué pasa si seguís sin solucionarlo?
        </h3>
        <div className="space-y-2">
          {CONSECUENCIAS.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <span className="text-gray-300 text-sm">{c}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 4: La solución */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h3 className="font-serif text-2xl text-white mb-2 text-center">
          La solución:
        </h3>
        <p className="font-serif text-xl text-accent text-center mb-4">
          Tu Protocolo de Sueño de 7 Noches
        </p>
        <p className="text-gray-300 text-sm text-center mb-6">
          Una app que te guía noche a noche con instrucciones personalizadas para tu tipo de insomnio. Sin pastillas. Sin meditaciones genéricas. Un protocolo real.
        </p>
        <div className="space-y-2.5">
          {INCLUYE.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span className="text-gray-200 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 5: Precio */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 text-center card-quiz"
      >
        <p className="text-gray-400 text-sm mb-2">Acceso completo al protocolo:</p>
        <div className="mb-2">
          <span className="text-gray-500 line-through text-lg">$14.990</span>
        </div>
        <div className="text-4xl font-bold text-white mb-1">$4.990</div>
        <p className="text-accent font-medium text-sm mb-4">
          $713/noche durante 7 noches — menos que un café
        </p>
        <button onClick={handleCheckout} className="btn-primary w-full text-lg py-4">
          Quiero dormir mejor →
        </button>
        <p className="text-gray-500 text-xs mt-3">Pago único. Acceso de por vida.</p>
      </motion.section>

      {/* Section 6: Testimonios */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h3 className="font-serif text-xl text-white mb-4 text-center">
          Lo que dicen nuestros usuarios
        </h3>
        <div className="space-y-3">
          {TESTIMONIOS.map((t) => (
            <Testimonial key={t.name} {...t} />
          ))}
        </div>
        <p className="text-gray-500 text-xs text-center mt-3">
          Más de 200 personas ya completaron el protocolo
        </p>
      </motion.section>

      {/* Section 7: Garantía */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <div className="border-2 border-accent/30 rounded-xl p-5 text-center bg-accent/5">
          <div className="text-3xl mb-2">🛡️</div>
          <h4 className="font-serif text-lg text-white mb-2">Garantía de 30 días</h4>
          <p className="text-gray-300 text-sm">
            Si no notás mejora en tu sueño en 30 días, te devolvemos el 100% de tu dinero. Sin preguntas, sin vueltas.
          </p>
        </div>
      </motion.section>

      {/* Section 8: FAQ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <h3 className="font-serif text-xl text-white mb-4 text-center">Preguntas frecuentes</h3>
        <div className="space-y-2">
          {FAQ.map((item) => (
            <FAQItem key={item.q} {...item} />
          ))}
        </div>
      </motion.section>

      {/* Section 9: CTA final */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mb-6 text-center"
      >
        <button onClick={handleCheckout} className="btn-primary w-full text-lg py-4 mb-4">
          Empezar mi protocolo de 7 noches →
        </button>
        <PaymentBadges />
      </motion.section>
    </div>
  );
}
