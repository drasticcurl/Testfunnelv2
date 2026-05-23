/**
 * Testimonios - cards con quotes (sin capturas WhatsApp para mantener mobile corto).
 * La captura de Carolina ya está arriba en MicroSocialProof.
 *
 * Server component.
 */

const TESTIS = [
  {
    iniciales: 'LP',
    nombre: 'Lucía P.',
    contexto: '38 años · Córdoba',
    quote:
      'Pensé que era otra cosa más que no iba a funcionar. Pero el día 4 después de almorzar me di cuenta que NO me había hinchado. Primera vez en meses.',
  },
  {
    iniciales: 'VT',
    nombre: 'Verónica T.',
    contexto: '51 años · Mendoza',
    quote:
      'Me medí la panza el día 1 y al día 7. Bajé 3cm sin hacer dieta ni pasar hambre. Lo que más me sirvió fue entender qué alimentos me inflaman a MÍ.',
  },
  {
    iniciales: 'MR',
    nombre: 'Mariana R.',
    contexto: '35 años · Rosario',
    quote:
      'Lo arranqué sin mucha fe porque ya probé mil cosas. Al día 3 me levanté sin la panza de siempre. Mi marido me preguntó qué estaba haciendo diferente.',
  },
];

export function Testimonios() {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-4xl text-charcoal text-center font-semibold leading-tight">
          Lo que dicen las que ya lo hicieron
        </h2>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {TESTIS.map((t) => (
            <article
              key={t.iniciales}
              className="bg-cream rounded-xl p-6 md:p-7 border border-[#EFECE7] flex flex-col"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full bg-sage-soft flex items-center justify-center font-serif text-lg text-sage font-semibold"
                  aria-hidden="true"
                >
                  {t.iniciales}
                </div>
                <div>
                  <p className="font-sans text-sm text-charcoal font-semibold">
                    {t.nombre}
                  </p>
                  <p className="font-sans text-xs text-[#5C5852]">{t.contexto}</p>
                </div>
              </div>

              <blockquote className="mt-4 font-sans text-base text-charcoal leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="mt-4 flex items-center justify-between">
                <div
                  className="flex gap-1 text-coral"
                  aria-label="5 estrellas"
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>★</span>
                  ))}
                </div>
                <span className="text-xs text-sage font-semibold">✓ Compradora verificada</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
