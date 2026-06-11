/**
 * UpsellHero - bloque superior de /upsell
 *
 * Confirma la compra del front (anti-hinchazón 7 días) y mete al usuario
 * en el frame psicológico de "ya soy comprador, falta un paso más".
 *
 * Server component (sin estado).
 *
 * Diseñado deliberadamente sin botón propio: la conversión ocurre en
 * el bloque siguiente (UpsellOffer). Acá solo "vendemos el momento".
 */

export function UpsellHero() {
  return (
    <section className="bg-cream pt-12 pb-8 md:pt-20 md:pb-12">
      <div className="max-w-content mx-auto px-4 text-center">
        {/* Pill de check arriba */}
        <div className="inline-flex items-center gap-2 bg-sage-soft text-sage-dark font-sans text-sm font-semibold px-4 py-2 rounded-full">
          <CheckIcon />
          ¡Tu Plan de 7 Días está confirmado!
        </div>

        {/* Headline */}
        <h1 className="mt-6 font-serif text-3xl md:text-5xl text-charcoal font-semibold leading-tight">
          Esperá un segundo... <br className="hidden md:block" />
          <span className="text-coral">Falta un último paso.</span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-5 font-sans text-lg md:text-xl text-[#5C5852] max-w-xl mx-auto leading-relaxed">
          Antes de entrar a tu protocolo, tenemos una oferta que solo verás{' '}
          <strong className="text-charcoal">una vez en tu vida</strong> y desaparece
          si cerrás esta página.
        </p>

        {/* Línea fina decorativa */}
        <div className="mt-10 mx-auto w-12 h-px bg-coral-soft" aria-hidden="true" />
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
      <path
        d="M4.5 8L7 10.5L11.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
