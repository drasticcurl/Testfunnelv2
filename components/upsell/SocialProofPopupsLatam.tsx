'use client';

/**
 * SocialProofPopupsLatam — fork LATAM de SocialProofPopups.
 *
 * Idéntico al original (burbujas de COMPRA en vivo mientras corre el VSL del
 * upsell), pero con ciudades NEUTRAS de LATAM en lugar de ciudades argentinas,
 * para el funnel paralelo /latam (Hotmart, USD, español neutro "tú").
 *
 * Es puramente visual (no envía tracking). Aparece una burbuja a la vez,
 * esquina inferior izquierda, con animación de entrada/salida.
 */

import { useEffect, useState } from 'react';

const NOMBRES = [
  'Camila', 'María José', 'Lucía', 'Valentina', 'Florencia', 'Sofía',
  'Martina', 'Julieta', 'Carla', 'Daniela', 'Rocío', 'Gabriela',
  'Andrea', 'Paola', 'Carolina', 'Fernanda', 'Mariana', 'Paula',
  'Alejandra', 'Verónica', 'Natalia', 'Adriana', 'Diana', 'Renata',
];

/** Ciudades neutras repartidas por LATAM (sin sesgo argentino). */
const CIUDADES = [
  'Bogotá', 'CDMX', 'Lima', 'Guadalajara', 'Monterrey', 'Medellín',
  'Santiago', 'Quito', 'Cali', 'Puebla', 'Arequipa', 'Barranquilla',
  'Guayaquil', 'Tijuana', 'Cartagena', 'Querétaro', 'Cusco', 'León',
];

/** Acciones de compra que rotan (todas comunican que pagaron, no que miraron). */
const ACCIONES = [
  'acaba de comprar el Programa TURBO',
  'aseguró su acceso al Programa TURBO',
  'se sumó al Programa de 30 Días',
  'desbloqueó el precio especial de hoy',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Bubble {
  key: number;
  nombre: string;
  ciudad: string;
  accion: string;
  /** Etiqueta de tiempo: "recién" para las primeras, luego "hace N min". */
  cuando: string;
}

function makeBubble(key: number): Bubble {
  // 1 de cada 3 es "recién" (sensación de tiempo real); el resto "hace N min".
  const recien = Math.random() < 0.34;
  return {
    key,
    nombre: pick(NOMBRES),
    ciudad: pick(CIUDADES),
    accion: pick(ACCIONES),
    cuando: recien ? 'recién' : `hace ${1 + Math.floor(Math.random() * 8)} min`,
  };
}

export function SocialProofPopupsLatam() {
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let counter = 0;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let loopTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      counter += 1;
      setBubble(makeBubble(counter));
      setVisible(true);

      // Visible ~5.5s, luego se oculta.
      hideTimer = setTimeout(() => setVisible(false), 5500);

      // Próxima compra entre 6 y 11s (más seguido = más presión de ventas).
      const nextIn = 6000 + Math.floor(Math.random() * 5000);
      loopTimer = setTimeout(cycle, nextIn);
    };

    // Primera burbuja tras 3s (deja arrancar el video).
    showTimer = setTimeout(cycle, 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(loopTimer);
    };
  }, []);

  if (!bubble) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed bottom-4 left-4 z-40 max-w-[290px] transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-[#EFECE7] pl-2.5 pr-4 py-2.5">
        {/* Avatar con badge verde de "compra verificada" */}
        <span className="relative flex-shrink-0">
          <span className="w-10 h-10 rounded-full bg-sage-soft text-sage-dark flex items-center justify-center font-sans font-bold text-sm">
            {bubble.nombre.charAt(0)}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success text-white flex items-center justify-center ring-2 ring-white">
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>

        <p className="font-sans text-xs text-charcoal leading-snug">
          <strong>{bubble.nombre} de {bubble.ciudad}</strong>
          <br />
          <span className="text-[#5C5852]">🛒 {bubble.accion}</span>
          <br />
          <span className="text-[#9B9890] text-[11px]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success align-middle mr-1 animate-pulse-soft" />
            Compra verificada · {bubble.cuando}
          </span>
        </p>
      </div>
    </div>
  );
}
