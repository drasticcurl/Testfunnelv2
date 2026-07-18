import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase Auth para el lado del servidor.
 *
 * Pensado para Route Handlers y Server Components que necesitan leer la sesión
 * de Supabase desde las cookies de la request (vía `cookies()` de
 * `next/headers`).
 *
 * Implementa el adaptador de cookies estándar de `@supabase/ssr`
 * (`getAll` / `setAll`). La escritura (`setAll`) está envuelta en un try/catch
 * porque al invocarse desde un Server Component Next.js lanza una excepción;
 * eso es esperado y seguro de ignorar, ya que el middleware se encarga de
 * refrescar la sesión y escribir las cookies actualizadas.
 *
 * Lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Lanza un
 * error claro si falta alguna.
 *
 * En Next 14 `cookies()` es síncrono, pero se usa `await` para que también
 * funcione si en el futuro pasa a ser asíncrono.
 *
 * @returns Una promesa que resuelve a un `SupabaseClient` para el servidor.
 */
export async function createPwaServerClient(): Promise<SupabaseClient> {
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

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Se invocó `setAll` desde un Server Component. Es esperado y se
          // puede ignorar: el middleware refresca la sesión y escribe las
          // cookies actualizadas en la respuesta.
        }
      },
    },
  });
}
