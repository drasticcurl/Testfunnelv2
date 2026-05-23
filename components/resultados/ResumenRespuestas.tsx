/**
 * ResumenRespuestas - "Según tus respuestas" con bullets dinamicos.
 *
 * Construye 3-5 frases en base a:
 *   - momento_del_dia
 *   - tiempo_con_problema
 *   - cantidad de sintomas
 *   - frecuencia
 *   - impacto emocional
 *
 * Server component.
 */

import {
  EMOCIONES_TEXTO,
  MOMENTO_TEXTO,
  ResultadosParams,
  TIEMPO_TEXTO,
} from '@/lib/parse-resultados';

interface Props {
  params: ResultadosParams;
}

export function ResumenRespuestas({ params }: Props) {
  const bullets: string[] = [];

  if (params.momento) {
    bullets.push(`Notás más hinchazón ${MOMENTO_TEXTO[params.momento]}.`);
  }

  if (params.tiempo) {
    bullets.push(`Convivís con esta hinchazón ${TIEMPO_TEXTO[params.tiempo]}.`);
  }

  if (params.sintomas.length > 0) {
    const SINTOMAS_LABELS: Record<string, string> = {
      gases: 'gases frecuentes',
      pesadez: 'pesadez después de comer',
      estrenimiento: 'estreñimiento',
      panza_marcada: 'panza marcada al final del día',
      eructos: 'eructos constantes',
      fatiga_post_comida: 'cansancio post-comida',
      ruidos: 'ruidos abdominales',
      cansancio: 'cansancio',
      mala_digestion: 'mala digestión',
    };
    const sintomasTexto = params.sintomas
      .map((s) => SINTOMAS_LABELS[s] || s)
      .filter(Boolean);
    if (sintomasTexto.length === 1) {
      bullets.push(`Tu síntoma principal: ${sintomasTexto[0]}.`);
    } else if (sintomasTexto.length <= 3) {
      bullets.push(`Estás teniendo ${sintomasTexto.length} síntomas simultáneos: ${sintomasTexto.join(', ')}.`);
    } else {
      const primeros = sintomasTexto.slice(0, 3).join(', ');
      bullets.push(`Estás teniendo ${sintomasTexto.length} síntomas simultáneos: ${primeros} y ${sintomasTexto.length - 3} más.`);
    }
  }

  if (params.emocion) {
    bullets.push(`Te hace sentir ${EMOCIONES_TEXTO[params.emocion]}.`);
  }

  if (bullets.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold">
          Según tus respuestas:
        </h2>

        <ul className="mt-6 space-y-3">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-3 font-sans text-base md:text-lg text-charcoal leading-relaxed"
            >
              <span className="text-sage flex-shrink-0 mt-1" aria-hidden="true">
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-sans text-base md:text-lg text-[#5C5852] italic">
          Esto no es casualidad. Hay un patrón claro detrás de lo que te pasa, y
          tiene solución.
        </p>
      </div>
    </section>
  );
}
