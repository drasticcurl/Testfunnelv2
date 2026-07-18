/**
 * TextInput — the single text-input primitive for the PWA.
 *
 * Renders one consistent input style defined by Design_System tokens with a
 * VISIBLE `<label>` that is programmatically linked to the input via
 * `htmlFor`/`id` (both required), so every input is always labeled both visibly
 * and for assistive technology (Requirements 5.2, 11.3). The control meets the
 * 44 px minimum touch target (Requirement 11.1).
 *
 * Styling consumes only token-backed Tailwind utilities — no literal color,
 * font, spacing, radius, or shadow values (Requirement 1.2).
 */
import type { InputHTMLAttributes } from 'react';

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Required input id; the label's `htmlFor` is wired to this value. */
  id: string;
  /** Required visible label text. */
  label: string;
  /** Optional extra wrapper classes. */
  wrapperClassName?: string;
}

/** One consistent input style: token surface, border, radius, spacing, 44px min height. */
const INPUT_CLASS = [
  'block w-full min-h-[44px] px-4 py-3',
  'font-body text-base text-charcoal',
  'bg-warm border border-warm-border rounded-md',
  'placeholder:text-muted-light',
  'transition-colors duration-fast ease-standard',
  'focus-visible:outline-none focus-visible:border-terracotta',
  'focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2',
].join(' ');

const LABEL_CLASS = 'block mb-2 font-body font-medium text-sm text-charcoal';

export function TextInput({
  id,
  label,
  className,
  wrapperClassName,
  ...rest
}: TextInputProps) {
  const inputClasses = [INPUT_CLASS, className].filter(Boolean).join(' ');
  const wrapperClasses = ['w-full', wrapperClassName].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input id={id} className={inputClasses} {...rest} />
    </div>
  );
}

export default TextInput;
