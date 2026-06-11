/**
 * GET /api/admin/leads-export
 *
 * Exporta los leads del quiz como CSV listo para importar a Shopify Customers.
 * Auth: cookie admin_token firmada (HMAC). Sin cookie -> 401.
 *
 * Query params:
 *   - since=YYYY-MM-DD   → solo leads creados desde esa fecha (default: sin filtro)
 *   - onlyNonBuyers=true → excluir leads que ya compraron (default: true)
 *
 * Formato CSV (compatible con Shopify Customer Import):
 *   First Name, Last Name, Email, Accepts Email Marketing, Tags, Note
 *
 * Tags automáticos: quiz-lead, tipo-{1..4}, severidad-{baja|media|alta}, no-comprador
 *
 * Lógica de "no comprador": LEFT JOIN con purchases (status='approved'). Si no
 * existe match, es no-comprador. La comparación se hace lowercase para evitar
 * mismatches por mayúsculas (clientes guarda email casi siempre lowercase, pero
 * purchases puede venir con caps de Shopify/Hotmart).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LeadRow {
  email: string;
  nombre: string | null;
  country: string | null;
  tipo_hinchazon: number | null;
  severidad: number | null;
  created_at: string;
}

interface PurchaseRow {
  email: string;
}

function severidadBucket(score: number | null | undefined): 'baja' | 'media' | 'alta' | 'sd' {
  if (score == null) return 'sd';
  if (score >= 8) return 'alta';
  if (score >= 5) return 'media';
  return 'baja';
}

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return '';
  const s = String(value);
  // Si tiene coma, comilla o newline, envolvemos en comillas y escapamos comillas dobles.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildTags(lead: LeadRow): string {
  const tags = ['quiz-lead', 'no-comprador'];
  if (lead.tipo_hinchazon != null) tags.push(`tipo-${lead.tipo_hinchazon}`);
  const sev = severidadBucket(lead.severidad);
  if (sev !== 'sd') tags.push(`severidad-${sev}`);
  if (lead.country) tags.push(`pais-${lead.country.toLowerCase()}`);
  return tags.join(',');
}

function buildNote(lead: LeadRow): string {
  const parts: string[] = [];
  if (lead.tipo_hinchazon != null) parts.push(`Tipo hinchazon ${lead.tipo_hinchazon}`);
  if (lead.severidad != null) parts.push(`severidad ${lead.severidad}/10`);
  if (lead.country) parts.push(`pais ${lead.country}`);
  parts.push(`quiz ${new Date(lead.created_at).toISOString().slice(0, 10)}`);
  return parts.join(' — ');
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'supabase_not_configured' },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const sinceRaw = url.searchParams.get('since');
  const onlyNonBuyers = url.searchParams.get('onlyNonBuyers') !== 'false'; // default true

  // ── 1. Traer leads de tabla `clientes` ──────────────────────────────────
  let leadsQuery = supabase
    .from('clientes')
    .select('email, nombre, country, tipo_hinchazon, severidad, created_at')
    .order('created_at', { ascending: false });

  if (sinceRaw) {
    // Validamos formato YYYY-MM-DD básico
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sinceRaw)) {
      return NextResponse.json(
        { ok: false, error: 'invalid_since_format' },
        { status: 400 },
      );
    }
    leadsQuery = leadsQuery.gte('created_at', `${sinceRaw}T00:00:00Z`);
  }

  // Filtro por país opcional: ?country=CL (ISO alpha-2). Si está, filtramos
  // antes de descargar el CSV para que el archivo solo tenga ese país.
  const SUPPORTED_COUNTRIES = new Set(['CL', 'CO', 'MX', 'PE', 'US']);
  const countryParam = url.searchParams.get('country');
  if (countryParam) {
    const upper = countryParam.toUpperCase();
    if (SUPPORTED_COUNTRIES.has(upper)) {
      leadsQuery = leadsQuery.eq('country', upper);
    }
  }

  const { data: leads, error: leadsErr } = await leadsQuery;
  if (leadsErr) {
    console.error('[admin/leads-export] clientes query failed:', leadsErr.message);
    return NextResponse.json(
      { ok: false, error: 'db_error', detail: leadsErr.message },
      { status: 500 },
    );
  }

  // ── 2. Traer compradores aprobados (set para LEFT JOIN en memoria) ──────
  let buyersSet = new Set<string>();
  if (onlyNonBuyers) {
    const { data: buyers, error: buyersErr } = await supabase
      .from('purchases')
      .select('email')
      .eq('status', 'approved');

    if (buyersErr) {
      console.error('[admin/leads-export] purchases query failed:', buyersErr.message);
      return NextResponse.json(
        { ok: false, error: 'db_error', detail: buyersErr.message },
        { status: 500 },
      );
    }

    buyersSet = new Set(
      (buyers as PurchaseRow[] | null ?? []).map((p) => p.email.trim().toLowerCase()),
    );
  }

  // ── 3. Filtrar y construir CSV ──────────────────────────────────────────
  const filtered = (leads as LeadRow[] | null ?? []).filter((l) => {
    if (!l.email) return false;
    if (onlyNonBuyers && buyersSet.has(l.email.trim().toLowerCase())) return false;
    return true;
  });

  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Country',
    'Accepts Email Marketing',
    'Tags',
    'Note',
  ];

  const lines: string[] = [headers.join(',')];

  for (const lead of filtered) {
    const firstName = (lead.nombre ?? '').trim();
    const row = [
      csvEscape(firstName),
      csvEscape(''), // Last Name (no lo capturamos)
      csvEscape(lead.email.trim()),
      csvEscape(lead.country ?? ''),
      csvEscape('yes'),
      csvEscape(buildTags(lead)),
      csvEscape(buildNote(lead)),
    ];
    lines.push(row.join(','));
  }

  // BOM al inicio para que Excel/Numbers detecten UTF-8 con acentos.
  const csv = '\uFEFF' + lines.join('\r\n') + '\r\n';

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `shopify-leads-${dateStr}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, max-age=0',
      'X-Lead-Count': String(filtered.length),
    },
  });
}
