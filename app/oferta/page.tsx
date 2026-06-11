/**
 * /oferta — Landing de nurture para leads que completaron el quiz pero no compraron.
 *
 * Se envía vía email de Shopify (segmento: amount_spent = 0, tag quiz-lead).
 * Flujo:
 *   Email Shopify → link a /oferta → educa + reveal 20% OFF → checkout con descuento
 *
 * Estructura:
 *   1. Gancho empático (sabemos que hiciste el test)
 *   2. Educación rápida (por qué la hinchazón no se va sola)
 *   3. Qué incluye el protocolo
 *   4. Prueba social (testimonials)
 *   5. Reveal 20% OFF + countdown
 *   6. CTA al checkout con código de descuento
 *
 * robots: noindex (no queremos que Google la indexe, es solo para email).
 */

import { OfertaContent } from './OfertaContent';

export const metadata = {
  title: 'Tu oferta exclusiva · Protocolo Chau Hinchazón',
  description: 'Oferta exclusiva del 20% OFF para quienes completaron el test de hinchazón.',
  robots: { index: false, follow: false },
};

export default function OfertaPage() {
  return (
    <main className="min-h-screen bg-[#0F1116]">
      <OfertaContent />
    </main>
  );
}
