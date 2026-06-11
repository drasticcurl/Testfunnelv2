'use client';

/**
 * QuizProgressV2 — barra de progreso con label de sección.
 * Estilo MusesAcademy: muestra la sección actual arriba (ej: "Tu perfil digestivo")
 * y una barra de progreso que llena dentro de esa sección.
 */

import { slidesV2, getProgressSection, PROGRESS_SECTIONS } from '@/lib/quiz-v2/data';

interface Props {
  currentSlide: number;
}

export function QuizProgressV2({ currentSlide }: Props) {
  const section = getProgressSection(currentSlide);
  const totalSlides = slidesV2.length;

  // Overall progress
  const percent = Math.min(((currentSlide + 1) / totalSlides) * 100, 100);

  // Section progress (within current section)
  const sectionIdx = PROGRESS_SECTIONS.findIndex((s) => s.label === section);
  const sectionStart = sectionIdx > 0 ? PROGRESS_SECTIONS[sectionIdx - 1].upTo + 1 : 0;
  const sectionEnd = PROGRESS_SECTIONS[sectionIdx]?.upTo ?? totalSlides;
  const sectionTotal = sectionEnd - sectionStart + 1;
  const sectionProgress = Math.min(((currentSlide - sectionStart + 1) / sectionTotal) * 100, 100);

  return (
    <div className="px-5 pt-5 pb-2">
      <div className="max-w-2xl mx-auto">
        {/* Section label */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-xs font-medium text-sage uppercase tracking-wider">
            {section}
          </span>
          <span className="font-sans text-xs text-[#9B9890]">
            {Math.round(percent)}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 bg-[#EFECE7] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(sectionProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${section} — ${Math.round(sectionProgress)}%`}
        >
          <div
            className="h-full bg-gradient-to-r from-sage to-sage-dark transition-all duration-500 ease-out rounded-full"
            style={{ width: `${sectionProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
