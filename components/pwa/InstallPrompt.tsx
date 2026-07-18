'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/pwa/ui/Icon';
import { usePwaInstall } from '@/lib/pwa/use-pwa-install';

/** Ventana de re-aparición del banner tras un descarte: 7 días. */
const DISMISS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Indica si la usuaria descartó el banner dentro de la ventana de 7 días.
 * Lee la key `pwa-install-dismissed` (timestamp en ms) de localStorage.
 */
function wasRecentlyDismissed(): boolean {
  const wasDismissed = localStorage.getItem('pwa-install-dismissed');
  if (!wasDismissed) return false;
  const dismissedAt = parseInt(wasDismissed, 10);
  return Date.now() - dismissedAt < DISMISS_WINDOW_MS;
}

/**
 * InstallPrompt — banner flotante global de instalación de la PWA + modal de
 * instrucciones iOS.
 *
 * Capa de presentación: toda la lógica de detección (standalone/iOS/
 * `beforeinstallprompt`) y el disparo del prompt nativo viven ahora en el hook
 * `usePwaInstall()` (`lib/pwa/use-pwa-install.ts`), única fuente de verdad
 * compartida con el paso "Instalar App" del onboarding. Este componente solo
 * conserva la lógica propia de presentación: la ventana de descarte de 7 días
 * (key `pwa-install-dismissed`), el retardo de 3s para mostrar el banner en iOS
 * y la visibilidad del banner/modal.
 *
 * Requirements: 4.4, 5.3
 */
export default function InstallPrompt() {
  const { platform, canPrompt, isStandalone, promptInstall } = usePwaInstall();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIOS = platform === 'ios';

  useEffect(() => {
    // Ya instalada: no mostrar el banner.
    if (isStandalone) return;

    // Descartado recientemente: respetar la ventana de 7 días.
    if (wasRecentlyDismissed()) return;

    if (platform === 'ios') {
      // En iOS mostramos el banner tras un breve retardo.
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chromium: mostrar cuando el prompt nativo esté disponible.
    if (platform === 'android' && canPrompt) {
      setShowInstallBanner(true);
    }
  }, [platform, canPrompt, isStandalone]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowInstallBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (dismissed || !showInstallBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto animate-slide-up">
        <div className="bg-warm rounded-xl shadow-lg border border-warm-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-terracotta-soft rounded-lg flex items-center justify-center flex-shrink-0 text-terracotta">
              <Icon name="download" size="md" decorative />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-charcoal text-sm">
                Instalá la app
              </p>
              <p className="font-body text-xs text-muted mt-0.5">
                Accedé más rápido y usala sin conexión
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted hover:text-charcoal p-1"
              aria-label="Cerrar"
            >
              <Icon name="close" size="sm" decorative />
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full mt-3 bg-terracotta text-warm font-body font-medium text-sm py-2.5 rounded-lg hover:bg-terracotta-dark transition-colors duration-fast ease-standard"
          >
            {isIOS ? 'Ver instrucciones' : 'Instalar ahora'}
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal/40">
          <div className="bg-warm rounded-t-xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-semibold text-charcoal text-base">
                Instalar en iPhone/iPad
              </h3>
              <button
                onClick={handleDismiss}
                className="text-muted hover:text-charcoal p-1"
                aria-label="Cerrar"
              >
                <Icon name="close" size="md" decorative />
              </button>
            </div>

            <ol className="space-y-4 font-body text-sm text-charcoal/80">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-terracotta-soft rounded-full flex items-center justify-center flex-shrink-0 text-terracotta font-semibold text-xs">
                  1
                </span>
                <span>
                  Tocá el botón{' '}
                  <strong className="text-charcoal">Compartir</strong>{' '}
                  <span className="inline-flex align-middle text-terracotta">
                    <Icon name="share" size="sm" decorative />
                  </span>{' '}
                  en la barra de Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-terracotta-soft rounded-full flex items-center justify-center flex-shrink-0 text-terracotta font-semibold text-xs">
                  2
                </span>
                <span>
                  Desplazá y tocá{' '}
                  <strong className="text-charcoal">&quot;Agregar a pantalla de inicio&quot;</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-terracotta-soft rounded-full flex items-center justify-center flex-shrink-0 text-terracotta font-semibold text-xs">
                  3
                </span>
                <span>
                  Confirmá tocando{' '}
                  <strong className="text-charcoal">&quot;Agregar&quot;</strong>
                </span>
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="w-full mt-6 bg-terracotta text-warm font-body font-medium text-sm py-2.5 rounded-lg hover:bg-terracotta-dark transition-colors duration-fast ease-standard"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
