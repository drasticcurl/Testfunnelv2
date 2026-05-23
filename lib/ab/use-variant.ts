'use client';

/**
 * A/B Testing — hook client.
 *
 * Lee la cookie `ab_<expId>` desde `document.cookie` despues del montaje y
 * devuelve el id de variante o `null`. Por convencion el middleware ya
 * setea las cookies en el primer request, asi que en la mayoria de los
 * casos el valor estara disponible en el primer effect.
 *
 * NO usar este hook como fuente de verdad para SSR — para server components
 * importar `getVariant` de `lib/ab` directamente.
 */

import { useEffect, useState } from 'react';

const COOKIE_PREFIX = 'ab_';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const target = `${name}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    if (part.startsWith(target)) {
      try {
        return decodeURIComponent(part.slice(target.length));
      } catch {
        return part.slice(target.length);
      }
    }
  }
  return null;
}

/**
 * Devuelve la variante asignada para `expId` o `null` mientras se lee
 * `document.cookie` (primer render server-side y antes del effect).
 */
export function useVariant(expId: string): string | null {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    setVariant(readCookie(`${COOKIE_PREFIX}${expId}`));
  }, [expId]);

  return variant;
}

/**
 * Version "todas a la vez" para componentes que ramifican en mas de un
 * experimento. Retorna `{}` mientras se hidrata.
 */
export function useAllVariants(): Record<string, string> {
  const [variants, setVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const out: Record<string, string> = {};
    const parts = document.cookie ? document.cookie.split('; ') : [];
    for (const part of parts) {
      const eq = part.indexOf('=');
      if (eq <= 0) continue;
      const name = part.slice(0, eq);
      if (!name.startsWith(COOKIE_PREFIX) || name === 'ab_uid') continue;
      const expId = name.slice(COOKIE_PREFIX.length);
      try {
        out[expId] = decodeURIComponent(part.slice(eq + 1));
      } catch {
        out[expId] = part.slice(eq + 1);
      }
    }
    setVariants(out);
  }, []);

  return variants;
}
