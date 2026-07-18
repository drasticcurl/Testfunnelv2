/**
 * EmptyState — the single empty-data primitive for the PWA.
 *
 * When a screen has no user data to display, this renders explanatory text plus
 * a focusable interactive control for a suggested next action, with a consistent
 * token-styled treatment (Requirements 9.2, 9.4). It never leaves the user with
 * a blank screen.
 *
 * The next-action control is rendered via the shared `Button` primitive so it
 * is keyboard-focusable and carries the standard interactive affordances.
 *
 * Styling consumes only token-backed Tailwind utilities (Requirement 1.2).
 */
import type { ReactNode } from 'react';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export interface EmptyStateProps {
  /** Explanatory text describing why there is nothing to show. */
  message: string;
  /** Label for the suggested next-action control. */
  actionLabel: string;
  /** Handler invoked when the next-action control is activated. */
  onAction: () => void;
  /** Optional decorative icon shown above the message. */
  iconName?: IconName;
  /** Optional secondary heading. */
  title?: ReactNode;
  className?: string;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
  iconName,
  title,
  className,
}: EmptyStateProps) {
  const wrapperClasses = [
    'flex flex-col items-center text-center gap-3 py-8 px-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {iconName && (
        <Icon name={iconName} size="lg" decorative className="text-muted-light" />
      )}
      {title && (
        <h2 className="font-heading text-xl text-charcoal">{title}</h2>
      )}
      <p className="font-body text-base text-muted">{message}</p>
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

export default EmptyState;
