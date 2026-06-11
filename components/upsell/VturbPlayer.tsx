'use client';

/**
 * VturbPlayer — embebe el reproductor de VTURB (ConverteAI smartplayer) del VSL.
 *
 * VTURB entrega un snippet con 2 partes:
 *   1. un elemento <vturb-smartplayer id="vid-XXXX" ...></vturb-smartplayer>
 *   2. un <script> que carga el player desde scripts.converteai.net/.../player.js
 *
 * Para no pegar HTML crudo (y que el <script> efectivamente se ejecute en React),
 * este componente reconstruye ambas partes a partir de variables de entorno:
 *
 *   NEXT_PUBLIC_VTURB_PLAYER_ID   → el id del player (ej: "vid-66f0a1b2c3d4e5")
 *   NEXT_PUBLIC_VTURB_SCRIPT_URL  → la URL del player.js que te da VTURB
 *
 * Si no están configuradas, muestra un placeholder (no rompe en dev/staging).
 *
 * El guion del VSL vive en docs/ad-scripts/vsl-upsell-turbo.md y los prompts del
 * avatar en docs/ad-scripts/vsl-upsell-avatar-prompts.md.
 */

import { useEffect, useRef, useState } from 'react';

const PLAYER_ID = process.env.NEXT_PUBLIC_VTURB_PLAYER_ID || '';
const SCRIPT_URL = process.env.NEXT_PUBLIC_VTURB_SCRIPT_URL || '';

/** Genera un número de "viewers" realista (entre 20 y 40). */
function randomViewers(): number {
  return 20 + Math.floor(Math.random() * 21); // 20–40
}

export function VturbPlayer() {
  const hasConfig = PLAYER_ID.length > 0 && SCRIPT_URL.length > 0;
  const injected = useRef(false);

  // Viewers en vivo: arranca con un default estable (evita hydration mismatch)
  // y, ya en el cliente, se randomiza entre 20 y 40 con leve fluctuación.
  const [viewers, setViewers] = useState(28);

  useEffect(() => {
    if (!hasConfig || injected.current) return;
    injected.current = true;

    // No re-inyectar si el script ya está en el DOM (navegación SPA).
    if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return;

    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    document.head.appendChild(s);
  }, [hasConfig]);

  useEffect(() => {
    setViewers(randomViewers());
    const i = setInterval(() => {
      setViewers((v) => {
        const next = v + (Math.random() < 0.5 ? -1 : 1);
        return next < 20 ? 20 : next > 40 ? 40 : next;
      });
    }, 4000 + Math.floor(Math.random() * 3000));
    return () => clearInterval(i);
  }, []);

  return (
    <div className="w-full max-w-content mx-auto px-4">
      <div className="relative">
        {/* glow ambiental detrás del video (resalta sobre el fondo oscuro) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-[20px] bg-gradient-to-r from-coral/30 via-warning/20 to-coral/30 opacity-60 blur-2xl"
        />

        {/* Burbuja flotante "paso crítico" titilando, pegada al borde del video */}
        <div className="absolute -top-3 left-1/2 z-20 flex w-full -translate-x-1/2 justify-center px-4">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-alert px-4 py-2 font-sans text-[11px] font-bold uppercase tracking-wider text-white shadow-lg ring-2 ring-alert/30 animate-pulse-soft md:text-xs">
            ⚠️ Paso crítico — no saltes esto
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
          {hasConfig ? (
            // El custom element de VTURB se hidrata cuando el player.js carga.
            // @ts-expect-error: <vturb-smartplayer> es un web component externo.
            <vturb-smartplayer
              id={PLAYER_ID}
              style={{ display: 'block', margin: '0 auto', width: '100%' }}
            />
          ) : (
            <PlayerFallback />
          )}
        </div>
      </div>

      {/* indicador "en vivo" debajo del video — prueba social mientras mira */}
      <p className="mt-4 flex items-center justify-center gap-2 font-sans text-xs md:text-sm text-white/70">
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alert opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-alert" />
        </span>
        <span>
          <strong className="text-white">{viewers} personas</strong> están mirando este video ahora
        </span>
      </p>
    </div>
  );
}

/**
 * Placeholder con aspecto 16:9 para cuando aún no se cargó el embed de VTURB.
 * Mantiene el layout estable y avisa qué variables faltan.
 */
function PlayerFallback() {
  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-charcoal text-white">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </div>
        <p className="font-sans text-sm uppercase tracking-wider text-white/70">
          Reproductor VTURB pendiente
        </p>
        <p className="mt-2 font-sans text-xs text-white/50 max-w-sm">
          Configurá{' '}
          <code className="bg-white/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_VTURB_PLAYER_ID</code>{' '}
          y{' '}
          <code className="bg-white/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_VTURB_SCRIPT_URL</code>{' '}
          en Vercel para mostrar el VSL.
        </p>
      </div>
    </div>
  );
}
