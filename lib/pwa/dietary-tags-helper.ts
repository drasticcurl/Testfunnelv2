// lib/pwa/dietary-tags-helper.ts
// Helper para determinar tags dietéticas en runtime para meals del plan
// Las recetas ya tienen dietaryTags estáticas, pero las meals del plan
// se evalúan dinámicamente basándose en sus ingredientes.

import type { DietaryTags } from './dietary-preferences';

const GLUTEN_INDICATORS = [
  'pan de centeno', 'avena', 'pan ', 'tostada', 'tortilla de trigo',
  'pan integral', 'centeno', 'trigo',
];

const DAIRY_INDICATORS = [
  'yogur', 'kéfir', 'queso', 'leche ', 'mantequilla', 'crema de leche',
  'ricota', 'mozzarella',
];

const MEAT_INDICATORS = [
  'salmón', 'pollo', 'pechuga', 'pescado', 'merluza', 'tilapia',
  'lenguado', 'pavo', 'carne', 'corvina', 'atún', 'cerdo', 'res',
  'camarón', 'langostino',
];

export function computeMealDietaryTags(ingredients: string[]): DietaryTags {
  const text = ingredients.join(' ').toLowerCase();

  const isGlutenFree = !GLUTEN_INDICATORS.some((g) => text.includes(g));
  const isDairyFree = !DAIRY_INDICATORS.some((d) => text.includes(d));
  const isVegetarian = !MEAT_INDICATORS.some((m) => text.includes(m));

  return { isGlutenFree, isDairyFree, isVegetarian };
}

// For meals that don't have explicit ingredients, infer from name/description
export function computeMealDietaryTagsFromText(name: string, description: string): DietaryTags {
  const text = (name + ' ' + description).toLowerCase();

  const isGlutenFree = !GLUTEN_INDICATORS.some((g) => text.includes(g));
  const isDairyFree = !DAIRY_INDICATORS.some((d) => text.includes(d));
  const isVegetarian = !MEAT_INDICATORS.some((m) => text.includes(m));

  return { isGlutenFree, isDairyFree, isVegetarian };
}
