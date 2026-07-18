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
import VipRecipeSection from '@/components/pwa/recetas/VipRecipeSection';
import { Badge } from '@/components/pwa/ui/Badge';
import { Button } from '@/components/pwa/ui/Button';
import { EmptyState } from '@/components/pwa/ui/EmptyState';
import { computeStagger } from '@/lib/pwa/ui/motion';

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

  // Single consistent, capped inter-item entrance delay for the recipe grid.
  const cardDelays = computeStagger(visible.length);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  const handleFilterChange = (value: FilterValue) => {
    setFilter(value);
    setVisibleCount(BATCH_SIZE);
  };

  return (
    <div className="pb-24">
      {/* Header — page-title level (heading family, 30px, semibold). */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-heading text-3xl text-charcoal font-semibold">
          Tus recetas
        </h1>
        <p className="font-body text-sm text-muted mt-1">
          {filtered.length} recetas del protocolo para cada momento del día
        </p>
      </div>

      {/* Active dietary badges */}
      {hasActiveDietary && (
        <div className="px-4 pb-3 flex flex-wrap items-center gap-1.5">
          {activeLabels.map((label) => (
            <Badge key={label} tone="neutral">
              {label}
            </Badge>
          ))}
          <a
            href="/pwa/preferencias"
            className="inline-flex items-center font-body text-xs text-muted hover:text-terracotta px-2 py-1 underline"
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
        {visible.map((recipe, idx) => (
          <div
            key={recipe.id}
            className="animate-fade-in"
            style={{ animationDelay: `${cardDelays[idx]}ms` }}
          >
            <RecipeCard
              recipe={recipe}
              isLocked={recipe.isExtra && !testMode}
            />
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-6 px-4">
          <Button variant="outline" onClick={handleLoadMore}>
            Cargar más recetas
          </Button>
        </div>
      )}

      {/* Empty state */}
      {visible.length === 0 && (
        <EmptyState
          iconName="recipes"
          message={
            hasActiveDietary
              ? 'No hay recetas para este filtro con tus preferencias dietéticas.'
              : 'No hay recetas para este filtro.'
          }
          actionLabel="Ver todas las recetas"
          onAction={() => handleFilterChange('todas')}
        />
      )}

      {/* Sección extra: recetario premium VIP (solo si está desbloqueado) */}
      <VipRecipeSection />
    </div>
  );
}
