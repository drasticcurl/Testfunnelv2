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

/**
 * Key dedicada para el consentimiento del disclaimer médico.
 *
 * Se persiste por separado del flag de onboarding para dejar constancia
 * explícita de que la usuaria aceptó el aviso médico, independientemente
 * de si completó (o no) el resto del flujo.
 */
const MEDICAL_DISCLAIMER_KEY = 'pwa_medical_disclaimer_accepted';

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
 * Persiste el consentimiento del disclaimer médico. Se invoca al avanzar
 * desde el paso de disclaimer en el onboarding.
 */
export function markMedicalDisclaimerAccepted(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEDICAL_DISCLAIMER_KEY, 'true');
  } catch {
    /* noop: si localStorage está bloqueado, el consentimiento se re-pedirá */
  }
}

export function isMedicalDisclaimerAccepted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MEDICAL_DISCLAIMER_KEY) === 'true';
  } catch {
    return false;
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
    localStorage.removeItem(MEDICAL_DISCLAIMER_KEY);
  } catch {
    /* noop */
  }
}
