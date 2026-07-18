// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — Button / Card / Badge primitive DOM tests.
 *
 * Example/DOM tests (not property-based) that lock the one-consistent-style and
 * state treatments of the shared primitives:
 *  - Button disabled `aria-disabled`, hover/at-rest affordances, keyboard
 *    Enter/Space activation parity with click (Req 5.1, 5.4, 5.5, 5.6, 5.7,
 *    11.1, 11.5).
 *  - Card one consistent bg/border/radius/shadow (Req 5.3).
 *  - Badge one consistent style + non-color status cue (Req 5.8, 3.5, 3.7).
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

afterEach(cleanup);

describe('Button', () => {
  it('renders one consistent style with a 44x44 min touch target and at-rest affordance', () => {
    render(<Button>Guardar</Button>);
    const btn = screen.getByRole('button', { name: 'Guardar' });
    // Min 44x44 touch target (Req 11.1).
    expect(btn.className).toContain('min-h-[44px]');
    expect(btn.className).toContain('min-w-[44px]');
    // At-rest affordance: a fill distinct from non-interactive content (Req 5.7).
    expect(btn.className).toContain('bg-terracotta');
    // Default native type is button (no implicit form submit).
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('exposes hover and active state-change affordances (Req 5.4, 5.5)', () => {
    render(<Button variant="primary">Hover</Button>);
    const btn = screen.getByRole('button', { name: 'Hover' });
    expect(btn.className).toContain('hover:bg-terracotta-dark');
    expect(btn.className).toContain('active:');
  });

  it('renders the outline variant with a distinct token border affordance', () => {
    render(<Button variant="outline">Cancelar</Button>);
    const btn = screen.getByRole('button', { name: 'Cancelar' });
    expect(btn.className).toContain('border-terracotta');
    expect(btn.className).toContain('text-terracotta');
  });

  it('shows a distinct disabled style and reports aria-disabled (Req 5.6)', () => {
    render(<Button disabled>Bloqueado</Button>);
    const btn = screen.getByRole('button', { name: 'Bloqueado' });
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn.className).toContain('opacity-50');
    expect(btn.className).toContain('cursor-not-allowed');
  });

  it('does not invoke onClick while disabled (pointer)', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        No
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('invokes onClick on pointer click when enabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Si</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Si' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates with Enter and Space at parity with pointer click (Req 11.5)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Activar</Button>);
    const btn = screen.getByRole('button', { name: 'Activar' });
    btn.focus();
    expect(btn).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ }'); // Space
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe('Card', () => {
  it('renders one consistent bg/border/radius/shadow style (Req 5.3)', () => {
    const { container } = render(<Card>contenido</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('bg-warm');
    expect(card.className).toContain('border-warm-border');
    expect(card.className).toContain('rounded-lg');
    expect(card.className).toContain('shadow-md');
    expect(card).toHaveTextContent('contenido');
  });

  it('applies an identical base style regardless of children', () => {
    const { container: a } = render(<Card>A</Card>);
    const { container: b } = render(<Card>B</Card>);
    const ca = (a.firstElementChild as HTMLElement).className;
    const cb = (b.firstElementChild as HTMLElement).className;
    expect(ca).toBe(cb);
  });
});

describe('Badge', () => {
  it('renders a neutral badge with consistent token styling and no status icon', () => {
    const { container } = render(<Badge>Nuevo</Badge>);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain('rounded-full');
    expect(badge.className).toContain('bg-warm-border');
    expect(badge).toHaveTextContent('Nuevo');
    // Neutral conveys no status → no status icon required.
    expect(container.querySelector('svg')).toBeNull();
  });

  it('provides a non-color cue (assistive-tech icon) for status tones (Req 3.7)', () => {
    render(<Badge tone="success">Completado</Badge>);
    // The status icon is exposed to assistive technology with a label.
    const icon = screen.getByRole('img', { name: 'Correcto' });
    expect(icon).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('uses status token colors for each tone (Req 3.5)', () => {
    const { container: s } = render(<Badge tone="success">ok</Badge>);
    const { container: w } = render(<Badge tone="warning">cuidado</Badge>);
    const { container: e } = render(<Badge tone="error">fallo</Badge>);
    expect((s.firstElementChild as HTMLElement).className).toContain('text-success');
    expect((w.firstElementChild as HTMLElement).className).toContain('text-warning');
    expect((e.firstElementChild as HTMLElement).className).toContain('text-error');
  });
});
