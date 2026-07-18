'use client';

import { motion } from 'framer-motion';
import { getNombre } from '@/lib/quiz-v2/helpers';
import { useQuizStore } from '@/lib/quiz-v2/store';

interface Props {
  onNext: () => void;
}

/**
 * SlideExpertBridgeLatam — fork neutro (español "tú") de SlideExpertBridge.
 * Misma estructura/estilo/props. Copy neutralizado: "Podés"→"Puedes" y se
 * quitan referencias argentinas (matrícula MN 9283, UBA, SAN).
 */
export function SlideExpertBridgeLatam({ onNext }: Props) {
  const answers = useQuizStore((s) => s.answers);
  const nombre  = getNombre(answers);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: 'var(--terracotta-soft)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center gap-6">

        {/* Título */}
        <div>
          <p
            className="text-xs uppercase tracking-widest font-semibold mb-2"
            style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
          >
            Tu diagnóstico personalizado
          </p>
          <h2
            className="text-2xl md:text-3xl leading-tight"
            style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
          >
            {nombre ? `${nombre}, tu plan` : 'Tu plan'} será realizado por la Lic. Natalia Reyes
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
            Creadora del Método del Agua de Arroz · Puedes ajustar tus objetivos durante el diagnóstico
          </p>
        </div>

        {/* Card experta */}
        <div
          className="w-full p-6 rounded-3xl border flex flex-col items-center gap-4"
          style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}
        >
          {/* Foto */}
          <div className="relative">
            <img
              src="/img/natalia-reyes.jpg"
              alt="Lic. Natalia Reyes"
              className="w-24 h-24 rounded-full object-cover border-4"
              style={{ borderColor: 'var(--terracotta)' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Ccircle cx="48" cy="48" r="48" fill="%23FFF5F0"/%3E%3Ctext x="48" y="60" text-anchor="middle" font-size="40"%3E👩‍⚕️%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* Info */}
          <div>
            <p className="font-semibold text-base" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
              Lic. Natalia Reyes
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
              Nutricionista · Especialista en Salud Digestiva y Metabolismo Femenino
            </p>
          </div>

          {/* Credenciales académicas */}
          <div className="w-full flex flex-col gap-3 text-left">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🎓</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
                Especialista en Nutrición y Metabolismo Femenino, con aportes académicos sobre el impacto de la inflamación intestinal en la calidad de vida de las mujeres.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🌍</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
                Posgrado internacional en Nutrición Clínica por la Universidad de Barcelona, España.
              </p>
            </div>
          </div>

          {/* Social proof */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#FFF9C4', color: '#B45309', fontFamily: 'var(--font-sans)' }}
          >
            ⭐ +3.200 diagnósticos realizados
          </div>
        </div>

        {/* CTA */}
        <button type="button" onClick={onNext} className="btn-primary w-full">
          Generar mi diagnóstico personalizado →
        </button>

      </div>
    </motion.div>
  );
}
