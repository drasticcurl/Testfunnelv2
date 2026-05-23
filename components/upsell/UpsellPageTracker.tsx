'use client';

/**
 * UpsellPageTracker - dispara eventos de tracking al entrar a /upsell.
 *
 *  - Meta Pixel "ViewContent" con content_name=Upsell30Dias
 *  - POST /api/track con fbc/fbp para CAPI dedupe
 *
 * Sigue el mismo patrón que ViewContentTracker en /resultados.
 */

import { useEffect } from 'react';
import { getMetaCookies } from '@/lib/cookies';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

interface Props {
  /**
   * Identificador semántico del bloque que se está viendo.
   * Lo usamos para distinguir /upsell (oferta) y /upsell2 (checkout).
   */
  page: 'offer' | 'checkout';
}

export function UpsellPageTracker({ page }: Props) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        // Si es la página de oferta (/upsell), disparar Purchase porque
        // el usuario ya pagó el front en Hotmart antes de llegar acá.
        if (page === 'offer') {
          w.fbq('track', 'Purchase', {
            value: 14.90,
            currency: 'USD',
            content_name: 'Protocolo Anti-Hinchazon 7 Dias',
          });
        }

        w.fbq('track', 'ViewContent', {
          content_name: page === 'offer' ? 'Upsell Offer 30 Dias' : 'Upsell Checkout 30 Dias',
          content_category: 'Upsell',
        });
      }
    }

    const meta = getMetaCookies();

    // Disparar Purchase server-side (CAPI) si es /upsell
    if (page === 'offer') {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'Purchase',
          fbc: meta.fbc,
          fbp: meta.fbp,
          value: 14.90,
          currency: 'USD',
          contentName: 'Protocolo Anti-Hinchazon 7 Dias',
        }),
      }).catch(() => { /* fail silently */ });
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ViewContent',
        fbc: meta.fbc,
        fbp: meta.fbp,
        contentName: page === 'offer' ? 'Upsell Offer 30 Dias' : 'Upsell Checkout 30 Dias',
        contentCategory: 'Upsell',
      }),
    }).catch(() => {
      /* fail silently */
    });
  }, [page]);

  return null;
}
