/**
 * /admin — landing del panel.
 *
 * Sin auth: muestra el form de login (server action `loginAction`).
 *   - Rate limit por IP (5 intentos / 15 min) en `lib/admin/auth.ts`.
 *   - Comparación timing-safe.
 *   - Cookie firmada con HMAC-SHA256(ts, ADMIN_PASSWORD).
 *   - Mensaje de error genérico para no leakear estado.
 *
 * Con auth: muestra los links a las secciones del admin (por ahora solo
 * el embudo).
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  checkLoginRateLimit,
  getClientIp,
  isAdminAuthenticated,
  resetLoginRateLimit,
  signSessionToken,
  verifyAdminPassword,
} from '@/lib/admin/auth';
import { OverviewView } from './OverviewView';

export const dynamic = 'force-dynamic';

type SearchParams = { [key: string]: string | string[] | undefined };

async function loginAction(formData: FormData): Promise<void> {
  'use server';

  // IP "request-like" — extraida via next/headers para acceder a x-forwarded-for.
  const h = headers();
  const ip = getClientIp({
    headers: {
      get: (name: string): string | null => h.get(name),
    },
  } as unknown as Request);

  const rl = checkLoginRateLimit(ip);
  if (!rl.ok) {
    redirect(`/admin?error=rate_limited&retry=${rl.retryAfterSeconds}`);
  }

  const password = formData.get('password');
  const passStr = typeof password === 'string' ? password : '';

  if (!verifyAdminPassword(passStr)) {
    redirect('/admin?error=invalid');
  }

  const token = signSessionToken();
  if (!token) {
    redirect('/admin?error=invalid');
  }

  resetLoginRateLimit(ip);

  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    ...adminCookieOptions(),
  });

  redirect('/admin/funnel');
}

export default function AdminLandingPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const authed = isAdminAuthenticated(cookies());

  if (!authed) {
    const error =
      typeof searchParams?.error === 'string' ? searchParams?.error : undefined;
    const retryRaw = searchParams?.retry;
    const retry =
      typeof retryRaw === 'string' && /^\d+$/.test(retryRaw) ? Number(retryRaw) : 0;

    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#13131a] p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
            A
          </span>
          <span className="text-sm font-semibold text-neutral-300">Dashboard interno</span>
        </div>
        <h1 className="text-lg font-semibold text-neutral-50">Acceso admin</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Esta sección es privada. Ingresá la contraseña para continuar.
        </p>

        <form action={loginAction} className="mt-5 space-y-3">
          <label className="block">
            <span className="block text-sm font-medium text-neutral-300">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              autoFocus
              required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              placeholder="••••••••••••••••••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
          >
            Ingresar
          </button>

          {error === 'invalid' && (
            <p className="text-sm text-rose-400" role="alert">
              Contraseña incorrecta.
            </p>
          )}
          {error === 'rate_limited' && (
            <p className="text-sm text-rose-400" role="alert">
              Demasiados intentos. Probá de nuevo en {retry || 60} segundos.
            </p>
          )}
        </form>
      </div>
    );
  }

  return <OverviewView />;
}
