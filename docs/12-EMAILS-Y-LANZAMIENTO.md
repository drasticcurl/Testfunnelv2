# 12 — AGENTE EMAILS + LANZAMIENTO

> **Rol:** crear las secuencias de email en Systeme.io, configurar la campaña de Meta Ads, y dar luz verde al lanzamiento.

## Pre-requisitos

Antes de que arranques, el humano necesita tener:
- [ ] Frontend deployado (output 01–04)
- [ ] PDFs subidos a Hotmart (output 05, 06, 07)
- [ ] Hotmart 100% configurado (output 11)
- [ ] 3 creativos listos (output 08, 09, 10)
- [ ] Cuenta Systeme.io creada
- [ ] Cuenta Meta Ads Manager con método de pago verificado
- [ ] Pixel ID copiado a Vercel env vars
- [ ] Token de Conversions API creado y copiado

## Tu output

1. Lista en Systeme.io configurada
2. Tags y campos custom creados
3. Automation triggered por webhook
4. Secuencia A cargada (5 emails para no compradores)
5. Secuencia B cargada (3 emails para compradores)
6. Secuencia C cargada (1 email para compradores con upsell)
7. Campaña Meta CBO publicada con $30 USD/día

---

## Parte 1 — Email Sequences (Systeme.io)

### Setup inicial en Systeme.io

1. Crear lista: **"Quiz Anti-Hinchazón"**
2. Crear **custom fields** del contacto:
   - `tipo_hinchazon` (text)
   - `severidad` (number)
   - `severidad_cat` (text: alta/media/baja)
3. Crear **tags**:
   - `quiz_completado`
   - `tipo_1`, `tipo_2`, `tipo_3`, `tipo_4`
   - `severidad_alta`, `severidad_media`, `severidad_baja`
   - `comprador`, `no_comprador`
   - `bump_si`, `upsell1_si`, `upsell2_si`
   - `reembolsado`
4. Conseguir el **API Key** de Systeme.io y agregarlo a las env vars del proyecto Vercel: `SYSTEME_API_KEY`

### Trigger del workflow

El endpoint `/api/submit-quiz` (creado por agente 04) ya hace POST a la API de Systeme.io con email + tags. Vos solo configurás qué pasa cuando un contacto entra con el tag `quiz_completado`.

---

### SECUENCIA A — No compradores (5 emails en 7 días)

#### Email 1 — Inmediato (T+0)

**Asunto:** [Nombre], tu plan personalizado está listo 👇
**Preheader:** Te dejo los resultados de tu test acá

```
Hola [Nombre],

Acabás de hacer el test y te prometí tus resultados
personalizados. Acá los tenés:

→ Tu tipo: HINCHAZÓN [tipo personalizado]
→ Tu severidad: [score]/10
→ Tu plan recomendado: Protocolo Anti-Hinchazón 7 Días

Mirá el plan completo acá:
[BOTÓN: VER MI PLAN PERSONALIZADO]
[link a página de resultados con UTM y nombre]

Recordá: la oferta especial que viste expira en 24hs.
Después el precio vuelve a $19.90.

Cualquier duda, respondé este email — yo lo leo
personalmente.

[Autor]

PD: tu plan está pensado para arrancar mañana mismo.
Ingredientes accesibles, recetas de máximo 25 minutos.
Y tenés 30 días de garantía total — si no notás cambios, te devolvemos cada centavo.
```

#### Email 2 — Día 1 (T+24h)

**Asunto:** ¿Sabés qué le pasó a Carolina en 7 días?
**Preheader:** Caso real de una mujer de 42

```
Hola [Nombre],

Ayer te dejé el plan que diseñamos para tu tipo de hinchazón.
Hoy te quiero contar lo que le pasó a Carolina, una mujer
de 42 años de Buenos Aires que estaba EXACTAMENTE como vos.

Probó:
- Keto durante 4 meses
- Ayuno intermitente 16/8
- Té de boldo todas las noches
- Tres tipos diferentes de probióticos

Nada le funcionó.

Hasta que hizo este protocolo de 7 días.

Día 3: notó que la pesadez después del almuerzo desaparecía.
Día 5: la panza ya no se le marcaba a la noche.
Día 7: -6 cm de cintura. Y sin haber bajado un solo kilo
de peso.

Lo único que cambió fue qué alimentos eliminó. Los 12
inflamatorios "ocultos" que probablemente vos también
estás comiendo todos los días.

Mirá el plan completo acá:
[BOTÓN: QUIERO MIS RESULTADOS]

[Autor]
```

#### Email 3 — Día 2 (T+48h)

**Asunto:** Los 5 alimentos "saludables" que están inflamando tu panza
**Preheader:** Te apuesto que comés mínimo 3 todos los días

```
Hola [Nombre],

Te dejo un mini-tip de valor (sin pedirte nada a cambio).

Estos son 5 alimentos que la mayoría considera saludables
y que en realidad están inflamando tu intestino:

1. Yogur con frutas (los industriales tienen más azúcar
   que una golosina)
2. Wrap integral (la mayoría son harina blanca disfrazada
   con colorante)
3. Granola comercial (azúcar + aceites refinados)
4. Leche descremada (la lactosa sigue ahí, pero peor
   procesada)
5. Cereales "fitness" (mirá la lista de ingredientes la
   próxima vez que pases por el super)

Estos son SOLO 5 de los 12 que tenemos identificados en
el protocolo completo.

Si querés ver los 12 + el plan de 7 días para reemplazarlos,
acordate que tu oferta especial sigue activa unas horas más:

[BOTÓN: ACCEDER A MI PLAN]

[Autor]

PD: si ya no te interesa, ignorá este email. Pero si
estás leyendo hasta acá, algo dentro tuyo sabe que esa
hinchazón no es normal y querés solucionarla.
```

#### Email 4 — Día 4 (T+96h, último call)

**Asunto:** Última vez que ves este precio, [Nombre]
**Preheader:** Mañana sube a $19.90

```
[Nombre], esto es lo último que te escribo sobre
esta oferta.

Hace 4 días hiciste el test y dejaste tu email para
ver tus resultados. Yo te mostré el plan, te conté
casos reales, te di tips de valor.

Ahora, decidir es tu jugada.

El precio de $9.90 se mantiene hasta esta noche a
las 23:59. Mañana automáticamente vuelve a $19.90.

Si te interesa, este es el link directo:
[BOTÓN: SÍ, QUIERO MI PROTOCOLO POR $9.90]

Si no te interesa, está perfecto. Vas a seguir
recibiendo cada tanto algún email con tips útiles
de mi parte. Cero spam.

Lo que NO puedo hacer es seguir mandándote
recordatorios de algo que tal vez ya decidiste
no tomar.

Te abrazo,
[Autor]

PD: la decisión más cara no es comprar el plan.
Es seguir conviviendo otro mes más con esa
hinchazón que te hace sentir [emoción].
```

#### Email 5 — Día 7 (cierre real)

**Asunto:** Cierro la puerta hoy a las 23:59
**Preheader:** Después de esto, no insisto más

```
[Nombre],

Hoy a las 23:59 desactivo el link de la oferta
especial.

No es un truco de marketing. Mañana el sistema
literalmente sube el precio a $19.90 y yo dejo de
mandarte emails sobre este protocolo.

Si tu hinchazón ya no te molesta tanto, todo bien.
Tirá este email a la papelera.

Pero si seguís sintiendo esa pesadez después de
comer, esa frustración cuando te probás ropa, esa
incomodidad social cuando salís a cenar...

Acá tenés el último link:

[BOTÓN: ÚLTIMO ACCESO POR $9.90]

Después de las 23:59 no hay vuelta atrás al
precio original.

[Autor]
```

---

### SECUENCIA B — Compradores del front (sin upsell)

Trigger: tag `comprador` activado por webhook de Hotmart.

#### Email 1 — Inmediato

**Asunto:** ¡Tu Protocolo está acá, [Nombre]! 🎉

```
[Nombre], muchas gracias por confiar.

Acá tenés todos los accesos:

📕 Tu PDF: Protocolo Anti-Hinchazón 7 Días
[botón de descarga]

📊 Tu planilla: Diario de Síntomas
[link Google Sheets]

🎁 Si compraste el recetario:
[botón de descarga]

CÓMO EMPEZAR (3 min de lectura):

1. Descargá el PDF y leé las páginas 1 a 6
2. Hacé la lista de compras de la página 14
3. Mañana arrancás con el Día 1

¿Tenés dudas? Respondeme este email,
yo personalmente te leo.

[Autor]
```

#### Email 2 — Día 3

**Asunto:** ¿Cómo va tu día 3?

```
[Nombre], pasaron 3 días desde que arrancaste el
protocolo. ¿Cómo te estás sintiendo?

Si seguiste el plan al pie de la letra, ya tendrías
que estar notando:
- Menos pesadez después de comer
- Menos gases
- Más energía después del almuerzo

Si no notás nada todavía, mandame un mensaje y
revisamos juntos qué puede estar fallando.

Y si seguís encontrando esto útil, te quería
contar algo:

El 87% de las personas que hacen el plan de 7 días
me preguntan después: "¿Y ahora qué?"

Por eso creamos el Programa de 30 Días — la
extensión natural del protocolo. Te dejo el link
con descuento exclusivo de cliente:

[BOTÓN: VER PROGRAMA 30 DÍAS]

[Autor]
```

#### Email 3 — Día 7

**Asunto:** Hoy es Día 7. Lo lograste 🎉

```
[Nombre], hoy es tu último día del protocolo.
Felicitaciones por llegar hasta acá.

Por favor, dedicale 2 minutos a:
1. Llenar la última fila del Diario de Síntomas
2. Compararla con el Día 1
3. Mirarte al espejo y notar las diferencias

¿Qué pasa después del Día 7?

Tenés dos caminos:

→ Camino A: volver gradualmente a tu alimentación
  habitual.

→ Camino B: extender el protocolo a 30 días.

Si querés el camino B:

[BOTÓN: VER PROGRAMA 30 DÍAS]

Cualquier cosa, respondeme.

[Autor]

PD: si querés, mandame un testimonio corto. Si lo
publicamos en la web, te mando un descuento en
cualquiera de los próximos productos.
```

---

### SECUENCIA C — Compradores con upsell completo

Trigger: tags `comprador` + `upsell1_si`.

#### Email 1 — Inmediato

**Asunto:** Bienvenida al Programa Completo 🎉

```
[Nombre], gracias por confiar en serio.

Acabás de unirte al grupo de 30 días. Acá tenés
todos los accesos:

📕 PDF Plan 7 Días
📊 Planilla Diario Síntomas
📕 Recetario 25 recetas (si lo compraste)
📅 Plan completo Semanas 1, 2, 3, 4
🎙️ Audioguía diaria (30 audios)
📊 Calculadora de Microbiota
💊 Guía de Suplementación Natural
👥 Acceso a la comunidad privada de Telegram

Acá tenés el link de la comunidad:
[link Telegram]

[Autor]
```

---

### Reglas de bifurcación

```
Trigger: contacto creado con tag "quiz_completado"
   ↓
Iniciar SECUENCIA A (Email 1 inmediato)
   ↓
[espera 24h]
   ↓
¿Tag "comprador"?
   - SÍ → Cancelar Secuencia A, iniciar Secuencia B
   - NO → Continuar Secuencia A (Email 2)
   ↓
[espera 24h]
   ↓
¿Tag "comprador"?
   - SÍ → Cancelar A, iniciar B
   - NO → Continuar A (Email 3)
   ↓
... y así hasta Email 5
```

```
Trigger: tag "comprador" + "upsell1_si"
   ↓
Cancelar Secuencias A o B si están activas
   ↓
Iniciar Secuencia C
```

---

## Parte 2 — Lanzamiento de campaña Meta Ads

### Pre-requisitos antes de configurar la campaña

- [ ] Pixel ID copiado en Vercel env var `NEXT_PUBLIC_META_PIXEL_ID` y `META_PIXEL_ID`
- [ ] Token de Conversions API creado en Meta Events Manager y copiado en `META_CAPI_TOKEN`
- [ ] Eventos de prueba verificados en Events Manager (Lead, ViewContent, InitiateCheckout, Purchase)
- [ ] 3 creativos cargados en Meta Ads Manager (no en una campaña, solo en la biblioteca)

### Configuración de la campaña

#### 1. Crear campaña

- Tipo: **Sales** (Conversiones)
- Estructura: **CBO (Campaign Budget Optimization)**
- Nombre: `AH-CBO-LATAM-v1` (siglas: Anti-Hinchazón / CBO / LATAM / version 1)
- Presupuesto: **$30 USD/día** (CBO distribuye automáticamente)

#### 2. Crear AD SET único

- Nombre: `AH-broad-mujeres-30-55-AR`
- **Audiencia:**
  - Ubicaciones: Argentina
  - Edad: 30–55
  - Género: Mujeres
  - Idioma: Español
  - **Sin intereses específicos** (público broad)
- **Posiciones:**
  - Reels (Facebook + Instagram)
  - Stories (Instagram + Facebook)
  - Feed (Instagram + Facebook)
  - Sin Audience Network
- **Optimización:**
  - Conversion event: **InitiateCheckout** (no Purchase, hasta tener data)
  - Performance goal: Maximize conversions
  - Cost cap: dejar vacío (que el algoritmo aprenda)

#### 3. Crear 3 ADS dentro del adset

| Ad | Creativo | Headline | Primary text |
|---|---|---|---|
| Ad 1 | `creativo-1-curiosidad.mp4` | Test: descubrí tu tipo de hinchazón | "Existen 4 tipos de hinchazón. ¿Sabés cuál tenés? Hacé este test rápido y descubrí cuál te está afectando." |
| Ad 2 | `creativo-2-disrupcion.mp4` | No es grasa, es inflamación | "Si tu panza está plana a la mañana e hinchada a la noche, no es grasa. Te explico qué es y cómo se va en 7 días." |
| Ad 3 | `creativo-3-frustracion.mp4` | Probé todo y nada me funcionó | "Hasta que descubrí que el problema no era lo que comía de más. Era lo que NO sacaba. Mirá el test." |

Para los 3 ads:
- **Destination:** Website
- **URL:** `https://[tu-dominio]/?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}&fbclid={{fbclid}}`
- **CTA button:** "Learn More" o "Sign Up"

#### 4. Verificación pre-publish

- [ ] Pixel está activo y trackea PageView en `/`
- [ ] Conversions API recibe eventos (Test Events)
- [ ] Los 3 creativos cargados sin errores
- [ ] UTMs configurados con macros
- [ ] Audiencia broad sin intereses
- [ ] Presupuesto: $30/día
- [ ] Optimización: InitiateCheckout

#### 5. PUBLISH

Click en Publish. La campaña entra en revisión por Meta (suele tardar 15 min a 2 horas).

### Día 0+ — qué hacer

**Las primeras 72 horas:**

- ❌ NO pausar nada
- ❌ NO cambiar el presupuesto
- ❌ NO duplicar adsets
- ❌ NO matar creativos prematuramente
- ✅ Solo verificar que los eventos están llegando al pixel y CAPI
- ✅ Solo validar que las ventas que llegan son trackeadas correctamente

### Día 3 — primera decisión

Ver `_METRICAS.md` sección "Decisiones a las 72hs según ROAS" para diagnóstico.

| ROAS | Acción |
|---|---|
| >2.0 | Escalar 30% cada 48hs. Producir 3 variantes del creativo ganador. |
| 1.5–2.0 | Mantener presupuesto. Optimizar el cuello de botella. |
| 1.0–1.5 | Identificar creativo perdedor. Mantener los 2 mejores. |
| <1.0 | Hacer 3 nuevos ángulos creativos. |

---

## Parte 3 — Última verificación end-to-end

Antes de irse a dormir, pasar este test completo:

- [ ] Click en uno de los ads en Meta (preview) → llega a `/`
- [ ] Click en "Empezar el test" → entra a `/quiz`
- [ ] Completar las 10 preguntas
- [ ] Email capture funciona
- [ ] Pantalla de loading dura 4 segundos
- [ ] Llega a `/resultados` con personalización correcta
- [ ] El copy refleja las respuestas dadas
- [ ] Click en CTA → llega a Hotmart con UTMs
- [ ] Hacer compra real (con tu tarjeta o cupón 100% OFF)
- [ ] Verificar que el order bump aparece
- [ ] Verificar que el upsell aparece después del pago
- [ ] Llega el email de bienvenida de Hotmart con los archivos
- [ ] **En Meta Events Manager → Test Events:**
  - PageView ✓
  - QuizStart ✓
  - QuizComplete ✓
  - Lead ✓
  - ViewContent ✓
  - InitiateCheckout ✓
  - Purchase ✓ (vía postback)
- [ ] **En Systeme.io:**
  - Aparece el contacto con tag `quiz_completado` + `tipo_X` + `severidad_X`
  - Después de comprar: tag `comprador` se agrega automáticamente
  - Email 1 de Secuencia B se dispara
- [ ] Mobile: probá todo desde un celular

## Si algo falla

| Problema | Diagnóstico |
|---|---|
| Pixel no dispara | Revisar Network tab, ver si `connect.facebook.net/en_US/fbevents.js` carga |
| CAPI no recibe | Revisar logs de Vercel (`/api/track`) |
| Postback no llega | Hotmart → enviar evento de prueba, ver logs en Vercel `/api/hotmart-webhook` |
| Email no llega | Revisar API key de Systeme, revisar logs de `/api/submit-quiz` |
| Quiz se rompe | Revisar consola del navegador en `/quiz` |
| Resultados sin personalización | Revisar URL params en `/resultados`, ver si llegan |

---

## Output del agente 12

- [ ] Lista en Systeme.io creada
- [ ] Tags y custom fields configurados
- [ ] Secuencia A (5 emails) cargada y conectada al webhook
- [ ] Secuencia B (3 emails) cargada
- [ ] Secuencia C (1 email) cargada
- [ ] Reglas de bifurcación configuradas (no_comprador → A, comprador → B, comprador+upsell → C)
- [ ] Campaña Meta CBO creada con 3 ads y $30/día
- [ ] Pixel + CAPI funcionando
- [ ] Test end-to-end completo pasado
- [ ] PUBLISH

## Checklist agente 12

- [ ] Lista Systeme.io: ✅
- [ ] Tags creados: ✅
- [ ] Custom fields creados: ✅
- [ ] Secuencia A (5 emails) cargada: ✅
- [ ] Secuencia B (3 emails) cargada: ✅
- [ ] Secuencia C (1 email) cargada: ✅
- [ ] Bifurcaciones configuradas: ✅
- [ ] Test: enviar email de prueba a tu propio mail desde Systeme: ✅
- [ ] Pixel ID en env vars: ✅
- [ ] CAPI token en env vars: ✅
- [ ] 3 creativos en biblioteca de Meta: ✅
- [ ] Campaña creada con CBO $30/día: ✅
- [ ] Adset broad mujeres 30–55 Argentina: ✅
- [ ] 3 ads con UTMs configurados: ✅
- [ ] Test end-to-end completo: ✅
- [ ] PUBLISH ✅
