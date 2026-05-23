/**
 * PWA Test Mode — bypasses Supabase auth for local development.
 * 
 * When NEXT_PUBLIC_PWA_TEST_MODE=true:
 * - Login always succeeds (any email works)
 * - getUserTier() returns full access (front + bump + upsell)
 * - No real Supabase connection needed
 * 
 * Test email: test@protocolo.com (or any email in test mode)
 */

export const TEST_USER = {
  id: 'test-00000000-0000-0000-0000-000000000001',
  email: 'test@protocolo.com',
  nombre: 'María',
  onboarding_completed: true,
  quiz_data: {
    tipo: 3,
    severidad: 7,
    nombre: 'María',
    edad: '35_44',
    momento: 'tarde_noche',
    tiempo: '6m_2a',
    frecuencia: 'diaria',
    emocion: 'frustrada',
    sintomas: ['gases', 'distension', 'pesadez'],
    probo: ['dietas', 'infusiones'],
  },
};

export function isTestMode(): boolean {
  // Explicit test mode
  if (process.env.NEXT_PUBLIC_PWA_TEST_MODE === 'true') return true;
  // Auto test mode: if Supabase is not configured, assume test
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return true;
  return false;
}
