/**
 * SupabaseStore — backend persistente para el funnel del quiz.
 *
 * Usa la tabla `funnel_counts` en Supabase.
 * Soporta quiz_version (v1/v2/v3) para filtrar en el admin.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { slides } from '@/lib/quiz-data';
import { slidesV2 } from '@/lib/quiz-v2/data';
import { slidesV3 } from '@/lib/quiz-v3/data';
import type {
  FunnelStore,
  FunnelData,
  FunnelFilters,
  FunnelSlideRow,
  TrackProps,
  UTMBreakdownRow,
} from './store';

// ─── Singleton del client ──────────────────────────────────────────────────

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[admin/supabase-store] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}

// ─── Implementación ────────────────────────────────────────────────────────

export class SupabaseStore implements FunnelStore {
  async track(event: string, props: TrackProps): Promise<void> {
    if (!event || typeof event !== 'string') return;

    const client = getClient();

    const utm_source = props.utms?.utm_source || '(directo)';
    const utm_medium = props.utms?.utm_medium || '(directo)';
    const utm_campaign = props.utms?.utm_campaign || '(directo)';
    const utm_content = props.utms?.utm_content || '(directo)';
    const quiz_version = props.quizVersion || 'v1';

    const slide =
      typeof props.slide === 'number' && Number.isFinite(props.slide)
        ? props.slide
        : null;

    // Try RPC first (atomic increment)
    const { error } = await client.rpc('increment_funnel_count', {
      p_event_name: event,
      p_slide: slide,
      p_utm_source: utm_source,
      p_utm_medium: utm_medium,
      p_utm_campaign: utm_campaign,
      p_utm_content: utm_content,
      p_quiz_version: quiz_version,
    });

    if (error) {
      // Fallback: direct upsert
      console.error('[admin/supabase-store] RPC failed, trying direct upsert:', error.message);

      const { error: upsertError } = await client
        .from('funnel_counts')
        .upsert(
          {
            event_name: event,
            slide,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            quiz_version,
            count: 1,
          },
          {
            onConflict: 'event_name,slide,utm_source,utm_medium,utm_campaign,utm_content,quiz_version',
            ignoreDuplicates: false,
          },
        );

      if (upsertError) {
        console.error('[admin/supabase-store] upsert also failed:', upsertError.message);
      }
    }
  }

  async getFunnel(filters: FunnelFilters): Promise<FunnelData> {
    const client = getClient();

    let query = client
      .from('funnel_counts')
      .select('event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, count');

    // Filter by version if specified
    if (filters.version) {
      query = query.eq('quiz_version', filters.version);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error('[admin/supabase-store] getFunnel query failed:', error.message);
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return this.computeFunnel(rows ?? [], filters);
  }

  async reset(): Promise<void> {
    const client = getClient();

    const { error } = await client
      .from('funnel_counts')
      .delete()
      .gt('id', 0);

    if (error) {
      const { error: error2 } = await client
        .from('funnel_counts')
        .delete()
        .neq('event_name', '');

      if (error2) {
        throw new Error(`Reset failed: ${error.message} | Fallback: ${error2.message}`);
      }
    }
  }

  // ─── Cálculo del embudo ──────────────────────────────────────────────────

  private computeFunnel(
    rows: Array<{
      event_name: string;
      slide: number | null;
      utm_source: string;
      utm_medium: string;
      utm_campaign: string;
      utm_content: string;
      quiz_version?: string;
      count: number;
    }>,
    filters: FunnelFilters,
  ): FunnelData {
    const perSlide: Record<number, number> = {};
    let landingViews = 0;
    let viewContent = 0;
    let checkoutClicks = 0;
    let purchase = 0;
    let totalEvents = 0;

    const utmMap: Record<string, { starts: number; completes: number; checkoutClicks: number; purchases: number }> = {};

    function getUtmKey(row: { utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string }): string {
      return `${row.utm_source}|${row.utm_medium}|${row.utm_campaign}|${row.utm_content}`;
    }

    function ensureUtmRow(key: string) {
      if (!utmMap[key]) {
        utmMap[key] = { starts: 0, completes: 0, checkoutClicks: 0, purchases: 0 };
      }
    }

    for (const row of rows) {
      totalEvents += row.count;

      if (row.event_name === 'QuizProgress' && typeof row.slide === 'number') {
        perSlide[row.slide] = (perSlide[row.slide] ?? 0) + row.count;
        if (row.slide === 0) {
          const key = getUtmKey(row);
          ensureUtmRow(key);
          utmMap[key].starts += row.count;
        }
      } else if (row.event_name === 'LandingView') {
        landingViews += row.count;
      } else if (row.event_name === 'ViewContent') {
        viewContent += row.count;
        const key = getUtmKey(row);
        ensureUtmRow(key);
        utmMap[key].completes += row.count;
      } else if (row.event_name === 'CheckoutClick' || row.event_name === 'InitiateCheckout') {
        checkoutClicks += row.count;
        const key = getUtmKey(row);
        ensureUtmRow(key);
        utmMap[key].checkoutClicks += row.count;
      } else if (row.event_name === 'Purchase') {
        purchase += row.count;
        const key = getUtmKey(row);
        ensureUtmRow(key);
        utmMap[key].purchases += row.count;
      }
    }

    const totalStarts = perSlide[0] ?? 0;

    // Use appropriate slides array based on version filter
    const activeSlides = filters.version === 'v3' ? slidesV3 : filters.version === 'v2' ? slidesV2 : slides;

    const slidesRows: FunnelSlideRow[] = activeSlides.map((s, i) => {
      // Tracking sends slide = currentStep (0-indexed). Direct mapping.
      const count = perSlide[i] ?? 0;
      const prev = i > 0 ? (perSlide[i - 1] ?? 0) : totalStarts;
      const pctVsStart = totalStarts > 0 ? (count / totalStarts) * 100 : 0;
      const pctVsPrevious = prev > 0 ? (count / prev) * 100 : 0;
      return {
        index: i,
        id: s.id,
        type: s.type,
        count,
        pctVsStart,
        pctVsPrevious,
        dropFromPrevious: prev > 0 ? 100 - pctVsPrevious : 0,
      };
    });

    const utmBreakdown: UTMBreakdownRow[] = Object.entries(utmMap)
      .map(([key, data]) => {
        const [source, medium, campaign, content] = key.split('|');
        return {
          source,
          medium,
          campaign,
          content,
          ...data,
          cvr: data.starts > 0 ? (data.purchases / data.starts) * 100 : 0,
        };
      })
      .sort((a, b) => b.starts - a.starts);

    return {
      slides: slidesRows,
      totalLandingViews: landingViews,
      totalStarts,
      totalCompletes: viewContent,
      totalCheckoutClicks: checkoutClicks > 0 ? checkoutClicks : null,
      totalSales: purchase > 0 ? purchase : null,
      filters,
      totalEvents,
      generatedAt: Date.now(),
      backend: 'supabase',
      utmBreakdown,
    };
  }
}
