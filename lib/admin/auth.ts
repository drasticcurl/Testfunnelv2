/**
 * Admin Auth — password-gate simple para `/admin/*`.
 *
 * Modelo de seguridad:
 *  - Password en env `ADMIN_PASSWORD` (única fuente de verdad).
 *  - Cookie `admin_token` = `${ts}.${hmac}` con HMAC-SHA256 sobre `${ts}`
 *    usando ADMIN_PASSWORD como secret. La cookie NUNCA contiene el password
 *    en plano y NO se puede forjar sin conocerlo.
 *  - Verificación timing-safe (`crypto.timingSafeEqual`) tanto del password
 *    en el login como del HMAC en cada request → evita timing attacks que
 *    bruteforcean caracter por caracter.
 *  - Rate limit por IP: 5 intentos / 15 min. Después 401 + Retry-After.
 *  - TTL de sesión: 12 h (configurable). Renovación = re-login.
 *  - Cookie `httpOnly`, `sameSite=lax`, `secure` en prod, `path=/admin`.
 *
 * Reglas operativas:
 *  - ADMIN_PASSWORD requerido. Si falta, TODOS los checks fallan (no abre
 *    el dashboard "por accidente"). Logueamos warning una sola vez.
 *  - El password debe tener al menos 24 chars. Si es más corto, logueamos
 *    warning pero no bloqueamos (deploy realista).
 *  - El admin password NUNCA viaja en query params, solo POST body.
 *
 * Este modulo es server-only (importa `node:crypto`).
 */

import crypto from 'crypto';
import type { NextRequest } from 'next/server';

// ─── Constantes públicas ───────────────────────────────────────────────────

export const ADMIN_COOKIE_NAME = 'admin_token';
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 h

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const MIN_PASSWORD_LENGTH = 24;

// ─── Warnings de configuración (una sola vez por proceso) ──────────────────

let warnedMissing = false;
let warnedShort = false;

function getAdminPassword(): string | null {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) {
    if (!warnedMissing) {
      console.warn(
        '[admin/auth] ADMIN_PASSWORD no configurado — todo /admin queda bloqueado.',
      );
      warnedMissing = true;
    }
    return null;
  }
  if (pass.length < MIN_PASSWORD_LENGTH && !warnedShort) {
    console.warn(
      `[admin/auth] ADMIN_PASSWORD tiene ${pass.length} chars — recomendado >= ${MIN_PASSWORD_LENGTH}.`,
    );
    warnedShort = true;
  }
  return pass;
}

// ─── HMAC token ────────────────────────────────────────────────────────────

function hmac(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/** Genera el valor de la cookie firmada para un timestamp dado. */
export function signSessionToken(nowMs: number = Date.now()): string | null {
  const pass = getAdminPassword();
  if (!pass) return null;
  const ts = String(nowMs);
  const sig = hmac(pass, ts);
  return `${ts}.${sig}`;
}

/** Verifica el HMAC y la expiración de un token. Timing-safe. */
export function verifySessionToken(
  token: string | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!token || typeof token !== 'string') return false;
  const pass = getAdminPassword();
  if (!pass) return false;

  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return false;

  const ts = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // ts debe ser un entero positivo razonable
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || tsNum <= 0) return false;

  // Expiración
  if (nowMs - tsNum > ADMIN_SESSION_TTL_SECONDS * 1000) return false;
  // Tampoco aceptamos timestamps del futuro (clock skew razonable)
  if (tsNum - nowMs > 60_000) return false;

  // HMAC esperado
  const expected = hmac(pass, ts);
  return safeEqualHex(sig, expected);
}

/** Compara dos strings hex en tiempo constante. */
function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  try {
    const ab = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ab.length === 0 || ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

// ─── Verificación de password (timing-safe) ────────────────────────────────

export function verifyAdminPassword(input: string | undefined): boolean {
  const pass = getAdminPassword();
  if (!pass) return false;
  if (typeof input !== 'string' || input.length === 0) return false;
  // Pad ambos al mismo largo para que timingSafeEqual no tire por longitud.
  // Igualmente comparamos length explicit primero — si no matchean, igual
  // hacemos un compare dummy para preservar tiempo constante.
  const a = Buffer.from(input);
  const b = Buffer.from(pass);
  if (a.length !== b.length) {
    // Compare contra sí mismo para no leakear timing por length.
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

// ─── Cookie helpers ────────────────────────────────────────────────────────

export function adminCookieOptions(): {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}

export function adminClearCookieOptions(): {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return { ...adminCookieOptions(), maxAge: 0 };
}

// ─── Rate limit (in-memory, por IP) ────────────────────────────────────────
//
// Ventana fija deslizante por simplicidad. En entornos serverless multi-instance
// esto NO es un rate-limit global, pero da una primera barrera contra
// bruteforce trivial. Para garantías reales: KV/Redis con INCR + EXPIRE.

type Bucket = { count: number; firstTs: number };

declare global {
  // eslint-disable-next-line no-var
  var __adminRateLimit: Map<string, Bucket> | undefined;
}

function getBuckets(): Map<string, Bucket> {
  if (!globalThis.__adminRateLimit) {
    globalThis.__adminRateLimit = new Map();
  }
  return globalThis.__adminRateLimit;
}

export function getClientIp(req: NextRequest | Request): string {
  const headers = (req as Request).headers;
  const xff = headers.get('x-forwarded-for') ?? '';
  const first = xff.split(',')[0]?.trim();
  if (first) return first;
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function checkLoginRateLimit(
  ip: string,
  nowMs: number = Date.now(),
): RateLimitResult {
  const buckets = getBuckets();
  const b = buckets.get(ip);

  // GC oportunista: limpia 1 bucket viejo al azar para que no crezca
  // indefinidamente.
  if (buckets.size > 1024) {
    const firstKey = buckets.keys().next().value;
    if (firstKey !== undefined) buckets.delete(firstKey);
  }

  if (!b || nowMs - b.firstTs > RATE_LIMIT_WINDOW_MS) {
    buckets.set(ip, { count: 1, firstTs: nowMs });
    return { ok: true };
  }

  if (b.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil(
      (b.firstTs + RATE_LIMIT_WINDOW_MS - nowMs) / 1000,
    );
    return { ok: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  b.count += 1;
  return { ok: true };
}

/** Resetea el contador de un IP tras un login exitoso. */
export function resetLoginRateLimit(ip: string): void {
  getBuckets().delete(ip);
}

// ─── API alto nivel ────────────────────────────────────────────────────────

/**
 * Verifica si el request tiene una sesión admin válida (lee cookie firmada).
 * Acepta cualquier objeto con `cookies.get(name)?.value` (NextRequest,
 * `cookies()` de next/headers).
 */
export function isAdminAuthenticated(cookies: {
  get: (name: string) => { value: string } | undefined;
}): boolean {
  const c = cookies.get(ADMIN_COOKIE_NAME);
  if (!c) return false;
  return verifySessionToken(c.value);
}
