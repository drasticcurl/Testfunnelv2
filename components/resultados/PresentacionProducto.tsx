/**
 * PresentacionProducto - "Te presento el Protocolo Anti-Hinchazon de 7 dias".
 * Headline + bullets de lo que incluye + mockups de la app + seccion "por que es diferente".
 *
 * Server component.
 */

import Image from 'next/image';
import { ResultadosParams, TIPOS_HINCHAZON } from '@/lib/parse-resultados';

interface Props {
  params: ResultadosParams;
}

const INCLUYE = [
  'Protocolo interactivo de 7 días: tu app te dice exactamente qué comer cada día',
  'Lista de los 14 alimentos inflamatorios que tenés que sacar de tu dieta',
  'Lista de los 21 alimentos antiinflamatorios que te desinflan activamente',
  '35 recetas antiinflamatorias paso a paso (todas de menos de 25 min)',
  'Guía de suplementación natural (sin pastillas obligatorias)',
  'Diario de síntomas con gráficos que te muestran tu progreso día a día',
];

const MOCKUPS = [
  { src: '/img/mockup-dashboard.png', alt: 'Dashboard del protocolo — tu plan día a día' },
  { src: '/img/mockup-guias.png', alt: 'Guías: alimentos inflamatorios, antiinflamatorios, suplementación y ritual' },
  { src: '/img/mockup-recetas.png', alt: 'Recetas express antiinflamatorias' },
];

export function PresentacionProducto({ params }: Props) {
  const tipo = TIPOS_HINCHAZON[params.tipo];

  return (
    <section className="bg-sage-soft py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <p className="font-sans text-sm uppercase tracking-widest text-coral font-semibold text-center">
          La solución
        </p>

        <h2 className="mt-4 font-serif text-3xl md:text-5xl text-center font-semibold leading-tight text-charcoal">
          Protocolo Anti-Hinchazón
          <span className="block mt-1 italic text-coral">de 7 días</span>
        </h2>

        <p className="mt-6 font-sans text-base md:text-lg text-center max-w-2xl mx-auto leading-relaxed text-[#5C5852]">
          Una app personalizada que te guía día a día para revertir{' '}
          <strong className="text-charcoal">{tipo.nombre.toLowerCase()}</strong> en
          una semana. Sin dietas extremas, sin pastillas, sin ayuno intermitente
          forzado.
        </p>

        {/* Mockups de la app */}
        <div className="mt-10 grid grid-cols-3 gap-3 md:gap-5 max-w-2xl mx-auto">
          {MOCKUPS.map((mockup, i) => (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden shadow-xl border border-[#EFECE7]"
            >
              <Image
                src={mockup.src}
                alt={mockup.alt}
                width={390}
                height={844}
                className="w-full h-auto"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        <p className="mt-4 font-sans text-sm text-[#9B9890] text-center">
          Así se ve tu protocolo desde el celular — accedés al instante después de comprar.
        </p>

        <div className="mt-12 bg-white rounded-xl p-6 md:p-10 border border-[#EFECE7]">
          <h3 className="font-serif text-xl md:text-2xl text-charcoal font-semibold">
            Lo que te llevás:
          </h3>

          <ul className="mt-6 space-y-3">
            {INCLUYE.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 font-sans text-base text-charcoal leading-relaxed"
              >
                <span
                  className="text-coral flex-shrink-0 font-semibold mt-0.5"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Por qué esto es diferente */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl md:text-3xl text-center font-semibold leading-tight text-charcoal">
            Por qué esto es diferente a todo lo que probaste
          </h3>

          <div className="mt-8 space-y-6 font-sans text-base md:text-lg leading-relaxed">
            <p className="text-[#5C5852]">
              No es un PDF que descargás y no abrís nunca más.
            </p>

            <p className="text-[#5C5852]">
              Es una app que te acompaña <strong className="text-charcoal">día a día</strong>.
              Te dice qué comer, trackea cómo te sentís, y te muestra la mejora en gráficos reales.
            </p>

            <p className="text-coral font-semibold">
              Un protocolo interactivo tiene mucha más adherencia que un PDF porque te guía paso a paso — y tu progreso se ve en tiempo real.
            </p>

            <p className="text-[#5C5852]">
              Es como tener una nutricionista en el bolsillo por $9.990.
              <br />
              <span className="text-coral font-semibold">Menos que un delivery que te va a inflamar.</span>
            </p>

            <p className="italic text-[#9B9890]">
              Tu intestino no se va a desinflamar leyendo — necesitás un plan que te guíe cada día.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
