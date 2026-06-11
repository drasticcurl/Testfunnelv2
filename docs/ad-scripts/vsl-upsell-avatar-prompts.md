# Avatar AI del VSL — Lic. Natalia Reyes (fragmentos 6–8 s)

> **Objetivo:** generar el video del VSL del upsell con la nutricionista hablando a cámara, en clips secuenciales de 6–8 segundos (lip-sync), manteniendo SIEMPRE la misma cara.
> **Input de identidad:** tu foto real → `/public/img/natalia-reyes.jpg`.
> **Flujo:** 1) generás/recreás la imagen base del avatar usando tu foto como referencia de identidad · 2) cada fila de la tabla es un clip imagen→video con su diálogo exacto · 3) los unís en orden en VTURB.
> **Idioma:** los prompts visuales van en **inglés** (mejor respuesta de los modelos); los **diálogos en español rioplatense** NO se traducen.
> Guion fuente: `vsl-upsell-turbo.md`.

---

## PASO 0 — Reglas fijas (pegar en TODAS las generaciones)

**Identidad (consistencia de cara):**
```
Use the attached photo as the IDENTITY reference. Keep the EXACT SAME woman in every
shot: same face, same eyes, same nose, same mouth, same skin tone, same dark hair,
clearly the same recognizable person. Argentine nutritionist, 35-42 years old,
warm and trustworthy.
```

**Estilo base del set (talking head profesional pero cercano):**
```
Medium close-up, woman talking directly to camera, seated in a bright modern nutrition
office / cozy kitchen background softly blurred (plants, wooden shelf, neutral tones),
soft natural daylight, shallow depth of field, professional but approachable, subtle
natural head and hand movements, realistic skin texture, photorealistic, horizontal 16:9
(also export 9:16 for mobile), accurate lip-sync to the provided Spanish audio.
```

**Negative prompt:**
```
beauty filter, plastic skin, over-smoothing, extra fingers, distorted hands, warped mouth,
changing face between shots, text captions, watermark, cartoon, oversaturated
```

**Wardrobe fijo (no cambiar entre clips):** blusa/camisa clara (blanco o beige) + (opcional) delantal o guardapolvo de nutricionista. Mismo peinado en todos los clips.

**Tips de producción:**
- Generá el audio en **una voz** (clonada o TTS rioplatense) y cortala por fragmento para alimentar el lip-sync de cada clip.
- Para cada clip, usá la imagen base del avatar como input + el texto del fragmento.
- Variá *levemente* el encuadre cada 4–5 clips (plano medio ↔ primer plano) para que no sea monótono; la cara debe seguir siendo la misma.
- `(B-ROLL)` = en vez de avatar, mostrar inserto (agua de arroz, app, calendario). El audio sigue de fondo.

---

## PASO 1 — Imagen base del avatar (texto→imagen, referencia = tu foto)
```
Using the attached photo as IDENTITY reference, generate a clean studio-quality portrait
of the SAME woman (same face, eyes, nose, hair), Argentine nutritionist 35-42, wearing a
light blouse, seated talking to camera in a bright modern nutrition office with a softly
blurred background (plants, wooden shelf). Soft natural daylight, shallow depth of field,
realistic skin texture, photorealistic, friendly confident expression. 16:9.
Negative: beauty filter, plastic skin, extra fingers, distorted hands, text, watermark.
```
> Guardá 2 variantes (plano medio y primer plano). Esa imagen es el INPUT de todos los clips.

---

## PASO 2 — Clips secuenciales (diálogo exacto, 6–8 s c/u)

> Cada fila = 1 clip. Prompt de video para todos: *"Animate the attached avatar image into a realistic {6-8}-second video, woman talking to camera, natural head/hand motion, accurate lip-sync to the Spanish audio, 16:9 + 9:16."* Solo cambia el **texto hablado** (y la nota de visual).

### Bloque 1 — Retención + felicitación
| # | Diálogo exacto (rioplatense) | Visual |
|---|------------------------------|--------|
| 1 | Hola, soy la licenciada Natalia Reyes. Estás en el lugar correcto. | Primer plano, sonrisa cálida |
| 2 | Por favor, no hagas clic en atrás ni cierres esta página: podrías generar errores en tu compra. | Gesto de "pará" suave con la mano |
| 3 | Y perder el acceso que acabás de conseguir. Quiero felicitarte. | Plano medio |
| 4 | Tomaste una de las mejores decisiones de tu vida al elegir el Método del Agua de Arroz. | Asiente, confiada |
| 5 | Para deshinchar tu panza, sentirte liviana y recuperar la confianza en tu cuerpo. | Sonríe |
| 6 | Hoy es el primer día de tu nueva vida. Acá es donde todo empieza. | Mira fijo a cámara |

### Bloque 2 — Reconfirmar el mecanismo base
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 7 | Ahora descubriste el poder del agua de arroz para calmar tu intestino. | Plano medio |
| 8 | Alimentar tus bacterias buenas, cortar la ansiedad por la comida y desinflamarte de forma natural. | Cuenta con los dedos |
| 9 | Y lo mejor: sin dejar de comer lo que te gusta y sin matarte en el gimnasio. | Niega con la cabeza, sonríe |
| 10 | Todos los días recibo mensajes de mujeres como vos logrando deshinchar la panza. | Cálida |
| 11 | Sentirse livianas y volver a mirarse al espejo con orgullo. | (B-ROLL) mujer mirándose al espejo, contenta |
| 12 | Y creo que dentro de muy poquito voy a recibir tu testimonio también. | Sonríe a cámara |
| 13 | Pero para que esto pase, necesitás tomar el agua de arroz todos los días, como te explico. ¿De acuerdo? | Tono firme, cercano |

### Bloque 3 — Analogía + nombrar al enemigo
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 14 | Tené en cuenta algo importante: cada cuerpo es distinto. | Plano medio |
| 15 | Tu edad, tu peso, tu altura, tus embarazos… todo cambia cómo responde tu cuerpo. | Gesto enumerando |
| 16 | Pensalo así: es como buscar el vestido perfecto para una fiesta. | (B-ROLL) vestido en perchero |
| 17 | Si comprás uno ya hecho, capaz te queda bien. Pero a medida, te queda muchísimo mejor. | Sonríe |
| 18 | Con el agua de arroz pasa lo mismo. Por tu cuenta vas a tener buenos resultados. | Asiente |
| 19 | Pero después de los 35 o 40 se vuelve más difícil, por los cambios hormonales. | Tono empático |
| 20 | La retención de líquidos y un metabolismo que se vuelve lento como una tortuga. | Gesto lento con la mano |
| 21 | Por eso, si querés resultados rápidos y sostenidos, lo mejor es un protocolo acelerado a tu medida. | Confiada |

### Bloque 4 — Bautizar el producto + fase turbo
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 22 | Por eso creamos algo completamente distinto. Lo llamamos Protocolo Agua de Arroz TURBO. | Énfasis en el nombre |
| 23 | Y te voy a ser sincera: es el mismo que muchas alumnas usaron como prueba interna. | Tono confidencial |
| 24 | Y los resultados fueron tan rápidos que nos sorprendieron a nosotras mismas. | Ojos abiertos |
| 25 | Porque activa lo que llamamos la fase turbo del intestino. | (B-ROLL) animación de intestino/microbiota |
| 26 | Una etapa donde tu cuerpo desinflama y suelta líquidos y grasa mucho más rápido. | Plano medio |
| 27 | ¿Cómo? Combinando tres ajustes que casi nadie aplica bien. | Muestra tres dedos |
| 28 | Uno: la concentración exacta de almidón resistente para reactivar tu metabolismo. | (B-ROLL) vaso de agua de arroz |
| 29 | Dos: el horario estratégico, en ayunas y antes de cenar, para maximizar el deshinchado. | (B-ROLL) reloj / mañana |
| 30 | Y tres: los ingredientes potenciadores que la convierten en una bomba antiinflamatoria natural. | (B-ROLL) ingredientes en mesada |
| 31 | El resultado: mujeres que ven resultados hasta tres veces más rápido que con el agua de arroz sola. | Confiada, asiente |

### Bloque 5 — Qué recibís
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 32 | Y lo mejor es que no es nada complicado. Está pensado para que cualquier mujer lo siga fácil. | Sonríe |
| 33 | Cuando entres, vas a recibir el protocolo completo de 30 días que activa el modo turbo. | (B-ROLL) app / pantalla del plan |
| 34 | Una guía paso a paso para preparar la versión turbo del agua de arroz con los potenciadores. | (B-ROLL) preparación |
| 35 | Qué pequeños cambios de horario hacer para acelerar tu metabolismo al máximo. | Plano medio |
| 36 | Y qué errores evitar para entrar en modo deshinchado mucho más rápido. | Tono de consejo |
| 37 | Más un calendario visual de 30 días: solo seguís el día que toca, sin pensar. | (B-ROLL) calendario 30 días |
| 38 | Mirás el día, seguís la indicación, cinco minutos por día, y tu cuerpo hace el resto. | Muestra 5 dedos |
| 39 | Sin contar calorías, sin gimnasio, sin dejar de comer lo que te gusta. | Niega, sonríe |
| 40 | Muchas mujeres me dicen que es lo más fácil que probaron en su vida. | Cálida |

### Bloque 6 — Proyección futura
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 41 | Imaginate cómo te vas a sentir en tres o cuatro semanas. | Mira a lo lejos, soñadora |
| 42 | Tu ropa favorita volviendo a quedarte bien y más energía durante el día. | (B-ROLL) mujer probándose ropa, contenta |
| 43 | Esa sensación de mirarte al espejo y sentir orgullo otra vez. | (B-ROLL) espejo |
| 44 | Energía para tus hijos, para tu día, para vos. Vas a volver a sentirte vos misma. | Emotiva, sonríe |

### Bloque 7 — Escasez + exclusividad
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 45 | Pero hay algo importante que tenés que saber. | Tono serio |
| 46 | El Protocolo TURBO normalmente no se ofrece al público. | Plano medio |
| 47 | Se creó como un método interno para acelerar a las alumnas que ya aplicaban el método. | Confidencial |
| 48 | Hoy decidimos abrirlo solo para quienes acaban de entrar, como vos. | Señala a cámara |
| 49 | Por eso limitamos los cupos a 25, y ahora mismo quedan 9. | Énfasis en el número |
| 50 | Si querés deshincharte con el mínimo esfuerzo, asegurá tu lugar antes de que se agoten. | Tono de urgencia amable |

### Bloque 8 — Beneficios extra de salud
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 51 | Y recordá: esto va mucho más allá de la panza. | Plano medio |
| 52 | Te ayuda a reducir la hinchazón y la retención de líquidos. | Cuenta con los dedos |
| 53 | A cortar la ansiedad por lo dulce a la noche y a mejorar tu digestión. | Sigue contando |
| 54 | A dormir mejor y a tener la piel más limpia al desinflamar el intestino. | (B-ROLL) piel/rostro luminoso |
| 55 | Y a sacarte esa pesadez y esa sensación de globo que te acompaña todo el día. | Gesto de alivio |
| 56 | Al final vas a tener todo el conocimiento para mantenerte así, sin efecto rebote. | Confiada |
| 57 | Pero recordá: solo quedan 9 cupos. Cuando se cierre esta página, no vuelve. | Tono firme |

### Bloque 9 — Price anchoring
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 58 | Ahora quiero que lo pienses bien. ¿Cuánto vale todo esto? | Mira a cámara |
| 59 | ¿Cuánto vas a ahorrar en gimnasios, dietas locas y tratamientos peligrosos? | Plano medio |
| 60 | Un tratamiento estético para la retención arranca en cientos de miles de pesos. | (B-ROLL) texto/precio en pantalla |
| 61 | Un año de gimnasio te sale, mínimo, cuatrocientos mil pesos. | (B-ROLL) precio |
| 62 | Y tres consultas con un nutricionista te salen en promedio trescientos mil. | (B-ROLL) precio |
| 63 | Por eso, un precio justo para el Protocolo TURBO sería treinta y nueve mil novecientos noventa. | (B-ROLL) $39.990 tachado |
| 64 | Y ya es muchísimo más barato que cualquiera de esas opciones, ¿no? | Asiente |
| 65 | Pero voy a hacer una excepción. Y no es por la plata. | Tono honesto |
| 66 | Es porque sé lo que es vivir hinchada, incómoda con tu cuerpo y con las miradas. Yo pasé por eso. | Empática, cercana |

### Bloque 10 — Bonos
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 67 | Y hay más. Si asegurás tu lugar en los próximos minutos, te sumo tres regalos. | Sonríe, muestra 3 dedos |
| 68 | Regalo uno: los ingredientes potenciadores secretos para multiplicar el efecto del agua de arroz. | (B-ROLL) mockup bono 1 |
| 69 | El ingrediente dorado de la mañana, el tónico para la ansiedad nocturna y el batido desinflamante. | (B-ROLL) ingredientes |
| 70 | Regalo dos: los rituales de las famosas para cuidar el cuerpo y la piel después de los 40. | (B-ROLL) mockup bono 2 |
| 71 | Regalo tres: el programa Mente y Panza, para bajar la ansiedad y el estrés que inflaman el intestino. | (B-ROLL) mockup bono 3 |
| 72 | Son casi veinticinco mil pesos en regalos, totalmente gratis. | (B-ROLL) stack de bonos |

### Bloque 11 — `[ACÁ SALE EL PRECIO]` + garantía
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 73 | Pero te lo voy a poner aún más fácil, porque estás protegida por mi garantía de 30 días. | Plano medio · **acá se activa el bloque de pago abajo** |
| 74 | Así no tenés ni que decir que sí ahora. Solo tenés que decir "tal vez". | Sonríe |
| 75 | Probá el protocolo, aplicalo unos días y sentí cómo tu cuerpo responde. | Cálida |
| 76 | La hinchazón baja, la ansiedad se calma, la ropa empieza a quedarte más suelta. | (B-ROLL) ropa más suelta |
| 77 | Si no estás conforme, pedís el reembolso por Mercado Pago y te devolvemos cada peso. | (B-ROLL) logo Mercado Pago |
| 78 | Sin preguntas. Y los regalos te los quedás igual. | Asiente, sonríe |

### Bloque 12 — Testimonios
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 79 | ¿Y sabés por qué hago esto? Porque estoy segura de que funciona. | Confiada |
| 80 | Mirá lo que me contó Romina, desde Buenos Aires. | Transición a testimonio |
| T1 | *(Avatar Romina)* Hola Naty. No pensé que iba a funcionar tan rápido. | **Avatar distinto** (clienta) — ver `testimonios-augc.md` |
| T2 | Yo ya tomaba el agua de arroz, pero sentía que estaba estancada. | Avatar Romina |
| T3 | Con el protocolo turbo me di cuenta de que cometía errores: la cantidad, el horario, los ingredientes. | Avatar Romina |
| T4 | En unas semanas se me desinfló la panza y la ansiedad de la noche desapareció. Me cambió la forma de cuidarme. | Avatar Romina, contenta |
| 81 | Y como Romina hay muchísimas. Todos los días recibo mensajes así. | Vuelve a Natalia |
| 82 | Y creo que el próximo va a ser el tuyo. | Sonríe a cámara |

### Bloque 13 — Cierre + doble CTA
| # | Diálogo exacto | Visual |
|---|----------------|--------|
| 83 | Así que no pierdas tiempo. Tocá el botón de acá abajo. | Señala hacia abajo |
| 84 | Y comprobá si todavía quedan cupos para el Protocolo Agua de Arroz TURBO. | Plano medio |
| 85 | Estás a un solo clic de resolver tu insatisfacción con tu panza, tu energía y tu digestión. | Cálida |
| 86 | Imaginate un protocolo simple, claro y a tu medida, para activar la fase turbo del intestino. | (B-ROLL) app |
| 87 | Y recordá: si asegurás tu lugar ahora, te llevás los tres regalos gratis. | Muestra 3 dedos |
| 88 | Y estás protegida por la garantía de 30 días. No corrés ningún riesgo. | Asiente |
| 89 | Probás, y solo después decidís si te lo quedás. | Sonríe |
| 90 | La decisión es tuya. Tocá el botón de abajo y asegurá tu lugar. | Señala hacia abajo |
| 91 | Estoy deseando conocer tu historia de éxito. | Sonríe, despedida cálida |

---

## Resumen de producción
- **91 clips** de Natalia + **4 clips** de testimonio (Romina) ≈ 12–14 min.
- Generá la **voz completa** primero, cortala por fragmento, y alimentá cada clip con su audio para lip-sync perfecto.
- Mantené **misma cara + misma ropa + mismo set** en los 91 clips de Natalia (usá siempre la imagen base del Paso 1 como input).
- Insertá los `(B-ROLL)` sobre el audio para romper la monotonía del talking head.
- El clip **#73** es el punto donde, en la página `/upsell`, aparece el bloque de precio/CTA (ver `vsl-upsell-turbo.md` Parte C).
