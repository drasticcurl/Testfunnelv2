'use client';

/**
 * Slider — componente de slider numérico reutilizable.
 * Usa .quiz-slider de globals.css para el estilo cross-browser.
 */

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  note?: string;
  showValue?: boolean;
}

export function Slider({
  min,
  max,
  value,
  onChange,
  unit,
  note,
  showValue = true,
}: SliderProps) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {showValue && (
        <div className="text-center mb-6">
          <span
            className="text-7xl font-bold tabular-nums"
            style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-serif)' }}
          >
            {value}
          </span>
          {unit && (
            <span
              className="ml-2 text-2xl font-medium"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
            >
              {unit}
            </span>
          )}
          {note && (
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}
            >
              {note}
            </p>
          )}
        </div>
      )}

      <input
        type="range"
        className="quiz-slider w-full"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--slider-progress': `${progress}%` } as React.CSSProperties}
      />

      <div
        className="flex justify-between mt-2 text-xs"
        style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}
      >
        <span>{min}{unit ? ` ${unit}` : ''}</span>
        <span>{max}{unit ? ` ${unit}` : ''}</span>
      </div>
    </div>
  );
}
