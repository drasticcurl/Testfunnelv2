/**
 * ErrorState — the single failure-feedback primitive for the PWA.
 *
 * When a user-initiated action or data retrieval fails, this renders:
 *  - a human-readable message that NAMES the failed action (Requirement 9.3),
 *  - a retry control and/or a dismiss control (Requirements 9.3, 9.7),
 *  - and it PRESERVES any user-entered input associated with the action,
 *    echoing it back unchanged through the recovery handlers so no data is lost
 *    (Requirements 9.7, 12.5).
 *
 * It is purely presentational: it never clears or mutates the retained input;
 * `onRetry`/`onDismiss` receive the exact `retainedInput` value passed in.
 *
 * Styling consumes only token-backed Tailwind utilities (Requirement 1.2).
 */
import { Button } from './Button';
import { Icon } from './Icon';

export interface ErrorStateProps<TInput = unknown> {
  /** Human-readable name of the action that failed (e.g. "iniciar sesión"). */
  failedAction: string;
  /** Optional fuller message; defaults to a sentence naming the failed action. */
  message?: string;
  /** Retry handler; receives the retained input unchanged. */
  onRetry?: (retainedInput?: TInput) => void;
  /** Optional dismiss handler; receives the retained input unchanged. */
  onDismiss?: (retainedInput?: TInput) => void;
  /** User-entered input to preserve across the failure (echoed back unchanged). */
  retainedInput?: TInput;
  className?: string;
}

/** Default human-readable message naming the failed action. */
function defaultMessage(failedAction: string): string {
  return `No se pudo completar: ${failedAction}. Inténtalo de nuevo.`;
}

export function ErrorState<TInput = unknown>({
  failedAction,
  message,
  onRetry,
  onDismiss,
  retainedInput,
  className,
}: ErrorStateProps<TInput>) {
  const wrapperClasses = [
    'flex flex-col items-start gap-3 p-4 rounded-md',
    'bg-error/10 border border-error/30',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const text = message ?? defaultMessage(failedAction);

  return (
    <div role="alert" className={wrapperClasses}>
      <div className="flex items-start gap-2">
        <Icon name="error" size="md" label="Error" className="text-error shrink-0" />
        <p className="font-body text-base text-charcoal">{text}</p>
      </div>

      {/*
        Preserve the user-entered input across the failure. The value is echoed
        back unchanged via the recovery handlers and mirrored here so it is never
        lost (Req 12.5). Hidden from layout but available to the DOM/tests.
      */}
      {retainedInput !== undefined && (
        <input
          type="hidden"
          data-testid="error-retained-input"
          readOnly
          value={
            typeof retainedInput === 'string'
              ? retainedInput
              : JSON.stringify(retainedInput)
          }
        />
      )}

      <div className="flex gap-2">
        {onRetry && (
          <Button variant="primary" onClick={() => onRetry(retainedInput)}>
            Reintentar
          </Button>
        )}
        {onDismiss && (
          <Button variant="outline" onClick={() => onDismiss(retainedInput)}>
            Descartar
          </Button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;
