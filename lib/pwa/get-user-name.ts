/**
 * Convierte email → nombre legible (capitalizado).
 *
 * Ejemplos:
 *   "juana@gmail.com"           → "Juana"
 *   "maria.lopez@gmail.com"     → "Maria Lopez"
 *   "ana_g@yahoo.com"           → "Ana G"
 *   "user123+promo@example.com" → "User123"
 *   "TEST@FOO.COM"              → "Test"
 *
 * Es "good enough" hasta que tengamos el nombre real del comprador
 * guardado en una tabla `profiles` (próximo iter).
 */
export function deriveNameFromEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return 'Hola';

  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf('@');
  if (at <= 0) return 'Hola';

  let local = trimmed.slice(0, at);
  // Quitar todo lo que viene después de "+" (suffix de gmail/etc).
  const plus = local.indexOf('+');
  if (plus !== -1) local = local.slice(0, plus);

  // Separar por . _ - en palabras y capitalizar cada una.
  const words = local
    .split(/[._-]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .map(capitalize);

  if (words.length === 0) return 'Hola';
  // Devolver máximo 2 palabras para no inundar el header.
  return words.slice(0, 2).join(' ');
}

function capitalize(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}
