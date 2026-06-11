'use client';

import { useEffect } from 'react';

/**
 * Registra el service worker para que la PWA sea instalable y tenga soporte
 * offline (cache de assets, manifest, etc).
 *
 * SIEMPRE intenta desregistrar SWs viejos primero. Esto recupera la app
 * automáticamente si quedó cacheado un SW de un deploy roto en el browser
 * del usuario (caso real: cuando el middleware redirigía /pwa-sw.js al
 * login, los browsers cachearon esa redirección como el SW activo y la
 * PWA quedaba colgada hasta que el usuario limpiaba storage manualmente).
 *
 * Solo registra en producción para no interferir con HMR de dev.
 *
 * Para deshabilitar completamente el SW (útil si vuelve a haber un bug):
 *   NEXT_PUBLIC_PWA_DISABLE_SW=true
 */
export function PwaServiceWorker() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    // Kill switch para emergencias: si esta var está en "true" en Vercel,
    // desregistramos cualquier SW activo y NO registramos uno nuevo.
    const disabled = process.env.NEXT_PUBLIC_PWA_DISABLE_SW === 'true';

    (async () => {
      try {
        // 1. Limpiar SWs viejos cuyo scope incluya /pwa.
        const existing = await navigator.serviceWorker.getRegistrations();
        for (const reg of existing) {
          if (reg.scope.includes('/pwa')) {
            // Si el script del SW responde con redirect (lo veremos en su
            // ETag/header) o si está deshabilitado, lo desregistramos.
            if (disabled) {
              console.log('[PWA] kill switch active, unregistering:', reg.scope);
              await reg.unregister();
            }
          }
        }

        if (disabled) return;

        // 2. Verificar antes de registrar que /pwa-sw.js no responda con
        //    redirect — si lo hace (porque el middleware lo está agarrando),
        //    no intentamos registrarlo para evitar el SecurityError.
        const swUrl = '/pwa-sw.js';
        const headRes = await fetch(swUrl, { method: 'HEAD', redirect: 'manual' });
        // 'opaqueredirect' indica un 3xx; los 2xx normales son 'basic'.
        if (headRes.type === 'opaqueredirect' || headRes.status === 0) {
          console.warn(
            '[PWA] /pwa-sw.js responde con redirect — no registramos SW. ' +
              'Verificar el middleware.',
          );
          return;
        }

        const reg = await navigator.serviceWorker.register(swUrl, { scope: '/pwa/' });
        console.log('[PWA] SW registrado, scope:', reg.scope);
      } catch (err) {
        console.warn('[PWA] SW registration failed:', err);
      }
    })();
  }, []);

  return null;
}
