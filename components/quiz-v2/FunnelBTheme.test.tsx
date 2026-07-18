// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { FunnelBTheme } from './FunnelBTheme';

/**
 * Feature: argentina-funnel-ab-test, Task 4.3 — unit test de FunnelBTheme.
 * Verifica que B renderiza el wrapper `data-funnel="b"` (scope del rebrand) y
 * que NO toca el `:root` global (el override de tokens vive en globals.css bajo
 * el selector scopeado, no inyectado inline ni en :root).
 * _Requirements: 7.2, 7.3_
 */
describe('FunnelBTheme', () => {
  afterEach(() => cleanup());

  it('renderiza un wrapper con data-funnel="b"', () => {
    const { container } = render(
      <FunnelBTheme>
        <span data-testid="child">contenido</span>
      </FunnelBTheme>,
    );
    const wrapper = container.querySelector('[data-funnel="b"]');
    expect(wrapper).not.toBeNull();
  });

  it('renderiza a sus hijos dentro del scope (no los pierde)', () => {
    const { getByTestId, container } = render(
      <FunnelBTheme>
        <span data-testid="child">contenido</span>
      </FunnelBTheme>,
    );
    const child = getByTestId('child');
    expect(child.textContent).toBe('contenido');
    // El hijo está DENTRO del wrapper scopeado.
    const wrapper = container.querySelector('[data-funnel="b"]');
    expect(wrapper?.contains(child)).toBe(true);
  });

  it('NO modifica los design-tokens de :root (no inyecta variables inline en :root)', () => {
    render(
      <FunnelBTheme>
        <span>x</span>
      </FunnelBTheme>,
    );
    // El componente no debe escribir variables de marca en el documentElement.
    const rootInline = document.documentElement.style.getPropertyValue('--terracotta');
    expect(rootInline).toBe('');
  });
});
