/**
 * /upsell — pantalla post-compra del front ($14.90 → 7 días).
 *
 * Esta es la URL configurada en Hotmart como página de oferta del embudo.
 * Hotmart redirige al comprador acá inmediatamente después de aprobar el pago
 * del producto front. La etapa siguiente del embudo (configurada en Hotmart)
 * es el upsell de $9.90 (Programa 30 Días Completo).
 *
 * Flujo:
 *   1. /upsell        → muestra oferta (Hero + Offer + CTA)  ← VOS ESTÁS ACÁ
 *   2. /upsell2       → checkout embed Hotmart del upsell + skip
 *   3. PWA /pwa/login → entrada al producto comprado
 *
 * NO renderiza ningún componente que dependa del estado del quiz, porque
 * el comprador ya cruzó /resultados y los datos están en Hotmart, no en URL.
 *
 * Documento canónico: docs/11-HOTMART-SETUP.md
 */

import { UpsellHero } from '@/components/upsell/UpsellHero';
import { UpsellOffer } from '@/components/upsell/UpsellOffer';
import { UpsellPageTracker } from '@/components/upsell/UpsellPageTracker';

export const metadata = {
  title: 'Falta un paso · Chau-Hinchazón',
  description: 'Tu Plan de 7 Días está listo. Una oferta exclusiva antes de entrar.',
  robots: { index: false, follow: false },
};

export default function UpsellPage() {
  return (
    <main className="min-h-screen bg-cream">
      <UpsellPageTracker page="offer" />
      <UpsellHero />
      <UpsellOffer />
    </main>
  );
}
