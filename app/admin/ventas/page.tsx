/**
 * /admin/ventas — KPIs de revenue real con filtro multi-source.
 *
 * Server component: chequea auth y delega el render al client component.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { RevenueView } from './RevenueView';

export const dynamic = 'force-dynamic';

export default function VentasPage() {
  if (!isAdminAuthenticated(cookies())) {
    redirect('/admin');
  }
  return <RevenueView />;
}
