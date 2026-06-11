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
import { getArgentinaDay } from '@/lib/admin/day';
import { FunnelView } from './FunnelView';

export const dynamic = 'force-dynamic';

export default async function FunnelPage() {
  if (!isAdminAuthenticated(cookies())) {
    redirect('/admin');
  }

  // Primer render = embudo de HOY (GMT-3). La UI permite cambiar de día.
  const initialData = await getStore().getFunnel({ day: getArgentinaDay() });

  return <FunnelView initialData={initialData} />;
}
