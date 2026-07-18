import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase Auth para el lado del cliente (browser).
 *
 * Se usa en componentes "use client" de la PWA para las operaciones de
 * autenticación con email + contraseña:
 *   - `signUp` (registro)
 *   - `signInWithPassword` (login)
 *   - `signOut` (cerrar sesión)
 *   - `resetPasswordForEmail` (recuperar contraseña)
 *
 * Lee las variables públicas `NEXT_PUBLIC_SUPABASE_URL` y
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Lanza un error claro si falta alguna.
 *
 * @returns Un `SupabaseClient` configurado para el navegador.
 */
export function createPwaBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL (requerida para Supabase Auth).",
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Falta la variable de entorno NEXT_PUBLIC_SUPABASE_ANON_KEY (requerida para Supabase Auth).",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
