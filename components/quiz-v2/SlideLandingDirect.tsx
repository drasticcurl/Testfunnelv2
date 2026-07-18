'use client';

/**
 * SlideLandingDirect — Variante A del test A/B/C de entrada.
 *
 * Sin pantalla de hook: avanza automáticamente a la primera pregunta (edad)
 * apenas se monta. Renderiza solo el fondo cálido para que no haya flash entre
 * la entrada y la primera pregunta.
 *
 * El evento de "inicio" (ab_entry_A_start) lo dispara el contenedor al llegar
 * al slide 1, igual que en las otras variantes.
 */

import { useEffect, useRef } from 'react';

interface Props {
  onNext: () => void;
}

export function SlideLandingDirect({ onNext }: Props) {
  const advanced = useRef(false);

  useEffect(() => {
    if (advanced.current) return;
    advanced.current = true;
    onNext();
  }, [onNext]);

  return <div style={{ backgroundColor: 'var(--warm)', minHeight: '100vh' }} />;
}
