# Imagen estática de VENTA DIRECTA — Agua de Arroz / Protocolo Chau Hinchazón

Esta es la pieza **full ad (NO UGC)** donde se **vende directamente**: imagen producida /
cinematográfica, direct-response, que le apunta **directo a la persona**, con titular + bajada +
CTA **renderizados por la IA dentro de la imagen**.

> Los **2 ads de video son los UGC AI** del documento `testimonios-augc.md` (esos se conservan
> tal cual). Acá solo trabajamos la **imagen estática de venta**.

## Flujo de producción
1. Generás la **imagen** (texto→imagen) con el prompt de abajo: ya incluye el texto del anuncio.
2. Usá un modelo que renderice bien tipografía (ej. Gemini / "Nano Banana", GPT-Image, Ideogram).
   Si algún texto sale con un error de letra, regenerá o retocá ese detalle en el editor.

> Prompts visuales en **inglés** (mejor adherencia). El **texto del anuncio va entre comillas y
> en español rioplatense** dentro del prompt, para que la IA lo escriba tal cual.
> Formato `9:16` (feed/stories) — al final hay nota para `1:1` y `4:5`.

## Negative prompt anti-"cara de IA" (pegar siempre)
```
AI look, plastic skin, airbrushed, waxy skin, over-saturated, beauty-filter, symmetrical
perfect face, doll-like, uncanny, extra fingers, distorted hands, deformed face, warped
background, melting objects, watermark, logos, misspelled text, garbled letters
```
> Nota: ya NO bloqueamos "embedded text/captions" porque ahora QUEREMOS que la IA escriba el
> texto. Solo bloqueamos texto mal escrito (`misspelled text, garbled letters`).

## Keywords que hacen que NO parezca IA (incluir siempre)
```
photorealistic, real skin texture with pores and fine lines, natural minimal makeup, realistic
hair with flyaways, shallow depth of field, cinematic commercial lighting, filmic color grade,
subtle film grain, 35mm look, crisp legible typography
```

---

# 🖼️ VARIANTE A — "El problema" (mujer presionándose la panza)

### PROMPT (texto→imagen, con el texto del anuncio incluido)
```
Photorealistic vertical 9:16 advertising photograph (NOT a selfie, NOT UGC). A real-looking
Argentine woman in her 30s-40s by a bright window, gently pressing her stomach with a slightly
uncomfortable but hopeful expression, wearing simple fitted clothing. Clean, modern,
aspirational home setting with soft natural light, professional commercial composition with
generous negative space at the TOP for the headline. Shallow depth of field, true-to-life skin
texture with pores and subtle imperfections, natural makeup, realistic hair. On a side table,
softly out of focus: a glass of cloudy rice water and a small bowl of white rice. Editorial
wellness-ad aesthetic, warm natural color grade, high detail, photoreal.
Render this exact Spanish ad text with clean, modern, legible typography:
- Headline (top, large bold): "No es grasa. Es tu panza inflamada."
- Subheadline (below, smaller): "Descubrí qué alimentos te inflan y desinflá en 7 días con el método del agua de arroz."
- CTA button (bottom, high-contrast pill): "Hacé el test gratis"
Keep all text correctly spelled in Spanish, well-aligned and readable.
Negative: AI look, plastic skin, airbrushed, waxy, over-saturated, beauty-filter, symmetrical
perfect face, extra fingers, distorted hands, warped background, watermark, logos, misspelled
text, garbled letters.
```

---

# 🖼️ VARIANTE B — "El alivio / aspiracional" (mujer liviana y feliz)

### PROMPT (texto→imagen, con el texto del anuncio incluido)
```
Photorealistic vertical 9:16 advertising photograph (NOT a selfie, NOT UGC). A real-looking
Argentine woman in her 30s by a sunny window, smiling, relaxed and confident, one hand resting
lightly on a flat, comfortable stomach, wearing simple fitted clothing. Bright airy aspirational
home setting, soft natural light, professional commercial composition with generous negative
space at the TOP for the headline. Shallow depth of field, true-to-life skin texture with pores
and subtle imperfections, natural minimal makeup, realistic hair. On a side table softly out of
focus: a glass of cloudy rice water and a small bowl of white rice. Editorial wellness-ad
aesthetic, warm hopeful color grade, high detail, photoreal.
Render this exact Spanish ad text with clean, modern, legible typography:
- Headline (top, large bold): "Volvé a sentirte liviana."
- Subheadline (below, smaller): "El método del agua de arroz desinflama desde adentro. Sin dietas ni gimnasio."
- CTA button (bottom, high-contrast pill): "Empezá el test de 2 min"
Keep all text correctly spelled in Spanish, well-aligned and readable.
Negative: AI look, plastic skin, airbrushed, waxy, over-saturated, beauty-filter, symmetrical
perfect face, extra fingers, distorted hands, warped background, watermark, logos, misspelled
text, garbled letters.
```

---

# 🖼️ VARIANTE C — "Producto / mecanismo héroe" (foco en el agua de arroz)

### PROMPT (texto→imagen, con el texto del anuncio incluido)
```
Photorealistic vertical 9:16 advertising still life (NOT UGC). Hero shot of a clear glass of
cloudy white rice water on a clean light kitchen counter, a small bowl of white rice and a few
rice grains beside it, fresh and natural, soft directional morning light, water condensation
and subtle droplets, shallow depth of field, generous negative space at the TOP for the
headline. Premium commercial food/wellness photography, clean minimal aesthetic, warm natural
color grade, high detail, photoreal.
Render this exact Spanish ad text with clean, modern, legible typography:
- Headline (top, large bold): "El truco del agua de arroz que es furor."
- Subheadline (below, smaller): "Calma el intestino y desinflama la panza. Descubrí tu plan en el test gratis."
- CTA button (bottom, high-contrast pill): "Hacé el test gratis"
Keep all text correctly spelled in Spanish, well-aligned and readable.
Negative: AI look, over-saturated, plastic, warped objects, extra elements, watermark, logos,
misspelled text, garbled letters.
```

---

## Texto de cada variante (por si querés montarlo a mano o retocarlo)
**Variante A:**
- Titular: `No es grasa. Es tu panza inflamada.`
- Bajada: `Descubrí qué alimentos te inflan y desinflá en 7 días con el método del agua de arroz.`
- CTA: `Hacé el test gratis →`

**Variante B:**
- Titular: `Volvé a sentirte liviana.`
- Bajada: `El método del agua de arroz desinflama desde adentro. Sin dietas ni gimnasio.`
- CTA: `Empezá el test de 2 min →`

**Variante C:**
- Titular: `El truco del agua de arroz que es furor.`
- Bajada: `Calma el intestino y desinflama la panza. Descubrí tu plan en el test gratis.`
- CTA: `Hacé el test gratis →`

---

## Recomendación de uso
- Arrancá testeando **Variante A (problema)** vs **Variante B (alivio)** — son los dos ángulos
  emocionales opuestos y suelen definir rápido cuál conecta.
- **Variante C** sirve como creativo de apoyo / retargeting y para reforzar el mecanismo.

## Notas
- **Texto generado por la IA:** los modelos actuales (Gemini/"Nano Banana", GPT-Image, Ideogram)
  renderizan tipografía bien. Igual revisá la ortografía en español; si una letra sale mal,
  regenerá o corregí ese detalle puntual en el editor.
- **Por qué no parece IA:** keywords de piel/poros/luz + composición de foto comercial real.
- **Otros formatos:** para `1:1` (feed) y `4:5` cambiá `vertical 9:16` por `square 1:1` o
  `vertical 4:5` y dejá el espacio para el titular arriba o al costado.
- **Compliance Meta (salud):** apuntar a características personales ("tu panza inflamada") puede
  tener fricción. Alternativas más seguras para la versión que escala: `¿Cansada de vivir
  hinchada?` · `Deshinchá la panza en 7 días` · `Sentite liviana otra vez`. Evitá cifras de
  kilos garantizadas y antes/después de cuerpo.
