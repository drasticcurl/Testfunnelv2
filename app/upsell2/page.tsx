/**
 * /upsell2 — SEGUNDO upsell del embudo ARGENTINO (Shopify, ARS).
 *
 * Text Sales Letter (TSL, sin video) del "Acceso VIP de por vida" (pago único,
 * $19.990, ancla $49.990). El comprador llega acá DESPUÉS de aprobar el pago del
 * upsell 1 (Programa de 30 Días, $14.900). La transición upsell 1 → upsell 2 se
 * configura en el panel de la tienda (paso operativo manual), no en la app.
 *
 * Es el equivalente AR de /upsell2-latam: mismo layout, pero en pesos, con
 * checkout de Shopify y textos en español de Argentina (voseo).
 *
 * Flujo:
 *   /upsell2 → CTA "SÍ"     → checkout Shopify (UPSELL2_CHECKOUT_URL)
 *   /upsell2 → "no gracias" → /pwa/registro (crear cuenta; sin downsell en AR)
 *
 * Precios: lib/quiz-v2/config.ts → PRICING (fuente única de verdad).
 *
 * IMPORTANTE: <UpsellPageTracker page="offer"/> dispara solo ViewContent. El
 * Purchase del VIP lo dispara el webhook server-side de Shopify.
 */

import { UpsellPageTracker } from '@/components/upsell/UpsellPageTracker';
import { Upsell2Offer } from '@/components/upsell/Upsell2Offer';
import {
  PRODUCT_SHORT_NAME,
  PRICING,
} from '@/lib/quiz-v2/config';

export const metadata = {
  title: 'Acceso VIP de por vida · Chau Hinchazón',
  description: 'Una oferta única: acceso VIP de por vida a todo el contenido y las actualizaciones futuras.',
  robots: { index: false, follow: false },
};

const WHAT_INCLUDES = [
  'Acceso de por vida a la app + todo el contenido + actualizaciones futuras',
  'Calculadora PRO (macros / agua / calorías antiinflamatorias por perfil)',
  'Recetario premium ampliado (50–100 recetas nuevas) + club mensual + estacionales',
  'Biblioteca de masterclasses en texto (sueño, estrés-cortisol, ejercicio, ayuno)',
  'Protocolo de mantenimiento anti-rebote',
  'Planner/diario imprimible premium (PDF)',
  'Mini-guías PDF: "Deshinchá en 72h", "En viajes", "Cena anti-rebote", "Snacks que desinflaman"',
  'Insignia/nivel VIP dentro de la app',
  'Garantía de actualizaciones de por vida',
];

const FAQ = [
  {
    q: '¿El Acceso VIP es un pago mensual?',
    a: 'No. Es un pago ÚNICO. Lo pagás una sola vez y el acceso te queda activo de por vida, con todas las actualizaciones futuras incluidas.',
  },
  {
    q: '¿En qué se diferencia de lo que ya compré?',
    a: 'Lo que compraste antes es el programa principal. El Acceso VIP suma TODO lo premium: recetario ampliado, masterclasses, calculadora PRO, mini-guías y el protocolo anti-rebote, para siempre.',
  },
  {
    q: '¿Cómo entro después de comprar?',
    a: 'Te llega un email con tu código VIP y el link a la sección VIP dentro de la app. Ingresás el código una vez y te queda desbloqueada en tu dispositivo.',
  },
];

export default function Upsell2Page() {
  return (
    <main className="min-h-screen bg-[#0F1116] text-white">
      <UpsellPageTracker page="offer" />

      {/* Hook */}
      <section className="bg-gradient-to-b from-[#0F1116] via-[#16181F] to-[#1F2433] pt-12 pb-10">
        <div className="max-w-content mx-auto px-4 text-center">
          <span className="inline-block bg-coral/15 text-coral font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            Oferta exclusiva · una sola vez
          </span>
          <h1 className="mt-5 font-serif text-3xl md:text-5xl font-bold leading-tight text-white">
            Antes de entrar a tu app, escuchá esto:{' '}
            <span className="text-coral">tu Acceso VIP de por vida.</span>
          </h1>
          <p className="mt-5 font-sans text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Acabás de dar el paso más importante. Ahora podés asegurarte de no volver a empezar de
            cero nunca más: todo el contenido premium, las actualizaciones y las herramientas
            avanzadas, tuyas para siempre con un único pago.
          </p>
        </div>
      </section>

      {/* Problema / agitación */}
      <section className="py-10 border-t border-white/10">
        <div className="max-w-content mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center text-white">
            El problema no es desinflamarte una vez. Es <span className="text-coral">sostenerlo.</span>
          </h2>
          <p className="mt-4 font-sans text-base text-white/60 max-w-2xl mx-auto text-center leading-relaxed">
            La mayoría logra resultados al principio y después, sin un sistema de mantenimiento ni
            recetas nuevas, vuelve a los viejos hábitos. El Acceso VIP existe para que eso no te
            pase: te da el camino completo, a largo plazo.
          </p>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="py-10 border-t border-white/10">
        <div className="max-w-content mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-6 text-white">
            Todo lo que desbloqueás como VIP
          </h2>
          <ul className="max-w-2xl mx-auto space-y-3">
            {WHAT_INCLUDES.map((it) => (
              <li key={it} className="flex items-start gap-3">
                <span className="text-success mt-0.5" aria-hidden="true">✓</span>
                <span className="font-sans text-sm md:text-base text-white/80 leading-relaxed">{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Prueba social */}
      <section className="py-10 border-t border-white/10">
        <div className="max-w-content mx-auto px-4 text-center">
          <p className="font-sans text-sm text-white/70">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse-soft mr-2 align-middle" />
            Cientas de personas ya aseguraron su Acceso VIP de por vida
          </p>
          <blockquote className="mt-5 max-w-xl mx-auto font-serif text-lg md:text-xl text-white/80 italic leading-relaxed">
            “Pensé que con el programa alcanzaba, pero el VIP fue lo que me hizo sostenerlo. Las
            recetas nuevas y el protocolo anti-rebote valen muchísimo más de lo que pagué.”
          </blockquote>
          <p className="mt-3 font-sans text-sm text-white/50">— Valentina, miembro VIP</p>
        </div>
      </section>

      {/* Precio + oferta + CTAs (bloque client con tracking) */}
      <section className="border-t border-white/10">
        <Upsell2Offer />
      </section>

      {/* Garantía */}
      <section className="py-10 border-t border-white/10">
        <div className="max-w-content mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl font-semibold text-white">🛡️ Garantía de actualizaciones de por vida</h2>
          <p className="mt-3 font-sans text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
            Todo lo que sumemos al Acceso VIP en el futuro queda incluido sin costo adicional. Pagás
            una vez hoy ({PRICING.upsell2.display}) y el acceso es para siempre.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 border-t border-white/10">
        <div className="max-w-content mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-6 text-white">
            Preguntas frecuentes
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-[#16181F] rounded-xl border border-white/10 p-5">
                <h3 className="font-serif text-lg text-white">{f.q}</h3>
                <p className="mt-2 font-sans text-sm text-white/60 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final (reusa el mismo bloque de oferta con tracking) */}
      <section className="border-t border-white/10">
        <Upsell2Offer ctaLabel="👑 Sí, quiero mi Acceso VIP de por vida 👑" />
      </section>

      <footer className="bg-[#0F1116] border-t border-white/10 py-8">
        <div className="max-w-content mx-auto px-4 text-center">
          <p className="font-sans text-xs text-white/40">
            © {new Date().getFullYear()} {PRODUCT_SHORT_NAME} · Todos los derechos reservados
          </p>
          <p className="mt-2 font-sans text-xs text-white/40">
            <a href="/legal/terminos" className="underline underline-offset-2 hover:text-white/70 transition-colors">
              Términos y condiciones
            </a>
            <span className="mx-2">·</span>
            <a href="/legal/privacidad" className="underline underline-offset-2 hover:text-white/70 transition-colors">
              Política de privacidad
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
