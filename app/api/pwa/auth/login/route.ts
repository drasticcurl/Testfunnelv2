/**
 * POST /api/pwa/auth/login
 *
 * Verifica que el email tenga una compra aprobada en Supabase y, si es así,
 * setea la cookie de sesión firmada (HMAC). El cliente queda logueado.
 *
 * Por qué cookie firmada y no magic link:
 *   - PWA installable, queremos UX instantánea (sin "revisá tu email").
 *   - El abuso real está limitado a quien tenga un email REGISTRADO como
 *     comprador en Supabase, no cualquier email random.
 *   - Migración futura a magic link Supabase queda abierta.
 *
 * Test mode (NEXT_PUBLIC_PWA_TEST_MODE=true OR Supabase no configurado):
 *   - Acepta cualquier email sin verificar compras.
 *   - Igualmente firma la cookie con ese email para que el header / dashboard
 *     puedan mostrar el nombre real (no "María" hardcodeado).
 *
 * Errores devueltos (todos en JSON con `error` y opcional `detail`):
 *   400 invalid_email           → email mal formateado
 *   403 no_purchase             → email no tiene compra aprobada
 *   500 config_session_secret   → falta PWA_SESSION_SECRET en Vercel
 *   500 config_supabase         → faltan keys de Supabase
 *   500 supabase_query_failed   → la query a purchases falló (ver detail)
 *   500 internal                → cualquier otra cosa, ver logs Vercel
 */

import { NextRequest, NextResponse } from 'next/server';
import { isTestMode } from '@/lib/pwa/test-mode';
import {
  signSession,
  SESSION_COOKIE_ATTRS,
  SessionSecretMissingError,
} from '@/lib/pwa/session';

export const runtime = 'nodejs';

function logCtx(stage: string, extra: Record<string, unknown> = {}) {
  // Logs estructurados para que en Vercel Functions sea fácil grepear.
  console.log(`[pwa/auth/login] ${stage}`, JSON.stringify(extra));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
      logCtx('invalid_email', { receivedType: typeof body.email });
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    logCtx('start', { email, testMode: isTestMode() });

    // ─── TEST MODE: aceptar cualquier email + setear cookie ───
    if (isTestMode()) {
      logCtx('test_mode_accept', { email });
      try {
        const token = signSession(email);
        const res = NextResponse.json({ ok: true, testMode: true });
        res.cookies.set(SESSION_COOKIE_ATTRS.name, token, SESSION_COOKIE_ATTRS);
        return res;
      } catch (err) {
        if (err instanceof SessionSecretMissingError) {
          logCtx('config_session_secret', { reason: err.reason });
          return NextResponse.json(
            { error: 'config_session_secret', detail: err.message },
            { status: 500 },
          );
        }
        throw err;
      }
    }

    // ─── PRODUCTION: verificar compra y setear cookie ───
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      logCtx('config_supabase_missing', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
      return NextResponse.json(
        {
          error: 'config_supabase',
          detail:
            'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en variables de entorno',
        },
        { status: 500 },
      );
    }

    const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
    const supabase = createPwaServiceClient();

    logCtx('querying_supabase', { email });
    const { data: purchases, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, status')
      .eq('email', email)
      .eq('status', 'approved')
      .limit(1);

    if (purchaseError) {
      logCtx('supabase_query_error', {
        email,
        message: purchaseError.message,
        code: purchaseError.code,
      });
      return NextResponse.json(
        { error: 'supabase_query_failed', detail: purchaseError.message },
        { status: 500 },
      );
    }

    if (!purchases || purchases.length === 0) {
      logCtx('no_purchase', { email });
      return NextResponse.json({ error: 'no_purchase' }, { status: 403 });
    }

    logCtx('purchase_found', { email, count: purchases.length });

    // Compra confirmada: firmar cookie y devolver ok.
    let token: string;
    try {
      token = signSession(email);
    } catch (err) {
      if (err instanceof SessionSecretMissingError) {
        logCtx('config_session_secret', { reason: err.reason });
        return NextResponse.json(
          { error: 'config_session_secret', detail: err.message },
          { status: 500 },
        );
      }
      throw err;
    }

    logCtx('session_signed', { email });
    const res = NextResponse.json({ ok: true, testMode: false });
    res.cookies.set(SESSION_COOKIE_ATTRS.name, token, SESSION_COOKIE_ATTRS);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[pwa/auth/login] internal error:', msg, stack);
    return NextResponse.json(
      { error: 'internal', detail: msg },
      { status: 500 },
    );
  }
}
