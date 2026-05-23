# Setup completo — De cero a producción

> Todo lo que necesitás crear, configurar y deployar para que el funnel funcione de verdad. Ordenado por urgencia.

---

## Estado actual de tu proyecto

✅ **Lo que YA tenés:**
- Código del funnel funcionando (landing + quiz + resultados)
- PWA con plan, recetas, diario, calculadora
- Test mode operativo (sin Supabase, todo en localStorage)
- Webhooks de Hotmart estructurados
- Tracking client + server (Pixel + CAPI)
- Integración con Systeme.io

❌ **Lo que TE FALTA (orden de prioridad):**
1. Cuenta + producto en **Hotmart**
2. **Pixel de Meta + CAPI Token**
3. **Vercel** deploy (probablemente ya tenés, sino es gratis)
4. **Supabase** (cuando salgas de test mode)
5. **Systeme.io** (para automatización de emails)
6. **Make.com** (opcional, para webhooks adicionales)
7. **Dominio custom** (~$10/año)
8. **VAPID keys** (push notifications, gratis)
9. **ElevenLabs** (audios IA, opcional)

Total mínimo para arrancar a vender: **~$20-30/mes** + tu inversión en ads.

---

## 1. Hotmart (PRIORIDAD MÁXIMA)

Hotmart es donde se procesa el pago, se entrega el producto y desde donde sale el webhook que activa el resto.

### 1.1 Crear cuenta

1. Andá a [hotmart.com](https://hotmart.com).
2. Click en **Soy Productor** → registrate.
3. Te van a pedir:
   - DNI / CUIT (validan)
   - Datos bancarios (CBU para cobrar)
   - Validación de identidad (selfie + foto del DNI)

**Tiempo de aprobación:** 1-7 días. **Hacelo YA**, no esperes a tener todo lo demás.

### 1.2 Crear los 3 productos

Dentro del panel de Hotmart, vas a crear tres productos separados:

#### Producto 1: Front (Protocolo Anti-Hinchazón 7 Días)

- **Tipo:** Producto digital
- **Categoría:** Salud y bienestar
- **Precio:** $14.90 USD (después del cambio del agente 22)
- **Período de garantía:** 30 días (después del agente 23)
- **Material de entrega:** un PDF placeholder por ahora (después lo reemplazás por la URL de la PWA)
- **Página de ventas externa:** la URL de tu Vercel `/resultados` (después del deploy)

#### Producto 2: Upsell (Programa 30 Días)

- **Precio:** $9.90 USD
- **Configurar como Upsell post-compra del producto 1**
- **Garantía:** 30 días

#### ~~Producto 3: ELIMINADO (era Order Bump)~~

> Se eliminó el Order Bump para simplificar el funnel LATAM. Solo quedan 2 productos en Hotmart.

### 1.3 Configurar webhooks

Dentro de cada producto, ir a **Configuración → Webhooks (Postback)**:

- **URL:** `https://TU-DOMINIO.vercel.app/api/pwa/webhook/hotmart`
- **Eventos a suscribir:**
  - PURCHASE_APPROVED
  - PURCHASE_COMPLETE
  - PURCHASE_REFUNDED
  - CHARGEBACK
- **Generar Hottok** (token de seguridad) y guardarlo.

### 1.4 Datos a copiar a tus env vars

```env
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=https://pay.hotmart.com/[TU_CODIGO]
HOTMART_HOTTOK=[el token que generaste]
HOTMART_PRODUCT_ID_FRONT=[ID numérico del producto 1]
HOTMART_PRODUCT_ID_UPSELL=[ID numérico del producto 2]
```

### 1.5 Costos

- Hotmart cobra ~10% de comisión por venta (varía por país y producto).
- No tiene fee mensual.
- Liquidación a tu CBU en ~30 días.

---

## 2. Meta Pixel + Conversions API (CAPI)

Sin esto, el algoritmo de Meta no aprende y tus ads van a ciegas.

### 2.1 Crear el Pixel

1. Andá a [business.facebook.com](https://business.facebook.com).
2. Crear cuenta de Business si no tenés. **Importante:** una cuenta personal NO sirve para producción seria, te bloquean.
3. Ir a **Configuración → Orígenes de datos → Píxeles**.
4. Click en **Agregar** → poné nombre "Anti-Hinchazón Pixel".
5. Copiar el **ID del Pixel** (15-16 dígitos).

### 2.2 Generar CAPI Access Token

1. Mismo Pixel → tab **Configuración**.
2. Sección **API de Conversiones** → **Generar token de acceso**.
3. Copiar el token (es largo, tipo `EAAxx...`).

### 2.3 Datos a copiar

```env
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
META_PIXEL_ID=1234567890123456
META_CAPI_TOKEN=EAAxxx...
```

### 2.4 Validar que funciona

Una vez que esté deployado:
1. Ir a **Events Manager → Test Events**.
2. Generar un test event code.
3. Visitar tu landing → hacer el quiz → llegar a /resultados.
4. Deberías ver eventos `QuizStart`, `QuizProgress`, `Lead`, `ViewContent` en tiempo real.

### 2.5 Costos

Gratis. Solo pagás los ads.

---

## 3. Vercel (Hosting del frontend)

### 3.1 Crear cuenta y conectar GitHub

1. Ir a [vercel.com](https://vercel.com).
2. Sign up con GitHub.
3. **Import Project** → seleccionar tu repo `drasticcurl/testfunnel`.
4. Vercel detecta Next.js automáticamente.
5. **Deploy**.

### 3.2 Variables de entorno

En el dashboard del proyecto en Vercel: **Settings → Environment Variables**.

Agregá todas las que tenés a mano. Mínimo para arrancar:

```
NEXT_PUBLIC_META_PIXEL_ID=...
META_PIXEL_ID=...
META_CAPI_TOKEN=...
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=...
HOTMART_HOTTOK=...
NEXT_PUBLIC_APP_URL=https://tu-deploy.vercel.app
```

### 3.3 Plan recomendado

- **Hobby (gratis):** 100GB bandwidth/mes. Suficiente para arrancar y testear.
- **Pro ($20/mes):** cuando empieces a tener tráfico de ads sostenido (>10k visits/mes), upgrade.

### 3.4 Dominio custom

- Vercel te da `tu-proyecto.vercel.app` gratis.
- Para un dominio propio:
  - Comprar en Namecheap/GoDaddy (~$10/año `.com`).
  - En Vercel **Settings → Domains** → agregar tu dominio.
  - Configurar DNS según las instrucciones.

**Recomendado:** comprá un dominio antes de lanzar ads. Un `.vercel.app` reduce confianza y conversión.

---

## 4. Supabase (cuando dejes test mode)

Hoy tu PWA funciona sin Supabase usando localStorage. Eso está bien para validar la oferta. Pero para tener:
- Acceso real entre dispositivos
- Magic link login real
- Tracking de quién compró qué

...vas a necesitar Supabase.

### 4.1 Crear proyecto

1. Ir a [supabase.com](https://supabase.com) y registrate.
2. **New Project**.
3. Elegir región: **South America (São Paulo)** para mejor latencia desde Argentina.
4. Generar password fuerte para la DB → guardalo.
5. Esperar 2-3 minutos a que se inicialice.

### 4.2 Correr migración SQL

Tu repo tiene el schema definido en `docs/_PWA-PLAN.md`. En Supabase:

1. **SQL Editor** (icono de la izquierda).
2. **New Query**.
3. Pegá el SQL del schema (usuarios, purchases, etc.).
4. **Run**.

### 4.3 Copiar credenciales

**Settings → API** del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJyyy...
```

**Importante:** la `SERVICE_ROLE_KEY` es de admin, NO la pongas en variables `NEXT_PUBLIC_*`.

### 4.4 Costos

- **Free tier:** 500MB DB, 50k usuarios activos/mes, 5GB bandwidth. **Suficiente para los primeros 6 meses.**
- **Pro ($25/mes):** cuando crezca, upgrade.

### 4.5 Migración del test mode

Una vez que metés las env vars, `isTestMode()` automáticamente devuelve `false` y la PWA empieza a usar Supabase. NO requiere cambios en código.

---

## 5. Systeme.io (Email automation)

Esto manda los emails post-quiz (a no compradores) y post-compra (a compradores).

### 5.1 Crear cuenta

1. [systeme.io](https://systeme.io) → **Free plan** (sin tarjeta).
2. Confirmá email.

### 5.2 Generar API key

**Configuración → API Keys** → generar key.

```env
SYSTEME_API_KEY=...
```

### 5.3 Crear tags base

En **Contactos → Tags**, creá:
- `quiz_completado`
- `tipo_1`, `tipo_2`, `tipo_3`, `tipo_4`
- `severidad_baja`, `severidad_media`, `severidad_alta`
- `no_comprador`
- `comprador`
- `reembolsado`
- `chargeback`

Tu código en `/api/submit-quiz` y `/api/hotmart-webhook` ya aplica estos tags automáticamente.

### 5.4 Crear secuencias de email

Esto es trabajo manual de copy. Sugerencia mínima para arrancar:

**Secuencia "no comprador" (4 emails):**
- Email 1 (1 hora): "Tu diagnóstico personalizado" + link a /resultados
- Email 2 (24 hs): "Carolina lo logró en 7 días" (testimonio)
- Email 3 (3 días): "¿Tenés dudas? Estas son las más frecuentes"
- Email 4 (5 días): "Última oportunidad — descuento por 24 hs" (descuento opcional)

**Secuencia "comprador" (3 emails):**
- Email 1 (5 min): "Bienvenida + link a la app"
- Email 2 (24 hs): "Tu Día 1 ya está listo"
- Email 3 (7 días): "¿Cómo te fue esta semana?" + invitación al upsell

### 5.5 Costos

- Free: hasta 2.000 contactos. Suficiente para validar.
- Startup ($27/mes): hasta 5.000.
- Mientras estés en validación → free.

---

## 6. Make.com (opcional)

Útil si querés agregar webhooks sin escribir código. Ej: cuando alguien completa el quiz, mandar a Google Sheets.

### 6.1 Crear cuenta

[make.com](https://make.com) → free 1.000 ops/mes.

### 6.2 Webhook URL

Crear escenario:
- Trigger: **Webhooks → Custom webhook** → copiar URL.

```env
QUIZ_WEBHOOK_URL=https://hook.us1.make.com/xxxxx
```

Tu código ya forwardea cada quiz completado a esta URL.

### 6.3 Casos de uso

- Trigger compra → agregar a Google Sheet de tracking
- Trigger compra → mandar mensaje a tu Slack/Discord
- Trigger compra → crear factura

Si no usás esto, simplemente no setees la env var y el código lo skipea silently.

---

## 7. WhatsApp follow-up (opcional, para v2)

El curso recomienda WhatsApp en LATAM. Esto NO está implementado en tu código aún. Si querés sumarlo:

### 7.1 Opciones

- **Z-API.io:** ~$15/mes. Más simple, no requiere aprobación de Meta.
- **WhatsApp Business API oficial:** gratis (1k mensajes/mes), pero requiere aprobación, número dedicado, ~1 semana de setup.
- **Manychat:** $15/mes, integración fácil con Make.com.

### 7.2 Implementación

Esto es trabajo de un agente futuro (no incluido en la fase 2). Si lo querés, abrí ticket aparte.

---

## 8. VAPID keys (para push notifications)

Necesario solo si vas a implementar el Agente 24 (PWA Enhancements).

### 8.1 Generar

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

### 8.2 Env vars

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFt...
VAPID_PRIVATE_KEY=abc...
VAPID_SUBJECT=mailto:soporte@tu-dominio.com
SCHEDULER_SECRET=algun-string-fuerte
```

### 8.3 Costos

Gratis.

---

## 9. ElevenLabs (audios IA, opcional)

Si vas a implementar el "Audio del experto" en /resultados (no incluido en fase 2 por decisión tuya, pero por las dudas):

- [elevenlabs.io](https://elevenlabs.io) → Starter $5/mes.
- 30k caracteres/mes suficiente para varios audios.
- Voz recomendada: **María** o **Sofía** (femeninas, español neutro).

---

## 10. Email de soporte

Para cumplir la garantía de 30 días, necesitás un email operativo.

### Opciones baratas:

- **Google Workspace:** $6/mes/usuario. `soporte@tu-dominio.com`. Mejor si tenés dominio.
- **Zoho Mail:** plan gratis con dominio propio. Más limitado.
- **Forwarding gratis (CloudFlare/Vercel):** redirige `soporte@tu-dominio.com` → tu Gmail personal. Perfecto para arrancar.

**Recomendación:** CloudFlare Email Routing → forwarding gratis. Si después escalás, migrá a Workspace.

---

## Resumen de costos mensuales

### Tier 0 (validación, primer mes)

| Servicio | Costo |
|---|---|
| Hotmart | 10% por venta (no fee fijo) |
| Vercel Hobby | $0 |
| Supabase Free | $0 |
| Systeme.io Free | $0 |
| Meta Ads | depende presupuesto que pongas |
| Dominio | ~$1/mes (anual ~$10) |
| Email forwarding | $0 |
| **Total fijo** | **~$1/mes + ads** |

Mínimo razonable de ads para validar: **$300 USD el primer mes** ($10/día).

### Tier 1 (cuando empezás a vender)

| Servicio | Costo |
|---|---|
| Tier 0 | $1 |
| Make.com Free | $0 |
| ElevenLabs Starter | $5 |
| **Total** | **~$6/mes + ads** |

### Tier 2 (cuando estás escalando, > $1k facturación/mes)

| Servicio | Costo |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Systeme.io Startup | $27 |
| Z-API WhatsApp | $15 |
| Google Workspace | $6 |
| ElevenLabs Creator | $22 |
| Dominio | $1 |
| **Total** | **~$116/mes + ads** |

---

## Checklist de pre-lanzamiento

Antes de prender los primeros ads, asegurate de tener TODO esto:

### Infraestructura
- [ ] Cuenta de Hotmart aprobada y verificada
- [ ] Los 2 productos creados (front, upsell)
- [ ] Webhooks de Hotmart apuntando a tu URL de Vercel
- [ ] Pixel de Meta creado + CAPI token generado
- [ ] Vercel deployado con env vars producción
- [ ] Dominio custom apuntando a Vercel
- [ ] Email de soporte funcionando

### Código
- [ ] Build pasa sin errores
- [ ] Lint pasa
- [ ] Modo test deshabilitado (env vars de Supabase setteadas si las usás)
- [ ] Todas las env vars de Hotmart, Meta, Systeme setteadas

### Validación end-to-end
- [ ] Visitar landing → click → quiz → completar → /resultados → ver datos personalizados
- [ ] Click checkout → llegar a Hotmart con precio correcto
- [ ] Hacer compra de prueba (Hotmart tiene modo sandbox o usar tarjeta real y pedir reembolso después)
- [ ] Recibir webhook → ver en logs de Vercel que se procesó
- [ ] Recibir email de Systeme.io con bienvenida
- [ ] Acceder a /pwa/login con el email de la compra → entrar al dashboard
- [ ] Dashboard muestra datos del usuario
- [ ] PWA es instalable en celular

### Tracking
- [ ] Test Events de Meta muestra eventos en tiempo real
- [ ] UTMs llegan al checkout (verificable en URL de Hotmart)
- [ ] Cookies fbc/fbp se forwardean a CAPI

### Ads
- [ ] 9-15 creativos diferentes preparados
- [ ] Campaña CBO armada con 3 conjuntos
- [ ] Presupuesto diario seteado ($30/día arranque)
- [ ] Píxel asociado a la campaña
- [ ] Eventos de conversión configurados (Lead + Purchase)

---

## Stack final recomendado

Para minimizar costos al máximo durante validación:

```
[Meta Ads] → [Vercel Hobby] → [Hotmart 10%] → [Systeme.io Free] → [Supabase Free]
```

Costo mensual fijo: **~$1** (solo el dominio).

Una vez que validás (>$500 facturado/mes):

```
[Meta Ads] → [Vercel Pro] → [Hotmart 10%] → [Systeme.io Startup] → [Supabase Pro]
                                                                  → [Z-API WhatsApp]
                                                                  → [ElevenLabs]
```

Costo mensual fijo: **~$100**.

---

## Orden cronológico recomendado

### Semana 1
- Día 1: Aplicar a Hotmart (la aprobación tarda)
- Día 2-3: Crear Pixel de Meta + Business Manager
- Día 3-5: Implementar agentes 13, 15, 16, 17 (foundational + tracking + docs)
- Día 6-7: Comprar dominio + setup Vercel con env vars

### Semana 2
- Implementar agentes 14, 19, 20, 21 (dashboard + variantes A/B)
- Implementar agente 22 (precio) y 23 (garantía)
- Setup Hotmart productos
- Setup Systeme.io tags + secuencias

### Semana 3
- Implementar agentes 24 + 18 (PWA enhancements + steering)
- Pre-lanzamiento checklist completo
- Generar 9-15 creativos para los ads
- Test end-to-end completo

### Semana 4
- Lanzar campaña CBO con $30/día
- Monitorear el dashboard /admin/funnel
- Dejar correr 3-7 días sin tocar nada
- Iterar según datos

---

## Preguntas frecuentes

**¿Necesito CUIT/empresa para vender en Hotmart?**
No al principio. Con DNI/persona física podés. Cuando facturés más de cierto monto, conviene una SAS o monotributo.

**¿Hotmart cobra en USD o ARS?**
En Argentina podés cobrar en USD MEP o transferir a CBU en ARS al cambio del día.

**¿Cuánto tarda en aprobarse un producto en Hotmart?**
1-3 días hábiles. La revisión es manual.

**¿Necesito una página de términos / privacidad?**
Sí, eventualmente. Para Meta es requerimiento si vas a hacer ads de "Salud y bienestar". Podés generar uno con [TermsFeed](https://termsfeed.com) gratis.

**¿Puedo usar mi cuenta personal de Facebook para los ads?**
Te conviene crear un Business Manager separado. Si te bloquean la cuenta personal, perdés todo.

**¿Cómo testeo sin gastar plata real?**
- Usá modo test del código (sin env vars de Hotmart) → todo lo dummy.
- Para validar Meta Pixel: Test Events del Events Manager.
- Para validar webhooks: ngrok local + Hotmart Sandbox.

---

Listo. Cualquier duda específica de algún servicio, abrí un chat aparte y profundizamos.
