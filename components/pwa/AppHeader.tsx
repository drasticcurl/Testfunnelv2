'use client';

import { usePwaUser } from '@/lib/pwa/use-pwa-user';

interface AppHeaderProps {
  /**
   * Permite override del nombre. Si no se pasa, usa el del usuario logueado
   * (derivado del email). Mientras carga muestra skeleton.
   */
  nombre?: string;
}

export default function AppHeader({ nombre }: AppHeaderProps) {
  const user = usePwaUser();
  const display = nombre ?? user.nombre;
  const initial = display.charAt(0).toUpperCase() || '·';

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-sand/20 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <p className="text-sm text-charcoal/60">Hola,</p>
          {user.loading && !nombre ? (
            <span
              className="block h-5 w-24 mt-1 rounded bg-sand/40 animate-pulse"
              aria-label="Cargando"
            />
          ) : (
            <p className="font-heading text-lg font-semibold text-charcoal">
              {display} 👋
            </p>
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-sage-soft flex items-center justify-center">
          <span className="text-sage text-sm font-bold">{initial}</span>
        </div>
      </div>
    </header>
  );
}
