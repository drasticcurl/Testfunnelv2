/**
 * Button — the single primary-action button primitive for the PWA.
 *
 * Renders one consistent visual style defined entirely by Design_System tokens
 * (color, typography, corner radius, spacing, border, shadow), with two
 * variants:
 *  - `primary`: filled terracotta CTA.
 *  - `outline`: terracotta border/text on a warm surface.
 *
 * Affordances and states (Requirements 5.1, 5.4, 5.5, 5.6, 5.7, 11.1, 11.5):
 *  - At rest it carries a fill/border affordance distinct from non-interactive
 *    content (5.7).
 *  - Hover and active produce a visible state change (5.4, 5.5).
 *  - Disabled renders a distinct muted style AND sets `aria-disabled` so the
 *    state reaches assistive technology (5.6).
 *  - A minimum 44x44 CSS px touch target (`min-h-[44px] min-w-[44px]`) (11.1).
 *  - Keyboard Enter/Space activation has parity with pointer click: the native
 *    `<button>` already fires `onClick` for both, and a disabled button blocks
 *    activation for pointer and keyboard alike (11.5).
 *
 * Styling consumes only token-backed Tailwind utilities — no literal color,
 * font, spacing, radius, or shadow values (Requirement 1.2).
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'outline';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** Visual variant (default `primary`). */
  variant?: ButtonVariant;
  /** Whether the button is disabled. */
  disabled?: boolean;
  children: ReactNode;
}

/** Base style shared by every button: one consistent typography/shape/target. */
const BASE_CLASS = [
  'inline-flex items-center justify-center gap-2',
  'min-h-[44px] min-w-[44px] px-6 py-3',
  'font-body font-semibold text-base leading-none',
  'rounded-full',
  'select-none',
  'transition-colors duration-fast ease-standard',
  // Focus-visible indicator independent of color alone (11.2/11.5 support).
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2',
].join(' ');

/** Per-variant at-rest + hover + active treatments (token-driven). */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: [
    'bg-terracotta text-warm shadow-cta border border-transparent',
    'hover:bg-terracotta-dark',
    'active:bg-terracotta-dark active:scale-[0.98]',
  ].join(' '),
  outline: [
    'bg-warm text-terracotta border border-terracotta shadow-sm',
    'hover:bg-terracotta-soft',
    'active:bg-terracotta-soft active:scale-[0.98]',
  ].join(' '),
};

/** Disabled treatment: distinct muted style, no hover/active affordance. */
const DISABLED_CLASS =
  'opacity-50 cursor-not-allowed shadow-none hover:bg-terracotta active:scale-100';

const DISABLED_OUTLINE_CLASS =
  'opacity-50 cursor-not-allowed shadow-none hover:bg-warm active:scale-100';

export function Button({
  variant = 'primary',
  disabled = false,
  className,
  children,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const disabledClass =
    variant === 'primary' ? DISABLED_CLASS : DISABLED_OUTLINE_CLASS;

  const classes = [
    BASE_CLASS,
    VARIANT_CLASS[variant],
    disabled ? disabledClass : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      // Keep the element focusable but communicate state to assistive tech.
      aria-disabled={disabled || undefined}
      // Block activation (pointer AND keyboard) when disabled, without removing
      // it from the accessibility tree.
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
