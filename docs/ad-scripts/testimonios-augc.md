# Kit de producción AUGC — Testimoniales (Agua de Arroz / Protocolo Chau Hinchazón)

Documento con los **textos exactos para los avatares**, los **prompts de video (imagen→video)** usando la imagen del avatar como input, y los **prompts de b-roll**.

## Cómo usarlo (flujo AUGC)
1. Generás la **imagen del avatar** (texto→imagen).
2. Esa imagen es el **input** para el video (imagen→video) + el diálogo.
3. El estado "después" del mismo avatar se genera **imagen→imagen** usando la imagen "antes" como referencia, para mantener la **misma cara**.

> Los prompts visuales están en **inglés** (los modelos de imagen/video responden mejor). Los **diálogos van en español rioplatense** ("vos") y NO se traducen.

---

## Reglas fijas para TODAS las generaciones (consistencia + realismo)
Pegá esto siempre:
```
candid amateur selfie, shot on smartphone front camera, vertical 9:16,
realistic skin texture with pores and imperfections, minimal/no makeup,
natural indoor daylight, slight grain, authentic UGC look, everyday real woman (not a model)
```
**Negative prompt:**
```
beauty filter, airbrushed, studio lighting, professional model, perfect symmetry,
extra fingers, distorted hands, watermark, text, oversharpened
```

Etiquetas: `[IA OK]` = generable con IA · `[FILMAR REAL]` = conviene grabar al caso de éxito real.

---

# TESTIMONIAL 1 (Guión A)

## PASO 1 — IMAGEN: Avatar 1 "antes" (texto→imagen)
```
Candid amateur selfie photo of an everyday Argentine woman, around 38-42 years old,
clearly overweight with a round face and full cheeks, light-medium skin, dark brown
shoulder-length slightly messy hair, minimal makeup, a tired but hopeful expression with
a small natural smile. She wears a loose plain dark-grey t-shirt. She holds up a glass
pitcher of cloudy whitish liquid (rice water) near her chest. Setting: a modest real
Argentine home kitchen — white wall tiles, a fridge with magnets, simple cabinets, a
slightly cluttered counter. Shot on a smartphone front camera at arm's length, eye-level
selfie angle, natural window daylight, realistic skin texture, slight grain, photorealistic,
authentic UGC, vertical 9:16.
Negative: beauty filter, airbrushed, studio lighting, professional model, extra fingers,
distorted hands, watermark, text.
```

## PASO 2 — IMAGEN: Avatar 1 "después" (imagen→imagen, referencia = foto del Paso 1)
```
Using the attached photo as IDENTITY reference: keep the EXACT SAME woman — identical face,
same eyes, same nose, same hair color and length, clearly the same recognizable person.
Show her about 4 weeks later, visibly slimmer and de-bloated: slimmer face, flatter
stomach, healthy glow, bright confident happy smile. She takes a mirror selfie with her
phone, wearing a fitted bordo (burgundy) dress that now flatters her figure. Setting: a
real modest Argentine bedroom, natural daylight. Same amateur smartphone selfie style,
realistic skin texture, slight grain, photorealistic UGC, vertical 9:16. Keep identity
100% consistent with the reference.
Negative: (same as above)
```

## PASO 3 — VIDEOS (imagen→video) + textos exactos del avatar

### Clip 1 — Hook · imagen: Avatar 1 "antes" · `[FILMAR REAL o IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 8-second vertical selfie video. The woman holds
her phone at arm's length and talks directly to camera with natural, casual head and hand
movement, warm hopeful tone, subtle handheld shake, accurate lip-sync. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Hola Naty, te mando este videíto para contarte que ya hice el agua de arroz como me explicaste. Tengo mucha fe de que voy a desinflar esta panza de una vez. Gracias por la ayuda.

### Clip 2 — Reveal · imagen: Avatar 1 "después" · `[FILMAR REAL]`
**Prompt de video:**
```
Animate the attached mirror-selfie image into a realistic 8-second vertical video. The woman
films herself in the mirror, turns slightly to show her body, smiling, happy and proud,
natural movement, accurate lip-sync, handheld feel. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Naty, no sabés. Mirá cómo me queda este jean que tenía guardado hace un montón. Con el agua de arroz desinflé la panza un montón. Me siento mucho más liviana y volví a sentirme yo. Gracias, posta.

### Clip 3 — Escepticismo · imagen: Avatar 1 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical selfie video. The woman talks
to camera with a complicit, slightly ironic smile, natural gestures, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Se reían de mí cuando dije que iba a desinflarme con el truco del agua de arroz. Ni mi marido me tenía fe. Yo vivía hinchada, me sentía un globo todo el día… y mirá ahora.

### Clip 4 — Mecanismo · B-ROLL (ver abajo) + voz en off
**Texto del avatar / VO (exacto):**
> Y es re simple: el agua de arroz calma el intestino y desinflama desde adentro. Un vaso en ayunas y otro antes de cenar. Nada de gimnasio ni vivir a lechuga. Lo armás en dos minutos.

### Clip 5 — Warning · imagen: Avatar 1 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical selfie video. The woman talks
to camera with a playful warning tone, light laugh at the end, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Eso sí, te aviso: no te zarpes, porque el cuerpo deshincha rápido y vas a tener que achicar toda la ropa, je.

### Clip 6 — CTA · imagen: Avatar 1 "después" + screen-recording del test · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical selfie video. The woman points
down (toward a button) and talks to camera with an encouraging tone, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Si querés saber qué te está inflamando a vos, tocá el botón de acá abajo y hacé el test gratis de 2 minutos. Te arma el plan según tu cuerpo. Arrancá hoy.

## B-ROLL — Agua de arroz (para Clip 4) · `[IA OK]`
**Imagen (texto→imagen):**
```
Close-up amateur photo in a real home kitchen: a glass pitcher of cloudy white rice water
next to a bowl of uncooked white rice and a clear glass being filled with the whitish liquid,
on a simple counter, natural daylight, realistic, UGC style, vertical 9:16.
```
**Video (imagen→video):**
```
Animate: hands pouring cloudy white rice water from a pitcher into a clear glass on a kitchen
counter, then placing the glass down, realistic natural motion, close-up, handheld phone style,
6 seconds, no text, 9:16.
```

---

# TESTIMONIAL 2 (Guión B) — otra mujer (que se vea distinta a la Avatar 1)

## PASO 1 — IMAGEN: Avatar 2 "antes" (texto→imagen)
```
Candid amateur selfie photo of an everyday Argentine woman, around 30-34 years old,
overweight, round soft face, fair skin, light brown long wavy hair, no makeup, neutral
slightly insecure expression. She wears a loose black t-shirt and holds a glass of cloudy
whitish liquid (rice water). Setting: a simple Argentine living room — beige wall, a couch,
a framed photo. Smartphone front-camera selfie at arm's length, eye-level, natural daylight,
realistic skin texture, slight grain, photorealistic, authentic UGC, vertical 9:16.
Negative: beauty filter, airbrushed, studio lighting, professional model, extra fingers,
distorted hands, watermark, text.
```

## PASO 2 — IMAGEN: Avatar 2 "después / fit" (imagen→imagen, referencia = Paso 1)
```
Using the attached photo as IDENTITY reference: keep the EXACT SAME woman — identical face
and hair, clearly the same recognizable person. Show her weeks later, visibly slimmer and
de-bloated, flat stomach, toned, healthy glow, confident smile, wearing fitted athletic wear
(leggings + sports top). She talks to camera in a selfie. Setting: same living room or a
bright bedroom, natural daylight. Amateur smartphone selfie style, realistic skin texture,
photorealistic UGC, vertical 9:16. Keep identity 100% consistent with the reference.
Negative: (same as above)
```
> Esta imagen "fit" sirve para el reveal **y** para el clip explicativo (talking head).

## PASO 3 — VIDEOS + textos exactos del avatar

### Clip 1 — Hook · imagen: Avatar 2 "antes"
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical selfie video. The woman talks
to camera, casual hopeful tone, natural movement, accurate lip-sync, handheld. No text. 9:16.
```
**Texto del avatar (exacto):**
> Bueno, hoy finalmente arranco con el truco del agua de arroz que me pasó la nutricionista. A ver qué pasa. Ojalá esta vez pueda desinflar la panza.

### Clip 2 — Reveal · imagen: Avatar 2 "fit"
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical selfie video. The woman shows
herself happy and confident, slight turn to show her body, accurate lip-sync, handheld. 9:16.
```
**Texto del avatar (exacto):**
> Se nota el cambio, ¿no? Mil gracias a mi nutri. Tomé muchísima agua de arroz, pero valió la pena. Chicas, esto funciona de verdad.

### Clip 3 — Explainer / por qué funciona · imagen: Avatar 2 "fit" (talking head) + intercalar b-roll
**Prompt de video:**
```
Animate the attached image into a realistic 10-second vertical selfie video. The woman
explains to camera with confident, friendly tone and natural gestures, accurate lip-sync,
handheld. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> ¿Por qué algo tan simple como el agua de arroz funciona tanto? Es pura biología. Tiene un almidón que calma el intestino, baja la inflamación y alimenta las bacterias buenas. Cortás la causa, no el síntoma. Y se prepara en dos minutos.

### Clip 4 — CTA con warning · imagen: Avatar 2 "fit" + screen-recording del test
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical selfie video. The woman talks
to camera, points down toward a button, encouraging tone, accurate lip-sync, handheld. 9:16.
```
**Texto del avatar (exacto):**
> Si no estás lista para que te quede toda la ropa grande, no lo pruebes. Pero si querés desinflarte de una vez, tocá el botón, completá el test gratis y accedé al plan exacto para tu cuerpo.

## B-ROLL — extra (intercalar en el explainer) · `[IA OK]`
**Imagen:**
```
Close-up amateur photo: a glass of cloudy white rice water on a kitchen counter next to
a small bowl of white rice, soft natural daylight, realistic UGC style, vertical 9:16.
```
**Video:**
```
Animate: slow close-up of a glass of cloudy white rice water with light condensation, a hand
gently lifting it, realistic natural motion, handheld phone style, 5 seconds, no text, 9:16.
```

---

# Orden de edición + textos en pantalla
1. **Testimonial 1:** Clip 1 → 2 → 3 → 4 (b-roll) → 5 → 6.
2. **Testimonial 2:** Clip 1 → 2 → 3 (con b-roll) → 4.
3. Textos en pantalla sugeridos: `Día 1 😮‍💨` · `4 semanas después 🤍` · `👇 TEST GRATIS · 2 MIN`.
4. Música suave + el screen-recording del quiz al final.

## Nota de compliance (Meta / salud)
- Para la versión "oficial" del anuncio, evitá **cifras de kilos garantizadas** y **antes/después de cuerpo**; usá lenguaje de "desinflar / sentirse liviana / que entre la ropa".
- Swap seguro: en vez de "bajé X kilos" → "desinflé la panza y me volvió a entrar la ropa".
