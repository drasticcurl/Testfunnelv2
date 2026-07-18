import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  VIP_GUIDES,
  getVipGuide,
  getVipGuidesByCategory,
  type VipGuide,
  type VipSection,
  type VipSource,
  type VipCategory,
} from './vip-content';
import type { GuideSource } from '@/components/pwa/guias/GuideSources';

/**
 * Feature: guias-vip-planner — validación de datos de las guías VIP (lib pura).
 *
 * Entorno vitest: `node` (sin DOM). Acá solo se valida la estructura de datos
 * y los selectores puros de `lib/pwa/vip-content.ts`, no el render.
 *
 * Tareas cubiertas:
 *  - 1.2  Compatibilidad estructural / retrocompatibilidad del tipo (unit).
 *  - 3.4  Calidad estructural del contenido — Propiedades A3 y A5 (unit + property).
 *  - 3.5  Integridad de navegación del hub — Propiedades A4 y A1 (property).
 */

// ── Helpers de conteo ───────────────────────────────────────────────────────

const VALID_CATEGORIES: VipCategory[] = ['masterclass', 'mini-guia', 'protocolo'];

/** Detecta al menos un caracter de emoji (pictograma) en un string. */
const EMOJI_RE = /\p{Extended_Pictographic}/u;

/** URL http(s) sin distinción de mayúsculas, como exige el Req 5.6 / 2.2. */
const HTTP_RE = /^https?:\/\//i;

/** Cuenta palabras de un texto (tokens separados por espacios en blanco). */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Cantidad de items de una sección (0 si no define `items`). */
function sectionItemCount(s: VipSection): number {
  return s.items?.length ?? 0;
}

/** Conteo total de palabras de una guía: intro + secciones (título+body+items) + cierre. */
function guideWordCount(g: VipGuide): number {
  const parts: string[] = [g.intro, g.closingTitle, g.closingText];
  for (const s of g.sections) {
    parts.push(s.title, s.body);
    if (s.items) parts.push(...s.items);
  }
  return parts.reduce((sum, p) => sum + countWords(p), 0);
}

/** Conjunto de slugs reales para filtrar inexistentes en los property-tests. */
const ALL_SLUGS = VIP_GUIDES.map((g) => g.slug);
const ALL_SLUGS_SET = new Set(ALL_SLUGS);

// ─────────────────────────────────────────────────────────────────────────────
// Task 1.2 — Compatibilidad estructural y retrocompatibilidad del tipo
// _Requirements: 1.3, 1.4, 1.5_
// ─────────────────────────────────────────────────────────────────────────────
describe('vip-content — Task 1.2: compatibilidad estructural del tipo', () => {
  // Req 1.5 — un VipSource[] se asigna a un parámetro GuideSource[] sin casts.
  // Si los tipos fueran incompatibles, `tsc` no compilaría esta función/llamada.
  function acceptsGuideSources(sources: GuideSource[]): number {
    return sources.length;
  }

  it('Req 1.5: un VipSource[] es asignable a GuideSource[] sin conversión', () => {
    const vipSources: VipSource[] = [
      { label: 'Harvard Health — Foods that fight inflammation', url: 'https://example.com' },
      { label: 'PMC — Estudio', url: 'http://example.org' },
    ];
    // Asignación directa sin cast (compatibilidad estructural).
    const asGuideSources: GuideSource[] = vipSources;
    expect(acceptsGuideSources(vipSources)).toBe(2);
    expect(asGuideSources).toHaveLength(2);
    expect(asGuideSources[0].label).toBe(vipSources[0].label);
  });

  it('Req 1.3: una guía sin `sources` sigue siendo un VipGuide válido', () => {
    const guideWithoutSources: VipGuide = {
      slug: 'guia-sin-fuentes',
      category: 'mini-guia',
      emoji: '🥗',
      title: 'Guía sin fuentes',
      cardDescription: 'Descripción',
      intro: 'Intro',
      sections: [{ emoji: '🍎', title: 'Sección', body: 'Cuerpo' }],
      closingTitle: 'Cierre',
      closingText: 'Texto de cierre',
    };
    expect(guideWithoutSources.sources).toBeUndefined();
    expect(guideWithoutSources.slug).toBe('guia-sin-fuentes');
  });

  it('Req 1.4: una guía con `sources: []` es válida y equivalente en estructura', () => {
    const guideEmptySources: VipGuide = {
      slug: 'guia-fuentes-vacias',
      category: 'mini-guia',
      emoji: '🥗',
      title: 'Guía con fuentes vacías',
      cardDescription: 'Descripción',
      intro: 'Intro',
      sections: [{ emoji: '🍎', title: 'Sección', body: 'Cuerpo' }],
      closingTitle: 'Cierre',
      closingText: 'Texto de cierre',
      sources: [],
    };
    expect(Array.isArray(guideEmptySources.sources)).toBe(true);
    expect(guideEmptySources.sources).toHaveLength(0);
    // `sources: []` se pasa a un parámetro GuideSource[] sin conversión.
    expect(acceptsGuideSources(guideEmptySources.sources!)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Task 3.4 — Calidad estructural de contenido (unitarios + property)
// Propiedad A3 (unicidad de slug) y Propiedad A5 (validez de fuentes)
// **Validates: Requirements 3.1, 3.2, 3.4, 3.6, 3.8, 4.2, 5.1, 5.3, 5.6**
// ─────────────────────────────────────────────────────────────────────────────
describe('vip-content — Task 3.4: calidad estructural del contenido', () => {
  // ── Propiedad A3 — Unicidad de slug (sensible a mayúsculas) — Req 5.1 ──────
  it('Propiedad A3: para todo par i≠j, VIP_GUIDES[i].slug ≠ VIP_GUIDES[j].slug', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: VIP_GUIDES.length - 1 }),
        fc.nat({ max: VIP_GUIDES.length - 1 }),
        (i, j) => {
          if (i === j) return true;
          return VIP_GUIDES[i].slug !== VIP_GUIDES[j].slug;
        },
      ),
      { numRuns: 200 },
    );
    // Refuerzo determinista: el set de slugs tiene el mismo tamaño que el array.
    expect(ALL_SLUGS_SET.size).toBe(VIP_GUIDES.length);
  });

  // ── Categoría válida — Req 5.3 ────────────────────────────────────────────
  it('Req 5.3: toda category ∈ {masterclass, mini-guia, protocolo}', () => {
    fc.assert(
      fc.property(fc.constantFrom(...VIP_GUIDES), (g) => {
        expect(VALID_CATEGORIES).toContain(g.category);
      }),
      { numRuns: 100 },
    );
  });

  // ── Propiedad A5 — Validez de fuentes — Req 5.6 ───────────────────────────
  it('Propiedad A5: si `sources` existe, cada fuente tiene label no vacío (trim) y url http(s)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...VIP_GUIDES), (g) => {
        if (!g.sources) return;
        for (const s of g.sources) {
          expect(s.label.trim().length).toBeGreaterThanOrEqual(1);
          expect(HTTP_RE.test(s.url)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  // ── Mínimos de calidad por categoría — Req 3.1, 3.2, 3.4, 3.6, 3.8 ────────
  it('Req 3.1/3.6/3.8: cada masterclass cumple los mínimos de su categoría', () => {
    const masterclasses = getVipGuidesByCategory('masterclass');
    expect(masterclasses.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...masterclasses), (g) => {
        // 6–8 secciones
        expect(g.sections.length).toBeGreaterThanOrEqual(6);
        expect(g.sections.length).toBeLessThanOrEqual(8);
        // intro ≥ 150 palabras
        expect(countWords(g.intro)).toBeGreaterThanOrEqual(150);
        // ≥ 800 palabras totales
        expect(guideWordCount(g)).toBeGreaterThanOrEqual(800);
        // ≥ 1 sección de errores / qué NO hacer con ≥ 3 items
        const hasErrors = g.sections.some(
          (s) => /error/i.test(s.title) && sectionItemCount(s) >= 3,
        );
        expect(hasErrors).toBe(true);
        // ≥ 1 sección de rutina / calendario / paso a paso con ≥ 5 pasos
        const hasRoutine = g.sections.some(
          (s) =>
            /(rutina|calendario|semana|plan|paso a paso)/i.test(s.title) &&
            sectionItemCount(s) >= 5,
        );
        expect(hasRoutine).toBe(true);
        // ≥ 1 fuente
        expect((g.sources?.length ?? 0)).toBeGreaterThanOrEqual(1);
        // Req 3.6: ninguna sección con 0 items que debería tenerlos no aplica acá,
        // pero la guía no puede tener 0 secciones.
        expect(g.sections.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it('Req 3.2/3.8: cada protocolo cumple los mínimos de su categoría', () => {
    const protocolos = getVipGuidesByCategory('protocolo');
    expect(protocolos.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...protocolos), (g) => {
        // 6–8 secciones
        expect(g.sections.length).toBeGreaterThanOrEqual(6);
        expect(g.sections.length).toBeLessThanOrEqual(8);
        // ≥ 800 palabras totales
        expect(guideWordCount(g)).toBeGreaterThanOrEqual(800);
        // ≥ 1 checklist accionable con ≥ 4 items
        const hasChecklist = g.sections.some(
          (s) =>
            (/checklist/i.test(s.title) ||
              (s.items?.some((it) => it.includes('☐')) ?? false)) &&
            sectionItemCount(s) >= 4,
        );
        expect(hasChecklist).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('Req 3.4/3.8: cada mini-guía cumple los mínimos de su categoría', () => {
    const miniGuias = getVipGuidesByCategory('mini-guia');
    expect(miniGuias.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...miniGuias), (g) => {
        // 5–6 secciones
        expect(g.sections.length).toBeGreaterThanOrEqual(5);
        expect(g.sections.length).toBeLessThanOrEqual(6);
        // ≥ 500 palabras totales
        expect(guideWordCount(g)).toBeGreaterThanOrEqual(500);
        // ≥ 1 bloque de items con ≥ 3 items por sección
        for (const s of g.sections) {
          expect(sectionItemCount(s)).toBeGreaterThanOrEqual(3);
        }
      }),
      { numRuns: 100 },
    );
  });

  // ── Req 3.6: una guía con 0 secciones/items NO cumple los mínimos ─────────
  it('Req 3.6: ninguna guía del inventario tiene 0 secciones', () => {
    for (const g of VIP_GUIDES) {
      expect(g.sections.length).toBeGreaterThan(0);
    }
  });

  // ── Unitario Req 4.2: ≥1 emoji en `emoji` de cada guía y de cada sección ──
  it('Req 4.2: cada guía y cada sección tienen ≥1 emoji en el campo `emoji`', () => {
    for (const g of VIP_GUIDES) {
      expect(EMOJI_RE.test(g.emoji), `guía ${g.slug} sin emoji`).toBe(true);
      for (const s of g.sections) {
        expect(
          EMOJI_RE.test(s.emoji),
          `sección "${s.title}" de ${g.slug} sin emoji`,
        ).toBe(true);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Task 3.5 — Integridad de navegación del hub
// Propiedad A4 (navegación) y Propiedad A1 (retrocompatibilidad)
// **Validates: Requirements 5.5, 2.2**
// ─────────────────────────────────────────────────────────────────────────────
describe('vip-content — Task 3.5: integridad de navegación del hub', () => {
  // ── Propiedad A4 — Req 5.5 ────────────────────────────────────────────────
  it('Propiedad A4: todo slug de VIP_GUIDES resuelve a una guía válida vía getVipGuide', () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_SLUGS), (slug) => {
        const guide = getVipGuide(slug);
        expect(guide).toBeDefined();
        expect(guide!.slug).toBe(slug);
        expect(VALID_CATEGORIES).toContain(guide!.category);
      }),
      { numRuns: 200 },
    );
  });

  it('Propiedad A4: todo slug listado por getVipGuidesByCategory resuelve vía getVipGuide', () => {
    const hubSlugs = VALID_CATEGORIES.flatMap((c) =>
      getVipGuidesByCategory(c).map((g) => g.slug),
    );
    // El hub cubre exactamente las guías existentes (sin slugs huérfanos).
    expect(new Set(hubSlugs)).toEqual(ALL_SLUGS_SET);

    fc.assert(
      fc.property(fc.constantFrom(...hubSlugs), (slug) => {
        expect(getVipGuide(slug)?.slug).toBe(slug);
      }),
      { numRuns: 200 },
    );
  });

  // ── getVipGuide con slug inexistente → undefined (base de Req 5.8) ─────────
  it('Propiedad A4: getVipGuide con un slug inexistente devuelve undefined', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !ALL_SLUGS_SET.has(s)),
        (slug) => {
          expect(getVipGuide(slug)).toBeUndefined();
        },
      ),
      { numRuns: 200 },
    );
  });

  // ── Propiedad A1 — Retrocompatibilidad (a nivel de datos) — Req 2.2 ────────
  // Una guía sin `sources` (o con array vacío / solo inválidas) no expone
  // ninguna fuente válida → el bloque GuideSources no debe renderizarse.
  it('Propiedad A1: una guía sin `sources` no produce fuentes válidas para renderizar', () => {
    const validSources = (g: VipGuide) =>
      (g.sources ?? []).filter(
        (s) => s.label.trim().length >= 1 && HTTP_RE.test(s.url),
      );

    const guideNoSources: VipGuide = {
      slug: 'tmp-sin-fuentes',
      category: 'mini-guia',
      emoji: '🥗',
      title: 'Tmp',
      cardDescription: 'd',
      intro: 'i',
      sections: [{ emoji: '🍎', title: 't', body: 'b' }],
      closingTitle: 'c',
      closingText: 'ct',
    };
    expect(validSources(guideNoSources)).toHaveLength(0);

    const guideEmpty: VipGuide = { ...guideNoSources, sources: [] };
    expect(validSources(guideEmpty)).toHaveLength(0);
  });
});
