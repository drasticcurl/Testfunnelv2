/**
 * Card — the single content-card primitive for the PWA.
 *
 * Renders one consistent style for background, border, corner radius, and shadow
 * defined by Design_System tokens, so every card across every screen looks
 * identical (Requirements 5.3, 4.4). Styling consumes only token-backed Tailwind
 * utilities — no literal color, radius, or shadow values (Requirement 1.2).
 */
import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** One consistent card style: warm surface, token border, `lg` radius, `md` shadow. */
const CARD_CLASS = 'bg-warm border border-warm-border rounded-lg shadow-md p-4';

export function Card({ className, children, ...rest }: CardProps) {
  const classes = [CARD_CLASS, className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export default Card;
