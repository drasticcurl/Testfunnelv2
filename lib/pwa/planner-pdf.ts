/**
 * @file planner-pdf.ts — Generador client-only del PDF en blanco del Planner VIP.
 *
 * Expone `generateBlankPlannerPdf()`, que produce y descarga una plantilla
 * semanal VACÍA (encabezado de los 7 días + columna de labels de filas + celdas
 * de datos en blanco), idéntica para cualquier estado del usuario.
 *
 * Decisiones de diseño (design.md §B.5):
 *  - La salida es independiente del estado: NO lee `PlannerData` ni `localStorage`.
 *    La estructura se deriva exclusivamente de `PLANNER_DAYS` / `PLANNER_ROWS`.
 *  - Las librerías de PDF (`jspdf` + `jspdf-autotable`) se importan de forma
 *    DINÁMICA dentro de la función, nunca en el top-level del módulo, para no
 *    afectar el SSR ni inflar el bundle inicial.
 *  - Si la generación falla, el error se PROPAGA (no se traga) para que la página
 *    (tarea 9.4) lo maneje; no se descarga ningún archivo parcial.
 */

import { PLANNER_DAYS, PLANNER_ROWS } from './planner-state';

/** Nombre fijo del archivo descargado. */
const PDF_FILENAME = 'planner-semanal-chau-hinchazon.pdf';

/**
 * Genera y descarga una plantilla de planner semanal en blanco como archivo PDF.
 *
 * Client-only: debe invocarse desde un handler de evento en el navegador (no en
 * SSR). Importa `jspdf` y `jspdf-autotable` dinámicamente dentro de la función.
 *
 * Postcondiciones:
 *  - Documento en orientación apaisada (landscape).
 *  - Tabla con head `['', ...PLANNER_DAYS]` y body con una fila por cada
 *    `PLANNER_ROWS` (label en la primera columna; las 7 celdas de datos vacías).
 *  - Descarga el archivo `planner-semanal-chau-hinchazon.pdf`.
 *  - La salida es idéntica para cualquier contenido del planner (plantilla vacía).
 *
 * @throws Propaga cualquier error de carga de las librerías o de generación, de
 *         modo que el llamador pueda mostrar un mensaje y evitar archivos parciales.
 */
export async function generateBlankPlannerPdf(): Promise<void> {
  // Import dinámico: mantiene el SSR sano y fuera del bundle inicial.
  const { jsPDF } = await import('jspdf');
  // jspdf-autotable v5: el default export es la función `autoTable(doc, options)`.
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape' });

  // Encabezados y subtítulo (opcionales, plantilla en blanco).
  doc.setFontSize(16);
  doc.text('Planner semanal — Chau Hinchazón', 14, 16);
  doc.setFontSize(11);
  doc.text('Semana del ______ al ______', 14, 23);

  // Estructura de la tabla derivada SOLO de las constantes (sin estado de usuario).
  const head = [['', ...PLANNER_DAYS]];
  const body = PLANNER_ROWS.map((row) => [
    row.label,
    '', '', '', '', '', '', '',
  ]);

  // jspdf-autotable v5: forma funcional `autoTable(doc, options)`.
  autoTable(doc, {
    head,
    body,
    startY: 28,
    theme: 'grid',
    styles: { minCellHeight: 14, fontSize: 9, valign: 'middle' },
    headStyles: { fillColor: [122, 143, 106], halign: 'center' },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
  });

  // Descarga directa del archivo .pdf (sin diálogo de impresión del navegador).
  doc.save(PDF_FILENAME);
}
