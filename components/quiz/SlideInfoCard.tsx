'use client';

/**
 * SlideInfoCard - slide tipo info_card entre preguntas.
 *
 * Tres modos de render:
 *   1. variant='infographic' + infographicKey → render hardcoded local
 *      (SVG/CSS, sin dependencias externas). Usado para info_1.
 *   2. slide.image (legacy) → muestra solo la imagen + botón.
 *      DEPRECATED: depende de Cloudinary, falla en 3G LATAM.
 *   3. default (text) → fondo sage-soft + título + body + source + botón.
 */

import { Slide } from '@/lib/quiz-types';
import Button from '@/components/ui/Button';

type InfoCardSlide = Extract<Slide, { type: 'info_card' }>;

interface Props {
  slide: InfoCardSlide;
  onContinue: () => void;
}

export function SlideInfoCard({ slide, onContinue }: Props) {
  // Modo 1: infografía hardcoded (sin asset externo)
  if (slide.variant === 'infographic' && slide.infographicKey) {
    return (
      <Infographic
        infographicKey={slide.infographicKey}
        ctaLabel={slide.ctaLabel}
        onContinue={onContinue}
      />
    );
  }



  // Modo 3: texto (default)
  return (
    <div className="bg-sage-soft rounded-xl p-8 md:p-12 text-center">
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight font-semibold">
        {slide.title}
      </h2>

      <p className="mt-6 font-sans text-base md:text-lg text-charcoal leading-relaxed max-w-xl mx-auto">
        {slide.body}
      </p>

      {slide.source && (
        <p className="mt-4 font-sans text-sm text-[#5C5852] italic">
          — {slide.source}
        </p>
      )}

      <Button
        variant="secondary"
        size="lg"
        className="mt-10"
        onClick={onContinue}
      >
        {(slide.ctaLabel || 'CONTINUAR').toUpperCase()} →
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Infografías hardcoded
// ─────────────────────────────────────────────────────────────────────────

function Infographic({
  infographicKey,
  ctaLabel,
  onContinue,
}: {
  infographicKey: string;
  ctaLabel?: string;
  onContinue: () => void;
}) {
  // Mapa de infografías. Agregar nuevas acá cuando se necesiten.
  const node =
    infographicKey === 'inflamacion_vs_grasa' ? (
      <InflamacionVsGrasa />
    ) : (
      // Fallback para infographicKey desconocido — no rompe el flujo
      <p className="font-serif text-xl text-charcoal text-center">
        Infografía no disponible.
      </p>
    );

  return (
    <div className="flex flex-col items-center">
      {node}
      <Button
        variant="secondary"
        size="lg"
        className="mt-8"
        onClick={onContinue}
      >
        {(ctaLabel || 'CONTINUAR').toUpperCase()} →
      </Button>
    </div>
  );
}

/**
 * InflamacionVsGrasa — info_1
 *
 * Mensaje:
 *   "El 73% de las mujeres adultas confunde inflamación con grasa abdominal"
 *
 * Visual:
 *   - Donut chart 73 / 27 (inflamación vs grasa real)
 *   - Headline + reframe
 *   - Card destacada: "Las dietas de peso NO resuelven inflamación"
 *   - Source: Journal of Gastroenterology, 2023
 */
function InflamacionVsGrasa() {
  // SVG donut: stroke-dasharray para los 2 segmentos
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const inflamacionPct = 73;
  const grasaPct = 27;
  const inflamacionLen = (inflamacionPct / 100) * circumference;
  const grasaLen = (grasaPct / 100) * circumference;

  return (
    <div className="bg-sage-soft rounded-xl p-6 md:p-10 w-full max-w-md text-center">
      {/* Headline arriba */}
      <p className="font-sans text-xs uppercase tracking-widest text-sage font-semibold">
        Dato científico
      </p>

      {/* Donut chart */}
      <div className="mt-5 flex justify-center" aria-hidden="true">
        <svg viewBox="0 0 160 160" className="w-44 h-44">
          {/* Background ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#EFECE7"
            strokeWidth="20"
          />
          {/* Inflamación segment (73%) — coral */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#E07856"
            strokeWidth="20"
            strokeDasharray={`${inflamacionLen} ${circumference}`}
            transform="rotate(-90 80 80)"
            strokeLinecap="butt"
          />
          {/* Grasa segment (27%) — sage */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#7A9B7E"
            strokeWidth="20"
            strokeDasharray={`${grasaLen} ${circumference}`}
            strokeDashoffset={-inflamacionLen}
            transform="rotate(-90 80 80)"
            strokeLinecap="butt"
          />
          {/* Texto central */}
          <text
            x="80"
            y="76"
            textAnchor="middle"
            className="font-serif"
            fontSize="32"
            fontWeight="600"
            fill="#2D3A2E"
          >
            73%
          </text>
          <text
            x="80"
            y="96"
            textAnchor="middle"
            fontSize="10"
            fill="#5C5852"
            fontFamily="Inter, sans-serif"
          >
            es inflamación
          </text>
        </svg>
      </div>

      {/* Leyenda */}
      <div className="mt-2 flex justify-center gap-5 font-sans text-xs">
        <div className="flex items-center gap-1.5">
          <span className="block w-3 h-3 rounded-sm bg-coral" aria-hidden="true" />
          <span className="text-charcoal font-medium">73% Inflamación intestinal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="block w-3 h-3 rounded-sm bg-sage" aria-hidden="true" />
          <span className="text-charcoal font-medium">27% Grasa abdominal real</span>
        </div>
      </div>

      {/* Headline principal */}
      <h2 className="mt-6 font-serif text-xl md:text-2xl text-charcoal leading-tight font-semibold">
        El <span className="text-coral">73%</span> de las mujeres adultas confunde inflamación con grasa abdominal.
      </h2>

      {/* Card destacada con el reframe */}
      <div className="mt-5 bg-white border-l-4 border-coral rounded p-4 text-left">
        <p className="font-sans text-sm md:text-base text-charcoal leading-relaxed">
          <strong>Las dietas de peso no resuelven inflamación.</strong>{' '}
          Si tu panza es por inflamación, podés bajar 5 kg y seguir hinchada.
        </p>
      </div>

      {/* Fuente */}
      <p className="mt-4 font-sans text-xs text-[#9B9890] italic">
        Journal of Gastroenterology, 2023
      </p>
    </div>
  );
}
