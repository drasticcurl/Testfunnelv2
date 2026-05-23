/**
 * Admin layout — auth gate + chrome del panel.
 *
 * Estrategia:
 *  - El layout chequea la cookie firmada.
 *  - Si NO hay auth válida: NO redirige (eso requeriría una ruta
 *    /admin/login, que está fuera de los archivos owned). En su lugar,
 *    renderiza children sin chrome — y `/admin/page.tsx` se encarga de
 *    mostrar el form de login inline. `/admin/funnel/page.tsx` también
 *    revalida y si no hay auth, redirige a `/admin`.
 *  - Si hay auth: chrome con header + nav + botón salir (server action).
 *
 * `noindex` siempre — el panel nunca tiene que aparecer en buscadores.
 *
 * Server actions:
 *  - `logoutAction`: limpia la cookie y vuelve a /admin (que mostrará el form).
 */

import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ADMIN_COOKIE_NAME,
  adminClearCookieOptions,
  isAdminAuthenticated,
} from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Funnel Anti-Hinchazón',
  robots: { index: false, follow: false },
};

async function logoutAction(): Promise<void> {
  'use server';
  const opts = adminClearCookieOptions();
  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    ...opts,
  });
  redirect('/admin');
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const authed = isAdminAuthenticated(cookies());

  if (!authed) {
    // Sin chrome — la /admin/page.tsx muestra el form de login.
    // /admin/funnel/page.tsx hace su propio guard y redirige a /admin.
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <main className="mx-auto max-w-md px-4 py-12">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/admin"
            className="text-sm font-semibold tracking-tight text-neutral-900 hover:text-neutral-700"
          >
            Admin · Funnel Anti-Hinchazón
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/admin/funnel"
              className="rounded px-2 py-1 text-neutral-700 hover:bg-neutral-100"
            >
              Embudo
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100"
              >
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
