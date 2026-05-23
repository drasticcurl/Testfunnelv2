/**
 * ComoFunciona - 3 pasos visuales.
 *
 * Server component.
 */

const PASOS = [
  {
    n: '1',
    titulo: 'Accedés al instante',
    body: 'Apenas pagás, te llega un email con acceso a tu app personalizada. Entrás con tu email, sin contraseña. En 30 segundos ya estás adentro.',
  },
  {
    n: '2',
    titulo: 'Seguís el plan día a día',
    body: 'La app te dice exactamente qué comer hoy. Recetas de máximo 25 minutos con ingredientes accesibles. Tu diario trackea cómo te sentís.',
  },
  {
    n: '3',
    titulo: 'Ves resultados al día 3',
    body: 'La mayoría reporta menos pesadez y panza más plana al tercer día. El día 7 es donde se nota el cambio real — y tus gráficos lo confirman.',
  },
];

export function ComoFunciona() {
  return (
    <section className="bg-cream-warm py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-4xl text-charcoal text-center font-semibold leading-tight">
          Cómo funciona
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {PASOS.map((p) => (
            <div key={p.n} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-coral text-white font-serif text-2xl font-semibold">
                {p.n}
              </div>
              <h3 className="mt-4 font-serif text-xl md:text-2xl text-charcoal font-semibold">
                {p.titulo}
              </h3>
              <p className="mt-3 font-sans text-base text-[#5C5852] leading-relaxed">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
