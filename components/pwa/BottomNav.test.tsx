// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — BottomNav DOM tests (Task 16.1).
 *
 * Example/DOM tests (not property-based) verifying the navigation chrome
 * behavior the design requires:
 *  - The active tab is rendered with TWO distinguishing cues — terracotta token
 *    color AND a non-color cue (top indicator bar + bolder label) (Req 6.3).
 *  - The active tab communicates its state to assistive technology via
 *    `aria-current="page"` (Req 6.4).
 *  - At most one tab is active at any time (Req 6.5).
 *  - When the route matches no tab, all tabs render non-active (Req 6.6).
 *
 * Strategy: mock `next/navigation`'s `usePathname` per test and stub
 * `isVipUnlocked` so the tab set is deterministic (5 base tabs).
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mutable pathname driven per-test.
let mockPathname = '/pwa/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Keep the VIP tab hidden so the base 5-tab set is deterministic.
vi.mock('@/lib/pwa/vip-access', () => ({
  isVipUnlocked: () => false,
}));

import BottomNav from './BottomNav';

afterEach(cleanup);
beforeEach(() => {
  mockPathname = '/pwa/dashboard';
});

/** The single anchor carrying aria-current="page", or null. */
function activeLink(): HTMLElement | null {
  return document.querySelector('a[aria-current="page"]');
}

describe('BottomNav active rendering', () => {
  it('marks the matching tab active with aria-current="page" (Req 6.4)', () => {
    mockPathname = '/pwa/diario';
    render(<BottomNav />);
    const active = activeLink();
    expect(active).not.toBeNull();
    expect(active).toHaveTextContent('Diario');
  });

  it('renders the active tab with two cues: terracotta color + non-color cues (Req 6.3)', () => {
    mockPathname = '/pwa/diario';
    render(<BottomNav />);
    const active = activeLink() as HTMLElement;

    // Cue #1 (color): terracotta token color on the active link.
    expect(active.className).toContain('text-terracotta');

    // Cue #2 (non-color): a bolder label weight than non-active tabs.
    const label = Array.from(active.querySelectorAll('span')).find((s) =>
      s.textContent === 'Diario',
    ) as HTMLElement;
    expect(label.className).toContain('font-bold');

    // Cue #3 (non-color): a visible top indicator bar (opacity-100).
    const indicator = active.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(indicator.className).toContain('opacity-100');
    expect(indicator.className).toContain('bg-terracotta');
  });

  it('renders non-active tabs in the muted style without aria-current', () => {
    mockPathname = '/pwa/diario';
    render(<BottomNav />);
    const links = screen.getAllByRole('link');
    const inactive = links.filter((l) => l.getAttribute('aria-current') === null);
    expect(inactive.length).toBeGreaterThan(0);
    inactive.forEach((l) => {
      expect(l.className).toContain('text-muted');
      expect(l.getAttribute('aria-current')).toBeNull();
    });
  });

  it('renders at most one active tab (Req 6.5)', () => {
    mockPathname = '/pwa/recetas';
    render(<BottomNav />);
    const actives = document.querySelectorAll('a[aria-current="page"]');
    expect(actives.length).toBe(1);
  });

  it('renders no active tab when the route matches no nav item (Req 6.6)', () => {
    mockPathname = '/pwa/calculadora';
    render(<BottomNav />);
    expect(activeLink()).toBeNull();
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(5);
    links.forEach((l) => expect(l.getAttribute('aria-current')).toBeNull());
  });
});
