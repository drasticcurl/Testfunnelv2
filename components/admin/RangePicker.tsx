'use client';

/**
 * RangePicker — selector GLOBAL de período del dashboard admin.
 *
 * Vive en la barra de tabs (a la izquierda de "Resumen"). Escribe el preset
 * elegido en el query param `?range=` de la URL, así el período persiste al
 * navegar entre tabs y cada vista (Resumen, Ventas, Embudo, Leads) lo lee y
 * filtra sus datos por ese rango.
 */

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarBlank } from '@phosphor-icons/react';
import {
  RANGE_OPTIONS,
  DEFAULT_RANGE,
  isRangePreset,
  type RangePreset,
} from '@/lib/admin/range';

export function RangePicker() {
  const router = useRouter();
  const pathname = usePathname() ?? '/admin';
  const searchParams = useSearchParams();

  const raw = searchParams.get('range');
  const current: RangePreset = isRangePreset(raw) ? raw : DEFAULT_RANGE;

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const params = new URLSearchParams(searchParams.toString());
      params.set('range', value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="relative inline-flex items-center" title="Período del dashboard">
      <CalendarBlank
        size={15}
        weight="bold"
        className="pointer-events-none absolute left-2.5 text-emerald-400"
      />
      <select
        value={current}
        onChange={onChange}
        aria-label="Período del dashboard"
        className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-7 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.07] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      >
        {RANGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#13131a] text-neutral-200">
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-neutral-500">▾</span>
    </div>
  );
}
