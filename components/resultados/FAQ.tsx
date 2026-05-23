'use client';

/**
 * FAQ - acordeon con preguntas frecuentes actualizadas para la PWA.
 */

import { useState } from 'react';

const FAQS = [
  {
    q: '¿Cómo recibo el producto?',
    a: 'Después de pagar, te llega un email con acceso instantáneo a la app. Entrás con tu email, sin crear contraseña. En menos de 30 segundos ya tenés todo disponible.',
  },
  {
    q: '¿Necesito descargar algo?',
    a: 'No. Es una web app que funciona directo desde el navegador de tu celular. Si querés, podés instalarla como app tocando "Añadir a pantalla de inicio" y queda como cualquier otra app.',
  },
  {
    q: '¿Funciona en iPhone y Android?',
    a: 'Sí, funciona en cualquier celular con navegador moderno (Safari, Chrome, Firefox). No importa si es iPhone o Android.',
  },
  {
    q: '¿Puedo acceder desde la computadora?',
    a: 'Sí, pero está diseñada para el celular — así la tenés siempre a mano cuando necesitás ver qué comer o registrar cómo te sentís.',
  },
  {
    q: '¿Sirve si tengo intolerancias o restricciones?',
    a: 'Sí. El plan tiene alternativas para sin gluten, sin lactosa y vegetarianas. Si tenés una condición médica específica, consultá con tu médico antes de empezar.',
  },
  {
    q: '¿Funciona si trabajo todo el día y no tengo tiempo de cocinar?',
    a: 'Sí. Las recetas son todas de máximo 25 minutos con ingredientes que conseguís en cualquier supermercado.',
  },
  {
    q: '¿Cuánto tarda en hacer efecto?',
    a: 'La mayoría reporta menos hinchazón a partir del día 3. El cambio más significativo se ve al día 7 — y tu diario de síntomas te muestra la evolución en gráficos.',
  },
  {
    q: '¿Y si no me funciona? ¿Cómo pido el reembolso?',
    a: 'Tenés 30 días desde tu compra para pedir reembolso. Mandás un email a soporte@anti-hinchazon.com con tu nombre y el email con el que compraste, y te devolvemos el 100% del importe. Sin tener que dar explicaciones ni demostrar nada. La idea es que pruebes el método sin riesgo: si no sentís diferencia, no te cuesta nada.',
  },
  {
    q: '¿Sirve también para hombres?',
    a: 'Sí, funciona para cualquier persona con hinchazón crónica. Lo escribimos pensando en mujeres porque son nuestra audiencia principal, pero el contenido es universal.',
  },
  {
    q: '¿Funciona si tengo SOP, hipotiroidismo o endometriosis?',
    a: 'Sí. El protocolo trabaja sobre alimentación antiinflamatoria, que beneficia cualquier condición donde la inflamación es un factor (como SOP, hipo, endo). No reemplaza tu tratamiento médico, pero lo complementa.',
  },
  {
    q: '¿Puedo escribirles si tengo dudas?',
    a: 'Sí. Mandanos un email a soporte@anti-hinchazon.com y te respondemos en menos de 24 hs hábiles.',
  },
  {
    q: '¿Qué pasa si no veo resultados al día 3?',
    a: 'Cada cuerpo es diferente. La mayoría nota cambios al día 3-4, pero algunas necesitan el ciclo completo de 7 días. Si al día 30 no sentiste mejora, pedís tu reembolso y listo.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="bg-cream py-12 md:py-16">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-4xl text-charcoal text-center font-semibold leading-tight">
          Preguntas frecuentes
        </h2>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden border border-[#EFECE7]"
              >
                <button
                  type="button"
                  className="w-full px-5 py-4 md:px-6 md:py-5 text-left font-serif text-base md:text-lg text-charcoal flex justify-between items-center gap-4"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <span>{f.q}</span>
                  <span
                    className="text-coral text-2xl flex-shrink-0 leading-none"
                    aria-hidden="true"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${i}`}
                    className="px-5 pb-4 md:px-6 md:pb-5 font-sans text-base text-[#5C5852] leading-relaxed"
                  >
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
