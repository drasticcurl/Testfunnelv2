// @vitest-environment jsdom

/**
 * Task 2.2 — Test de render condicional de `GuideSources`.
 *
 * **Propiedad A2 — Renderizado condicional**
 * El bloque de Fuentes (`GuideSources`) aparece si y solo si la guía tiene al
 * menos UNA fuente válida. Una fuente es válida cuando su `label` (tras
 * `trim`) mide entre 1 y 200 caracteres y su `url` empieza con `http://` o
 * `https://` sin distinción de mayúsculas/minúsculas.
 *
 * Casos cubiertos:
 *  - ≥1 fuente válida  → muestra `GuideSources` (encabezado "📚 Fuentes").
 *  - sin `sources`     → NO muestra el bloque (ni encabezado ni contenedor).
 *  - array vacío       → NO muestra el bloque.
 *  - solo inválidas    → NO muestra el bloque.
 *  - mixta (válidas + inválidas) → muestra SOLO las válidas.
 *
 * Enfoque: renderizamos el renderer real `/pwa/vip/guia/[slug]` controlando la
 * guía devuelta por `getVipGuide` (mock) y el slug vía `useParams` (mock). Así
 * ejercitamos el filtrado real (`getValidSources`) + el bloque condicional real
 * + el componente `GuideSources` real, end-to-end.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import VipGuidePage from '../[slug]/page';
import { getVipGuide, type VipGuide, type VipSource } from '@/lib/pwa/vip-content';

// next/navigation: slug fijo (la guía se controla por el mock de getVipGuide).
vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'guia-test' }),
}));

// framer-motion: reemplazamos los `motion.*` por elementos simples para
// enfocarnos en la lógica de render (sin animaciones ni timers de animación).
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const FRAMER_PROPS = new Set([
    'initial', 'animate', 'exit', 'variants', 'transition',
    'whileHover', 'whileTap', 'whileInView', 'layout', 'viewport',
  ]);
  // Cache por tag: el tipo de componente debe ser ESTABLE entre renders, si no
  // React remonta el subárbol en cada render (invalida refs y resetea inputs).
  const cache = new Map<string, unknown>();
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!cache.has(tag)) {
          cache.set(
            tag,
            React.forwardRef(function MotionMock(
              { children, ...props }: Record<string, unknown>,
              ref: unknown,
            ) {
              const clean: Record<string, unknown> = {};
              for (const [k, v] of Object.entries(props)) {
                if (!FRAMER_PROPS.has(k)) clean[k] = v;
              }
              return React.createElement(tag, { ref, ...clean }, children as React.ReactNode);
            }),
          );
        }
        return cache.get(tag);
      },
    },
  );
  return { motion, AnimatePresence: ({ children }: { children: React.ReactNode }) => children };
});

// getVipGuide: controlado por test mediante vi.mocked(...).mockReturnValue(...).
vi.mock('@/lib/pwa/vip-content', () => ({
  getVipGuide: vi.fn(),
}));

/** Encabezado único que renderiza el componente GuideSources. */
const SOURCES_HEADING = '📚 Fuentes';

/** Construye una guía VIP mínima y válida, con `sources` configurable. */
function makeGuide(sources?: VipSource[]): VipGuide {
  return {
    slug: 'guia-test',
    category: 'masterclass',
    emoji: '🧪',
    title: 'Guía de prueba',
    cardDescription: 'desc',
    intro: 'Intro de la guía de prueba.',
    sections: [
      { emoji: '✅', title: 'Sección 1', body: 'Cuerpo de la sección 1.' },
    ],
    closingTitle: 'Cierre',
    closingText: 'Texto de cierre.',
    ...(sources !== undefined ? { sources } : {}),
  };
}

function renderGuide(sources?: VipSource[]) {
  vi.mocked(getVipGuide).mockReturnValue(makeGuide(sources));
  return render(<VipGuidePage />);
}

describe('Task 2.2 — render condicional de GuideSources (Propiedad A2)', () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(getVipGuide).mockReset();
  });

  it('muestra GuideSources cuando hay ≥1 fuente válida (Req 2.1)', () => {
    renderGuide([
      { label: 'Harvard Health — Antiinflamatorios', url: 'https://example.com/a' },
    ]);

    expect(screen.getByText(SOURCES_HEADING)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Harvard Health — Antiinflamatorios' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/a');
  });

  it('acepta urls http y https sin distinción de mayúsculas (Req 2.1)', () => {
    renderGuide([
      { label: 'Fuente http', url: 'http://example.com/x' },
      { label: 'Fuente HTTPS mayus', url: 'HTTPS://EXAMPLE.COM/y' },
    ]);

    expect(screen.getByText(SOURCES_HEADING)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fuente http' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fuente HTTPS mayus' })).toBeInTheDocument();
  });

  it('NO muestra el bloque cuando la guía no define sources (Req 2.2)', () => {
    renderGuide(undefined);
    expect(screen.queryByText(SOURCES_HEADING)).not.toBeInTheDocument();
  });

  it('NO muestra el bloque cuando sources es un array vacío (Req 2.2)', () => {
    renderGuide([]);
    expect(screen.queryByText(SOURCES_HEADING)).not.toBeInTheDocument();
  });

  it('NO muestra el bloque cuando todas las fuentes son inválidas (Req 2.2)', () => {
    renderGuide([
      { label: '   ', url: 'https://example.com/blank-label' }, // label vacío tras trim
      { label: 'Sin esquema', url: 'ftp://example.com/file' }, // url no http(s)
      { label: 'Relativa', url: '/ruta/interna' }, // url relativa
      { label: 'X'.repeat(201), url: 'https://example.com/too-long' }, // label > 200
    ]);

    expect(screen.queryByText(SOURCES_HEADING)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sin esquema' })).not.toBeInTheDocument();
  });

  it('en una guía mixta muestra SOLO las fuentes válidas (Req 2.3)', () => {
    renderGuide([
      { label: 'Válida 1', url: 'https://example.com/1' },
      { label: '   ', url: 'https://example.com/blank' }, // inválida: label vacío
      { label: 'Inválida esquema', url: 'mailto:hola@example.com' }, // inválida: url
      { label: 'Válida 2', url: 'http://example.com/2' },
    ]);

    // El bloque aparece porque hay válidas.
    expect(screen.getByText(SOURCES_HEADING)).toBeInTheDocument();

    // Solo las válidas se renderizan, en orden.
    const links = screen.getAllByRole('link').filter((a) => a.textContent !== '← VIP');
    expect(links.map((a) => a.textContent)).toEqual(['Válida 1', 'Válida 2']);

    // Las inválidas no aparecen.
    expect(screen.queryByRole('link', { name: 'Inválida esquema' })).not.toBeInTheDocument();
  });

  it('renderiza "Contenido no encontrado" para un slug inexistente sin bloque de fuentes (Req 5.8)', () => {
    vi.mocked(getVipGuide).mockReturnValue(undefined);
    render(<VipGuidePage />);

    expect(screen.getByText(/Contenido no encontrado/i)).toBeInTheDocument();
    expect(screen.queryByText(SOURCES_HEADING)).not.toBeInTheDocument();
  });
});
