/**
 * Garantia - 30 dias money back, asumimos NOSOTROS el riesgo.
 *
 * Server component.
 */

const SOPORTE_EMAIL = 'soporte@anti-hinchazon.com';

export function Garantia() {
  return (
    <section className="bg-sage-soft py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl p-6 md:p-10 border-2 border-sage flex flex-col md:flex-row items-start md:items-center gap-6">
          <div
            className="flex-shrink-0 w-20 h-20 rounded-full bg-sage flex items-center justify-center text-white"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-10 h-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-sage font-semibold">
              cero riesgo
            </p>
            <h3 className="mt-1 font-serif text-2xl md:text-3xl text-charcoal font-semibold leading-tight">
              Garantía Total 30 días
            </h3>

            <p className="mt-3 font-sans text-base md:text-lg text-charcoal leading-relaxed">
              Probálo durante <strong>30 días completos</strong>. Si no notás
              cambios reales en cómo te sentís —menos hinchazón, mejor digestión,
              menos pesadez— te devolvemos cada centavo.
            </p>

            <p className="mt-3 font-sans text-base text-[#5C5852] leading-relaxed">
              Sin preguntas. Sin formularios largos. Sin tener que demostrar
              nada. Un email a{' '}
              <a
                href={`mailto:${SOPORTE_EMAIL}`}
                className="text-coral font-semibold underline"
              >
                {SOPORTE_EMAIL}
              </a>{' '}
              y la plata vuelve.
            </p>

            <p className="mt-4 font-sans text-base text-charcoal italic font-medium">
              Asumimos nosotros el riesgo. Vos solo asumís el compromiso de
              probarlo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
