/**
 * Estado de completitud del onboarding PWA.
 *
 * Hoy se persiste en localStorage del device. Eso significa que si el usuario
 * abre la PWA desde otro dispositivo o limpia storage, vuelve a ver el
 * onboarding. Es aceptable como tradeoff para el lanzamiento; cuando hagamos
 * el "plan correcto" con tabla `profiles` en Supabase, esta flag pasa a vivir
 * server-side y queda atada al email.
 *
 * Por qué un flag dedicado y no derivado de "tiene preferencias dietéticas":
 *  - Las preferencias dietéticas son OPCIONALES (todas en false es un estado
 *    válido, significa "sin restricciones"). No se puede usar como señal de
 *    "completó onboarding".
 *  - El flag explícito es 1 byte de localStorage y elimina ambigüedad.
 */

const ONBOARDING_DONE_KEY = 'pwa_onboarding_completed';

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ONBOARDING_DONE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_DONE_KEY, 'true');
  } catch {
    /* noop: si localStorage está bloqueado el usuario va a re-ver el onboarding,
       no es un error fatal */
  }
}

/**
 * Para usar en QA / debug: borra la flag y permite re-ver el onboarding
 * sin tener que limpiar todo el storage.
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ONBOARDING_DONE_KEY);
  } catch {
    /* noop */
  }
}
