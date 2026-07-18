import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { isAuthRoute, AUTH_ROUTES } from './routes';

/**
 * Feature: pwa-visual-improvements — auth-route classifier pure module.
 */

/** Non-auth PWA route segments (none collide with the auth base names). */
const NON_AUTH_SEGMENTS = [
  'dashboard',
  'diario',
  'plan',
  'recetas',
  'guias',
  'vip',
  'calculadora',
  'onboarding',
  'preferencias',
  'progreso',
  'kit-express',
  'lista-compras',
];

/** Arbitrary trailing sub-path like "" or "/nuevo" or "/a/b". */
const subPathArb = fc
  .array(
    fc
      .string({ minLength: 1, maxLength: 6 })
      .map((s) => s.replace(/[^a-zA-Z0-9]/g, 'x'))
      .filter((s) => s.length > 0),
    { minLength: 0, maxLength: 3 },
  )
  .map((parts) => (parts.length ? '/' + parts.join('/') : ''));

describe('isAuthRoute', () => {
  // Feature: pwa-visual-improvements, Property 6: Auth routes omit chrome; non-auth PWA routes include it
  // Validates: Requirements 6.8
  it('Property 6: auth routes and sub-paths classify as auth; other PWA routes do not', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...AUTH_ROUTES),
        subPathArb,
        (base, sub) => {
          // Any auth base route or descendant is an auth route.
          expect(isAuthRoute(base + sub)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );

    fc.assert(
      fc.property(
        fc.constantFrom(...NON_AUTH_SEGMENTS),
        subPathArb,
        (segment, sub) => {
          // Any other /pwa/* route is non-auth (chrome present).
          expect(isAuthRoute('/pwa/' + segment + sub)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('classifies exact auth base routes as auth', () => {
    expect(isAuthRoute('/pwa/login')).toBe(true);
    expect(isAuthRoute('/pwa/registro')).toBe(true);
    expect(isAuthRoute('/pwa/recuperar')).toBe(true);
    expect(isAuthRoute('/pwa/reset')).toBe(true);
  });

  it('respects segment boundaries (sibling prefixes are not auth)', () => {
    expect(isAuthRoute('/pwa/loginx')).toBe(false);
    expect(isAuthRoute('/pwa/resetting')).toBe(false);
  });

  it('classifies the dashboard and other screens as non-auth', () => {
    expect(isAuthRoute('/pwa/dashboard')).toBe(false);
    expect(isAuthRoute('/pwa/diario/nuevo')).toBe(false);
  });
});
