// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — LoadingState accessibility (jsdom).
 *
 * Verifies the loading primitive communicates its status to assistive
 * technology via role/aria-busy/aria-live and renders a token-styled skeleton
 * or spinner (Requirements 9.1, 9.4, 9.5).
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { LoadingState } from './LoadingState';

afterEach(cleanup);

describe('LoadingState', () => {
  it('exposes loading status to assistive technology (Req 9.5)', () => {
    const { getByRole } = render(<LoadingState message="Cargando datos" />);
    const status = getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Cargando datos');
  });

  it('renders the requested number of skeleton rows', () => {
    const { container } = render(<LoadingState rows={4} />);
    const rows = container.querySelectorAll('.animate-pulse');
    expect(rows).toHaveLength(4);
  });

  it('renders a spinner variant when requested', () => {
    const { container } = render(<LoadingState variant="spinner" />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });
});
