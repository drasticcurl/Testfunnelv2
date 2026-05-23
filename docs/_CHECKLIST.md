# _CHECKLIST.md — Cronograma del día y minimum viable

> **Esto es para vos (humano), no para los agentes.** Lo usás como orquestador.

## Antes de empezar (cosas que hacés vos sí o sí)

### El día anterior (30 min)

- [ ] Crear cuenta de Hotmart como **Productor** (puede tardar en aprobar el CUIT)
- [ ] Crear cuenta Meta Business + Ads Manager con método de pago verificado
- [ ] Crear cuenta de Vercel
- [ ] Crear cuenta de ElevenLabs (free trial alcanza)
- [ ] Crear cuenta de Systeme.io (free tier)
- [ ] Tener instalado Cursor o VS Code
- [ ] Tener Node.js 20+ instalado

### Información que tenés que decidir

- [ ] **Nombre de la marca** (en docs aparece como `[MARCA]`)
- [ ] **Nombre del autor** que firma los emails y aparece en el "yo" del copy
- [ ] **Email de contacto** que respondés tu mismo
- [ ] **Dominio**: `*.vercel.app` gratis, o comprar uno (~$10/año)

---

## Cómo correr los 12 chats en paralelo

### Paso 1 — Abrir las 12 ventanas

Abrí 12 conversaciones distintas (mismo LLM). En cada una:

1. Pegale **AGENTS.md**
2. Pegale los **archivos compartidos** que el agente necesita (la tabla está en AGENTS.md)
3. Pegale **el archivo del agente NN** (`docs/NN-XXX.md`)
4. Decile: "Sos el AGENTE NN. Cuando termines de leer, decime 'Listo, agente NN preparado para [tarea]' y esperá mi confirmación."

### Paso 2 — Confirmar arranque (en la order recomendada)

```
T+0  → Confirmar agentes 01, 02, 03, 04 (frontend)
T+0  → Confirmar agentes 05, 06, 07 (PDFs)
T+0  → Confirmar agentes 08, 09, 10 (creativos)
T+1h → Empezar agente 11 (Hotmart) — porque necesita los PDFs listos
T+5h → Empezar agente 12 (Lanzamiento) — porque necesita TODO listo
```

### Paso 3 — Mientras los chats trabajan, vos:

- Le contestás dudas (`[NEEDS_INPUT]` en su output)
- Aprobás o pedís ajustes
- Vas mergeando los outputs de código manualmente al repo
- Vas cargando los PDFs y creativos en Hotmart y Meta

---

## Cronograma realista (5 horas paralelo + 2h tu trabajo manual)

| Tiempo | Lo que está pasando |
|---|---|
| **T+0** | Abrís los 12 chats, pegás los docs, confirmás arranque de 1–10 |
| **T+0:30** | Frontend (01–04) está empezando a generar código. PDFs (05–07) generando contenido. Creativos (08–10) generando guiones |
| **T+1:30** | Output PDFs llegando. Vos los descargás y los pasás a Gamma/Canva |
| **T+2:00** | Output frontend casi listo. Vos hacés deploy a Vercel. Test end-to-end |
| **T+2:30** | Output creativos llegando. Generás voces ElevenLabs y editás en CapCut |
| **T+3:00** | Activás agente 11 (Hotmart). Te lleva paso a paso a configurar |
| **T+4:00** | Hotmart configurado. Tenés URL de checkout. La pegás en `.env` y rebuildás |
| **T+4:30** | Activás agente 12 (Lanzamiento). Te ayuda a subir creativos a Meta y configurar emails en Systeme.io |
| **T+5:30** | Test final completo |
| **T+6:00** | **PUBLISH** en Meta. Campaña live. |

---

## Mínimo viable si te queda corto el tiempo

Si no llegás a las 6 horas, lo que SÍ tiene que estar antes de lanzar:

| Imprescindible | Nice to have (puede esperar día 2) |
|---|---|
| ✅ Landing pre-quiz | ⏳ Animaciones perfectas |
| ✅ Quiz funcionando | ⏳ Cálculo de severidad fino |
| ✅ Página de resultados con CTA | ⏳ Sticky CTA mobile |
| ✅ PDF principal | ⏳ Recetario (puede ser day 2) |
| ✅ Hotmart con front + bump | ⏳ Upsell 2 (day 2) |
| ✅ Pixel + InitiateCheckout | ⏳ CAPI completo |
| ✅ 1 creativo bueno | ⏳ Los 3 creativos |
| ✅ Email de bienvenida | ⏳ Toda la secuencia |
| ✅ Campaña Meta lanzada | ⏳ Optimización avanzada |

Si tenés solo lo de la columna izquierda, **podés lanzar igual**. La columna derecha la completás durante el día 2 mientras el algoritmo aprende.

---

## Días 2–7 (post-lanzamiento)

### Día 2 (NO TOCAR NADA)

- Período de aprendizaje del algoritmo de Meta
- No pausar, no editar, no cambiar
- Solo monitorear que los eventos lleguen al pixel

### Día 3 (decisión)

Análisis a las 72hs según ROAS — ver `_METRICAS.md`.

### Día 4–7 (iteración)

- [ ] Producir 3 nuevos creativos basados en el ángulo ganador
- [ ] Cargar emails 2–5 de la Secuencia A
- [ ] Cargar emails 2–3 de la Secuencia B
- [ ] Activar el Upsell 2 ($67) si no estaba activado
- [ ] Recolectar primeros testimonios reales y reemplazar placeholders

### Día 7–14 (validación)

- [ ] Si AOV ≥ $20 y ROAS ≥ 1.8 sostenido por 7 días → **OFERTA VALIDADA**
- [ ] Empezar a escalar a $50–80 USD/día
- [ ] Considerar abrir mercados México y Colombia en adsets separados
- [ ] Construir el Programa 30 Días completo (semanas 3 y 4)

---

## El paso final

- [ ] Antes de dormir: confirmar que la campaña está corriendo y gastando
- [ ] Al despertar: revisar Meta Ads Manager y Hotmart, **NO TOCAR NADA**
- [ ] Esperar 72hs antes de juzgar
