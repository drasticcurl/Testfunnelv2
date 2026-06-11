'use client';

/**
 * UpsellPageTracker - dispara eventos de tracking al entrar a /upsell y /downsell.
 *
 *  - Meta Pixel (client-side) + POST /api/track (CAPI server-side)
 *
 * Solo dispara ViewContent. El "Purchase" del front se dispara ÚNICAMENTE
 * desde el webhook server-side de Shopify (/api/shopify-webhook), que es la
 * fuente de verdad de la venta confirmada.
 *
 * Por qué NO disparamos Purchase acá:
 *  Antes (cuando no había webhook server-side de venta) este componente
 *  disparaba Purchase al llegar a /upsell, asumiendo que "llegar = pagó".
 *  Eso era poco confiable (depende de que el browser cargue la página) y,
 *  ahora que el webhook de Shopify ya reporta el Purchase, generaba DOBLE
 *  conteo en Meta (cliente + webhook con event_id distintos → sin dedup).
 *  Por eso el Purchase vive solo en el webhook.
 */

import { useEffect } from 'react';
import { getMetaCookies } from '@/lib/cookies';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

interface Props {
  /**
   * Identificador semántico del bloque que se está viendo.
   * Lo usamos para distinguir /upsell (oferta) y /downsell (checkout).
   */
  page: 'offer' | 'checkout';
}

export function UpsellPageTracker({ page }: Props) {
  useEffect(() => {
    const contentName = page === 'offer' ? 'Upsell Offer 30 Dias' : 'Upsell Checkout 30 Dias';
    const meta = getMetaCookies();

    // ─── ViewContent (en ambas páginas) ──────────────────────────────────────
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        w.fbq('track', 'ViewContent', {
          content_name: contentName,
          content_category: 'Upsell',
        });
      }
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ViewContent',
        fbc: meta.fbc,
        fbp: meta.fbp,
        contentName,
        contentCategory: 'Upsell',
      }),
    }).catch(() => {
      /* fail silently — nunca bloquees al usuario por tracking */
    });
  }, [page]);

  return null;
}
