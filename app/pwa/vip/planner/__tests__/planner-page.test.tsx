// @vitest-environment jsdom

/**
 * Task 9.5 — Tests de integración del Planner editable.
 *
 * Cubre el cableado de la página `/pwa/vip/planner`:
 *  - Escribir en una celda actualiza el estado y, tras el debounce (400ms),
 *    `localStorage` contiene el valor (Req 7.1).
 *  - Al remontar el componente, las celdas se rehidratan con lo guardado
 *    (Req 8.1, 11.4).
 *  - El click en "Descargar PDF" invoca el generador (mock) sin leer
 *    `PlannerData`; el botón se deshabilita mientras descarga y se rehabilita
 *    al terminar (Req 9.1, 9.6).
 *  - Ante un error del generador se muestra un mensaje legible sin romper la
 *    página y la edición sigue operativa (Req 9.7 / 10.5 / 10.6).
 *  - El render inicial es determinista (createEmptyPlanner) y no emite
 *    advertencias de hidratación (Req 11.1).
 *
 * Estrategia: usamos el núcleo real `planner-state` (localStorage de jsdom),
 * mockeamos `generateBlankPlannerPdf` (para no cargar jspdf ni tocar el estado)
 * y `framer-motion` (elementos simples). Para el debounce usamos timers falsos.
 *
 * _Requirements: 7.1, 8.1, 9.1, 9.6, 11.1, 11.4_
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import VipPlannerPage from '../page';
import { generateBlankPlannerPdf } from '@/lib/pwa/planner-pdf';
import { STORAGE_KEYS } from '@/lib/constants';

// Generador de PDF: mockeado. Por diseño es independiente del estado, así que
// verificar que se invoca (sin argumentos) prueba el cableado del botón.
vi.mock('@/lib/pwa/planner-pdf', () => ({
  generateBlankPlannerPdf: vi.fn(),
}));

// framer-motion → elementos simples (sin animaciones que interfieran).
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const FRAMER_PROPS = new Set([
    'initial', 'animate', 'exit', 'variants', 'transition',
    'whileHover', 'whileTap', 'whileInView', 'layout', 'viewport',
  ]);
  // Cache por tag: el tipo de componente debe ser ESTABLE entre renders, de lo
  // contrario React remonta el subárbol en cada render (invalidando refs a nodos
  // del DOM y reseteando los inputs controlados).
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

/** Promesa controlable para simular una descarga en curso. */
function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(generateBlankPlannerPdf).mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Task 9.5 — integración del Planner', () => {
  it('renderiza un grid determinista de 56 celdas vacías sin advertencias de hidratación (Req 11.1)', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<VipPlannerPage />);

    const cells = screen.getAllByRole('textbox');
    expect(cells).toHaveLength(56); // 8 filas × 7 días
    cells.forEach((cell) => expect(cell).toHaveValue(''));

    const hydrationWarnings = errSpy.mock.calls.filter((call) =>
      String(call[0]).toLowerCase().includes('hydrat'),
    );
    expect(hydrationWarnings).toHaveLength(0);

    errSpy.mockRestore();
  });

  it('escribir en una celda persiste el valor en localStorage tras el debounce de 400ms (Req 7.1)', async () => {
    vi.useFakeTimers();
    render(<VipPlannerPage />);

    const cell = screen.getByLabelText(/Desayuno.*Lunes/);
    // `await act(async ...)` garantiza el flush del efecto de autoguardado
    // (programar/limpiar el timer) antes de avanzar los timers falsos.
    await act(async () => {
      fireEvent.change(cell, { target: { value: 'Avena con frutas' } });
    });

    // El estado se refleja de inmediato en el input controlado.
    expect(cell).toHaveValue('Avena con frutas');

    // Antes del debounce todavía no se persistió.
    expect(localStorage.getItem(STORAGE_KEYS.vipPlanner)).toBeNull();

    // Tras 400ms se dispara el autoguardado.
    act(() => {
      vi.advanceTimersByTime(400);
    });

    const raw = localStorage.getItem(STORAGE_KEYS.vipPlanner);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.version).toBe(1);
    expect(parsed.data.desayuno[0]).toBe('Avena con frutas');
  });

  it('reinicia el debounce en cada tecla y persiste una sola vez al final (Req 7.2)', async () => {
    vi.useFakeTimers();
    render(<VipPlannerPage />);

    const cell = screen.getByLabelText(/Almuerzo.*Martes/);

    await act(async () => {
      fireEvent.change(cell, { target: { value: 'En' } });
    });
    act(() => {
      vi.advanceTimersByTime(300); // < 400ms, no guarda todavía
    });
    expect(localStorage.getItem(STORAGE_KEYS.vipPlanner)).toBeNull();

    // Segunda tecla: reinicia el temporizador (limpia el timer anterior).
    await act(async () => {
      fireEvent.change(cell, { target: { value: 'Ensalada' } });
    });
    // Avanzamos 399ms desde la última tecla: si el timer NO se hubiera
    // reiniciado, el de la primera tecla (programado en t=0) ya habría disparado
    // hacia t≈400; al seguir en null demostramos que se reinició.
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(localStorage.getItem(STORAGE_KEYS.vipPlanner)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1); // ahora sí: 400ms desde la última tecla
    });
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.vipPlanner) as string);
    expect(parsed.data.almuerzo[1]).toBe('Ensalada'); // Martes = índice 1
  });

  it('al remontar, las celdas se rehidratan con lo guardado (Req 8.1, 11.4)', async () => {
    vi.useFakeTimers();
    const first = render(<VipPlannerPage />);

    const cell = screen.getByLabelText(/Cena.*Miércoles/);
    await act(async () => {
      fireEvent.change(cell, { target: { value: 'Sopa de verduras' } });
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    first.unmount();

    // Nuevo montaje: la hidratación en el efecto debe restaurar el valor.
    render(<VipPlannerPage />);
    const rehydrated = screen.getByLabelText(/Cena.*Miércoles/);
    expect(rehydrated).toHaveValue('Sopa de verduras');
  });

  it('el click en "Descargar PDF" invoca el generador y togglea el estado deshabilitado (Req 9.1, 9.6)', async () => {
    const d = deferred();
    vi.mocked(generateBlankPlannerPdf).mockImplementation(() => d.promise);

    render(<VipPlannerPage />);
    const button = screen.getByRole('button', { name: /Descargar PDF/i });
    expect(button).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(button);
    });

    // Durante la generación el botón queda deshabilitado (evita dobles descargas).
    expect(generateBlankPlannerPdf).toHaveBeenCalledTimes(1);
    expect(generateBlankPlannerPdf).toHaveBeenCalledWith(); // sin leer PlannerData
    expect(button).toBeDisabled();

    // Al terminar, se rehabilita.
    await act(async () => {
      d.resolve();
      await d.promise;
    });
    expect(button).not.toBeDisabled();
  });

  it('un doble click no dispara dos descargas mientras una está en curso (Req 9.6)', async () => {
    const d = deferred();
    vi.mocked(generateBlankPlannerPdf).mockImplementation(() => d.promise);

    render(<VipPlannerPage />);
    const button = screen.getByRole('button', { name: /Descargar PDF/i });

    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button); // segundo click mientras genera
    });

    expect(generateBlankPlannerPdf).toHaveBeenCalledTimes(1);

    await act(async () => {
      d.resolve();
      await d.promise;
    });
  });

  it('ante un error del generador muestra un mensaje, rehabilita el botón y mantiene la edición (Req 9.7, 10.5, 10.6)', async () => {
    const d = deferred();
    vi.mocked(generateBlankPlannerPdf).mockImplementation(() => d.promise);

    render(<VipPlannerPage />);
    const button = screen.getByRole('button', { name: /Descargar PDF/i });

    await act(async () => {
      fireEvent.click(button);
    });

    await act(async () => {
      d.reject(new Error('boom'));
      await d.promise.catch(() => {});
    });

    // Mensaje de error visible y botón rehabilitado para reintentar.
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/No se pudo generar el PDF/i)).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    // La edición sigue operativa pese al error.
    const cell = screen.getByLabelText(/Desayuno.*Lunes/);
    fireEvent.change(cell, { target: { value: 'Yogur' } });
    expect(cell).toHaveValue('Yogur');
  });
});
