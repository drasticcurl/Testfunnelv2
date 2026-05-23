# 25 — Launch Context Snapshot (May 2026)

> Documento de continuidad. Captura **todo** lo construido en la sesión de
> setup y deja al próximo agente listo para arrancar el lanzamiento de ads
> sin re-descubrir contexto.
>
> Última actualización: 16 May 2026, post PR #31 (onboarding flow).

---

## 0. Quién es el usuario y qué quiere

- Producto: **Chau-Hinchazón** (PWA de protocolo anti-hinchazón 7 días + upsell 30 días).
- Marca paraguas: **hilvanapp** (`hilvanapp.com`, multi-producto).
- Vendedor: marketer trabajando solo, busca lanzar ads en Meta cuanto antes.
- Idioma del producto: español rioplatense (vos/che). Nicho: mujeres LATAM 25-55 con hinchazón crónica.
- Plataforma de pago: **Hotmart** (LATAM, recién aprobado).
- Comunicación con el dev: español informal, prefiere respuestas concretas y accionables, odia perder tiempo.
- Tiene poca paciencia con bugs en cadena → priorizar mensajes de error claros y soluciones que no requieran limpieza manual de browser.

---

## 1. Stack y arquitectura

### Repo

- GitHub: `drasticcurl/testfunnel`
- Branch principal: `main`
- Frontend: **Next.js 14.2.5** (App Router, runtime Node + Edge para middleware)
- Hosting: **Vercel**
- DB: **Supabase** (proyecto: `ybuvotwvqhnprychzspb.supabase.co`)
- Tracking: Meta Pixel + Conversions API + Systeme.io (configurados en código, faltan tokens)
- Pago: Hotmart (front $14.90 + upsell $9.90)
- Tooling: Tailwind, framer-motion, recharts, zustand, supabase-js

### Dominio

- Comprado en **Cloudflare Registrar**: `hilvanapp.com` ($14/año)
- Subdominio del primer producto: `chauhinchazon.hilvanapp.com`
- DNS: CNAME `chauhinchazon` → `cname.vercel-dns.com` (modo "DNS only", nube gris)
- SSL: emitido automáticamente por Vercel
- Estrategia: **un dominio paraguas + un subdominio por producto** para validar varios protocolos sin gastar $10 por cada uno

### Estructura de rutas relevante

```
/                             Landing principal
/quiz                         Quiz interactivo
/resultados                   Página de venta dinámica (lee searchParams)
/upsell                       Post-compra: oferta del programa 30 días (PR #26)
/upsell2                      Checkout embed Hotmart del upsell (PR #26)

/pwa/login                    Email-only login
/pwa/onboarding               3 pasos: bienvenida → preferencias dietéticas → tour
/pwa/dashboard                Inicio del usuario logueado
/pwa/plan, /diario, etc.      Resto del producto

/api/hotmart-webhook          Webhook UNIFICADO (Supabase + CAPI + Systeme)
/api/pwa/webhook/hotmart      Proxy deprecated al unificado (back-compat)
/api/pwa/auth/login           Verifica compra + setea cookie firmada HMAC
/api/pwa/auth/logout
/api/pwa/me                   Devuelve { authenticated, email, nombre }
/api/pwa/debug                Endpoint de diagnóstico de env vars (no leakea secrets)
/api/track                    Tracking server-side
/api/submit-quiz              Submit del quiz
```

---

## 2. Hotmart — qué se configuró

### Productos

| Producto | Precio | ID numérico | Estado |
|---|---|---|---|
| **Front:** Protocolo Anti-Hinchazón 7 Días | $14.90 USD | `7750998` | ✅ Aprobado y publicado |
| **Upsell:** Programa Anti-Hinchazón 30 Días | $9.90 USD | `7751263` | ✅ Aprobado y publicado |

### Embudo de ventas (Hotmart — "Sales Funnel")

```
Front $14.90  →  Upsell 30 días $9.90 (one-click, página /upsell + /upsell2)
                 → Página de gracias / PWA
```

- Configurado en Hotmart como **embudo con 2 etapas + thank you**.
- One-click upsell ACTIVADO (no re-pide tarjeta).
- Garantía: **30 días** en ambos productos.
- Tipo de producto: **Curso online** (NO ebook, NO PDF).
- Forma de entrega: **Área de miembros externa** = `https://chauhinchazon.hilvanapp.com/pwa/login`
- Página de venta declarada: `https://chauhinchazon.hilvanapp.com/resultados`
- Webhook Hottok: ya generado (mismo para todos los productos del usuario).

### Checkout embed

- Para el upsell se usa `?checkoutMode=10` (iframe inline, no popup).
- URL completa: `https://pay.hotmart.com/W105864596F?checkoutMode=10`
- En `/upsell2` se renderiza un `<iframe>` con esa URL + fallback automático si X-Frame-Options bloquea.

### Lo del "campo usuario/contraseña" para el revisor

Hotmart pide credenciales de prueba al configurar área externa. Solución usada:

- Email: `revisor@hotmart.com`
- Pass: `Revisar2026!` (ficticio, no se valida realmente)
- En el bloque de instrucciones se explicó al revisor cómo entrar (test mode estaba activo durante la review)

---

## 3. Supabase — qué se configuró

### Proyecto

- URL: `https://ybuvotwvqhnprychzspb.supabase.co`
- Plan: free
- Región: us-east-1

### Schema actual

Una sola tabla. SQL completo en `docs/25b-SUPABASE-SCHEMA.sql` mental — efectivamente lo que se corrió fue:

```sql
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  hotmart_transaction text unique,
  product_id text,
  product_name text,
  amount numeric(10, 2),
  currency text default 'USD',
  status text not null default 'approved'
    check (status in ('approved', 'refunded', 'chargeback', 'pending')),
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchases_email_status_idx on public.purchases (email, status);
create index purchases_email_idx on public.purchases (email);
create index purchases_product_id_idx on public.purchases (product_id);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger purchases_set_updated_at
  before update on public.purchases
  for each row execute function public.set_updated_at();

alter table public.purchases enable row level security;
-- Sin policies: solo service_role accede (vía API routes server-side).
```

### Auth config

- Site URL: `https://chauhinchazon.hilvanapp.com`
- Redirect URLs: `https://chauhinchazon.hilvanapp.com/**`, `http://localhost:3000/**`
- Email template del magic link: customizado (ver chat — paleta cream/coral/sage, sin imágenes externas)
  - **NOTA**: actualmente no usamos el magic link de Supabase. La auth real de la PWA es por **cookie HMAC** firmada (ver §4). El template está configurado pero queda como respaldo si en el futuro queremos pasar a magic link.

### Datos de prueba (siempre que se quiera resetear)

```sql
-- Borrar
delete from public.purchases
where email in (
  'test.aprobado@hilvanapp.com',
  'test.upsell@hilvanapp.com',
  'test.reembolsado@hilvanapp.com',
  'test.chargeback@hilvanapp.com'
);

-- Recrear
insert into public.purchases (email, hotmart_transaction, product_id, product_name, amount, currency, status)
values
  ('test.aprobado@hilvanapp.com',    'TEST-APR-' || gen_random_uuid()::text, 'TEST_FRONT',  'Protocolo 7 Días',           14.90, 'USD', 'approved'),
  ('test.upsell@hilvanapp.com',      'TEST-UPS-' || gen_random_uuid()::text, 'TEST_UPSELL', 'Programa 30 Días',            9.90, 'USD', 'approved'),
  ('test.reembolsado@hilvanapp.com', 'TEST-REF-' || gen_random_uuid()::text, 'TEST_FRONT',  'Protocolo 7 Días (refund)',  14.90, 'USD', 'refunded'),
  ('test.chargeback@hilvanapp.com',  'TEST-CHG-' || gen_random_uuid()::text, 'TEST_FRONT',  'Protocolo 7 Días (chgbck)',  14.90, 'USD', 'chargeback');
```

---

## 4. PWA — el sistema de auth real

### Decisión arquitectónica

Originalmente el repo tenía un esqueleto de magic link via Supabase Auth pero
**el callback handler nunca existió** y el flujo estaba roto. Se reemplazó por
**cookie firmada HMAC SHA-256** server-side, decisión documentada en
`lib/pwa/session.ts`.

Razones:
- PWA installable → UX instantánea sin "revisá tu email"
- Migración a magic link queda abierta (mismo módulo de sesión sigue sirviendo)
- Seguridad efectiva: solo entra quien tenga email con compra `approved` en Supabase

### Archivos clave

```
lib/pwa/session.ts            HMAC sign/verify (Node, usa node:crypto)
lib/pwa/session-edge.ts       HMAC verify para middleware (Web Crypto)
lib/pwa/get-user-name.ts      email → nombre legible ("juana@x.com" → "Juana")
lib/pwa/use-pwa-user.ts       Hook React que llama /api/pwa/me
lib/pwa/onboarding-state.ts   Flag pwa_onboarding_completed en localStorage
lib/pwa/test-mode.ts          isTestMode() para bypass dev/staging
```

### Estructura del token

`base64url(payload).base64url(signature)` donde:
- `payload = { email, iat }` (iat en segundos)
- `signature = HMAC-SHA256(payload, PWA_SESSION_SECRET)`
- Validez: 30 días

### Cookie

```
Name:     pwa_session
HttpOnly: true
Secure:   true (en prod)
SameSite: lax
Path:     /
MaxAge:   30 días
```

### Middleware guard (`middleware.ts`)

Hace 2 cosas:

1. **A/B variant assignment** (preexistente, no se tocó la lógica)
2. **PWA guard**: si la ruta es interna de la PWA y no hay sesión válida → redirige a `/pwa/login`

`pathRequiresPwaSession()` excluye:
- Cualquier path con extensión en el último segmento (`.js`, `.json`, `.png`, etc.) — esto era CRÍTICO porque `/pwa-sw.js` y `/pwa-manifest.json` viven en `/public` y empiezan con "pwa", pero **NO** son rutas internas
- `/pwa/login` y `/pwa/auth/*`
- Solo matchea `/pwa` exacto o `/pwa/...` con slash

Hay un kill switch: `NEXT_PUBLIC_PWA_TEST_MODE=true` bypasa el guard completo.

### Service Worker

`app/pwa/PwaServiceWorker.tsx`:
- HEAD-checkea `/pwa-sw.js` antes de registrar (si responde redirect, skip)
- Kill switch: `NEXT_PUBLIC_PWA_DISABLE_SW=true`
- `/pwa/login` desregistra cualquier SW viejo con scope `/pwa` automáticamente al cargar

---

## 5. Onboarding flow (PR #31, último mergeado)

### Decisión

El onboarding **es obligatorio la primera vez** y **opcional después**. Es un
mini-tutorial de 3 pasos + setup de preferencias dietéticas.

### Trigger

Flag en localStorage: `pwa_onboarding_completed: 'true'`.
- Vive en device → si abre desde otro celu, vuelve a verlo (aceptable, se moverá a tabla `profiles` en Supabase a futuro).
- `/pwa/login` chequea la flag → redirige a `/pwa/onboarding` o `/pwa/dashboard`.
- `/pwa/dashboard` también guard: si la flag está unset, redirige.

### Los 3 pasos

1. **Bienvenida** — saludo con su nombre derivado del email + value stack (qué incluye su protocolo).
2. **Restricciones alimentarias** — checkbox: sin gluten, sin lactosa, vegetariano. Filtran recetas reales (`lib/pwa/dietary-preferences.ts`).
3. **Tour** — 4 cards (Plan / Diario / Recetas / Calculadora) + tip "agregar a inicio".

### Lo que se sacó

- Step "Tu diagnóstico Tipo 3 / Severidad 7" → era hardcoded para todos. La PWA todavía no recibe los datos del quiz post-compra. Cuando hagamos `profiles` en Supabase volverá con datos reales.

---

## 6. Webhook unificado de Hotmart

### Endpoint canonical

`/api/hotmart-webhook` — único endpoint que se configura en Hotmart.

### Por qué unificado

Hotmart solo permite **una URL de webhook por producto**. Antes había dos
endpoints separados (uno para Supabase, otro para CAPI/Systeme) y eso obligaba
a elegir cuál perder. Ahora todos los efectos viven acá:

```
1. Supabase upsert (CRÍTICO: sin esto el comprador no puede entrar a la PWA)
2. Meta CAPI Purchase event (importante para optimización de ads)
3. Systeme tag "comprador" (email marketing)
```

Si alguno falla, los siguientes se intentan igual. Hotmart recibe 200 siempre
que el evento sea reconocido para no reintentar.

### Eventos manejados

| Evento Hotmart | Acción Supabase | Acción CAPI | Acción Systeme |
|---|---|---|---|
| `PURCHASE_APPROVED` / `PURCHASE_COMPLETE` | upsert status='approved' | Purchase | tag `comprador` |
| `PURCHASE_REFUNDED` | update status='refunded' | — | tag `reembolsado` |
| `PURCHASE_CHARGEBACK` / `CHARGEBACK` | update status='chargeback' | — | tag `chargeback` |
| `PURCHASE_CANCELED` | update status='refunded' | — | tag `cancelado` |

### Idempotencia

`purchases.hotmart_transaction` es UNIQUE. El upsert con `ignoreDuplicates: true`
maneja reintentos de Hotmart sin crear duplicados.

### Backwards compat

`/api/pwa/webhook/hotmart` quedó como **proxy deprecated** al unificado. Si
quedó configurada en Hotmart por error, sigue funcionando pero loguea warning.
Eliminar después de confirmar 1-2 días sin hits.

---

## 7. Variables de entorno — estado actual en Vercel

### Configuradas y funcionando ✅

```
NEXT_PUBLIC_SITE_URL                       https://chauhinchazon.hilvanapp.com
NEXT_PUBLIC_PWA_BASE_URL                   https://chauhinchazon.hilvanapp.com/pwa/login
NEXT_PUBLIC_HOTMART_CHECKOUT_URL           https://pay.hotmart.com/<front-id>
NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL    https://pay.hotmart.com/W105864596F?checkoutMode=10
NEXT_PUBLIC_PWA_TEST_MODE                  false  ← CRÍTICO
NEXT_PUBLIC_SUPABASE_URL                   https://ybuvotwvqhnprychzspb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY              eyJhbGc... (208 chars)
SUPABASE_SERVICE_ROLE_KEY                  eyJhbGc... (219 chars) [sensitive]
PWA_SESSION_SECRET                         (64 chars hex, openssl rand -hex 32) [sensitive]
HOTMART_HOTTOK                             (66 chars) [sensitive]
HOTMART_PRODUCT_ID_FRONT                   7750998
HOTMART_PRODUCT_ID_UPSELL                  7751263
```

### Faltan agregar (próximos pasos)

```
NEXT_PUBLIC_META_PIXEL_ID                  ← falta
META_PIXEL_ID                              ← falta (igual que arriba sin NEXT_PUBLIC_)
META_CAPI_TOKEN                            ← falta [sensitive]
NEXT_PUBLIC_META_DOMAIN_VERIFICATION       ← falta (meta tag para verificar dominio en Meta Business)
SYSTEME_API_KEY                            ← opcional [sensitive]
QUIZ_WEBHOOK_URL                           ← opcional (Make.com backup)
```

---

## 8. Historia de PRs y bugs encontrados

### PR #26 — feat: /upsell offer page + /upsell2 checkout embed
- Páginas nuevas para post-compra
- `/upsell` = oferta emocional con CTA grande + skip pequeño
- `/upsell2` = iframe Hotmart + fallback redirect en nueva pestaña si X-Frame-Options bloquea

### PR #27 — feat: real session + unified Hotmart webhook
- Bug original: `isTestMode()` chequeaba `SUPABASE_SERVICE_ROLE_KEY` que en el browser es siempre undefined → todos los componentes client creían estar en test mode → mostraban "María" hardcodeada
- Solución: hook `usePwaUser` que llama `/api/pwa/me` server-side
- Nuevo: cookie HMAC, `/api/pwa/auth/login` real, `/api/pwa/me`, `/api/pwa/auth/logout`
- Webhook unificado: Supabase + CAPI + Systeme en un solo POST

### PR #28 — fix: typed config errors + structured logs + /api/pwa/debug
- `signSession` tira `SessionSecretMissingError` en vez de Error genérico
- Login route mapea errores específicos a mensajes user-facing
- `/api/pwa/debug` reporta estado de cada env var sin leakear secrets

### PR #29 — fix: middleware bulletproof + dashboard real data + SW resilience
- Bug: `/pwa-sw.js` se redirigía a `/pwa/login` (matcher incorrecto)
- Fix: `pathRequiresPwaSession` excluye paths con extensión en el último segmento
- Dashboard ya no seedea 5 días falsos completados + 14 logs falsos
- SW: HEAD-check + kill switch + auto-unregister de SWs viejos en `/pwa/login`

### PR #30 — fix: remove fake-data seeding from /diario y /progreso
- Mismo bug pattern del dashboard pero replicado en otras páginas
- `/pwa/diario` ya no seedea 30 logs falsos al primer click
- `/pwa/progreso` ya no resetea progreso a "días 1-5 completados"
- El "+23% mejoría" ahora requiere 7 logs reales para mostrarse

### PR #31 (mergeado) — fix: real onboarding flow for first-time users
- Onboarding pasa de inalcanzable a obligatorio la primera vez
- 3 pasos: bienvenida → preferencias → tour
- Flag `pwa_onboarding_completed` en localStorage
- Login + Dashboard guards consultan la flag
- Se sacó el step "Tu diagnóstico" hardcoded

### Bugs cazados que NO existen más

- ❌ "María" hardcodeada en header / dashboard / onboarding
- ❌ Loop infinito "Verificando..." en login incógnito
- ❌ `/pwa-sw.js` → 302 redirect → SecurityError
- ❌ Dashboard mostraba "Día 6" para usuarios nuevos
- ❌ Tocar "Diario" o "Racha" reseteaba microbiota score
- ❌ Login a producción siempre iba al dashboard (saltándose onboarding)

---

## 9. Lo que falta — plan de lanzamiento

### 🔴 BLOQUEANTE para ads

```
[ ] 1. Compra real con cupón 100% OFF (test del webhook real end-to-end)
[ ] 2. Configurar Meta Pixel + CAPI + Test Events
[ ] 3. Verificación de dominio en Meta Business (meta tag en <head>)
```

### 🟡 Recomendado pre-launch

```
[ ] 4. Política de privacidad + Términos (página `/legal/privacidad` + `/legal/terminos`)
[ ] 5. SMTP propio (Resend) para emails transaccionales
```

### 🟢 Post-launch (después de las primeras ventas)

```
[ ] 6. Tabla `profiles` en Supabase con quiz_data, dietary_preferences,
       onboarding_completed (mover desde localStorage)
[ ] 7. Webhook Hotmart guarda nombre real del comprador en `profiles`
[ ] 8. Onboarding muestra tipo + severidad reales (vienen del quiz)
[ ] 9. Audiencias custom en Meta + retargeting (quiz starters, CTA viewers)
[ ] 10. Email post-compra automático (nurture sequence con Systeme)
[ ] 11. Eliminar /api/pwa/webhook/hotmart (proxy deprecated)
```

---

## 10. Próximos pasos concretos (sesión actual)

### 👤 Usuario hace (en orden)

#### Paso A — Compra real con cupón 100% OFF (15 min)

1. Hotmart → producto front → Cupones → `TESTLAUNCH` 100% OFF, 1 día, 5 usos
2. Incógnito en `/quiz`, completar, ir a `/resultados`, comprar con cupón
3. Aceptar el upsell con el mismo cupón
4. Verificar:
   - Vercel Functions logs muestran `[hotmart] PURCHASE_APPROVED`
   - Supabase: `select * from purchases where email = 'TUEMAILREAL'`
   - Login en `/pwa/login` con TU email → entra al onboarding → dashboard

#### Paso B — Cuenta Meta Business (10 min)

1. business.facebook.com → crear cuenta → asociar FB personal
2. Crear "Business Manager"

#### Paso C — Pixel (15 min)

1. Events Manager → Connect data sources → Web → Pixel
2. Nombre: "Hilvanapp Pixel"
3. URL: `https://chauhinchazon.hilvanapp.com`
4. **Anotar Pixel ID** (15-16 dígitos)
5. Instalación: "manual"

#### Paso D — Token CAPI (5 min)

1. Pixel → Settings → Conversions API → Generate Access Token
2. **Anotar token** (empieza con `EAAxxxxx`, solo se ve una vez)

#### Paso E — Verificación de dominio (5 min)

1. Business Manager → Brand Safety → Domains → Add → `hilvanapp.com`
2. Anotar el meta tag (formato: `<meta name="facebook-domain-verification" content="xxx" />`)
3. Solo el `content` value es lo que va a env var

### 👨‍💻 Agente hace en paralelo

1. **Auditoría tracking actual:**
   - Verificar que `app/layout.tsx` ya tiene cableado el Pixel script con `NEXT_PUBLIC_META_PIXEL_ID`
   - Confirmar eventos client-side: `PageView`, `ViewContent`, `InitiateCheckout`
   - Verificar que `lib/tracking.ts` (server-side) usa `event_id` para deduplication con CAPI
2. **Agregar verificación de dominio:**
   - Meta tag en `app/layout.tsx` con `NEXT_PUBLIC_META_DOMAIN_VERIFICATION`
3. **Cuando se reciben los IDs/tokens del usuario:**
   - PR con cualquier ajuste necesario (probablemente solo doc)
   - Lista exacta de env vars a pegar en Vercel

### Final del flow

Cuando ambos terminen:
1. Pegar 4 env vars en Vercel (NEXT_PUBLIC_META_PIXEL_ID, META_PIXEL_ID, META_CAPI_TOKEN, NEXT_PUBLIC_META_DOMAIN_VERIFICATION)
2. Redeploy
3. Meta Events Manager → Test Events → URL del sitio → ver eventos en tiempo real
4. Hacer otra compra de prueba con cupón → verificar Purchase event en Meta + dedup OK
5. **Listo para crear primera campaña en Ads Manager**

---

## 11. Convenciones del repo y del trabajo

- Idioma de comentarios y mensajes: **español rioplatense** (vos)
- Commits: convencionales (`fix:`, `feat:`, `docs:`)
- PRs: descriptivos, explican el "por qué" del cambio en el body
- **Nunca mergear directo a main:** siempre crear PR. El usuario es quien aprieta el botón verde.
- **Nunca pushear directo a main:** siempre branch + PR.
- Tras cada PR, el usuario verifica que GitHub trajo TODOS los commits (ya pasó dos veces que un PR mergeó solo el primer commit — sospecha: race condition entre el push del agente y el merge del usuario)
- Build pre-push: siempre `npx next build` para verificar TS antes de pushear
- Tools del sandbox: usar `mcp_sandbox_github_*` para git remote ops, NO `git push` directo

### Branding y palette

```
cream    #FAF7F2  (fondo principal)
cream-warm #F4EFE6
sage     #7A9B7E  (verde del logo, secciones positivas)
sage-soft #E8EFE9
sage-dark #5B8A60
coral    #E07856  (CTA principal, ofertas)
coral-soft #F5C7B6
charcoal #2D3A2E  (texto principal)
sand     #D4C5A9
```

Fonts:
- Serif (headings): Fraunces / Playfair Display / Georgia
- Sans (body): Inter / system-ui

---

## 12. Cosas raras a tener en cuenta

- **Vercel a veces hace squash merges raros:** ya pasó dos veces que un PR mergea solo el primer commit y deja los siguientes huérfanos. Verificar con `curl https://api.github.com/repos/drasticcurl/testfunnel/contents/<file>` si los cambios llegaron a main.

- **Test mode del PWA:** la env var `NEXT_PUBLIC_PWA_TEST_MODE=true` bypasea **todo** (guard, verificación de compras, etc.). Cuando está en `true` cualquiera con la URL entra gratis. Solo usar en staging/dev. **En prod tiene que estar `false` o desconfigurada.**

- **localStorage en incógnito:** Safari y Chrome incógnito mantienen localStorage **dentro de la sesión incógnito**. Cuando se cierran todas las ventanas incógnitas, el storage se borra. Esto puede crear confusión testeando: `pwa_onboarding_completed` puede sobrevivir entre clicks de la misma sesión incógnita pero no entre sesiones distintas.

- **Service worker viejo cacheado:** si un usuario visitó el sitio durante un deploy roto donde el SW redirigía, el browser cachea ese SW con redirect → SecurityError permanente. El fix preventivo está en `app/pwa/PwaServiceWorker.tsx` y `app/pwa/login/page.tsx` que desregistran SWs viejos automáticamente.

- **El revisor de Hotmart NO va a probar el webhook:** solo va a entrar a las URLs (página de venta + área de miembros) y ver que el contenido existe. Por eso se aprobó con TEST_MODE prendido.

- **Cookie HMAC vs Supabase Auth:** la PWA NO usa Supabase Auth para login (a pesar de que el package está instalado). Usa cookie HMAC propia. El template del email de magic link en Supabase es código muerto por ahora pero queda configurado por si migramos en el futuro.

---

## 13. Endpoints útiles para debug

```
GET  /api/pwa/debug         JSON con estado de env vars + ping a Supabase
GET  /api/hotmart-webhook   200 OK (para que Hotmart valide el endpoint)
GET  /api/pwa/me            { authenticated, email, nombre, testMode }
```

Si algo no funciona, primer reflejo: `curl https://chauhinchazon.hilvanapp.com/api/pwa/debug`.

---

## 14. Cuentas externas activas

| Servicio | URL | Uso |
|---|---|---|
| Hotmart | app.hotmart.com | Pagos, embudo, cupones |
| Vercel | vercel.com (proyecto: testfunnel) | Hosting + deployments |
| Cloudflare Registrar | cloudflare.com | Dominio hilvanapp.com + DNS |
| Supabase | supabase.com (proyecto ybuvotwvqhnprychzspb) | DB + Auth (no usado) |
| GitHub | github.com/drasticcurl/testfunnel | Código |
| Meta Business | business.facebook.com | **Pendiente de crear/configurar** |

---

Fin del snapshot.
