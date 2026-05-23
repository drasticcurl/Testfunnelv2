'use client';

interface ProgressBarProps {
  /** Paso actual (base 0) */
  current: number;
  /** Total de pasos */
  total: number;
  /** Mostrar etiqueta de texto encima */
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  className = '',
}: ProgressBarProps) {
  const percent = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-[#5C5852] font-sans">
            Pregunta {current} de {total}
          </span>
          <span className="text-xs font-medium text-[#5C5852] font-sans">
            {percent}%
          </span>
        </div>
      )}

      {/* Track */}
      <div
        className="h-1.5 w-full rounded-full bg-[#EFECE7] overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Pregunta ${current} de ${total}`}
      >
        {/* Fill con gradiente sage → coral */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(to right, #7A9B7E, #E07856)',
          }}
        />
      </div>
    </div>
  );
}
