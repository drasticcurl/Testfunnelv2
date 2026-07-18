// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — ErrorState message/recovery/input
 * preservation (jsdom).
 *
 * Property 13 verifies that for any failed-action label and any user-entered
 * input value, the ErrorState primitive renders a message identifying the
 * failed action, exposes a retry and/or dismiss control, and returns the
 * user-entered input unchanged so no data is lost.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import { ErrorState } from './ErrorState';

afterEach(cleanup);

describe('ErrorState names the failed action, offers recovery, and preserves input', () => {
  const actionArb = fc
    .string({ minLength: 1, maxLength: 40 })
    .filter((s) => s.trim().length > 0 && !/\s{2,}/.test(s));
  const inputArb = fc.string({ maxLength: 60 });

  // Feature: pwa-visual-improvements, Property 13: Error state names the failed action, offers recovery, and preserves input
  // Validates: Requirements 9.3, 12.5
  it('Property 13: message names the failed action, a recovery control exists, and input is echoed back unchanged', () => {
    fc.assert(
      fc.property(actionArb, inputArb, (failedAction, retainedInput) => {
        const onRetry = vi.fn();
        const onDismiss = vi.fn();
        const { container, getByRole, getByTestId } = render(
          <ErrorState
            failedAction={failedAction}
            retainedInput={retainedInput}
            onRetry={onRetry}
            onDismiss={onDismiss}
          />,
        );

        // The message identifies the failed action.
        const alert = getByRole('alert');
        expect(alert.textContent).toContain(failedAction);

        // A recovery control (retry and/or dismiss) is exposed.
        const retry = getByRole('button', { name: 'Reintentar' });
        expect(retry).toBeInTheDocument();

        // The retained user-entered input is preserved unchanged in the DOM.
        const hidden = getByTestId('error-retained-input') as HTMLInputElement;
        expect(hidden.value).toBe(retainedInput);

        // And it is echoed back unchanged through the recovery handlers.
        fireEvent.click(retry);
        expect(onRetry).toHaveBeenCalledTimes(1);
        expect(onRetry).toHaveBeenCalledWith(retainedInput);

        expect(container).toBeTruthy();
        cleanup();
      }),
      { numRuns: 100 },
    );
  });

  it('offers recovery when only a dismiss handler is provided', () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(
      <ErrorState failedAction="guardar diario" onDismiss={onDismiss} retainedInput="abc" />,
    );
    const dismiss = getByRole('button', { name: 'Descartar' });
    fireEvent.click(dismiss);
    expect(onDismiss).toHaveBeenCalledWith('abc');
  });
});
