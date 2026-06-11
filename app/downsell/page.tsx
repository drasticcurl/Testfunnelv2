/**
 * /downsell — última oferta del embudo.
 *
 * Llega aquí desde /upsell cuando el usuario rechaza el upsell ("no gracias").
 * Ofrece EL MISMO Programa de 30 Días pero a precio menor (PRICING.downsell).
 * No cambia el producto: es solo una bajada de precio como segunda chance.
 *
 * Flujo:
 *   /upsell  → "no gracias"      → /downsell  ← VOS ESTÁS ACÁ
 *   /downsell → CTA "SÍ"         → redirige al checkout de Shopify (downsell)
 *   /downsell → "no gracias"     → PWA login
 *
 * Precios: lib/quiz-v2/config.ts → PRICING (fuente única de verdad).
 *
 * Purchase NO se dispara acá: lo hace el webhook /api/shopify-webhook
 * server-side al recibir orders/paid.
 */

import { DownsellOffer } from '@/components/upsell/DownsellOffer';
import { UpsellPageTracker } from '@/components/upsell/UpsellPageTracker';

export const metadata = {
  title: 'Última oportunidad · Método del Agua de Arroz',
  description: 'Una última oferta del Programa de 30 Días antes de entrar a tu protocolo.',
  robots: { index: false, follow: false },
};

export default function DownsellPage() {
  return (
    <main className="min-h-screen bg-[#0F1116] pt-12 md:pt-16">
      <UpsellPageTracker page="checkout" />
      <DownsellOffer />
    </main>
  );
}
