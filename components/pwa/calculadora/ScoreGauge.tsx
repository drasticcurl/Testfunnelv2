'use client';

import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number; // 0–10
  size?: number;
  showLabel?: boolean;
}

/**
 * Gauge SVG semicircular animado con framer-motion.
 * Score de 0 (rojo) a 10 (verde), arco de 180°.
 *
 * Los colores se referencian desde los Design_Tokens (var(--token)) en lugar de
 * literales hex embebidos (Requisito 1.2/7.3).
 */
export default function ScoreGauge({ score, size = 240, showLabel = true }: ScoreGaugeProps) {
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10; // un poco más abajo para que quede centrado visualmente

  // Arco semicircular: de 180° (izquierda) a 0° (derecha)
  const startAngle = 180;
  const endAngle = 0;
  const totalArc = startAngle - endAngle; // 180°

  // Porcentaje del score
  const percentage = Math.min(Math.max(score / 10, 0), 1);
  const sweepAngle = totalArc * percentage;
  const currentAngle = startAngle - sweepAngle;

  // Función para convertir ángulos a coordenadas SVG
  function polarToCartesian(angle: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  }

  // Path del arco de fondo
  const bgStart = polarToCartesian(startAngle);
  const bgEnd = polarToCartesian(endAngle);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Path del arco del score
  const scoreStart = polarToCartesian(startAngle);
  const scoreEnd = polarToCartesian(currentAngle);
  const largeArc = sweepAngle > 180 ? 1 : 0;
  const scorePath =
    percentage > 0
      ? `M ${scoreStart.x} ${scoreStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${scoreEnd.x} ${scoreEnd.y}`
      : '';

  // Circumferencia del semicírculo para animación
  const halfCircumference = Math.PI * radius;

  // Color según score — referenciado desde los Design_Tokens.
  function getScoreColor(s: number): string {
    if (s >= 8) return 'var(--success)';
    if (s >= 6) return 'var(--terracotta)';
    if (s >= 4) return 'var(--warning)';
    return 'var(--error)';
  }

  const scoreColor = getScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Arco de fondo */}
        <path
          d={bgPath}
          fill="none"
          stroke="var(--warm-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Arco del score (animado) */}
        {percentage > 0 && (
          <motion.path
            d={scorePath}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        )}

        {/* Score numérico central */}
        <motion.text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          className="font-heading"
          fontSize="42"
          fontWeight="600"
          fill="var(--charcoal)"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {score.toFixed(1)}
        </motion.text>

        {/* Label "/ 10" */}
        <motion.text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill="var(--muted-light)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        >
          / 10
        </motion.text>

        {/* Labels extremos */}
        <text x={strokeWidth / 2 + 5} y={cy + 30} fontSize="11" fill="var(--muted-light)" textAnchor="start">
          0
        </text>
        <text x={size - strokeWidth / 2 - 5} y={cy + 30} fontSize="11" fill="var(--muted-light)" textAnchor="end">
          10
        </text>
      </svg>

      {showLabel && (
        <motion.p
          className="font-body text-center text-sm font-medium mt-1"
          style={{ color: scoreColor }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          Score de Microbiota
        </motion.p>
      )}
    </div>
  );
}
