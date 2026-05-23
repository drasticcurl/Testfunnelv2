'use client';

/**
 * UpsellCheckout - bloque de /upsell2
 *
 * Renderiza el widget de checkout embed de Hotmart en un iframe responsive.
 * El usuario ya decidió comprar (clickeó en /upsell), acá completa el pago
 * sin re-ingresar tarjeta gracias al one-click upsell de Hotmart.
 *
 * Cómo funciona el embed de Hotmart:
 *  - Hotmart provee una URL de checkout (variable de env NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL).
 *  - La cargamos dentro de un <iframe> sandbox que ocupa el ancho del card.
 *  - Hotmart maneja todo: validación, métodos de pago, confirmación.
 *  - Cuando el cliente paga, Hotmart redirige a la página de gracias del embudo
 *    (configurada en el panel) y dispara el webhook a /api/hotmart-webhook.
 *
 * Skip: botón secundario debajo (más chico que el principal de /upsell)
 * que manda al cliente directo a la PWA aunque no compre el upsell.
 *
 * Tracking: el tracking real de "Purchase" lo hace el webhook server-side,
 * acá NO disparamos Purchase para evitar duplicados. Solo trackeamos el
 * "ViewContent" via UpsellPageTracker en la page.
 */

import { useEffect, useRef, useState } from 'react';

const PWA_DEFAULT = 'https://chauhinchazon.hilvanapp.com/pwa/login';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

export function UpsellCheckout() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const checkoutUrl = process.env.NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL || '';
  const pwaUrl = process.env.NEXT_PUBLIC_PWA_BASE_URL || PWA_DEFAULT;

  // Si no hay URL de checkout configurada, mostramos un fallback link.
  const hasCheckout = checkoutUrl.length > 0;

  // Timeout de detección de error: si el iframe no carga en 8s, probablemente
  // está bloqueado por X-Frame-Options o el checkout no permite embed.
  // En ese caso mostramos el fallback (link directo en nueva pestaña).
  useEffect(() => {
    if (!hasCheckout) return;
    const t = setTimeout(() => {
      if (!iframeLoaded) setIframeError(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [iframeLoaded, hasCheckout]);

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) w.fbq('trackCustom', 'UpsellSkipFromCheckout');
    }
    window.location.href = pwaUrl;
  };

  return (
    <section className="bg-cream pb-16">
      <div className="max-w-content mx-auto px-4">
        {/* Mini-header arriba del checkout */}
        <div className="text-center mb-6">
          <p className="font-sans text-sm text-[#5C5852] uppercase tracking-wider font-semibold">
            Último paso — agregando tu Programa de 30 Días
          </p>
          <p className="mt-2 font-serif text-xl md:text-2xl text-charcoal">
            Total adicional: <strong className="text-coral">$19.990</strong>
          </p>
        </div>

        {/* Card del checkout */}
        <div className="bg-white rounded-xl shadow-md border border-[#EFECE7] overflow-hidden">
          {!hasCheckout && <CheckoutFallback />}

          {hasCheckout && !iframeError && (
            <>
              {!iframeLoaded && (
                <div className="flex items-center justify-center py-20" role="status">
                  <Spinner />
                  <span className="sr-only">Cargando checkout...</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={checkoutUrl}
                title="Checkout — Programa Anti-Hinchazón 30 Días"
                onLoad={() => setIframeLoaded(true)}
                className={`w-full ${iframeLoaded ? 'block' : 'hidden'}`}
                style={{ minHeight: '720px', border: 'none' }}
                /* Sandbox permisivo necesario para que Hotmart pueda procesar pagos */
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
              />
            </>
          )}

          {hasCheckout && iframeError && (
            <CheckoutErrorFallback url={checkoutUrl} />
          )}
        </div>

        {/* Trust marks */}
        <p className="mt-4 text-center font-sans text-xs text-[#9B9890]">
          🔒 Pago procesado por Hotmart · 🛡️ 7 días de garantía total · ✅ Acceso instantáneo
        </p>

        {/* Skip secundario */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="font-sans text-sm text-[#9B9890] underline underline-offset-2 hover:text-[#5C5852] transition-colors"
          >
            No gracias, ir directo a mi protocolo de 7 días
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Sub-componentes ──────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-coral"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Fallback cuando NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL no está configurada.
 * En staging y dev, esto evita que la página crashee.
 */
function CheckoutFallback() {
  return (
    <div className="p-8 md:p-12 text-center">
      <p className="font-sans text-sm text-warning font-semibold uppercase tracking-wider">
        Configuración pendiente
      </p>
      <p className="mt-3 font-serif text-xl text-charcoal">
        El checkout del upsell no está configurado todavía.
      </p>
      <p className="mt-2 font-sans text-sm text-[#5C5852]">
        Setear <code className="bg-cream-warm px-2 py-0.5 rounded">NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL</code>{' '}
        en Vercel.
      </p>
    </div>
  );
}

/**
 * Fallback cuando el iframe no puede renderizar (X-Frame-Options bloqueante,
 * o configuración del checkout que no permite embed).
 *
 * Le damos al usuario un link directo en nueva pestaña para no perder la venta.
 */
function CheckoutErrorFallback({ url }: { url: string }) {
  return (
    <div className="p-8 md:p-12 text-center">
      <p className="font-serif text-xl md:text-2xl text-charcoal">
        Tu checkout está listo
      </p>
      <p className="mt-3 font-sans text-base text-[#5C5852] max-w-md mx-auto">
        Hacé clic abajo para completar tu compra del Programa de 30 Días.
        Se abrirá en una pestaña segura.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 bg-coral text-white font-sans font-semibold uppercase tracking-wider px-8 py-4 rounded-full hover:shadow-lg transition-all"
      >
        COMPLETAR MI COMPRA POR $19.990 →
      </a>
    </div>
  );
}
