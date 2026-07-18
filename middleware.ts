/**
 * Middleware — tres responsabilidades:
 *
 *  0) Geo-block: bloquea el tráfico de países no deseados (por defecto Brasil).
 *     - Se aplica a las páginas (quiz, pwa, etc.), NO a las rutas /api/*
 *       (para no romper webhooks de Shopify/Hotmart ni el tracking, que pueden
 *       venir de cualquier infraestructura).
 *     - Configurable con la env var BLOCKED_COUNTRIES (códigos ISO separados por
 *       coma, ej: "BR,VE"). Default: "BR".
 *     - Usa la geolocalización que Vercel inyecta en req.geo. En local req.geo
 *       no existe, así que no bloquea nada (dev sigue funcionando normal).
 *
 *  1) Redirige / → /quiz (simple, sin A/B).
 *
 *  2) Guard de la PWA (`/pwa/<sub-rutas>`):
 *     - Usa la sesión de Supabase Auth (vía `updateSession`) para proteger las
 *       rutas internas de la PWA. Si NO hay usuario autenticado y NO está activo
 *       el test mode, redirige a /pwa/login (con ?next=<ruta original>).
 *     - Si la sesión es válida, devuelve la respuesta de Supabase (con las
 *       cookies de sesión refrescadas).
 *     - SOLO se aplica a rutas internas de la PWA (`/pwa/dashboard`, etc).
 *     - Excluye explícitamente:
 *         · cualquier path con extensión (.js, .json, .png, .ico, etc.)
 *         · las rutas públicas de auth: /pwa/login, /pwa/registro,
 *           /pwa/recuperar, /pwa/reset (y sus sub-rutas).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/pwa/supabase-middleware';


/* ─── Geo-block ────────────────────────────────────────────────────── */

// Países bloqueados (ISO 3166-1 alpha-2). Default: Brasil.
// Se puede sobreescribir con la env var BLOCKED_COUNTRIES="BR,VE,..."
const BLOCKED_COUNTRIES = new Set(
  (process.env.BLOCKED_COUNTRIES ?? 'BR')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean),
);

function isBlockedCountry(req: NextRequest): boolean {
  if (BLOCKED_COUNTRIES.size === 0) return false;
  // Vercel inyecta req.geo.country en producción (edge). En local es undefined.
  const country = req.geo?.country?.toUpperCase();
  if (!country) return false;
  return BLOCKED_COUNTRIES.has(country);
}


/* ─── PWA guard ────────────────────────────────────────────────────── */

// Rutas públicas de la PWA (auth): NO requieren sesión de Supabase.
const PUBLIC_PWA_PREFIXES = [
  '/pwa/login',
  '/pwa/registro',
  '/pwa/recuperar',
  '/pwa/reset',
];

function pathRequiresPwaSession(pathname: string): boolean {
  const lastSlash = pathname.lastIndexOf('/');
  const lastSegment = pathname.slice(lastSlash + 1);
  if (lastSegment.includes('.')) return false;

  if (pathname !== '/pwa' && !pathname.startsWith('/pwa/')) return false;

  // Rutas públicas de auth (y sus sub-rutas) no requieren sesión.
  for (const prefix of PUBLIC_PWA_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return false;
  }

  return true;
}

function isTestModeEdge(): boolean {
  return process.env.NEXT_PUBLIC_PWA_TEST_MODE === 'true';
}


/* ─── Middleware principal ─────────────────────────────────────────── */

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // ─── 0) Geo-block (países no deseados, ej: Brasil) ─────────────
  // No se aplica a /api/* para no romper webhooks (Shopify/Hotmart) ni tracking.
  if (!pathname.startsWith('/api/') && isBlockedCountry(req)) {
    return new NextResponse('Not available in your region.', {
      status: 451, // 451 Unavailable For Legal Reasons (semánticamente correcto)
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  // ─── 1) Redirect / → /quiz ─────────────────────────────────────
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/quiz';
    return NextResponse.redirect(url);
  }

  // ─── 2) Redirect legacy routes ─────────────────────────────────
  if (pathname === '/quiz-v2' || pathname === '/quiz-v3') {
    const url = req.nextUrl.clone();
    url.pathname = '/quiz';
    return NextResponse.redirect(url, 301);
  }

  // ─── 3) PWA guard ───────────────────────────────────────────────
  if (pathRequiresPwaSession(pathname)) {
    if (isTestModeEdge()) {
      return NextResponse.next();
    }
    const { supabaseResponse, user } = await updateSession(req);
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = '/pwa/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    // Sesión válida: devolver la respuesta de Supabase (cookies refrescadas).
    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/track).*)'],
};
