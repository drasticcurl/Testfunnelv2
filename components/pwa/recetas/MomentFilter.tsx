'use client';

import { Moment } from '@/lib/pwa/recipes-data';

type FilterValue = Moment | 'todas' | 'express';

type FilterOption = {
  label: string;
  value: FilterValue;
};

const filters: FilterOption[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Express ⚡', value: 'express' },
  { label: '🌅 Desayuno', value: 'desayuno' },
  { label: '🥗 Almuerzo', value: 'almuerzo' },
  { label: '🌙 Cena', value: 'cena' },
  { label: '🍎 Snack', value: 'snack' },
];

interface MomentFilterProps {
  selected: FilterValue;
  onChange: (value: FilterValue) => void;
}

export default function MomentFilter({ selected, onChange }: MomentFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === filter.value
              ? 'bg-sage text-white shadow-sm'
              : 'bg-sage-soft text-charcoal/70 hover:bg-sage/20'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
