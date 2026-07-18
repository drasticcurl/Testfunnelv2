import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { resolveActiveNav, BOTTOM_NAV_TABS, type NavTab } from './nav';

/**
 * Feature: pwa-visual-improvements — active-navigation resolver pure module.
 */

/** Arbitrary path segment (no slashes, non-empty). */
const segment = fc
  .string({ minLength: 1, maxLength: 8 })
  .map((s) => s.replace(/[^a-zA-Z0-9]/g, 'x'))
  .filter((s) => s.length > 0);

/** Arbitrary `/pwa/...`-style pathname. */
const pathnameArb = fc
  .array(segment, { minLength: 1, maxLength: 4 })
  .map((parts) => '/' + parts.join('/'));

/** Arbitrary tab list, possibly with nested/duplicate hrefs. */
const tabsArb = fc
  .array(
    fc.array(segment, { minLength: 1, maxLength: 3 }).map(
      (parts): NavTab => ({
        href: '/' + parts.join('/'),
        label: parts.join(' '),
        iconName: 'home',
      }),
    ),
    { minLength: 0, maxLength: 6 },
  );

describe('resolveActiveNav', () => {
  // Feature: pwa-visual-improvements, Property 5: At most one navigation item is active, and none when no route matches
  // Validates: Requirements 6.5, 6.6
  it('Property 5: returns exactly one active index (longest match) or -1 when none match', () => {
    fc.assert(
      fc.property(pathnameArb, tabsArb, (pathname, tabs) => {
        const idx = resolveActiveNav(pathname, tabs);

        // Determine which tabs actually match the pathname.
        const matching = tabs
          .map((t, i) => ({ i, href: t.href }))
          .filter(
            ({ href }) =>
              pathname === href || pathname.startsWith(href + '/'),
          );

        if (matching.length === 0) {
          // No match -> -1 (all items non-active).
          expect(idx).toBe(-1);
        } else {
          // A valid index is returned.
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(tabs.length);
          // The returned tab is itself a match.
          expect(matching.some((m) => m.i === idx)).toBe(true);
          // The returned href is a longest (most-specific) match.
          const maxLen = Math.max(...matching.map((m) => m.href.length));
          expect(tabs[idx].href.length).toBe(maxLen);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('matches exact and descendant paths but respects segment boundaries', () => {
    expect(resolveActiveNav('/pwa/plan', BOTTOM_NAV_TABS)).toBe(1);
    // Descendant path of /pwa/diario.
    expect(resolveActiveNav('/pwa/diario/nuevo', BOTTOM_NAV_TABS)).toBe(2);
    // Not a real tab -> none active.
    expect(resolveActiveNav('/pwa/preferencias', BOTTOM_NAV_TABS)).toBe(-1);
    // Boundary: a sibling that merely shares a prefix must not match.
    expect(
      resolveActiveNav('/pwa/planificador', BOTTOM_NAV_TABS),
    ).toBe(-1);
  });

  it('picks the longest href when nested hrefs both match', () => {
    const tabs: NavTab[] = [
      { href: '/pwa', label: 'Root', iconName: 'home' },
      { href: '/pwa/diario', label: 'Diario', iconName: 'diary' },
    ];
    expect(resolveActiveNav('/pwa/diario/nuevo', tabs)).toBe(1);
  });
});
