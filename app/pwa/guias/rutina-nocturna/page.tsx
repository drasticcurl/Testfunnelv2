'use client';

import Link from 'next/link';

const TIMELINE = [
  { tiempo: '90 min antes', titulo: 'Última comida del día', detalle: 'Si no cenaste todavía, hacelo ahora. Algo liviano y pro-sueño.', emoji: '🍽️' },
  { tiempo: '60 min antes', titulo: 'Bajá la intensidad', detalle: 'Apagá la tele. Nada de trabajo ni noticias. Bajá las luces de la casa. Si podés, ponele un filtro cálido a tu celular (modo nocturno).', emoji: '💡' },
  { tiempo: '45 min antes', titulo: 'Pantallas fuera', detalle: 'Dejá el celular cargando en otro cuarto o en un mueble lejos de la cama. Activá el modo no molestar.', emoji: '📵' },
  { tiempo: '30 min antes', titulo: 'Rutina de higiene', detalle: 'Lavate la cara, los dientes. Este acto marca el "cierre del día". Si te gusta, agregá crema/aceite esencial de lavanda.', emoji: '🧴' },
  { tiempo: '20 min antes', titulo: 'Descarga mental', detalle: 'Escribí en papel todo lo que tenés en la cabeza: pendientes, preocupaciones, ideas. Cerrá la libreta.', emoji: '📝' },
  { tiempo: '15 min antes', titulo: 'Actividad relajante', detalle: 'Lectura en papel, estiramientos suaves, o simplemente sentarte en silencio. Nada que active la mente.', emoji: '📖' },
  { tiempo: '5 min antes', titulo: 'Prepará el ambiente', detalle: 'Checklist: oscuridad total, temperatura fresca (18-20°C), ruido blanco si lo usás, ropa cómoda.', emoji: '🏠' },
  { tiempo: '0 — A la cama', titulo: 'Respiración 4-7-8', detalle: 'Acostado/a: 4 ciclos de respiración 4-7-8. Si querés, sumale un body scan rápido.', emoji: '🫁' },
];

export default function RutinaNocturnaPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/pwa/guias" className="text-pwa-accent text-sm mb-3 inline-block">← Guías</Link>
        <h1 className="font-serif text-2xl text-pwa-accent">Rutina Nocturna Ideal</h1>
        <p className="text-pwa-text-secondary text-sm mt-1">
          Timeline de 90 minutos para preparar tu cuerpo y mente
        </p>
      </div>

      <div className="card-pwa bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          💡 No necesitás hacer todo perfecto. Elegí los pasos que más te sirvan y mantené la consistencia. La repetición es más importante que la perfección.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-pwa-border" />
        <div className="space-y-4">
          {TIMELINE.map((step, i) => (
            <div key={i} className="relative flex gap-4">
              <div className="w-10 h-10 rounded-full bg-pwa-accent/10 border-2 border-pwa-accent/30 flex items-center justify-center flex-shrink-0 z-10">
                <span className="text-sm">{step.emoji}</span>
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-pwa-accent">{step.tiempo}</span>
                </div>
                <p className="font-medium text-pwa-text text-sm">{step.titulo}</p>
                <p className="text-xs text-pwa-text-secondary mt-0.5">{step.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-pwa">
        <h3 className="font-medium text-pwa-text text-sm mb-2">🎯 La clave</h3>
        <p className="text-xs text-pwa-text-secondary leading-relaxed">
          Hacé SIEMPRE la misma secuencia, a la misma hora. Tu cerebro va a aprender que esos pasos significan &ldquo;es hora de dormir&rdquo; y va a empezar a relajarse automáticamente.
          La primera semana puede costar. A partir de la segunda, se vuelve natural.
        </p>
      </div>
    </div>
  );
}
