'use client';

/**
 * OptionCard - opcion clickeable del quiz.
 * Soporta single (radio) y multi (checkbox).
 */

interface Props {
  label: string;
  emoji?: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function OptionCard({
  label,
  emoji,
  selected,
  multi = false,
  onClick,
  disabled = false,
}: Props) {
  const baseClasses = [
    'w-full text-left bg-white',
    'border-2 rounded-lg',
    'px-6 py-5 md:py-6',
    'font-sans text-base md:text-lg text-charcoal',
    'transition-all duration-200',
    'cursor-pointer',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
    'hover:border-sage hover:bg-sage-soft',
    selected
      ? 'border-sage bg-sage-soft shadow-md'
      : 'border-[#EFECE7]',
    disabled ? 'opacity-40 cursor-not-allowed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-selected={selected}
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={baseClasses}
    >
      <span className="flex items-center gap-3">
        {emoji && (
          <span className="text-2xl" role="img" aria-hidden="true">
            {emoji}
          </span>
        )}
        <span className="flex-1">{label}</span>
        <span
          className={[
            'flex-shrink-0 w-5 h-5 flex items-center justify-center transition-colors duration-150',
            multi ? 'rounded-md border-2' : 'rounded-full border-2',
            selected
              ? 'border-sage bg-sage'
              : 'border-[#9B9890] bg-white',
          ].join(' ')}
          aria-hidden="true"
        >
          {selected &&
            (multi ? (
              <svg
                viewBox="0 0 12 10"
                fill="none"
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5l3.5 3.5L11 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span className="w-2 h-2 rounded-full bg-white block" />
            ))}
        </span>
      </span>
    </button>
  );
}
