/**
 * GET /api/pwa/debug
 *
 * Endpoint de diagnóstico de configuración. Devuelve el estado de las
 * variables de entorno + chequeo de Supabase sin exponer secrets.
 *
 * Útil para responder rápido "¿qué falta configurar?" sin tener que ir
 * a Vercel Functions logs ni hacer pruebas a ojo.
 *
 * Por seguridad: NUNCA expone valores reales de keys, solo un boolean
 * "configured" + un fragmento del comienzo cuando sirve para identificar
 * (ej. los primeros 8 chars de la URL de Supabase).
 *
 * Para deshabilitar después de validar: agregar guard que requiera un
 * header "x-debug-token" matching una env var DEBUG_TOKEN.
 */

import { NextResponse } from 'next/server';
import { isTestMode } from '@/lib/pwa/test-mode';

export const runtime = 'nodejs';

type Check = {
  ok: boolean;
  detail?: string;
};

function envCheck(key: string, opts: { sensitive?: boolean; minLength?: number } = {}): Check {
  const value = process.env[key];
  if (!value) return { ok: false, detail: 'no configurada' };
  if (opts.minLength && value.length < opts.minLength) {
    return { ok: false, detail: `solo ${value.length} chars (mínimo ${opts.minLength})` };
  }
  if (opts.sensitive) return { ok: true, detail: `configurada (${value.length} chars)` };
  // Para vars no sensibles mostrar prefijo para identificar
  const preview = value.length > 30 ? `${value.slice(0, 30)}...` : value;
  return { ok: true, detail: preview };
}

export async function GET() {
  const checks: Record<string, Check> = {
    // Auth de la PWA — ahora usa Supabase Auth (email+password).
    // La anon key es REQUERIDA para que login/registro client-side funcionen.
    SUPABASE_AUTH: (() => {
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!anon) {
        return {
          ok: false,
          detail: 'NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada (requerida para Supabase Auth)',
        };
      }
      return {
        ok: true,
        detail: `Supabase Auth listo — NEXT_PUBLIC_SUPABASE_ANON_KEY configurada (${anon.length} chars)`,
      };
    })(),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: envCheck('NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: envCheck('NEXT_PUBLIC_SUPABASE_ANON_KEY', {
      sensitive: true,
      minLength: 100,
    }),
    SUPABASE_SERVICE_ROLE_KEY: envCheck('SUPABASE_SERVICE_ROLE_KEY', {
      sensitive: true,
      minLength: 100,
    }),

    // Test mode
    NEXT_PUBLIC_PWA_TEST_MODE: {
      ok: process.env.NEXT_PUBLIC_PWA_TEST_MODE !== undefined,
      detail: `valor: "${process.env.NEXT_PUBLIC_PWA_TEST_MODE ?? '(unset)'}" → isTestMode()=${isTestMode()}`,
    },

    // Hotmart
    HOTMART_HOTTOK: envCheck('HOTMART_HOTTOK', { sensitive: true, minLength: 8 }),
    HOTMART_PRODUCT_ID_FRONT: envCheck('HOTMART_PRODUCT_ID_FRONT'),
    HOTMART_PRODUCT_ID_UPSELL: envCheck('HOTMART_PRODUCT_ID_UPSELL'),
  };

  // Ping a Supabase: query trivial para validar que keys+url son correctas.
  let supabasePing: Check;
  try {
    const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
    const supabase = createPwaServiceClient();
    const { error, count } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true });
    if (error) {
      supabasePing = { ok: false, detail: `query falló: ${error.message}` };
    } else {
      supabasePing = { ok: true, detail: `${count ?? 0} compras en la tabla` };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    supabasePing = { ok: false, detail: `exception: ${msg}` };
  }
  checks.supabase_ping = supabasePing;

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    {
      allOk,
      nodeEnv: process.env.NODE_ENV,
      checks,
      hint: allOk
        ? 'Todo configurado correctamente. Si el login sigue fallando, revisar Vercel Function logs.'
        : 'Faltan vars o algo no responde. Revisar los items con ok:false arriba.',
    },
    {
      status: allOk ? 200 : 500,
    },
  );
}
