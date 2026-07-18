// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — Behavior-preservation regression (Task 24.1).
 *
 * The visual overhaul is presentation-only (Requirement 12): routing, link
 * targets, focus/keyboard semantics, and async-view transitions must be
 * IDENTICAL afterwards. These regression tests act as guardrails:
 *  - Route-set snapshot unchanged (Req 12.1): the set of `/pwa/*` routes on disk
 *    equals a frozen baseline.
 *  - BottomNav / link target hrefs unchanged vs baseline (Req 12.2): the nav tab
 *    hrefs and the rendered anchor targets match the frozen baseline.
 *  - Focus-visible indicator presence (Req 11.2): interactive primitives carry a
 *    visible, non-color-only focus indicator.
 *  - Keyboard Enter/Space activation parity with pointer (Req 11.4, 11.5).
 *  - AsyncView loading→ready and loading→error transitions (Req 9.6, 9.7).
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';

const ROOT = process.cwd();

// ── Mocks for chrome rendering ───────────────────────────────────────────────
let mockPathname = '/pwa/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));
vi.mock('@/lib/pwa/vip-access', () => ({
  isVipUnlocked: () => false,
}));

import BottomNav from './BottomNav';
import { BOTTOM_NAV_TABS } from '@/lib/pwa/ui/nav';
import { Button } from './ui/Button';
import { TextInput } from './ui/TextInput';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';

afterEach(cleanup);
beforeEach(() => {
  mockPathname = '/pwa/dashboard';
});


// ── Frozen baselines ─────────────────────────────────────────────────────────

/** The complete `/pwa/*` route set (baseline captured at Task 24). */
const ROUTE_BASELINE = [
  '/pwa/calculadora',
  '/pwa/calculadora/resultado',
  '/pwa/dashboard',
  '/pwa/diario',
  '/pwa/diario/nuevo',
  '/pwa/guias',
  '/pwa/guias/agua-de-arroz',
  '/pwa/guias/antiinflamatorios',
  '/pwa/guias/bonus/[slug]',
  '/pwa/guias/inflamatorios',
  '/pwa/guias/ritual',
  '/pwa/guias/suplementacion',
  '/pwa/kit-express',
  '/pwa/kit-express/emergencia',
  '/pwa/kit-express/meal-prep',
  '/pwa/kit-express/swaps',
  '/pwa/lista-compras',
  '/pwa/login',
  '/pwa/onboarding',
  '/pwa/plan',
  '/pwa/plan/[day]',
  '/pwa/preferencias',
  '/pwa/progreso',
  '/pwa/recetas',
  '/pwa/recetas/[id]',
  '/pwa/recuperar',
  '/pwa/registro',
  '/pwa/reset',
  '/pwa/vip',
  '/pwa/vip/guia/[slug]',
  '/pwa/vip/planner',
];

/** BottomNav tab href baseline (order matters). */
const NAV_HREF_BASELINE = [
  '/pwa/dashboard',
  '/pwa/plan',
  '/pwa/diario',
  '/pwa/recetas',
  '/pwa/guias',
  '/pwa/vip',
];

/** Discover every `/pwa/*` route by walking for `page.tsx` files. */
function discoverPwaRoutes(): string[] {
  const base = resolve(ROOT, 'app/pwa');
  const routes: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry === 'page.tsx') {
        routes.push('/' + resolve(dir).slice(resolve(ROOT, 'app').length + 1).replace(/\\/g, '/'));
      }
    }
  };
  walk(base);
  return routes.sort();
}


describe('Behavior preservation — route set (Req 12.1)', () => {
  it('the on-disk /pwa/* route set matches the frozen baseline', () => {
    expect(discoverPwaRoutes()).toEqual([...ROUTE_BASELINE].sort());
  });
});

describe('Behavior preservation — navigation targets (Req 12.2)', () => {
  it('the BottomNav tab hrefs match the frozen baseline (order preserved)', () => {
    expect(BOTTOM_NAV_TABS.map((t) => t.href)).toEqual(NAV_HREF_BASELINE);
  });

  it('the rendered nav anchors resolve to the unchanged target routes', () => {
    mockPathname = '/pwa/dashboard';
    render(<BottomNav />);
    const links = screen.getAllByRole('link');
    const renderedHrefs = links.map((l) => l.getAttribute('href'));
    // VIP is hidden in this config → the base 5 targets, unchanged.
    expect(renderedHrefs).toEqual(NAV_HREF_BASELINE.slice(0, 5));
  });
});

describe('Behavior preservation — focus indicator (Req 11.2)', () => {
  it('Button exposes a visible focus-visible indicator (ring, not color-only)', () => {
    render(<Button>Focus</Button>);
    const btn = screen.getByRole('button', { name: 'Focus' });
    expect(btn.className).toMatch(/focus-visible:ring/);
  });

  it('TextInput exposes a visible focus-visible indicator', () => {
    render(<TextInput id="email" label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input.className).toMatch(/focus-visible:ring/);
  });
});

describe('Behavior preservation — keyboard activation parity (Req 11.4, 11.5)', () => {
  it('Enter and Space activate a Button identically to a pointer click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enviar</Button>);
    const btn = screen.getByRole('button', { name: 'Enviar' });

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);

    btn.focus();
    expect(btn).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ }');
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});


/**
 * Minimal AsyncView harness modeling the documented loading → ready / error
 * transitions using the shared state primitives, with a retry that recovers.
 */
function AsyncViewHarness() {
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>('loading');
  return (
    <div>
      {phase === 'loading' && <LoadingState message="Cargando datos" />}
      {phase === 'error' && (
        <ErrorState failedAction="cargar los datos" onRetry={() => setPhase('ready')} />
      )}
      {phase === 'ready' && <p>Datos listos</p>}
      <button onClick={() => setPhase('error')}>simular-fallo</button>
      <button onClick={() => setPhase('ready')}>simular-exito</button>
    </div>
  );
}

describe('Behavior preservation — AsyncView transitions (Req 9.6, 9.7)', () => {
  it('removes the loading state and renders content on success (Req 9.6)', () => {
    render(<AsyncViewHarness />);
    // Loading announced to assistive tech.
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Datos listos')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'simular-exito' }));

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Datos listos')).toBeInTheDocument();
  });

  it('replaces loading with an error state naming the action, then recovers on retry (Req 9.7)', () => {
    render(<AsyncViewHarness />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'simular-fallo' }));

    // Loading gone; error surfaced with a retry control and the failed action.
    expect(screen.queryByRole('status')).toBeNull();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/cargar los datos/);
    const retry = screen.getByRole('button', { name: 'Reintentar' });

    fireEvent.click(retry);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Datos listos')).toBeInTheDocument();
  });
});
