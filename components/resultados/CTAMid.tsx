/**
 * CTAMid - botón de compra mid-page que aparece después de PresentacionProducto.
 * Para quienes ya están convencidos y no quieren scrollear hasta abajo.
 *
 * Server component (solo un anchor, no necesita client).
 */

export function CTAMid() {
  return (
    <section className="bg-cream py-8 md:py-10">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <a
          href="#cta-final"
          className="inline-block bg-coral text-white px-8 py-4 rounded-full font-sans font-semibold text-base md:text-lg uppercase tracking-wide shadow-lg hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          EMPEZAR MI PROTOCOLO POR $9.990 →
        </a>
        <p className="mt-3 font-sans text-sm text-[#5C5852]">
          Precio de lanzamiento por tiempo limitado.
        </p>
      </div>
    </section>
  );
}
