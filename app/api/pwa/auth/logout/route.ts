/**
 * POST /api/pwa/auth/logout
 *
 * Cierra la sesión de Supabase Auth. Devuelve 200 siempre.
 *
 * El adaptador de cookies del cliente de servidor se encarga de borrar las
 * cookies de auth de Supabase al hacer `signOut()`.
 */

import { NextResponse } from 'next/server';
import { createPwaServerClient } from '@/lib/pwa/supabase-server';
import { isTestMode } from '@/lib/pwa/test-mode';

export const runtime = 'nodejs';

export async function POST() {
  // Test mode: no hay nada que cerrar.
  if (isTestMode()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const supabase = await createPwaServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    // El logout nunca debe fallar de forma dura: igual devolvemos ok.
    console.error('[pwa/logout] Error:', err);
  }

  return NextResponse.json({ ok: true });
}
