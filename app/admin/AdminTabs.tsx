'use client';

/**
 * AdminTabs — navegación del panel admin (dark).
 *
 * Marca el tab activo según el `pathname`. "Resumen" (/admin) matchea solo
 * exacto; el resto matchea también sus subrutas.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SquaresFour, Funnel, UsersThree, CurrencyDollar } from '@phosphor-icons/react';
import { RangePicker } from '@/components/admin/RangePicker';
import { DEFAULT_RANGE, isRangePreset } from '@/lib/admin/range';

const TABS: ReadonlyArray<{ href: string; label: string; icon: typeof SquaresFour; exact?: boolean }> = [
  { href: '/admin', label: 'Resumen', icon: SquaresFour, exact: true },
  { href: '/admin/funnel', label: 'Embudo', icon: Funnel },
  { href: '/admin/leads', label: 'Leads', icon: UsersThree },
  { href: '/admin/ventas', label: 'Ventas', icon: CurrencyDollar },
];

export function AdminTabs() {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const raw = searchParams.get('range');
  const range = isRangePreset(raw) ? raw : DEFAULT_RANGE;

  return (
    <div className="flex items-center gap-2">
      {/* Selector global de período — a la izquierda de los tabs. */}
      <RangePicker />
      <nav className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 text-sm">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={`${tab.href}?range=${range}`}
              aria-current={active ? 'page' : undefined}
              className={
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-colors ' +
                (active
                  ? 'bg-white/[0.08] text-neutral-50 shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200')
              }
            >
              <Icon size={16} weight={active ? 'fill' : 'regular'} />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
