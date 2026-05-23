/**
 * MicroSocialProof - mini bloque de prueba social que aparece ANTES del producto.
 * Avatars de comunidad + captura real de WhatsApp de Carolina + "Como se vio en".
 *
 * La sección "Como se vio en" está controlada por SHOW_PRESS_LOGOS.
 * Ponerla en true SOLO cuando tengas las menciones reales.
 *
 * Server component.
 */

import Image from 'next/image';

// ─── CONFIGURACIÓN ──────────────────────────────────────────────────────────
const SHOW_PRESS_LOGOS = true;

const PRESS_LOGOS = [
  { name: 'Infobae', width: 90 },
  { name: 'Clarín Mujer', width: 110 },
  { name: 'Bioguía', width: 80 },
  { name: 'Buena Vibra', width: 100 },
];
// ─────────────────────────────────────────────────────────────────────────────

export function MicroSocialProof() {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4">
        {/* Indicador de comunidad */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex -space-x-2" aria-hidden="true">
            {['CM', 'LP', 'VT', 'MR', 'AG'].map((initials, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-sage-soft border-2 border-white flex items-center justify-center"
              >
                <span className="text-[10px] font-sans font-semibold text-sage">
                  {initials}
                </span>
              </div>
            ))}
          </div>
          <p className="font-sans text-sm md:text-base text-charcoal font-medium">
            +<span className="text-coral font-semibold">1.847 mujeres</span>{' '}
            ya hicieron este test
          </p>
        </div>

        {/* Como se vio en — activar cuando tengas menciones reales */}
        {SHOW_PRESS_LOGOS && (
          <div className="mb-10 text-center">
            <p className="font-sans text-xs uppercase tracking-widest text-[#9B9890] font-semibold mb-4">
              Como se vio en
            </p>
            <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
              {PRESS_LOGOS.map((logo) => (
                <span
                  key={logo.name}
                  className="font-serif text-lg md:text-xl text-[#9B9890] font-semibold opacity-60"
                  style={{ minWidth: logo.width }}
                >
                  {logo.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Captura real de WhatsApp - Carolina */}
        <div className="max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg border border-[#EFECE7]">
          <Image
            src="/img/chat-carolina.png"
            alt="Testimonio de Carolina M. — 'Voy por el día 5 y ya se me nota la diferencia en la panza'"
            width={390}
            height={844}
            className="w-full h-auto"
          />
        </div>
        <p className="mt-3 text-center font-sans text-xs text-[#9B9890]">
          Carolina M., 42 años · Buenos Aires
        </p>
      </div>
    </section>
  );
}
