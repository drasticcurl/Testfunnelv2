/**
 * PWA Session — Edge Runtime variant.
 *
 * El middleware corre en Edge Runtime y no puede usar `node:crypto`.
 * Acá replicamos `verifySession()` con Web Crypto API.
 *
 * IMPORTANTE: el algoritmo y el shape del payload son IDÉNTICOS a los
 * de `lib/pwa/session.ts`. Cualquier cambio al formato (claves, TTL,
 * codificación) tiene que hacerse en AMBOS archivos al mismo tiempo,
 * sino las cookies firmadas en el server no validan en el middleware.
 */

import type { SessionPayload } from './session';

export const SESSION_COOKIE = 'pwa_session';
const SESSION_TTL_DAYS = 30;
const SECONDS_PER_DAY = 60 * 60 * 24;

function getSecret(): string {
  const secret = process.env.PWA_SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  // En el middleware NO hacemos throw aunque sea producción: si falta el
  // secret, el verify falla y el guard manda al login, que es el comportamiento
  // seguro por default.
  return 'dev-only-pwa-session-secret-not-for-production';
}

function b64urlToBytes(s: string): Uint8Array {
  const padded = s
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(s.length + ((4 - (s.length % 4)) % 4), '=');
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSha256(key: string, data: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifySessionEdge(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadStr, sigGiven] = parts;

  // 1) Constant-time signature check.
  let sigBuf: Uint8Array;
  try {
    sigBuf = b64urlToBytes(sigGiven);
  } catch {
    return null;
  }
  const expected = await hmacSha256(getSecret(), payloadStr);
  if (!timingSafeEqual(sigBuf, expected)) return null;

  // 2) Parse payload.
  let parsed: unknown;
  try {
    const bytes = b64urlToBytes(payloadStr);
    const txt = new TextDecoder().decode(bytes);
    parsed = JSON.parse(txt);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;
  const email =
    typeof obj.email === 'string'
      ? obj.email
      : typeof (obj as { e?: unknown }).e === 'string'
        ? ((obj as { e: string }).e)
        : null;
  const iat = typeof obj.iat === 'number' ? obj.iat : null;
  if (!email || iat == null) return null;

  // 3) Expiration.
  const ageSec = Math.floor(Date.now() / 1000) - iat;
  if (ageSec > SESSION_TTL_DAYS * SECONDS_PER_DAY) return null;

  return { email, iat };
}
