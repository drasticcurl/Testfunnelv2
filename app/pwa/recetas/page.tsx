'use client';

import { useState, useMemo, useEffect } from 'react';
import { recipes, Moment } from '@/lib/pwa/recipes-data';
import { isTestMode } from '@/lib/pwa/test-mode';
import {
  getDietaryPreferences,
  DietaryPreferences,
  passesDietaryFilter,
  getActivePreferenceLabels,
} from '@/lib/pwa/dietary-preferences';
import RecipeCard from '@/components/pwa/recetas/RecipeCard';
import MomentFilter from '@/components/pwa/recetas/MomentFilter';

const BATCH_SIZE = 8;

type FilterValue = Moment | 'todas' | 'express';

export default function RecetasPage() {
  const [filter, setFilter] = useState<FilterValue>('todas');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreferences>({
    sin_gluten: false,
    sin_lactosa: false,
    vegetariano: false,
  });

  const testMode = isTestMode();

  useEffect(() => {
    setDietaryPrefs(getDietaryPreferences());
  }, []);

  const activeLabels = getActivePreferenceLabels(dietaryPrefs);
  const hasActiveDietary = activeLabels.length > 0;

  const filtered = useMemo(() => {
    let result = recipes;

    // Apply moment/express filter
    if (filter === 'express') {
      result = result.filter((r) => r.isExpress);
    } else if (filter !== 'todas') {
      result = result.filter((r) => r.moment === filter);
    }

    // Apply dietary filters
    if (hasActiveDietary) {
      result = result.filter((r) =>
        passesDietaryFilter(r.dietaryTags, dietaryPrefs)
      );
    }

    return result;
  }, [filter, dietaryPrefs, hasActiveDietary]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  const handleFilterChange = (value: FilterValue) => {
    setFilter(value);
    setVisibleCount(BATCH_SIZE);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-serif text-2xl text-charcoal font-semibold">
          Tus recetas
        </h1>
        <p className="text-sm text-charcoal/60 mt-1">
          {filtered.length} recetas del protocolo para cada momento del día
        </p>
      </div>

      {/* Active dietary badges */}
      {hasActiveDietary && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {activeLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-sage-soft text-sage px-2.5 py-1 rounded-full"
            >
              ✓ {label}
            </span>
          ))}
          <a
            href="/pwa/preferencias"
            className="inline-flex items-center text-[11px] text-charcoal/50 hover:text-sage px-2 py-1 underline"
          >
            Cambiar
          </a>
        </div>
      )}

      {/* Filter pills */}
      <div className="mb-4">
        <MomentFilter selected={filter} onChange={handleFilterChange} />
      </div>

      {/* Grid 2x2 mobile, 3 cols desktop */}
      <div className="px-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {visible.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isLocked={recipe.isExtra && !testMode}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-6 px-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-sage-soft text-sage font-medium text-sm rounded-full hover:bg-sage/20 transition-colors"
          >
            Cargar más recetas
          </button>
        </div>
      )}

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="text-center py-12 px-4">
          <span className="text-4xl block mb-3">🍽️</span>
          <p className="text-charcoal/60 text-sm">
            No hay recetas para este filtro.
          </p>
          {hasActiveDietary && (
            <a
              href="/pwa/preferencias"
              className="text-sage text-sm font-medium mt-2 inline-block hover:underline"
            >
              Ajustá tus preferencias dietéticas
            </a>
          )}
        </div>
      )}
    </div>
  );
}
