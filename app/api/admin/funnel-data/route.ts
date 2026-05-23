/**
 * GET /api/admin/funnel-data
 *
 * Devuelve el embudo agregado del quiz, slide por slide.
 * Auth: cookie admin_token firmada (HMAC). Sin cookie -> 401.
 *
 * Respuesta:
 *   {
 *     ok: true,
 *     data: {
 *       slides: [{ index, id, type, count, pctVsStart, pctVsPrevious, dropFromPrevious }],
 *       totalStarts, totalCompletes, totalSales (number | null),
 *       totalEvents, generatedAt, backend, utmBreakdown
 *     }
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/admin/store';
import { isAdminAuthenticated } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // Optional version filter: ?version=v1 | ?version=v2 | ?version=v3 | (none = all)
  const version = req.nextUrl.searchParams.get('version') as 'v1' | 'v2' | 'v3' | null;
  const data = await getStore().getFunnel({ version: version ?? undefined });

  return NextResponse.json(
    { ok: true, data },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}

/**
 * DELETE /api/admin/funnel-data
 *
 * Resetea todas las estadísticas del embudo. Requiere auth admin.
 */
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    await getStore().reset();
    return NextResponse.json({ ok: true, message: 'Estadísticas reseteadas' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.error('[admin/funnel-data] DELETE failed:', msg);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 },
    );
  }
}
