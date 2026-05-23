/**
 * Middleware — tres responsabilidades:
 *
 *  1) Quiz A/B routing: cuando alguien visita /, asigna cookie `quiz_variant`
 *     (v1 o v2) y redirige a /quiz o /quiz-v2. Consistency garantizada.
 *
 *  2) Asignación de variantes A/B genéricas en el primer visit.
 *     Setea cookies:
 *       - `ab_uid`        : UUID v4 estable del usuario, base de bucketing.
 *       - `ab_<expId>`    : variante asignada para cada experimento.
 *     Asignación DETERMINISTA via SHA-256.
 *
 *  3) Guard de la PWA (`/pwa/<sub-rutas>`):
 *     - Si NO hay cookie `pwa_session` válida y NO está activo el test mode,
 *       redirige a /pwa/login.
 *     - SOLO se aplica a rutas internas de la PWA (`/pwa/dashboard`, etc).
 *     - Excluye explícitamente:
 *         · cualquier path con extensión (.js, .json, .png, .ico, etc.)
 *           → /pwa-sw.js, /pwa-manifest.json, /favicon.ico, ...
 *         · /pwa/login y /pwa/auth/*
 *
 * El middleware corre en Edge Runtime, así que usa Web Crypto.
 */

import { NextResponse, type NextRequest } from 'next/server';

import {
  AB_COOKIE_MAX_AGE_DAYS,
  AB_COOKIE_PREFIX,
  AB_USER_ID_COOKIE,
  AB_USER_ID_MAX_AGE_DAYS,
  experiments,
  type Experiment,
} from '@/lib/ab/experiments';
import { SESSION_COOKIE, verifySessionEdge } from '@/lib/pwa/session-edge';

const SECONDS_PER_DAY = 60 * 60 * 24;


/* ─── A/B helpers ──────────────────────────────────────────────────── */

async function hashToBucket(userId: string, expId: string): Promise<number> {
  const data = new TextEncoder().encode(`${userId}:${expId}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const view = new DataView(digest);
  return view.getUint32(0, false) % 100;
}

function pickVariant(bucket: number, exp: Experiment): string | null {
  const variants = exp.variants;
  if (variants.length === 0) return null;

  const total = variants.reduce((sum, v) => sum + Math.max(0, v.weight), 0);
  if (total <= 0) return variants[0]?.id ?? null;

  const scaled = (bucket / 100) * total;
  let acc = 0;
  for (const v of variants) {
    acc += Math.max(0, v.weight);
    if (scaled < acc) return v.id;
  }
  return variants[variants.length - 1]?.id ?? null;
}

const UID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


/* ─── PWA guard ────────────────────────────────────────────────────── */

function pathRequiresPwaSession(pathname: string): boolean {
  const lastSlash = pathname.lastIndexOf('/');
  const lastSegment = pathname.slice(lastSlash + 1);
  if (lastSegment.includes('.')) return false;

  if (pathname !== '/pwa' && !pathname.startsWith('/pwa/')) return false;

  if (pathname === '/pwa/login' || pathname.startsWith('/pwa/login/')) return false;
  if (pathname.startsWith('/pwa/auth/')) return false;

  return true;
}

function isTestModeEdge(): boolean {
  return process.env.NEXT_PUBLIC_PWA_TEST_MODE === 'true';
}


/* ─── Middleware principal ─────────────────────────────────────────── */

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // ─── 0) Quiz A/B routing: / → /quiz o /quiz-v2 ─────────────────
  if (pathname === '/') {
    const existingVariant = req.cookies.get('quiz_variant')?.value;

    let variant: 'v1' | 'v2';
    if (existingVariant === 'v1' || existingVariant === 'v2') {
      variant = existingVariant;
    } else {
      // 50/50 split
      variant = Math.random() < 0.5 ? 'v2' : 'v1';
    }

    const destination = variant === 'v2' ? '/quiz-v2' : '/quiz';
    const url = req.nextUrl.clone();
    url.pathname = destination;

    const response = NextResponse.redirect(url);

    // Set cookie for 30 days if new visitor
    if (!existingVariant) {
      response.cookies.set('quiz_variant', variant, {
        maxAge: 30 * SECONDS_PER_DAY,
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
    }

    return response;
  }

  // ─── 1) PWA guard ───────────────────────────────────────────────
  if (pathRequiresPwaSession(pathname) && !isTestModeEdge()) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = await verifySessionEdge(token);
    if (!session) {
      console.log(
        `[middleware] guard redirect ${pathname} → /pwa/login (token=${token ? 'present' : 'absent'})`,
      );
      const url = req.nextUrl.clone();
      url.pathname = '/pwa/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ─── 2) A/B variant assignment ──────────────────────────────────
  const res = NextResponse.next();

  let userId = req.cookies.get(AB_USER_ID_COOKIE)?.value;
  if (!userId || !UID_REGEX.test(userId)) {
    userId = crypto.randomUUID();
    res.cookies.set(AB_USER_ID_COOKIE, userId, {
      maxAge: AB_USER_ID_MAX_AGE_DAYS * SECONDS_PER_DAY,
      path: '/',
      sameSite: 'lax',
    });
  }

  for (const exp of experiments) {
    if (!exp.enabled) continue;

    const cookieName = `${AB_COOKIE_PREFIX}${exp.id}`;
    const existing = req.cookies.get(cookieName)?.value;
    const isKnown =
      typeof existing === 'string' &&
      exp.variants.some((v) => v.id === existing);
    if (isKnown) continue;

    const bucket = await hashToBucket(userId, exp.id);
    const chosen = pickVariant(bucket, exp);
    if (!chosen) continue;

    res.cookies.set(cookieName, chosen, {
      maxAge: AB_COOKIE_MAX_AGE_DAYS * SECONDS_PER_DAY,
      path: '/',
      sameSite: 'lax',
    });
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/track).*)'],
};
