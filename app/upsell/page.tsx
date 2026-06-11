/**
 * /upsell — pantalla post-compra del front (Plan 7 días), en formato VSL.
 *
 * Esta es la URL configurada en el checkout como página de oferta del embudo.
 * El comprador llega acá inmediatamente después de aprobar el pago del producto
 * front. La etapa siguiente es el upsell (Protocolo Agua de Arroz TURBO — 30 días).
 *
 * Layout (VSL estilo competidor):
 *   1. Warning header  → "paso crítico / no cierres"      (VslWarningHeader)
 *   2. VSL embed VTURB → la Lic. Natalia Reyes vende       (VturbPlayer)
 *   3. Pop-ups de prueba social en vivo                    (SocialProofPopups)
 *   4. Bloque de oferta que aparece en el momento clave    (VslOfferBlock)
 *        → contador, CTA naranja→rosa, beneficios, prueba social
 *
 * Flujo:
 *   /upsell        → CTA "SÍ"            → checkout de Shopify (UPSELL_CHECKOUT_URL)
 *   /upsell        → "no gracias"        → /downsell (mismo programa, menos precio)
 *   PWA /pwa/login → entrada al producto comprado
 *
 * Guion del VSL: docs/ad-scripts/vsl-upsell-turbo.md
 * Prompts del avatar: docs/ad-scripts/vsl-upsell-avatar-prompts.md
 * Precios: lib/quiz-v2/config.ts → PRICING (fuente única de verdad).
 *
 * IMPORTANTE: <UpsellPageTracker page="offer"/> dispara solo ViewContent.
 * El Purchase del front lo dispara el webhook server-side de Hotmart
 * (/api/hotmart-webhook), que es la fuente de verdad de la venta.
 */

import { UpsellPageTracker } from '@/components/upsell/UpsellPageTracker';
import { VslWarningHeader } from '@/components/upsell/VslWarningHeader';
import { VturbPlayer } from '@/components/upsell/VturbPlayer';
import { SocialProofPopups } from '@/components/upsell/SocialProofPopups';
import { VslOfferBlock } from '@/components/upsell/VslOfferBlock';
import { PRODUCT_SHORT_NAME } from '@/lib/quiz-v2/config';

export const metadata = {
  title: 'Falta un paso · Método del Agua de Arroz',
  description: 'Mirá este video antes de completar tu pedido. Una oferta exclusiva.',
  robots: { index: false, follow: false },
};

export default function UpsellPage() {
  return (
    <main className="min-h-screen bg-[#0F1116]">
      <UpsellPageTracker page="offer" />

      {/* Hero oscuro "modo cine": warning + VSL como un solo bloque */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F1116] via-[#16181F] to-[#1F2433] pb-12 md:pb-16">
        {/* glow ambiental superior */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[130%] -translate-x-1/2 rounded-full bg-coral/10 blur-3xl"
        />

        <div className="relative">
          <VslWarningHeader />

          <div className="mt-6 md:mt-8">
            <VturbPlayer />
          </div>
        </div>
      </section>

      <SocialProofPopups />

      <VslOfferBlock />

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
