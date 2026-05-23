# 04 — AGENTE API + TRACKING

> **Rol:** construir las API routes (`/api/*`) y el tracking server-side (Conversions API de Meta + integración con Systeme.io + webhook de Hotmart).

## Tu output

1. **`app/api/submit-quiz/route.ts`** — recibe el email + answers del quiz, forward a webhook (Systeme.io)
2. **`app/api/track/route.ts`** — Meta Conversions API server-side
3. **`app/api/hotmart-webhook/route.ts`** — recibe postback de Hotmart cuando hay venta, envía Purchase a CAPI
4. **`lib/tracking.ts`** — helpers client-side de tracking (cualquiera lo puede importar)

## Archivos que tocás (exclusivos tuyos)

- `app/api/submit-quiz/route.ts`
- `app/api/track/route.ts`
- `app/api/hotmart-webhook/route.ts`
- `lib/tracking.ts`

**No toques:** nada de los otros agentes.

## Variables de entorno que asumís disponibles

```
META_PIXEL_ID=
META_CAPI_TOKEN=
QUIZ_WEBHOOK_URL=
SYSTEME_API_KEY=
NEXT_PUBLIC_META_PIXEL_ID=
```

Si alguna no está, tu código debe fallar gracefully (no romper la app).

---

## Estructura

```
app/api/
├── submit-quiz/route.ts
├── track/route.ts
└── hotmart-webhook/route.ts

lib/
└── tracking.ts
```

---

## `lib/tracking.ts`

Helpers para usar desde el cliente. Encapsulan llamadas a Pixel + CAPI.

```ts
declare global {
  interface Window { fbq: any }
}

type CustomData = Record<string, any>;

/**
 * Dispara evento estándar en Pixel cliente Y server-side via API.
 */
export async function trackEvent(event: string, data?: CustomData) {
  // Pixel client-side
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data);
  }

  // CAPI server-side
  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, ...data }),
  }).catch(() => {});
}

/**
 * Dispara evento custom (no-estándar).
 */
export function trackCustom(event: string, data?: CustomData) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', event, data);
  }
}

/**
 * Captura UTMs de la URL al cargar la app y los persiste en localStorage.
 */
export function captureUTMs() {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const data: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach(k => {
    const v = url.searchParams.get(k);
    if (v) data[k] = v;
  });

  if (Object.keys(data).length > 0) {
    localStorage.setItem('tracking_params', JSON.stringify(data));
  }
}

/**
 * Obtiene UTMs persistidos.
 */
export function getUTMs(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('tracking_params') || '{}');
  } catch {
    return {};
  }
}
```

---

## `app/api/submit-quiz/route.ts`

Recibe el quiz completo, hace 3 cosas:
1. Forward a webhook genérico (Make.com / Zapier)
2. Crea/actualiza contacto en Systeme.io con los tags correctos
3. Trackea Lead en CAPI

```ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function hash(s: string) {
  return crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, nombre, ...answers } = body;

    if (!email) {
      return NextResponse.json({ ok: false, error: 'email required' }, { status: 400 });
    }

    // 1. Webhook genérico (Make.com / Zapier / lo que el humano configure)
    const webhookUrl = process.env.QUIZ_WEBHOOK_URL;
    if (webhookUrl) {
      void fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nombre,
          answers,
          submittedAt: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    // 2. Systeme.io API
    const systemeKey = process.env.SYSTEME_API_KEY;
    if (systemeKey) {
      const tipo = calcularTipoBackend(answers);
      const severidad = calcularSeveridadBackend(answers);
      const cat = severidad >= 8 ? 'alta' : severidad >= 5 ? 'media' : 'baja';

      void fetch('https://api.systeme.io/api/contacts', {
        method: 'POST',
        headers: {
          'X-API-Key': systemeKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fields: [
            { slug: 'first_name', value: nombre || '' },
            { slug: 'tipo_hinchazon', value: String(tipo) },
            { slug: 'severidad', value: String(severidad) },
            { slug: 'severidad_cat', value: cat },
          ],
          tags: [
            'quiz_completado',
            `tipo_${tipo}`,
            `severidad_${cat}`,
            'no_comprador',
          ],
        }),
      }).catch(() => {});
    }

    // 3. Lead event a CAPI
    void enviarCAPI('Lead', {
      em: hash(email),
      ...(nombre ? { fn: hash(nombre) } : {}),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// ─── helpers ────────────────────────────────────────

function calcularTipoBackend(answers: any): number {
  const m = answers?.momento_del_dia;
  if (m === 'manana') return 1;
  if (m === 'almuerzo') return 2;
  if (m === 'tarde_noche') return 3;
  if (m === 'todo_el_dia') return 4;
  return 3;
}

function calcularSeveridadBackend(answers: any): number {
  let score = 0;
  const tiempoMap: Record<string, number> = { menos_6m: 2, '6m_2a': 4, '2a_5a': 6, mas_5a: 8 };
  score += tiempoMap[answers?.tiempo_con_problema] || 0;
  const sintomas: string[] = answers?.sintomas || [];
  score += Math.min(sintomas.length * 0.5, 3);
  const frecuenciaMap: Record<string, number> = { diaria: 3, '4_6_dias': 2, '2_3_dias': 1, comidas_especificas: 0.5 };
  score += frecuenciaMap[answers?.frecuencia] || 0;
  return Math.min(Math.round(score), 10);
}

async function enviarCAPI(eventName: string, userData: any, customData?: any) {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;
  if (!PIXEL_ID || !TOKEN) return;

  await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: userData,
        ...(customData ? { custom_data: customData } : {}),
      }],
    }),
  });
}
```

---

## `app/api/track/route.ts`

CAPI server-side genérico. Lo llaman los componentes client cuando disparan eventos.

```ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

function hash(s: string) {
  return crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return NextResponse.json({ ok: false, reason: 'no_pixel_config' }, { status: 200 });
    }

    const body = await req.json();
    const { event, email, value, currency, ...custom } = body;

    if (!event) {
      return NextResponse.json({ ok: false, error: 'event required' }, { status: 400 });
    }

    const userData: Record<string, any> = {
      client_ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || '',
      client_user_agent: req.headers.get('user-agent') || '',
    };
    if (email) userData.em = [hash(email)];

    const customData: Record<string, any> = { ...custom };
    if (value !== undefined) {
      customData.value = value;
      customData.currency = currency || 'USD';
    }

    const payload = {
      data: [{
        event_name: event,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: req.headers.get('referer') || '',
        user_data: userData,
        ...(Object.keys(customData).length > 0 ? { custom_data: customData } : {}),
      }],
    };

    const r = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );

    if (!r.ok) {
      console.error('CAPI error', await r.text());
    }

    return NextResponse.json({ ok: r.ok });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
```

---

## `app/api/hotmart-webhook/route.ts`

Recibe el postback de Hotmart cuando hay una venta o reembolso. Envía Purchase a CAPI y actualiza Systeme.io.

```ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function hash(s: string) {
  return crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');
}

interface HotmartEvent {
  event: string;
  data: {
    buyer?: { email?: string; name?: string };
    purchase?: {
      transaction?: string;
      price?: { value?: number; currency_code?: string };
    };
    product?: { id?: number; name?: string };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as HotmartEvent;
    const { event, data } = body;

    if (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE') {
      const email = data.buyer?.email;
      const value = data.purchase?.price?.value;
      const currency = data.purchase?.price?.currency_code || 'USD';
      const productId = data.product?.id;

      // 1. Purchase event a CAPI
      if (email && process.env.META_PIXEL_ID && process.env.META_CAPI_TOKEN) {
        const payload = {
          data: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'other',
            user_data: { em: [hash(email)] },
            custom_data: {
              value: value || 14.90,
              currency,
              ...(productId ? { content_ids: [String(productId)] } : {}),
            },
          }],
        };

        await fetch(
          `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_CAPI_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
      }

      // 2. Actualizar tag en Systeme.io
      if (email && process.env.SYSTEME_API_KEY) {
        await fetch('https://api.systeme.io/api/contacts', {
          method: 'POST',
          headers: {
            'X-API-Key': process.env.SYSTEME_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            tags: ['comprador'],
            // Para que Systeme la mueva de la secuencia A a la secuencia B
          }),
        });
      }
    }

    if (event === 'PURCHASE_REFUNDED' || event === 'CHARGEBACK') {
      // Marcar como reembolsado en Systeme
      const email = data.buyer?.email;
      if (email && process.env.SYSTEME_API_KEY) {
        await fetch('https://api.systeme.io/api/contacts', {
          method: 'POST',
          headers: {
            'X-API-Key': process.env.SYSTEME_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            tags: ['reembolsado'],
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Hotmart webhook error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Hotmart hace HEAD a veces para validar el endpoint
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'hotmart-webhook' });
}
```

---

## Eventos completos del funnel y dónde se disparan

| Evento | Página | Tipo | Pixel client | CAPI server |
|---|---|---|---|---|
| `PageView` | todas | Estándar | ✅ (en layout) | ❌ |
| `QuizStart` | landing (slide 1) | Custom | ✅ | ❌ |
| `QuizQ3` | quiz pregunta 3 | Custom | ✅ | ❌ |
| `Lead` | submit email | Estándar | ✅ | ✅ (vía submit-quiz) |
| `QuizComplete` | submit email | Custom | ✅ | ❌ |
| `ViewContent` | /resultados | Estándar | ✅ | ✅ (vía track) |
| `ScrollResultados50` | scroll 50% | Custom | ✅ | ❌ |
| `InitiateCheckout` | click CTA | Estándar | ✅ | ✅ (vía track) |
| `Purchase` | Hotmart confirmó | Estándar | ❌ | ✅ (vía hotmart-webhook) |
| `Refund` | Hotmart reembolsó | Custom | ❌ | ❌ (solo Systeme) |

---

## Setup de UTMs (importante)

En Meta Ads Manager → Ad → URL parameters, se configura:

```
utm_source=meta
utm_medium=paid
utm_campaign={{campaign.name}}
utm_content={{ad.name}}
utm_term={{adset.name}}
fbclid={{fbclid}}
```

El `lib/tracking.ts::captureUTMs()` se llama en el primer mount (puede ser en el layout via un client component) para persistir los UTMs.

---

## Configuración del postback en Hotmart

Esto lo hace el agente 11 (Hotmart) en su doc, pero te lo recordás acá:

- En Hotmart: Settings → Postback → Activar
- URL del postback: `https://[tu-dominio].vercel.app/api/hotmart-webhook`
- Eventos a enviar: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_REFUNDED`, `CHARGEBACK`

---

## Test del endpoint /api/track

Una vez deployado, podés testear:

```bash
curl -X POST https://[tu-dominio].vercel.app/api/track \
  -H 'Content-Type: application/json' \
  -d '{"event":"InitiateCheckout","value":14.90,"currency":"USD","email":"test@test.com"}'
```

Y validar en Meta Events Manager → Test Events que llega.

---

## Checklist agente 04

- [ ] `lib/tracking.ts` con `trackEvent`, `trackCustom`, `captureUTMs`, `getUTMs`
- [ ] `app/api/submit-quiz/route.ts` que forward a webhook + Systeme + Lead a CAPI
- [ ] `app/api/track/route.ts` con CAPI server-side genérico
- [ ] `app/api/hotmart-webhook/route.ts` que envía Purchase a CAPI
- [ ] Manejo gracefuí cuando faltan env vars (no rompe la app)
- [ ] Hash SHA256 de emails antes de enviar a CAPI
- [ ] Forward de IP y user-agent a CAPI
- [ ] Test endpoint /api/track responde correctamente
- [ ] Test endpoint /api/hotmart-webhook responde 200 a HEAD/GET
- [ ] Sin errores en consola
- [ ] Documentar en el README cómo configurar las env vars en Vercel
