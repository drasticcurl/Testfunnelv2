/**
 * POST /api/pwa/auth/logout
 *
 * Borra la cookie de sesión PWA. Devuelve 200 siempre.
 */

import { NextResponse } from 'next/server';
import { SESSION_COOKIE_ATTRS } from '@/lib/pwa/session';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_ATTRS.name, '', {
    ...SESSION_COOKIE_ATTRS,
    maxAge: 0,
  });
  return res;
}
