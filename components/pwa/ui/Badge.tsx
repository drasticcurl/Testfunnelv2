/**
 * Badge — the single status/label badge primitive for the PWA.
 *
 * Renders one consistent style for background, text color, corner radius, and
 * spacing defined by Design_System tokens, across all screens (Requirement 5.8).
 *
 * Status is conveyed by a named status Design_Token color (Requirement 3.5) AND,
 * for the status tones, an additional NON-COLOR cue — a leading status icon that
 * is exposed to assistive technology — so meaning never relies on color alone
 * (Requirement 3.7). The visible badge text (children) is itself a non-color cue
 * as well.
 *
 * Styling consumes only token-backed Tailwind utilities (Requirement 1.2).
 */
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error';

export interface BadgeProps {
  /** Status tone (default `neutral`). */
  tone?: BadgeTone;
  /** Optional accessible label for the leading status icon. */
  iconLabel?: string;
  className?: string;
  children: ReactNode;
}

/** One consistent badge shape/typography/spacing for every tone. */
const BASE_CLASS = [
  'inline-flex items-center gap-1',
  'px-3 py-1',
  'rounded-full',
  'font-body font-medium text-sm leading-none',
].join(' ');

/** Per-tone token-backed color treatment + the icon that carries the non-color cue. */
const TONE_CONFIG: Record<
  BadgeTone,
  { className: string; icon: IconName | null; defaultLabel: string }
> = {
  neutral: {
    className: 'bg-warm-border text-charcoal',
    icon: null,
    defaultLabel: '',
  },
  success: {
    className: 'bg-success/15 text-success',
    icon: 'success',
    defaultLabel: 'Correcto',
  },
  warning: {
    className: 'bg-warning/15 text-warning',
    icon: 'warning',
    defaultLabel: 'Advertencia',
  },
  error: {
    className: 'bg-error/15 text-error',
    icon: 'error',
    defaultLabel: 'Error',
  },
};

export function Badge({
  tone = 'neutral',
  iconLabel,
  className,
  children,
}: BadgeProps) {
  const config = TONE_CONFIG[tone];
  const classes = [BASE_CLASS, config.className, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {config.icon && (
        <Icon
          name={config.icon}
          size="sm"
          label={iconLabel ?? config.defaultLabel}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
