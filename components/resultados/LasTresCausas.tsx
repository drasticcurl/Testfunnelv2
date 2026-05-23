/**
 * LasTresCausas - explica que la hinchazon cronica tiene 3 causas root.
 * Se conecta con InfoCard #3 del quiz (consistencia narrativa).
 *
 * Server component.
 */

const CAUSAS = [
  {
    numero: '01',
    titulo: 'Disbiosis intestinal',
    body: 'Tu microbiota está desequilibrada: hay bacterias que producen gas en exceso y otras que deberían estar presentes están en bajo número. Eso explica los gases, los ruidos y la pesadez.',
  },
  {
    numero: '02',
    titulo: 'Alimentos inflamatorios "ocultos"',
    body: 'No es el gluten. No es la lactosa. Hay 14 alimentos comunes en cualquier dieta argentina que tu sistema digestivo procesa con dificultad y que están alimentando el problema cada día.',
  },
  {
    numero: '03',
    titulo: 'Eje intestino-cerebro alterado',
    body: 'El estrés crónico ralentiza la digestión. Y la hinchazón empeora el estrés. Es un círculo vicioso que se rompe con técnicas específicas, no con "comer sano".',
  },
];

export function LasTresCausas() {
  return (
    <section className="bg-cream py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-4xl text-charcoal text-center font-semibold leading-tight">
          Las 3 causas reales de tu hinchazón crónica
        </h2>

        <p className="mt-4 font-sans text-base md:text-lg text-[#5C5852] text-center max-w-2xl mx-auto leading-relaxed">
          Una vez que entendés esto, tiene mucho más sentido por qué nada de lo
          que probaste te terminó de funcionar.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6 md:gap-8">
          {CAUSAS.map((c) => (
            <div
              key={c.numero}
              className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-[#EFECE7]"
            >
              <span className="font-serif text-3xl text-coral italic font-semibold">
                {c.numero}
              </span>
              <h3 className="mt-3 font-serif text-xl md:text-2xl text-charcoal font-semibold leading-tight">
                {c.titulo}
              </h3>
              <p className="mt-4 font-sans text-base text-[#5C5852] leading-relaxed">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
