/**
 * GET /api/pwa/me
 *
 * Devuelve el usuario logueado a partir de la sesión de Supabase Auth.
 *
 * Respuestas:
 *   200 { authenticated: true,  email, nombre, testMode } — sesión válida
 *   200 { authenticated: false } — sin sesión / sesión expirada / inválida
 *
 * Devolvemos siempre 200 (no 401) porque consumirlo desde un client hook
 * con onError + useSWR sería ruidoso. El cliente discrimina por la flag.
 */

import { NextResponse } from 'next/server';
import { createPwaServerClient } from '@/lib/pwa/supabase-server';
import { isTestMode, TEST_USER } from '@/lib/pwa/test-mode';
import { deriveNameFromEmail } from '@/lib/pwa/get-user-name';

export const runtime = 'nodejs';

export async function GET() {
  // Test mode: preserva el desarrollo local sin Supabase configurado.
  if (isTestMode()) {
    return NextResponse.json({
      authenticated: true,
      email: TEST_USER.email,
      nombre: TEST_USER.nombre,
      testMode: true,
    });
  }

  try {
    const supabase = await createPwaServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      email: user.email,
      nombre: deriveNameFromEmail(user.email),
      testMode: false,
    });
  } catch (err) {
    console.error('[pwa/me] Error:', err);
    return NextResponse.json({ authenticated: false });
  }
}
