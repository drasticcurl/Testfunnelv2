# CREATIVO 2 — "No es grasa, es inflamación" (disrupción de creencia)
## Meta Ads · 9:16 · 40 segundos · Sin cámara · Sin voz humana

> **Output esperado:** `outputs/creativos/creativo-2-disrupcion.mp4`
> **Este archivo es la blueprint completa para producirlo en CapCut + ElevenLabs + B-roll.**

---

## Resumen ejecutivo

| | |
|---|---|
| Ángulo | Disrupción de creencia — "lo que pensabas que era grasa, no era grasa" |
| Formato | Voz IA + B-roll + texto en pantalla. Sin cámara, sin voz humana real |
| Estética | Confrontativo, alto contraste, "before/after" visual de un mismo día |
| Aspect ratio | 9:16 (1080×1920) |
| Duración | 40 segundos exactos |
| Voz | ElevenLabs — **Valentina** (es-LA) |
| Música | Tensión que crece + **drop frame-perfect en el segundo 6** ("no es grasa") |
| Subtítulos | Obligatorios (80% del público mira sin sonido) |
| CTA final | Click al ad → landing del quiz |

---

## 1. GUIÓN PARA ELEVENLABS

> **Cómo leerlo:** las marcas `[pausa corta]` (0.4s) y `[pausa media]` (0.8s) son micro-respiros. La pausa más importante es la del segundo 6, donde la voz para 0.4s ANTES de "no es grasa" y la música hace el drop simultáneo.

```
Si tu panza está plana a la mañana,
[pausa corta]
e hinchada a la noche,

[pausa media]

no es grasa. [pausa corta] Es inflamación.
[pausa corta]
Y se va en siete días.

[pausa media]

Hay doce alimentos que comés todos los días
creyendo que son saludables.
[pausa corta]
Y en realidad están inflamando tu intestino.

[pausa media]

Hice este test rápido para identificar
cuáles afectan a mi tipo de cuerpo.

[pausa corta]

Acabás con la hinchazón en siete días.
[pausa corta]
Te dejo el link.
```

**Conteo aproximado:**
- 67 palabras
- A 175 palabras/min (ritmo enfático, confrontativo) → **~23 segundos de voz**
- + 17 segundos de pausas, B-roll silente y impacto visual del drop → **40 segundos exactos**

### Settings ElevenLabs

| Parámetro | Valor | Por qué |
|---|---|---|
| Voz | **Valentina** (es-LA) | Spec del brief 09 |
| Stability | **0.45** | Más bajo que creativo 3 (0.60). Suena más enfático y "anuncio que te interpela", no íntimo |
| Similarity | **0.75** | Mantiene el timbre |
| Style | **0.40** | Más alto que creativo 3 (0.25). Suma intensidad en "no es grasa" |
| Speaker Boost | Activado | — |
| Output | MP3 128 kbps | — |
| Nombre del archivo | `voz-creativo-2-valentina.mp3` | — |

### Tip de ejecución en ElevenLabs

1. Pegá el guión COMPLETO en una sola generación, reemplazando `[pausa corta]` por `,` o `...` y `[pausa media]` por `. ...` según cómo responda mejor el modelo.
2. Si la pausa entre "a la noche" y "no es grasa" no quedó de al menos **0.6s**, partí el clip en CapCut y agregá silencio. Esa pausa es la más importante del creativo: es donde cae el drop musical.
3. Generá UNA sola versión definitiva — los A/B de voz se hacen en el creativo 3, este lleva solo Valentina.

---

## 2. STORYBOARD SEGUNDO POR SEGUNDO

> Cada bloque tiene: tiempo, visual, audio (voz + música + SFX), texto en pantalla, transición.
> El creativo se divide en **6 bloques** (frames del brief original expandidos).

### Bloque 1 — Hook visual (0–3s)
| Campo | Valor |
|---|---|
| Visual | **Split-screen vertical**, dividido al 50% por una línea sand `#D4C5A9` de 4px. Lado izquierdo (0–540px): mujer de costado a la mañana, panza plana, remera blanca, luz dorada de ventana. Lado derecho (540–1080px): mismo encuadre, **mismo outfit**, panza visiblemente hinchada, luz más cálida-tenue de la tarde. Etiquetas pequeñas en cada lado: `7:00 AM` / `8:00 PM` (Inter 500, charcoal, 32px) |
| Animación | El lado derecho aparece con un fade-in de 800ms desde el segundo 0.5. La línea divisoria se traza de arriba hacia abajo (300ms ease-out) |
| Audio voz | "Si tu panza está plana a la mañana," |
| Música | Pad de cuerdas en tensión, con pulso de subgrave subiendo. Nivel `-10dB` |
| Texto en pantalla | **PANZA PLANA A LA MAÑANA** — slide desde la derecha (800ms ease-out) hasta posición final en la mitad superior (y=320px). Fraunces 700, 72px, charcoal con stroke blanco 4px |
| Transición salida | Sin corte: el split sigue, el zoom comienza a moverse hacia el lado derecho |

### Bloque 2 — Foco en el problema (3–6s)
| Campo | Valor |
|---|---|
| Visual | El split-screen se transforma: el lado izquierdo se desliza hacia afuera (motion blur 200ms) y el lado derecho ocupa toda la pantalla con un slow zoom-in del 5% sobre la panza hinchada. Color grading: tonos cálidos saturados un punto más. Etiqueta pequeña `8:00 PM` queda en esquina superior izquierda |
| Animación | Texto del bloque 1 sale por la izquierda mientras entra el del bloque 2 por la derecha (cross-slide encadenado) |
| Audio voz | "e hinchada a la noche," |
| Música | Pad sigue construyendo. Entra un riser blanco creciente entre el segundo 4.5 y el 6 (tipo "build-up de drop") |
| Texto en pantalla | **HINCHADA A LA NOCHE** — slide desde la izquierda (800ms ease-out) hasta y=320px. Fraunces 700, 72px, charcoal con stroke blanco 4px. La palabra `HINCHADA` con un sutil shake horizontal de ±2px en loop |
| SFX | Sub-bass pulse de 1Hz creciente (felt, no oído) |
| Transición salida | **Cut a negro frame-perfect en el segundo 6.0**, simultáneo con el drop musical |

### Bloque 3 — EL DROP / REFRAME (6–10s)
> **Este es el bloque clave del creativo. Todo el creativo se construye alrededor de este momento.**

| Campo | Valor |
|---|---|
| Visual | **Pantalla 100% negra `#0A0A0A`** durante 0.4s de silencio absoluto (la pausa post-"a la noche"). Después aparece el texto. Sin B-roll, sin imagen — solo tipografía. Esto rompe el patrón visual del creativo y obliga a leer. |
| Animación texto | A los 6.4s la frase **NO ES GRASA** aparece con un **pop-in agresivo** (scale-up de 0.6 a 1.0 en 200ms) + shake horizontal de ±8px durante 300ms. Acompañado del drop. A los 7.8s aparece debajo **ES INFLAMACIÓN** con pop-in similar pero más suave. A los 9s aparece debajo en tamaño menor "Y se va en 7 días" |
| Audio voz | (silencio 0.4s) → "no es grasa." (silencio 0.3s) → "Es inflamación." (pausa) → "Y se va en siete días." |
| Música | **DROP FRAME-PERFECT en el segundo 6.0**. Caída del riser, kick grave (808-style) sincronizado al "no es grasa". Beat se asienta a tempo medio-alto (~96–100 BPM) con kick + clap |
| Texto en pantalla | Línea 1 (6.4–10s): **NO ES GRASA.** — Fraunces 700, 120px, color `#FFFFFF` blanco puro<br>Línea 2 (7.8–10s): **ES INFLAMACIÓN.** — Fraunces 700, 96px, color `#E07856` coral<br>Línea 3 (9–10s): "Y se va en 7 días" — Inter 500, 48px, color `#9B9890` gray-400 |
| SFX | "Boom" cinemático grave en el segundo 6.0 exacto (-3dB, sidechain con la música). Sutil "whoosh" cuando entra "ES INFLAMACIÓN" |
| Transición salida | Fade rápido a cream `#FAF7F2` de 200ms |

### Bloque 4 — La revelación / autoridad concreta (10–18s)
| Campo | Valor |
|---|---|
| Visual primaria | B-roll: bowl de yogurt natural con granola y arándanos sobre mesa de madera, luz natural cálida (típica foto "healthy breakfast"). Plano cenital fijo. Duración 4s. |
| Visual secundaria | A los 14s, cut a una **grilla 3×4 de 12 alimentos "saludables"** sobre fondo cream-warm `#F4EFE6`. Cada celda con una foto pequeña: yogurt, banana, palta, manzana, granola, leche de almendras, brócoli crudo, lentejas, hummus, manzana verde, atún en lata, pasas. Sobre cada foto entra un **sello rojo `#C25450` con la palabra "INFLAMA"** en cadena (uno cada 250ms) |
| Animación grilla | Las 12 fotos están desde el inicio en grilla. Los sellos rojos entran encadenados desde la celda superior izquierda hasta la inferior derecha (3 segundos en total) |
| Audio voz | "Hay doce alimentos que comés todos los días creyendo que son saludables. Y en realidad están inflamando tu intestino." |
| Música | Beat se mantiene tempo medio-alto. Capa de hi-hats entra sutil al segundo 14 |
| Texto en pantalla | Hook superior (10–14s): **"Doce alimentos que creés saludables"** — Fraunces 600, 56px, charcoal, slide-up<br>Hook superior (14–18s): **"12 ALIMENTOS OCULTOS"** — Fraunces 700, 80px, charcoal, palabra `OCULTOS` en `#E07856` coral con leve glow `#F5C7B6`. Fade-in lento (1s) |
| SFX | Stamp seco "thunk" cada vez que cae un sello rojo (-12dB) |
| Transición salida | Whip-pan derecha de 200ms |

### Bloque 5 — La solución / quiz (18–28s)
| Campo | Valor |
|---|---|
| Visual primaria (18–24s) | **Screen recording del quiz** sobre fondo cream-warm. Plano cenital del celular tipo "tablet shot": un dedo (mockeable con cursor + zoom) selecciona opciones y la barra de progreso avanza. Acelerar el recording 1.4× para que se vea ágil. Mostrar al menos 3 preguntas y un avance del 80%+ en la barra |
| Visual secundaria (24–28s) | Cut al cierre del quiz: pantalla del resultado con el badge del tipo de hinchazón (ej. "INFLAMATORIA VESPERTINA") apareciendo con scale-in. Highlight verde sage en el badge |
| Audio voz | "Hice este test rápido para identificar cuáles afectan a mi tipo de cuerpo." |
| Música | Beat se mantiene. Entra una capa de pad cálido + bell sintético sutil para sumar "esperanza" |
| Texto en pantalla | (18–24s) **"Test rápido · 2 minutos"** — Inter 600, 56px, charcoal con badge sage-soft `#E8EFE9` redondeado, slide-up<br>(24–28s) **"Identificá tu tipo"** — Inter 600, 48px, charcoal, fade-in |
| SFX | Tap suave (-15dB) cada vez que el dedo selecciona una opción del quiz. Chime corto al aparecer el badge del resultado |
| Transición salida | Cut seco al bloque 6 |

### Bloque 6 — CTA (28–40s)
| Campo | Valor |
|---|---|
| Visual | Mockup del PDF "**Protocolo Anti-Hinchazón: Plan de 7 Días**" sobre fondo cream-warm `#F4EFE6`. PDF flotando con sombra suave (shadow-lg), levemente inclinado a -3°, posicionado al centro-superior de la pantalla. A los 32s entra el botón pill coral debajo |
| Animación CTA | A los 32s, el botón pill `#E07856` aparece con bounce-up desde abajo (600ms ease-out con overshoot). La flecha 👉 oscila suave en loop (translate-x ±4px, 1.5s) |
| Audio voz | (28–32s) "Acabás con la hinchazón en siete días." → (32–40s) "Te dejo el link." |
| Música | Beat sostenido con kick + sub. Resuelve a un acorde cálido sostenido a partir del 36s, fade-out gradual desde el 38s |
| Texto en pantalla | Línea 1 (28–32s): **"7 DÍAS"** — Fraunces 700, 96px, charcoal con halo coral-soft `#F5C7B6`, scale-in<br>Línea 2 (32–40s): **"👉 LINK EN BIO"** *(ver nota más abajo)* — Inter 700 uppercase, 56px, white sobre coral pill (`border-radius: 999px`, padding 24px×64px), bounce-up + flecha animada<br>Microcopy debajo del CTA (34–40s): "Sin tarjeta · Resultado al instante" — Inter 400, 28px, gray-400 |
| End frame | A los 39.5s queda fijo el mockup + CTA medio segundo (frame estático) para que Meta lo capture como thumbnail |

> **Nota sobre el CTA "LINK EN BIO":** el brief 09 pide literalmente `LINK EN BIO`. Para **paid ads en Meta** el copy correcto es `TOCA PARA EMPEZAR` o `MÁS INFORMACIÓN` (porque el ad tiene click directo y no hay "bio"). Recomendación: producir **dos variantes** del bloque 6 (una con `LINK EN BIO` para feed orgánico tipo UGC fake, otra con `TOCA PARA EMPEZAR` para paid). Ver sección 10 (Notas y supuestos).

---

## 3. B-ROLL — LISTA DE COMPRAS

> Buscar en este orden: **Pexels (gratis)** → **Storyblocks** → custom (Midjourney 9:16 si no se encuentra).

| # | Tiempo | Tipo | Query exacta | Duración necesaria | Notas |
|---|---|---|---|---|---|
| 1a | 0–6s | Pexels | `flat stomach morning woman side profile`, `woman white tshirt belly morning light` | 6s | Lado izquierdo del split. Mujer de costado, panza plana, luz dorada matinal. Sin cara o cara fuera de cuadro |
| 1b | 0–6s | Pexels | `bloated stomach evening woman`, `woman holding bloated belly home` | 6s | Lado derecho del split. Misma estética, panza hinchada. **Idealmente el mismo outfit blanco** que el clip 1a para reforzar el "es la misma persona, mismo día" |
| 1-alt | 0–6s | Custom (Midjourney) | `same woman 40s side profile, white tshirt, neutral kitchen background, soft natural lighting, before flat stomach / after bloated stomach, photorealistic, 9:16 ratio` | 6s × 2 | Backup si no se encuentra el match perfecto en stock. Generar 2 imágenes idénticas con única diferencia: panza plana vs hinchada |
| 2 | 6–10s | Custom | (no aplica) | 4s | Generado en CapCut con texto sobre fondo negro `#0A0A0A`. No requiere B-roll |
| 3 | 10–14s | Pexels | `healthy yogurt bowl granola berries`, `breakfast bowl natural light overhead` | 4s | Plano cenital. Mesa de madera o cream. Luz cálida natural |
| 4 | 14–18s | Custom | (no aplica — grilla de 12 fotos) | 4s | Crear en Canva una grilla 3×4 con 12 alimentos. Lista de imágenes individuales (Pexels): `yogurt natural bowl`, `banana flat lay`, `avocado half`, `apple red`, `granola bowl`, `almond milk glass`, `broccoli raw`, `lentils bowl`, `hummus bowl`, `green apple`, `tuna can`, `raisins pile`. Animar los sellos rojos en CapCut |
| 5a | 18–24s | Custom (screen recording) | (grabar el quiz en `localhost:3000/quiz` o el deploy de Vercel) | 6s | QuickTime / OBS. Recorrer 3–4 preguntas + barra de progreso. Acelerar 1.4× en CapCut. Mockear cursor de dedo con un PNG de tap |
| 5b | 24–28s | Custom (screenshot) | (página de resultados de Vercel, capturar el badge del tipo de hinchazón) | 4s | Screenshot real del `/resultados` con un perfil severidad-alta para que se vea el badge "INFLAMATORIA VESPERTINA" o equivalente |
| 6 | 28–40s | Custom | Mockup del PDF en `outputs/pdfs/protocolo-anti-hinchazon-7-dias.pdf` | 12s | Smartmockups.com (template "ebook flat") o Canva. PNG transparente, sombra incluida. Levemente inclinado a -3° |

### Filtros de selección de B-roll

- ✅ Sin cara visible (o cara fuera de cuadro / desenfocada). El creativo es **sin cámara** según AGENTS.md
- ✅ Mujer 32–55 que matchee el avatar
- ✅ Luz natural cálida, NO clínica
- ✅ Estética hogar real, no editorial
- ❌ Stock obvio (modelos perfectas, sets de revista)
- ❌ Tonos azules fríos
- ❌ Quirófano, médico, laboratorio, enfermera
- ❌ "Antes/después" agresivo en el bloque 1 — buscamos **mismo día, distinto momento**, no "perdió 10 kilos"

### Compliance Meta — Body image

El bloque 1 (split-screen mañana/noche) puede activar la política de body image de Meta si se ve como "transformación de pérdida de peso". **Mitigación:**
- Ambas imágenes deben mostrar **la misma persona el mismo día** (mismo outfit, mismo fondo).
- Etiquetas explícitas `7:00 AM` y `8:00 PM` para reforzar que es el mismo día.
- En el copy de la voz nunca decimos "bajó de peso" — decimos "se va la inflamación".
- Si Meta rechaza, alternativa: reemplazar el split de personas por un split de **prendas de ropa** (jean abrochado a la mañana / mismo jean apretado a la noche) o **mediciones con cinta métrica de panza** sin mostrar persona.

---

## 4. TEXTO EN PANTALLA — ESPECIFICACIONES

> Todas las fuentes Google Fonts free. Charcoal `#2D3A2E`. Coral `#E07856`. Cream `#FAF7F2`. White `#FFFFFF`.

| # | Texto | Fuente | Peso | Tamaño (px en 1080×1920) | Color | Animación | Tiempo |
|---|---|---|---|---|---|---|---|
| 1 | **PANZA PLANA A LA MAÑANA** | Fraunces | 700 | 72 | charcoal con stroke blanco 4px | slide-in desde la derecha (800ms ease-out) | 0–3s |
| 2 | **HINCHADA A LA NOCHE** | Fraunces | 700 | 72 | charcoal con stroke blanco 4px (`HINCHADA` con shake horizontal ±2px loop) | slide-in desde la izquierda (800ms ease-out) | 3–6s |
| 3a | **NO ES GRASA.** | Fraunces | 700 | 120 | white `#FFFFFF` sobre fondo negro | pop-in (scale 0.6→1.0, 200ms) + shake ±8px (300ms) | 6.4–10s |
| 3b | **ES INFLAMACIÓN.** | Fraunces | 700 | 96 | coral `#E07856` sobre fondo negro | pop-in suave (scale 0.8→1.0, 250ms) | 7.8–10s |
| 3c | "Y se va en 7 días" | Inter | 500 | 48 | gray-400 `#9B9890` sobre fondo negro | fade-in 400ms | 9–10s |
| 4a | "Doce alimentos que creés saludables" | Fraunces | 600 | 56 | charcoal | slide-up 500ms | 10–14s |
| 4b | **12 ALIMENTOS OCULTOS** | Fraunces | 700 | 80 | charcoal + `OCULTOS` en coral con halo coral-soft | fade-in lento (1s) | 14–18s |
| 4-stamps | "INFLAMA" (×12) | Inter | 800 | 28 | white sobre `#C25450` con rotación -8° tipo sello | encadenados (250ms entre cada uno) | 14–18s |
| 5a | **Test rápido · 2 minutos** | Inter | 600 | 56 | charcoal sobre badge `#E8EFE9` sage-soft pill | slide-up 500ms | 18–24s |
| 5b | **Identificá tu tipo** | Inter | 600 | 48 | charcoal | fade-in 400ms | 24–28s |
| 6a | **7 DÍAS** | Fraunces | 700 | 96 | charcoal con halo coral-soft | scale-in 500ms + glow | 28–32s |
| 6b | **👉 LINK EN BIO** *(o **TOCA PARA EMPEZAR** para paid)* | Inter | 700 uppercase | 56 (botón pill) | white sobre coral, `border-radius: 999px`, padding 24×64px | bounce-up 600ms (overshoot) + flecha animada | 32–40s |
| 6c | "Sin tarjeta · Resultado al instante" | Inter | 400 | 28 | gray-400 | fade-in 400ms | 34–40s |

### Safe zones 9:16 (1080×1920)

- Margen vertical superior: **220px** (evitar header de UI de Instagram/Reels)
- Margen vertical inferior: **480px** (evitar caption + CTA del Reel + nav bar)
- Margen lateral: **80px**
- Centro de seguridad: 80–1000 px horizontal, 220–1440 px vertical

> Todo texto crítico (hooks, CTA, drop) debe estar dentro de **80–1000 px horizontal** y **360–1280 px vertical**. El texto del bloque 3 (drop) está exactamente en el centro vertical (y=960px) para máximo impacto.

---

## 5. MÚSICA — CUE SHEET

> Buscar en **Epidemic Sound** (preferido) o **Artlist**. Una pista única que tenga **build-up + drop frame-perfect**.

### Queries sugeridas

1. `cinematic build drop tension reveal`
2. `trailer build drop epic hopeful`
3. `pop drop reveal beat 100bpm`
4. `tension build big drop modern`

### Cue sheet por bloque

| Tiempo | Sección musical | Nivel relativo | Elementos activos |
|---|---|---|---|
| 0–3s | Pad de tensión | -10 dB | Cuerdas en sostenida + sub-bass |
| 3–6s | Build-up | -8 dB → -4 dB | + riser blanco creciente, sub-bass pulse 1Hz |
| **6.0s** | **DROP frame-perfect** | **0 dB** | **Kick 808 + boom cinemático + clap** |
| 6–10s | Beat asentado tempo medio-alto | -3 dB | Kick + clap, ~96–100 BPM. Pad cálido de fondo |
| 10–14s | Mantenimiento | -6 dB | Beat sigue, voz se eleva |
| 14–18s | + Hi-hats | -5 dB | Capa rítmica para acompañar la grilla animada |
| 18–24s | Pad cálido + bell | -7 dB | Suaviza para "vibe esperanzadora" |
| 24–28s | Mantenimiento + chime | -6 dB | Mantiene energía con un toque de "achievement" |
| 28–32s | Beat sostenido | -5 dB | Kick + sub. Energía para el CTA |
| 32–38s | Resolución cálida | -7 dB | Acorde sostenido cálido |
| 38–40s | Fade-out | -∞ | Fade-out gradual hasta silencio en el frame final |

### Reglas de ducking

- Cuando entra voz: música baja **5 dB automáticamente** (sidechain ducking en CapCut). Excepto en el bloque 3 donde la música y la voz están sincronizadas a propósito.
- En el segundo 6.0 NO hay ducking — el drop debe golpear a volumen pleno (+0 dB) durante 200ms antes de que entre la voz.
- Pausas de voz: música vuelve a su nivel natural en 200ms.

### El drop — instrucciones específicas

> **Este es el momento que vende el creativo. Si el drop no está sincronizado al frame, el creativo pierde 50% de su efecto.**

1. Localizar el momento exacto del kick principal del drop en la pista de música.
2. Alinear ese frame al **frame 180 del timeline** (segundo 6.0 a 30 fps).
3. Verificar que el "boom" cinemático cae **simultáneo** con el primer carácter de **NO ES GRASA**.
4. Test ciego: pasar el video con auriculares y los ojos cerrados — el drop solo debe hacerte abrir los ojos. Si no, ajustar.

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
| Highlight de palabra hablada | ON sobre `NO ES GRASA` y `INFLAMACIÓN` (palabra activa en coral `#E07856`) |
| Sincronización | Frame-perfect con la voz |

> En el bloque 3 (6–10s) los **subtítulos se OMITEN** — el texto en pantalla del drop ya domina la composición. Subtítulo redundante satura.

---

## 7. PIPELINE DE PRODUCCIÓN — PASO A PASO

> Tiempo estimado total: **15–20 minutos** una vez que tenés todos los assets.

### Pre-producción (10 min)
1. Generar voz en ElevenLabs con settings de la sección 1 — exportar `voz-creativo-2-valentina.mp3`.
2. Descargar B-roll de la lista de la sección 3 (Pexels). Guardar en `assets-creativo-2/`.
3. Bajar pista de música de Epidemic Sound con drop (`musica-creativo-2.mp3`).
4. Generar mockup del PDF en Smartmockups (PNG transparente).
5. Hacer screen recording del quiz (40s en QuickTime o OBS) en el deploy de Vercel actual.
6. Crear la grilla 3×4 de 12 alimentos en Canva (PNG con fondo cream-warm).

### Producción en CapCut (15 min)
1. **Nuevo proyecto** 9:16 / 1080×1920 / 30fps.
2. **Pista 1 (audio principal):** importar `voz-creativo-2-valentina.mp3`. Marcar timeline.
3. **Pista 2 (música):** importar pista de Epidemic. **Alinear el kick del drop al frame 180 (segundo 6.0)**. Aplicar ducking auto con la pista 1 (-5dB), excepto en el bloque 3.
4. **Pista 3 (B-roll):** colocar los clips siguiendo los tiempos del storyboard.
5. **Pista 4 (texto en pantalla):** crear cada texto con la spec de la sección 4. Animar.
6. **Pista 5 (subtítulos):** auto-captions → corregir → omitir en el bloque 3.
7. **Transiciones:** seguir las marcadas en el storyboard. Cut frame-perfect al negro en el segundo 6.0.
8. **SFX:** boom cinemático en 6.0, stamp seco para los sellos del bloque 4, tap suave en el quiz, chime al badge de resultado, swoosh en "ES INFLAMACIÓN".
9. **Color grading:** preset "Warm cinematic" suave en bloques de B-roll (1, 3 lifestyle, 5, 6).
10. **Export:** 1080×1920 / 30fps / H.264 / 12 Mbps / MP4. Nombre: `creativo-2-disrupcion.mp4`.

### Variantes a generar
- `creativo-2-disrupcion.mp4` (versión final con `LINK EN BIO`)
- `creativo-2-disrupcion-paid.mp4` (variante con `TOCA PARA EMPEZAR` — recomendada para Meta Ads CBO)

> Subir las 2 al mismo ad set. Después de 48h con $20-30/día, dejar la ganadora.

### QA antes de subir
- [ ] Duración exacta entre 39 y 41 segundos
- [ ] **Drop frame-perfect en segundo 6.0** (validar con timeline + auriculares)
- [ ] Voz audible cuando hay música (test con auriculares)
- [ ] Subtítulos sincronizados frame-perfect
- [ ] Subtítulos omitidos correctamente en bloque 3 (6–10s)
- [ ] Textos críticos dentro de safe zones de 9:16
- [ ] CTA "LINK EN BIO" / "TOCA PARA EMPEZAR" visible últimos 8 segundos
- [ ] End frame estático medio segundo final (thumbnail Meta)
- [ ] Cero promesas médicas en voz o texto
- [ ] Cero palabra "gratis" (ver nota en sección 10)
- [ ] Cero emojis decorativos en frases serias
- [ ] Tono confrontativo/revelador, NO íntimo
- [ ] Split-screen mañana/noche cumple compliance de body image (mismo outfit, mismo día)

---

## 8. POSICIONAMIENTO RESPECTO A CREATIVOS 1 Y 3

| | Creativo 1 — Curiosidad | **Creativo 2 — Disrupción (este)** | Creativo 3 — Frustración |
|---|---|---|---|
| Hook emocional | "¿Cuál de los 4 tipos sos?" | **"No es grasa, es inflamación"** | "Probé todo y nada funcionó" |
| Tono de voz | Informativo, intrigante | **Confrontativo, revelador** | Confesional, íntimo |
| Voz ElevenLabs | Valentina | **Valentina** | Valentina + Sofia (A/B) |
| Stability | 0.45 | **0.45** | 0.60 |
| Style | 0.30 | **0.40** | 0.25 |
| Música | Beat moderado | **Tensión + drop frame-perfect en s6** | Acústica → build |
| Estética | Educativa | **Alto contraste, momento "ah" disruptivo** | Diary entry / UGC fake |
| Avatar al que pega más fuerte | Problem aware **curiosa** | Problem aware **confundida** ("¿esto es grasa o no?") | Problem aware **frustrada** después de probar todo |
| Duración | ~30s (asumido) | **40s** | 45s |

Los 3 entran por ángulos distintos al **mismo destino** (la landing del quiz). En Meta CBO se prueban contra los 3 y se escala el ganador.

---

## 9. CHECKLIST FINAL DEL AGENTE 09

- [x] Guión de 40 segundos generado y conteo verificado
- [x] Settings ElevenLabs definidos (Valentina, Stability 0.45, Style 0.40)
- [x] Storyboard segundo por segundo con visual + audio + texto + transiciones (6 bloques)
- [x] **Drop frame-perfect en segundo 6.0** documentado con instrucciones específicas
- [x] Lista de B-roll con queries exactas y backup (incluye custom Midjourney prompt)
- [x] Texto en pantalla con tipografía, color, tamaño y animación por bloque
- [x] Cue sheet de música con niveles, ducking y momento del drop
- [x] Especificación de subtítulos (con regla de omisión en bloque 3)
- [x] Pipeline de producción CapCut paso a paso
- [x] Diferenciación clara vs creativos 1 y 3
- [x] QA y safe zones documentadas
- [x] Compliance de body image en bloque 1 mitigado
- [ ] **Producción del MP4 final** — la hace humano + CapCut siguiendo esta blueprint
- [ ] **Upload a Meta** — lo hace agente 12 (Lanzamiento)

---

## 10. NOTAS Y SUPUESTOS

- **Conflicto "Test gratis de 2 min" del brief vs `_BRAND-VOICE.md`:** el brief 09 propone como texto en pantalla **"Test gratis de 2 min"** en el bloque 5. Pero `_BRAND-VOICE.md` (regla #6) prohíbe explícitamente usar la palabra **"gratis"**. Se respeta el brand voice → texto reemplazado por **"Test rápido · 2 minutos"** + microcopy de CTA `"Sin tarjeta · Resultado al instante"` que comunica el mismo mensaje. Documento aquí el cambio para que sea visible en code review.

- **CTA "LINK EN BIO" del brief vs convención de paid ads:** el brief pide `LINK EN BIO`, pero los Meta Ads pagos no tienen "bio" — el ad lleva click directo. Solución: producir **dos variantes del bloque 6** — una con `LINK EN BIO` (estética UGC fake / orgánico) y otra con `TOCA PARA EMPEZAR` (paid). Ambas se testean.

- **Fondo negro en el bloque 3 vs design system cream:** `_DESIGN-SYSTEM.md` recomienda fondo cream o blanco para creativos. Se rompe la regla deliberadamente en el bloque 3 (6–10s, 4 segundos) por dos razones: (1) máximo contraste = máximo impacto en el momento del drop; (2) cambio brusco de paleta refuerza la sensación de "reframe / momento ah". Es la única excepción del creativo. El resto se queda en cream.

- **Marca:** el creativo no menciona nombre de marca para mantener formato limpio. Si en el momento del lanzamiento la marca está definida, agregarla solo como watermark sutil en la esquina inferior izquierda del bloque 6 (CTA) en gray-400 28px.

- **Compliance Meta — body image:** el split-screen del bloque 1 está cuidadosamente diseñado para mostrar **el mismo día / misma persona / mismo outfit**, no una transformación de pérdida de peso. Las etiquetas `7:00 AM` / `8:00 PM` lo refuerzan visualmente. Si Meta rechaza igual, plan B documentado en sección 3 (split de prendas o cinta métrica).

- **Compliance Meta — promesas médicas:** la voz dice "no es grasa, es inflamación" y "se va en 7 días". Ambas frases están dentro del lenguaje permitido por `_BRAND-VOICE.md` (regla #5). NO decimos "cura SIBO", "elimina la disbiosis crónica" ni "te garantiza salud intestinal". El "se va en 7 días" se refiere a la **hinchazón visible**, no a una cura médica.

- **Una sola toma de voz:** la voz se genera de corrido en una sola pasada de ElevenLabs. Esto preserva la cadencia confrontativa-reveladora natural y hace que la pausa del segundo 6 suene orgánica, no editada.

- **Si Pexels no tiene los clips del split:** alternativa documentada con prompt de Midjourney (sección 3, fila `1-alt`).
