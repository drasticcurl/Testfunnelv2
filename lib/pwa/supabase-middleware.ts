import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

/**
 * Resultado de {@link updateSession}.
 *
 * - `supabaseResponse`: la `NextResponse` que el middleware DEBE devolver (o
 *   sobre la que debe basar su respuesta) para que las cookies refrescadas de
 *   la sesión se propaguen al navegador.
 * - `user`: el usuario autenticado (verificado contra el servidor de Supabase)
 *   o `null` si no hay sesión válida.
 */
export interface UpdateSessionResult {
  supabaseResponse: NextResponse;
  user: User | null;
}

/**
 * Refresca la sesión de Supabase Auth dentro del middleware de Next.js,
 * siguiendo el patrón oficial de `@supabase/ssr`.
 *
 * Crea una `NextResponse.next({ request })`, instancia un cliente de servidor
 * cuyo adaptador de cookies LEE de `request.cookies` y ESCRIBE tanto en
 * `request.cookies` como en la respuesta, y llama a `supabase.auth.getUser()`
 * para refrescar los tokens (escribiendo las cookies actualizadas en la
 * respuesta).
 *
 * NO realiza redirecciones: simplemente devuelve la respuesta y el usuario para
 * que el middleware decida los redirects en una tarea posterior.
 *
 * Lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Lanza un
 * error claro si falta alguna.
 *
 * @param request La `NextRequest` entrante del middleware.
 * @returns Un objeto con `supabaseResponse` (a devolver) y `user`.
 */
export async function updateSession(
  request: NextRequest,
): Promise<UpdateSessionResult> {
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

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANTE: refresca los tokens y escribe las cookies en la respuesta.
  // No insertar lógica entre `createServerClient` y `getUser()`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
