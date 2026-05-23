# Agente 14 — Quiz Drop-off Dashboard

> Construye un panel `/admin/funnel` protegido por password que muestra el embudo del quiz slide por slide, con filtro por variante de A/B test.

---

## Goal

Tener un dashboard server-side simple donde puedas ver:

- Cuántos usuarios entraron al quiz (slide 0)
- Qué % llegó a cada slide
- Qué % completó el email capture
- Qué % llegó a /resultados
- Qué % cliqueó el CTA al checkout
- **Filtrable por experimento + variante**

Sin esto, los A/B tests no tienen sentido — no podés comparar.

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `app/admin/layout.tsx` | NEW — auth gate por password |
| `app/admin/page.tsx` | NEW — landing del admin con links |
| `app/admin/funnel/page.tsx` | NEW — vista del embudo |
| `app/api/admin/funnel-data/route.ts` | NEW — devuelve datos agregados |
| `app/api/track/route.ts` | MODIFY — escribir cada evento a un store local además de a CAPI |
| `lib/admin/auth.ts` | NEW — helper de auth simple |
| `lib/admin/store.ts` | NEW — abstracción del store |

---

## Archivos read-only

- `lib/ab/index.ts` — para leer variantes
- `lib/quiz-data.ts` — para listar los slides

---

## Decisión técnica: dónde guardamos los eventos

Tres opciones, en orden de preferencia para tu MVP:

### Opción A — Vercel KV (recomendado MVP)
- Plan free de Vercel: 30k requests/día, 256MB. Suficiente para arrancar.
- Counter por evento+variante: `INCR funnel:exp_quiz_length:slim:slide:5`
- Pros: simple, atómico, no requiere migration SQL.
- Cons: hay que activar el addon en Vercel.

### Opción B — Supabase (si ya está conectado)
- Tabla `funnel_events` con: `event_name`, `slide_index`, `experiments` (jsonb), `created_at`.
- Cuando el usuario habilite Supabase prod, migra a esto automáticamente.

### Opción C — In-memory (SOLO desarrollo)
- `globalThis.__funnelStore = {}` — útil para testear local, se pierde al re-deploy.

**Implementación:** abstrae todo detrás de `lib/admin/store.ts` con interfaz `track(event, data)` y `getFunnel(filters)`. El backend concreto se decide por env vars.

---

## Implementation outline

### 1. Auth gate

```ts
// lib/admin/auth.ts
export function checkAdminAuth(req: Request): boolean {
  const pass = req.headers.get('x-admin-password');
  return pass === process.env.ADMIN_PASSWORD;
}
```

En `app/admin/layout.tsx`: leer cookie `admin_token`. Si falta o no coincide, redirigir a `/admin/login` (formulario simple que setea cookie con la password).

### 2. Store layer

```ts
// lib/admin/store.ts
export interface FunnelStore {
  track(event: string, props: Record<string, unknown>): Promise<void>;
  getFunnel(filters: { exp?: string; variant?: string }): Promise<FunnelData>;
}

export type FunnelData = {
  slides: { index: number; id: string; count: number; pct: number }[];
  totalStarts: number;
  totalCompletes: number;
  totalSales: number;
};
```

Implementaciones: `KvStore`, `SupabaseStore`, `MemoryStore`. Selector por env var.

### 3. Modificar `/api/track`

Después de mandar el evento a CAPI, escribir al store:

```ts
await store.track(eventName, {
  slide: body.custom?.slide,
  experiments,
  timestamp: Date.now(),
});
```

### 4. Endpoint `/api/admin/funnel-data`

```ts
GET /api/admin/funnel-data?exp=exp_quiz_length&variant=slim
→ { slides: [...], totalStarts, totalCompletes }
```

Auth requerido.

### 5. Vista del dashboard

UI simple con:
- Selector de experimento (dropdown)
- Comparativa de variantes lado a lado (gráfico de barras horizontales)
- Tabla con: slide id, count, % vs anterior, % vs start
- Botón "refresh"

Usar Recharts (ya está instalado).

---

## Acceptance criteria

- [ ] Visitando `/admin/funnel` sin password, soy redirigido a login.
- [ ] Con password correcta, veo el embudo con datos reales.
- [ ] Puedo filtrar por experimento + variante.
- [ ] Cada slide muestra count, % drop, % vs start.
- [ ] Datos se actualizan al hacer refresh.
- [ ] En modo memoria (sin KV ni Supabase), funciona localmente para testear.

---

## Dependencies

- **13** (A/B Testing Infra) — necesita las variantes en eventos.

---

## Human inputs needed

- env var `ADMIN_PASSWORD` (cualquier string fuerte)
- **Decisión:** ¿usás Vercel KV (gratis), Supabase, o solo memoria por ahora?
  - Recomendación: **memoria** para validar la UX, después migrar a KV en una semana cuando ya tengas tráfico.

---

## Notes

- Este agente NO implementa retención larga. Para eso, en producción real, los datos del store se borran cada 30 días (cron job aparte).
- Para calcular % de cierre venta, también necesita escuchar el webhook de Hotmart (que ya escribe en otro lado). Si está conectado, contarlo. Si no, omitir y mostrar "—".
