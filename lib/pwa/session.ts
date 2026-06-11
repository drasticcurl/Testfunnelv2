/**
 * PWA Session Helpers — cookie firmada server-side.
 *
 * Por qué cookie firmada y no magic link Supabase:
 *  - El producto es una PWA que se instala en el celular. Los usuarios
 *    esperan abrir y entrar, no abrir + recibir email + clickear.
 *  - Magic link real con Supabase Auth requiere @supabase/ssr y un
 *    callback handler que no estaba implementado.
 *  - La seguridad efectiva es similar: solo entra quien tenga un email
 *    con compra aprobada en Supabase. La cookie firmada (HMAC SHA-256)
 *    no se puede forjar sin el secret server-side.
 *
 * Migración futura a magic link: cuando convenga, /api/pwa/auth/login
 * puede empezar a mandar el magic link y este módulo seguirá sirviendo
 * para sesiones (Supabase Auth setea su propia cookie).
 *
 * Estructura del token: base64url(payload).base64url(signature)
 *   payload   = { e: email, iat: timestamp_segundos }
 *   signature = HMAC-SHA256(payload, PWA_SESSION_SECRET)
 *
 * Validez: 30 días desde issued_at. Después el usuario re-loguea.
 */

import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'pwa_session';
export const SESSION_TTL_DAYS = 30;
const SECONDS_PER_DAY = 60 * 60 * 24;

/* ─── Crypto helpers ──────────────────────────────────────────────── */

/**
 * Error tipado cuando falta o es inválido el secret. Lo definimos como
 * clase para que los handlers puedan distinguirlo de errores genéricos
 * (ej. mostrar un mensaje específico de "config faltante" al usuario).
 */
export class SessionSecretMissingError extends Error {
  constructor(public readonly reason: 'missing' | 'too_short') {
    super(
      reason === 'missing'
        ? 'PWA_SESSION_SECRET no está configurado en variables de entorno'
        : 'PWA_SESSION_SECRET tiene menos de 16 caracteres',
    );
    this.name = 'SessionSecretMissingError';
  }
}

/**
 * Indica si el secret está bien configurado. Usado por el endpoint de
 * diagnóstico /api/pwa/debug para reportar estado sin lanzar.
 */
export function sessionSecretStatus(): {
  ok: boolean;
  reason?: 'missing' | 'too_short';
  length?: number;
} {
  const secret = process.env.PWA_SESSION_SECRET;
  if (!secret) return { ok: false, reason: 'missing' };
  if (secret.length < 16) return { ok: false, reason: 'too_short', length: secret.length };
  return { ok: true, length: secret.length };
}

function getSecret(): string {
  const secret = process.env.PWA_SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;

  // En producción NO usamos un secret default: tirar error específico para
  // que el handler devuelva un mensaje accionable al usuario en vez de un
  // 500 genérico.
  if (process.env.NODE_ENV === 'production') {
    throw new SessionSecretMissingError(secret ? 'too_short' : 'missing');
  }

  // En dev sí usamos un secret default predecible: facilita testing local
  // sin tener que setear .env.local. Como NODE_ENV=development, este branch
  // nunca ocurre en deploys reales de Vercel.
  return 'dev-only-pwa-session-secret-not-for-production';
}

function b64urlEncode(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8');
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + ((4 - (s.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64');
}

function hmac(payload: string): Buffer {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest();
}

/* ─── Token sign/verify ───────────────────────────────────────────── */

export type SessionPayload = {
  email: string;
  /** issued_at en segundos epoch */
  iat: number;
};

export function signSession(email: string): string {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    iat: Math.floor(Date.now() / 1000),
  };
  const payloadStr = b64urlEncode(JSON.stringify(payload));
  const sig = b64urlEncode(hmac(payloadStr));
  return `${payloadStr}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadStr, sigGiven] = parts;

  // 1) Constant-time signature check (timing-safe).
  const expected = hmac(payloadStr);
  let sigBuf: Buffer;
  try {
    sigBuf = b64urlDecode(sigGiven);
  } catch {
    return null;
  }
  if (sigBuf.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expected)) return null;

  // 2) Parse payload.
  let parsed: unknown;
  try {
    parsed = JSON.parse(b64urlDecode(payloadStr).toString('utf8'));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;
  const email = typeof obj.e === 'string' ? obj.e : typeof obj.email === 'string' ? obj.email : null;
  const iat = typeof obj.iat === 'number' ? obj.iat : null;
  if (!email || iat == null) return null;

  // 3) Expiration.
  const ageSec = Math.floor(Date.now() / 1000) - iat;
  if (ageSec > SESSION_TTL_DAYS * SECONDS_PER_DAY) return null;

  return { email, iat };
}

/* ─── Next.js cookie helpers ──────────────────────────────────────── */

/**
 * Lee la sesión actual del request. Solo usar desde Server Components
 * o route handlers. Devuelve null si no hay cookie o es inválida.
 *
 * Nota: en Next 14 cookies() es síncrono. Devolvemos Promise igualmente
 * para que el día que migremos a Next 15 (cookies() async) no haya que
 * tocar a quien consuma esta función.
 */
export async function readSession(): Promise<SessionPayload | null> {
  const c = cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/* ─── Cookie attributes (compartido entre login y logout) ─────────── */

export const SESSION_COOKIE_ATTRS = {
  name: SESSION_COOKIE,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_DAYS * SECONDS_PER_DAY,
};
