/**
 * ParaQuienNoEs - sección de disqualification / qualification.
 * "Para quién NO es esto" genera confianza (no estás desesperado por vender).
 * "Para quién SÍ es" hace que la persona que aplica se auto-seleccione.
 *
 * Ubicación: entre Testimonios y PrecioStack.
 *
 * Server component.
 */

const NO_ES_PARA = [
  'Buscás una pastilla mágica que lo resuelva sin hacer nada',
  'No estás dispuesta a dedicar 10 minutos al día durante 7 días',
  'Necesitás atención médica urgente (dolor severo, sangrado, pérdida de peso inexplicable)',
  'Querés un plan de nutricionista con consultas personalizadas',
];

const SI_ES_PARA = [
  'Ya probaste de todo y nada te terminó de funcionar',
  'Querés un plan simple que te diga exactamente qué hacer cada día',
  'Estás harta de sentirte hinchada, pesada y sin energía',
  'Preferís algo que podés arrancar HOY, sin esperar turnos ni pagar una fortuna',
  'Querés entender qué alimentos te inflaman a VOS, no a "todas"',
];

export function ParaQuienNoEs() {
  return (
    <section className="bg-cream py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal text-center font-semibold leading-tight">
          ¿Es para vos?
        </h2>

        <div className="mt-10 grid md:grid-cols-2 gap-6 md:gap-8">
          {/* NO es para vos */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-[#EFECE7]">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <h3 className="font-serif text-lg md:text-xl text-charcoal font-semibold">
                Esto NO es para vos si:
              </h3>
            </div>

            <ul className="space-y-3">
              {NO_ES_PARA.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-sans text-sm md:text-base text-[#5C5852] leading-relaxed"
                >
                  <span className="text-red-300 flex-shrink-0 mt-0.5" aria-hidden="true">
                    ✗
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SÍ es para vos */}
          <div className="bg-white rounded-xl p-6 md:p-8 border-2 border-sage/30">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sage/20 text-sage">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <h3 className="font-serif text-lg md:text-xl text-charcoal font-semibold">
                Esto SÍ es para vos si:
              </h3>
            </div>

            <ul className="space-y-3">
              {SI_ES_PARA.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-sans text-sm md:text-base text-charcoal leading-relaxed"
                >
                  <span className="text-sage flex-shrink-0 mt-0.5 font-semibold" aria-hidden="true">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
