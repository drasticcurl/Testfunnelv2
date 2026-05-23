# 08 — AGENTE CREATIVO 1: "Los 4 Tipos de Hinchazón" (curiosidad)

> **Rol:** producir el primer creativo para Meta Ads, sin cámara, ángulo de **curiosidad y auto-descubrimiento**.

## Output

- **Guión completo** para ElevenLabs (35 segundos)
- **Storyboard** detallado (qué visual va en cada segundo)
- **Lista de B-roll** para Pexels/Storyblocks (búsquedas exactas)
- **Lista de textos en pantalla** para CapCut (sincronizados con la voz)
- **Indicaciones de música y subtítulos**
- **Output esperado del humano:** `outputs/creativos/creativo-1-curiosidad.mp4`

## Especificaciones técnicas

| | |
|---|---|
| Formato | Vertical 9:16, 1080×1920 |
| Duración | 35 segundos exactos |
| Subtitulado | Word-by-word, obligatorio |
| Hook | 0–3 segundos críticos |
| CTA | Final con texto + flecha |
| Voz | ElevenLabs, "Valentina" (Spanish-LA, femenina, cálida) |
| Música | Tensión sutil → resolución, -18dB con voz |

## Storyboard segundo por segundo

| Tiempo | Visual | Audio (voz IA) | Texto en pantalla |
|---|---|---|---|
| 0–3s | B-roll: zoom en panza hinchada (mujer mirándose al espejo, plano de torso, sin cara) | "Existen 4 tipos de hinchazón abdominal…" | **EXISTEN 4 TIPOS DE HINCHAZÓN** |
| 3–6s | Texto pantalla completa con ícono de signo de pregunta | "…y el 90% de las mujeres no sabe cuál tiene." | **El 90% NO SABE CUÁL TIENE** |
| 6–12s | Cuatro thumbnails con ilustración simple de cada tipo | "Hinchazón matutina. Postprandial. Vespertina. Crónica persistente." | Tipo 1 / Tipo 2 / Tipo 3 / Tipo 4 |
| 12–18s | B-roll: mujer probándose ropa, frustrada (sin cara) | "Si llevás años con la panza inflada y nada te funcionó, probablemente estás atacando el tipo equivocado." | "Probaste todo y nada funcionó" |
| 18–28s | Captura de pantalla del quiz funcionando | "Hice este test de 2 minutos para descubrir mi tipo. Y todo cambió." | "Test de 2 minutos · 100% gratis" |
| 28–35s | Pantalla con CTA grande, animación de flecha | "Hacé el test acá abajo." | **👉 HACELO ACÁ — LINK EN PERFIL** |

## Guión completo para ElevenLabs

> **Texto que pegás literal en ElevenLabs**:

```
Existen cuatro tipos de hinchazón abdominal.
Y el noventa por ciento de las mujeres no sabe cuál tiene.

Tipo uno, matutina. Tipo dos, postprandial.
Tipo tres, vespertina. Tipo cuatro, crónica persistente.

Si llevás años con la panza inflada y nada te funcionó,
probablemente estás atacando el tipo equivocado.

Hice este test de dos minutos para descubrir mi tipo.
Y todo cambió.

Hacé el test acá abajo.
```

### Settings ElevenLabs

- **Voz:** Valentina (Spanish - Latin America)
- **Stability:** 50
- **Similarity:** 75
- **Style:** 30
- **Output:** MP3, 128 kbps
- **Naming:** `voz-creativo-1.mp3`

## B-roll necesario (Pexels/Storyblocks/Unsplash)

Buscar en Pexels (gratis, comercial OK) o Storyblocks (free trial):

| Clip # | Búsqueda exacta | Duración | Uso |
|---|---|---|---|
| 1 | `stomach bloating closeup` | 4 seg | Hook 0–3s |
| 2 | `woman mirror morning` | 3 seg | Apoyo 3–6s |
| 3 | (custom-made en CapCut) | 6 seg | 4 tipos thumbnails 6–12s |
| 4 | `frustrated woman home clothes` | 6 seg | 12–18s |
| 5 | (screen recording del quiz funcionando) | 10 seg | 18–28s |

**Si no encontrás algunos clips**, usar transiciones con texto a pantalla completa cubriéndolos.

## Música

- **Estilo:** instrumental con tensión sutil que resuelve
- **Fuente:** Epidemic Sound / YouTube Audio Library / CapCut library
- **Sugerencias de búsqueda:** "lifestyle uplifting", "wellness corporate", "calm motivational"
- **Volumen:** -18 dB cuando hay voz; -12 dB cuando no hay voz

## Subtítulos

- **Generar con CapCut:** Auto Captions → Spanish (Latin America)
- **Revisar palabra por palabra:** la voz IA puede tener pequeños desajustes
- **Tipografía:** Montserrat Bold o Inter Black
- **Tamaño:** 60% del tamaño del texto principal
- **Color:** blanco con stroke negro 2px
- **Posición:** centrado, parte baja-media de la pantalla

## Texto en pantalla (no es el subtítulo)

| Texto | Animación CapCut | Tiempo |
|---|---|---|
| **EXISTEN 4 TIPOS DE HINCHAZÓN** | Pop-in (escalar) | 0–3s |
| **El 90% NO SABE CUÁL TIENE** | Slide-up | 3–6s |
| Tipo 1 → Tipo 2 → Tipo 3 → Tipo 4 | Aparece uno por uno con tick | 6–12s |
| "Probaste todo y nada funcionó" | Fade-in | 12–18s |
| "Test de 2 minutos · 100% gratis" | Slide-up | 18–28s |
| **👉 HACELO ACÁ — LINK EN PERFIL** | Bounce + flecha animada | 28–35s |

## Pipeline de producción (15 minutos)

### Paso 1 — Generar voz (5 min)
1. Pegar guión en ElevenLabs
2. Settings: Voz Valentina, Stability 50, Similarity 75, Style 30
3. Generate → Download MP3
4. Guardar como `voz-creativo-1.mp3`

### Paso 2 — Buscar B-roll (5 min)
1. Buscar los clips de la tabla en Pexels
2. Descargar al menos 2 opciones de cada uno (por si hay algo mejor)
3. Guardar en `outputs/creativos/raw-broll/`

### Paso 3 — Editar en CapCut (10 min)
1. New project → 9:16 (TikTok/Reels)
2. Importar voz IA
3. Cortar B-roll y sincronizar con la voz
4. Agregar texto en pantalla según tabla (con animaciones)
5. Auto-captions → Spanish (LA) → revisar
6. Música de fondo (-18dB con voz)
7. Color grade → preset "Warm" o "Cinematic"
8. Export 1080×1920, MP4, alta calidad
9. Guardar como `outputs/creativos/creativo-1-curiosidad.mp4`

## Reglas no negociables

1. **Hook en los primeros 3 segundos.** Si no detiene el scroll, todo lo demás no importa.
2. **Subtítulos siempre.** 85% de la audiencia mira sin sonido.
3. **CTA visible al cierre.** "Link en perfil" o "swipe up" o "más info abajo".
4. **Sin marca de agua.** Ni de CapCut, ni de Pexels, ni de Storyblocks.
5. **Estética cálida.** Color grade tipo "Warm" o "Cinematic", no muy saturado.

## Test de calidad antes de exportar

- [ ] ¿Detiene el scroll en los primeros 3 segundos?
- [ ] ¿Se entiende sin sonido?
- [ ] ¿La voz IA suena natural (sin distorsión robótica)?
- [ ] ¿Los textos en pantalla son legibles en mobile?
- [ ] ¿El CTA queda claro?
- [ ] ¿No hay marca de agua?

## Output del humano

- Archivo: `outputs/creativos/creativo-1-curiosidad.mp4`
- Tamaño objetivo: < 50 MB
- Listo para subir a Meta Ads Manager

## Checklist agente 08

- [ ] Guión de 35 segundos generado
- [ ] Storyboard segundo por segundo definido
- [ ] Lista de B-roll con búsquedas exactas
- [ ] Texto en pantalla por bloque
- [ ] Settings de ElevenLabs especificados
- [ ] Indicaciones de subtítulos y música
- [ ] Pipeline de 15 min documentado
