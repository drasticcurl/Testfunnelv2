'use client';

import Link from 'next/link';

const GUIAS = [
  {
    href: '/pwa/guias/suplementos',
    emoji: '💊',
    title: 'Suplementos Naturales',
    desc: 'Melatonina, magnesio, ashwagandha y más — dosis y cuándo usarlos',
  },
  {
    href: '/pwa/guias/alimentos-pro-sueno',
    emoji: '🥝',
    title: 'Alimentos Pro-Sueño',
    desc: 'Qué comer para dormir mejor, con evidencia científica',
  },
  {
    href: '/pwa/guias/alimentos-disruptores',
    emoji: '🚫',
    title: 'Alimentos Disruptores',
    desc: 'Qué evitar y por qué sabotea tu descanso',
  },
  {
    href: '/pwa/guias/rutina-nocturna',
    emoji: '🌙',
    title: 'Rutina Nocturna Ideal',
    desc: 'Timeline de 90 minutos antes de dormir, paso a paso',
  },
];

export default function GuiasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-pwa-accent">Guías</h1>
        <p className="text-pwa-text-secondary text-sm mt-1">
          Contenido educativo para mejorar tu sueño
        </p>
      </div>

      <div className="space-y-3">
        {GUIAS.map((guia) => (
          <Link
            key={guia.href}
            href={guia.href}
            className="card-pwa flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-pwa-highlight/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{guia.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-pwa-text text-sm">{guia.title}</p>
              <p className="text-xs text-pwa-text-secondary">{guia.desc}</p>
            </div>
            <span className="text-pwa-accent flex-shrink-0">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
