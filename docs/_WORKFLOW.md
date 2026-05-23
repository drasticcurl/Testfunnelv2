# Workflow de implementación — Fase 2

> Cómo ejecutar los 12 agentes nuevos (13-24) sin pisarse, en cuántos chats y en qué orden.

---

## TL;DR

- **3 olas de ejecución**.
- Total **~12 agentes**, ejecutables en **5-7 chats** en paralelo (algunos chats agrupan 2 agentes).
- **Tiempo estimado:** 1 día si paralelizás bien, 3-4 días si vas serie.

---

## Mapa visual de las 3 olas

```
OLA 1 (paralelizable, sin deps)
├── Agente 13 — A/B Testing Infrastructure         🔴 BLOQUEA OLA 2 (parte)
├── Agente 15 — Tracking Fixes (fbc/fbp + UTMs)
├── Agente 16 — Métricas Update (doc)
├── Agente 17 — Playbook Ads Apto Tontos (doc)
├── Agente 22 — Precio $14.90 + Hotmart
├── Agente 23 — Garantía 30 días + Hotmart
└── Agente 24 — PWA Enhancements (Onboarding + Push)
        ↓
        ↓
OLA 2 (necesita 13 listo)
├── Agente 14 — Drop-off Dashboard
├── Agente 19 — Quiz Slim Variant + A/B
├── Agente 20 — Landing Noticia Variant + A/B
└── Agente 21 — Quiz Prefill + URLs para Ads
        ↓
        ↓
OLA 3 (idealmente al final, lee todo)
└── Agente 18 — Steering File Extensivo (.kiro)
```

---

## Cómo distribuir los chats

Recomiendo abrir **5 chats** en paralelo para Ola 1, después **3 chats** para Ola 2, y **1 chat final** para Ola 3.

| Chat | Agentes | Notas |
|---|---|---|
| Chat A | 13 | El más crítico; completalo PRIMERO. |
| Chat B | 15 | Tracking. Puede correr en simultáneo con A. |
| Chat C | 22 + 23 | Precio + Garantía juntos (tocan archivos parecidos, mejor un solo chat). |
| Chat D | 16 + 17 | Solo docs, fácil. |
| Chat E | 24 | PWA enhancements. |
| Chat F | 14 | Después de A. |
| Chat G | 19 + 21 | Quiz Slim + Prefill (ambos tocan QuizContainer; mejor un chat). |
| Chat H | 20 | Landing Noticia variant. |
| Chat I | 18 | Al final, cuando todo lo demás esté listo. |

Total: **9 chats**. Si tu IA aguanta multitasking, podés agruparlos más, pero el contexto por chat se vuelve denso.

---

## Orden de ejecución recomendado

### Día 1 mañana — abrir 5 chats simultáneos

1. Chat A → Agente 13
2. Chat B → Agente 15
3. Chat C → Agentes 22 + 23
4. Chat D → Agentes 16 + 17
5. Chat E → Agente 24

Cuando todos terminen y estés conforme, mergear sus PRs / commits.

### Día 1 tarde — abrir 3 chats simultáneos

6. Chat F → Agente 14
7. Chat G → Agentes 19 + 21
8. Chat H → Agente 20

Cuando todos terminen, mergear.

### Día 2 — un chat final

9. Chat I → Agente 18

Este lee TODO el repo final, así que necesita los anteriores ya mergeados.

---

## Prompts para cada chat

Para cada chat, mandá EXACTAMENTE este template, reemplazando `[NN]` por el número del agente y `[TITULO]` por el título.

### Template universal

```
Sos el AGENTE [NN]: [TITULO].

Tu instrucción detallada está en el archivo `docs/[NN]-[NOMBRE].md` del repo.
Leelo ENTERO antes de tocar nada.

Reglas globales del proyecto:
- Leé también AGENTS.md (en raíz) para entender la arquitectura general.
- Voseo argentino neutralizado en todo el copy nuevo.
- TypeScript strict, mobile-first, Tailwind tokens existentes.
- NO toques archivos fuera de los que tu doc te asigna como "Archivos owned".
- Si necesitás un dato que no está en tu doc → preguntámelo, NO inventes.

Cuando termines:
1. Listame los archivos que creaste / modificaste.
2. Listame los archivos a los que les hiciste read-only para tomar decisiones.
3. Decime qué inputs humanos quedan pendientes (si hay).
4. Si vas a romper compatibilidad con algo, alertámelo PRIMERO antes de hacerlo.

Confirmá que leíste el doc y arrancá.
```

### Variante para chats con 2 agentes

```
Sos los AGENTES [NN1] y [NN2].

Vas a ejecutar dos tareas relacionadas en este chat:
- Agente [NN1]: instrucciones en `docs/[NN1]-[NOMBRE1].md`
- Agente [NN2]: instrucciones en `docs/[NN2]-[NOMBRE2].md`

Hacelo en este orden: [NN1] primero, completalo, después [NN2].

[Resto idéntico al template universal]
```

---

## Prompts específicos copiables

### Chat A → Agente 13

```
Sos el AGENTE 13: A/B Testing Infrastructure.

Tu instrucción detallada está en `docs/13-AB-TESTING-INFRA.md` del repo. Leelo
entero. Es FOUNDATIONAL — bloquea a 14, 19, 20.

Reglas: voseo, TS strict, mobile-first. NO toques archivos fuera de los
"Archivos owned" del doc.

Empezá leyendo el doc y AGENTS.md. Cuando termines, listame archivos y avisame
si necesitás algún input humano antes de mergear.
```

### Chat B → Agente 15

```
Sos el AGENTE 15: Tracking Fixes (fbc/fbp + UTMs al checkout).

Tu instrucción detallada está en `docs/15-TRACKING-FIXES.md`. Leelo entero.

Estos son fixes críticos antes de producción. NO romper el tracking actual,
solo extenderlo.

Reglas: voseo, TS strict. Verificá que el modo test (sin META_PIXEL_ID) sigue
sin romper.

Empezá leyendo el doc y avisame cuando termines.
```

### Chat C → Agentes 22 + 23

```
Sos los AGENTES 22 y 23.

- Agente 22: cambio de precio $9.90 → $14.90. Ver `docs/22-PRECIO-1490.md`
- Agente 23: garantía a 30 días. Ver `docs/23-GARANTIA-30D.md`

Hacelo en este orden: primero 22, después 23. Tocan algunos archivos similares
(PrecioStack.tsx, CTAFinal.tsx) — hacelo de a uno para evitar conflictos.

Reglas: voseo, TS strict. NO confundir el "plan de 7 días" (duración del
producto) con la "garantía de 7 días" (esa última es la que cambiamos).

Cuando termines los DOS, listame archivos modificados y los pasos manuales
para Hotmart.
```

### Chat D → Agentes 16 + 17

```
Sos los AGENTES 16 y 17 (solo docs, no toques código).

- Agente 16: actualizar `docs/_METRICAS.md`. Ver `docs/16-METRICAS-UPDATE.md`
- Agente 17: crear `docs/PLAYBOOK-ADS.md`. Ver `docs/17-PLAYBOOK-ADS.md`

Hacelo en orden 16 → 17 para que el playbook (17) sea coherente con las
métricas que decida 16.

Importante: el playbook debe ser APTO PARA TONTOS. Sin jerga. Si tu vieja no
puede leerlo y entenderlo, lo escribiste mal.

Cuando termines, mostrame ambos docs.
```

### Chat E → Agente 24

```
Sos el AGENTE 24: PWA Enhancements (Onboarding + Push Día 1).

Tu instrucción está en `docs/24-PWA-ENHANCEMENTS.md`. Tiene DOS features:
A) onboarding mejorado, B) push notification día 1.

Hacé las dos. Si una requiere VAPID keys o cambios en Hotmart, listame los
inputs humanos al final.

Reglas: voseo, TS strict. El test mode (sin Supabase) debe seguir
funcionando.
```

### Chat F → Agente 14

```
Sos el AGENTE 14: Quiz Drop-off Dashboard.

Tu instrucción está en `docs/14-DROPOFF-DASHBOARD.md`. Depende de que el
Agente 13 ya esté mergeado (verificá que existan `lib/ab/index.ts` y el
middleware).

Para el MVP, usá la opción de almacenamiento "memoria" del doc. Si querés
proponer otra (KV, Supabase), avisame primero.

Reglas: voseo, TS strict. Auth simple por password en cookie.
```

### Chat G → Agentes 19 + 21

```
Sos los AGENTES 19 y 21.

- Agente 19: Quiz Slim Variant + A/B. Ver `docs/19-QUIZ-SLIM-AB.md`
- Agente 21: Quiz Prefill desde URL del ad. Ver `docs/21-QUIZ-PREFILL.md`

Hacelo en orden 19 → 21. Ambos modifican `QuizContainer.tsx` y `quiz-data.ts`.

Verificá que el agente 13 ya está mergeado (debe existir `lib/ab/use-variant.ts`).

Reglas: el quiz cold (sin params, control de A/B) debe seguir funcionando
EXACTAMENTE igual que antes.

Al final, dame las URLs canónicas que el equipo de ads debe usar.
```

### Chat H → Agente 20

```
Sos el AGENTE 20: Landing Noticia Variant + A/B.

Tu instrucción está en `docs/20-LANDING-NOTICIA-AB.md`.

Verificá que el Agente 13 está mergeado.

La imagen hero la genero yo con IA. Vos creás el componente y dejás un
placeholder (`/images/landing-noticia/hero.jpg`) hasta que la suba.

Estilo: editorial portal de noticias, NO landing de producto. Si parece
landing de producto, fracasaste.

Reglas: voseo, mobile-first.
```

### Chat I → Agente 18

```
Sos el AGENTE 18: Steering File Extensivo.

Tu instrucción está en `docs/18-STEERING-FUNNEL.md`. Crea
`.kiro/steering/funnel-playbook.md` (entre 800 y 1500 líneas).

PRIMERO leé TODO el repo (en especial todos los docs nuevos creados por los
agentes 13-17 y 22-24). Tu doc no puede contradecir lo que ellos definieron.

Frontmatter: `inclusion: manual` (que se invoque solo cuando se necesite).

Si encontrás contradicciones entre docs anteriores, listámelas al final, NO
las resuelvas vos solo.
```

---

## Pre-flight checklist

Antes de abrir cualquier chat:

- [ ] El repo está sincronizado en `main` con todos los archivos doc creados.
- [ ] Tenés acceso a Vercel para deployar lo que vaya saliendo.
- [ ] Tenés cuenta de Hotmart con los productos creados (o sabés cómo pasos manuales).
- [ ] Generaste VAPID keys para push (Agente 24).
- [ ] Tenés decidido `ADMIN_PASSWORD` (Agente 14).

---

## Post-flight checklist

Después de mergear los 12 agentes:

- [ ] `npm run build` pasa sin errores.
- [ ] `npm run lint` pasa.
- [ ] Test manual del happy path: landing → quiz → resultados → click checkout.
- [ ] Test manual A/B: borrar cookies, refrescar varias veces, verificar que las cookies `ab_*` se asignan.
- [ ] Test manual del admin: visitar `/admin/funnel`, login con password, ver datos.
- [ ] Variables de entorno de producción actualizadas en Vercel:
  - `ADMIN_PASSWORD`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`
  - `SCHEDULER_SECRET`
  - (si elegís KV) credenciales del KV

---

## Cuando algo falla

| Síntoma | Causa probable | Fix |
|---|---|---|
| Cookie `ab_*` no se setea | Middleware no matchea esa ruta | Revisar `matcher` en `middleware.ts` |
| `useVariant` retorna `null` | Cookie no existe aún en client | Hacer fallback a server-side via `getVariant(cookies())` |
| Eventos de CAPI sin `experiments` | El track endpoint no lee cookies | Verificar `req.cookies.getAll()` filter |
| Deploy de Vercel rompe por TS strict | Algún `any` mal manejado | Mirar logs de build, no usar `any` |
| Quiz Slim no se muestra | Cookie es `control` por suerte | Forzar cookie en DevTools y refresh |
| Push no llega | Service worker no se registró | Hard reload (Cmd+Shift+R) en DevTools |

---

## Después del lanzamiento

Cuando ya tengas datos reales (1.000+ visitas):

1. Abrir `/admin/funnel`, comparar variantes.
2. Si hay un ganador claro (p < 0.05): apagar el experimento, settear la variante ganadora como default.
3. Iterar con un nuevo experimento (próximo hipótesis).

---

Listo. Con esto cualquier persona (humana o LLM) puede ejecutar la fase 2 del proyecto en orden.
