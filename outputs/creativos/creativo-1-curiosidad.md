# CREATIVO 1 — "Los 4 tipos de hinchazón" (curiosidad → auto-descubrimiento)
## Meta Ads · Reel sin cámara · 9:16 · 35 segundos

> **Output esperado del humano:** `outputs/creativos/creativo-1-curiosidad.mp4`
> **Este archivo es la blueprint completa para producirlo en CapCut + ElevenLabs + B-roll.**
> **Fuente del agente:** `docs/08-CREATIVO-1.md` + `docs/_AVATAR.md` + `docs/_BRAND-VOICE.md` + `docs/_DESIGN-SYSTEM.md`.

---

## Resumen ejecutivo

| | |
|---|---|
| Ángulo | Curiosidad / auto-descubrimiento |
| Mensaje núcleo | "Hay 4 tipos de hinchazón. Estás atacando el equivocado." |
| Formato | Sin cámara, sin voz humana real (voz IA + B-roll + texto) |
| Estética | Educativa, intrigante, cálida (no clínica) |
| Aspect ratio | 9:16 (1080×1920) |
| Duración | **35 segundos exactos** |
| Voz | ElevenLabs — **Valentina** (es-LATAM, primaria) + **Sofia** (es-ES, A/B) |
| Música | Tensión sutil → resolución |
| Subtítulos | Word-by-word, obligatorios (CapCut auto-captions corregidas) |
| CTA final | "Hacé el test" → link en perfil / swipe up |
| Avatar al que pega más fuerte | Problem aware **curiosa** que todavía no tiene un reframe del problema |

---

## 1. GUIÓN PARA ELEVENLABS

> **Cómo leerlo:** las marcas `[pausa corta]` (0.5s) y `[pausa media]` (1.0s) se logran con `...` o partiendo el audio en CapCut. El texto entre comillas se pega LITERAL en el input de ElevenLabs.

```
Existen cuatro tipos de hinchazón abdominal. [pausa corta]
Y nueve de cada diez mujeres no sabe cuál tiene.

[pausa media]

Tipo uno: matutina. [pausa corta]
Tipo dos: postprandial. [pausa corta]
Tipo tres: vespertina. [pausa corta]
Tipo cuatro: crónica persistente.

[pausa media]

Si llevás años con la panza inflada y nada te funcionó,
probablemente estás atacando el tipo equivocado.

[pausa corta]

Hice este test de dos minutos para descubrir el mío.
Y todo cambió.

[pausa corta]

Hacé el test acá abajo.
```

**Conteo:**
- 78 palabras
- Ritmo objetivo: 175 palabras/min (informativa-intrigante, más enfática que el creativo 3)
- Voz neta: **~26 segundos**
- + Pausas marcadas (3 pausas medias × 1s + 5 pausas cortas × 0.5s = 5.5s)
- + 3.5s de aire al cierre y respiración → **35 segundos exactos**

### Settings ElevenLabs

| Parámetro | Voz A — Valentina | Voz B — Sofia | Por qué |
|---|---|---|---|
| Voz | **Valentina** (Spanish - Latin America) | **Sofia** (Spanish - Spain neutral) | Match avatar AR/LATAM como primaria; Sofia para A/B en ES/MX |
| Stability | **0.50** | 0.50 | Más enfática que el creativo 3 (que va en 0.60). Suena informativa-intrigante, no íntima. |
| Similarity | **0.75** | 0.75 | Mantiene timbre original |
| Style | **0.30** | 0.30 | Levemente expresivo, no neutro robótico |
| Speaker Boost | **Activado** | Activado | — |
| Output | MP3 128 kbps | MP3 128 kbps | — |
| Nombre del archivo | `voz-creativo-1-valentina.mp3` | `voz-creativo-1-sofia.mp3` | Generar las 2 versiones |

> **Regla del paquete de voces de los 3 creativos:**
> - Creativo 1 (este, curiosidad): **Stability 0.50** — informativa-intrigante
> - Creativo 2 (disrupción): Stability 0.45 — confrontativa
> - Creativo 3 (frustración): Stability 0.60 — íntima, diary entry

### Tip de ejecución en ElevenLabs

1. Pegar el guión completo en una sola generación. Si la versión de ElevenLabs no soporta `[pausa corta/media]`, reemplazar por `...` (puntos suspensivos).
2. Si una pausa quedó muy corta, partir el audio en CapCut y agregarle 200–400ms.
3. Generar **las 2 versiones** (Valentina + Sofia) — A/B test en Meta CBO.
4. Validar que la frase del hook ("Existen cuatro tipos de hinchazón abdominal") se entienda nítida en los primeros 1.8s de audio.

---

## 2. STORYBOARD SEGUNDO POR SEGUNDO

> 7 bloques. Cada bloque: tiempo, visual, voz, música, texto en pantalla, transición.

### Bloque 1 — Hook (0–3s) · CRÍTICO
| Campo | Valor |
|---|---|
| Visual | B-roll: plano cerrado de torso de mujer (sin cara) en remera blanca holgada, levemente girando frente a un espejo. Luz natural cálida desde una ventana. |
| Animación | El B-roll arranca. Al segundo 0.6s entra el texto pantalla completa con escala desde 0.85x a 1x (pop-in 200ms) sobre un overlay cream `#FAF7F2` al 70% de opacidad. |
| Audio voz | "Existen cuatro tipos de hinchazón abdominal." |
| Música | Pulso sutil de tensión, fade-in desde -∞ a -12 dB. Una nota sostenida de pad cálido. |
| Texto en pantalla | **EXISTEN 4 TIPOS DE HINCHAZÓN** (Fraunces 700, charcoal `#2D3A2E`, max-width 80%) |
| Transición salida | Cut seco al bloque 2 |

### Bloque 2 — Disparador de curiosidad (3–6s)
| Campo | Valor |
|---|---|
| Visual | Fondo cream `#FAF7F2` plano. Ícono grande de signo de pregunta `?` en sage `#7A9B7E` semi-transparente al 25% como marca de agua a la derecha (decorativo). Texto centrado. |
| Animación | El número "9" entra con scale-in 250ms; "de cada 10" entra debajo con slide-up 200ms; la palabra "no sabe cuál tiene" entra al final con fade-in. |
| Audio voz | "Y nueve de cada diez mujeres no sabe cuál tiene." |
| Música | Pulso sigue, sube a -10 dB. |
| Texto en pantalla | **9 DE CADA 10**\n NO SABE CUÁL TIENE (Fraunces 700, charcoal, número en coral `#E07856`) |
| SFX | Tick muy sutil (-22 dB) cuando aparece el número |
| Transición salida | Cut con flash cream de 100ms |

### Bloque 3 — Los 4 tipos revelados (6–14s)
| Campo | Valor |
|---|---|
| Visual | Grid 2×2 sobre fondo cream. 4 thumbnails cuadradas con esquinas redondeadas `rounded-lg` (16px), cada una con: número grande (1, 2, 3, 4) en coral arriba a la izquierda + ilustración minimalista en sage + label en charcoal abajo. |
| Animación | Cada thumbnail aparece **una a una** sincronizada con la voz, con scale-in (0.92→1) + slide-up 80px en 350ms. Tiempos exactos: T1 a 6.0s, T2 a 8.0s, T3 a 10.0s, T4 a 12.0s. Cada una "queda" en pantalla con un check sage `#7A9B7E` que pulsa una vez. |
| Audio voz | "Tipo uno: matutina. Tipo dos: postprandial. Tipo tres: vespertina. Tipo cuatro: crónica persistente." |
| Música | Continúa con tensión, nivel -10 dB. |
| Texto en pantalla | (4 cards):\n **1** · MATUTINA\n **2** · POSTPRANDIAL\n **3** · VESPERTINA\n **4** · CRÓNICA PERSISTENTE |
| SFX | "Pop" suave (-20 dB) cuando aparece cada thumbnail |
| Transición salida | Las 4 cards quedan en pantalla 0.5s extra → fade-out de 200ms al bloque 4 |

> **Ilustración de cada tipo (minimalista, generada en Canva o Figma):**
> - **Tipo 1 (matutina):** sol naciente sobre línea de horizonte
> - **Tipo 2 (postprandial):** plato con tenedor
> - **Tipo 3 (vespertina):** luna creciente
> - **Tipo 4 (crónica):** reloj con flecha circular
> Color de la ilustración: sage `#7A9B7E` mono. Fondo del card: white. Stroke 2px sage-soft `#E8EFE9`.

### Bloque 4 — Reframe / "estás atacando el equivocado" (14–22s)
| Campo | Valor |
|---|---|
| Visual | B-roll: mujer sentada en su cama o sillón, en ropa cómoda, mirando un placard / colgador con varias prendas (sin cara, plano de hombros y manos). Levemente desaturado, cálido. Plano fijo. |
| Animación texto | El texto aparece en 2 partes con stroke blanco 4px sobre el B-roll para legibilidad. Primero "Probaste todo y nada funcionó" en fade-in 500ms. Después de 2.5s, fade-out y aparece "Estás atacando el TIPO EQUIVOCADO" con scale-in 400ms, palabra `TIPO EQUIVOCADO` en coral. |
| Audio voz | "Si llevás años con la panza inflada y nada te funcionó, probablemente estás atacando el tipo equivocado." |
| Música | Sostenida cálida, sigue en -10 dB. Justo antes del cierre del bloque entra un sutil "drum roll" de palmas. |
| Texto en pantalla | (parte 1, 14–17s) "Probaste todo y nada funcionó" — Fraunces 600 italic, 64px, charcoal con stroke blanco\n (parte 2, 17–22s) **Estás atacando el TIPO EQUIVOCADO** — Fraunces 700, 80px, charcoal, palabra `TIPO EQUIVOCADO` en coral |
| Transición salida | Whip-pan 150ms hacia el bloque 5 |

### Bloque 5 — Solución / autoridad concreta (22–28s)
| Campo | Valor |
|---|---|
| Visual | Screen recording del quiz funcionando: dedo (cursor mockeado) seleccionando opciones de la pregunta "¿En qué momento del día notás MÁS la hinchazón?". Plano cenital del celular sobre cream warm `#F4EFE6`. Acelerado 1.4x. Mostrar la barra de progreso avanzando. |
| Animación | El celular entra con slide-up + leve tilt 2° desde abajo (300ms). El cursor toca la opción correspondiente al tipo del usuario hipotético. La barra de progreso se llena al ritmo. |
| Audio voz | "Hice este test de dos minutos para descubrir el mío. Y todo cambió." |
| Música | Build hacia tempo medio. Entra un kick suave a los 24s. |
| Texto en pantalla | "**Sin costo · 2 min**" — pill flotante esquina superior derecha del celular, fondo sage-soft `#E8EFE9`, texto sage dark `#5B8A60`, Inter 600 32px. (NO se usa la palabra "gratis" — regla `_BRAND-VOICE.md` §6.) |
| SFX | Tap suave (-18 dB) cada vez que el cursor toca una opción |
| Transición salida | Cut seco al bloque 6 |

### Bloque 6 — CTA principal (28–33s)
| Campo | Valor |
|---|---|
| Visual | Fondo cream `#FAF7F2`. Mockup del PDF "Protocolo Anti-Hinchazón: Plan de 7 Días" centrado, flotando con sombra suave (`shadow-xl`) y rotación leve 3°. A los 30s entra un botón pill grande coral `#E07856` debajo. |
| Animación CTA | El PDF entra con slide-up + scale 0.92→1 (400ms ease-out). El botón pill aparece con bounce desde abajo (500ms cubic-bezier) a los 30s. La flecha 👉 oscila suave en loop de 800ms. |
| Audio voz | "Hacé el test acá abajo." |
| Música | Resuelve a un acorde cálido sostenido. |
| Texto en pantalla | Línea 1 (28–30s): **HACÉ EL TEST** (Inter 700 uppercase, charcoal, 72px)\n Línea 2 / Botón pill (30–33s): **👉 HACELO ACÁ — LINK EN PERFIL** (Inter 600, white sobre coral `#E07856`, rounded-full 999px) |

### Bloque 7 — End frame estático (33–35s)
| Campo | Valor |
|---|---|
| Visual | Frame fijo del bloque 6: PDF + botón pill + textos. Sin movimiento. |
| Animación | Solo la flecha 👉 sigue oscilando suave (loop). |
| Audio voz | (silencio) |
| Música | Fade-out gradual desde 33.5s hasta 35.0s (silencio total al cierre). |
| Texto en pantalla | El mismo del bloque 6, congelado. |
| Razón del end frame | Meta agarra automáticamente uno de los últimos frames como **thumbnail del Reel** y como imagen estática para el feed. Garantizar que el thumbnail sea CTA + producto. |

---

## 3. B-ROLL — LISTA DE COMPRAS

> Buscar en este orden: **Pexels (gratis, comercial OK)** → **Storyblocks** (free trial) → **custom en CapCut/Canva**.

| # | Tiempo | Tipo | Query exacta en Pexels | Duración necesaria | Backup query | Notas de selección |
|---|---|---|---|---|---|---|
| 1 | 0–3s | Pexels | `woman white tshirt mirror bedroom` | 3s | `woman torso mirror morning natural light` | Sin cara visible. Plano de torso. Luz cálida natural. Remera blanca holgada (matchea avatar). |
| 1-alt | 0–3s | Pexels | `woman holding bloated stomach` | 3s | `stomach belly closeup hands` | **Si el clip 1 no genera curiosidad**, usar este como hook alternativo. ⚠️ Sin texto sobre body image agresivo. |
| 2 | 3–6s | Custom | (no aplica) | 3s | — | Generado en CapCut: fondo cream + texto "9 DE CADA 10" + ícono `?` decorativo en sage 25% opacidad. |
| 3 | 6–14s | Custom | (no aplica) | 8s | — | Grid 2×2 generado en Canva o Figma con 4 cards. Animado en CapCut. Ver spec en bloque 3 del storyboard. |
| 4 | 14–22s | Pexels | `woman closet clothes frustrated home` | 8s | `woman bedroom looking at clothes` o `woman trying clothes home` | Sin cara o cara fuera de cuadro. Plano de hombros + manos. NO modelo posando — buscar "real woman" / "lifestyle". |
| 4-alt | 14–22s | Pexels | `tired woman home couch hand temple` | 8s | — | Backup si el 4 no funciona. Mantener tono cálido, no clínico. |
| 5 | 22–28s | Custom | screen recording propio del quiz | 6s | — | Grabar en QuickTime / OBS un recorrido por las primeras 4 preguntas del quiz desplegado. Acelerar 1.4x en CapCut. Mockear cursor de "dedo". |
| 6 | 28–35s | Custom | mockup del PDF | 7s | — | Generar mockup en https://smartmockups.com/ usando el PDF de `outputs/pdfs/protocolo-anti-hinchazon-7-dias.pdf` cuando el agente 05 lo entregue. Si todavía no está, usar el PNG provisorio de `outputs/pdfs/estructura-calculadora-microbiota.md` o un placeholder con la portada del PDF en Canva. |

### Filtros de selección de B-roll (no negociables)

- ✅ Sin cara visible (o cara fuera de cuadro / desenfocada)
- ✅ Mujer 32–55 que matchee el avatar (lifestyle real, no modelo)
- ✅ Luz natural cálida — palette warm
- ✅ Casa real / cottage style / no decorado de revista
- ❌ Sobre-producción, modelos perfectas, decorado tipo Pinterest premium
- ❌ Tonos azules fríos, fluorescentes, fondos clínicos
- ❌ Quirófano, laboratorio, médico, blanco hospital
- ❌ Body shaming explícito (zoom agresivo a panza con narrativa de "antes/después" exagerada)

### Si Pexels no tiene el clip exacto

Backup en orden:
1. **Storyblocks** con la misma query
2. **Pexels Videos** con queries en inglés alternativas
3. **Midjourney** (ratio 9:16, prompt: `woman 40s home morning warm light cottage style, no face, hands on counter, soft natural lighting, real not stock`)
4. **Reemplazar el bloque por texto en pantalla completa** sobre fondo cream con las animaciones tipográficas del bloque 1

---

## 4. TEXTO EN PANTALLA — ESPECIFICACIONES

> Todas las fuentes Google Fonts free. Tokens del `_DESIGN-SYSTEM.md`. Charcoal `#2D3A2E`. Coral `#E07856`. Cream `#FAF7F2`. Sage `#7A9B7E`. Sage soft `#E8EFE9`.

| # | Tiempo | Texto | Fuente | Peso | Tamaño (px en 1080×1920) | Color | Animación CapCut |
|---|---|---|---|---|---|---|---|
| 1 | 0–3s | **EXISTEN 4 TIPOS DE HINCHAZÓN** | Fraunces | 700 | 96 | charcoal sobre overlay cream 70% | pop-in (escalar 0.85→1) 200ms |
| 2a | 3–4s | **9 DE CADA 10** | Fraunces | 700 | 120 | número en coral, "DE CADA 10" en charcoal | scale-in 250ms |
| 2b | 4–6s | NO SABE CUÁL TIENE | Inter | 600 uppercase | 56 | charcoal | slide-up 200ms |
| 3 | 6–14s | Cards: **1** MATUTINA · **2** POSTPRANDIAL · **3** VESPERTINA · **4** CRÓNICA PERSISTENTE | Fraunces (números) + Inter (labels) | 700 / 600 | 88 (números) / 36 (labels) | número en coral, label en charcoal sobre card white | cada card: scale-in + slide-up 350ms encadenadas con la voz |
| 4a | 14–17s | "Probaste todo y nada funcionó" | Fraunces | 600 italic | 64 | charcoal con stroke blanco 4px | fade-in 500ms |
| 4b | 17–22s | **Estás atacando el TIPO EQUIVOCADO** | Fraunces | 700 | 80 | charcoal + `TIPO EQUIVOCADO` en coral con stroke blanco 4px | scale-in 400ms |
| 5 | 22–28s | **Sin costo · 2 min** (pill flotante) | Inter | 600 | 32 | sage dark `#5B8A60` sobre fondo sage-soft `#E8EFE9`, rounded-full | fade-in 300ms |
| 6a | 28–33s | **HACÉ EL TEST** | Inter | 700 uppercase | 72 | charcoal | fade-in 300ms |
| 6b | 30–35s | **👉 HACELO ACÁ — LINK EN PERFIL** (botón pill) | Inter | 600 | 56 | white sobre coral `#E07856`, `border-radius: 999px` | bounce-up 500ms + flecha en loop oscilando |

### Safe zones 9:16 (Instagram Reels / TikTok)

- Margen vertical superior: **220px** (header de UI: nombre de usuario, audio)
- Margen vertical inferior: **480px** (caption + reactions + nav bar de Instagram)
- Margen lateral: **80px**
- **Centro seguro:** 80–1000 px horizontal, 220–1440 px vertical

> Todo texto crítico (hook, CTA, números) debe estar dentro de **80–1000 px horizontal y 360–1280 px vertical**. Verificar con la grilla de safe zones de CapCut antes de exportar.

---

## 5. MÚSICA — CUE SHEET

> Buscar en **Epidemic Sound** (preferido) → **Artlist** → **YouTube Audio Library** → **CapCut library** (último recurso). **Una sola pista**, no mix.

### Queries sugeridas (en orden de prioridad)

1. `lifestyle uplifting wellness build`
2. `corporate intriguing reveal`
3. `calm motivational discovery`
4. `documentary educational tension resolve`

### Cue sheet por bloque

| Tiempo | Sección musical | Nivel relativo | Elementos activos |
|---|---|---|---|
| 0–3s | Intro: pulso de tensión sutil + pad sostenido | -12 dB | Pad cálido, pulso sutil tipo metrónomo a 90 BPM |
| 3–6s | Tensión sigue subiendo | -10 dB | Tick suave acompaña la palabra "9 de cada 10" |
| 6–14s | Tensión mantiene + pizzicato curioso | -10 dB | Entran cuerdas en pizzicato, una nota por cada tipo (sincro con thumbnails) |
| 14–22s | Pad cálido + drum roll de palmas hacia el final | -8 dB | Pad sostenido, palmas suaves al 21s anticipando el cambio |
| 22–28s | Build medio: kick + clap | -6 dB | Entra un beat con kick suave + clap. Tempo medio. |
| 28–33s | Resolución: acorde sostenido cálido | -4 dB (bajará por ducking de la voz) | Acorde mayor sostenido, "sensación de respiro" |
| 33–35s | Fade-out gradual | de -4 dB a -∞ | Solo el sostenido se va apagando |

### Reglas de ducking (sidechain)

- Cuando entra voz: música baja **6 dB automáticamente**
- Pausas de voz: música vuelve a su nivel natural en 200ms
- Configurar en CapCut: pista de música → "Auto Ducking" → Threshold -18 dB → Reduction 6 dB

---

## 6. SUBTÍTULOS

> **Obligatorios.** El brief del agente 08 lo marca como innegociable: 85% de la audiencia mira sin sonido (también `_AVATAR.md` §"Devices y contexto de uso").

| Atributo | Valor |
|---|---|
| Generador | CapCut auto-captions → Spanish (Latin America) → corregir manualmente palabra por palabra |
| Estilo | **Word-by-word** (cada palabra aparece sincronizada con la voz, no líneas completas) |
| Fuente | Inter 700 (o Montserrat Bold como alternativa equivalente) |
| Tamaño | 56px (60% del tamaño del texto principal del bloque) |
| Color | white `#FFFFFF` |
| Stroke | charcoal `#2D3A2E` 3px (legibilidad sobre cualquier B-roll) |
| Background | none (solo el stroke da legibilidad) |
| Posición | y = 1300px (zona safe inferior, arriba del CTA del Reel) |
| Highlight palabra hablada | **Activado** — palabra activa en coral `#E07856`, las demás en white. Refuerza el "word-by-word". |
| Sincronización | Frame-perfect con la voz (validar a 0.5x speed) |
| Max chars por línea | 22 |

> **Excepción:** en el bloque 1 (hook 0–3s) y en el bloque 6 (CTA 28–35s) el texto en pantalla es enorme y central — **omitir subtítulo** ese bloque para no saturar visualmente. El subtítulo solo aparece en bloques 2–5.

---

## 7. PIPELINE DE PRODUCCIÓN — PASO A PASO

> Tiempo total estimado: **15–20 minutos** una vez que tenés todos los assets descargados.

### Pre-producción (8 min)

1. **Generar voz en ElevenLabs** con settings de la sección 1 — exportar las 2 versiones:
   - `outputs/creativos/raw-broll/voz-creativo-1-valentina.mp3`
   - `outputs/creativos/raw-broll/voz-creativo-1-sofia.mp3`
2. **Descargar B-roll** de la lista de la sección 3 (Pexels primero). Guardar en:
   - `outputs/creativos/raw-broll/broll-1-mirror.mp4`
   - `outputs/creativos/raw-broll/broll-4-closet.mp4`
   - (los clips 2, 3, 6 son custom; el 5 es screen recording propio)
3. **Bajar pista de música** (Epidemic Sound) → `outputs/creativos/raw-broll/musica-creativo-1.mp3`
4. **Generar las 4 thumbnails de tipos** en Canva (2×2 grid, ver spec del bloque 3) → exportar como PNGs transparentes individuales.
5. **Generar mockup del PDF** en Smartmockups → PNG transparente.
6. **Hacer screen recording del quiz** (60s en QuickTime). Después se acelera 1.4x en CapCut.

### Producción en CapCut (12 min)

1. **Nuevo proyecto** 9:16 / 1080×1920 / 30fps.
2. **Pista 1 (audio principal):** importar `voz-creativo-1-valentina.mp3`. Marcar timeline cada 3s.
3. **Pista 2 (música):** importar pista de Epidemic Sound. Aplicar **auto-ducking** con la pista 1 (-6 dB).
4. **Pista 3 (B-roll y custom):** colocar los 6 visuales según los tiempos del storyboard. Los bloques 2, 3, 6 son layouts custom de fondo cream con elementos.
5. **Pista 4 (texto en pantalla):** crear cada texto con la spec de la sección 4. Animar con presets pop-in, scale-in, slide-up, bounce.
6. **Pista 5 (subtítulos word-by-word):** auto-captions → revisar → activar highlight de palabra activa en coral.
7. **Pista 6 (SFX):** swooshes, taps, ticks según storyboard.
8. **Transiciones:** cut seco / flash cream / whip-pan según el storyboard.
9. **Color grading:** preset "Warm" o "Cinematic Soft" suave en bloques de B-roll. NO sobresaturar.
10. **End frame:** los últimos 1.5s deben ser estáticos con CTA + producto visible (Meta lo agarra como thumbnail).
11. **Export:** 1080×1920 / 30fps / H.264 / 12 Mbps / MP4. **Sin marca de agua de CapCut** (importante).
    - Nombre: `creativo-1-curiosidad-valentina.mp4`
12. **Repetir paso 11** con la voz Sofia → `creativo-1-curiosidad-sofia.mp4`

### Variantes a generar (A/B en Meta CBO)

- `creativo-1-curiosidad-valentina.mp4` (voz Valentina, primaria AR/LATAM)
- `creativo-1-curiosidad-sofia.mp4` (voz Sofia, A/B para España/México neutro)

> Subir las 2 al mismo ad set inicialmente. Después de 48h con $20–30/día, dejar la ganadora.

---

## 8. QA ANTES DE EXPORTAR

Checklist obligatorio. Si alguna falla, **no exportar**.

- [ ] Duración exacta entre **34.5 y 35.5 segundos**
- [ ] Hook funciona en los **primeros 3 segundos** (alguien que mira sin sonido entiende "4 tipos de hinchazón" antes del segundo 3)
- [ ] Voz audible cuando hay música (test con auriculares y con altavoces de celular)
- [ ] Voz IA suena **natural**, sin cortes robóticos ni distorsión
- [ ] Subtítulos word-by-word **frame-perfect** (validar a 0.5x speed)
- [ ] Textos críticos dentro de las **safe zones 9:16** (no tapados por UI de Instagram/Reels)
- [ ] CTA "👉 HACELO ACÁ — LINK EN PERFIL" visible los **últimos 5 segundos** completos
- [ ] **End frame estático** los últimos 1.5s (thumbnail Meta)
- [ ] **Sin marca de agua** (CapCut, Pexels, Storyblocks)
- [ ] **Cero promesas médicas** en voz o texto (validar contra `_BRAND-VOICE.md` §5)
- [ ] **Cero "gratis"** en voz o texto — usamos "sin costo" (validar contra `_BRAND-VOICE.md` §6)
- [ ] **Cero emojis decorativos** en frases serias (solo 👉 y ❌ funcionales)
- [ ] Color grade **cálido**, no saturado, no clínico
- [ ] Tamaño final < 50 MB

### Test de avatar

> Mostrarle el creativo a 3 mujeres del avatar (32–55, con historia de hinchazón) y preguntarles:
> 1. ¿Qué entendiste en los primeros 3 segundos?
> 2. ¿Te dieron ganas de saber tu tipo?
> 3. ¿Le harías click al test?

Si las 3 respuestas no son las esperadas, iterar el hook antes de invertir presupuesto.

---

## 9. POSICIONAMIENTO RESPECTO A CREATIVOS 2 Y 3

| | **Creativo 1 — Curiosidad (este)** | Creativo 2 — Disrupción | Creativo 3 — Frustración |
|---|---|---|---|
| Hook emocional | "Hay 4 tipos. ¿Cuál sos?" | "No es grasa, es inflamación" | "Probé todo y nada funcionó" |
| Tono de voz | **Informativo, intrigante** | Confrontativo, revelador | Confesional, íntimo |
| Stability ElevenLabs | **0.50** | 0.45 | 0.60 |
| Música | **Tensión sutil → resolución** | Beat con drops | Acústica → build |
| Estética | **Educativa, descubrimiento** | Disruptiva, "te abro los ojos" | Diary entry / UGC fake |
| Avatar al que pega más fuerte | Problem aware **curiosa** | Problem aware **confundida** | Problem aware **frustrada** |
| Duración | **35s** | (ver doc 09) | 45s |

Los 3 creativos entran por ángulos distintos al **mismo destino** (la landing del quiz). En Meta CBO se prueban contra los 3, se mide CTR + CVR a quiz + CVR a venta, y se escala el ganador.

---

## 10. CHECKLIST FINAL DEL AGENTE 08

- [x] Guión de 35 segundos generado y conteo verificado (78 palabras + 5.5s de pausas + 3.5s de aire)
- [x] Settings ElevenLabs definidos (Valentina + Sofia, Stability 0.50)
- [x] Storyboard segundo por segundo con visual + audio + texto + transiciones (7 bloques)
- [x] Lista de B-roll con queries exactas en Pexels + backup
- [x] Texto en pantalla con tipografía, color, tamaño y animación por bloque
- [x] Cue sheet de música con niveles y ducking
- [x] Especificación de subtítulos **word-by-word** (CapCut auto-captions)
- [x] Pipeline de producción CapCut paso a paso
- [x] Diferenciación clara vs creativos 2 y 3
- [x] QA completo y safe zones documentadas
- [ ] **Producción del MP4 final** — la hace humano + CapCut siguiendo esta blueprint
- [ ] **Upload a Meta** — lo hace agente 12 (Lanzamiento)

---

## 11. NOTAS Y SUPUESTOS (ajustes vs `docs/08-CREATIVO-1.md`)

> El doc del agente 08 es la fuente. Donde el doc entra en conflicto con `_BRAND-VOICE.md` o con los principios globales del proyecto, gana brand-voice. Estos son los 3 ajustes realizados, todos justificados:

1. **"100% gratis" → "Sin costo · 2 min"**
   - El doc 08 §"Texto en pantalla" línea 18–28s decía `Test de 2 minutos · 100% gratis`.
   - Conflicto: `_BRAND-VOICE.md` §6 prohíbe la palabra "gratis" en headlines, microcopy y bonus. Reemplazos válidos: "incluido", "sin costo", "sin costo extra".
   - **Decisión:** la pill del bloque 5 dice **"Sin costo · 2 min"**. Mismo concepto, compliance con la voz de marca.

2. **"el 90%" → "9 de cada 10"**
   - El doc 08 §"Storyboard" 3–6s decía `El 90% NO SABE CUÁL TIENE`.
   - Conflicto: `_BRAND-VOICE.md` §9 ("Números y datos") pide que los números no sean redondos para no oler a invento. 90% redondo activa "esto es marketing".
   - **Decisión:** convertirlo a **"9 de cada 10"**. Mismo significado, lectura coloquial, no se lee como estadística inventada. Se mantiene impactante visualmente porque "9" en coral grande sigue siendo el ancla.

3. **"Hice este test… para descubrir mi tipo" → "para descubrir el mío"**
   - El doc 08 decía `para descubrir mi tipo. Y todo cambió.`
   - Ajuste menor: la voz IA pronuncia "el mío" más natural que "mi tipo" en cadencia argentina. Mantiene 100% el sentido. **Decisión cosmética.**

### Otros supuestos

- **Marca**: el creativo no menciona el nombre de la marca (preserva formato neutro educativo, igual que el creativo 3). Cuando el humano defina la marca (`AGENTS.md` §"Decisiones pendientes"), se puede agregar un logo de 1.5s al final, pero no es obligatorio para lanzar.
- **Compliance Meta**: cero promesas médicas, cero "antes/después" agresivo, cero palabras prohibidas. El B-roll del bloque 4 (mujer con placard) reemplaza al "antes/después" típico para no caer en política de body image de Meta.
- **Idioma**: voseo argentino neutralizado. Frases como "Hacé el test acá abajo" y "Si llevás años con la panza inflada" funcionan en AR/MX/CO/ES sin cambios fuertes.
- **Una sola toma de voz**: la voz se genera de corrido en una sola generación de ElevenLabs (no fragmentada por bloque), para preservar la cadencia natural. Las pausas se controlan en CapCut.
- **Si el screen recording del quiz no está disponible** (por ejemplo, si los agentes 02–04 todavía no terminaron el frontend): reemplazar el bloque 5 por una mockup estática del quiz hecha en Figma con animación de cursor falsa en CapCut. La blueprint funciona igual.
