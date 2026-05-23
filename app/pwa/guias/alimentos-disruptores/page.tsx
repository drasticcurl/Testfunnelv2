'use client';

import Link from 'next/link';

const DISRUPTORES = [
  { nombre: 'Cafeína (después de las 14hs)', por_que: 'La vida media es de 5-6 horas. Un café a las 16hs todavía está activo a las 22hs. Incluye: café, mate, té negro, cola, chocolate.', emoji: '☕' },
  { nombre: 'Alcohol', por_que: 'Te hace dormirte rápido PERO destruye el sueño profundo y REM. Te despertás a las 3-4am cuando el efecto pasa. Es un falso amigo del sueño.', emoji: '🍷' },
  { nombre: 'Comidas pesadas y grasas', por_que: 'Tu sistema digestivo trabaja horas extra, elevando la temperatura corporal y causando reflujo que interrumpe el sueño.', emoji: '🍔' },
  { nombre: 'Azúcar refinada', por_que: 'Genera picos de glucosa seguidos de bajones que pueden despertarte. Especialmente dañina si la comés cerca de dormir.', emoji: '🍰' },
  { nombre: 'Chocolate negro', por_que: 'Contiene cafeína y teobromina — ambos estimulantes. 50g de chocolate 70% tiene tanta cafeína como medio café.', emoji: '🍫' },
  { nombre: 'Comidas picantes', por_que: 'Elevan la temperatura corporal y pueden causar acidez. Tu cuerpo necesita ENFRIARSE para dormirse.', emoji: '🌶️' },
  { nombre: 'Exceso de líquidos', por_que: 'Demasiado líquido después de las 20hs = despertarte para ir al baño. Hidratate durante el día, no de noche.', emoji: '💧' },
  { nombre: 'Cenas muy tardías', por_que: 'Comer pesado menos de 2 horas antes de dormir activa la digestión cuando deberías estar relajándote.', emoji: '🕐' },
];

export default function AlimentosDisruptoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/pwa/guias" className="text-pwa-accent text-sm mb-3 inline-block">← Guías</Link>
        <h1 className="font-serif text-2xl text-pwa-accent">Alimentos Disruptores</h1>
        <p className="text-pwa-text-secondary text-sm mt-1">
          Qué evitar para no sabotear tu sueño
        </p>
      </div>

      <div className="card-pwa bg-red-50 border-red-200">
        <p className="text-sm text-red-800">
          🚫 No es necesario eliminar todo para siempre. Pero evitalos al menos 3-4 horas antes de dormir para notar una mejora real.
        </p>
      </div>

      <div className="space-y-2">
        {DISRUPTORES.map((item) => (
          <div key={item.nombre} className="card-pwa flex gap-3">
            <span className="text-2xl flex-shrink-0">{item.emoji}</span>
            <div>
              <p className="font-medium text-pwa-text text-sm">{item.nombre}</p>
              <p className="text-xs text-pwa-text-secondary mt-0.5">{item.por_que}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-pwa">
        <h3 className="font-medium text-pwa-text text-sm mb-2">📋 Resumen rápido</h3>
        <ul className="text-xs text-pwa-text-secondary space-y-1">
          <li>• Cortá cafeína después de las 14hs</li>
          <li>• Nada de alcohol 3hs antes de dormir</li>
          <li>• Cena liviana, 2-3hs antes de acostarte</li>
          <li>• Evitá azúcar y picantes en la cena</li>
          <li>• Reducí líquidos después de las 20hs</li>
        </ul>
      </div>
    </div>
  );
}
