/**
 * POST /api/test-email
 *
 * Endpoint de testing para enviar emails manualmente.
 * Simula el email de follow-up (24h) como si la persona hubiera
 * completado el quiz ayer y no compró.
 *
 * Body:
 *   { email: string, type?: "diagnostico" | "followup" }
 *
 * - type "diagnostico" (default): envía el email 1 (Tu diagnóstico está listo)
 * - type "followup": envía el email 2 (24h, story + 10% off)
 *
 * Protegido por ADMIN_PASSWORD en header Authorization.
 * Solo para testing — no exponer en producción sin auth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendDiagnosticoEmail } from '@/lib/email/resend';
import { sendFollowupEmail } from '@/lib/email/followup';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Auth simple: requiere ADMIN_PASSWORD en header
  const authHeader = req.headers.get('authorization') || '';
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw || authHeader !== `Bearer ${adminPw}`) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized. Send Authorization: Bearer <ADMIN_PASSWORD>' },
      { status: 401 },
    );
  }

  let body: { email?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const type = body.type || 'diagnostico';

  if (type === 'diagnostico') {
    // Email 1: Tu diagnóstico está listo (con datos fake de ejemplo)
    const sent = await sendDiagnosticoEmail({
      to: email,
      nombre: 'Test',
      tipoNombre: 'Hinchazón Inflamatoria Vespertina',
      severidad: 7,
    });
    return NextResponse.json({ ok: sent, type: 'diagnostico', to: email });
  }

  if (type === 'followup') {
    // Email 2: Follow-up 24h (story + 10% off)
    const sent = await sendFollowupEmail({
      to: email,
      nombre: 'Test',
      tipoNombre: 'Hinchazón Inflamatoria Vespertina',
    });
    return NextResponse.json({ ok: sent, type: 'followup', to: email });
  }

  return NextResponse.json({ ok: false, error: `type "${type}" no soportado. Usar "diagnostico" o "followup"` }, { status: 400 });
}
