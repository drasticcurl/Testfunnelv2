'use client';

/**
 * usePwaInstall — hook cliente que centraliza la lógica de instalación de la PWA.
 *
 * Extrae la detección de plataforma y el manejo del prompt nativo que antes
 * vivía duplicado en `components/pwa/InstallPrompt.tsx`, de modo que tanto el
 * banner flotante global como el paso "Instalar App" del onboarding consuman
 * una sola fuente de verdad.
 *
 * Detección (useEffect deps []):
 *   - standalone: `matchMedia('(display-mode: standalone)').matches`
 *   - iOS: userAgent `/iPad|iPhone|iPod/` (iOS no soporta beforeinstallprompt)
 *   - android: captura del evento `beforeinstallprompt` (Chromium)
 *   - unsupported: cualquier otro caso (ej. desktop sin soporte)
 *
 * El listener `beforeinstallprompt` se remueve en el cleanup del efecto.
 *
 * Uso típico:
 *   const { platform, canPrompt, isStandalone, promptInstall } = usePwaInstall();
 *   if (canPrompt) {
 *     const outcome = await promptInstall(); // 'accepted' | 'dismissed' | 'unavailable'
 *   }
 *
 * Requirements: 4.1, 4.2, 4.3, 4.5, 4.6
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** Evento no estándar emitido por Chromium en Android/desktop. */
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPlatform = 'android' | 'ios' | 'standalone' | 'unsupported';

export interface PwaInstallState {
  /** Plataforma/estado detectado, decide qué UI mostrar. */
  platform: InstallPlatform;
  /** true si existe un deferredPrompt capturado (Android/Chromium). */
  canPrompt: boolean;
  /** true si la app ya corre en display-mode: standalone. */
  isStandalone: boolean;
  /** Dispara el prompt nativo. Solo válido si canPrompt === true. */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export function usePwaInstall(): PwaInstallState {
  const [platform, setPlatform] = useState<InstallPlatform>('unsupported');
  const [canPrompt, setCanPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Se guarda en un ref para que `promptInstall` (estable) siempre lea el
  // valor más reciente sin recrearse ni depender del ciclo de render.
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ya instalada: no registramos listeners.
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPlatform('standalone');
      setIsStandalone(true);
      return;
    }

    // iOS no soporta beforeinstallprompt: la UI mostrará instrucciones manuales.
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;

    if (isIOSDevice) {
      setPlatform('ios');
      return;
    }

    // Android/Chromium: capturamos el prompt diferido.
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setPlatform('android');
      setCanPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    const deferredPrompt = deferredPromptRef.current;
    if (!deferredPrompt) return 'unavailable';

    // Consumimos el prompt: solo puede usarse una vez.
    deferredPromptRef.current = null;
    setCanPrompt(false);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      return outcome;
    } catch {
      // Nunca propagamos excepciones al consumidor.
      return 'unavailable';
    }
  }, []);

  return { platform, canPrompt, isStandalone, promptInstall };
}
