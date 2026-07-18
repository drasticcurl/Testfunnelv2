'use client';

import { useEffect } from 'react';

/**
 * UtmifyPixel — inyecta el pixel de UTMify (cdn.utmify.com.br/scripts/pixel).
 *
 * Se monta SOLO en la página donde se vende (la sales page del funnel AR,
 * Funnel A y Funnel B), no de forma global. Replica el snippet de UTMify:
 *   window.pixelId = "<id>"; + <script async defer src=".../pixel.js"> en el head.
 *
 * Idempotente: si ya se cargó (re-render, navegación SPA entre slides), no lo
 * vuelve a inyectar.
 */
export function UtmifyPixel(): null {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.__utmifyPixelLoaded) return;
    w.__utmifyPixelLoaded = true;

    w.pixelId = '6a4419571060a632ed9e3561';
    const a = document.createElement('script');
    a.setAttribute('async', '');
    a.setAttribute('defer', '');
    a.setAttribute('src', 'https://cdn.utmify.com.br/scripts/pixel/pixel.js');
    document.head.appendChild(a);
  }, []);

  return null;
}
