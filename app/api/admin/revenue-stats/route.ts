/**
 * GET /api/admin/revenue-stats
 *
 * KPIs de revenue para la sección "Ventas" de /admin/funnel.
 * Auth: cookie admin_token firmada (HMAC). Sin cookie -> 401.
 *
 * Fuente de verdad: tabla `purchases` (la escribe el webhook de Shopify).
 * Solo cuenta `status='approved'` para revenue neto. Los refunded se reportan
 * por separado (calculados sobre TODAS las refunded, sin filtro de UTM).
 *
 * Estrategia: traemos todas las filas de purchases (volumen esperado bajo,
 * <10k filas) y agregamos en memoria. Si crece mucho, se mueve a una vista
 * SQL o RPC con SUM(amount).
 *
 * Query params:
 *   - utm_sources=facebook,instagram,(directo)  → multi-select por fuente
 *   - utm_campaigns=UGC AD 3 / TEST,otra         → multi-select por campaña
 *     - Vacío o no presente = sin filtro.
 *     - "(directo)" matchea filas con utm_source/utm_campaign NULL/vacío.
 *     - Si se pasan los dos, el filtro es AND (source Y campaign).
 *
 * Respuesta:
 *   {
 *     ok: true,
 *     data: {
 *       totalRevenue, totalRefunded, approvedCount, refundedCount, avgTicket,
 *       currency, last24h, last7d, last30d,
 *       byProduct: [...],
 *       bySource:  [{ source, count, revenue }],   // SIEMPRE sin filtro (lista de chips)
 *       lastSaleAt,
 *       configured,
 *       filtered: { sources: string[] | null, count: number, revenue: number },
 *     }
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getSupabase } from '@/lib/supabase';
import { cleanUtmValue, utmKey } from '@/lib/utm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIRECT = '(directo)';

interface PurchaseRow {
  amount: number | string | null;
  currency: string | null;
  status: string;
  product_name: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  country: string | null;
  purchased_at: string | null;
  created_at: string | null;
}

interface PeriodAgg {
  revenue: number;
  count: number;
}

function emptyData() {
  return {
    totalRevenue: 0,
    totalRefunded: 0,
    approvedCount: 0,
    refundedCount: 0,
    avgTicket: 0,
    currency: 'USD' as const,
    last24h: { revenue: 0, count: 0 } as PeriodAgg,
    last7d: { revenue: 0, count: 0 } as PeriodAgg,
    last30d: { revenue: 0, count: 0 } as PeriodAgg,
    byProduct: [] as Array<{ name: string; count: number; revenue: number }>,
    bySource: [] as Array<{ source: string; count: number; revenue: number }>,
    byCampaign: [] as Array<{ campaign: string; count: number; revenue: number }>,
    byCountry: [] as Array<{ country: string; count: number; revenue: number }>,
    lastSaleAt: null as string | null,
    configured: false,
    filtered: {
      sources: null as string[] | null,
      campaigns: null as string[] | null,
      countries: null as string[] | null,
      count: 0,
      revenue: 0,
    },
  };
}

function toAmount(value: PurchaseRow['amount']): number {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Devuelve el utm_source canónico para agrupar/filtrar (lowercase, "(directo)" si vacío). */
function canonicalSource(raw: string | null | undefined): string {
  const s = utmKey(raw);
  if (!s) return DIRECT;
  return s;
}

/** Etiqueta de campaña para mostrar (decodificada, sin espacios de más, "(directo)" si vacío). */
function campaignLabel(raw: string | null | undefined): string {
  const s = cleanUtmValue(raw);
  return s || DIRECT;
}

/** Clave canónica de campaña para agrupar/matchear (case-insensitive). */
function campaignKey(raw: string | null | undefined): string {
  const s = utmKey(raw);
  return s || DIRECT;
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { ok: true, data: emptyData() },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } },
      );
    }

  // ── Parse filtros multi-select (source, campaign y country) ──────────────
  const url = new URL(req.url);
  const sourcesParam = url.searchParams.get('utm_sources');
  const filterSources: Set<string> | null = sourcesParam
    ? new Set(
        sourcesParam
          .split(',')
          .map((s) => utmKey(s))
          .filter(Boolean),
      )
    : null;
  const campaignsParam = url.searchParams.get('utm_campaigns');
  const filterCampaigns: Set<string> | null = campaignsParam
    ? new Set(
        campaignsParam
          .split(',')
          .map((s) => campaignKey(s))
          .filter(Boolean),
      )
    : null;
  // País: ISO alpha-2 separado por coma (ej: ?countries=CL,CO). Aceptamos
  // '(desconocido)' como valor explícito para ver compras sin país.
  const SUPPORTED_COUNTRIES = new Set(['CL', 'CO', 'MX', 'PE', 'US', '(desconocido)']);
  const countriesParam = url.searchParams.get('countries');
  const filterCountries: Set<string> | null = countriesParam
    ? new Set(
        countriesParam
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .map((s) => (s === '(DESCONOCIDO)' ? '(desconocido)' : s))
          .filter((s) => SUPPORTED_COUNTRIES.has(s)),
      )
    : null;
  const hasSourceFilter = filterSources !== null && filterSources.size > 0;
  const hasCampaignFilter = filterCampaigns !== null && filterCampaigns.size > 0;
  const hasCountryFilter = filterCountries !== null && filterCountries.size > 0;
  const hasFilter = hasSourceFilter || hasCampaignFilter || hasCountryFilter;

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('purchases')
    .select('amount, currency, status, product_name, utm_source, utm_campaign, country, purchased_at, created_at')
    .order('purchased_at', { ascending: false });

  if (error) {
    console.error('[admin/revenue-stats] purchases query failed:', error.message);
    return NextResponse.json(
      { ok: false, error: 'db_error', detail: error.message },
      { status: 500 },
    );
  }

  const rows = (data as PurchaseRow[] | null) ?? [];

  // ── Agregaciones ─────────────────────────────────────────────────────────
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const cut24 = now - 1 * day;
  const cut7 = now - 7 * day;
  const cut30 = now - 30 * day;

  let totalRevenue = 0;
  let totalRefunded = 0;
  let approvedCount = 0;
  let refundedCount = 0;
  let filteredRevenue = 0;
  let filteredCount = 0;
  const last24h: PeriodAgg = { revenue: 0, count: 0 };
  const last7d: PeriodAgg = { revenue: 0, count: 0 };
  const last30d: PeriodAgg = { revenue: 0, count: 0 };
  const productAgg = new Map<string, { count: number; revenue: number }>();
  const sourceAgg = new Map<string, { count: number; revenue: number }>();
  // Campaña: agrupamos por clave canónica (case-insensitive) pero guardamos una
  // etiqueta "linda" para mostrar (la primera variante limpia que aparece).
  const campaignAgg = new Map<string, { label: string; count: number; revenue: number }>();
  // País: agrupamos por ISO alpha-2 (o '(desconocido)' si la fila no tiene country).
  const countryAgg = new Map<string, { count: number; revenue: number }>();
  let lastSaleAt: string | null = null;
  let detectedCurrency = 'USD';

  for (const row of rows) {
    const amount = toAmount(row.amount);
    const status = (row.status ?? '').toLowerCase();
    const ts = Date.parse(row.purchased_at ?? row.created_at ?? '');
    if (row.currency) detectedCurrency = row.currency;

    if (status === 'approved') {
      approvedCount += 1;
      totalRevenue += amount;

      const source = canonicalSource(row.utm_source);
      const prevSrc = sourceAgg.get(source) ?? { count: 0, revenue: 0 };
      sourceAgg.set(source, { count: prevSrc.count + 1, revenue: prevSrc.revenue + amount });

      const campKey = campaignKey(row.utm_campaign);
      const campLbl = campaignLabel(row.utm_campaign);
      const prevCamp = campaignAgg.get(campKey) ?? { label: campLbl, count: 0, revenue: 0 };
      campaignAgg.set(campKey, { label: prevCamp.label, count: prevCamp.count + 1, revenue: prevCamp.revenue + amount });

      const countryKey =
        typeof row.country === 'string' && row.country.trim().length > 0
          ? row.country.trim().toUpperCase()
          : '(desconocido)';
      const prevCtry = countryAgg.get(countryKey) ?? { count: 0, revenue: 0 };
      countryAgg.set(countryKey, { count: prevCtry.count + 1, revenue: prevCtry.revenue + amount });

      // Filtro combinado AND: source AND campaign AND country (cualquiera de
      // los tres puede no estar filtrado y entonces no constraint).
      const matchesSource = !hasSourceFilter || filterSources.has(source);
      const matchesCampaign = !hasCampaignFilter || filterCampaigns.has(campKey);
      const matchesCountry = !hasCountryFilter || filterCountries.has(countryKey);
      const matchesFilter = matchesSource && matchesCampaign && matchesCountry;
      if (matchesFilter) {
        filteredRevenue += amount;
        filteredCount += 1;

        if (!lastSaleAt && row.purchased_at) lastSaleAt = row.purchased_at;

        if (Number.isFinite(ts)) {
          if (ts >= cut24) { last24h.revenue += amount; last24h.count += 1; }
          if (ts >= cut7)  { last7d.revenue  += amount; last7d.count  += 1; }
          if (ts >= cut30) { last30d.revenue += amount; last30d.count += 1; }
        }

        const prodName = (row.product_name ?? '').trim() || 'Sin nombre';
        const prev = productAgg.get(prodName) ?? { count: 0, revenue: 0 };
        productAgg.set(prodName, { count: prev.count + 1, revenue: prev.revenue + amount });
      }
    } else if (status === 'refunded' || status === 'chargeback') {
      // Refunds: SIN aplicar filtros (es plata real devuelta total).
      totalRefunded += amount;
      refundedCount += 1;
    }
  }

  // Si hay filtro, los KPIs principales reflejan el filtro;
  // si no, reflejan el total. avgTicket usa la base coherente con esos KPIs.
  const displayRevenue = hasFilter ? filteredRevenue : totalRevenue;
  const displayCount = hasFilter ? filteredCount : approvedCount;
  const avgTicket = displayCount > 0 ? displayRevenue / displayCount : 0;

  const byProduct = Array.from(productAgg.entries())
    .map(([name, v]) => ({ name, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const bySource = Array.from(sourceAgg.entries())
    .map(([source, v]) => ({ source, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const byCampaign = Array.from(campaignAgg.values())
    .map((v) => ({ campaign: v.label, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const byCountry = Array.from(countryAgg.entries())
    .map(([country, v]) => ({ country, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json(
    {
      ok: true,
      data: {
        // Si hay filtro, totalRevenue / approvedCount reflejan SOLO lo filtrado
        // (así el grupo de KPIs principales reacciona a la selección de chips).
        totalRevenue: displayRevenue,
        totalRefunded,
        approvedCount: displayCount,
        refundedCount,
        avgTicket,
        currency: detectedCurrency,
        last24h,
        last7d,
        last30d,
        byProduct,
        bySource,    // siempre completo, así la lista de chips no cambia al filtrar
        byCampaign,  // idem
        byCountry,   // idem — chips de país completos
        lastSaleAt,
        configured: true,
        filtered: {
          sources: hasSourceFilter ? Array.from(filterSources) : null,
          campaigns: hasCampaignFilter ? Array.from(filterCampaigns) : null,
          countries: hasCountryFilter ? Array.from(filterCountries) : null,
          count: filteredCount,
          revenue: filteredRevenue,
        },
      },
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error';
    console.error('[admin/revenue-stats] uncaught:', msg);
    return NextResponse.json(
      { ok: false, error: 'internal_error', detail: msg },
      { status: 500 },
    );
  }
}
