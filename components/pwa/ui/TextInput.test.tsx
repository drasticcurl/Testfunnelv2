// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — TextInput label association (jsdom).
 *
 * Property 10 verifies that for any id and label text, the TextInput primitive
 * renders a `<label>` whose `htmlFor` equals the input `id` and whose visible
 * text is the provided label, so the input is always programmatically and
 * visibly labeled.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import { TextInput } from './TextInput';

afterEach(cleanup);

describe('TextInput is always associated with a visible label', () => {
  // A valid HTML id: starts with a letter, no whitespace.
  const idArb = fc
    .stringMatching(/^[A-Za-z][A-Za-z0-9_-]{0,30}$/)
    .filter((s) => s.length > 0);
  // Non-empty, non-whitespace visible label text.
  const labelArb = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0);

  // Feature: pwa-visual-improvements, Property 10: Text inputs are always associated with a visible label
  // Validates: Requirements 5.2, 11.3
  it('Property 10: label[htmlFor] === input.id and label text === provided label', () => {
    fc.assert(
      fc.property(idArb, labelArb, (id, label) => {
        const { container } = render(<TextInput id={id} label={label} />);
        const input = container.querySelector('input');
        const labelEl = container.querySelector('label');

        expect(input).not.toBeNull();
        expect(labelEl).not.toBeNull();
        // Programmatic association.
        expect(input!.getAttribute('id')).toBe(id);
        expect(labelEl!.getAttribute('for')).toBe(id);
        // Visible label text matches exactly.
        expect(labelEl!.textContent).toBe(label);
        cleanup();
      }),
      { numRuns: 100 },
    );
  });

  it('meets the 44px minimum touch target', () => {
    const { container } = render(<TextInput id="email" label="Correo" />);
    const input = container.querySelector('input')!;
    expect(input.className).toContain('min-h-[44px]');
  });
});
