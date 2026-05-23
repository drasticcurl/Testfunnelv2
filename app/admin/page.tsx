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
import Link from 'next/link';
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
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">Acceso admin</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Esta sección es privada. Ingresá la contraseña para continuar.
        </p>

        <form action={loginAction} className="mt-5 space-y-3">
          <label className="block">
            <span className="block text-sm font-medium text-neutral-700">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              autoFocus
              required
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="••••••••••••••••••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
          >
            Ingresar
          </button>

          {error === 'invalid' && (
            <p className="text-sm text-red-600" role="alert">
              Contraseña incorrecta.
            </p>
          )}
          {error === 'rate_limited' && (
            <p className="text-sm text-red-600" role="alert">
              Demasiados intentos. Probá de nuevo en {retry || 60} segundos.
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Panel admin</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Métricas internas del funnel. Solo para uso interno.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/admin/funnel"
          className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow"
        >
          <div className="text-sm font-semibold text-neutral-900">
            Embudo del quiz
          </div>
          <div className="mt-1 text-sm text-neutral-600">
            Drop-off slide por slide, filtrable por experimento + variante.
          </div>
        </Link>
      </div>
    </div>
  );
}
