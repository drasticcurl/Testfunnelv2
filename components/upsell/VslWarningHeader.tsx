/**
 * VslWarningHeader — encabezado del hero oscuro de /upsell (arriba del VSL).
 *
 * Crea el frame psicológico de "paso crítico / no cierres" que retiene al
 * comprador mientras arranca el video, pero con jerarquía visual limpia:
 *   eyebrow (pill ámbar con punto pulsante) → titular grande → subtítulo corto.
 *
 * Es transparente a propósito: el fondo oscuro lo provee la <section> hero de
 * app/upsell/page.tsx, así el header y el video se ven como un solo bloque
 * "modo cine". Server component (sin estado).
 *
 * Decisiones de diseño (CRO + UI/UX para VSL upsell):
 *  - Fondo oscuro = foco total en el video, sensación premium/urgente.
 *  - Acento ámbar (no rojo chillón) = "importante" sin verse spam.
 *  - Loss-aversion en el titular, una sola palabra resaltada.
 *  - Texto mínimo: un titular + una línea de refuerzo (no muro de texto).
 *
 * Copy fuente: docs/ad-scripts/vsl-upsell-turbo.md (Parte C).
 */

export function VslWarningHeader() {
  return (
    <header className="max-w-content mx-auto px-4 pt-8 md:pt-12 text-center">
      {/* eyebrow: pill ámbar con punto "en vivo" */}
      <span className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-4 py-1.5 font-sans text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] text-warning">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
        </span>
        Tu pedido todavía no está completo
      </span>

      {/* titular con loss-aversion (una palabra clave en ámbar) */}
      <h1 className="mt-5 font-serif text-3xl md:text-5xl font-semibold leading-[1.1] text-white">
        Mirá este video ahora
        <br className="hidden sm:block" />{' '}
        o vas a <span className="text-warning">perder tu acceso</span>
      </h1>

      {/* subtítulo corto: razón + escasez */}
      <p className="mx-auto mt-4 max-w-xl font-sans text-sm md:text-base leading-relaxed text-white/60">
        Es el último paso antes de activar tu pedido. Si salís ahora, perdés el{' '}
        <strong className="font-semibold text-white/90">precio especial</strong> que
        conseguiste hoy.
      </p>
    </header>
  );
}
