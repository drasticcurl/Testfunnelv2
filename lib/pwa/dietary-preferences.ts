// lib/pwa/dietary-preferences.ts
// Manejo de preferencias dietéticas del usuario (sin gluten, sin lactosa, vegetariano)

export type DietaryPreference = 'sin_gluten' | 'sin_lactosa' | 'vegetariano';

export interface DietaryPreferences {
  sin_gluten: boolean;
  sin_lactosa: boolean;
  vegetariano: boolean;
}

const STORAGE_KEY = 'pwa_dietary_preferences';

const DEFAULT_PREFERENCES: DietaryPreferences = {
  sin_gluten: false,
  sin_lactosa: false,
  vegetariano: false,
};

export function getDietaryPreferences(): DietaryPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveDietaryPreferences(prefs: DietaryPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function getActivePreferenceLabels(prefs: DietaryPreferences): string[] {
  const labels: string[] = [];
  if (prefs.sin_gluten) labels.push('Sin Gluten');
  if (prefs.sin_lactosa) labels.push('Sin Lactosa');
  if (prefs.vegetariano) labels.push('Vegetariano');
  return labels;
}

// Dietary tags for recipes and meals
export interface DietaryTags {
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isVegetarian: boolean;
}

// Checks if a recipe/meal passes the user's dietary filters
export function passesDietaryFilter(
  tags: DietaryTags,
  prefs: DietaryPreferences
): boolean {
  if (prefs.sin_gluten && !tags.isGlutenFree) return false;
  if (prefs.sin_lactosa && !tags.isDairyFree) return false;
  if (prefs.vegetariano && !tags.isVegetarian) return false;
  return true;
}
