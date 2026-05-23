# Agente 13 — A/B Testing Infrastructure

> **Foundational. Bloquea a los Agentes 14, 19, 20.** Construye la infra base que todos los A/B tests del proyecto van a usar.

---

## Goal

Construir un sistema de A/B testing **deterministico, basado en cookies, server-friendly** que permita:

1. Definir experimentos en código (registry)
2. Asignar usuarios a variantes en su primer visit (middleware)
3. Persistir la variante por 90 días (cookie)
4. Leer la variante en server components y client components
5. Inyectar la variante en TODOS los eventos de tracking automáticamente

---

## Archivos owned (los crea/modifica este agente, exclusivos)

| Archivo | Acción | Qué tiene |
|---|---|---|
| `lib/ab/experiments.ts` | NEW | Registry con definiciones de experimentos |
| `lib/ab/index.ts` | NEW | Helpers públicos: `getVariant`, `getAllVariants`, hash determinista |
| `lib/ab/use-variant.ts` | NEW | Client hook `useVariant(expId)` |
| `middleware.ts` | NEW | Asigna cookies de variante en primer visit |
| `app/api/track/route.ts` | MODIFY | Auto-inyectar todas las cookies `ab_*` en `custom_data.experiments` |

---

## Archivos read-only (referencias)

- `lib/tracking.ts` — entender el shape de `CapiCustomData`

---

## Implementation outline

### 1. Registry (`lib/ab/experiments.ts`)

```ts
export type Experiment = {
  id: string;
  variants: { id: string; weight: number }[];
  enabled: boolean;
};

export const experiments: Experiment[] = [
  {
    id: 'exp_quiz_length',
    enabled: true,
    variants: [
      { id: 'control', weight: 50 },   // 16 slides
      { id: 'slim', weight: 50 },      // 13 slides
    ],
  },
  {
    id: 'exp_landing_format',
    enabled: true,
    variants: [
      { id: 'control', weight: 50 },   // landing actual
      { id: 'noticia', weight: 50 },   // landing tipo Mujer Hoy
    ],
  },
];
```

### 2. Cookie naming + asignación

- Cookie name: `ab_<experimentId>`. Ej: `ab_exp_quiz_length`
- Valor: el `id` de la variante. Ej: `slim`
- Max-Age: 90 días (`60*60*24*90`)
- Path: `/`
- SameSite: `Lax`

### 3. Asignación determinista (no random)

Para que un mismo usuario siempre caiga en la misma variante, incluso si limpia cookies:
- Generar un `userId` UUID v4 si no tiene cookie `ab_uid`. Persistirlo 1 año.
- Para cada experimento sin cookie asignada: `hash(userId + expId) % 100` y mapear a variante según pesos.

```ts
import crypto from 'crypto';

function hashToBucket(userId: string, expId: string): number {
  const h = crypto.createHash('sha256').update(userId + ':' + expId).digest();
  return h.readUInt32BE(0) % 100;
}
```

### 4. Middleware (`middleware.ts`)

Al ser el primer punto de contacto en el request, asigna cookies si faltan:

```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/track).*)'],
};
```

(Nota: excluimos `/api/track` para no asignar variantes en hits server-to-server.)

### 5. Helpers públicos

- `getVariant(cookies: ReadonlyRequestCookies, expId: string): string | null`
  - Lee la cookie `ab_<expId>` y retorna el variant id, o `null` si no existe.
- `getAllVariants(cookies): Record<string, string>`
  - Retorna `{ exp_quiz_length: 'slim', exp_landing_format: 'control' }`

### 6. Client hook (`lib/ab/use-variant.ts`)

```ts
export function useVariant(expId: string): string | null {
  const [v, setV] = useState<string | null>(null);
  useEffect(() => {
    const m = document.cookie.match(new RegExp('ab_' + expId + '=([^;]+)'));
    setV(m ? decodeURIComponent(m[1]) : null);
  }, [expId]);
  return v;
}
```

### 7. Auto-tag de eventos (`/api/track`)

En el handler de POST, antes de armar `customData`:

```ts
import { cookies } from 'next/headers';
const allCookies = req.cookies.getAll();
const experiments = Object.fromEntries(
  allCookies
    .filter(c => c.name.startsWith('ab_') && c.name !== 'ab_uid')
    .map(c => [c.name.replace('ab_', ''), c.value])
);
if (Object.keys(experiments).length > 0) {
  customData.experiments = experiments;
}
```

(Nota: Meta CAPI acepta `custom_data` arbitrario. Esto permite filtrar eventos en Events Manager por experimento.)

---

## Acceptance criteria

- [ ] Visitando la landing por primera vez, en DevTools veo cookies `ab_exp_quiz_length` y `ab_exp_landing_format` con valores válidos.
- [ ] Recargar la página NO cambia la variante asignada.
- [ ] Llamar `/api/track` desde un POST de prueba (con esas cookies) muestra en logs que el evento incluye `experiments: { exp_quiz_length: '...', exp_landing_format: '...' }`.
- [ ] El TypeScript compila en strict mode.
- [ ] El middleware no rompe rutas estáticas ni `/api/track`.
- [ ] Función `useVariant('exp_quiz_length')` en un client component retorna el valor correcto.

---

## Dependencies

Ninguna. Es la base.

---

## Human inputs needed

Ninguno. Todo es código.

---

## Notes

- El bucketing usa SHA256 truncado, no random. Esto es importante porque permite re-asignar variantes consistentemente si en el futuro re-balanceás pesos.
- Si en el futuro querés tracking server-to-server (eventos disparados desde webhooks), el helper `getVariantsFromUserId(userId)` te lo permite sin depender del request.
