import { describe, it, expect } from 'vitest';

import { slidesV3 } from './data';
import { slidesV3Latam } from './data-latam';
import { selectSlides } from '@/lib/admin/store';
import type { SlideV3 } from './types';

/**
 * Anti-drift guard: `slidesV3` (AR) y `slidesV3Latam` (LATAM) deben ser
 * estructuralmente isomorfos. Solo el texto visible difiere (es/AR "vos" vs
 * es neutro "tú", "panza" vs "barriga"). El scoring depende de `id` y de los
 * `value` de las opciones, así que esos NO pueden divergir.
 *
 * Property 3: `slidesV3` y `slidesV3Latam` son estructuralmente isomorfos.
 * Property 7: La paridad de slides AR/LATAM se preserva en el embudo.
 * **Validates: Requirements 7.1, 7.2, 7.4, 7.5, 7.6, 10.6**
 */

type StructuralShape = {
  id: string;
  type: string;
  /** Secuencia de `value` de las opciones; [] si el slide no tiene opciones. */
  optionValues: string[];
};

/** Proyecta un slide a su forma estructural, ignorando todo el texto visible. */
function structuralShape(slide: SlideV3): StructuralShape {
  const optionValues =
    'options' in slide && Array.isArray(slide.options)
      ? slide.options.map((o) => o.value)
      : [];
  return { id: slide.id, type: slide.type, optionValues };
}

describe('data-sync — AR ≅ LATAM (Properties 3 y 7)', () => {
  // Tras sacar la captura de email de AR (el front volvió a Shopify y ya no se
  // necesita el puente fbc/fbp por email), AR y LATAM son estructuralmente
  // idénticos: misma cantidad y secuencia de slides.
  it('ambas listas tienen la misma longitud', () => {
    expect(slidesV3Latam.length).toBe(slidesV3.length);
  });

  it('cada índice coincide en id, type y secuencia de value de opciones', () => {
    for (let i = 0; i < slidesV3.length; i++) {
      const ar = structuralShape(slidesV3[i]);
      const latam = structuralShape(slidesV3Latam[i]);
      expect(latam, `slide #${i}`).toEqual(ar);
    }
  });

  it('selectSlides("ar") y selectSlides("latam") coinciden en longitud y secuencia de (id, type)', () => {
    const ar = selectSlides('ar');
    const latam = selectSlides('latam');
    expect(latam.length).toBe(ar.length);
    for (let i = 0; i < ar.length; i++) {
      expect({ id: latam[i].id, type: latam[i].type }).toEqual({ id: ar[i].id, type: ar[i].type });
    }
  });
});
