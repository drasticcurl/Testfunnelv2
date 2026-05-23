# Prompts individuales para cada agente

> Copiá y pegá uno por chat. Cada prompt es autosuficiente — no requiere haber leído otros docs antes.

**Importante:** algunos agentes tocan archivos compartidos. Si vas a correrlos en chats separados (no agrupados como sugería el workflow), respetá las dependencias y NO corras simultáneamente los que comparten archivos:

| Pisan los mismos archivos | Hacelo en SERIE |
|---|---|
| 22 y 23 | `PrecioStack.tsx`, `CTAFinal.tsx`, `FAQ.tsx` |
| 19 y 21 | `QuizContainer.tsx`, `quiz-data.ts` |

---

## Reglas globales (incluidas en cada prompt)

```
- Voseo argentino neutralizado en todo el copy nuevo (podés, notás, te llevás).
- TypeScript strict, mobile-first (375-414px primary).
- Tailwind con tokens existentes del proyecto (sage, cream, charcoal, coral).
- NO toques archivos fuera de "Archivos owned" del doc.
- NO inventes datos: si necesitás algo que no está en el doc, preguntámelo.
- El test mode (sin Supabase / sin Pixel ID) debe seguir funcionando.
- Build de TypeScript debe pasar al final (`npm run build`).
```

---

## Agente 13 — A/B Testing Infrastructure

**Prerrequisitos:** ninguno.
**Bloquea a:** 14, 19, 20.

```
Sos el AGENTE 13: A/B Testing Infrastructure.

Tu tarea está en `docs/13-AB-TESTING-INFRA.md`. Leelo entero. Es FOUNDATIONAL —
después corren 14, 19 y 20 que dependen de vos.

Construí un sistema de A/B testing basado en cookies que:
1. Asigne variantes determinísticamente con hash SHA256 (no random) en middleware
2. Persista 90 días en cookies `ab_<expId>`
3. Exponga `getVariant()` (server) y `useVariant()` (client)
4. Inyecte automáticamente las variantes en custom_data.experiments del CAPI

Reglas globales:
- Voseo argentino neutralizado.
- TypeScript strict, mobile-first.
- NO toques archivos fuera de "Archivos owned" del doc.
- El test mode debe seguir funcionando sin variables.

Antes de arrancar, leé también `AGENTS.md` para entender la arquitectura.

Cuando termines, listame:
1. Archivos creados/modificados
2. Cómo verificar que las cookies se setean (instrucciones manuales)
3. Inputs humanos pendientes (si hay)
```

---

## Agente 14 — Drop-off Dashboard

**Prerrequisitos:** Agente 13 mergeado.
**Bloquea a:** nadie.

```
Sos el AGENTE 14: Quiz Drop-off Dashboard.

Tu tarea está en `docs/14-DROPOFF-DASHBOARD.md`. Leelo entero.

Construí un panel `/admin/funnel` protegido por password que muestra el embudo
del quiz slide por slide, filtrable por experimento + variante.

VERIFICÁ PRIMERO que el agente 13 ya está mergeado (deben existir
`lib/ab/index.ts` y `middleware.ts`). Si no, frená y avisame.

Para el storage, usá la opción "memoria" (in-memory) del doc. Si querés proponer
KV o Supabase, avisame primero antes de implementar.

Reglas globales:
- Voseo argentino neutralizado.
- TypeScript strict, mobile-first.
- Auth simple por cookie.
- NO toques archivos fuera de "Archivos owned".

Cuando termines:
1. Listame archivos modificados
2. Decime el password default que usaste (env var ADMIN_PASSWORD)
3. Pasos manuales para acceder al dashboard
```

---

## Agente 15 — Tracking Fixes

**Prerrequisitos:** ninguno.
**Bloquea a:** nadie.

```
Sos el AGENTE 15: Tracking Fixes (fbc/fbp + UTMs al checkout).

Tu tarea está en `docs/15-TRACKING-FIXES.md`. Leelo entero.

Dos fixes críticos antes de producción:
1. Capturar y forwardear cookies _fbc/_fbp a TODOS los eventos CAPI
2. Pasar los UTMs reales (capturados en localStorage de la landing) al URL de
   checkout de Hotmart, sobreescribiendo los estáticos

Reglas:
- NO romper el tracking actual, solo extenderlo
- Test mode (sin META_PIXEL_ID) debe seguir funcionando sin warnings
- TypeScript strict, voseo

Cuando termines:
1. Listame archivos modificados
2. Pasos manuales para verificar end-to-end:
   - Visitar landing con UTMs de prueba
   - Inspeccionar href del CTA en /resultados
   - Ver fbc/fbp en Events Manager
```

---

## Agente 16 — Métricas Update (doc only)

**Prerrequisitos:** ninguno.
**Bloquea a:** nadie (pero idealmente correr antes de 17 para coherencia).

```
Sos el AGENTE 16: actualizar `docs/_METRICAS.md`.

Tu tarea está en `docs/16-METRICAS-UPDATE.md`. Leelo entero. Es solo
documentación, NO toques código.

Llená el doc con números concretos para Argentina low-ticket en 2026:
- Benchmarks de ads (CPM, CPC, CTR, ROAS) en USD
- Benchmarks del quiz (% de cada paso)
- Reglas de kill/scale
- Presupuestos
- Estructura "Sistema Solar"

Importante:
- Operamos en USD (Hotmart factura en USD aunque Meta cobre en ARS).
- Sé específico con números, no "alto" o "bajo".
- Voseo argentino.
- Mejor pecar de conservador en mínimos.

Cuando termines, mostrame el doc completo.
```

---

## Agente 17 — Playbook Ads Apto Tontos (doc only)

**Prerrequisitos:** ideal correr después del 16.
**Bloquea a:** nadie.

```
Sos el AGENTE 17: crear `docs/PLAYBOOK-ADS.md`.

Tu tarea está en `docs/17-PLAYBOOK-ADS.md`. Leelo entero. Es solo doc, NO
toques código.

Crea el manual de operaciones de ads MÁS SIMPLE POSIBLE. Mi vieja debe poder
leerlo y entender qué hacer cada día.

Reglas estrictas:
- Glosario en UNA línea por término
- Cada regla con número concreto, no "depende"
- Mínimo un dibujo ASCII (Sistema Solar)
- Checklist diario de 5 minutos al final
- NO usar la palabra "algoritmo" más de 2 veces
- 5-10 páginas máximo, no 50

Voseo argentino, presupuestos en USD.

Si ya existe `docs/_METRICAS.md` actualizado, leelo primero para no
contradecir números.

Cuando termines, mostrame el doc completo.
```

---

## Agente 18 — Steering File Extensivo

**Prerrequisitos:** TODOS los demás agentes mergeados.
**Bloquea a:** nadie. Es el último.

```
Sos el AGENTE 18: crear `.kiro/steering/funnel-playbook.md`.

Tu tarea está en `docs/18-STEERING-FUNNEL.md`. Leelo entero.

Crea un steering file MUY extenso (800-1500 líneas) que sea el cerebro
estilístico del proyecto. Cualquier IA debe poder leerlo y generar copy
perfectamente alineado.

ANTES DE EMPEZAR, leé TODO el repo:
- AGENTS.md
- README.md
- Todos los docs en docs/ (especialmente _METRICAS.md y PLAYBOOK-ADS.md ya
  actualizados por agentes 16 y 17)
- app/page.tsx, app/quiz/, app/resultados/

Tu doc no puede contradecir nada existente. Si encontrás contradicciones
entre docs anteriores, listámelas al final SIN resolverlas.

Estructura: 14 secciones del doc instructivo. Mínimo 800 líneas.

Frontmatter Kiro:
---
inclusion: manual
---

Reglas:
- Voseo argentino en TODOS los ejemplos de copy
- Lista de "Errores Prohibidos" mínimo 15 items
- Sección "Casos Edge" mínimo 10 items
- Decisiones estilísticas vinculantes (paleta hex exacta, tipografías)

Cuando termines, mostrame el índice del doc + el conteo final de líneas.
```

---

## Agente 19 — Quiz Slim Variant + A/B

**Prerrequisitos:** Agente 13 mergeado.
**Conflicto:** comparte archivos con Agente 21. Hacelo PRIMERO o en serie.

```
Sos el AGENTE 19: Quiz Slim Variant + A/B.

Tu tarea está en `docs/19-QUIZ-SLIM-AB.md`. Leelo entero.

Reducí el quiz de 16 → 13 slides en una variante "slim", eliminando 2 de las
3 yes-streets (`si_natural` y `si_plan_simple`). Mantené `si_ver_plan` que
es la transición al email.

VERIFICÁ que existe `lib/ab/use-variant.ts` (Agente 13). Si no, frená.

Reglas:
- El quiz cold (control) debe seguir funcionando IDÉNTICO a antes
- TypeScript strict, voseo
- `calcularSeveridad` y `calcularTipo` deben tolerar las respuestas faltantes

Cuando termines:
1. Listame archivos modificados
2. Cómo testear ambas variantes manualmente (instrucciones de cookies)
3. Confirmá que `npm run build` pasa
```

---

## Agente 20 — Landing Noticia Variant + A/B

**Prerrequisitos:** Agente 13 mergeado.
**Bloquea a:** nadie.

```
Sos el AGENTE 20: Landing Noticia Variant + A/B.

Tu tarea está en `docs/20-LANDING-NOTICIA-AB.md`. Leelo entero.

Construí una landing alternativa estilo portal de noticias "Mujer Hoy":
- Header tipo portal (logo + secciones)
- Headline editorial (basado en testimonio existente de Carolina)
- Imagen hero IA (placeholder por ahora, yo la subo después)
- 3-4 párrafos editoriales
- CTA al test (NO arriba de todo, dentro del artículo)
- Estilo serif, paleta editorial blanco/negro/rojo (NO sage/cream del producto)

VERIFICÁ que existe `lib/ab/use-variant.ts`. Si no, frená.

Reglas:
- Si parece landing de producto, fracasaste. Tiene que parecer artículo.
- Disclaimer chico al final
- Mobile-first 375px
- Voseo argentino

La imagen hero generala con placeholder en `public/images/landing-noticia/hero.jpg`
(podés usar un .gitkeep o un placeholder de Unsplash mientras tanto).

Cuando termines:
1. Listame archivos creados
2. Confirmá el prompt de IA exacto que recomendás para la imagen
3. Cómo testear ambas variantes con cookies
```

---

## Agente 21 — Quiz Prefill desde URL

**Prerrequisitos:** Agente 13 mergeado, Agente 19 mergeado (ideal).
**Conflicto:** comparte archivos con Agente 19.

```
Sos el AGENTE 21: Quiz Prefill desde URL del ad.

Tu tarea está en `docs/21-QUIZ-PREFILL.md`. Leelo entero.

Permití que ads lleven al quiz con respuestas pre-llenadas vía query params.
Ej: `/quiz?momento=tarde_noche` arranca en la pregunta 4.

VERIFICÁ que el agente 19 ya está mergeado (debe existir `slidesSlim` en
`lib/quiz-data.ts`). El prefill debe funcionar tanto en variante control como slim.

Solo permití prefill secuencial desde el inicio:
- `edad`, `momento`, `tiempo` (en ese orden)
- Respuestas multi (sintomas, ya_probo) NO se pre-llenan

Validación: si un valor no es válido, ignorar ese param y los siguientes.

Reglas:
- Quiz cold sin params debe seguir funcionando IDÉNTICO
- Tracking de evento `QuizStartPrefilled` con keys prefilled
- Progress bar refleja progreso real

Cuando termines:
1. Listame archivos modificados
2. URLs canónicas para ads (al menos 4, una por valor de momento)
3. Confirmá que ambos quiz cold y slim siguen funcionando
```

---

## Agente 22 — Cambio de Precio $14.90

**Prerrequisitos:** ninguno.
**Conflicto:** comparte archivos con Agente 23. Hacelo PRIMERO o en serie.

```
Sos el AGENTE 22: cambio de precio $9.90 → $14.90.

Tu tarea está en `docs/22-PRECIO-1490.md`. Leelo entero.

Reemplazá TODAS las referencias a $9.90 por $14.90 en código y docs.
Ajustá el precio tachado de $29.90 → $39.90.
Recalculá el AOV estimado en README.md.

CUIDADO con dos cosas:
1. NO toques referencias al "Plan de 7 días" (es duración, no precio)
2. NO toques el upsell de $14.90 (ese ya está y queda igual)

Empezá con un grep global:
`grep -rn "9\.90\|9,90\|29\.90\|29,90" --include="*.ts" --include="*.tsx" --include="*.md"`

Reglas:
- Voseo argentino
- TS strict
- Build debe pasar

Cuando termines:
1. Listame archivos modificados
2. Pasos detallados para actualizar Hotmart (los del doc)
3. Coordinación con ads (cuándo pausar/reactivar)
```

---

## Agente 23 — Garantía 30 Días

**Prerrequisitos:** ninguno.
**Conflicto:** comparte archivos con Agente 22. Hacelo DESPUÉS o en serie.

```
Sos el AGENTE 23: cambio de garantía a 30 días.

Tu tarea está en `docs/23-GARANTIA-30D.md`. Leelo entero.

Subí la garantía actual (probablemente 7 o 15 días) a 30 días en todo
el copy + docs canónicos.

CUIDADO con dos conceptos diferentes que se confunden:
- ✅ "Garantía 7 días" → cambiar a 30 días
- ❌ "Plan de 7 días" → NO TOCAR (es duración del producto)
- ❌ "Programa 30 días" del upsell → NO TOCAR (es duración del upsell)

Buscá las palabras: garantía, devolución, reembolso, "días" y revisá cada match.

Reescribí el componente Garantia.tsx con énfasis en "0 riesgo". Si no existe
una pregunta sobre devoluciones en el FAQ, agregala.

Reglas:
- Voseo argentino
- Email de soporte: dejá un placeholder `soporte@anti-hinchazon.com` (yo lo
  reemplazo después por el real)

Cuando termines:
1. Listame archivos modificados
2. Pasos detallados para configurar Hotmart en 30 días (front + bump + upsell)
3. Confirmá que tengo que tener un email operativo de soporte
```

---

## Agente 24 — PWA Enhancements (Onboarding + Push)

**Prerrequisitos:** ninguno.
**Bloquea a:** nadie.

```
Sos el AGENTE 24: PWA Enhancements (Onboarding mejorado + Push Día 1).

Tu tarea está en `docs/24-PWA-ENHANCEMENTS.md`. Leelo entero. Tiene DOS
features:

A) Onboarding mejorado:
- Hoy tiene 3 pasos. Agregale un paso 4 (tip personalizado según tipo de
  hinchazón) y un paso 5 (opt-in de notificaciones).
- Crear `lib/pwa/personalized-tips.ts` con un tip por tipo (1-4).

B) Push Notification Día 1:
- Service worker maneja eventos push.
- Endpoint para subscribirse y otro para enviar (admin).
- Trigger día 1: usá la "Opción B - On-visit" del doc para MVP.

Reglas:
- Test mode (sin Supabase) DEBE seguir funcionando con localStorage.
- iOS Safari < 16.4 no soporta push: dejá fallback gracioso.
- Si rechazan permisos una vez, no preguntar de nuevo (cookie/localStorage flag).
- Voseo argentino.
- TS strict.

Necesitás generar VAPID keys. NO inventes valores. Pediles a mí (humano):
1. `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
2. `VAPID_PRIVATE_KEY`
3. `VAPID_SUBJECT`
4. `SCHEDULER_SECRET`

Y la dependencia `web-push`:
`npm install web-push && npm install --save-dev @types/web-push`

Cuando termines:
1. Listame archivos creados/modificados
2. Confirmá comandos de generación de VAPID
3. Pasos para testear el push localmente
```

---

## Cómo gestionar dependencias entre agentes

Si vas chat por chat (uno a la vez), seguí este orden seguro:

```
1. Agente 16 (doc, sin deps)
2. Agente 17 (doc, idealmente después de 16)
3. Agente 13 (foundational)
4. Agente 15 (tracking, independiente)
5. Agente 14 (necesita 13)
6. Agente 22 (precio)
7. Agente 23 (garantía, después de 22)
8. Agente 19 (quiz slim, necesita 13)
9. Agente 21 (prefill, después de 19)
10. Agente 20 (landing noticia, necesita 13)
11. Agente 24 (PWA enhancements, independiente — podés hacerlo en cualquier momento)
12. Agente 18 (steering, ÚLTIMO de todos)
```

Si tenés tiempo y querés paralelizar, ver `_WORKFLOW.md`.
