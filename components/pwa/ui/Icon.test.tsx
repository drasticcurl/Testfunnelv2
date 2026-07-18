// @vitest-environment jsdom

/**
 * Feature: pwa-visual-improvements — Icon accessibility by role (jsdom).
 *
 * Property 11 verifies that the Icon primitive's assistive-technology exposure
 * follows its role: decorative icons are hidden and nameless; meaningful icons
 * (non-empty label, not decorative) expose exactly that label and are visible
 * to assistive technology.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import { Icon, type IconName } from './Icon';

afterEach(cleanup);

const ICON_NAMES: IconName[] = [
  'home', 'plan', 'diary', 'recipes', 'guides', 'vip', 'streak', 'back',
  'add', 'close', 'share', 'download', 'success', 'warning', 'error', 'info',
];

describe('Icon accessibility matches its role', () => {
  // Feature: pwa-visual-improvements, Property 11: Icon accessibility matches its role
  // Validates: Requirements 7.4, 7.5
  it('Property 11: decorative icons are hidden/nameless; meaningful icons expose their label', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ICON_NAMES),
        // Non-empty label text for the meaningful case.
        fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
        fc.boolean(),
        (name, label, decorative) => {
          const { container } = render(
            <Icon name={name} label={decorative ? label : label} decorative={decorative} />,
          );
          const svg = container.querySelector('svg');
          expect(svg).not.toBeNull();

          if (decorative) {
            // Decorative: hidden from assistive technology, no accessible name.
            expect(svg).toHaveAttribute('aria-hidden', 'true');
            expect(svg).not.toHaveAttribute('aria-label');
            expect(svg).not.toHaveAttribute('role', 'img');
          } else {
            // Meaningful: exposes exactly the label, not hidden.
            expect(svg).toHaveAttribute('role', 'img');
            expect(svg).toHaveAttribute('aria-label', label);
            expect(svg).not.toHaveAttribute('aria-hidden');
          }
          cleanup();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('an unknown name renders a safe default svg and never throws', () => {
    expect(() =>
      render(<Icon name={'totally-unknown' as IconName} />),
    ).not.toThrow();
    const svg = document.querySelector('svg');
    expect(svg).not.toBeNull();
    // No label → decorative by default → hidden.
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('a label-less icon is decorative (hidden) by default', () => {
    const { container } = render(<Icon name="home" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('aria-label');
  });
});
