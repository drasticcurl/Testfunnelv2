// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — EmptyState explanation + next action (jsdom).
 *
 * Property 12 verifies that for any message text and action descriptor, the
 * EmptyState primitive renders the explanatory text and a focusable interactive
 * control for the suggested next action.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import { EmptyState } from './EmptyState';

afterEach(cleanup);

describe('EmptyState always offers explanation and a next action', () => {
  // Trimmed text with no collapsible whitespace, so accessible-name
  // normalization and text matching are unambiguous.
  const textArb = fc
    .string({ minLength: 1, maxLength: 80 })
    .filter((s) => s.trim() === s && s.length > 0 && !/\s{2,}/.test(s));

  // Feature: pwa-visual-improvements, Property 12: Empty state always offers explanation and a next action
  // Validates: Requirements 9.2
  it('Property 12: renders the explanatory text and a focusable next-action control', () => {
    fc.assert(
      fc.property(textArb, textArb, (message, actionLabel) => {
        const onAction = vi.fn();
        const { container, getByText, getByRole } = render(
          <EmptyState
            message={message}
            actionLabel={actionLabel}
            onAction={onAction}
          />,
        );

        // Explanatory text is present (scoped to the paragraph, since the
        // action label could coincidentally equal the message text).
        expect(getByText(message, { selector: 'p' })).toBeInTheDocument();

        // A focusable interactive control for the next action is present.
        const button = getByRole('button', { name: actionLabel });
        expect(button).toBeInTheDocument();
        button.focus();
        expect(button).toHaveFocus();

        // The control is wired to the next action.
        fireEvent.click(button);
        expect(onAction).toHaveBeenCalledTimes(1);

        // Sanity: a single action control rendered.
        expect(container.querySelectorAll('button')).toHaveLength(1);
        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
