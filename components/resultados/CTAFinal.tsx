'use client';

/**
 * CTAFinal - bloque grande con boton hacia Hotmart.
 * Dispara InitiateCheckout en Meta Pixel al click.
 *
 * URL del checkout:
 *  - Inicialmente recibe el `checkoutUrl` calculado server-side (con UTMs default).
 *  - Tras el mount, lee los UTMs reales del localStorage (capturados en la
 *    landing por `captureUTMs()`) y reconstruye el URL para que `utm_content`,
 *    `utm_source`, `fbclid`, etc. del ad real lleguen a Hotmart.
 */

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { buildCheckoutUrl } from '@/lib/parse-resultados';
import { getUTMs } from '@/lib/cookies';

interface Props {
  checkoutUrl: string;
}

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

export function CTAFinal({ checkoutUrl }: Props) {
  // Empezamos con el URL server-rendered (default UTMs). Despues del mount,
  // si encontramos UTMs reales en localStorage, lo sobreescribimos.
  const [url, setUrl] = useState<string>(checkoutUrl);

  useEffect(() => {
    const utms = getUTMs();
    if (Object.keys(utms).length > 0) {
      setUrl(buildCheckoutUrl(utms));
    }
  }, []);

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        // Precio cobrado en checkout: $9.990 ARS (~$7.15 USD)
        // Mandamos el value en ARS (la moneda real) para que Meta optimice
        // sobre el valor exacto que entra a la cuenta. Si en el futuro se
        // pasa a Hotmart en USD, actualizar acá Y en parse-resultados.ts.
        w.fbq('track', 'InitiateCheckout', {
          value: 9990,
          currency: 'ARS',
        });
      }

      // Trackear click en checkout para el funnel admin
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'CheckoutClick' }),
      }).catch(() => {});
    }
  };

  return (
    <section id="cta-final" className="bg-cream py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl md:text-5xl text-charcoal font-semibold leading-tight">
          Empezá tu deshinchado en 7 días
        </h2>

        <p className="mt-4 font-sans text-base md:text-lg text-[#5C5852] max-w-xl mx-auto leading-relaxed">
          Accedés instantáneamente. Sin descargas. Desde tu celular.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="font-serif text-2xl text-[#9B9890] line-through">
            $31.950
          </span>
          <span className="font-serif text-4xl md:text-5xl font-bold text-coral">
            $9.990
          </span>
        </div>

        <p className="mt-2 font-sans text-sm text-[#5C5852]">
          Precio de lanzamiento. Puede subir sin aviso.
        </p>

        <div className="mt-4 inline-flex flex-col items-center gap-1.5">
          <span className="inline-block bg-sage-soft text-sage-dark font-sans text-sm font-semibold px-4 py-2 rounded-full">
            🎁 Comprá ahora y recibí GRATIS:
          </span>
          <span className="font-sans text-xs text-[#5C5852]">
            Kit Express de Emergencia ($7.990 valor) + Calculadora de Microbiota ($4.990 valor)
          </span>
        </div>

        <div className="mt-6">
          <Button
            href={url}
            variant="primary"
            size="xl"
            onClick={handleClick}
            className="w-full md:w-auto"
          >
            EMPEZAR MI DESHINCHADO EN 7 DÍAS →
          </Button>

          <p className="mt-3 font-sans text-sm text-[#5C5852] font-medium">
            Más de 200 mujeres ya lo hicieron
          </p>

          <p className="mt-3 font-sans text-sm text-[#5C5852]">
            🔒 Pago 100% seguro · ✅ Acceso instantáneo · 🛡️ Garantía 30 días
          </p>

          <p className="mt-3 font-sans text-xs text-[#9B9890]">
            Accedés con tu email, sin contraseña. Funciona en cualquier celular.
          </p>

          <div className="mt-6 flex justify-center items-center gap-3 text-xs font-sans text-[#9B9890]">
            <span>Visa</span>
            <span>·</span>
            <span>Mastercard</span>
            <span>·</span>
            <span>Mercado Pago</span>
            <span>·</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </section>
  );
}
