'use client';

import Link from 'next/link';

const ALIMENTOS = [
  { nombre: 'Cerezas', por_que: 'Fuente natural de melatonina. Ideales como snack nocturno o en jugo.', emoji: '🍒' },
  { nombre: 'Banana', por_que: 'Rica en triptófano + magnesio + potasio. Combo relajante natural.', emoji: '🍌' },
  { nombre: 'Kiwi', por_que: '2 kiwis 1 hora antes de dormir mejoraron el sueño en estudios clínicos. Rico en serotonina.', emoji: '🥝' },
  { nombre: 'Almendras', por_que: 'Alto contenido de magnesio. Un puñado como snack nocturno es ideal.', emoji: '🌰' },
  { nombre: 'Avena', por_que: 'Fuente de melatonina natural y carbohidratos complejos que facilitan el sueño.', emoji: '🥣' },
  { nombre: 'Pescado graso', por_que: 'Salmón, atún, sardinas — ricos en omega-3 y vitamina D que regulan la serotonina.', emoji: '🐟' },
  { nombre: 'Pavo / Pollo', por_que: 'Ricos en triptófano, precursor de melatonina y serotonina.', emoji: '🍗' },
  { nombre: 'Leche tibia', por_que: 'Contiene triptófano y el ritual de tomarla tibia activa la relajación.', emoji: '🥛' },
  { nombre: 'Miel (1 cucharadita)', por_que: 'Eleva ligeramente la insulina, facilitando la entrada de triptófano al cerebro.', emoji: '🍯' },
  { nombre: 'Arroz jazmín', por_que: 'Índice glucémico alto que acorta el tiempo para dormirse (cenar 4hs antes).', emoji: '🍚' },
];

export default function AlimentosProSuenoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/pwa/guias" className="text-pwa-accent text-sm mb-3 inline-block">← Guías</Link>
        <h1 className="font-serif text-2xl text-pwa-accent">Alimentos Pro-Sueño</h1>
        <p className="text-pwa-text-secondary text-sm mt-1">
          Qué incluir en tu cena o snack nocturno para dormir mejor
        </p>
      </div>

      <div className="card-pwa bg-green-50 border-green-200">
        <p className="text-sm text-green-800">
          🕐 Timing ideal: cená 2-3 horas antes de acostarte. Si necesitás un snack más tarde, elegí algo liviano de esta lista.
        </p>
      </div>

      <div className="space-y-2">
        {ALIMENTOS.map((alimento) => (
          <div key={alimento.nombre} className="card-pwa flex gap-3">
            <span className="text-2xl flex-shrink-0">{alimento.emoji}</span>
            <div>
              <p className="font-medium text-pwa-text text-sm">{alimento.nombre}</p>
              <p className="text-xs text-pwa-text-secondary mt-0.5">{alimento.por_que}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-pwa">
        <h3 className="font-medium text-pwa-text text-sm mb-2">💡 Cena ideal para dormir mejor</h3>
        <p className="text-xs text-pwa-text-secondary leading-relaxed">
          Proteína magra (pollo, pavo, pescado) + carbohidratos complejos (arroz, papa, batata) + verduras. Porción moderada, no pesada. Acompañar con una infusión de manzanilla o tilo post-cena.
        </p>
      </div>
    </div>
  );
}
