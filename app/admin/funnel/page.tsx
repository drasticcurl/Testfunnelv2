/**
 * /admin/funnel — vista del embudo del quiz.
 *
 * - Server component: hace el guard de auth y el primer fetch al store.
 * - Client component <FunnelView /> renderiza chart + tabla y
 *   re-fetch via /api/admin/funnel-data cuando se hace refresh.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getStore } from '@/lib/admin/store';
import { resolveRangeFromParam } from '@/lib/admin/range';
import { FunnelView } from './FunnelView';

export const dynamic = 'force-dynamic';

export default async function FunnelPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  if (!isAdminAuthenticated(cookies())) {
    redirect('/admin');
  }

  // Primer render = embudo del período de la URL (`?range=`, default hoy, GMT-3).
  const rangeParam = typeof searchParams?.range === 'string' ? searchParams.range : null;
  const range = resolveRangeFromParam(rangeParam);
  const initialData = await getStore().getFunnel({ from: range.fromDay, to: range.toDay });

  return <FunnelView initialData={initialData} />;
}
