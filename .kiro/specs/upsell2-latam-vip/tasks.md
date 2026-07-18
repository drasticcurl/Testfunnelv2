# Implementation Plan: upsell2-latam-vip

## Overview

Plan de implementación incremental para el **segundo upsell del embudo LATAM** (Acceso VIP de por vida, Hotmart/USD) y su downsell, más la sección VIP de la PWA con candado por código estático. Lenguaje: **TypeScript / React (Next.js 14 App Router)** — el mismo del repo `testfunnel`. Tests: **Vitest + fast-check** (ya en `package.json`).

El plan arranca por la **configuración** (`lib/quiz-v2/config-latam.ts`) porque casi todo lo demás (componentes de oferta, candado VIP, tests de precio) depende de los valores que define. A partir de ahí, las dos librerías/componentes nuevos se construyen en paralelo y se "cablean" en sus páginas. Cada paso se integra con lo anterior: no hay código huérfano. Cierra con un checkpoint de verificación (typecheck + build + suite de tests) y la documentación de los pasos operativos manuales (Hotmart / Vercel).

Reusa patrones ya verificados del repo: `VslOfferBlockLatam` / `DownsellOfferLatam` (oferta + tracking), `withHotmartCheckout` / `getMetaCookies` (`lib/cookies.ts`), `POST /api/track` + `normalizeQuizVersion`, el webhook unificado `app/api/hotmart-webhook/route.ts` y el design system PWA (sage/coral/cream + framer-motion).

> Las tareas marcadas con `*` son **opcionales** (solo tests) y pueden saltearse para un MVP. Las tareas sin `*` son implementación central y deben hacerse.

## Tasks

- [x] 1. Extender la configuración LATAM (precios, URLs, nombre de producto y código VIP)
  - Editar `lib/quiz-v2/config-latam.ts` (única fuente de verdad LATAM).
  - Agregar a `PRICING_LATAM`: `upsell2: { amount: 27.00, display: 'US$27', displayOriginal: 'US$97' }` y `downsell2: { amount: 17.00, display: 'US$17', displayOriginal: 'US$97' }`, manteniendo el patrón `as const` y los campos `front`/`upsell`/`downsell` existentes.
  - Agregar `export const UPSELL2_PRODUCT_NAME_LATAM = 'Acceso VIP de por vida';` (compartido por upsell2 y downsell2).
  - Agregar `export const LATAM_UPSELL2_CHECKOUT_URL = process.env.NEXT_PUBLIC_LATAM_UPSELL2_CHECKOUT_URL || '';` y `export const LATAM_DOWNSELL2_CHECKOUT_URL = process.env.NEXT_PUBLIC_LATAM_DOWNSELL2_CHECKOUT_URL || '';` (mismo patrón de fallback a `''` que las URLs existentes).
  - Agregar `export const VIP_CODE_LATAM = process.env.NEXT_PUBLIC_VIP_CODE_LATAM || 'VIPLATAM';`.
  - Documentar en comentarios las reglas de negocio: `upsell2.amount > upsell.amount` (27 > 13.90) y `downsell2.amount < upsell2.amount` (17 < 27).
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 2. Implementar la librería del candado VIP y sus property tests
  - [x] 2.1 Crear `lib/pwa/vip-access.ts` (lib pura, client-safe)
    - Exportar `VIP_UNLOCK_STORAGE_KEY = 'pwa_vip_unlocked_latam'`.
    - `validateVipCode(input: string): boolean` → compara `input.trim()` contra `VIP_CODE_LATAM.trim()` de forma case-insensitive; sin red ni SQL; no muta nada. Importa `VIP_CODE_LATAM` de `@/lib/quiz-v2/config-latam`.
    - `persistVipUnlocked(): void` → setea `localStorage[VIP_UNLOCK_STORAGE_KEY] = 'true'`; idempotente; `try/catch` no-op si `localStorage` no está disponible (no lanza).
    - `isVipUnlocked(): boolean` → server-safe (`typeof window === 'undefined'` → `false`); devuelve `true` solo si el flag vale exactamente `'true'`; `try/catch` → `false` si `localStorage` lanza.
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.11_
  - [x]* 2.2 Property test — el código incorrecto nunca desbloquea
    - **Property 3: La sección VIP no se desbloquea sin el código correcto**
    - Generar strings arbitrarios distintos (trim + case-insensitive) de `VIP_CODE_LATAM` y verificar `validateVipCode(s) === false`.
    - **Validates: Requirements 4.4**
  - [x]* 2.3 Property test — código correcto desbloquea y persiste (round-trip)
    - **Property 4: El código correcto desbloquea y persiste (round-trip)**
    - Generar variantes de casing/espacios del código válido; verificar `validateVipCode === true` y que tras `persistVipUnlocked()` → `isVipUnlocked() === true` (con `localStorage` mockeado).
    - **Validates: Requirements 4.3**
  - [x]* 2.4 Property test — la validación no toca red ni SQL
    - **Property 5: La validación no toca SQL ni red**
    - Para entradas arbitrarias, espiar `fetch`/globals de red y asegurar que `validateVipCode` no los invoca.
    - **Validates: Requirements 4.5, 4.9**
  - [x]* 2.5 Property test — `isVipUnlocked` refleja exactamente el flag
    - **Property 6: `isVipUnlocked` refleja exactamente el flag persistido**
    - Para valores arbitrarios del flag en `localStorage`, verificar `isVipUnlocked() === (valor === 'true')`.
    - **Validates: Requirements 4.6, 4.1**
  - [x]* 2.6 Property test — idempotencia del desbloqueo
    - **Property 9: Idempotencia del desbloqueo**
    - Para secuencias de N llamadas a `persistVipUnlocked()`, verificar que el estado final del flag es idéntico al de una sola llamada (`'true'`).
    - **Validates: Requirements 4.7**

- [x] 3. Construir la sección VIP de la PWA (`app/pwa/vip/page.tsx`)
  - Crear el client component (`'use client'`) con estados `'locked' | 'unlocked'` siguiendo el algoritmo del design (onMount → `isVipUnlocked()`; onSubmitCode → `validateVipCode` + `persistVipUnlocked`).
  - Estado `locked`: input de código + botón submit; al enviar, si `validateVipCode` es `true` persistir y pasar a `unlocked`; si es `false`, permanecer `locked` y mostrar el error exacto `"Código inválido. Revisá el email de tu compra VIP."`.
  - Estado `unlocked`: renderizar los **9 módulos VIP (B.1–B.9)** como placeholders/contenedores siguiendo el design system PWA (cards sage/coral/cream, `framer-motion` como `app/pwa/dashboard/page.tsx`). Sin contenido literal (fuera de alcance).
  - No llamar a ningún backend ni base de datos; sin autenticación. Importa los helpers de `@/lib/pwa/vip-access`.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.8, 4.9, 4.10_

- [x] 4. Construir el componente de oferta del upsell 2 y sus tests
  - [x] 4.1 Crear `components/upsell/Upsell2OfferLatam.tsx` (client)
    - Fork conceptual de `VslOfferBlockLatam` pero **TSL** (sin delay de revelado ni countdown atado a video; oferta visible desde el inicio). Props: `{ ctaLabel?: string }`.
    - Precio: ancla `PRICING_LATAM.upsell2.displayOriginal` (US$97) → final `PRICING_LATAM.upsell2.display` (US$27); % de descuento calculado desde config.
    - `handleAccept()`: si `window.fbq` existe → `fbq('track','InitiateCheckout', { value: PRICING_LATAM.upsell2.amount, currency: PRICING_CURRENCY_LATAM, content_name: UPSELL2_PRODUCT_NAME_LATAM, content_category: 'Upsell2' })` exactamente una vez; `POST /api/track` con `keepalive: true`, `event:'InitiateCheckout'`, `value`, `currency:'USD'`, `contentName`, `contentCategory:'Upsell2'`, `custom:{ quiz_version: 'latam' }`, `fbc`/`fbp` de `getMetaCookies()`, con `.catch(() => {})`; luego `withHotmartCheckout(LATAM_UPSELL2_CHECKOUT_URL, { src: 'upsell2_latam' })` → si no-vacío navegar, si vacío `console.warn` y no navegar.
    - `handleSkip()`: `fbq('trackCustom','Upsell2Skip')` (si existe) y redirigir a `/downsell2-latam` (nunca directo a la PWA).
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_
  - [x]* 4.2 Property test — el CTA "SÍ" dispara InitiateCheckout en USD
    - **Property 1: El CTA "SÍ" dispara InitiateCheckout en USD**
    - Mockear `window.fbq`/`fetch`; verificar exactamente un `InitiateCheckout` con `value === PRICING_LATAM.upsell2.amount` y `currency === 'USD'` para entradas variadas de cookies.
    - **Validates: Requirements 1.4**
  - [x]* 4.3 Property test — el CTA registra el funnel como 'latam'
    - **Property 2: El CTA registra el evento de funnel como 'latam'**
    - Verificar que el body del `POST /api/track` incluye `quiz_version: 'latam'` y que `normalizeQuizVersion('latam') === 'latam'` (reusar patrón de `app/api/track/route.test.ts`).
    - **Validates: Requirements 1.5**
  - [x]* 4.4 Unit test — "No gracias" redirige a `/downsell2-latam`
    - **Property 7: El "no gracias" del upsell 2 redirige a `/downsell2-latam`**
    - Mockear el router/`window.location`; verificar redirección a `/downsell2-latam` (nunca a `PWA_BASE_URL_LATAM`). Cubrir también la rama de `LATAM_UPSELL2_CHECKOUT_URL` vacía (no navega + warning) y que un fallo de `/api/track` no bloquea el redirect.
    - **Validates: Requirements 1.7, 1.8, 1.9**

- [x] 5. Construir la página TSL del upsell 2 (`app/upsell2-latam/page.tsx`)
  - Server component shell con `export const metadata` que incluya `robots: { index: false, follow: false }` (no indexable, igual que `/upsell-latam` y `/downsell-latam`).
  - Renderizar `<UpsellPageTracker page="offer" />` (mismo patrón que `/upsell-latam`).
  - Secciones de copy TSL en orden: hook → problema/agitación → presentación de la oferta VIP → qué incluye (B.1–B.9) → prueba social → precio con ancla y descuento → garantía → FAQ → CTAs repetidos.
  - Embeber `<Upsell2OfferLatam />` para los CTAs con tracking.
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 6. Construir el componente de oferta del downsell 2 y sus tests
  - [x] 6.1 Crear `components/upsell/Downsell2OfferLatam.tsx` (client)
    - Fork conceptual de `DownsellOfferLatam` adaptado al producto VIP. Props: `{ ctaLabel?: string }`. Estado `pendingConfig` para el aviso de "config pendiente".
    - Precio: ancla `PRICING_LATAM.upsell2.display` (US$27, lo que recién vio) → final `PRICING_LATAM.downsell2.display` (US$17).
    - `handleAccept()`: si `window.fbq` existe → `fbq('track','InitiateCheckout', { value: PRICING_LATAM.downsell2.amount, currency: PRICING_CURRENCY_LATAM, content_name: UPSELL2_PRODUCT_NAME_LATAM, content_category: 'Downsell2' })`; `POST /api/track` con `keepalive: true`, `value: downsell2.amount`, `currency:'USD'`, `custom:{ quiz_version: 'latam' }`, `fbc`/`fbp`, `.catch(() => {})`; luego `withHotmartCheckout(LATAM_DOWNSELL2_CHECKOUT_URL, { src: 'downsell2_latam' })` → si no-vacío navegar, si vacío `setPendingConfig(true)` (aviso "config pendiente", no navega).
    - `handleSkip()`: `fbq('trackCustom','Downsell2Skip')` (si existe) y redirigir a `PWA_BASE_URL_LATAM` (fin del embudo LATAM).
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.7_
  - [x]* 6.2 Property test — el CTA del downsell 2 dispara InitiateCheckout en USD
    - **Property 10: El CTA "SÍ" del downsell 2 dispara InitiateCheckout en USD con el precio del downsell 2**
    - Mockear `window.fbq`/`fetch`; verificar exactamente un `InitiateCheckout` con `value === PRICING_LATAM.downsell2.amount` y `currency === 'USD'`.
    - **Validates: Requirements 2.3**
  - [x]* 6.3 Property test — el CTA del downsell 2 registra el funnel como 'latam'
    - **Property 11: El CTA del downsell 2 registra el evento de funnel como 'latam'**
    - Verificar que el body del `POST /api/track` incluye `quiz_version: 'latam'` (mapea a `'latam'`).
    - **Validates: Requirements 2.4**
  - [x]* 6.4 Unit test — "No gracias" del downsell 2 redirige a la PWA
    - **Property 12: El "no gracias" del downsell 2 redirige a la PWA (fin del embudo)**
    - Verificar redirección a `PWA_BASE_URL_LATAM`. Cubrir también la rama de `LATAM_DOWNSELL2_CHECKOUT_URL` vacía (aviso "config pendiente", no navega).
    - **Validates: Requirements 2.6, 2.7**

- [x] 7. Construir la página del downsell 2 (`app/downsell2-latam/page.tsx`)
  - Server component shell siguiendo `app/downsell-latam/page.tsx`: `export const metadata` con `robots: { index: false, follow: false }`.
  - Renderizar `<UpsellPageTracker page="checkout" />` (mismo patrón que `/downsell-latam`).
  - Embeber `<Downsell2OfferLatam />`. Oferta más corta/directa que la TSL del upsell 2, mismo producto VIP a precio menor.
  - _Requirements: 2.1, 2.2_

- [x] 8. Verificar la captura de la compra VIP en el webhook de Hotmart
  - [x] 8.1 Auditar `app/api/hotmart-webhook/route.ts` (verificación, sin rediseño funcional)
    - Leer `handleApproved` y confirmar que: el `Purchase` a CAPI usa `value`/`currency` del payload (USD: 27 para upsell2, 17 para downsell2); incluye `fbc`/`fbp` cuando están presentes; el upsert a `purchases` es idempotente por `hotmart_transaction`; el camino **no filtra por producto** (ambas variantes del VIP entran igual); y CAPI server-side es la fuente única de `Purchase` (pixel nativo de Hotmart desactivado).
    - Solo si se detecta un gap respecto a lo anterior, aplicar el cambio mínimo necesario; si ya cumple, dejar el handler intacto y documentarlo.
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x]* 8.2 Test de integración — compra VIP (upsell2 y downsell2) capturada como 'latam'
    - **Property 8: El webhook captura la compra del VIP (upsell 2 o downsell 2) como 'latam'**
    - Con 1–3 payloads representativos de `PURCHASE_APPROVED` del producto VIP a US$27 y a US$17 (mockear `sendCapiEvent`/Supabase), verificar `Purchase` a CAPI con `value`/`currency` del payload y `fbc`/`fbp` presentes, e idempotencia por `hotmart_transaction`. No PBT (servicio externo, behavior no varía por input).
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x]* 9. Property test — regla de precios downsell2 < upsell2
  - **Property 13: El downsell 2 cuesta menos que el upsell 2**
  - Verificar directamente sobre la config que `PRICING_LATAM.downsell2.amount < PRICING_LATAM.upsell2.amount` (y de paso `upsell2.amount > upsell.amount`).
  - **Validates: Requirements 3.4, 3.5**

- [x] 10. Checkpoint final — verificación y documentación operativa
  - Correr typecheck (`npx tsc --noEmit`), build de Next.js (`npm run build`) y la suite de tests (`npm test`, que ya usa `vitest --run`); asegurar que todo pasa. Ante dudas, consultar al usuario.
  - Documentar (en el PR / notas, no como código) la **configuración manual de Hotmart**: (a) página post-aprobación del upsell 1 = `/upsell2-latam`; (b) producto VIP con email nativo de confirmación que entrega el código VIP (`VIPLATAM`) + link a `/pwa/vip`; (c) checkout del downsell 2 (precio menor) apuntado por `LATAM_DOWNSELL2_CHECKOUT_URL`, con el mismo email/código; (d) pixel nativo de Hotmart **desactivado** (CAPI = fuente única).
  - Documentar las **env vars a setear en Vercel**: `NEXT_PUBLIC_LATAM_UPSELL2_CHECKOUT_URL`, `NEXT_PUBLIC_LATAM_DOWNSELL2_CHECKOUT_URL`, `NEXT_PUBLIC_VIP_CODE_LATAM` (opcional; default `VIPLATAM`).
  - _Requirements: 6.1, 6.2_

## Notes

- Las tareas marcadas con `*` son **opcionales** (solo tests) y pueden saltearse para un MVP más rápido.
- Cada tarea referencia los requisitos que satisface (Requirements 1–6) y, cuando aplica, la Correctness Property del diseño.
- Lenguaje de implementación: TypeScript/React (Next.js 14), alineado con el repo. Tests con Vitest + fast-check (mínimo 100 iteraciones por property test; tag `Feature: upsell2-latam-vip, Property {n}: {texto}`).
- **Fuera de alcance** (no hay tareas): contenido literal del VIP (recetas/PDFs/texto de masterclasses), `/upsell2` y `/downsell2` para Argentina, geo-routing, base de datos o autenticación para el candado, y el pixel nativo de Hotmart.
- Respetar specs previos: `quiz_version: 'latam'`, `normalizeQuizVersion`, no romper el dashboard/funnel argentino.

## Task Dependency Graph

```json
{
  "tasks": {
    "1":   { "description": "Extender config LATAM (precios, URLs, nombre producto, código VIP)", "dependencies": [], "files": ["lib/quiz-v2/config-latam.ts"] },
    "2.1": { "description": "Crear lib/pwa/vip-access.ts", "dependencies": ["1"], "files": ["lib/pwa/vip-access.ts"] },
    "2.2": { "description": "Property test - código incorrecto no desbloquea (P3)", "dependencies": ["2.1"], "files": ["lib/pwa/vip-access.test.ts"], "optional": true },
    "2.3": { "description": "Property test - código correcto round-trip (P4)", "dependencies": ["2.1"], "files": ["lib/pwa/vip-access.test.ts"], "optional": true },
    "2.4": { "description": "Property test - validación sin red/SQL (P5)", "dependencies": ["2.1"], "files": ["lib/pwa/vip-access.test.ts"], "optional": true },
    "2.5": { "description": "Property test - isVipUnlocked refleja el flag (P6)", "dependencies": ["2.1"], "files": ["lib/pwa/vip-access.test.ts"], "optional": true },
    "2.6": { "description": "Property test - idempotencia desbloqueo (P9)", "dependencies": ["2.1"], "files": ["lib/pwa/vip-access.test.ts"], "optional": true },
    "3":   { "description": "Sección VIP PWA app/pwa/vip/page.tsx", "dependencies": ["2.1"], "files": ["app/pwa/vip/page.tsx"] },
    "4.1": { "description": "Componente Upsell2OfferLatam", "dependencies": ["1"], "files": ["components/upsell/Upsell2OfferLatam.tsx"] },
    "4.2": { "description": "Property test - InitiateCheckout USD upsell2 (P1)", "dependencies": ["4.1"], "files": ["components/upsell/Upsell2OfferLatam.test.tsx"], "optional": true },
    "4.3": { "description": "Property test - track funnel 'latam' upsell2 (P2)", "dependencies": ["4.1"], "files": ["components/upsell/Upsell2OfferLatam.test.tsx"], "optional": true },
    "4.4": { "description": "Unit test - skip -> /downsell2-latam (P7)", "dependencies": ["4.1"], "files": ["components/upsell/Upsell2OfferLatam.test.tsx"], "optional": true },
    "5":   { "description": "Página TSL app/upsell2-latam/page.tsx", "dependencies": ["4.1"], "files": ["app/upsell2-latam/page.tsx"] },
    "6.1": { "description": "Componente Downsell2OfferLatam", "dependencies": ["1"], "files": ["components/upsell/Downsell2OfferLatam.tsx"] },
    "6.2": { "description": "Property test - InitiateCheckout USD downsell2 (P10)", "dependencies": ["6.1"], "files": ["components/upsell/Downsell2OfferLatam.test.tsx"], "optional": true },
    "6.3": { "description": "Property test - track funnel 'latam' downsell2 (P11)", "dependencies": ["6.1"], "files": ["components/upsell/Downsell2OfferLatam.test.tsx"], "optional": true },
    "6.4": { "description": "Unit test - skip -> PWA_BASE_URL_LATAM (P12)", "dependencies": ["6.1"], "files": ["components/upsell/Downsell2OfferLatam.test.tsx"], "optional": true },
    "7":   { "description": "Página app/downsell2-latam/page.tsx", "dependencies": ["6.1"], "files": ["app/downsell2-latam/page.tsx"] },
    "8.1": { "description": "Auditar webhook Hotmart (verificación)", "dependencies": [], "files": ["app/api/hotmart-webhook/route.ts"] },
    "8.2": { "description": "Test integración - captura VIP en CAPI (P8)", "dependencies": ["8.1"], "files": ["app/api/hotmart-webhook/route.test.ts"], "optional": true },
    "9":   { "description": "Property test - regla precios downsell2<upsell2 (P13)", "dependencies": ["1"], "files": ["lib/quiz-v2/config-latam.test.ts"], "optional": true },
    "10":  { "description": "Checkpoint final - typecheck/build/tests + docs operativas", "dependencies": ["3", "5", "7", "8.1", "9"], "files": [] }
  },
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "8.1"],
      "rationale": "La config (tarea 1) es la base: precios, URLs, nombre de producto y código VIP de los que dependen casi todas las demás tareas. La auditoría del webhook (8.1) es independiente de la config y puede correr en paralelo."
    },
    {
      "wave": 2,
      "tasks": ["2.1", "4.1", "6.1", "9", "8.2"],
      "rationale": "Librería del candado y los dos componentes de oferta dependen solo de la config (tarea 1) y editan archivos distintos, así que van en paralelo. El test de regla de precios (9) depende de la config; el test de integración del webhook (8.2) depende de su auditoría (8.1)."
    },
    {
      "wave": 3,
      "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "3", "4.2", "4.3", "4.4", "5", "6.2", "6.3", "6.4", "7"],
      "rationale": "Las páginas embeben sus componentes (3<-2.1, 5<-4.1, 7<-6.1) y los tests dependen de sus implementaciones; ninguna de estas tareas comparte archivo dentro de la ola (cada página y cada archivo de test es distinto)."
    },
    {
      "wave": 4,
      "tasks": ["10"],
      "rationale": "Checkpoint final: typecheck, build y suite de tests sobre todo lo integrado, más la documentación de pasos operativos manuales (Hotmart/Vercel)."
    }
  ]
}
```


## Implementation Result & Operational Steps

> Todas las tareas (olas 1→4) fueron implementadas. `tsc --noEmit`, `next build`
> y la suite Vitest completa pasan. Esta sección documenta los pasos operativos
> manuales (no son código) y el resultado de la verificación del webhook.

### Resultado de la verificación del webhook (Tarea 8.1)

`app/api/hotmart-webhook/route.ts` → `handleApproved` **ya cumple** todos los
criterios sin necesidad de cambios funcionales:
- El `Purchase` a Meta CAPI usa `value`/`currency` del payload (USD: 27 para el
  upsell 2, 17 para el downsell 2).
- Incluye `fbc`/`fbp` cuando están presentes (de `buyer` o `purchase.tracking`).
- El upsert a `purchases` es idempotente por `hotmart_transaction`
  (`onConflict: 'hotmart_transaction', ignoreDuplicates: true`).
- **No filtra por producto**: todo `PURCHASE_APPROVED`/`PURCHASE_COMPLETE` pasa
  por el mismo camino, así que upsell 2 y downsell 2 se capturan igual. El único
  uso de `product.id` es para el label del email de bienvenida (no gatea CAPI/DB).
- CAPI server-side es la fuente única de `Purchase` (el pixel nativo de Hotmart
  queda desactivado; `UpsellPageTracker` solo dispara `ViewContent`).

→ Handler dejado **intacto**. Cubierto por el test de integración (Tarea 8.2).

### Configuración manual de Hotmart (pendiente, operativa)

1. **Upsell 1 → Upsell 2**: en el panel de Hotmart, configurar la página
   post-aprobación del producto upsell de 30 días para que apunte a
   **`/upsell2-latam`**.
2. **Producto VIP (upsell 2, US$27)**: crear el producto y configurar su email
   NATIVO de confirmación post-compra para que entregue el **código VIP
   (`VIPLATAM`)** + el link a **`/pwa/vip`**.
3. **Downsell 2 (US$17)**: crear el checkout del mismo producto VIP a precio
   menor; apuntar `NEXT_PUBLIC_LATAM_DOWNSELL2_CHECKOUT_URL` a esa URL. Usar el
   **mismo email/código** que el upsell 2 (es el mismo producto VIP).
4. **Pixel nativo de Hotmart DESACTIVADO**: CAPI server-side
   (`/api/hotmart-webhook`) es la fuente única de `Purchase` para evitar
   double-count.

### Env vars a setear en Vercel (Settings → Environment Variables)

- `NEXT_PUBLIC_LATAM_UPSELL2_CHECKOUT_URL` — checkout Hotmart del upsell 2 (US$27).
- `NEXT_PUBLIC_LATAM_DOWNSELL2_CHECKOUT_URL` — checkout Hotmart del downsell 2 (US$17).
- `NEXT_PUBLIC_VIP_CODE_LATAM` — **opcional**; default `VIPLATAM` si no se setea.

> Sin las URLs de checkout, las páginas no rompen: muestran un aviso de
> "config pendiente" y no navegan (mismo patrón que el resto del funnel LATAM).
