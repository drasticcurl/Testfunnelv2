/**
 * /admin/leads — KPIs + export CSV de leads del quiz.
 *
 * Server component: chequea auth y delega el render al client component.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { LeadsView } from './LeadsView';

export const dynamic = 'force-dynamic';

export default function LeadsPage() {
  if (!isAdminAuthenticated(cookies())) {
    redirect('/admin');
  }
  return <LeadsView />;
}
