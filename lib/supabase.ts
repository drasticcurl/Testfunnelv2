/**
 * Cliente Supabase server-side para el funnel principal.
 *
 * Usa la service_role key (no anon) porque:
 *   - El funnel NO tiene auth de usuario
 *   - Solo el backend accede (submit-quiz, admin)
 *   - RLS está deshabilitada en tabla `clientes`
 *
 * Patrón copiado de lib/pwa/supabase.ts pero con env vars
 * diferentes (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 *
 * Si las env vars no están configuradas, devuelve null (no rompe
 * el deploy — el funnel funciona sin DB en modo degradado).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas. Funnel en modo degradado (sin DB).');
    return null;
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return client;
}
