/**
 * PorQueFracaso - manejo de objeciones.
 * "Si ya probaste X, Y, Z y no te funciono... no es tu culpa.
 *  Esto es por que esas soluciones no atacan la causa real."
 *
 * Server component.
 */

import { PROBO_TEXTO, ResultadosParams } from '@/lib/parse-resultados';

interface Props {
  params: ResultadosParams;
}

export function PorQueFracaso({ params }: Props) {
  // Filtrar "nada" porque no es una solucion fracasada
  const probo = params.probo.filter((p) => p !== 'nada' && PROBO_TEXTO[p]);

  return (
    <section className="bg-sage-soft py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold">
          {probo.length > 0
            ? '¿Por qué nada de lo que probaste te funcionó?'
            : '¿Por qué tantas mujeres no logran solucionarlo?'}
        </h2>

        {probo.length > 0 && (
          <p className="mt-6 font-sans text-base md:text-lg text-charcoal leading-relaxed">
            Probaste{' '}
            {probo
              .map((p) => PROBO_TEXTO[p])
              .filter(Boolean)
              .join(', ')}
            . Y nada terminó de funcionar.
          </p>
        )}

        {probo.length > 0 ? (
          <>
            <p className="mt-4 font-sans text-base md:text-lg text-charcoal leading-relaxed">
              <strong>No es tu culpa.</strong> Es que esas soluciones atacan{' '}
              <em>el síntoma</em>, no la causa.
            </p>

            <p className="mt-4 font-sans text-base md:text-lg text-charcoal leading-relaxed">
              Las dietas restrictivas tiran tu metabolismo. Los probióticos genéricos
              no resuelven una microbiota específica como la tuya. Eliminar gluten o
              lactosa funciona si ese es tu problema, pero rara vez lo es.
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 font-sans text-base md:text-lg text-charcoal leading-relaxed">
              <strong>Eso puede ser una ventaja.</strong> Vas a ir directo al protocolo correcto, sin perder tiempo en cosas que no funcionan.
            </p>

            <p className="mt-4 font-sans text-base md:text-lg text-charcoal leading-relaxed">
              La mayoría prueba dietas genéricas, probióticos de farmacia o eliminación de gluten antes de encontrar qué realmente está causando la inflamación. Vos podés saltarte esa etapa de prueba y error.
            </p>
          </>
        )}

        <p className="mt-6 font-serif text-lg md:text-xl text-coral italic">
          Lo que necesitás es un protocolo específico para tu tipo de hinchazón.
        </p>
      </div>
    </section>
  );
}
