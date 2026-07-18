/**
 * /downsell-latam — última oferta del embudo PARALELO LATAM.
 *
 * Llega aquí desde /upsell-latam cuando el usuario rechaza el upsell
 * ("no gracias"). Ofrece EL MISMO Programa de 30 Días pero a precio menor
 * (PRICING_LATAM.downsell, USD). No cambia el producto: es solo una bajada de
 * precio como segunda chance.
 *
 * Flujo:
 *   /upsell-latam   → "no gracias"  → /downsell-latam  ← ESTÁS AQUÍ
 *   /downsell-latam → CTA "SÍ"      → redirige al checkout de Hotmart (downsell)
 *   /downsell-latam → "no gracias"  → PWA de registro (PWA_BASE_URL_LATAM)
 *
 * Precios: lib/quiz-v2/config-latam.ts → PRICING_LATAM (fuente única LATAM).
 *
 * Purchase NO se dispara aquí: lo hace el webhook de Hotmart server-side al
 * recibir la compra confirmada.
 */

import { DownsellOfferLatam } from '@/components/upsell/DownsellOfferLatam';
import { UpsellPageTracker } from '@/components/upsell/UpsellPageTracker';

export const metadata = {
  title: 'Última oportunidad · Protocolo Chau Hinchazón',
  description: 'Una última oferta del Programa de 30 Días antes de entrar a tu protocolo.',
  robots: { index: false, follow: false },
};

export default function DownsellLatamPage() {
  return (
    <main className="min-h-screen bg-[#0F1116] pt-12 md:pt-16">
      <UpsellPageTracker page="checkout" />
      <DownsellOfferLatam />
    </main>
  );
}
