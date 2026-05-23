# 11 — AGENTE HOTMART SETUP

> **Rol:** guiar al humano paso a paso para configurar Hotmart: 2 productos, checkout, upsell, postback, email de entrega.
> **Actualizado:** Mayo 2026 — estructura simplificada para LATAM (sin bump, sin downsell, sin upsell 2).

## Pre-requisitos

Antes de que arranques, necesitás tener:
- [ ] Cuenta Hotmart como **Productor** aprobada
- [ ] DNI/CUIT cargado en el panel de Hotmart
- [ ] Datos bancarios completos (CBU para cobrar)
- [ ] El frontend deployado en Vercel (para tener la URL del webhook)
- [ ] Acceso a las env vars de Vercel (para pegar la URL de checkout y el hottok)

## Productos a crear (en este orden)

| # | Producto | Precio | Tipo | Notas |
|---|---|---|---|---|
| 1 | Protocolo Anti-Hinchazón 7 Días | $14.90 USD | Principal (Front end) | Checkout con redirect directo |
| 2 | Programa Anti-Hinchazón 30 Días | $9.90 USD | Upsell post-compra | Aparece después de pagar el 1 |

**NO crear:** Order Bump, Downsell, ni Upsell 2. La estructura es intencionalmente simple.

---

## Paso 1 — Crear el Producto Principal ($14.90)

1. Hotmart → Productos → **Registrar producto** → Producto digital
2. **Datos básicos:**
   - Nombre: `Protocolo Anti-Hinchazón: Plan de 7 Días`
   - Categoría: Salud y bienestar
   - Idioma: Español
   - Descripción corta (máx 140 caracteres):
     `Plan interactivo de 7 días para desinflamar tu abdomen. App personalizada con recetas, diario de síntomas y seguimiento día a día.`
   - Descripción larga: copiar los bullets del value stack de `docs/_PRODUCT-DATA.md`
3. **Imagen del producto:** mockup de la app o del plan (lo hace el humano en Canva)
4. **Precios:**
   - Precio principal: **$14.90 USD**
   - Habilitar pago en moneda local (Hotmart hace conversión automática)
5. **Archivos a entregar:**
   - Opción A (si la PWA está lista): poner la URL de la PWA como "Página de miembros externa"
   - Opción B (si todavía no): subir un PDF placeholder con instrucciones de acceso
6. **Página de ventas externa:** poner la URL del Vercel + `/resultados`
   - Ejemplo: `https://tu-dominio.vercel.app/resultados`
7. Guardar y publicar

**ANOTAR:** la **URL de checkout** que te da Hotmart. Tiene esta forma:
```
https://pay.hotmart.com/XXXXXXXXX
```

Esta URL va a las env vars de Vercel como:
```
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=https://pay.hotmart.com/XXXXXXXXX
```

---

## Paso 2 — Crear el Upsell ($9.90)

1. Productos → **Registrar producto** → Producto digital
2. **Datos:**
   - Nombre: `Programa Anti-Hinchazón 30 Días Completo`
   - Precio: **$9.90 USD**
   - Categoría: Salud y bienestar
3. **Archivos a entregar:**
   - Mismo que el front: acceso a la PWA (el webhook desbloquea las features de 30 días automáticamente)
4. **Configurar como Upsell Post-Compra:**
   - Ir a "Estrategia de venta" → **Embudo de Ventas** (o "Sales Funnel")
   - Agregar como paso posterior a la compra de "Protocolo Anti-Hinchazón"
   - Activar **One-click upsell** (el comprador NO tiene que poner la tarjeta de nuevo)
5. **Página de upsell** (en el editor visual de Hotmart):

### Copy para la página de upsell:

```
HEADLINE:
"Esperá [Nombre]… ¿Querés multiplicar tus resultados?"

SUBHEADLINE:
"Sumá las 4 semanas completas por solo $9.90 más"

CUERPO:
Tu protocolo de 7 días es un excelente comienzo.
Pero si querés resultados permanentes, necesitás las 4 semanas completas:

✓ Semana 1: Limpieza (la que ya tenés)
✓ Semana 2: Reincorporación inteligente de alimentos
✓ Semana 3: Optimización de tu microbiota
✓ Semana 4: Mantenimiento de por vida

Además sumás:
• 30 recetas adicionales
• Guía de suplementación natural
• Test de tolerancia personalizado
• Shopping list para las 4 semanas

ANCLA DE PRECIO:
Valor normal: $37
Hoy, solo por haber comprado el protocolo: $9.90

BOTÓN PRINCIPAL:
"SÍ, SUMAR EL PROGRAMA COMPLETO POR $9.90"

LINK CHICO (rechazar):
"No gracias, continuar solo con mis 7 días"

GARANTÍA:
Misma garantía de 30 días. Si no te sirve, te devolvemos todo.
```

---

## Paso 3 — Configurar Garantía de 30 días (CRÍTICO)

> Si el funnel promete "30 días de garantía" pero Hotmart está en "7 días" (default), el comprador va a tener problemas. Esto es obligatorio.

Hacelo en **ambos productos:**

1. Hotmart → Productos → seleccionar producto
2. **Editar** → tab **Configuración** (o "General" / "Política de devolución")
3. Buscar **Período de devolución** / `Refund period`
4. Cambiarlo a **30 días**
5. **Guardar**
6. Repetir en el otro producto

**Verificación:** abrí el checkout en incógnito. En el footer debe decir "30 días de garantía".

---

## Paso 4 — Personalizar el Checkout

1. Settings del producto principal → Personalización del checkout
2. **Logo de la marca** (subir)
3. **Colores:**
   - Primario (botón): `#E07856` (coral)
   - Secundario: `#7A9B7E` (sage)
4. **Activar:**
   - ✅ Mostrar garantía de 30 días
   - ✅ Sello de seguridad
   - ✅ Timer de oferta limitada (Hotmart tiene función nativa — opcional)
5. **Texto del checkout:**
   - Headline: "¡Casi listo! Confirmá tu pedido"
   - Sub: "Recibís acceso en tu email en menos de 60 segundos"
   - Botón final: "PAGAR Y RECIBIR MI PROTOCOLO"

---

## Paso 5 — Configurar el Email de Entrega

1. Settings del producto → Email de entrega
2. Customizar:

```
Asunto: ¡Tu Protocolo Anti-Hinchazón ya está listo, [Nombre]!

Hola [Nombre],

¡Felicitaciones! Acabás de dar el primer paso para
desinflamarte de forma natural.

📱 Tu acceso a la app:
[link a la PWA / o instrucciones de acceso]

Entrás con tu email, sin contraseña. En 30 segundos
ya tenés todo disponible en tu celular.

¿Qué hacer ahora?
1. Abrí el link de arriba desde tu celular
2. Ingresá el email con el que compraste
3. Seguí el Día 1 del plan

Cualquier duda, respondeme este email.

Te abrazo,
[autor]

---
Anti-Hinchazón · [URL del sitio]
```

---

## Paso 6 — Configurar el Postback/Webhook (CRÍTICO)

Sin esto, el sistema no sabe quién compró y no puede dar acceso a la PWA.

1. Settings → Postback (o Webhooks) → **Activar**
2. **URL del postback:**
   ```
   https://[tu-dominio].vercel.app/api/hotmart-webhook
   ```
3. **Eventos a enviar:**
   - ✅ `PURCHASE_APPROVED`
   - ✅ `PURCHASE_COMPLETE`
   - ✅ `PURCHASE_REFUNDED`
   - ✅ `CHARGEBACK`
4. **Generar Hottok** (token de seguridad) → copiarlo
5. Guardar

**El Hottok va a las env vars de Vercel como:**
```
HOTMART_HOTTOK=[el token que generaste]
```

**Test:** Hotmart tiene un botón "Enviar evento de prueba". Usalo y verificá en los logs de Vercel (Functions → `/api/hotmart-webhook`) que llega correctamente.

---

## Paso 7 — Env vars que salen de este proceso

Al terminar, tenés que tener estas 3 env vars configuradas en Vercel:

```env
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=https://pay.hotmart.com/XXXXXXXXX
HOTMART_HOTTOK=tu_hottok_secreto
HOTMART_PRODUCT_ID_FRONT=[ID numérico del producto 1]
HOTMART_PRODUCT_ID_UPSELL=[ID numérico del producto 2]
```

**¿Dónde encuentro los IDs numéricos?**
- En Hotmart → Productos → click en el producto → la URL del browser tiene el ID
- O en Settings del producto → "ID del producto"

---

## Paso 8 — Test end-to-end (OBLIGATORIO antes de lanzar ads)

Hacé una compra real (con tu tarjeta o con cupón 100% OFF) para validar:

- [ ] El checkout se ve bien (logo, colores, copy, garantía visible)
- [ ] Después del pago aparece la página de upsell de $9.90
- [ ] Si aceptás el upsell, se cobra correctamente
- [ ] Si rechazás el upsell, llegás al thank you sin problemas
- [ ] Llega el email de entrega con los accesos correctos
- [ ] El postback dispara el webhook (verificar en logs de Vercel)
- [ ] En Meta Events Manager → el evento Purchase aparece (si el Pixel está configurado)
- [ ] Si tenés Supabase: aparece una fila en la tabla `purchases` con el email + product_id

**Tip:** Si no querés gastar plata real, creá un cupón de 100% de descuento en Hotmart (Settings → Cupones) y usalo para la compra de prueba.

---

## Cómo funciona el flujo de pago (para que entiendas)

```
[Usuario en /resultados clickea "QUIERO MI PROTOCOLO POR $14.90"]
   ↓
[Redirect a https://pay.hotmart.com/XXXXXXXXX?utm_source=quiz&...]
   ↓
[Hotmart checkout — paga con tarjeta/Mercado Pago/PayPal]
   ↓
[Compra aprobada]
   ↓ (automático)
[Hotmart muestra página de Upsell $9.90 — one-click]
   ↓
[Acepta o rechaza]
   ↓
[Thank you de Hotmart + email de entrega]
   ↓ (en paralelo, automático)
[Hotmart envía webhook POST a /api/hotmart-webhook]
   ↓
[Nuestro código: marca compra en DB + dispara CAPI Purchase + tag en Systeme.io]
```

**Importante:** NO hay iframe ni embed. Es un redirect simple. La persona sale de tu sitio, paga en Hotmart, y el webhook nos avisa.

---

## Comisiones de Hotmart

- **~10% por venta** (varía ligeramente por país/producto)
- No tiene fee mensual
- Liquidación a CBU en ~30 días

**Ejemplo con tu estructura:**

| Venta | Bruto | Comisión (~10%) | Neto |
|---|---|---|---|
| Solo front | $14.90 | ~$1.49 | **$13.41** |
| Front + upsell | $24.80 | ~$2.48 | **$22.32** |

---

## Checklist final del Agente 11

- [ ] Producto principal $14.90 creado y publicado
- [ ] Upsell $9.90 creado y configurado como post-compra (one-click)
- [ ] Garantía 30 días configurada en ambos productos
- [ ] Checkout personalizado (logo, colores, copy)
- [ ] Email de entrega personalizado
- [ ] Postback/webhook configurado apuntando a `/api/hotmart-webhook`
- [ ] Hottok generado y entregado para env vars
- [ ] URL de checkout entregada para env vars
- [ ] IDs de productos entregados para env vars
- [ ] Test end-to-end completado (mínimo 1 compra de prueba)

---

## Notas importantes

1. **NO crear Order Bump.** Se eliminó para simplificar el funnel LATAM.
2. **NO crear Downsell.** Si rechaza el upsell, va directo al thank you.
3. **NO crear Upsell 2 (membresía).** Se eliminó del scope.
4. **El checkout es por redirect**, no por iframe/embed. Así funciona mejor en mobile LATAM.
5. **El email de soporte** (`soporte@anti-hinchazon.com` o el que se use) tiene que existir y ser respondido en <24hs para cumplir la garantía.
