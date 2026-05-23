'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // On iOS, show instructions after a short delay
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
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
        <div className="bg-white rounded-2xl shadow-lg border border-sand p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-sage-soft rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-sage"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-charcoal text-sm">
                Instalá la app
              </p>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Accedé más rápido y usala sin conexión
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-charcoal/40 hover:text-charcoal/60 p-1"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full mt-3 bg-sage text-white font-medium text-sm py-2.5 rounded-xl hover:bg-sage/90 transition-colors"
          >
            {isIOS ? 'Ver instrucciones' : 'Instalar ahora'}
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-charcoal text-base">
                Instalar en iPhone/iPad
              </h3>
              <button
                onClick={handleDismiss}
                className="text-charcoal/40 hover:text-charcoal/60 p-1"
                aria-label="Cerrar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ol className="space-y-4 text-sm text-charcoal/80">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-sage-soft rounded-full flex items-center justify-center flex-shrink-0 text-sage font-semibold text-xs">
                  1
                </span>
                <span>
                  Tocá el botón{' '}
                  <strong className="text-charcoal">Compartir</strong>{' '}
                  <svg
                    className="inline w-4 h-4 text-sage"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>{' '}
                  en la barra de Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-sage-soft rounded-full flex items-center justify-center flex-shrink-0 text-sage font-semibold text-xs">
                  2
                </span>
                <span>
                  Desplazá y tocá{' '}
                  <strong className="text-charcoal">&quot;Agregar a pantalla de inicio&quot;</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-sage-soft rounded-full flex items-center justify-center flex-shrink-0 text-sage font-semibold text-xs">
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
              className="w-full mt-6 bg-sage text-white font-medium text-sm py-2.5 rounded-xl hover:bg-sage/90 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
