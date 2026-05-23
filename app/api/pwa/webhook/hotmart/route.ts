/**
 * /api/pwa/webhook/hotmart — DEPRECATED.
 *
 * Esta ruta existió en una versión anterior cuando había DOS webhooks
 * (uno para Supabase, otro para CAPI/Systeme). Ahora todo vive en
 * `/api/hotmart-webhook`, que hace los tres efectos en una sola request.
 *
 * Mantenemos esta ruta como PROXY interno por dos razones:
 *   1. Si quedó configurada en Hotmart (panel) por error, las compras siguen
 *      registrándose hasta que actualices la URL en el panel.
 *   2. Backwards-compat con tests/scripts que llaman acá directo.
 *
 * Cómo funciona:
 *   - Reenvía body + header `x-hotmart-hottok` al endpoint canonical.
 *   - Espera la respuesta y la devuelve tal cual.
 *   - Loguea un warning para que veas en Vercel que estás usando el legacy.
 *
 * Cuándo eliminar este archivo:
 *   - Después de actualizar el webhook URL en Hotmart al canonical
 *     (`/api/hotmart-webhook`) y verificar 1-2 días de logs sin hits acá.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'pwa-hotmart-webhook',
    deprecated: true,
    canonical: '/api/hotmart-webhook',
    note: 'Use /api/hotmart-webhook in Hotmart panel. This proxies for backwards compatibility.',
  });
}

export async function POST(req: NextRequest) {
  console.warn(
    '[pwa/webhook/hotmart] DEPRECATED route hit, proxying to /api/hotmart-webhook. ' +
      'Update the webhook URL in Hotmart to /api/hotmart-webhook.',
  );

  // Reconstruir URL absoluta del canonical en este mismo deploy.
  const url = new URL('/api/hotmart-webhook', req.nextUrl.origin);

  // Reenviar body crudo (no JSON.parse acá para preservar idéntico al original).
  const rawBody = await req.text();

  // Reenviar header de auth (es el único que el canonical valida).
  const headers: Record<string, string> = {
    'content-type': req.headers.get('content-type') ?? 'application/json',
  };
  const hottok = req.headers.get('x-hotmart-hottok');
  if (hottok) headers['x-hotmart-hottok'] = hottok;

  try {
    const upstream = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: rawBody,
    });

    // Devolver el body y el status del canonical, agregando un header
    // que indica que pasamos por el proxy (útil para debugging en Vercel).
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
        'x-proxied-from': '/api/pwa/webhook/hotmart',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[pwa/webhook/hotmart] proxy error:', msg);
    // Aún ante error, respondemos 200 — Hotmart va a reintentar igual,
    // pero al menos no dejamos al cliente esperando indefinidamente.
    return NextResponse.json(
      { ok: false, error: 'proxy_failed', detail: msg },
      { status: 502 },
    );
  }
}
