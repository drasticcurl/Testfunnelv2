'use client';

/**
 * FunnelBTheme — rebrand visual SCOPED para el Funnel B (test full-funnel AR).
 *
 * Envuelve a sus hijos en un elemento `[data-funnel="b"]` que redefine los
 * design-tokens (variables CSS custom) a la paleta rosa/femenina ("mujer").
 * Como Funnel A y todos los componentes existentes consumen `var(--terracotta)`
 * etc., sobreescribir las variables SOLO dentro de este subárbol re-tematiza el
 * Funnel B SIN editar ningún componente existente ni los defaults de `:root`
 * en `globals.css`. El bloque de overrides vive en `app/globals.css` bajo el
 * selector `[data-funnel="b"]` (aditivo).
 *
 * Para Funnel A este componente NUNCA se monta (el container renderiza el árbol
 * sin envolver), así que A queda byte-idéntico a hoy.
 *
 * No cambia contenido: logo y nombre de producto se preservan (Req 7.5); solo
 * cambia la capa de tokens de marca dentro del scope.
 */

import type { ReactNode } from 'react';

export function FunnelBTheme({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div data-funnel="b" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
