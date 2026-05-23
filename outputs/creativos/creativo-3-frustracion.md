# CREATIVO 3 — "Probé todo y nada me funcionó" (frustración → esperanza)
## Meta Ads · Reel UGC fake · 9:16 · 45 segundos

> **Output esperado:** `outputs/creativos/creativo-3-frustracion.mp4`
> **Este archivo es la blueprint completa para producirlo en CapCut + ElevenLabs + B-roll.**

---

## Resumen ejecutivo

| | |
|---|---|
| Ángulo | Frustración → esperanza |
| Formato | UGC fake (sin cara, sin voz humana real) |
| Estética | "Diary entry" — más íntimo que creativos 1 y 2 |
| Aspect ratio | 9:16 (1080×1920) |
| Duración | 45 segundos exactos |
| Voz | ElevenLabs — A/B entre **Valentina** y **Sofia** |
| Música | Acústica al inicio, building hacia el final |
| Subtítulos | Obligatorios (80% del público mira sin sonido) |
| CTA final | "Hacelo acá" → click al ad → landing del quiz |

---

## 1. GUIÓN PARA ELEVENLABS

> **Cómo leerlo:** las marcas `[pausa corta]` (0.6s) y `[pausa media]` (1.2s) se insertan en ElevenLabs como pausas reales (split del texto en 2 generaciones unidas en CapCut). Las comillas y puntos van tal cual al input.

```
Probé todo. [pausa corta] Y nada me funcionó.

[pausa media]

Keto. Ayuno intermitente. Detox de tres días.
Té de boldo. Probióticos.

[pausa corta]

Hasta que descubrí que el problema no era lo
que comía de más. [pausa corta] Era lo que no sacaba.

[pausa media]

Hice un test rápido y descubrí los doce alimentos
"saludables" que estaban inflamando mi panza.

[pausa corta]

En siete días me bajó visiblemente. [pausa corta] Y no recaí.

[pausa media]

Te dejo el test que hice abajo.
```

**Conteo aproximado:**
- 88 palabras
- A 165 palabras/min (ritmo íntimo, más lento que los otros 2 creativos) → **~32 segundos de voz**
- + 13 segundos de pausas, B-roll silente y respiración → **45 segundos exactos**

### Settings ElevenLabs (íntimos, A/B Valentina vs Sofia)

| Parámetro | Valor | Por qué |
|---|---|---|
| Voz A (primaria) | **Valentina** (es-AR / es-LATAM) | Match natural del voseo argentino |
| Voz B (test) | **Sofia** (es-ES neutra) | Sirve si vamos a expandir a México/Colombia/España |
| Stability | **0.60** | Más alto que creativos 1 y 2 (que iban en 0.45). Suena más íntimo, menos "marketing" |
| Similarity | **0.75** | Mantiene el timbre de la voz original |
| Style | **0.25** | Ligeramente menos enfático — diary entry, no anuncio |
| Speaker Boost | **Activado** | — |
| Output | MP3 128 kbps | — |
| Nombre del archivo | `voz-creativo-3-valentina.mp3` y `voz-creativo-3-sofia.mp3` | Generar las 2 versiones |

> **Nota:** los creativos 1 y 2 usan Stability 0.45 (más enfático). Este creativo usa **0.60 a propósito** para que suene como una mujer que está contando algo que le pasó, no leyendo un libreto.

### Tip de ejecución en ElevenLabs

1. Pegá el guión COMPLETO en una sola generación (no fragmentado), con las marcas de pausa como `...` (puntos suspensivos) si la versión de ElevenLabs no soporta `[pausa]`.
2. Si alguna pausa quedó corta, partí el audio en CapCut y agregale 200–400ms.
3. Generá las 2 versiones (Valentina y Sofia) — vas a A/B testearlas en Meta CBO.

---

## 2. STORYBOARD SEGUNDO POR SEGUNDO

> Cada bloque tiene: tiempo, visual, audio (voz + música + SFX), texto en pantalla, transición.

### Bloque 1 — Hook (0–3s)
| Campo | Valor |
|---|---|
| Visual | Fondo `#FAF7F2` (cream). Texto enorme animado, tipografía **Fraunces 700** color `#2D3A2E` (charcoal). Sin imagen. |
| Animación | Typewriter — escribe letra por letra a ~25 chars/s. La frase se completa al segundo 2.4 |
| Audio voz | "Probé todo. [pausa corta] Y nada me funcionó." |
| Música | Guitarra acústica suave fade-in desde `-12dB`, sola, sin percusión |
| Texto en pantalla | **PROBÉ TODO Y NADA FUNCIONÓ** (centro vertical, max-width 80%) |
| Transición salida | Cut seco al bloque 2 (no fade) |

### Bloque 2 — Lista de fracasos (3–10s)
| Campo | Valor |
|---|---|
| Visual | Fondo cream. 5 ítems en columna vertical, alineados a la izquierda con padding 8% lateral. Cada ítem: emoji ❌ + palabra en **Inter 600** charcoal. |
| Animación | Cada ítem aparece de a uno cada 1.2s con slide-up + un trazo rojo `#C25450` de izquierda a derecha tachando la palabra (300ms ease-out, justo cuando termina la voz dice esa palabra) |
| Audio voz | "Keto. Ayuno intermitente. Detox de tres días. Té de boldo. Probióticos." |
| Música | Acústica continúa. Sutil percusión de palmas suaves entra al segundo 6 |
| Texto en pantalla | ❌ **Keto** · ❌ **Ayuno intermitente** · ❌ **Detox 3 días** · ❌ **Té de boldo** · ❌ **Probióticos** |
| SFX | Mini "swoosh" muy sutil (-18dB) cuando aparece cada tachón |
| Transición salida | Fade-to-white de 300ms |

### Bloque 3 — Reframe / momento "ah" (10–18s)
| Campo | Valor |
|---|---|
| Visual | B-roll: mujer cansada, codo en mesa, mano en la sien (sin cara, plano de hombros y manos). Color grading levemente desaturado, tono cálido. Plano fijo, sin paneo. |
| Animación texto | Frase aparece sobre el B-roll con stroke blanco 4px para legibilidad. Fade-in de 600ms en 2 partes: primero "El problema no era lo que comía DE MÁS", después de un beat aparece "Era lo que NO sacaba" |
| Audio voz | "Hasta que descubrí que el problema no era lo que comía de más. [pausa corta] Era lo que no sacaba." |
| Música | Acústica suaviza (-3dB), entra un pad cálido de fondo |
| Texto en pantalla | "El problema no era lo que comía **DE MÁS**" → "Era lo que **NO SACABA**" (la segunda parte aparece con la palabra `NO SACABA` en `#E07856` coral) |
| Transición salida | Cut con flash blanco de 100ms |

### Bloque 4 — Solución / autoridad concreta (18–28s)
| Campo | Visual |
|---|---|
| Visual primaria | Screen recording del quiz: dedo seleccionando opciones (mockear con mouse cursor + zoom), barra de progreso avanzando. Plano cenital del celular sobre cream. |
| Visual secundaria | Cut a una grilla 3×4 con fotos minúsculas de 12 alimentos "saludables" (palta, banana, yogur natural, manzana, brócoli crudo, lentejas, etc.) — cada una con un mini ❌ que aparece en cadena |
| Audio voz | "Hice un test rápido y descubrí los doce alimentos saludables que estaban inflamando mi panza." |
| Música | Beat sube a tempo medio. Entra un kick suave + clap |
| Texto en pantalla | "12 alimentos OCULTOS" (slide-up, Fraunces 700 charcoal, palabra `OCULTOS` en coral con leve glow) |
| SFX | Tap suave cuando el dedo selecciona en el quiz |
| Transición salida | Whip-pan derecha 200ms |

### Bloque 5 — Resultado (28–38s)
| Campo | Valor |
|---|---|
| Visual | B-roll: mujer parada de costado en remera blanca holgada, panza relajada (sin cara). Luz natural cálida. Levemente boomerang (loop de 1s ida-vuelta) para no exigir un "antes/después" forzado. |
| Animación texto | Frase aparece con scale-in + glow sutil coral. Mantiene 4s en pantalla. |
| Audio voz | "En siete días me bajó visiblemente. [pausa corta] Y no recaí." |
| Música | Build máximo: percusión, kick más presente, una nota sostenida cálida. Mood "uplifting" sin ser épico |
| Texto en pantalla | "**7 días después**" en Fraunces 700, color charcoal, con un sutil halo en `#F5C7B6` coral-soft |
| Transición salida | Cut seco al bloque 6 |

### Bloque 6 — CTA (38–45s)
| Campo | Valor |
|---|---|
| Visual | Mockup del PDF "Protocolo Anti-Hinchazón: Plan de 7 Días" sobre fondo `#F4EFE6` cream-warm. PDF flotando con sombra suave (rotación 3°). A los 41s entra el botón pill coral debajo. |
| Animación CTA | Botón pill `#E07856` aparece con bounce desde abajo. La flecha 👉 oscila suave (loop) |
| Audio voz | "Te dejo el test que hice abajo." |
| Música | Resuelve a un acorde cálido sostenido, fade-out gradual desde 43s |
| Texto en pantalla | Línea 1: "**HACÉ EL TEST**" (Inter 700 uppercase, charcoal). Línea 2 (CTA pill): **👉 EMPEZAR EL TEST** (Inter 600, white sobre coral, rounded-full) |
| End frame | A los 44.5s queda fijo el mockup + CTA medio segundo (frame estático) para que el algoritmo de Meta lo capture como thumbnail |

---

## 3. B-ROLL — LISTA DE COMPRAS

> Buscar en este orden: **Pexels (gratis)** → **Storyblocks** → custom en CapCut.

| # | Tiempo | Tipo | Query exacta | Duración necesaria | Notas |
|---|---|---|---|---|---|
| 1 | 0–3s | Custom | (no aplica) | 3s | Generado en CapCut con texto + fondo cream |
| 2 | 3–10s | Custom | (no aplica) | 7s | Lista de tachones generada en CapCut con texto animado |
| 3 | 10–18s | Pexels | `tired woman couch home`, `woman hand on temple kitchen`, `frustrated woman home` | 8s | Sin cara o cara fuera de cuadro. Plano cerrado |
| 3-alt | 10–18s | Pexels | `woman holding stomach bloated` | 8s | Backup si el 3 no funciona |
| 4a | 18–24s | Custom | (screen recording del quiz) | 6s | Grabar en QuickTime/OBS un recorrido por las primeras 5 preguntas. Acelerar 1.5×. Mockear con cursor de dedo |
| 4b | 24–28s | Pexels / custom | `healthy food flat lay` + grilla 12 fotos | 4s | Crear grilla 3×4 en Canva, animar tachones en CapCut |
| 5 | 28–38s | Pexels | `confident woman home flat stomach`, `woman white tshirt belly` | 10s | Sin cara. Cuerpo + remera blanca. Luz cálida natural |
| 6 | 38–45s | Custom | Mockup del PDF en `outputs/pdfs/protocolo-anti-hinchazon-7-dias.pdf` | 7s | Generar mockup en https://smartmockups.com/ o Canva. PDF tipo "ebook flat" |

### Filtros de selección de B-roll

- ✅ Sin cara visible (o cara fuera de cuadro / desenfocada)
- ✅ Mujer 32–55 que matchee el avatar
- ✅ Luz natural cálida, NO clínica
- ✅ Estética cottage / casa real / no sobre-producida
- ❌ Stock obvio (modelos perfectas, decorados de revista)
- ❌ Tonos azules fríos
- ❌ Quirófano, laboratorio, médico

---

## 4. TEXTO EN PANTALLA — ESPECIFICACIONES

> Todas las fuentes Google Fonts free. Charcoal `#2D3A2E`. Coral `#E07856`. Cream `#FAF7F2`.

| # | Texto | Fuente | Peso | Tamaño (px en 1080×1920) | Color | Animación | Tiempo |
|---|---|---|---|---|---|---|---|
| 1 | **PROBÉ TODO Y NADA FUNCIONÓ** | Fraunces | 700 | 96 | charcoal | typewriter (25 chars/s) | 0–3s |
| 2 | ❌ Keto / ❌ Ayuno intermitente / ❌ Detox 3 días / ❌ Té de boldo / ❌ Probióticos | Inter | 600 | 64 | charcoal + tachón coral `#C25450` | slide-up encadenado (1.2s entre cada uno) | 3–10s |
| 3a | "El problema no era lo que comía **DE MÁS**" | Fraunces | 600 (italic) | 72 | charcoal con stroke blanco 4px | fade-in 600ms | 10–14s |
| 3b | "Era lo que **NO SACABA**" | Fraunces | 700 | 80 | charcoal + `NO SACABA` en coral | fade-in 600ms (después de 3a) | 14–18s |
| 4 | **12 alimentos OCULTOS** | Fraunces | 700 | 88 | charcoal + `OCULTOS` en coral con glow | slide-up 400ms | 18–28s |
| 5 | **7 días después** | Fraunces | 700 | 96 | charcoal con halo coral-soft | scale-in 500ms + glow | 28–38s |
| 6a | **HACÉ EL TEST** | Inter | 700 uppercase | 72 | charcoal | fade-in 300ms | 38–45s |
| 6b | 👉 **EMPEZAR EL TEST** | Inter | 600 | 56 (botón pill) | white sobre coral, `border-radius: 999px` | bounce-up 600ms | 41–45s |

### Safe zones 9:16

- Margen vertical superior: **220px** (evitar header de UI de Instagram)
- Margen vertical inferior: **480px** (evitar caption + CTA del Reel + nav bar)
- Margen lateral: **80px**
- Centro de seguridad: 80–1000 px horizontal, 220–1440 px vertical

> Todo texto crítico (hooks, CTA) debe estar dentro de 80–1000 px horizontal y 360–1280 px vertical.

---

## 5. MÚSICA — CUE SHEET

> Buscar en **Epidemic Sound** (preferido) o **Artlist**. Pista única, no mix de varias.

### Queries sugeridas

1. `personal story uplifting acoustic`
2. `diary intimate guitar building`
3. `confessional warm guitar drums`
4. `intimate folk hopeful build`

### Cue sheet por bloque

| Tiempo | Sección musical | Nivel relativo | Elementos activos |
|---|---|---|---|
| 0–3s | Intro acústica sola | -12 dB | Guitarra fingerpicking |
| 3–10s | Acústica + palmas | -10 dB | + palmas suaves al 6s |
| 10–18s | Pad cálido + acústica | -8 dB | Entra un pad de fondo, voz se eleva |
| 18–28s | Build medio | -6 dB | Entra kick + clap suaves |
| 28–38s | Drop / climax controlado | -3 dB | Kick más presente, sostenida cálida |
| 38–43s | Resolución | -6 dB | Vuelve a acústica + sostenida |
| 43–45s | Fade-out | -∞ | Fade-out gradual hasta silencio |

### Reglas de ducking

- Cuando entra voz: música baja **6 dB automáticamente** (sidechain ducking en CapCut)
- Pausas de voz: música vuelve a su nivel natural en 200ms

---

## 6. SUBTÍTULOS

> Obligatorios. 80% del público mira con sonido off.

| Atributo | Valor |
|---|---|
| Generador | CapCut auto-captions → corregir manualmente |
| Fuente | Inter 700 |
| Tamaño | 56px |
| Color | white `#FFFFFF` |
| Stroke | charcoal `#2D3A2E` 4px |
| Background | none (solo el stroke da legibilidad) |
| Posición | y = 1300px (zona safe inferior, arriba del CTA del Reel) |
| Max chars por línea | 24 |
| Max líneas | 2 |
| Highlight de palabra hablada | OFF (mantenemos minimalismo "diary entry") |
| Sincronización | Frame-perfect con la voz |

> Si el bloque ya tiene texto en pantalla GRANDE como hook, el subtítulo se omite ese bloque para no saturar.

---

## 7. PIPELINE DE PRODUCCIÓN — PASO A PASO

> Tiempo estimado total: **15–20 minutos** una vez que tenés todos los assets.

### Pre-producción (10 min)
1. Generar voz en ElevenLabs con settings de la sección 1 — exportar 2 versiones (Valentina + Sofia) como `voz-creativo-3-valentina.mp3` y `voz-creativo-3-sofia.mp3`.
2. Descargar B-roll de la lista de la sección 3 (Pexels). Guardar en una carpeta local `assets-creativo-3/`.
3. Bajar pista de música de Epidemic Sound (`musica-creativo-3.mp3`).
4. Generar mockup del PDF en Smartmockups (PNG transparente).
5. Hacer screen recording del quiz (40s en QuickTime, después aceleramos en CapCut).

### Producción en CapCut (15 min)
1. **Nuevo proyecto** 9:16 / 1080×1920 / 30fps.
2. **Pista 1 (audio principal):** importar `voz-creativo-3-valentina.mp3`. Marcar timeline.
3. **Pista 2 (música):** importar pista de Epidemic. Aplicar **ducking auto** con la pista 1 (-6 dB).
4. **Pista 3 (B-roll):** colocar los 6 clips siguiendo los tiempos del storyboard.
5. **Pista 4 (texto en pantalla):** crear cada texto con la spec de la sección 4. Animar.
6. **Pista 5 (subtítulos):** auto-captions → corregir.
7. **Transiciones:** seguir las marcadas en el storyboard (cut seco / fade-to-white / whip-pan).
8. **SFX:** agregar swooshes y taps según storyboard.
9. **Color grading:** preset "Warm cinematic" suave en bloques de B-roll.
10. **Export:** 1080×1920 / 30fps / H.264 / 12 Mbps / MP4. Nombre: `creativo-3-frustracion.mp4`.

### Variantes a generar (A/B en Meta CBO)
- `creativo-3-frustracion-valentina.mp4` (voz Valentina)
- `creativo-3-frustracion-sofia.mp4` (voz Sofia)

> Subir las 2 al mismo ad set inicialmente. Después de 48h con $20-30/día, dejar la ganadora.

### QA antes de subir
- [ ] Duración exacta entre 44 y 46 segundos
- [ ] Voz audible cuando hay música (test con auriculares)
- [ ] Subtítulos sincronizados frame-perfect
- [ ] Textos críticos dentro de safe zones de 9:16 (no tapados por la UI de Instagram/Reels)
- [ ] CTA "EMPEZAR EL TEST" visible los últimos 4 segundos
- [ ] End frame estático medio segundo final (thumbnail Meta)
- [ ] Cero promesas médicas en voz o texto
- [ ] Cero palabra "gratis"
- [ ] Cero emojis decorativos en frases serias
- [ ] Tono "diary entry", no "marketing screaming"

---

## 8. POSICIONAMIENTO RESPECTO A CREATIVOS 1 Y 2

| | Creativo 1 — Curiosidad | Creativo 2 — Disrupción | Creativo 3 — Frustración (este) |
|---|---|---|---|
| Hook emocional | "¿Cuál de los 4 tipos sos?" | "No es grasa, es inflamación" | "Probé todo y nada funcionó" |
| Tono de voz | Informativo, intrigante | Confrontativo, revelador | Confesional, íntimo |
| Stability ElevenLabs | 0.45 | 0.45 | **0.60** |
| Música | Beat moderado | Beat con drops | **Acústica → build** |
| Estética | Educativa | Disruptiva | **Diary entry / UGC fake** |
| Avatar al que pega más fuerte | Problem aware curiosa | Problem aware confundida | Problem aware **frustrada después de probar** |

Los 3 entran por ángulos distintos al **mismo destino** (la landing del quiz). En Meta CBO se prueban contra los 3 y se escala el ganador.

---

## 9. CHECKLIST FINAL DEL AGENTE 10

- [x] Guión de 45 segundos generado y conteo verificado
- [x] Settings ElevenLabs definidos (Valentina + Sofia, Stability 0.60)
- [x] Storyboard segundo por segundo con visual + audio + texto + transiciones
- [x] Lista de B-roll con queries exactas y backup
- [x] Texto en pantalla con tipografía, color, tamaño y animación por bloque
- [x] Cue sheet de música con niveles y ducking
- [x] Especificación de subtítulos
- [x] Pipeline de producción CapCut paso a paso
- [x] Diferenciación clara vs creativos 1 y 2
- [x] QA y safe zones documentadas
- [ ] **Producción del MP4 final** — la hace humano + CapCut siguiendo esta blueprint
- [ ] **Upload a Meta** — lo hace agente 12 (Lanzamiento)

---

## 10. NOTAS Y SUPUESTOS

- **Marca**: usé `[MARCA]` implícito; el creativo no menciona nombre de marca para preservar el formato UGC fake.
- **Compliance Meta**: cero promesas médicas, cero "antes/después" agresivo, cero palabras prohibidas ("gratis", "perdé X kg", "cura"). El B-roll del bloque 5 es deliberadamente **boomerang loop** y no un antes/después clásico, justamente para no caer en política de body image de Meta.
- **Si Pexels no tiene el clip exacto**: backup en Storyblocks con la misma query. Si tampoco, generar con Midjourney (ratio 9:16, prompt: `woman 40s home kitchen warm light cottage style, no face, hands resting on counter, soft natural lighting, real not stock`).
- **Idioma**: voseo argentino neutralizado. La frase "te dejo el test que hice abajo" funciona en AR/MX/CO/ES sin cambios.
- **Una sola toma de voz**: la voz se genera de corrido, no por bloques. Esto preserva la cadencia "diary entry" natural.
