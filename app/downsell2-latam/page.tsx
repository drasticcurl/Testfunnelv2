/**
 * /downsell2-latam — segunda chance del SEGUNDO upsell del embudo LATAM.
 *
 * Llega aquí desde /upsell2-latam cuando el usuario rechaza el Acceso VIP
 * ("no gracias"). Ofrece EL MISMO producto VIP que /upsell2-latam pero a precio
 * menor (PRICING_LATAM.downsell2, US$17). No cambia el producto: es solo una
 * bajada de precio como última oportunidad. Apunta a una URL de checkout de
 * Hotmart distinta (LATAM_DOWNSELL2_CHECKOUT_URL) configurada para el precio menor.
 *
 * Flujo:
 *   /upsell2-latam   → "no gracias"  → /downsell2-latam  ← ESTÁS AQUÍ
 *   /downsell2-latam → CTA "SÍ"      → checkout Hotmart (downsell 2)
 *   /downsell2-latam → "no gracias"  → PWA (PWA_BASE_URL_LATAM) — fin del embudo
 *
 * Precios: lib/quiz-v2/config-latam.ts → PRICING_LATAM (fuente única LATAM).
 *
 * Purchase NO se dispara aquí: lo hace el webhook de Hotmart server-side.
 */

import { Downsell2OfferLatam } from '@/components/upsell/Downsell2OfferLatam';
import { UpsellPageTracker } from '@/components/upsell/UpsellPageTracker';

export const metadata = {
  title: 'Última oportunidad · Acceso VIP de por vida',
  description: 'Una última oportunidad de sumar el Acceso VIP de por vida a un precio especial.',
  robots: { index: false, follow: false },
};

export default function Downsell2LatamPage() {
  return (
    <main className="min-h-screen bg-[#0F1116] pt-12 md:pt-16">
      <UpsellPageTracker page="checkout" />
      <Downsell2OfferLatam />
    </main>
  );
}
