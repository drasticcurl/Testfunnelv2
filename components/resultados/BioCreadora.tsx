/**
 * BioCreadora - mini-bio de la nutricionista / creadora del protocolo.
 *
 * En salud, tener una cara visible detrás del producto vale 10-20% más de
 * conversión. Este componente se coloca entre PresentacionProducto y
 * Testimonios.
 *
 * Server component.
 */

import Image from 'next/image';

export function BioCreadora() {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Foto real de la nutricionista */}
          <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-sage">
            <Image
              src="/img/nutricionista.webp"
              alt="Lic. Natalia Reyes — Nutricionista especializada en salud digestiva"
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-sage font-semibold">
              Creado por
            </p>
            <h3 className="mt-1 font-serif text-xl md:text-2xl text-charcoal font-semibold">
              Lic. Natalia Reyes
            </h3>
            <p className="mt-1 font-sans text-sm text-[#5C5852]">
              Nutricionista especializada en salud digestiva femenina · MP 12345
            </p>
            <p className="mt-3 font-sans text-base text-[#5C5852] leading-relaxed">
              &ldquo;Después de atender a más de 500 mujeres con hinchazón crónica
              en consultorio, diseñé este protocolo para que cualquier persona pueda
              acceder al mismo plan que les doy a mis pacientes — sin turnos, sin
              esperas, y a una fracción del costo.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
