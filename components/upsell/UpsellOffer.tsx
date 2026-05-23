'use client';

/**
 * UpsellOffer - bloque central de /upsell
 *
 * Comunica el upsell ($13.490: extensión a 30 días) y mueve al usuario
 * a /upsell2 donde se renderiza el checkout embed real.
 *
 * Por qué dividir /upsell y /upsell2:
 *  - /upsell  → 100% emocional + ancla de precio + CTA grande
 *  - /upsell2 → checkout embed transaccional + skip secundario
 *  Esto separa "vender la idea" de "completar la transacción", lo que
 *  reduce fricción y mejora la conversión vs página única con todo junto.
 *
 * El botón "no gracias" es deliberadamente más chico y tipo link, no botón.
 *
 * Tracking:
 *  - Click en CTA principal → Meta Pixel "InitiateCheckout" + POST /api/track
 *  - Click en "no gracias"   → Meta Pixel "trackCustom UpsellSkip"
 */

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { getMetaCookies } from '@/lib/cookies';

const PWA_DEFAULT = 'https://chauhinchazon.hilvanapp.com/pwa/login';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

const VALUE_STACK = [
  'Plan de comidas extendido a 30 días estructurados',
  '+60 recetas latinas anti-inflamatorias adicionales',
  'Lista de compras semanal lista para imprimir (4 semanas)',
  'Test guiado de reintroducción de alimentos',
  'Seguimiento avanzado de síntomas con análisis',
  'Guía de meal prep para ahorrar tiempo en la cocina',
  'Protocolos de mantenimiento post-30 días',
];

export function UpsellOffer() {
  const router = useRouter();

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        w.fbq('track', 'InitiateCheckout', {
          value: 14.3,
          currency: 'USD',
          content_name: 'Programa 30 Dias Upsell',
          content_category: 'Upsell',
        });
      }
      // Server-side track (CAPI dedupe)
      const meta = getMetaCookies();
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'InitiateCheckout',
          fbc: meta.fbc,
          fbp: meta.fbp,
          contentName: 'Programa 30 Dias Upsell',
          contentCategory: 'Upsell',
          value: 14.3,
          currency: 'USD',
        }),
      }).catch(() => {
        /* no-op: nunca bloquees al usuario por tracking */
      });
    }
    router.push('/upsell2');
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) w.fbq('trackCustom', 'UpsellSkip');
    }
    const pwaUrl = process.env.NEXT_PUBLIC_PWA_BASE_URL || PWA_DEFAULT;
    window.location.href = pwaUrl;
  };

  return (
    <section className="bg-cream pb-12 md:pb-20">
      <div className="max-w-content mx-auto px-4">
        {/* Card central */}
        <div className="bg-white rounded-xl shadow-md border border-[#EFECE7] p-6 md:p-10">
          {/* Pill scarcity */}
          <div className="text-center">
            <span className="inline-block bg-coral-soft/30 text-coral font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              Oferta única — solo en esta pantalla
            </span>
          </div>

          <h2 className="mt-6 font-serif text-2xl md:text-4xl text-charcoal text-center font-semibold leading-tight">
            Llevá tu transformación de{' '}
            <span className="text-coral">7 a 30 días completos</span>
          </h2>

          <p className="mt-4 font-sans text-base md:text-lg text-[#5C5852] text-center max-w-xl mx-auto leading-relaxed">
            7 días desinflaman. <strong className="text-charcoal">30 días reprograman tu cuerpo.</strong>
            {' '}La inflamación crónica del intestino tarda 21 a 28 días en revertirse a nivel
            celular. Por eso el plan completo de 30 días es la diferencia entre desinflamarte
            y mantenerte así.
          </p>

          {/* Value stack */}
          <div className="mt-8 bg-cream-warm/40 rounded-lg p-5 md:p-6">
            <p className="font-sans text-sm text-[#5C5852] uppercase tracking-wider font-semibold mb-4">
              Incluye TODO lo del Plan de 7 Días, más:
            </p>
            <ul className="space-y-3">
              {VALUE_STACK.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-sans text-base text-charcoal"
                >
                  <CheckBullet />
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ancla de precio con comparación */}
          <div className="mt-8 bg-cream-warm/60 rounded-lg p-5 md:p-6 text-center">
            <p className="font-sans text-sm text-[#5C5852] font-medium">
              Tu Plan de 7 Días te costó <strong className="text-charcoal">$9.990</strong>.
            </p>
            <p className="mt-1 font-sans text-sm text-[#5C5852]">
              El Programa de 30 Días normalmente sale <span className="line-through">$39.990</span>.
            </p>
            <p className="mt-4 font-sans text-sm text-coral font-semibold uppercase tracking-wider">
              Hoy, por ser compradora:
            </p>
            <p className="font-serif text-5xl md:text-6xl font-bold text-coral mt-1">
              $19.990
            </p>
            <p className="font-sans text-sm text-[#5C5852] mt-2">
              Pago único · Sin reingresar tarjeta · Acceso inmediato
            </p>
          </div>

          {/* CTA principal */}
          <div className="mt-8">
            <Button
              variant="primary"
              size="xl"
              onClick={handleAccept}
              className="w-full"
            >
              SÍ, AGREGAR A MI PEDIDO POR $19.990 →
            </Button>

            <p className="mt-3 text-center font-sans text-xs text-[#9B9890]">
              🔒 Pago 100% seguro · 🛡️ Garantía 7 días · ✅ Acceso instantáneo
            </p>
          </div>

          {/* Skip — link gris mínimo */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="font-sans text-xs text-[#C4C0B8] underline underline-offset-2 hover:text-[#9B9890] transition-colors"
            >
              Saltar →
            </button>
          </div>
        </div>

        {/* Reassurance bajo card */}
        <p className="mt-8 text-center font-sans text-sm text-[#5C5852] italic max-w-md mx-auto">
          "Los primeros 7 días aliviaron mi hinchazón. Los 30 días completos me
          enseñaron qué alimentos puedo comer sin volver atrás."
          <br />
          <span className="not-italic text-xs text-[#9B9890]">— Camila R., Buenos Aires · ✓ Compradora verificada</span>
        </p>
      </div>
    </section>
  );
}

function CheckBullet() {
  return (
    <span
      className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-sage text-white"
      aria-hidden="true"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 8L7 11L12 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
