/**
 * SeveridadGauge - semicirculo SVG con el nivel de inflamacion 0-10.
 * Color del arco segun severidad:
 *   1-4: sage (verde)
 *   5-7: warning (amarillo/ambar)
 *   8-10: coral (alerta)
 *
 * Server component (sin estado, sin interaccion).
 */

interface Props {
  value: number; // 0-10
}

export function SeveridadGauge({ value }: Props) {
  const safe = Math.max(0, Math.min(10, value));
  const percent = safe / 10;

  // Color del arco segun severidad
  const color =
    safe <= 4 ? '#7A9B7E' : safe <= 7 ? '#D9A441' : '#E07856';

  // Geometria del semicirculo (radio 80, centro en 100,100, abre hacia arriba)
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - percent);

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 110"
        className="w-48 md:w-56"
        role="img"
        aria-label={`Nivel de inflamacion ${safe} de 10`}
      >
        {/* Track de fondo */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#EFECE7"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Arco del valor */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
        />
        {/* Numero central */}
        <text
          x={cx}
          y={cy - 18}
          textAnchor="middle"
          className="font-serif"
          fontSize="36"
          fontWeight="600"
          fill="#2D3A2E"
        >
          {safe}
        </text>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize="12"
          fill="#5C5852"
          fontFamily="Inter, sans-serif"
        >
          / 10
        </text>
      </svg>

      <p className="mt-2 font-sans text-sm text-[#5C5852] text-center">
        Tu nivel de inflamación: <strong className="text-charcoal">{safe}/10</strong>
      </p>
    </div>
  );
}
