# Agente 18 — Steering File Extensivo (.kiro/steering/funnel-playbook.md)

> Crea el "cerebro" del proyecto: un steering file extenso que cualquier IA pueda leer y generar copy/decisiones perfectamente alineadas con la filosofía del proyecto, sin necesidad de más contexto.

---

## Goal

Que cuando abras un chat nuevo con cualquier IA (Kiro, Claude, GPT) y le pegues solo este file, la IA sepa:

- Qué tipo de producto es y a quién va dirigido
- Cómo escribir copy en el tono correcto
- Qué frameworks aplicar
- Qué errores nunca cometer
- Cómo tomar decisiones de UX/copy/ads alineadas con la estrategia

**No es un README. Es un manifiesto + manual de estilo + playbook estratégico, todo junto.**

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `.kiro/steering/funnel-playbook.md` | NEW (extenso, 800-1500 líneas) |

---

## Archivos read-only

Lee TODO el repo para no contradecir nada existente:
- `AGENTS.md`
- `README.md`
- `docs/_AVATAR.md` (si existe — sino, inferirlo del código)
- `docs/_BRAND-VOICE.md` (idem)
- `docs/_DESIGN-SYSTEM.md`
- `docs/_PRODUCT-DATA.md`
- Toda la app: `app/page.tsx`, `app/quiz/`, `app/resultados/`

---

## Implementation outline

### Estructura del file

```markdown
---
inclusion: always  # o manual, según preferencia del usuario
---

# Funnel Playbook — Anti-Hinchazón

[Índice navegable]

## 1. Filosofía del Producto
## 2. Avatar Detallado
## 3. Lógica del Funnel ("Papilla de Bebé")
## 4. Los 3 Pilares de Venta
## 5. Voz de Marca y Reglas de Copy
## 6. Frameworks de Copy
## 7. Estructura del Quiz
## 8. Página de Resultados
## 9. Reglas de Ads
## 10. Métricas que Importan
## 11. Errores Prohibidos
## 12. Decisiones Estilísticas Vinculantes
## 13. Glosario y Convenciones de Naming
## 14. Casos Edge y Cómo Resolverlos
```

### Contenido detallado por sección

#### 1. Filosofía del Producto (~50 líneas)

- Estamos vendiendo CAMBIO PERCIBIDO, no información.
- El producto es low-ticket pero la experiencia debe sentirse premium.
- La PWA es el verdadero entregable — no un PDF.
- "Mejor mucho contenido pero bien organizado, que poco y bien diseñado": FALSO. Acá lo importante es que sea consumible en 1-2 sesiones y sostenible 30 días.

#### 2. Avatar (~80 líneas)

- Sofía, 38 años, mamá de 1 hijo.
- Ya probó keto, ayuno, eliminó gluten, tomó probióticos. Nada le funcionó del todo.
- Trabaja desde casa parte del día. Le importa cómo le queda la ropa pero más cómo se siente al final del día.
- Lee Mujer Hoy, Cosmopolitan, ve TikToks de salud holística.
- NO confía en médicos tradicionales (le dijeron "es estrés") pero tampoco en charlatanes.
- Compra en MercadoLibre, paga con débito o efectivo, NO siempre tiene tarjeta de crédito internacional.
- Lenguaje: usa "che", "una", "tipo", "re", pero NO usa "boludo" o jerga muy local.
- Decide en menos de 10 minutos para low-ticket.

#### 3. Lógica del Funnel "Papilla de Bebé" (~60 líneas)

- Por qué un ad → quiz → resultados convierte mejor que ad → página de ventas.
- Cada slide del quiz es un micro-compromiso. Reduce fricción de la decisión grande.
- Ya hubo 16 slides previamente; ahora testeamos 13.

#### 4. Los 3 Pilares de Venta (~80 líneas)

##### 4.1 Lógica
- Por qué tiene sentido lo que ofrecés (microbiota, ciencia básica accesible).
- Sin "verborrea científica" pero con vocabulario que sugiera competencia.

##### 4.2 Confianza
- Testimonios reales > testimonios genéricos.
- Audios y video > solo texto.
- Nombre + edad + ciudad en cada testimonio.
- Garantía de 30 días.

##### 4.3 Persuasión
- Yes-street antes del CTA.
- Escasez genuina (cohortes mensuales, no falsa).
- Pricing comparativo (precio tachado debe ser creíble).

#### 5. Voz de Marca (~100 líneas)

##### Reglas duras
- ✅ Voseo argentino neutralizado: "podés", "te llevás", "notás", "vas a sentir".
- ❌ "Tú puedes" o tuteo (excepto en variantes para España, futuro).
- ❌ Argentinismos fuertes: "boludo", "che", "quilombo", "laburo", "guita".
- ✅ Tono cálido, cercano, NO clínico ni vendedor.
- ❌ Signos de admiración múltiples (!!!).
- ❌ EMOJIS EN EXCESO. 1 cada 3-4 párrafos máximo, nunca 2 seguidos.
- ✅ Frases cortas. Oración promedio < 20 palabras.
- ❌ "Increíble", "asombroso", "milagroso", "secreto" (suenan a charlatán).
- ✅ "Sí funciona", "lo notarás", "tu cuerpo lo va a agradecer".

##### Largo de cada elemento
- Headline: ≤ 12 palabras.
- Subhead: ≤ 25 palabras.
- Body parrafal: ≤ 40 palabras por párrafo.
- CTA: 3-5 palabras.

#### 6. Frameworks de Copy (~120 líneas)

##### PAS (Problema-Agitación-Solución)
Detalle + 2-3 ejemplos aplicados a anti-hinchazón.

##### AIDA (Atención-Interés-Deseo-Acción)
Idem.

##### Yes-Street
- Mínimo 3 preguntas con respuesta obvia "sí".
- Cada una toca una arista distinta del deseo.
- La última lleva al CTA.

##### Hooks templates
Lista de hooks con plantillas:
- Identificación: "¿Tenés [problema] [con qué frecuencia]?"
- Curiosidad: "Esta [cosa inesperada] [resultado deseable]."
- Contraintuitivo: "Comer más [X] me ayudó a [resultado]."
- Polémico: "Las [soluciones populares] son una estafa."
- Noticia viral: "[Persona/categoría] [verbo de éxito sorprendente]."

#### 7. Estructura del Quiz (~80 líneas)

- Por qué el orden actual (intro → fácil → personal → info → emocional → frecuencia → info → si-streets → email → loading).
- Reglas inviolables:
  - NUNCA pedir email en los primeros 5 slides.
  - NUNCA pedir teléfono en quiz low-ticket (es para WhatsApp follow-up post-compra).
  - SIEMPRE el progress bar visible (pero sutil).
  - Las info cards NO son opcionales — son anclas de autoridad y reducen fatiga.

#### 8. Página de Resultados (~80 líneas)

- Estructura de los 13 bloques actuales y por qué están en ese orden.
- Cómo se personalizan según tipo de hinchazón.
- StickyCTA: cuándo aparece, cuándo se esconde.

#### 9. Reglas de Ads (~80 líneas)

- Resumen del playbook (Agente 17), con énfasis en lo que la IA debe respetar al generar copy de ads.
- Ej: hooks bajo 8 palabras, primera línea visible debe matar.

#### 10. Métricas (~40 líneas)

- Resumen de _METRICAS.md (Agente 16).

#### 11. Errores Prohibidos (~80 líneas)

Lista numerada de errores que la IA NUNCA debe cometer:
1. Inventar testimonios con nombres de famosos.
2. Promesas médicas ("cura", "trata", "diagnostica").
3. Comparaciones explícitas con marcas competidoras por nombre.
4. Antes/después con cuerpos editados.
5. Lenguaje de género no inclusivo cuando hablamos al avatar.
6. Inventar estudios o citar fuentes inexistentes.
7. Usar "yo" del fundador en copy de venta (suena vendedor).
8. ... (al menos 15 errores)

#### 12. Decisiones Estilísticas Vinculantes (~50 líneas)

- Paleta exacta (con hex).
- Tipografías exactas y cuándo usar cada una.
- Spacing scale de Tailwind que usamos.
- Botones: solo `rounded-full` para CTAs primarios, `rounded-xl` para secundarios.
- ...

#### 13. Glosario (~30 líneas)

- Términos del proyecto y su definición canónica.

#### 14. Casos Edge (~50 líneas)

- Si un usuario llega a /resultados sin params: mostrar variante "tipo 3" por default.
- Si Hotmart está caído: el CTA debe seguir mostrando precio, no romper.
- Si el email de la compra no matchea con login: mensaje específico.
- ... (al menos 10 casos)

---

## Acceptance criteria

- [ ] El doc tiene al menos 800 líneas.
- [ ] Todas las secciones del outline están presentes.
- [ ] No hay placeholders tipo "TODO" o "lorem ipsum".
- [ ] Los ejemplos de copy son ARGENTINOS (voseo, sin tuteo).
- [ ] Lista de errores prohibidos tiene mínimo 15 items.
- [ ] Casos edge tiene mínimo 10 items.
- [ ] Frontmatter de Kiro válido (`inclusion: always` o `inclusion: manual`).

---

## Dependencies

Ninguna estricta, pero conviene que los Agentes 16 (Métricas) y 17 (Playbook) ya existan para no contradecirlos.

---

## Human inputs needed

- **Decisión:** ¿`inclusion: always` (siempre activo) o `inclusion: manual` (que el agente lo invoque cuando lo necesite)?
  - Recomendación: `manual`, para no inflar el contexto en tareas que no son de copy.

---

## Notes

- Este file es la fuente de verdad ESTILÍSTICA del proyecto. Si después de implementarlo, otro agente genera copy que contradice este doc, este doc gana.
- Mantenlo updated cada vez que cambien decisiones estilísticas.
