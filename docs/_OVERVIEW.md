# _OVERVIEW.md — Mapa general del proyecto

> **Compartido — todos los agentes deben leerlo.**

## Qué construimos

Un quiz funnel low-ticket para venta de un infoproducto digital ("Protocolo Anti-Hinchazón") al mercado hispanohablante (Argentina como base, foco de venta en LATAM y España).

## Mapa del funnel (end-to-end)

```
[META AD]                                  ← agentes 08, 09, 10
   ↓
[NUESTRO CÓDIGO — Next.js en Vercel]
   /              ← LANDING PRE-QUIZ        ← agente 01
   /quiz          ← QUIZ DE 14 SLIDES        ← agente 02
   /resultados    ← CARTA DE VENTAS DINÁMICA ← agente 03
   /api/*         ← BACKEND + TRACKING       ← agente 04
   ↓
[Click en CTA "Quiero mi protocolo $14.90"]
   ↓
[HOTMART — fuera de nuestro código]        ← agente 11 lo configura
   Checkout
   Upsell 1 ($9.90)
   Thank You + Email entrega
   ↓
[EMAIL SEQUENCE]                           ← agente 12
```

## Productos y precios

| Pieza | Precio USD | Tipo | Quién lo crea |
|---|---|---|---|
| Protocolo Anti-Hinchazón 7 Días (PWA interactiva) | $14.90 | Front end | Agente 05 |
| Programa 30 Días Completo | $9.90 | Upsell 1 | Agente 07 |

**AOV proyectado:** ~$18.86 USD por comprador.

## Alcance del código

**SÍ codeamos:**
- `/` (landing pre-quiz)
- `/quiz` (las 14 slides)
- `/resultados` (carta de ventas)
- `/api/submit-quiz` (recepción del email + forward a webhook)
- `/api/track` (Conversions API de Meta server-side)
- `/api/hotmart-webhook` (recibe postback de Hotmart cuando hay venta)

**NO codeamos:**
- Páginas de upsell (las hace Hotmart con su editor)
- Página de checkout (la hace Hotmart)
- Página de thank you (la hace Hotmart)
- Área de miembros / entrega (Hotmart maneja la descarga del PDF)

Esto es importante: nuestro código termina cuando el usuario hace click en "Quiero mi protocolo por $14.90 →". A partir de ahí, Hotmart toma el control.

## Decisiones técnicas tomadas

1. **Next.js 14+ App Router + TypeScript + Tailwind + Framer Motion + Zustand** para el frontend
2. **Vercel** para deploy (free tier alcanza el día 1)
3. **Hotmart** para checkout, upsells y entrega (mejor opción para Argentina/LATAM)
4. **Systeme.io** para email automation (free tier hasta 2.000 contactos)
5. **ElevenLabs + CapCut + Pexels** para creativos sin cámara
6. **Meta Ads** para tráfico (CBO, broad audience)

## Métricas objetivo (día 3 post-lanzamiento)

- ROAS ≥ 1.5x
- Tasa finalización quiz ≥ 65%
- CVR página resultados ≥ 4%
- AOV ≥ $20

Ver `_METRICAS.md` para benchmarks completos.

## Decisiones que NO se cambian

1. **No hay VSL** en este proyecto. Cero cámara, cero voz tuya. Todo el copy es texto + diseño + prueba social.
2. **Voseo argentino neutralizado** en todo el copy.
3. **Mobile-first** absoluto.
4. **Frontend desplegado a Vercel** (no usar plataformas no-code para esto).
5. **Pagos en Hotmart** (no Stripe ni Mercado Pago directo).

## Decisiones pendientes (te toca a vos, humano)

- [ ] Nombre de la marca (en docs aparece como `[MARCA]`)
- [ ] Dominio (Vercel da `*.vercel.app` gratis si no querés comprar)
- [ ] Email del autor para los emails
- [ ] Foto / nombre real para testimonios (o usar los placeholders del doc 03)
