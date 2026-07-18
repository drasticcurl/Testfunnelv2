'use client';

import Link from 'next/link';
import { Recipe } from '@/lib/pwa/recipes-data';
import LockedOverlay from './LockedOverlay';

interface RecipeCardProps {
  recipe: Recipe;
  isLocked: boolean;
}

export default function RecipeCard({ recipe, isLocked }: RecipeCardProps) {
  const content = (
    <div className="relative aspect-square bg-terracotta-soft rounded-lg shadow-sm overflow-hidden flex flex-col items-center justify-center p-3 transition-transform duration-fast ease-standard hover:scale-[1.02]">
      {isLocked && <LockedOverlay />}
      {recipe.isExpress && (
        <span className="absolute top-1.5 right-1.5 font-body text-[10px] bg-terracotta-light/15 text-terracotta px-1.5 py-0.5 rounded-full font-medium z-[5]">
          ⚡
        </span>
      )}
      <span className="text-4xl mb-2">{recipe.imageSlot}</span>
      <h3 className="font-body text-xs font-semibold text-charcoal text-center leading-tight line-clamp-2 mb-1">
        {recipe.name}
      </h3>
      <span className="inline-flex items-center gap-1 font-body text-[10px] text-muted bg-warm/70 px-2 py-0.5 rounded-full">
        ⏱️ {recipe.time}
      </span>
    </div>
  );

  if (isLocked) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return (
    <Link href={`/pwa/recetas/${recipe.id}`}>
      {content}
    </Link>
  );
}
