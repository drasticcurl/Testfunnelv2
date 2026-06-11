'use client';

/**
 * usePwaUser — hook cliente que devuelve el usuario logueado en la PWA.
 *
 * Llama a /api/pwa/me una vez al montar y guarda el resultado.
 * Devuelve `loading: true` mientras llega la respuesta.
 *
 * Uso típico en componentes:
 *   const { nombre, loading } = usePwaUser();
 *   if (loading) return <Skeleton />;
 *   return <h1>Hola, {nombre}</h1>;
 *
 * Si no hay sesión, devuelve { authenticated: false, nombre: 'Hola' }
 * y NO redirige automáticamente (eso lo hace el guard de layout).
 */

import { useEffect, useState } from 'react';

export type PwaUser = {
  authenticated: boolean;
  email: string | null;
  nombre: string;
  testMode: boolean;
  loading: boolean;
};

const INITIAL: PwaUser = {
  authenticated: false,
  email: null,
  nombre: 'Hola',
  testMode: false,
  loading: true,
};

export function usePwaUser(): PwaUser {
  const [user, setUser] = useState<PwaUser>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/pwa/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated) {
          setUser({
            authenticated: true,
            email: data.email ?? null,
            nombre: data.nombre ?? 'Hola',
            testMode: !!data.testMode,
            loading: false,
          });
        } else {
          setUser({ ...INITIAL, loading: false });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setUser({ ...INITIAL, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
