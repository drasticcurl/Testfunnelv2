/**
 * PrecioStack - value stack visual con tachado.
 * Suma el valor percibido y muestra "Hoy pagas: $19.990".
 *
 * Server component.
 */

const ITEMS = [
  { label: 'Protocolo interactivo de 7 días (app día a día)', valor: '9.990' },
  { label: '35 recetas antiinflamatorias paso a paso', valor: '7.990' },
  { label: 'Lista de alimentos inflamatorios + antiinflamatorios', valor: '4.990' },
  { label: 'Diario de síntomas con gráficos de progreso', valor: '4.990' },
  { label: 'Guía de suplementación natural', valor: '3.990' },
];

export function PrecioStack() {
  return (
    <section className="bg-cream py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-4xl text-charcoal text-center font-semibold leading-tight">
          Lo que estás obteniendo
        </h2>

        <div className="mt-10 bg-white rounded-xl p-6 md:p-8 shadow-sm border border-[#EFECE7]">
          <ul className="divide-y divide-[#EFECE7]">
            {ITEMS.map((item, i) => (
              <li
                key={i}
                className="py-3 flex justify-between items-center gap-3 font-sans text-base text-charcoal"
              >
                <span className="flex-1">{item.label}</span>
                <span className="text-[#9B9890] line-through font-semibold">
                  ${item.valor}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t-2 border-[#EFECE7] flex justify-between items-center font-sans text-lg">
            <span className="font-semibold text-charcoal">Valor total:</span>
            <span className="text-[#9B9890] line-through">$44.930</span>
          </div>

          <div className="mt-2 flex justify-between items-center">
            <span className="font-serif text-xl md:text-2xl font-semibold text-charcoal">
              Hoy pagás:
            </span>
            <span className="font-serif text-3xl md:text-4xl font-semibold text-coral">
              $9.990
            </span>
          </div>

          <p className="mt-3 text-center font-sans text-sm text-[#5C5852]">
            Pago único. Acceso instantáneo desde tu celular.
          </p>

          <div className="mt-4 pt-4 border-t border-dashed border-[#EFECE7]">
            <p className="font-sans text-xs text-sage font-semibold uppercase tracking-wider mb-2">
              🎁 Bonus incluidos si comprás hoy:
            </p>
            <ul className="space-y-1 font-sans text-sm text-[#5C5852]">
              <li>✓ Kit Express de Emergencia <span className="text-[#9B9890] line-through ml-1">$7.990</span></li>
              <li>✓ Calculadora de Microbiota <span className="text-[#9B9890] line-through ml-1">$4.990</span></li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center font-sans text-base text-[#5C5852] italic">
          Es menos que un delivery que te va a inflamar.
          <br />
          Y te puede cambiar cómo te sentís todos los días.
        </p>
      </div>
    </section>
  );
}
