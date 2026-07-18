// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import { SlideSalesPageV3B } from './SlideSalesPageV3B';
import { PRICING } from '@/lib/quiz-v2/config';

/**
 * Feature: argentina-funnel-ab-test, Task 5.2 + Req 18 (CRO rework) — unit
 * tests de SlideSalesPageV3B. Verifica: reutilización de pricing/testimonios
 * (contenido intacto), que se disparan los eventos af_<V>_salespage_view (mount)
 * y af_<V>_checkout (click) con la variante correcta, que el cart attribute
 * `funnel_variant` se adjunta en el checkout, que el enmarcado por día en ARS
 * se renderiza DERIVADO de PRICING.front.amount, y que la barra sticky de
 * compra (mobile) dispara el mismo checkout/tracking.
 * _Requirements: 8.2, 12.3, 12.4, 13.4, 18.1, 18.2, 18.4_
 */

type TrackBody = { event?: string; custom?: Record<string, unknown> };

function trackEvents(fetchMock: ReturnType<typeof vi.fn>): TrackBody[] {
  return fetchMock.mock.calls
    .filter(([url]) => url === '/api/track')
    .map(([, init]) => {
      try {
        return JSON.parse((init as RequestInit).body as string) as TrackBody;
      } catch {
        return {} as TrackBody;
      }
    });
}

/** Espejo de la lógica de formateo ARS del componente (separador de miles "."). */
function formatArs(n: number): string {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

describe('SlideSalesPageV3B', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let openMock: ReturnType<typeof vi.fn>;
  // Callbacks de IntersectionObserver capturados (el componente lo usa para
  // gatear la barra sticky cuando la sección de precio entra al viewport).
  let ioCallbacks: IntersectionObserverCallback[];

  /** Simula que la sección de precio entró al viewport (dispara los observers). */
  function triggerPriceSeen() {
    act(() => {
      ioCallbacks.forEach((cb) =>
        cb(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        ),
      );
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
    ioCallbacks = [];
    // framer-motion (whileInView) y el gate de la sticky requieren
    // IntersectionObserver, ausente en jsdom. Capturamos el callback para poder
    // disparar "precio visto" de forma determinista en los tests.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        ioCallbacks.push(cb);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
    window.localStorage.clear();
    window.localStorage.setItem('ab_funnel_v1', 'B');
    fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;
    openMock = vi.fn();
    window.open = openMock as unknown as typeof window.open;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reutiliza el pricing del config (PRICING.front.display)', () => {
    const { container } = render(<SlideSalesPageV3B />);
    expect(container.textContent).toContain(PRICING.front.display);
  });

  it('reutiliza los testimonios existentes sin modificarlos', () => {
    const { container } = render(<SlideSalesPageV3B />);
    expect(container.textContent).toContain('Anabela');
    expect(container.textContent).toContain('no me cerraba el jean');
  });

  it('NO menciona cuotas y mantiene la fila de pago de Funnel A', () => {
    const { container } = render(<SlideSalesPageV3B />);
    const text = container.textContent ?? '';
    expect(text).toContain('Visa · Mastercard · MercadoPago');
    expect(text.toLowerCase()).not.toContain('cuota');
  });

  it('renderiza el costo por día (base 30 días) y el precio final, DERIVADOS de PRICING.front.amount', () => {
    const { container } = render(<SlideSalesPageV3B />);
    // El costo por día se computa sobre la base del plan de 30 días (Argentina sin upsell).
    const expectedPerDay = formatArs(Math.round(PRICING.front.amount / 30));
    const text = container.textContent ?? '';
    // El número por día es computado (no hardcodeado) y aparece en la línea de marco.
    expect(text).toContain(`${expectedPerDay} por día`);
    // El precio FINAL aparece al lado del costo por día (también derivado).
    expect(text).toContain(`${expectedPerDay} por día · ${PRICING.front.display} en total`);
    // El badge de % OFF también es derivado del ancla vs el precio real.
    const expectedPct = Math.round((1 - PRICING.front.amount / 51000) * 100);
    expect(text).toContain(`${expectedPct}% OFF`);
  });

  it('renderiza el ancla de costo del nutricionista antes del precio', () => {
    const { container } = render(<SlideSalesPageV3B />);
    const text = container.textContent ?? '';
    // Ancla del mundo real con monto derivado ($30.000) y redacción suave.
    expect(text).toContain('$30.000');
    expect(text.toLowerCase()).toContain('nutricionista');
    expect(text.toLowerCase()).toContain('arranca en');
  });

  it('dispara af_B_salespage_view al montar (con la variante B)', () => {
    render(<SlideSalesPageV3B />);
    const events = trackEvents(fetchMock);
    expect(events.some((e) => e.event === 'ViewContent')).toBe(true);
    const spView = events.find((e) => e.event === 'af_B_salespage_view');
    expect(spView).toBeDefined();
    expect(spView?.custom?.funnel_variant).toBe('B');
  });

  it('al click del CTA dispara af_B_checkout y adjunta funnel_variant al checkout', () => {
    const { getAllByRole } = render(<SlideSalesPageV3B />);
    fetchMock.mockClear();

    const buttons = getAllByRole('button').filter((b) => /EMPEZAR/i.test(b.textContent ?? ''));
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);

    const events = trackEvents(fetchMock);
    // Evento Meta de intención + evento del test full-funnel.
    expect(events.some((e) => e.event === 'InitiateCheckout')).toBe(true);
    const checkout = events.find((e) => e.event === 'af_B_checkout');
    expect(checkout).toBeDefined();
    expect(checkout?.custom?.funnel_variant).toBe('B');

    // La salida (window.open con cart attribute) ocurre tras el setTimeout(150).
    vi.advanceTimersByTime(200);
    expect(openMock).toHaveBeenCalledTimes(1);
    const openedUrl = String(openMock.mock.calls[0][0]);
    expect(openedUrl).toContain('funnel_variant=B');
    expect(openedUrl).toContain('attributes[funnel_variant]=B');
  });

  it('la barra sticky permanece oculta hasta que se ve la sección de precio', () => {
    const { getByTestId } = render(<SlideSalesPageV3B />);
    const bar = getByTestId('sticky-buybar');
    // Antes de ver el precio: oculta (translada fuera de pantalla + aria-hidden).
    expect(bar.className).toContain('translate-y-full');
    expect(bar.getAttribute('aria-hidden')).toBe('true');

    // Cuando la sección de precio entra al viewport, la barra se revela.
    triggerPriceSeen();
    expect(bar.className).toContain('translate-y-0');
    expect(bar.getAttribute('aria-hidden')).toBe('false');
  });

  it('la barra sticky (mobile) dispara el mismo checkout + tracking', () => {
    const { getByRole } = render(<SlideSalesPageV3B />);
    // La barra se gatea al ver el precio (preserva la curiosidad).
    triggerPriceSeen();
    fetchMock.mockClear();

    // El botón sticky vive siempre en el DOM (accesible vía aria-label).
    const stickyBtn = getByRole('button', { name: /Empezar ahora/i });
    fireEvent.click(stickyBtn);

    const events = trackEvents(fetchMock);
    expect(events.some((e) => e.event === 'InitiateCheckout')).toBe(true);
    const checkout = events.find((e) => e.event === 'af_B_checkout');
    expect(checkout).toBeDefined();
    expect(checkout?.custom?.funnel_variant).toBe('B');

    vi.advanceTimersByTime(200);
    expect(openMock).toHaveBeenCalledTimes(1);
    const openedUrl = String(openMock.mock.calls[0][0]);
    expect(openedUrl).toContain('attributes[funnel_variant]=B');
  });
});
