/**
 * Modulo central de tracking del Funnel Anti-Hinchazon.
 *
 * Concentra:
 *  - Hash SHA256 de PII (email) para Meta CAPI
 *  - Helpers para llamar a Meta Conversions API server-side
 *  - Lectura server-side de cookies _fbc / _fbp (con fallback al body del request)
 *
 * Fuente de verdad: docs/04-API-TRACKING.md y docs/15-TRACKING-FIXES.md
 *
 * IMPORTANTE: este archivo importa `crypto` de Node — por eso cualquier
 * route que lo importe debe declarar `runtime = 'nodejs'` y NINGUN client
 * component puede importarlo. Los helpers de cookies/UTMs para el cliente
 * viven en `lib/cookies.ts`.
 *
 * Re-exportamos `UTMs`, `captureUTMs` y `getUTMs` desde `./cookies` para
 * mantener compatibilidad con cualquier modulo server que ya los importaba
 * desde aca (ahora son no-op en server, igual que antes).
 */

import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export { captureUTMs, getUTMs } from './cookies';
export type { UTMs } from './cookies';

// ─── Tipos publicos ─────────────────────────────────────────────────────────

export type CapiUserData = {
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  fbc?: string; // _fbc cookie value
  fbp?: string; // _fbp cookie value
};

export type CapiCustomData = {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  num_items?: number;
};

export type CapiEvent = {
  event_name: string;
  event_time?: number;
  event_id?: string; // para deduplicacion con el pixel client
  action_source?: 'website' | 'system_generated' | 'app';
  event_source_url?: string;
  user_data: CapiUserData;
  custom_data?: CapiCustomData;
};

// ─── Hash SHA256 (Meta requiere PII normalizada y hasheada) ─────────────────

/**
 * Hashea un email para Meta CAPI:
 *  1. trim
 *  2. lowercase
 *  3. SHA256 hex
 *
 * Si el input es vacio o invalido, devuelve undefined.
 */
export function hashEmail(email: string | undefined | null): string | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// ─── Meta Conversions API (server-side) ─────────────────────────────────────

const CAPI_VERSION = 'v18.0';

/**
 * Envia un evento a Meta Conversions API.
 *
 * Comportamiento si faltan envs:
 *  - META_PIXEL_ID o META_CAPI_TOKEN faltan -> no-op silencioso, retorna { ok: false, reason }
 *  - Esto NO debe romper la app del usuario
 *
 * Errores de red:
 *  - Logueados a console, retornados como { ok: false }
 */
export async function sendCapiEvent(
  event: CapiEvent,
): Promise<{ ok: boolean; reason?: string; error?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn(
      '[tracking] CAPI skip: META_PIXEL_ID o META_CAPI_TOKEN no configurados',
    );
    return { ok: false, reason: 'env_missing' };
  }

  const eventTime = event.event_time ?? Math.floor(Date.now() / 1000);

  // Hashear email automaticamente si fue provisto en plain
  const userData: Record<string, unknown> = {};
  if (event.user_data.email) {
    const hashed = hashEmail(event.user_data.email);
    if (hashed) userData.em = [hashed];
  }
  if (event.user_data.ipAddress) userData.client_ip_address = event.user_data.ipAddress;
  if (event.user_data.userAgent) userData.client_user_agent = event.user_data.userAgent;
  if (event.user_data.fbc) userData.fbc = event.user_data.fbc;
  if (event.user_data.fbp) userData.fbp = event.user_data.fbp;

  const payload = {
    data: [
      {
        event_name: event.event_name,
        event_time: eventTime,
        action_source: event.action_source ?? 'website',
        event_source_url: event.event_source_url,
        event_id: event.event_id,
        user_data: userData,
        custom_data: event.custom_data,
      },
    ],
  };

  const url = `https://graph.facebook.com/${CAPI_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(
    accessToken,
  )}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        `[tracking] CAPI error ${res.status} para ${event.event_name}: ${text}`,
      );
      return { ok: false, error: `${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    console.error(`[tracking] CAPI fetch failed para ${event.event_name}:`, err);
    return { ok: false, error: 'network' };
  }
}

// ─── Systeme.io (server-side) ──────────────────────────────────────────────

/**
 * Crea o actualiza un contacto en Systeme.io con tags.
 *
 * Comportamiento si falta SYSTEME_API_KEY: no-op + warn.
 */
export async function upsertSystemeContact(args: {
  email: string;
  nombre?: string;
  tags?: string[];
  fields?: Record<string, string | number>;
}): Promise<{ ok: boolean; reason?: string; error?: string }> {
  const apiKey = process.env.SYSTEME_API_KEY;
  if (!apiKey) {
    console.warn('[tracking] Systeme skip: SYSTEME_API_KEY no configurado');
    return { ok: false, reason: 'env_missing' };
  }

  const { email, nombre, tags = [], fields = {} } = args;

  if (!email || !email.includes('@')) {
    return { ok: false, reason: 'invalid_email' };
  }

  try {
    const res = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        fields: {
          ...(nombre ? { first_name: nombre } : {}),
          ...fields,
        },
        tags,
      }),
    });

    // Systeme suele devolver 201 al crear y 422 si ya existe (en cuyo caso
    // habria que actualizar). Para nuestra escala de lanzamiento, aceptamos
    // ambos como exito y dejamos que Make/Zapier maneje el caso edge.
    if (!res.ok && res.status !== 422) {
      const text = await res.text().catch(() => '');
      console.error(`[tracking] Systeme error ${res.status}: ${text}`);
      return { ok: false, error: `${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    console.error('[tracking] Systeme fetch failed:', err);
    return { ok: false, error: 'network' };
  }
}

// ─── Server-side: leer _fbc / _fbp del request ──────────────────────────────

/**
 * Helper para route handlers: extrae fbc/fbp del body (si el cliente los envio
 * explicitamente) con fallback a las cookies del request.
 *
 * Preferencia body > cookie porque el cliente pudo haberlas leido en un momento
 * en que el Pixel ya estaba inicializado, y la cookie podria todavia no estar
 * persistida en el dominio principal (carrera de inicializacion).
 *
 * Siempre devuelve `{ fbc, fbp }` con valores `string | undefined`. Nunca tira.
 */
export function getMetaCookiesFromRequest(
  req: NextRequest,
  body?: { fbc?: unknown; fbp?: unknown },
): { fbc: string | undefined; fbp: string | undefined } {
  const fromBody = (v: unknown): string | undefined =>
    typeof v === 'string' && v.length > 0 ? v : undefined;

  const fbc = fromBody(body?.fbc) ?? req.cookies.get('_fbc')?.value ?? undefined;
  const fbp = fromBody(body?.fbp) ?? req.cookies.get('_fbp')?.value ?? undefined;

  return { fbc: fbc || undefined, fbp: fbp || undefined };
}

// ─── UTMs (client-side helpers) ─────────────────────────────────────────────
// Movidos a `lib/cookies.ts` (re-exportados arriba) para que client components
// puedan importarlos sin arrastrar `crypto` de Node al bundle.
