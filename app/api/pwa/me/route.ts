/**
 * GET /api/pwa/me
 *
 * Devuelve el usuario logueado a partir de la cookie de sesión firmada.
 *
 * Respuestas:
 *   200 { authenticated: true,  email, nombre, testMode } — sesión válida
 *   200 { authenticated: false } — sin sesión / sesión expirada / inválida
 *
 * Devolvemos siempre 200 (no 401) porque consumirlo desde un client hook
 * con onError + useSWR sería ruidoso. El cliente discrimina por la flag.
 */

import { NextResponse } from 'next/server';
import { readSession } from '@/lib/pwa/session';
import { isTestMode } from '@/lib/pwa/test-mode';
import { deriveNameFromEmail } from '@/lib/pwa/get-user-name';

export const runtime = 'nodejs';

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    nombre: deriveNameFromEmail(session.email),
    testMode: isTestMode(),
  });
}
