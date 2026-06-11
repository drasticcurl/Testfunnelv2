/**
 * Helpers de "día" en zona horaria Argentina (GMT-3, America/Argentina/Buenos_Aires).
 *
 * El funnel se agrupa por día calendario en GMT-3. El negocio reinicia /
 * compara métricas día a día, así que la unidad natural es el día local AR,
 * no UTC (un evento a las 22:00 GMT-3 sigue siendo "hoy", aunque en UTC ya
 * sea el día siguiente).
 *
 * Devolvemos siempre el formato `YYYY-MM-DD` (ISO date sin tiempo), que es
 * el mismo formato que usa la columna `day date` en Supabase.
 */

export const AR_TIME_ZONE = 'America/Argentina/Buenos_Aires';

/** Sentinela para filas históricas sin día (anteriores al tracking diario). */
export const DAY_SENTINEL = '2000-01-01';

/**
 * Devuelve el día calendario en GMT-3 para una fecha dada (default: ahora),
 * en formato `YYYY-MM-DD`.
 *
 * Usa Intl en vez de restar 3h a mano para respetar correctamente la zona
 * (Argentina no usa DST hoy, pero Intl es la fuente de verdad correcta).
 */
export function getArgentinaDay(date: Date = new Date()): string {
  // en-CA da formato YYYY-MM-DD directamente.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: AR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Hora actual en GMT-3 en formato `HH:mm` (para mostrar "actualizado a las..."). */
export function getArgentinaTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: AR_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/** ¿El día `YYYY-MM-DD` es el día de hoy en GMT-3? */
export function isToday(day: string): boolean {
  return day === getArgentinaDay();
}

/**
 * Formatea un día `YYYY-MM-DD` a una etiqueta amigable en es-AR.
 * Ej: "2026-06-10" -> "mié 10 jun". Para hoy/ayer devuelve esas palabras.
 */
export function formatDayLabel(day: string): string {
  if (day === DAY_SENTINEL) return 'Histórico (sin fecha)';
  const today = getArgentinaDay();
  if (day === today) return 'Hoy';

  // Ayer en GMT-3.
  const yesterday = getArgentinaDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (day === yesterday) return 'Ayer';

  // Parse YYYY-MM-DD como fecha local "a mediodía" para evitar corrimientos.
  const [y, m, d] = day.split('-').map((n) => Number.parseInt(n, 10));
  if (!y || !m || !d) return day;
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(dt);
}
