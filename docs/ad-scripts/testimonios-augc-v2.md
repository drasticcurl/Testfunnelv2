# Kit de producción AUGC — Testimoniales V2 (Agua de Arroz / Protocolo Chau Hinchazón)

> **Tanda nueva de testimoniales** construidos sobre los **2 guiones que ya funcionaron**
> (ver `testimonios-augc.md`, Testimonial 1 y 2). Mismo molde ganador
> (hook → reveal de transformación → escepticismo/prueba social → mecanismo "biología
> de almacén" → warning psicología inversa → CTA test gratis), pero con **4 arquetipos
> de mujer distintos** y un **antes/después de "gorda → flaca" bien marcado** (pedido
> explícito: que el cambio se note mucho).

## Por qué estos arquetipos
La idea es cubrir distintos avatares del target (mujeres AR 25-65) para que cada una se
identifique con "una como yo". Los arquetipos:

| # | Arquetipo | Edad | Gancho emocional | Cambio visual |
|---|---|---|---|---|
| 3 | **Mamá reciente / postparto** | ~30 | "No me iba la panza de embarazo" | Sobrepeso postparto → cuerpo recuperado |
| 4 | **Señora de la menopausia** | ~55 | "Pensé que a mi edad ya estaba" | Sobrepeso marcado → notablemente más delgada |
| 5 | **La que probó TODO (escéptica)** | ~45 | "Se reían de mí / ni yo me tenía fe" | Obesidad → mucho más flaca |
| 6 | **El vestido del casamiento (deadline)** | ~35 | "Tenía un evento y no me entraba nada" | Sobrepeso → flaca, entra el vestido |
| 7 | **Señora de la tercera edad (sentada)** | ~55-65 | "A mi edad ya está, dejate de joder" | Sobrepeso → notablemente más delgada |

> Cada testimonial usa una **mujer distinta y reconocible** (cara, edad, contexto de casa).
> El antes/después se genera con IA manteniendo **la misma identidad** entre tomas.

---

## Cómo usarlo (flujo AUGC) — igual que el kit V1
1. Generás la **imagen del avatar "antes"** (texto→imagen).
2. Esa imagen es el **input** del video (imagen→video) + el diálogo.
3. El estado **"después / flaca"** del mismo avatar se genera **imagen→imagen** usando la
   imagen "antes" como referencia, para mantener **la misma cara**.

> Prompts visuales en **inglés**. **Diálogos en español rioplatense ("vos")** — NO se traducen.

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

Etiquetas: `[IA OK]` = generable con IA · `[FILMAR REAL]` = conviene grabar al caso real
(el reveal en espejo y los antes/después reales convierten más).

> **Marcar bien el "gorda → flaca":** en el PASO 1 (antes) el prompt pide cuerpo con
> **sobrepeso claro, panza hinchada, cara redonda**; en el PASO 2 (después) pide
> **visiblemente más delgada, panza plana, cara afinada**, misma persona. Cuanto más
> contraste, más fuerte el reveal. (Ver nota de compliance al final para la versión que escala.)

---

# TESTIMONIAL 3 (Arquetipo: mamá reciente / postparto) — Avatar 3

## PASO 1 — IMAGEN: Avatar 3 "antes" (texto→imagen)
```
Candid amateur selfie photo of an everyday Argentine young mom, around 29-32 years old,
clearly overweight with noticeable postpartum belly bloating, round full face and double chin,
fair skin, dark wavy hair tied in a messy bun, no makeup, tired but hopeful expression. She
wears a loose oversized grey nursing t-shirt that hides her stomach. She holds a glass of
cloudy whitish liquid (rice water). Setting: a real modest Argentine apartment living room with
baby items in the background (a baby playmat, a stroller softly out of focus). Smartphone front
camera selfie at arm's length, eye-level, natural window daylight, realistic skin texture,
slight grain, photorealistic, authentic UGC, vertical 9:16.
Negative: beauty filter, airbrushed, studio lighting, professional model, extra fingers,
distorted hands, watermark, text.
```

## PASO 2 — IMAGEN: Avatar 3 "después / flaca" (imagen→imagen, referencia = Paso 1)
```
Using the attached photo as IDENTITY reference: keep the EXACT SAME woman — identical face,
same eyes, same nose, same hair color, clearly the same recognizable person. Show her about
6 weeks later, DRAMATICALLY slimmer and de-bloated: slim face with defined jawline (no double
chin), clearly flat toned stomach, healthy glow, bright confident happy smile. She takes a
mirror selfie wearing fitted high-waisted jeans and a tucked-in fitted top that show her flat
stomach. Same modest apartment, natural daylight. Amateur smartphone selfie style, realistic
skin texture, slight grain, photorealistic UGC, vertical 9:16. Keep identity 100% consistent
with the reference; only the body and face slimness change.
Negative: (same as above)
```

## PASO 3 — VIDEOS (imagen→video) + textos exactos del avatar

### Clip 1 — Hook · imagen: Avatar 3 "antes" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 8-second vertical selfie video. The young mom holds
her phone at arm's length and talks directly to camera with a tired but hopeful tone, natural
head and hand movement, subtle handheld shake, accurate lip-sync. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Hola, hoy arranco con el truco del agua de arroz que me pasó la nutri. Hace ocho meses que nació mi bebé y la panza de embarazo no se me va más. A ver si esta vez la desinflo de una vez.

### Clip 2 — Reveal de transformación · imagen: Avatar 3 "después / flaca" · `[FILMAR REAL]`
**Prompt de video:**
```
Animate the attached mirror-selfie image into a realistic 8-second vertical video. The woman
films herself in the mirror, turns to the side to show her now-flat stomach, smiling, proud and
emotional, natural movement, accurate lip-sync, handheld feel. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Mirá cómo me quedó la panza. No lo puedo creer. Este jean es de antes del embarazo y me volvió a entrar. Tomé un montón de agua de arroz, pero valió cada vaso. Volví a sentirme yo.

### Clip 3 — Escepticismo / prueba social · imagen: Avatar 3 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical selfie video. The woman talks to
camera with a relieved, slightly emotional smile, natural gestures, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Yo pensaba que esta panza era para siempre, que ya era "cuerpo de mamá" y listo. Vivía hinchada, me sentía un globo todo el día. Ni yo me tenía fe… y mirá ahora.

### Clip 4 — Mecanismo · B-ROLL (ver abajo) + voz en off
**Texto del avatar / VO (exacto):**
> Y es pura biología: el agua de arroz tiene un almidón que calma el intestino, baja la inflamación y alimenta las bacterias buenas. Cortás la causa, no el síntoma. Un vaso en ayunas, se prepara en dos minutos. Nada de gimnasio ni vivir a lechuga, que con un bebé no hay tiempo de nada.

### Clip 5 — Warning · imagen: Avatar 3 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical selfie video. The woman talks to
camera with a playful warning tone, light laugh at the end, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Eso sí, te aviso: no te zarpes, porque el cuerpo deshincha rápido y vas a tener que achicar toda la ropa de antes, je.

### Clip 6 — CTA · imagen: Avatar 3 "después" + screen-recording del test · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical selfie video. The woman points
down toward a button and talks to camera with an encouraging tone, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Si querés saber qué te está inflamando a vos, tocá el botón de acá abajo y hacé el test gratis de dos minutos. Te arma el plan según tu cuerpo. Arrancá hoy.

## B-ROLL — Agua de arroz (para Clip 4) · `[IA OK]`
**Imagen (texto→imagen):**
```
Close-up amateur photo in a real home kitchen: a glass pitcher of cloudy white rice water next
to a bowl of uncooked white rice and a clear glass being filled with the whitish liquid, on a
simple counter, natural daylight, realistic, UGC style, vertical 9:16.
```
**Video (imagen→video):**
```
Animate: hands pouring cloudy white rice water from a pitcher into a clear glass on a kitchen
counter, then placing the glass down, realistic natural motion, close-up, handheld phone style,
6 seconds, no text, 9:16.
```

---

# TESTIMONIAL 4 (Arquetipo: señora de la menopausia, ~55) — Avatar 4

## PASO 1 — IMAGEN: Avatar 4 "antes" (texto→imagen)
```
Candid amateur selfie photo of an everyday Argentine woman, around 54-58 years old, clearly
overweight with a bloated midsection, round full face, light skin with natural fine lines,
short grey-and-brown hair, glasses, no makeup, a resigned but hopeful expression. She wears a
loose floral blouse that hides her stomach. She holds a glass of cloudy whitish liquid (rice
water). Setting: a real cozy Argentine home kitchen — wooden cabinets, a kettle, a calendar on
the wall. Smartphone front camera selfie at arm's length, eye-level, natural daylight, realistic
skin texture, slight grain, photorealistic, authentic UGC, vertical 9:16.
Negative: beauty filter, airbrushed, studio lighting, professional model, extra fingers,
distorted hands, watermark, text.
```

## PASO 2 — IMAGEN: Avatar 4 "después / flaca" (imagen→imagen, referencia = Paso 1)
```
Using the attached photo as IDENTITY reference: keep the EXACT SAME woman — identical face,
same glasses, same hair color and short style, clearly the same recognizable person. Show her
weeks later, VISIBLY much slimmer and de-bloated: thinner face, defined cheekbones, clearly flat
stomach, healthy glow, confident proud smile. She takes a mirror selfie wearing fitted dark
trousers and a tucked-in blouse that show her flat waist. Same kitchen or a bright living room,
natural daylight. Amateur smartphone selfie style, realistic skin texture, photorealistic UGC,
vertical 9:16. Keep identity 100% consistent with the reference; only the body and face slimness
change.
Negative: (same as above)
```

## PASO 3 — VIDEOS + textos exactos del avatar

### Clip 1 — Hook · imagen: Avatar 4 "antes" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 8-second vertical selfie video. The older woman
holds her phone at arm's length and talks to camera with a warm, resigned-but-hopeful tone,
natural movement, accurate lip-sync, subtle handheld shake. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Bueno, a mis cincuenta y cinco arranco con el truco del agua de arroz que me explicó la nutri. Me dijeron que con la menopausia la panza ya era para siempre. A ver qué pasa.

### Clip 2 — Reveal de transformación · imagen: Avatar 4 "después / flaca" · `[FILMAR REAL]`
**Prompt de video:**
```
Animate the attached mirror-selfie image into a realistic 8-second vertical video. The woman
films herself in the mirror, turns slightly to show her flatter stomach, smiling, proud and a
bit surprised, natural movement, accurate lip-sync, handheld feel. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Se nota el cambio, ¿no? Mil gracias a la nutri. Tomé muchísima agua de arroz, pero valió la pena. A mi edad volví a entrar en esta ropa que tenía guardada hace años.

### Clip 3 — Escepticismo / prueba social · imagen: Avatar 4 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical selfie video. The woman talks to
camera with a complicit, warm smile, natural gestures, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Mis amigas se reían cuando dije que iba a desinflarme con agua de arroz. "A nuestra edad ya está", me decían. Yo vivía hinchada, me sentía un globo todo el día… y mirá ahora.

### Clip 4 — Mecanismo · B-ROLL (ver abajo) + voz en off
**Texto del avatar / VO (exacto):**
> ¿Por qué algo tan simple funciona tanto? Es pura biología. El agua de arroz tiene un almidón que calma el intestino, baja la inflamación y alimenta las bacterias buenas. Cortás la causa, no el síntoma. Y se prepara en dos minutos, con el arroz que ya tenés en casa.

### Clip 5 — Warning · imagen: Avatar 4 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical selfie video. The woman talks to
camera with a playful warning tone, light laugh at the end, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Eso sí, te aviso: no te zarpes, porque el cuerpo deshincha rápido y vas a tener que achicar toda la ropa, je.

### Clip 6 — CTA · imagen: Avatar 4 "después" + screen-recording del test · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical selfie video. The woman points
down toward a button and talks to camera with an encouraging tone, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Si querés saber qué te está inflamando a vos, tocá el botón de acá abajo y hacé el test gratis. No importa la edad: te arma el plan según tu cuerpo. Empezá hoy.

## B-ROLL — Agua de arroz (para Clip 4) · `[IA OK]`
**Imagen (texto→imagen):**
```
Close-up amateur photo: a glass of cloudy white rice water on a kitchen counter next to a small
bowl of white rice, soft natural daylight, realistic UGC style, vertical 9:16.
```
**Video (imagen→video):**
```
Animate: slow close-up of a glass of cloudy white rice water with light condensation, a hand
gently lifting it, realistic natural motion, handheld phone style, 5 seconds, no text, 9:16.
```

---

# TESTIMONIAL 5 (Arquetipo: la que probó TODO / escéptica, ~45) — Avatar 5
> **Formato "grabado normal" (cámara apoyada / trípode), NO selfie.** El celular está apoyado
> en una repisa o trípode, plano medio (de la cintura para arriba), y la mujer tiene las **dos
> manos libres y visibles**: gesticula al hablar, sirve el agua de arroz, se toca la panza,
> sostiene la ropa. Da un aire más de "video casero / a alguien le pedí que me filme".

## PASO 1 — IMAGEN: Avatar 5 "antes" (texto→imagen)
```
Candid amateur photo of an everyday Argentine woman, around 43-47 years old, visibly overweight
with a large bloated belly and a round full face with double chin, medium skin tone, long dark
hair with some greys tied back, no makeup, a frustrated and skeptical expression. She wears a
loose oversized black t-shirt. She is NOT holding a phone — the camera is on a tripod/propped on
a shelf, framing a medium shot from the waist up, so BOTH her hands are free and visible: she
gestures naturally with her hands while talking, one hand resting on her bloated stomach.
Setting: a real modest Argentine home — a bedroom or living room with a wardrobe and clothes on
a chair in the background. Phone propped at chest height, slight low angle, natural daylight,
realistic skin texture, slight grain, photorealistic, authentic home-video UGC look, vertical
9:16.
Negative: arm holding phone, selfie at arm's length, beauty filter, airbrushed, studio lighting,
professional model, extra fingers, distorted hands, watermark, text.
```

## PASO 2 — IMAGEN: Avatar 5 "después / flaca" (imagen→imagen, referencia = Paso 1)
```
Using the attached photo as IDENTITY reference: keep the EXACT SAME woman — identical face,
same eyes, same long dark hair, clearly the same recognizable person. Show her about 5 weeks
later, DRAMATICALLY slimmer and de-bloated: noticeably thinner face (no double chin), clearly
flat stomach, healthy glow, big confident proud smile. The camera is again on a tripod/propped
on a shelf (NOT a selfie): a medium full-body shot, both hands free and visible. She is wearing
a fitted bordo (burgundy) dress that now flatters her slim figure, and with her hands she pulls
the loose waistband slightly to show how much room there is. Same modest bedroom, natural
daylight. Amateur home-video UGC style, realistic skin texture, slight grain, photorealistic,
vertical 9:16. Keep identity 100% consistent with the reference; only the body and face slimness
change for a strong before/after contrast.
Negative: arm holding phone, selfie at arm's length, beauty filter, airbrushed, studio lighting,
professional model, extra fingers, distorted hands, watermark, text.
```

## PASO 3 — VIDEOS + textos exactos del avatar
> En todos los clips: **cámara fija apoyada (trípode/repisa)**, la mujer **no sostiene el teléfono**,
> habla a cámara con las **manos libres** gesticulando o haciendo la acción que indica cada clip.

### Clip 1 — Hook "se reían de mí" · imagen: Avatar 5 "después" · `[IA OK]`
> (Este arquetipo abre directo con el hook de psicología inversa, como el Guión 2 ganador.)
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical video filmed on a STATIC tripod
(not a selfie). Medium shot, the woman talks to camera with a confident, slightly defiant
half-smile and gestures freely with BOTH hands, natural body movement, accurate lip-sync. No
on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Se reían de mí cuando dije que iba a desinflarme con el truco del agua de arroz. Ni mi marido me tenía fe. Yo probé de todo: dietas, pastillas, tés… y nada. Miren ahora.

### Clip 2 — Reveal de transformación · imagen: Avatar 5 "después / flaca" · `[FILMAR REAL]`
**Prompt de video:**
```
Animate the attached image into a realistic 8-second vertical video filmed on a STATIC tripod
(not a mirror selfie). Full/medium shot: the woman stands in front of the propped camera, with
both hands she pulls the loose waistband of her dress to show the extra room, then turns to the
side to show her flat stomach, smiling, proud and confident, natural movement, accurate
lip-sync. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Mirá cómo me queda este vestido que tenía guardado hace un montón. Desinflé la panza un montón. Me siento mucho más liviana y volví a sentirme yo. Y eso que no me cambié la vida: solo sumé el agua de arroz.

### Clip 3 — Dolor / identificación · imagen: Avatar 5 "antes" · `[IA OK]`
**Prompt de video:**
```
Animate the attached "before" image into a realistic 7-second vertical video filmed on a STATIC
tripod (not a selfie). Medium shot, the woman talks to camera with a confessional, frustrated
tone, with both hands free she touches her bloated stomach, natural gestures, accurate lip-sync.
9:16.
```
**Texto del avatar (exacto):**
> Yo comía re poco y para la tarde parecía embarazada de tres meses. Me sentía un globo, hinchada todo el día, evitaba hasta los espejos. Estaba cansada de empezar cosas que no funcionaban.

### Clip 4 — Mecanismo · B-ROLL (ver abajo) + voz en off
**Texto del avatar / VO (exacto):**
> Y es re simple, es pura biología: el agua de arroz calma el intestino y desinflama desde adentro. Tiene un almidón que alimenta las bacterias buenas y baja la inflamación. Un vaso en ayunas, dos minutos para prepararlo. Sin gimnasio ni pasar hambre.

### Clip 5 — Warning / psicología inversa · imagen: Avatar 5 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical video filmed on a STATIC tripod
(not a selfie). Medium shot, the woman talks to camera with a playful, daring warning tone,
gesturing with both free hands, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Si no estás lista para que te queden todas las prendas grandes y te pregunten qué hiciste, no lo pruebes. Posta.

### Clip 6 — CTA · imagen: Avatar 5 "después" + screen-recording del test · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical video filmed on a STATIC tripod
(not a selfie). Medium shot, the woman leans slightly toward the camera and points down with her
hand toward a button, encouraging tone, both hands free, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Pero si querés desinflarte de una vez, tocá el botón de acá abajo y hacé el test gratis. Te dice qué te está inflamando a vos y te arma el plan exacto para tu cuerpo.

## B-ROLL — Agua de arroz (para Clip 4) · `[IA OK]`
**Imagen (texto→imagen):**
```
Close-up amateur photo in a real home kitchen: a glass pitcher of cloudy white rice water next
to a bowl of uncooked white rice and a clear glass being filled, simple counter, natural
daylight, realistic, UGC style, vertical 9:16.
```
**Video (imagen→video):**
```
Animate: hands straining and pouring cloudy white rice water into a clear glass on a kitchen
counter, realistic natural motion, close-up, handheld phone style, 6 seconds, no text, 9:16.
```

---

# TESTIMONIAL 6 (Arquetipo: el vestido del casamiento / deadline, ~35) — Avatar 6

## PASO 1 — IMAGEN: Avatar 6 "antes" (texto→imagen)
```
Candid amateur selfie photo of an everyday Argentine woman, around 34-37 years old, overweight
with a bloated belly and a soft round face, fair-medium skin, light brown long straight hair,
light natural makeup, a slightly stressed but hopeful expression. She wears a loose casual
sweater. In the background, softly out of focus, an elegant dress hangs on a wardrobe door
(an event dress she can't fit into). She holds a glass of cloudy whitish liquid (rice water).
Setting: a real Argentine bedroom, natural daylight. Smartphone front camera selfie at arm's
length, eye-level, realistic skin texture, slight grain, photorealistic, authentic UGC,
vertical 9:16.
Negative: beauty filter, airbrushed, studio lighting, professional model, extra fingers,
distorted hands, watermark, text.
```

## PASO 2 — IMAGEN: Avatar 6 "después / flaca" (imagen→imagen, referencia = Paso 1)
```
Using the attached photo as IDENTITY reference: keep the EXACT SAME woman — identical face,
same eyes, same light brown long hair, clearly the same recognizable person. Show her weeks
later, VISIBLY much slimmer and de-bloated: slimmer face, clearly flat stomach, healthy glow,
radiant happy smile. She takes a mirror selfie now WEARING that same elegant fitted event dress,
which now fits her perfectly and flatters her slim figure. Same bedroom, natural daylight.
Amateur smartphone selfie style, realistic skin texture, photorealistic UGC, vertical 9:16.
Keep identity 100% consistent with the reference; only the body and face slimness change.
Negative: (same as above)
```

## PASO 3 — VIDEOS + textos exactos del avatar

### Clip 1 — Hook · imagen: Avatar 6 "antes" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 8-second vertical selfie video. The woman holds her
phone at arm's length and talks to camera with a stressed-but-hopeful tone, glancing at the
dress behind her, natural movement, accurate lip-sync, handheld shake. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Hoy arranco con el truco del agua de arroz que me pasó la nutri. En tres semanas tengo un casamiento y este vestido no me entra ni a palos. Tengo fe de que voy a desinflar esta panza de una vez.

### Clip 2 — Reveal de transformación · imagen: Avatar 6 "después / flaca" · `[FILMAR REAL]`
**Prompt de video:**
```
Animate the attached mirror-selfie image into a realistic 8-second vertical video. The woman
films herself in the mirror wearing the fitted event dress, turns to show her flat stomach,
smiling, thrilled and emotional, natural movement, accurate lip-sync, handheld feel. No
on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> No sabés. Me entró el vestido y me sobra. Desinflé la panza un montón y me siento otra. Tomé muchísima agua de arroz, pero llegué al casamiento sintiéndome yo de nuevo.

### Clip 3 — Escepticismo / prueba social · imagen: Avatar 6 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical selfie video. The woman talks to
camera with a happy, slightly emotional smile, natural gestures, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Yo ya había dado el vestido por perdido, iba a salir corriendo a comprar uno más grande. Vivía hinchada, me sentía un globo. Ni mi marido me tenía fe… y mirá cómo llegué.

### Clip 4 — Mecanismo · B-ROLL (ver abajo) + voz en off
**Texto del avatar / VO (exacto):**
> Y es pura biología: el agua de arroz tiene un almidón que calma el intestino, baja la inflamación y alimenta las bacterias buenas. Cortás la causa, no el síntoma. Un vaso en ayunas, se prepara en dos minutos. Nada de matarte en el gimnasio ni vivir a lechuga.

### Clip 5 — Warning · imagen: Avatar 6 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical selfie video. The woman talks to
camera with a playful warning tone, light laugh at the end, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Eso sí, te aviso: no te zarpes, porque el cuerpo deshincha rápido y al final vas a tener que achicar todos los vestidos, je.

### Clip 6 — CTA · imagen: Avatar 6 "después" + screen-recording del test · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical selfie video. The woman points
down toward a button and talks to camera with an encouraging tone, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Si tenés un evento o simplemente querés desinflarte de una vez, tocá el botón de acá abajo y hacé el test gratis de dos minutos. Te arma el plan según tu cuerpo. Arrancá hoy.

## B-ROLL — Agua de arroz (para Clip 4) · `[IA OK]`
**Imagen (texto→imagen):**
```
Close-up amateur photo: a glass of cloudy white rice water on a kitchen counter next to a small
bowl of white rice, soft natural daylight, realistic UGC style, vertical 9:16.
```
**Video (imagen→video):**
```
Animate: slow close-up of a glass of cloudy white rice water with light condensation, a hand
gently lifting it, realistic natural motion, handheld phone style, 5 seconds, no text, 9:16.
```

---

# TESTIMONIAL 7 (Arquetipo: señora de la tercera edad, sentada, ~55-65) — Avatar 7
> **Formato "grabado normal" y SENTADA.** La señora está **sentada** en un sillón / en la mesa
> de la cocina, con el celular **apoyado en un trípode o sobre una repisa/mesa** frente a ella
> (NO selfie). Plano medio, **manos libres y visibles** sobre la falda o gesticulando. Da el aire
> de "le pedí a mi hija que me filme". Tono cálido, tranquilo, de abuela/señora grande.

## PASO 1 — IMAGEN: Avatar 7 "antes" (texto→imagen)
```
Candid amateur photo of an everyday Argentine elderly woman, around 58-64 years old, clearly
overweight with a bloated midsection, round full face and double chin, fair skin with natural
wrinkles, short grey curly hair, reading glasses, no makeup, a warm but tired and resigned
expression. She is SITTING in a comfortable armchair (or at her kitchen table), wearing a loose
floral housecoat/cardigan that hides her stomach, both hands resting on her lap, relaxed and
visible. She is NOT holding a phone — the camera is on a tripod/propped on a table in front of
her, framing a medium shot from the waist up. Setting: a real cozy Argentine living room — a
crocheted blanket on the sofa, framed family photos and a small plant in the background. Phone
propped at chest height, slight eye-level angle, warm natural daylight, realistic skin texture,
slight grain, photorealistic, authentic home-video UGC look, vertical 9:16.
Negative: arm holding phone, selfie at arm's length, standing, beauty filter, airbrushed, studio
lighting, professional model, extra fingers, distorted hands, watermark, text.
```

## PASO 2 — IMAGEN: Avatar 7 "después / flaca" (imagen→imagen, referencia = Paso 1)
```
Using the attached photo as IDENTITY reference: keep the EXACT SAME woman — identical face, same
reading glasses, same short grey curly hair, clearly the same recognizable elderly person. Show
her weeks later, VISIBLY much slimmer and de-bloated: noticeably thinner face (no double chin),
clearly flat stomach, healthy glow, warm proud happy smile. She is again SITTING in the same
armchair, the camera on a tripod/propped (NOT a selfie), medium shot, both hands free and
visible. She now wears a fitted blouse and trousers that show her slim waist, and with one hand
she pats her now-flat stomach. Same cozy living room, warm natural daylight. Amateur home-video
UGC style, realistic skin texture, slight grain, photorealistic, vertical 9:16. Keep identity
100% consistent with the reference; only the body and face slimness change for a strong
before/after contrast.
Negative: arm holding phone, selfie at arm's length, standing, beauty filter, airbrushed, studio
lighting, professional model, extra fingers, distorted hands, watermark, text.
```

## PASO 3 — VIDEOS + textos exactos del avatar
> En todos los clips: la señora está **sentada**, **cámara fija apoyada (trípode/mesa)**, **no
> sostiene el teléfono**, habla a cámara con tono cálido y las **manos libres** sobre la falda o
> gesticulando suave.

### Clip 1 — Hook · imagen: Avatar 7 "antes" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 8-second vertical video filmed on a STATIC tripod
(not a selfie). Medium shot of the seated elderly woman talking to camera with a warm,
resigned-but-hopeful tone, gentle hand gestures with both free hands, slight natural body
movement, accurate lip-sync. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Bueno, a mis sesenta arranco con el truco del agua de arroz que me explicó la nutri. Yo ya me había hecho a la idea de que a esta edad una se queda hinchada y listo. A ver qué pasa.

### Clip 2 — Reveal de transformación · imagen: Avatar 7 "después / flaca" · `[FILMAR REAL]`
**Prompt de video:**
```
Animate the attached image into a realistic 8-second vertical video filmed on a STATIC tripod
(not a selfie). The seated elderly woman talks to camera, pats her now-flat stomach with one
hand and runs her hands down her fitted blouse to show how loose her old clothes feel, smiling,
proud and a bit emotional, natural movement, accurate lip-sync. No on-screen text. 9:16.
```
**Texto del avatar (exacto):**
> Se nota el cambio, ¿no? Mirá cómo me queda esta ropa ahora, me baila. Tomé muchísima agua de arroz, pero a mi edad volví a sentirme liviana y cómoda. No lo podía creer.

### Clip 3 — Escepticismo / prueba social · imagen: Avatar 7 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 7-second vertical video filmed on a STATIC tripod
(not a selfie). The seated elderly woman talks to camera with a warm, complicit smile, gentle
hand gestures, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Mis amigas del club se reían cuando les dije que iba a desinflarme con agua de arroz. "A nuestra edad ya está, dejate de joder", me decían. Yo vivía hinchada, me sentía un globo todo el día… y mirá ahora.

### Clip 4 — Mecanismo · B-ROLL (ver abajo) + voz en off
**Texto del avatar / VO (exacto):**
> ¿Por qué algo tan simple funciona tanto? Es pura biología. El agua de arroz tiene un almidón que calma el intestino, baja la inflamación y alimenta las bacterias buenas. Cortás la causa, no el síntoma. Y se prepara en dos minutos, sentada en tu cocina, con el arroz que ya tenés.

### Clip 5 — Warning · imagen: Avatar 7 "después" · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical video filmed on a STATIC tripod
(not a selfie). The seated elderly woman talks to camera with a playful, warm warning tone, a
light laugh at the end, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Eso sí, te aviso: no te zarpes, porque el cuerpo deshincha rápido y vas a tener que achicar toda la ropa, je.

### Clip 6 — CTA · imagen: Avatar 7 "después" + screen-recording del test · `[IA OK]`
**Prompt de video:**
```
Animate the attached image into a realistic 6-second vertical video filmed on a STATIC tripod
(not a selfie). The seated elderly woman leans slightly toward the camera and points down with
her hand toward a button, warm encouraging tone, accurate lip-sync. 9:16.
```
**Texto del avatar (exacto):**
> Si querés saber qué te está inflamando a vos, tocá el botón de acá abajo y hacé el test gratis. No importa la edad: te arma el plan según tu cuerpo. Empezá hoy, como hice yo.

## B-ROLL — Agua de arroz (para Clip 4) · `[IA OK]`
**Imagen (texto→imagen):**
```
Close-up amateur photo: a glass of cloudy white rice water on a kitchen table next to a small
bowl of white rice and a pair of reading glasses, warm soft daylight, realistic UGC style,
vertical 9:16.
```
**Video (imagen→video):**
```
Animate: an elderly woman's hands gently lifting a glass of cloudy white rice water from a
kitchen table, realistic natural motion, warm close-up, propped phone style, 5 seconds, no text,
9:16.
```

---

# Orden de edición + textos en pantalla (por testimonial)

| Testimonial | Orden de clips | Textos en pantalla sugeridos |
|---|---|---|
| **3 · Mamá postparto** | 1 → 2 → 3 → 4 (b-roll) → 5 → 6 | `Día 1 😮‍💨` · `6 semanas después 🤍` · `👇 TEST GRATIS · 2 MIN` |
| **4 · Menopausia** | 1 → 2 → 3 → 4 (b-roll) → 5 → 6 | `A los 55 💪` · `Mirá ahora 👀` · `👇 TEST GRATIS` |
| **5 · Probó todo** | 1 (hook) → 2 → 3 → 4 (b-roll) → 5 → 6 | `Mirá ahora 👀` · `Sin dietas` · `👇 TEST GRATIS · 2 MIN` |
| **6 · El vestido** | 1 → 2 → 3 → 4 (b-roll) → 5 → 6 | `Faltan 3 semanas ⏳` · `Me entró 🤍` · `👇 TEST GRATIS` |
| **7 · Señora sentada (60)** | 1 → 2 → 3 → 4 (b-roll) → 5 → 6 | `A los 60 🤍` · `Me baila la ropa 👀` · `👇 TEST GRATIS` |

- Música suave + el **screen-recording del quiz** al final de cada uno.
- Overlays de **≤3 palabras**, subtítulos quemados, alto contraste, parte inferior-media.

## Convención de nombres (para el reporte de Meta)
`AA_[angulo]_[avatar]_vNN` — ej:
- `AA_postparto_mujer30_v01`
- `AA_menopausia_mujer55_v01`
- `AA_sereian_proboTodo_mujer45_v01`
- `AA_vestido_evento_mujer35_v01`
- `AA_sentada_tercera_edad_mujer60_v01`

## Reciclado (variantes gemelas, como Anuncio 3 → 4 de la competencia)
Filmá/generá **cada clip por separado**. Con el mismo material de cada avatar podés sacar una
variante reordenada (ej. arrancar por el reveal en vez del hook) sin volver a producir. También
podés **cruzar avatares** y armar un montaje multi-mujer (como el Guión 2 ganador) intercalando
los reveals de todas.

## Nota de compliance (Meta / salud)
- El pedido fue marcar fuerte el **"gorda → flaca"**: estos prompts lo hacen para la versión
  **agresiva** (la que hoy pasa revisión, estilo competidor).
- Para la versión **"oficial" que escala**, tené listas las variantes seguras: evitá **cifras de
  kilos garantizadas** y suavizá los **antes/después de cuerpo** (foco en cara/ropa/energía).
  Swap seguro: en vez de "bajé X kilos" → **"desinflé la panza y me volvió a entrar la ropa"**.
- Mantené el doc de líneas baneables (ver `guia-video-ads-quiz-funnel.md` §7): cuando rechazan
  un ad, el 90% de las veces es una sola frase o un frame.
