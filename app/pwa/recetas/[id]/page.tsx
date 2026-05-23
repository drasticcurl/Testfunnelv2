'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getRecipeById } from '@/lib/pwa/recipes-data';
import { isTestMode } from '@/lib/pwa/test-mode';

const FAVORITES_KEY = 'pwa-recipe-favorites';

function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function toggleFavorite(id: string): string[] {
  const current = getFavorites();
  const index = current.indexOf(id);
  if (index >= 0) {
    current.splice(index, 1);
  } else {
    current.push(id);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
  return current;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const recipe = getRecipeById(id);
  const testMode = isTestMode();

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs = getFavorites();
    setIsFav(favs.includes(id));
  }, [id]);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <span className="text-4xl mb-3">🍽️</span>
        <p className="text-charcoal/60 text-sm mb-4">Receta no encontrada.</p>
        <button
          onClick={() => router.push('/pwa/recetas')}
          className="text-sage font-medium text-sm underline"
        >
          Volver a recetas
        </button>
      </div>
    );
  }

  // Lock extra recipes in prod without bump
  if (recipe.isExtra && !testMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <span className="text-5xl mb-3">🔒</span>
        <h2 className="font-serif text-xl text-charcoal font-semibold mb-2">
          Receta del Recetario Extra
        </h2>
        <p className="text-charcoal/60 text-sm mb-4">
          Desbloqueá las 25 recetas extra con el Recetario Anti-Inflamatorio.
        </p>
        <button
          onClick={() => router.push('/pwa/recetas')}
          className="text-sage font-medium text-sm underline"
        >
          Volver a recetas
        </button>
      </div>
    );
  }

  const handleFavorite = () => {
    const updated = toggleFavorite(id);
    setIsFav(updated.includes(id));
  };

  const momentLabels: Record<string, string> = {
    desayuno: '🌅 Desayuno',
    almuerzo: '🥗 Almuerzo',
    cena: '🌙 Cena',
    snack: '🍎 Snack',
  };

  return (
    <div className="pb-24">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="text-sage text-sm font-medium flex items-center gap-1"
        >
          ← Volver
        </button>
      </div>

      {/* Hero placeholder */}
      <div className="mx-4 mt-3 aspect-video bg-sage-soft rounded-xl flex items-center justify-center">
        <span className="text-6xl">{recipe.imageSlot}</span>
      </div>

      {/* Title */}
      <div className="px-4 mt-4">
        <h1 className="font-serif text-2xl text-charcoal font-semibold leading-tight">
          {recipe.name}
        </h1>
      </div>

      {/* Badges */}
      <div className="px-4 mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-xs bg-sage-soft text-sage px-3 py-1 rounded-full font-medium">
          ⏱️ {recipe.time}
        </span>
        <span className="inline-flex items-center gap-1 text-xs bg-sage-soft text-sage px-3 py-1 rounded-full font-medium">
          📊 {recipe.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 text-xs bg-sage-soft text-sage px-3 py-1 rounded-full font-medium">
          {momentLabels[recipe.moment]}
        </span>
      </div>

      {/* Favorite button */}
      <div className="px-4 mt-4">
        <button
          onClick={handleFavorite}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
            isFav
              ? 'bg-coral/10 text-coral border border-coral/30'
              : 'bg-sage-soft text-charcoal/70 border border-transparent'
          }`}
        >
          <span className="text-lg">{isFav ? '❤️' : '🤍'}</span>
          {isFav ? 'Guardada en favoritos' : 'Guardar en favoritos'}
        </button>
      </div>

      {/* Ingredients */}
      <div className="px-4 mt-6">
        <h2 className="font-serif text-lg text-charcoal font-semibold mb-3">
          Ingredientes
        </h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-charcoal/80"
            >
              <span className="text-sage mt-0.5 flex-shrink-0">•</span>
              <span>{ing}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="px-4 mt-6">
        <h2 className="font-serif text-lg text-charcoal font-semibold mb-3">
          Preparación
        </h2>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-charcoal/80">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage text-white text-xs flex items-center justify-center font-semibold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tip */}
      <div className="px-4 mt-6">
        <div className="bg-coral-soft/40 border border-coral-soft rounded-xl p-4">
          <p className="text-sm text-charcoal/80">
            <span className="font-semibold text-coral">💡 Tip antiinflamatorio: </span>
            {recipe.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
