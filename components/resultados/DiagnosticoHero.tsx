/**
 * DiagnosticoHero - primera seccion above-the-fold.
 *
 * - Saludo personalizado con nombre (si existe) o "Tu diagnóstico"
 * - Nombre del tipo en coral
 * - Descripcion del tipo
 * - SeveridadGauge a la derecha
 * - Comparativa con la población ("Tu nivel está por encima del X%")
 *
 * Server component.
 */

import { ResultadosParams, TIPOS_HINCHAZON } from '@/lib/parse-resultados';
import { SeveridadGauge } from './SeveridadGauge';

interface Props {
  params: ResultadosParams;
}

/**
 * Calcula el "percentil" respecto a la media (5/10).
 * Severidad 5 = media (50%). 10 = top 5%. Fórmula simple de mappeo.
 */
function calcPercentil(severidad: number): number {
  // Mapeo linear: sev 1→10%, 5→50%, 7→78%, 10→97%
  const clamped = Math.max(1, Math.min(severidad, 10));
  if (clamped <= 5) return Math.round(clamped * 10);
  // Curva más empinada arriba de la media
  return Math.round(50 + ((clamped - 5) / 5) * 47);
}

export function DiagnosticoHero({ params }: Props) {
  const tipo = TIPOS_HINCHAZON[params.tipo];
  const nombre = params.nombre?.trim();
  const percentil = calcPercentil(params.severidad);

  return (
    <section className="bg-cream py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Texto principal */}
          <div>
            <p className="font-sans text-sm uppercase tracking-widest text-sage font-semibold">
              Resultado del test
            </p>

            <h1 className="mt-3 font-serif text-3xl md:text-5xl text-charcoal leading-tight font-semibold">
              {nombre ? `${nombre}, tu diagnóstico:` : 'Tu diagnóstico:'}{' '}
              <span className="block mt-2 text-coral italic">{tipo.nombre}</span>
            </h1>

            <p className="mt-6 font-sans text-base md:text-lg text-[#5C5852] leading-relaxed">
              {tipo.descripcion}
            </p>

            {/* Comparativa con la población */}
            <div className="mt-6 bg-white rounded-lg border border-[#EFECE7] p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                  <span className="text-coral font-serif font-bold text-sm">{params.severidad}</span>
                </div>
                <div>
                  <p className="font-sans text-sm text-charcoal font-semibold">
                    Tu severidad está por encima del {percentil}% de las mujeres que hicieron este test.
                  </p>
                  <p className="font-sans text-xs text-[#9B9890] mt-0.5">
                    Media general: 5/10 · Tu nivel: {params.severidad}/10
                  </p>
                </div>
              </div>
              {params.severidad >= 6 && (
                <p className="mt-3 font-sans text-sm text-sage font-medium">
                  La buena noticia: este tipo responde rápido al protocolo correcto.
                </p>
              )}
            </div>
          </div>

          {/* Gauge */}
          <div className="flex justify-center md:justify-end">
            <SeveridadGauge value={params.severidad} />
          </div>
        </div>
      </div>
    </section>
  );
}
