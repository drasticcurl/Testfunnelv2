/**
 * Cliente Supabase server-side para el funnel principal.
 *
 * Usa la service_role key (no anon) porque:
 *   - El funnel NO tiene auth de usuario
 *   - Solo el backend accede (submit-quiz, admin)
 *   - RLS está deshabilitada en tabla `clientes`
 *
 * Env vars (en orden de prioridad):
 *   - SUPABASE_URL              (server-only, preferida)
 *   - NEXT_PUBLIC_SUPABASE_URL  (fallback — la que ya usa lib/pwa/supabase.ts en prod)
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * Si las env vars no están configuradas, devuelve null (no rompe
 * el deploy — el funnel funciona sin DB en modo degradado).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;

  // Aceptamos ambos nombres para compatibilidad: el resto del proyecto usa
  // NEXT_PUBLIC_SUPABASE_URL (lib/pwa/supabase.ts), pero esta lib pedía
  // SUPABASE_URL. Aceptar las dos evita 500 cuando solo está la public.
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas. Funnel en modo degradado (sin DB).');
    return null;
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return client;
}
