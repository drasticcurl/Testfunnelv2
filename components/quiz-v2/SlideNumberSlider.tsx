'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SlideV3 } from '@/lib/quiz-v2/types';
import { useQuizStore } from '@/lib/quiz-v2/store';

type SliderSlide = Extract<SlideV3, { type: 'age_slider' | 'number_slider' }>;

interface Props {
  slide: SliderSlide;
  onNext: (value: number) => void;
}

// Tooltip copy por slide
const TOOLTIP_COPY: Record<string, (val: number, unit: string) => string> = {
  edad:         (v) => v < 30 ? '¡Genial! Cuanto antes, mejor 💪' : v < 50 ? '¡Perfecta edad para empezar!' : '¡Nunca es tarde para sentirte increíble!',
  peso_actual:  (v) => `${v} kg registrado ✓`,
  altura:       (v) => `${v} cm registrado ✓`,
  peso_deseado: (v, u) => `¡Ese es un objetivo alcanzable! 🎯`,
};

export function SlideNumberSlider({ slide, onNext }: Props) {
  const answers = useQuizStore((s) => s.answers);

  const isPesoDeseado = slide.id === 'peso_deseado';
  const pesoActual = typeof answers.peso_actual === 'number' ? answers.peso_actual : undefined;

  // Límites dinámicos para "peso ideal":
  //  - max = peso actual (no podés querer pesar MÁS que ahora)
  //  - min = peso actual - 30 (piso 40)
  //  - default = peso actual - 10 (objetivo sugerido razonable)
  const min = (() => {
    if (!isPesoDeseado || pesoActual === undefined) return slide.min;
    return Math.max(40, pesoActual - 30);
  })();

  const max = (() => {
    if (!isPesoDeseado) return slide.max;
    if (pesoActual === undefined) return slide.max;
    return pesoActual;
  })();

  const dynamicDefault = (() => {
    if (!isPesoDeseado || pesoActual === undefined) return slide.defaultValue;
    // objetivo sugerido: actual - 10, acotado al rango [min, max]
    return Math.min(Math.max(pesoActual - 10, min), max);
  })();

  const [value, setValue]           = useState(() => Math.min(Math.max(dynamicDefault, min), max));
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer                = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Garantiza que el valor nunca salga del rango dinámico.
  const safeValue = Math.min(Math.max(value, min), max);
  const progress  = ((safeValue - min) / Math.max(max - min, 1)) * 100;
  const note      = 'note' in slide ? slide.note : undefined;
  const slideId   = slide.id as string;

  // Cuántos kg quiere bajar (solo peso ideal, con peso actual conocido)
  const kgABajar = isPesoDeseado && pesoActual !== undefined
    ? Math.max(0, Math.round(pesoActual - safeValue))
    : 0;

  const triggerTooltip = useCallback(() => {
    setShowTooltip(true);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setShowTooltip(false), 2200);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
    // Mostrar tooltip al hacer mouseup/touchend (cuando suelta el thumb)
  }, []);

  const handlePointerUp = useCallback(() => {
    triggerTooltip();
  }, [triggerTooltip]);

  // Para el slider de edad, mostrar "65+" cuando el valor es >= 65
  const isAgeSlider = slide.type === 'age_slider';
  const displayValue = isAgeSlider && safeValue >= 65 ? '65+' : safeValue;

  const tooltipText = TOOLTIP_COPY[slideId]?.(safeValue, slide.unit) ?? `${safeValue} ${slide.unit} ✓`;

  // Posición horizontal del tooltip (0–100% del track)
  const tooltipLeft = `clamp(10%, ${progress}%, 90%)`;

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <h2
        className="text-2xl md:text-3xl leading-tight mb-10"
        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
      >
        {slide.headline}
      </h2>

      {/* Número grande */}
      <div className="mb-8">
        <span
          className="text-7xl font-bold tabular-nums"
          style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-serif)' }}
        >
          {displayValue}
        </span>
        <span
          className="ml-2 text-2xl font-medium"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
        >
          {slide.unit}
        </span>
        {note && (
          <p className="mt-2 text-xs" style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}>
            {note}
          </p>
        )}
        {isPesoDeseado && kgABajar > 0 && (
          <div className="mt-3">
            <p className="text-base font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
              Querés bajar {kgABajar} kg
            </p>
            <p className="text-sm" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}>
              ¡Es totalmente alcanzable con tu plan personalizado!
            </p>
          </div>
        )}
      </div>

      {/* Slider con tooltip */}
      <div className="px-2 mb-10 relative">
        {/* Tooltip popup sobre el thumb */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, y: 4, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.92 }}
              transition={{ duration: 0.18 }}
              className="absolute -top-12 z-10 pointer-events-none"
              style={{ left: tooltipLeft, transform: 'translateX(-50%)' }}
            >
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-md"
                style={{
                  backgroundColor: 'var(--terracotta)',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {tooltipText}
                {/* Arrow abajo */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                  style={{
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid var(--terracotta)',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="range"
          className="quiz-slider w-full"
          min={min}
          max={max}
          step={1}
          value={safeValue}
          onChange={handleChange}
          onMouseUp={handlePointerUp}
          onTouchEnd={handlePointerUp}
          style={{ '--slider-progress': `${progress}%` } as React.CSSProperties}
        />
        <div
          className="flex justify-between mt-2 text-xs"
          style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}
        >
          <span>{min} {slide.unit}</span>
          <span>{isAgeSlider ? `65+ ${slide.unit}` : `${max} ${slide.unit}`}</span>
        </div>
      </div>

      <button
        type="button"
        className="btn-primary"
        onClick={() => onNext(safeValue)}
      >
        CONTINUAR →
      </button>
    </div>
  );
}
