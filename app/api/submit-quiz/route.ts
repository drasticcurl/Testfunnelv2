/**
 * POST /api/submit-quiz
 *
 * Recibe los datos del quiz al final del flujo (SlideEmailCapture). Hace 3 cosas:
 *  1. Reenvía a un webhook genérico (Make.com / Zapier) si está configurado
 *     vía `QUIZ_WEBHOOK_URL` (opcional).
 *  2. Dispara evento `Lead` a Meta CAPI server-side (con email hasheado SHA256).
 *  3. Persiste el lead en `clientes` (Supabase) — incluye el `country`
 *     detectado en el cliente para poder segmentar /admin/leads.
 *
 * Body esperado (lo manda QuizContainerV2.handleEmailSubmit):
 *   {
 *     ...answers,                       // todas las QuizAnswers
 *     email: string,                    // requerido
 *     nombre?: string,
 *     country?: 'CL' | 'CO' | 'MX' | 'PE' | 'US',
 *     fbc?: string,
 *     fbp?: string,
 *   }
 *
 * Falla gracefully: cualquier integración que falle se loguea pero no rompe
 * la respuesta al cliente. El cliente solo necesita saber que el dato llegó
 * al backend para avanzar al SlideLoading.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendCapiEvent, getMetaCookiesFromRequest } from '@/lib/tracking';
import { calcularTipoV2, calcularSeveridadV2 } from '@/lib/quiz-v2/helpers';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const SUPPORTED_COUNTRIES = new Set(['CL', 'CO', 'MX', 'PE', 'US']);

type SubmitBody = Record<string, unknown> & {
  email?: string;
  nombre?: string;
  country?: string;
  fbc?: string;
  fbp?: string;
};

function severidadBucket(score: number): 'baja' | 'media' | 'alta' {
  if (score >= 8) return 'alta';
  if (score >= 5) return 'media';
  return 'baja';
}

/** Devuelve un código ISO de país soportado o `undefined`. */
function normalizeCountry(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const upper = raw.trim().toUpperCase();
  if (upper.length !== 2 || !SUPPORTED_COUNTRIES.has(upper)) return undefined;
  return upper;
}

export async function POST(req: NextRequest) {
  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : undefined;
  const country = normalizeCountry(body.country);

  // Cálculo defensivo: si falla, valores neutros — lo crítico es persistir el
  // email. `severidad` se redondea a entero porque la columna es SMALLINT.
  let tipo = 1;
  let severidad = 0;
  try {
    tipo = calcularTipoV2(body as any);
    severidad = Math.round(calcularSeveridadV2(body as any));
  } catch (err) {
    console.error('[submit-quiz] calc tipo/severidad falló, usando defaults:', err);
  }
  const sevLabel = severidadBucket(severidad);

  const userAgent = req.headers.get('user-agent') ?? undefined;
  const ipHeader = req.headers.get('x-forwarded-for') ?? '';
  const ip =
    ipHeader.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;

  // ─── 1. Webhook genérico (Make.com / Zapier) — opcional ───────────────
  const webhookUrl = process.env.QUIZ_WEBHOOK_URL;
  const webhookPromise = webhookUrl
    ? fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          country,
          tipo,
          severidad,
          severidadLabel: sevLabel,
          submittedAt: new Date().toISOString(),
          source: 'chau-hinchazon-quiz',
        }),
      })
        .then((r) => {
          if (!r.ok) console.error(`[submit-quiz] Webhook ${r.status}`);
          return undefined;
        })
        .catch((err) => {
          console.error('[submit-quiz] Webhook fetch failed:', err);
          return undefined;
        })
    : Promise.resolve(undefined);

  // ─── 2. Meta CAPI: evento Lead ────────────────────────────────────────
  const metaCookies = getMetaCookiesFromRequest(req, { fbc: body.fbc, fbp: body.fbp });
  const capiPromise = sendCapiEvent({
    event_name: 'Lead',
    event_source_url: req.headers.get('referer') ?? undefined,
    user_data: {
      email,
      ipAddress: ip,
      userAgent,
      ...metaCookies,
    },
    custom_data: {
      content_name: 'Quiz Anti-Hinchazón',
      content_category: `Tipo ${tipo}${country ? ` · ${country}` : ''}`,
    },
  });

  // ─── 3. Supabase: guardar lead en `clientes` ──────────────────────────
  const supabase = getSupabase();
  const supabasePromise = supabase
    ? (async () => {
        try {
          const row: Record<string, unknown> = {
            email,
            nombre,
            apertura: body.apertura as string | undefined,
            momento: body.momento_del_dia as string | undefined,
            tiempo: body.tiempo_con_problema as string | undefined,
            sintomas: Array.isArray(body.sintomas) ? body.sintomas : [],
            ya_probo: Array.isArray(body.ya_probo) ? body.ya_probo : [],
            impacto_emocional: body.impacto_emocional as string | undefined,
            objetivo: body.objetivo as string | undefined,
            compromiso: body.compromiso as string | undefined,
            tipo_hinchazon: tipo,
            severidad,
            fbc: body.fbc,
            fbp: body.fbp,
          };
          // Solo seteamos `country` si es válido — si no, dejamos que la columna
          // use su DEFAULT 'CL' definido en el schema (no pisamos a NULL en
          // un upsert si por algún motivo el cliente no lo manda).
          if (country) row.country = country;

          const { error } = await supabase
            .from('clientes')
            .upsert(row, { onConflict: 'email' });
          if (error) {
            console.error('[submit-quiz] Supabase upsert error:', error.message);
            return { ok: false, error: error.message };
          }
          return { ok: true };
        } catch (err) {
          console.error('[submit-quiz] Supabase fetch failed:', err);
          return { ok: false, error: 'network' };
        }
      })()
    : Promise.resolve({ ok: false, error: 'no_config' } as { ok: boolean; error?: string });

  const [, capiRes, supabaseRes] = await Promise.all([
    webhookPromise,
    capiPromise,
    supabasePromise,
  ]);

  return NextResponse.json({
    ok: true,
    integrations: {
      webhook: webhookUrl ? 'sent' : 'skipped',
      capi: capiRes.ok ? 'sent' : `skipped:${capiRes.reason ?? capiRes.error ?? 'unknown'}`,
      supabase: supabaseRes.ok ? 'sent' : `skipped:${supabaseRes.error ?? 'unknown'}`,
    },
  });
}
