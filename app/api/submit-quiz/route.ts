/**
 * POST /api/submit-quiz
 *
 * Recibe los datos del quiz al final del flujo (Agente 02 -> SlideEmailCapture).
 * Hace 3 cosas en paralelo:
 *  1. Forward al webhook generico (Make.com / Zapier) si esta configurado
 *  2. Crea contacto en Systeme.io con tags segmentados
 *  3. Dispara evento Lead a Meta CAPI (con email hasheado SHA256)
 *
 * Body esperado (lo envia QuizContainer.handleEmailSubmit):
 *   {
 *     ...answers,           // todas las QuizAnswers (edad, momento, sintomas, etc)
 *     email: string,        // requerido
 *     nombre?: string
 *   }
 *
 * Falla gracefully: cualquier integracion que falle se loguea pero no
 * rompe la respuesta al cliente. El cliente solo necesita saber que el
 * dato llego al backend para avanzar al SlideLoading.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendCapiEvent, upsertSystemeContact, getMetaCookiesFromRequest } from '@/lib/tracking';
import { calcularTipoV2, calcularSeveridadV2 } from '@/lib/quiz-v2/helpers';
import { getSupabase } from '@/lib/supabase';
import { sendDiagnosticoEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

type SubmitBody = Record<string, unknown> & {
  email?: string;
  nombre?: string;
  fbc?: string;
  fbp?: string;
};

function severidadBucket(score: number): 'baja' | 'media' | 'alta' {
  if (score >= 8) return 'alta';
  if (score >= 5) return 'media';
  return 'baja';
}

export async function POST(req: NextRequest) {
  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : undefined;

  // Calculo tipo + severidad para tags y para enriquecer al webhook.
  // Defensivo: si el cálculo falla, usamos valores neutros para NO bloquear el
  // guardado del lead (lo crítico es persistir el email).
  //
  // IMPORTANTE: `severidad` se guarda en una columna SMALLINT (entero) en
  // Supabase. calcularSeveridadV2 devuelve nivelInflamacion/10 → un DECIMAL
  // (ej. 8.5). Si entra un decimal a un SMALLINT, el INSERT falla y el lead NO
  // se guarda. Por eso lo redondeamos a entero acá.
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

  // ─── 1. Webhook generico (Make.com / Zapier) ──────────────────────────
  // Fire-and-forget. Si falla no bloquea al usuario.
  const webhookUrl = process.env.QUIZ_WEBHOOK_URL;
  const webhookPromise = webhookUrl
    ? fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          tipo,
          severidad,
          severidadLabel: sevLabel,
          submittedAt: new Date().toISOString(),
          source: 'anti-hinchazon-quiz',
        }),
      })
        .then((r) => {
          if (!r.ok) {
            console.error(`[submit-quiz] Webhook ${r.status}`);
          }
          return undefined;
        })
        .catch((err) => {
          console.error('[submit-quiz] Webhook fetch failed:', err);
          return undefined;
        })
    : Promise.resolve(undefined);

  // ─── 2. Systeme.io: crear contacto con tags ───────────────────────────
  // Tags segmentados para que el agente 12 (emails) pueda segmentar:
  //   quiz_completado, tipo_X, severidad_alta/media/baja, no_comprador
  const systemePromise = upsertSystemeContact({
    email,
    nombre,
    tags: [
      'quiz_completado',
      `tipo_${tipo}`,
      `severidad_${sevLabel}`,
      'no_comprador',
    ],
    fields: {
      tipo_hinchazon: tipo,
      severidad_score: severidad,
    },
  });

  // ─── 3. Meta CAPI: evento Lead ────────────────────────────────────────
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
      content_name: 'Quiz Anti-Hinchazon',
      content_category: `Tipo ${tipo}`,
    },
  });

  // ─── 4. Supabase: guardar lead en tabla clientes ──────────────────────
  const supabase = getSupabase();
  const supabasePromise = supabase
    ? (async () => {
        try {
          const { error } = await supabase
            .from('clientes')
            .upsert(
              {
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
              },
              { onConflict: 'email' },
            );
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

  // ─── 5. Resend: DESACTIVADO ─────────────────────────────────────────────
  // No enviamos email post-quiz. Solo se colecta el lead para futuras campañas.
  // El email de bienvenida se envía SOLO post-compra (desde hotmart-webhook).
  const resendPromise = Promise.resolve({ ok: false } as { ok: boolean });

  // Esperamos en paralelo. Cualquier .catch ya esta absorbido arriba.
  const [, systemeRes, capiRes, supabaseRes, resendRes] = await Promise.all([
    webhookPromise,
    systemePromise,
    capiPromise,
    supabasePromise,
    resendPromise,
  ]);

  // Actualizar email_enviado en supabase si se envió
  if (supabase && resendRes.ok) {
    (async () => {
      try {
        await supabase
          .from('clientes')
          .update({ email_enviado: true })
          .eq('email', email);
      } catch {
        // non-blocking
      }
    })();
  }

  return NextResponse.json({
    ok: true,
    integrations: {
      webhook: webhookUrl ? 'sent' : 'skipped',
      systeme: systemeRes.ok ? 'sent' : `skipped:${systemeRes.reason ?? systemeRes.error ?? 'unknown'}`,
      capi: capiRes.ok ? 'sent' : `skipped:${capiRes.reason ?? capiRes.error ?? 'unknown'}`,
      supabase: supabaseRes.ok ? 'sent' : `skipped:${supabaseRes.error ?? 'unknown'}`,
      resend: resendRes.ok ? 'sent' : 'skipped',
    },
  });
}
