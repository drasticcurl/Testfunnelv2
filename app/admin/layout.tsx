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
import { AdminTabs } from './AdminTabs';

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
      <div className="min-h-screen bg-[#0a0a0f] text-neutral-100 antialiased">
        <main className="mx-auto max-w-md px-4 py-12">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-100 antialiased">
      {/* glow ambiental superior */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-violet-600/10 via-emerald-500/[0.04] to-transparent blur-2xl" />
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-100 hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 text-[13px] font-bold text-white shadow-lg shadow-violet-500/20">
              A
            </span>
            <span className="hidden sm:inline">Anti-Hinchazón · Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <AdminTabs />
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg px-2.5 py-1.5 text-sm text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
