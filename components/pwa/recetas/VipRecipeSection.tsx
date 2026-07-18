'use client';

/**
 * VipRecipeSection — sección extra de recetas premium dentro de /pwa/recetas.
 *
 * Es "el mismo recetario, con más recetas": se muestra como una sección
 * adicional al final de la página de recetas, SOLO si el dispositivo desbloqueó
 * el VIP (isVipUnlocked). Las recetas viven en lib/pwa/vip-recipes.ts.
 *
 * Cada receta se muestra colapsada (nombre + tiempo) y se expande al tocar,
 * para no alargar la página de golpe.
 */

import { useEffect, useState } from 'react';
import { isVipUnlocked } from '@/lib/pwa/vip-access';
import { VIP_RECIPES, type VipRecipe } from '@/lib/pwa/vip-recipes';

function PremiumRecipeCard({ recipe }: { recipe: VipRecipe }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-warm rounded-lg shadow-sm border border-warm-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div className="w-11 h-11 rounded-md bg-terracotta-soft flex items-center justify-center flex-shrink-0">
          <span className="text-xl" aria-hidden="true">{recipe.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-body font-semibold text-charcoal text-[14px] leading-snug">{recipe.name}</h3>
          <p className="font-body text-muted text-xs mt-0.5">⏱️ {recipe.time}</p>
        </div>
        <span className={`text-muted-light text-lg transition-transform duration-fast ease-standard ${open ? 'rotate-90' : ''}`} aria-hidden="true">
          →
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 -mt-1">
          <div className="mb-3">
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-light font-medium mb-1.5">
              Ingredientes
            </p>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-[13px] text-muted leading-relaxed">
                  <span className="text-terracotta mt-0.5 flex-shrink-0">•</span>
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-3">
            <p className="font-body text-[11px] uppercase tracking-wider text-muted-light font-medium mb-1.5">
              Preparación
            </p>
            <ol className="space-y-1.5">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-[13px] text-muted leading-relaxed">
                  <span className="text-terracotta font-semibold flex-shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-md bg-terracotta-soft border border-warm-border p-3">
            <p className="font-body text-[12px] text-muted leading-relaxed">
              <span className="font-semibold">💡 Tip:</span> {recipe.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VipRecipeSection() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    setUnlocked(isVipUnlocked());
  }, []);

  if (!unlocked) return null;

  return (
    <section id="premium" className="px-4 mt-8">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-warm px-2.5 py-1 rounded-full"
          style={{ background: 'linear-gradient(135deg, #C9A227, #E8B923)' }}
        >
          👑 Premium VIP
        </span>
      </div>
      <h2 className="font-heading text-xl text-charcoal font-semibold">Recetario premium</h2>
      <p className="font-body text-sm text-muted mt-1 mb-4">
        {VIP_RECIPES.length} recetas extra de tu Acceso VIP: postres que no inflan y platos premium.
      </p>
      <div className="space-y-3">
        {VIP_RECIPES.map((r) => (
          <PremiumRecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </section>
  );
}
