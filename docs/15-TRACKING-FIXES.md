# Agente 15 — Tracking Fixes (fbc/fbp + UTMs al checkout)

> Dos fixes técnicos críticos antes de salir a producción real.

---

## Goal

### Fix 1 — fbc/fbp en CAPI
Capturar y forwardear las cookies `_fbc` y `_fbp` que setea el Pixel de Meta, en TODOS los eventos enviados a CAPI. Sin esto, Meta no puede dedupear bien client+server events ni hacer matching óptimo de usuarios.

### Fix 2 — UTMs reales al checkout de Hotmart
Hoy `buildCheckoutUrl()` agrega UTMs estáticos (`utm_source=quiz&utm_medium=resultados&utm_campaign=lanzamiento`). Eso significa que en Hotmart **NO sabés qué creativo o campaña generó cada venta**. Necesitamos pasar los UTMs reales del ad (capturados en localStorage) al URL de checkout.

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `lib/cookies.ts` | NEW — helpers para leer cookies cliente |
| `lib/tracking.ts` | MODIFY — `getMetaCookies()` helper |
| `app/api/track/route.ts` | MODIFY — leer fbc/fbp del request si no están en body |
| `app/api/submit-quiz/route.ts` | MODIFY — idem |
| `app/api/hotmart-webhook/route.ts` | MODIFY — buyer.fbc/fbp si Hotmart los pasa |
| `lib/parse-resultados.ts` | MODIFY — `buildCheckoutUrl()` acepta `utms?: Record<string,string>` |
| `components/resultados/CTAFinal.tsx` | MODIFY — leer UTMs de localStorage y appendear |
| `components/resultados/StickyCTA.tsx` | MODIFY — idem |
| `components/quiz/QuizContainer.tsx` | MODIFY — pasar fbc/fbp en payload de /api/track |

---

## Archivos read-only

- `app/page.tsx` — ya llama a `captureUTMs()`, verificar que sigue funcionando

---

## Implementation outline

### Fix 1 — fbc/fbp

#### Cliente: leer cookies

```ts
// lib/cookies.ts
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : undefined;
}

export function getMetaCookies() {
  return {
    fbc: getCookie('_fbc'),
    fbp: getCookie('_fbp'),
  };
}
```

#### En toda llamada a `/api/track` desde cliente:

```ts
import { getMetaCookies } from '@/lib/cookies';

const meta = getMetaCookies();
fetch('/api/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'QuizProgress',
    fbc: meta.fbc,
    fbp: meta.fbp,
    ...
  }),
});
```

#### Server: fallback desde cookies del request

```ts
// app/api/track/route.ts
const fbcFromBody = asString(body.fbc);
const fbpFromBody = asString(body.fbp);
const fbcFromCookie = req.cookies.get('_fbc')?.value;
const fbpFromCookie = req.cookies.get('_fbp')?.value;

const fbc = fbcFromBody ?? fbcFromCookie;
const fbp = fbpFromBody ?? fbpFromCookie;
```

Hacer lo mismo en `/api/submit-quiz` para el evento Lead.

### Fix 2 — UTMs al checkout

#### Modificar `buildCheckoutUrl()`

```ts
export function buildCheckoutUrl(utms?: Record<string, string>): string {
  const base = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL || 'https://pay.hotmart.com/PLACEHOLDER';

  // Defaults
  const params = new URLSearchParams({
    utm_source: 'quiz',
    utm_medium: 'resultados',
    utm_campaign: 'lanzamiento',
  });

  // Override con UTMs reales del ad si llegaron
  if (utms) {
    for (const [k, v] of Object.entries(utms)) {
      if (v) params.set(k, v);
    }
  }

  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${params.toString()}`;
}
```

#### En CTAs (client components)

`/resultados/page.tsx` es server component. La URL debe construirse client-side donde tenemos acceso a localStorage.

Solución: convertir `CTAFinal` y `StickyCTA` en client components que lean `getUTMs()` del localStorage:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { getUTMs } from '@/lib/tracking';
import { buildCheckoutUrl } from '@/lib/parse-resultados';

export function CTAFinal() {
  const [url, setUrl] = useState<string>('#');
  useEffect(() => {
    setUrl(buildCheckoutUrl(getUTMs()));
  }, []);
  return <a href={url}>...</a>;
}
```

#### Verificar UTMs que importa preservar

- `utm_source` (facebook, instagram, etc.)
- `utm_medium`
- `utm_campaign`
- `utm_content` (CRÍTICO — identifica el creativo específico)
- `utm_term`
- `fbclid` (Facebook click id, Hotmart puede usarlo)

---

## Acceptance criteria

- [ ] En DevTools, después de visitar la landing con `?utm_source=fb&utm_content=ugly-ad-1`, ver en localStorage `anti-hinchazon-utms` con esos valores.
- [ ] El href del botón "Quiero mi protocolo" en `/resultados` incluye `utm_source=fb&utm_content=ugly-ad-1`.
- [ ] En CAPI Events Manager (Test Events), eventos QuizProgress y Lead muestran `fbc` y `fbp` populated.
- [ ] El test mode (sin Pixel ID configurado) sigue funcionando sin errores.
- [ ] Build TypeScript pasa sin warnings.

---

## Dependencies

Ninguna directa. Pero idealmente correr DESPUÉS o en paralelo del 13 (los eventos van a tener variantes ahí también).

---

## Human inputs needed

Ninguno para el código.

**Para validar end-to-end (después del deploy):**
- Visitar la landing con un UTM de prueba.
- Llegar a /resultados.
- Inspeccionar el `<a href>` del CTA: debe contener tu UTM.
- Hacer click y ver si Hotmart muestra ese UTM en el checkout (a veces lo muestra en la URL).
- Comprar (test): en Hotmart > Reportes, debería atribuir esa venta al `utm_content` correspondiente.

---

## Notes

- Sin Fix 1, el Pixel client + CAPI server pueden duplicar eventos sin dedupear → métricas infladas en Events Manager.
- Sin Fix 2, escalás creativos a ciegas — no podés decidir cuál matar.
- Estos dos fixes son los más altos en ratio impacto/esfuerzo de toda la fase 2.
