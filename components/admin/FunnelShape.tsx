'use client';

/**
 * FunnelShape — embudo HORIZONTAL con forma real de embudo (trapecios que se
 * angostan de izquierda a derecha). Reutilizable: lo usa el Resumen (modo
 * compacto) y el detalle del Embudo.
 *
 * El alto de cada segmento es proporcional a `pct` (0..100). El primer paso
 * suele ser 100% (referencia). Hover muestra tooltip con nombre + count.
 */

import { useMemo, useState } from 'react';

export type FunnelStep = {
  name: string;
  pct: number;
  count: number;
  /** Marca el paso de mayor caída (se pinta en rosa). */
  worst?: boolean;
};

const GRADIENT = [
  '#6366f1', '#7c5cfc', '#8b5cf6', '#a855f7', '#c026d3',
  '#d6409f', '#e1457f', '#ec4860', '#10b981', '#059669',
];

export function FunnelShape({
  steps,
  height = 260,
  minWidth = 720,
  showNames = true,
}: {
  steps: FunnelStep[];
  height?: number;
  minWidth?: number;
  showNames?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 1000;
  const H = height;
  const PAD = 28;
  const usableW = W - PAD * 2;
  const segW = steps.length > 0 ? usableW / steps.length : usableW;
  const maxH = H - 76;
  const centerY = (H - 26) / 2;

  const colors = useMemo(
    () => steps.map((_, i) => GRADIENT[Math.floor((i / Math.max(steps.length - 1, 1)) * (GRADIENT.length - 1))]),
    [steps],
  );

  if (steps.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
        Sin datos para mostrar.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        style={{ minWidth }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {steps.map((step, i) => {
            const base = step.worst ? '#f43f5e' : colors[i];
            return (
              <linearGradient id={`fs-grad-${i}`} key={i} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={base} stopOpacity={0.95} />
                <stop offset="100%" stopColor={base} stopOpacity={0.55} />
              </linearGradient>
            );
          })}
        </defs>

        {steps.map((step, i) => {
          const x = PAD + i * segW;
          const thisH = Math.max((step.pct / 100) * maxH, 6);
          const nextH =
            i < steps.length - 1
              ? Math.max((steps[i + 1].pct / 100) * maxH, 6)
              : thisH * 0.82;

          const topL = centerY - thisH / 2;
          const botL = centerY + thisH / 2;
          const topR = centerY - nextH / 2;
          const botR = centerY + nextH / 2;
          const isHov = hovered === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <polygon
                points={`${x},${topL} ${x + segW},${topR} ${x + segW},${botR} ${x},${botL}`}
                fill={`url(#fs-grad-${i})`}
                opacity={isHov ? 1 : 0.9}
                stroke={step.worst ? '#fb7185' : 'rgba(255,255,255,0.10)'}
                strokeWidth={step.worst ? 2 : 0.75}
              />
              {thisH > 22 && (
                <text
                  x={x + segW / 2}
                  y={centerY + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={12}
                  fontWeight={700}
                >
                  {step.pct.toFixed(0)}%
                </text>
              )}
              {showNames && (
                <text
                  x={x + segW / 2}
                  y={H - 8}
                  textAnchor="middle"
                  fill={step.worst ? '#fb7185' : '#8a8a99'}
                  fontSize={9}
                  fontWeight={step.worst ? 700 : 400}
                >
                  {truncate(step.name, 16)}
                </text>
              )}
              {isHov && (
                <g>
                  <rect
                    x={Math.min(Math.max(x + segW / 2 - 64, 2), W - 130)}
                    y={Math.max(topL - 42, 2)}
                    width={128}
                    height={34}
                    rx={6}
                    fill="#0a0a0f"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={1}
                  />
                  <text
                    x={Math.min(Math.max(x + segW / 2, 66), W - 66)}
                    y={Math.max(topL - 28, 16)}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={10}
                    fontWeight={700}
                  >
                    {truncate(step.name, 20)}: {step.pct.toFixed(1)}%
                  </text>
                  <text
                    x={Math.min(Math.max(x + segW / 2, 66), W - 66)}
                    y={Math.max(topL - 15, 29)}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize={9}
                  >
                    {step.count.toLocaleString('es-AR')} personas
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
