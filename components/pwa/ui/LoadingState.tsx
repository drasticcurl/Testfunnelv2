/**
 * LoadingState — the single loading-feedback primitive for the PWA.
 *
 * Renders a token-styled skeleton (or spinner) in the region where the
 * retrieved content will appear, and communicates the loading status to
 * assistive technology via `role="status"`, `aria-busy="true"`, and an
 * `aria-live="polite"` region with a human-readable message
 * (Requirements 9.1, 9.4, 9.5).
 *
 * Styling consumes only token-backed Tailwind utilities (Requirement 1.2).
 */
import type { ReactNode } from 'react';

export interface LoadingStateProps {
  /** Accessible status message announced to assistive technology. */
  message?: string;
  /** Number of skeleton rows to render (default 3). */
  rows?: number;
  /** Render a centered spinner instead of skeleton rows. */
  variant?: 'skeleton' | 'spinner';
  className?: string;
  children?: ReactNode;
}

const SKELETON_ROW_CLASS =
  'h-4 rounded-md bg-warm-border animate-pulse';

export function LoadingState({
  message = 'Cargando…',
  rows = 3,
  variant = 'skeleton',
  className,
  children,
}: LoadingStateProps) {
  const wrapperClasses = ['w-full', className].filter(Boolean).join(' ');

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={wrapperClasses}
    >
      {/* Visually-hidden but assistive-tech-announced status message (Req 9.5). */}
      <span className="sr-only">{message}</span>

      {variant === 'spinner' ? (
        <div className="flex items-center justify-center py-6">
          <span
            aria-hidden="true"
            className="inline-block w-icon-lg h-icon-lg rounded-full border-2 border-warm-border border-t-terracotta animate-spin"
          />
        </div>
      ) : (
        <div aria-hidden="true" className="flex flex-col gap-3">
          {Array.from({ length: Math.max(1, rows) }, (_, i) => (
            <div
              key={i}
              className={`${SKELETON_ROW_CLASS} ${i === 0 ? 'w-2/3' : 'w-full'}`}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );
}

export default LoadingState;
