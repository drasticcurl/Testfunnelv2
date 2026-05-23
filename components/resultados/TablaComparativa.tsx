/**
 * TablaComparativa - tabla visual que compara el Protocolo vs Nutricionista vs Dietas de Internet.
 * Ancla el valor percibido del producto mostrando que resuelve lo mismo por una fracción del precio.
 *
 * Server component.
 */

const ROWS = [
  {
    criterio: 'Personalizado a tu tipo de hinchazón',
    nutricionista: true,
    dietas: false,
    protocolo: true,
  },
  {
    criterio: 'Te guía día a día con qué comer',
    nutricionista: 'A veces',
    dietas: false,
    protocolo: true,
  },
  {
    criterio: 'Recetas paso a paso incluidas',
    nutricionista: false,
    dietas: 'Algunas',
    protocolo: true,
  },
  {
    criterio: 'Trackea tu progreso con gráficos',
    nutricionista: false,
    dietas: false,
    protocolo: true,
  },
  {
    criterio: 'Resultados visibles en 7 días',
    nutricionista: 'No garantiza',
    dietas: false,
    protocolo: true,
  },
  {
    criterio: 'Acceso inmediato (sin esperar turno)',
    nutricionista: false,
    dietas: true,
    protocolo: true,
  },
  {
    criterio: 'Precio',
    nutricionista: '$30.000–60.000/mes',
    dietas: 'Gratis (no funciona)',
    protocolo: '$9.990 una vez',
  },
];

function CellIcon({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sage/20 text-sage">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return (
    <span className="font-sans text-xs md:text-sm text-[#5C5852] text-center leading-tight">
      {value}
    </span>
  );
}

export function TablaComparativa() {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-4xl text-charcoal text-center font-semibold leading-tight">
          ¿Por qué esto y no otra cosa?
        </h2>

        <p className="mt-4 font-sans text-base md:text-lg text-[#5C5852] text-center max-w-2xl mx-auto leading-relaxed">
          Comparemos tu protocolo con las alternativas que ya conocés.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left font-sans text-xs uppercase tracking-wider text-[#9B9890] pb-4 pr-4">
                  &nbsp;
                </th>
                <th className="font-sans text-xs md:text-sm uppercase tracking-wider text-[#9B9890] pb-4 px-3 text-center whitespace-nowrap">
                  Nutricionista
                </th>
                <th className="font-sans text-xs md:text-sm uppercase tracking-wider text-[#9B9890] pb-4 px-3 text-center whitespace-nowrap">
                  Dietas online
                </th>
                <th className="font-sans text-xs md:text-sm uppercase tracking-wider text-coral pb-4 px-3 text-center whitespace-nowrap font-semibold">
                  Tu Protocolo
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-cream/50' : 'bg-white'}
                >
                  <td className="py-3 md:py-4 pr-4 font-sans text-sm md:text-base text-charcoal">
                    {row.criterio}
                  </td>
                  <td className="py-3 md:py-4 px-3 text-center">
                    <div className="flex justify-center">
                      <CellIcon value={row.nutricionista} />
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-3 text-center">
                    <div className="flex justify-center">
                      <CellIcon value={row.dietas} />
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-3 text-center bg-coral/5 border-x border-coral/10">
                    <div className="flex justify-center">
                      <CellIcon value={row.protocolo} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center font-sans text-sm text-[#5C5852] italic">
          Es como tener una nutricionista en el bolsillo por menos que un delivery.
        </p>
      </div>
    </section>
  );
}
