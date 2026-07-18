'use client';

import { usePwaUser } from '@/lib/pwa/use-pwa-user';

interface AppHeaderProps {
  /**
   * Permite override del nombre. Si no se pasa, usa el del usuario logueado
   * (derivado del email). Mientras carga muestra skeleton.
   */
  nombre?: string;
}

/**
 * AppHeader — shared sticky header for the authenticated PWA shell.
 *
 * Presentation-layer only: the greeting, name resolution and loading skeleton
 * behave exactly as before. Styling now consumes named Design_System tokens
 * (terracotta/warm palette, `font-heading`/`font-body`, named spacing) instead
 * of literal/legacy values, applies the typographic scale (section-heading for
 * the name, caption for the greeting label), and adds the top Safe_Area inset
 * (`pt-safe`) so the header clears device notches.
 *
 * Requirements: 2.1, 2.5, 2.6, 6.1, 7.1, 7.3, 8.3
 */
export default function AppHeader({ nombre }: AppHeaderProps) {
  const user = usePwaUser();
  const display = nombre ?? user.nombre;
  const initial = display.charAt(0).toUpperCase() || '·';

  return (
    <header className="sticky top-0 z-40 pt-safe bg-warm/95 backdrop-blur-sm border-b border-warm-border/60 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          {/* Caption level: body family, small size, muted token color. */}
          <p className="font-body text-sm font-medium text-muted">Hola,</p>
          {user.loading && !nombre ? (
            <span
              className="block h-5 w-24 mt-1 rounded bg-warm-border/60 animate-pulse"
              aria-label="Cargando"
            />
          ) : (
            // Section-heading level: heading family, 20px, semibold.
            <p className="font-heading text-xl font-semibold text-charcoal">
              {display}
            </p>
          )}
        </div>
        {/* Personalized initial avatar — token surface + token text color. */}
        <div className="w-9 h-9 rounded-full bg-terracotta-soft flex items-center justify-center">
          <span className="font-body text-sm font-bold text-terracotta">
            {initial}
          </span>
        </div>
      </div>
    </header>
  );
}
