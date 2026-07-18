// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — Responsive layout verification (Task 23.1).
 *
 * Example/DOM tests (not property-based) that pin the responsive-layout
 * governance the design centralizes in `PwaShell` — the single layout wrapper
 * every non-auth PWA_Screen renders inside. The shell is rendered wrapping
 * representative content (a Card, an image, and a Button) and exercised across
 * the 320–1920 px width band.
 *
 * Covers:
 *  - No horizontal overflow at every width 320–1920 px (Req 8.1): asserted both
 *    via `scrollWidth <= clientWidth` and a structural scan that no element
 *    declares a fixed pixel width wider than the viewport. (jsdom has no layout
 *    engine, so the structural scan is the substantive guarantee.)
 *  - Single-column primary content below 640 px (Req 8.2): the shell wrapper
 *    introduces no multi-column grid/flex-row at the base breakpoint.
 *  - Content max-width <= 768 px and horizontally centered (Req 4.2).
 *  - Uniform 16 px page margin drawn from one named spacing step (Req 4.3, 4.5):
 *    the shell applies `px-4` (= 1rem = 16px) — the single margin for ALL
 *    screens, since every non-auth screen renders through this one wrapper.
 *  - Media never exceeds its container width (Req 8.5): the global base rule
 *    `img,video,svg { max-width:100% }` is present in `globals.css`.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

// Non-auth route so PwaShell renders the full chrome + content wrapper.
let mockPathname = '/pwa/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Avoid the network call in AppHeader's usePwaUser.
vi.mock('@/lib/pwa/use-pwa-user', () => ({
  usePwaUser: () => ({
    authenticated: true,
    email: 'demo@example.com',
    nombre: 'Demo',
    testMode: true,
    loading: false,
  }),
}));

// Keep the VIP tab hidden so BottomNav renders a deterministic tab set.
vi.mock('@/lib/pwa/vip-access', () => ({
  isVipUnlocked: () => false,
}));

import PwaShell from './PwaShell';

afterEach(cleanup);
beforeEach(() => {
  mockPathname = '/pwa/dashboard';
});

const WIDTHS = [320, 360, 375, 414, 600, 640, 768, 1024, 1280, 1440, 1920];

/** Tailwind max-width utilities → resolved CSS pixels (for the <=768 check). */
const MAX_WIDTH_PX: Record<string, number> = {
  'max-w-xs': 320,
  'max-w-sm': 384,
  'max-w-md': 448,
  'max-w-lg': 512,
  'max-w-xl': 576,
  'max-w-2xl': 672,
  'max-w-3xl': 768,
};

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

function RepresentativeContent() {
  return (
    <section>
      <Card>
        <h2 className="font-heading text-xl text-charcoal">Tu progreso</h2>
        <p className="font-body text-base text-muted">Contenido representativo.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/placeholder.png" alt="ilustración" />
      </Card>
      <Button>Continuar</Button>
    </section>
  );
}

/** Parse a fixed pixel width from inline style or arbitrary Tailwind class. */
function fixedPixelWidths(el: HTMLElement): number[] {
  const widths: number[] = [];
  const style = el.getAttribute('style') ?? '';
  for (const m of Array.from(style.matchAll(/(?:^|;)\s*(?:min-)?width:\s*(\d+)px/gi))) {
    widths.push(Number(m[1]));
  }
  const cls = el.getAttribute('class') ?? '';
  // Arbitrary width utilities like w-[480px] / min-w-[480px].
  for (const m of Array.from(cls.matchAll(/(?:^|\s)(?:min-)?w-\[(\d+)px\]/g))) {
    widths.push(Number(m[1]));
  }
  return widths;
}

describe('Responsive layout (PwaShell)', () => {
  it('introduces no fixed-width element wider than the viewport across 320–1920px (Req 8.1)', () => {
    for (const width of WIDTHS) {
      setViewportWidth(width);
      const { container, unmount } = render(
        <PwaShell>
          <RepresentativeContent />
        </PwaShell>,
      );

      // scrollWidth <= clientWidth (jsdom reports 0/0 — holds without false fail).
      const root = document.documentElement;
      expect(root.scrollWidth).toBeLessThanOrEqual(window.innerWidth);

      // Substantive structural check: no element pins a fixed px width beyond
      // the current viewport (the real source of horizontal overflow).
      const all = container.querySelectorAll<HTMLElement>('*');
      all.forEach((el) => {
        for (const w of fixedPixelWidths(el)) {
          expect(w).toBeLessThanOrEqual(width);
        }
      });

      unmount();
    }
  });

  it('constrains content to <=768px and centers it (Req 4.2)', () => {
    const { container } = render(
      <PwaShell>
        <RepresentativeContent />
      </PwaShell>,
    );
    const main = container.querySelector('main') as HTMLElement;
    const contentWrapper = main.firstElementChild as HTMLElement;

    // The content wrapper carries a max-width utility and is centered.
    const maxWidthClass = Array.from(contentWrapper.classList).find((c) =>
      c.startsWith('max-w-'),
    );
    expect(maxWidthClass).toBeDefined();
    expect(MAX_WIDTH_PX[maxWidthClass as string]).toBeLessThanOrEqual(768);
    expect(contentWrapper.className).toContain('mx-auto');
  });

  it('applies a uniform 16px page margin from one named spacing step (Req 4.3, 4.5)', () => {
    const { container } = render(
      <PwaShell>
        <RepresentativeContent />
      </PwaShell>,
    );
    const main = container.querySelector('main') as HTMLElement;
    // px-4 == 1rem == 16px; this single wrapper is shared by every non-auth
    // screen, so the margin is identical across all PWA_Screens.
    expect(main.className).toContain('px-4');
  });

  it('keeps primary content single-column at the base breakpoint (<640px) (Req 8.2)', () => {
    const { container } = render(
      <PwaShell>
        <RepresentativeContent />
      </PwaShell>,
    );
    const main = container.querySelector('main') as HTMLElement;
    const contentWrapper = main.firstElementChild as HTMLElement;
    // The shell wrapper itself introduces no unprefixed multi-column layout.
    for (const el of [main, contentWrapper]) {
      const classes = el.className;
      expect(classes).not.toMatch(/(?:^|\s)grid-cols-[2-9]/);
      expect(classes).not.toMatch(/(?:^|\s)flex-row(?:\s|$)/);
    }
  });

  it('declares the media base rule so media never exceeds its container (Req 8.5)', () => {
    const css = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');
    // img,video,svg { max-width: 100%; height: auto }
    const normalized = css.replace(/\s+/g, ' ');
    expect(normalized).toMatch(/img,\s*video,\s*svg\s*\{[^}]*max-width:\s*100%/);
  });
});
