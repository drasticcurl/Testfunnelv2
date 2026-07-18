'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/pwa/BottomNav';
import AppHeader from '@/components/pwa/AppHeader';
import { isAuthRoute } from '@/lib/pwa/ui/routes';

// Rutas de autenticación que NO deben mostrar el header ("Hola, ...") ni el
// bottom nav. En estas pantallas todavía no hay usuario logueado, así que ese
// chrome no tiene sentido y además ocupa espacio vertical que (sumado al
// min-h-screen propio de cada página) obligaba a scrollear para ver el form
// completo y los links de "crear cuenta".
//
// La clasificación de rutas de auth ahora vive en el helper compartido
// `isAuthRoute` (lib/pwa/ui/routes), única fuente de verdad reutilizable y
// testeada — el comportamiento de omisión de chrome es idéntico al previo.

export default function PwaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pantallas de auth: render limpio sin header ni nav. Cada página se centra
  // sola con su propio min-h-screen, sin padding extra que la empuje hacia abajo.
  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  // Resto de la app: layout normal con header arriba y nav abajo.
  return (
    <>
      <AppHeader />
      <main className="pb-20 px-4">
        <div className="max-w-md mx-auto py-4">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
