/**
 * /upsell2 — segunda etapa del flujo de upsell.
 *
 * Llega aquí desde /upsell cuando el usuario clickea "SÍ, AGREGAR A MI PEDIDO".
 * Renderiza el checkout embed de Hotmart del producto $9.90 + un skip secundario.
 *
 * Flujo completo:
 *   /upsell  → CTA "SÍ"          → /upsell2
 *   /upsell  → CTA "no gracias"  → PWA login
 *   /upsell2 → completar pago    → Hotmart redirige a thank-you del embudo
 *   /upsell2 → "no gracias"      → PWA login
 *
 * Importante: el evento Purchase NO se dispara en esta página. Lo dispara
 * el webhook /api/hotmart-webhook server-side al recibir PURCHASE_APPROVED,
 * para evitar duplicados con CAPI dedupe.
 */

import { UpsellCheckout } from '@/components/upsell/UpsellCheckout';
import { UpsellPageTracker } from '@/components/upsell/UpsellPageTracker';

export const metadata = {
  title: 'Completar tu pedido · Chau-Hinchazón',
  description: 'Completá tu pedido del Programa de 30 Días.',
  robots: { index: false, follow: false },
};

export default function Upsell2Page() {
  return (
    <main className="min-h-screen bg-cream pt-12 md:pt-16">
      <UpsellPageTracker page="checkout" />

      {/* Mini-encabezado de progreso */}
      <div className="max-w-content mx-auto px-4 text-center mb-8">
        <ProgressBar />
        <h1 className="mt-6 font-serif text-2xl md:text-4xl text-charcoal font-semibold leading-tight">
          Completá tu pedido
        </h1>
        <p className="mt-3 font-sans text-base text-[#5C5852] max-w-md mx-auto">
          Estás a un clic de extender tu protocolo a 30 días.
        </p>
      </div>

      <UpsellCheckout />
    </main>
  );
}

/**
 * Mini progreso visual: 2 de 3 pasos completados.
 * Da contexto visual de "ya casi terminás" sin ser invasivo.
 */
function ProgressBar() {
  return (
    <div
      className="flex items-center justify-center gap-2 max-w-xs mx-auto"
      aria-label="Paso 2 de 3"
    >
      <Step done label="Plan 7 días" />
      <Connector active />
      <Step active label="Programa 30 días" />
      <Connector />
      <Step label="Acceder" />
    </div>
  );
}

function Step({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  const base = 'flex flex-col items-center gap-1 flex-shrink-0';
  const dotBase = 'w-3 h-3 rounded-full transition-colors';
  const dotClass = done
    ? 'bg-sage'
    : active
      ? 'bg-coral ring-4 ring-coral-soft/40'
      : 'bg-[#D6D2CB]';
  const labelClass = done
    ? 'text-sage-dark'
    : active
      ? 'text-coral font-semibold'
      : 'text-[#9B9890]';

  return (
    <div className={base}>
      <span className={`${dotBase} ${dotClass}`} aria-hidden="true" />
      <span className={`text-[10px] md:text-xs font-sans uppercase tracking-wider ${labelClass}`}>
        {label}
      </span>
    </div>
  );
}

function Connector({ active }: { active?: boolean }) {
  return (
    <span
      className={`flex-1 h-px ${active ? 'bg-sage' : 'bg-[#D6D2CB]'}`}
      aria-hidden="true"
    />
  );
}
