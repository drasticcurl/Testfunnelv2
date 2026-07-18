/**
 * GET /api/admin/health
 *
 * Diagnóstico en vivo del pipeline de tracking del funnel (`funnel_counts`).
 * Auth: cookie admin_token firmada (HMAC). Sin cookie -> 401.
 *
 * Por qué existe:
 *   Cuando el funnel "deja de contar", el endpoint /api/track atrapa el error
 *   del write y devuelve 200 igual (fail-soft). El error solo queda en los logs
 *   de función de Vercel, que son difíciles de encontrar. Este endpoint ejecuta
 *   CADA capa del write por separado contra Supabase y devuelve el mensaje de
 *   error EXACTO de cada una, sin tragárselo. Así se ve de una qué está roto:
 *   RPC inexistente, índice único que no matchea el ON CONFLICT, constraint, etc.
 *
 * Usa el MISMO cliente que el SupabaseStore (NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY) para reproducir exactamente el path que falla.
 *
 * Las pruebas de escritura usan event_name '__healthcheck__' (lo ignora el
 * cálculo del embudo) y se limpian al final. No ensucian las métricas.
 *
 * Respuesta (JSON):
 *   {
 *     ok: boolean,            // true si el write end-to-end funciona
 *     env: {...},             // presencia de env vars (no expone valores)
 *     read: {...},            // ¿se puede leer funnel_counts? filas hoy/total
 *     write: {...},           // resultado de getStore().track() (path real)
 *     probes: {               // cada capa del fallback, por separado
 *       rpc_daily, rpc_legacy, upsert_with_day, upsert_without_day
 *     }
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getStore } from '@/lib/admin/store';
import { getArgentinaDay } from '@/lib/admin/day';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEALTH_EVENT = '__healthcheck__';

type ProbeResult = { ok: boolean; error: string | null };

function errMsg(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as { message: unknown }).message);
  }
  return e instanceof Error ? e.message : String(e);
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(url),
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(key),
    FUNNEL_STORE: process.env.FUNNEL_STORE ?? '(unset → memory)',
  };

  if (!url || !key) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'missing_env',
        env,
        hint: 'Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.',
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const day = getArgentinaDay();

  // ── READ: ¿se puede leer la tabla? ¿cuántas filas hay hoy / en total? ──────
  const read: {
    ok: boolean;
    error: string | null;
    rowsToday: number | null;
    rowsTotal: number | null;
  } = { ok: false, error: null, rowsToday: null, rowsTotal: null };
  try {
    const total = await client
      .from('funnel_counts')
      .select('*', { count: 'exact', head: true });
    if (total.error) throw total.error;
    read.rowsTotal = total.count ?? 0;

    const today = await client
      .from('funnel_counts')
      .select('*', { count: 'exact', head: true })
      .eq('day', day);
    read.rowsToday = today.error ? null : (today.count ?? 0);
    read.ok = true;
  } catch (e) {
    read.error = errMsg(e);
  }

  // ── PROBES: cada capa del write, por separado, con su error exacto ─────────
  const probeArgs = {
    event_name: HEALTH_EVENT,
    slide: -1,
    utm_source: '(directo)',
    utm_medium: '(directo)',
    utm_campaign: '(directo)',
    utm_content: '(directo)',
    quiz_version: 'v3',
  };

  // 1) RPC diario (con day) — el que llama el código primero.
  const rpc_daily: ProbeResult = { ok: false, error: null };
  {
    const { error } = await client.rpc('increment_funnel_count_daily', {
      p_event_name: probeArgs.event_name,
      p_slide: probeArgs.slide,
      p_utm_source: probeArgs.utm_source,
      p_utm_medium: probeArgs.utm_medium,
      p_utm_campaign: probeArgs.utm_campaign,
      p_utm_content: probeArgs.utm_content,
      p_quiz_version: probeArgs.quiz_version,
      p_day: day,
    });
    rpc_daily.ok = !error;
    rpc_daily.error = error ? error.message : null;
  }

  // 2) RPC viejo (sin day) — primer fallback.
  const rpc_legacy: ProbeResult = { ok: false, error: null };
  {
    const { error } = await client.rpc('increment_funnel_count', {
      p_event_name: probeArgs.event_name,
      p_slide: probeArgs.slide,
      p_utm_source: probeArgs.utm_source,
      p_utm_medium: probeArgs.utm_medium,
      p_utm_campaign: probeArgs.utm_campaign,
      p_utm_content: probeArgs.utm_content,
      p_quiz_version: probeArgs.quiz_version,
    });
    rpc_legacy.ok = !error;
    rpc_legacy.error = error ? error.message : null;
  }

  // 3) Upsert directo CON day (segundo fallback).
  const upsert_with_day: ProbeResult = { ok: false, error: null };
  {
    const { error } = await client.from('funnel_counts').upsert(
      { ...probeArgs, day, count: 1 },
      {
        onConflict:
          'event_name,slide,utm_source,utm_medium,utm_campaign,utm_content,day',
        ignoreDuplicates: false,
      },
    );
    upsert_with_day.ok = !error;
    upsert_with_day.error = error ? error.message : null;
  }

  // 4) Upsert directo SIN day (último fallback, esquema viejo).
  const upsert_without_day: ProbeResult = { ok: false, error: null };
  {
    const { error } = await client.from('funnel_counts').upsert(
      { ...probeArgs, count: 1 },
      {
        onConflict:
          'event_name,slide,utm_source,utm_medium,utm_campaign,utm_content',
        ignoreDuplicates: false,
      },
    );
    upsert_without_day.ok = !error;
    upsert_without_day.error = error ? error.message : null;
  }

  // ── WRITE end-to-end: el path REAL que usa /api/track y el webhook. ────────
  const write: ProbeResult = { ok: false, error: null };
  try {
    await getStore().track(HEALTH_EVENT, { slide: -1, quizVersion: 'v3' });
    write.ok = true;
  } catch (e) {
    write.error = errMsg(e);
  }

  // ── Cleanup: borrar las filas de healthcheck para no dejar basura. ─────────
  let cleanup = 'skipped';
  try {
    const { error } = await client
      .from('funnel_counts')
      .delete()
      .eq('event_name', HEALTH_EVENT);
    cleanup = error ? `error: ${error.message}` : 'ok';
  } catch (e) {
    cleanup = `error: ${errMsg(e)}`;
  }

  const ok = write.ok;

  return NextResponse.json(
    {
      ok,
      summary: ok
        ? 'El write a funnel_counts FUNCIONA. Si el funnel no contaba, revisá tráfico o caché.'
        : 'El write a funnel_counts FALLA. Mirá `probes` para ver qué capa rompe y por qué.',
      day,
      env,
      read,
      write,
      probes: { rpc_daily, rpc_legacy, upsert_with_day, upsert_without_day },
      cleanup,
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
