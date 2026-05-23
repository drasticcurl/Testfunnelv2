'use client';

interface OptionCardProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick: () => void;
  /** Para multi-choice muestra un checkbox visual */
  multi?: boolean;
  disabled?: boolean;
}

export default function OptionCard({
  label,
  emoji,
  selected = false,
  onClick,
  multi = false,
  disabled = false,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={[
        // Base
        'w-full flex items-center gap-4',
        'px-5 py-4 rounded-lg',
        'border-2 text-left',
        'font-sans text-lg font-medium',
        'transition-all duration-200 ease-out',
        'cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
        // Estado normal
        !selected && !disabled
          ? 'bg-white border-[#EFECE7] text-charcoal hover:border-sage hover:bg-[#E8EFE9] hover:shadow-md'
          : '',
        // Estado seleccionado
        selected
          ? 'bg-[#E8EFE9] border-sage shadow-md text-charcoal'
          : '',
        // Deshabilitado
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Indicador visual (checkbox / radio simulado) */}
      <span
        className={[
          'flex-shrink-0 w-5 h-5 flex items-center justify-center',
          multi ? 'rounded-md border-2' : 'rounded-full border-2',
          selected
            ? 'border-sage bg-sage'
            : 'border-[#9B9890] bg-white',
          'transition-colors duration-150',
        ].join(' ')}
        aria-hidden="true"
      >
        {selected && (
          multi ? (
            // Check icon para multi
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
            // Dot interior para single
            <span className="w-2 h-2 rounded-full bg-white block" />
          )
        )}
      </span>

      {/* Emoji + label */}
      <span className="flex items-center gap-2 flex-1">
        {emoji && (
          <span className="text-xl" role="img" aria-hidden="true">
            {emoji}
          </span>
        )}
        <span>{label}</span>
      </span>
    </button>
  );
}
