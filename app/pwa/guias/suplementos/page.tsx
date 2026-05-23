'use client';

import Link from 'next/link';

const SUPLEMENTOS = [
  {
    nombre: 'Melatonina',
    dosis: '0.5 – 3 mg',
    cuando: '30-60 min antes de acostarte',
    para: 'Resetear el reloj biológico, dormirte más rápido',
    notas: 'Empezá con 0.5mg. Más no es mejor. No usar más de 3 meses seguidos. Ideal para jet lag o cambios de horario.',
    emoji: '🌙',
  },
  {
    nombre: 'Magnesio Glicinato',
    dosis: '200 – 400 mg',
    cuando: 'Con la cena o 1 hora antes de dormir',
    para: 'Relajación muscular, reducir despertares nocturnos',
    notas: 'La forma "glicinato" es la mejor para sueño (no citrato ni óxido). Puede ayudar con calambres nocturnos y piernas inquietas.',
    emoji: '⚡',
  },
  {
    nombre: 'Ashwagandha',
    dosis: '300 – 600 mg',
    cuando: 'Con la cena',
    para: 'Bajar cortisol, reducir estrés crónico que afecta el sueño',
    notas: 'Efecto acumulativo — se nota después de 2-4 semanas de uso consistente. Elegir extracto KSM-66 o Sensoril.',
    emoji: '🌿',
  },
  {
    nombre: 'Valeriana',
    dosis: '300 – 600 mg',
    cuando: '30-60 min antes de dormir',
    para: 'Efecto sedante suave, reducir tiempo para dormirse',
    notas: 'Puede tardar 2 semanas en hacer efecto. El olor es fuerte pero es normal. No mezclar con alcohol.',
    emoji: '🌸',
  },
  {
    nombre: 'L-Teanina',
    dosis: '100 – 200 mg',
    cuando: '30-60 min antes de dormir',
    para: 'Calmar la mente acelerada sin sedación, mejorar calidad de sueño',
    notas: 'Presente naturalmente en el té verde. No genera dependencia. Se puede combinar con magnesio. Ideal para "Mente Acelerada".',
    emoji: '🍵',
  },
];

export default function SuplementosPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/pwa/guias" className="text-pwa-accent text-sm mb-3 inline-block">← Guías</Link>
        <h1 className="font-serif text-2xl text-pwa-accent">Suplementos Naturales</h1>
        <p className="text-pwa-text-secondary text-sm mt-1">
          Opciones naturales con dosis y recomendaciones
        </p>
      </div>

      <div className="card-pwa bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          ⚠️ Estos suplementos son de venta libre, pero consultá con tu médico antes de tomarlos, especialmente si estás medicado/a o embarazada.
        </p>
      </div>

      <div className="space-y-4">
        {SUPLEMENTOS.map((sup) => (
          <div key={sup.nombre} className="card-pwa">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{sup.emoji}</span>
              <h3 className="font-medium text-pwa-text">{sup.nombre}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-pwa-text-secondary font-medium w-16 flex-shrink-0">Dosis:</span>
                <span className="text-pwa-text">{sup.dosis}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-pwa-text-secondary font-medium w-16 flex-shrink-0">Cuándo:</span>
                <span className="text-pwa-text">{sup.cuando}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-pwa-text-secondary font-medium w-16 flex-shrink-0">Para:</span>
                <span className="text-pwa-text">{sup.para}</span>
              </div>
              <p className="text-pwa-text-secondary text-xs mt-2 pt-2 border-t border-pwa-border">
                💡 {sup.notas}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
