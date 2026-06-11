'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Meal } from '@/lib/pwa/plan-data';
import type { DietaryPreferences } from '@/lib/pwa/dietary-preferences';
import { passesDietaryFilter } from '@/lib/pwa/dietary-preferences';
import { computeMealDietaryTags, computeMealDietaryTagsFromText } from '@/lib/pwa/dietary-tags-helper';

interface MealCardProps {
  meal: Meal;
  dietaryPrefs?: DietaryPreferences;
}

export default function MealCard({ meal, dietaryPrefs }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute dietary compatibility
  const mealTags = meal.ingredients && meal.ingredients.length > 0
    ? computeMealDietaryTags(meal.ingredients)
    : computeMealDietaryTagsFromText(meal.name, meal.description);

  const hasActivePrefs = dietaryPrefs && (
    dietaryPrefs.sin_gluten || dietaryPrefs.sin_lactosa || dietaryPrefs.vegetariano
  );

  const passesFilter = !hasActivePrefs || passesDietaryFilter(mealTags, dietaryPrefs!);

  // Determine which specific restrictions it fails
  const failedRestrictions: string[] = [];
  if (hasActivePrefs && !passesFilter) {
    if (dietaryPrefs!.sin_gluten && !mealTags.isGlutenFree) failedRestrictions.push('gluten');
    if (dietaryPrefs!.sin_lactosa && !mealTags.isDairyFree) failedRestrictions.push('lactosa');
    if (dietaryPrefs!.vegetariano && !mealTags.isVegetarian) failedRestrictions.push('carne/pescado');
  }

  return (
    <div
      className={`bg-white rounded-[16px] border shadow-sm overflow-hidden cursor-pointer transition-shadow duration-200 hover:shadow-md ${
        !passesFilter ? 'border-coral/30 bg-coral-soft/20' : 'border-gray-100'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header - always visible */}
      <div className="p-4 flex items-center gap-3">
        <span className="text-2xl flex-shrink-0">{meal.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {meal.moment}
            </span>
            <span className="text-xs text-sage font-medium">
              ⏱️ {meal.time}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-charcoal mt-0.5 truncate">
            {meal.name}
          </h4>
          {!passesFilter && (
            <p className="text-[10px] text-coral font-medium mt-0.5">
              ⚠️ Contiene {failedRestrictions.join(', ')} — ver alternativa abajo
            </p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 flex-shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-50 pt-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                {meal.description}
              </p>
              {meal.ingredients && meal.ingredients.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-charcoal mb-1.5">
                    Ingredientes:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.ingredients.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-sage-soft text-sage px-2 py-0.5 rounded-full"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Dietary alternative suggestion */}
              {!passesFilter && (
                <div className="mt-3 p-3 bg-sage-soft/50 rounded-xl border border-sage/10">
                  <p className="text-xs font-semibold text-sage mb-1">
                    💡 Alternativa sugerida:
                  </p>
                  <p className="text-xs text-charcoal/70 leading-relaxed">
                    {getAlternativeSuggestion(failedRestrictions, meal.moment)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Generates alternative meal suggestions based on restrictions
function getAlternativeSuggestion(restrictions: string[], moment: string): string {
  const suggestions: Record<string, Record<string, string>> = {
    gluten: {
      Desayuno: 'Reemplazá pan/avena por tostadas de arroz, pancakes de banana+huevo, o bowl de frutas con chía.',
      Almuerzo: 'Usá wraps de lechuga, quinoa o arroz integral como base en lugar de pan o pasta.',
      Cena: 'Optá por sopas, verduras asadas con proteína, o zoodles (fideos de zapallito).',
      'Snack mañana': 'Frutas con frutos secos, o hummus con bastones de zanahoria.',
      'Snack tarde': 'Frutas con frutos secos, chips de batata, o yogur con semillas.',
    },
    lactosa: {
      Desayuno: 'Usá yogur de coco, kéfir de agua, o leche de almendras en lugar de lácteos.',
      Almuerzo: 'Reemplazá queso por palta, hummus o tahini como cremosidad.',
      Cena: 'Usá leche de coco para cremas y evitá quesos. Tahini funciona como aderezo.',
      'Snack mañana': 'Frutas con frutos secos o smoothie con leche vegetal.',
      'Snack tarde': 'Frutas con frutos secos o smoothie con leche vegetal.',
    },
    'carne/pescado': {
      Desayuno: 'Ya la mayoría son vegetarianos — mantené yogur, frutas y avena.',
      Almuerzo: 'Reemplazá proteína animal por tofu, tempeh, legumbres o huevo.',
      Cena: 'Sustituí por tofu firme salteado, huevos, o legumbres con verduras.',
      'Snack mañana': 'Frutos secos, hummus o frutas.',
      'Snack tarde': 'Frutos secos, hummus o frutas.',
    },
  };

  const parts = restrictions.map((r) => {
    const category = suggestions[r];
    if (!category) return '';
    return category[moment] || category['Almuerzo'] || '';
  });

  return parts.filter(Boolean).join(' ');
}
