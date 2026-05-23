# Agente 24 — PWA Enhancements: Onboarding + Push Día 1

> Mejora la PWA con dos features post-compra: (1) onboarding más impactante con tip personalizado, (2) push notification al día siguiente recordando empezar el Día 1.

Son dos features pequeñas pero distintas. Las hacemos juntas porque tocan el mismo módulo PWA.

---

## Goal

### Feature A — Mejorar Onboarding (#19)

Hoy el onboarding es un wizard de 3 pasos. Agregar un cuarto paso con un **tip personalizado** según las respuestas del onboarding (o del quiz original guardado), y un quinto paso opcional para activar notificaciones push.

### Feature B — Push Notification Día 1 (#20)

Al día siguiente de la compra (24-30 hs), enviar push a los usuarios que dieron permiso, recordándoles empezar el Día 1 del plan.

---

## Archivos owned

### Feature A
| Archivo | Acción |
|---|---|
| `app/pwa/onboarding/page.tsx` | MODIFY — sumar paso 4 (tip) y paso 5 (push opt-in) |
| `lib/pwa/personalized-tips.ts` | NEW — diccionario de tips por tipo de hinchazón |

### Feature B
| Archivo | Acción |
|---|---|
| `public/pwa-sw.js` | MODIFY — handler de push events |
| `app/pwa/PwaServiceWorker.tsx` | MODIFY — solicitar permiso + suscribir |
| `app/api/pwa/push/subscribe/route.ts` | NEW — guardar subscription |
| `app/api/pwa/push/send/route.ts` | NEW — enviar manual (test + cron-style) |
| `lib/pwa/push.ts` | NEW — helpers VAPID + send |

---

## Archivos read-only

- `lib/pwa/test-mode.ts` — debe seguir funcionando offline
- `lib/pwa/access.ts`

---

## Implementation outline

### Feature A — Onboarding mejorado

#### Paso 4: Tip personalizado

Después de los 3 pasos actuales del onboarding, agregar un step que muestra:

```tsx
<div>
  <h2>{nombre}, este es tu primer tip personalizado</h2>
  <p>Basado en tu tipo {tipo}: <strong>{tipText}</strong></p>
  <div className="tip-card">
    <span>{tip.icon}</span>
    <h3>{tip.title}</h3>
    <p>{tip.body}</p>
  </div>
  <button>Entendido, empecemos</button>
</div>
```

Tips ejemplo (uno por tipo de hinchazón):

```ts
// lib/pwa/personalized-tips.ts
export const FIRST_TIPS: Record<TipoHinchazon, Tip> = {
  1: {
    icon: '🌅',
    title: 'Empezá con agua tibia y limón',
    body: 'Apenas te despertás, antes de cualquier otra cosa. Tu intestino está deshidratado de la noche y necesita el "empujón" de líquido cálido para arrancar.',
  },
  2: {
    icon: '🍽️',
    title: 'Mastica 20 veces cada bocado',
    body: 'La digestión empieza en la boca. Si no masticás bien, tu estómago tiene que trabajar el doble y se inflama después del almuerzo.',
  },
  3: {
    icon: '🌙',
    title: 'Cena 3 horas antes de dormir',
    body: 'Tu hinchazón vespertina es probable que venga de comer cerca de la cama. Mover la cena 1-2 horas antes ya hace una diferencia visible al día 3.',
  },
  4: {
    icon: '⏰',
    title: 'Comé en ventana de 10 horas',
    body: 'Tu intestino necesita reposo. Si tu primera comida es a las 9 AM, la última debe ser antes de las 19 PM. Eso solo ya baja la inflamación general en una semana.',
  },
};
```

#### Paso 5: Activar notificaciones (opt-in)

```tsx
<div>
  <h2>Una última cosa…</h2>
  <p>¿Querés que te recordemos por qué empezar mañana?</p>
  <button onClick={enableNotifications}>Sí, recordame</button>
  <button onClick={skip}>Ahora no</button>
</div>
```

`enableNotifications`:
- Pedir permiso al navegador.
- Si lo da, suscribir al push service.
- POST a `/api/pwa/push/subscribe` con la subscription.
- Marcar en localStorage `pwa_push_optin = true`.

### Feature B — Push Notification Día 1

#### Service worker (`pwa-sw.js`)

```js
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Anti-Hinchazón';
  const options = {
    body: data.body || 'Tu Día 1 te espera 🌿',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { url: data.url || '/pwa/plan/1' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

#### Subscribe (`/api/pwa/push/subscribe`)

```ts
// POST { subscription: PushSubscription, email?: string }
// Guarda en Supabase tabla `pwa_push_subs` o en KV
// En test mode: solo localStorage (no llega al backend)
```

#### Send (`/api/pwa/push/send`)

```ts
// POST { email?: string, title, body, url }
// Auth: ADMIN_PASSWORD o env var SCHEDULER_SECRET
// Lee subscriptions desde DB, manda con web-push library
import webpush from 'web-push';
webpush.setVapidDetails(...);
await Promise.all(subs.map(s => webpush.sendNotification(s, JSON.stringify(payload))));
```

#### Trigger del Día 1

Dos opciones:

**Opción A — Cron (recomendado prod):**
- Vercel Cron en `vercel.json`: cada hora hace GET a `/api/pwa/push/send-day1`.
- Endpoint busca compras del día anterior (entre 24h y 25h atrás), filtra por opt-in, manda push.

**Opción B — On-visit (simple MVP):**
- Cuando el usuario entra a la PWA, si pasaron > 24h desde su compra Y tiene opt-in Y nunca recibió el push del día 1 → mandar.
- Funciona sin cron, pero solo se dispara si el user vuelve.

Para MVP: implementar Opción B. Documentar que la A es lo recomendado para prod.

---

## Acceptance criteria

### Feature A
- [ ] Onboarding tiene 5 pasos en lugar de 3.
- [ ] Paso 4 muestra el tip correcto según el tipo de hinchazón del usuario.
- [ ] Paso 5 pide permiso de notificaciones; si se rechaza, marca skip.
- [ ] Si el usuario ya completó onboarding antes, los pasos 4-5 no se vuelven a mostrar.

### Feature B
- [ ] En Chrome móvil/desktop, dar permiso → recibe una notificación de prueba.
- [ ] Endpoint `/api/pwa/push/send` con auth puede mandar a un email específico.
- [ ] Click en la notificación abre `/pwa/plan/1`.
- [ ] En test mode (sin backend), funciona localmente con localStorage.

---

## Dependencies

Ninguna estricta. Coexiste tranqui con todos los demás agentes.

---

## Human inputs needed

### Generar VAPID keys

```bash
npx web-push generate-vapid-keys --json
```

Output:
```json
{
  "publicKey": "BFt...",
  "privateKey": "abc..."
}
```

### Env vars a setear

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFt...      # cliente lo usa para subscribirse
VAPID_PRIVATE_KEY=abc...                  # server lo usa para firmar
VAPID_SUBJECT=mailto:soporte@tu-dominio.com
SCHEDULER_SECRET=algun-string-fuerte      # protege /api/pwa/push/send
```

### Instalar dependencia

```bash
npm install web-push
npm install --save-dev @types/web-push
```

### (Opcional) Vercel Cron

Si elegís Opción A (recomendada prod), agregar a `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/pwa/push/send-day1", "schedule": "0 9 * * *" }
  ]
}
```

(Cron diario a las 9 AM UTC. Ajustar según tu zona horaria.)

---

## Notes

- iOS Safari soporta push notifications PWA solo desde iOS 16.4+ (mar/2023). En versiones anteriores, esto no funciona. Documentar fallback (email follow-up).
- En desktop Chrome funciona perfecto.
- Si el usuario rechaza permisos una vez, NO insistir cada vez. Marcar `pwa_push_dismissed = true` y dejar de preguntar.
