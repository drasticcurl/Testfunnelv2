# _PRODUCT-DATA.md — Datos canónicos del producto

> **Compartido — fuente de verdad para nombres, precios, value stack.**
> Si en algún lugar del proyecto hay un valor distinto al de acá, este gana.

## Productos

### Front End — Protocolo Anti-Hinchazón 7 Días

- **Precio:** $14.90 USD
- **Precio "tachado":** $39.90 USD (precio original / valor real)
- **Tipo:** PDF descargable + planilla Google Sheets
- **Páginas:** 15–20
- **Promesa de entrega:** "Lo recibís en tu email en menos de 60 segundos"
- **Tiempo de uso:** 7 días
- **Resultado prometido:** "Notás reducción visible de hinchazón desde el día 3"
- **Garantía:** 30 días sin preguntas (ver sección "Garantía" más abajo)

#### Value stack (qué incluye, con valor percibido)

| Item | Valor percibido | Implementado como |
|---|---|---|
| Protocolo 7 días interactivo (plan día a día, 5 comidas/día) | $47 | `/pwa/plan` (día a día con comidas) |
| Lista de 14 alimentos inflamatorios | $17 | `/pwa/guias/inflamatorios` |
| Lista de 21 alimentos antiinflamatorios | $17 | `/pwa/guias/antiinflamatorios` |
| 35 recetas del plan | $27 | `/pwa/recetas` (las no-extra) |
| Guía de suplementación natural | $22 | `/pwa/guias/suplementacion` |
| Ritual de mañana 5 minutos | $9 | `/pwa/guias/ritual` |
| Diario de síntomas interactivo | $17 | `/pwa/diario` |
| Calculadora de microbiota | $12 | `/pwa/calculadora` |
| **TOTAL** | **$168** | |

> **Nota:** El contenido del antiguo Order Bump (Kit Anti-Excusas: recetas express, menú emergencia, meal prep, swaps) ahora se incluye en el Front End como parte de la PWA.
> El value stack se mantiene con el Diario de síntomas interactivo + Calculadora de microbiota.

### ~~Order Bump — ELIMINADO~~

> **Decisión Mayo 2026:** Se eliminó el Order Bump ($7 Kit Anti-Excusas) para simplificar el funnel LATAM.
> El contenido del Kit Anti-Excusas (recetas express, menú emergencia, meal prep, swaps) se integra
> directamente en la PWA como parte del Front End.

### Upsell 1 — Programa Anti-Hinchazón 30 Días Completo

- **Precio:** $9.90 USD
- **Precio tachado:** $37 USD
- **Tipo:** Programa completo de 30 días
- **Posicionamiento post-compra:** "Sumá las 4 semanas completas por solo $9.90 más" (ancla: valor normal $37)
- **Contenido:**
  - Plan completo de 4 semanas (semana 1: limpieza / semana 2: reincorporación / semana 3: optimización / semana 4: mantenimiento)
  - 30 recetas adicionales
  - Audioguía diaria de 5 min (30 audios)
  - Calculadora de tu microbiota (Google Sheets)
  - Guía de suplementación natural (PDF de 4–6 páginas)
  - Acceso a comunidad Telegram privada
  - Reto "30 días Panza Plana" con tracking

---

## AOV (Average Order Value)

Cálculo realista por comprador (sin bump, upsell a $9.90):

| Item | Precio | Take rate | Aporte AOV |
|---|---|---|---|
| Front end | $14.90 | 100% | $14.90 |
| Upsell 1 (Programa 30 Días) | $9.90 | 40% | $3.96 |
| **TOTAL** | | | **$18.86** |

**AOV estimado:** ~$18.86 USD

> **Nota:** El take rate del upsell a $9.90 se proyecta en 40% (vs 25% anterior a $14.90)
> porque el precio es menor a lo que la compradora ya pagó, lo cual reduce fricción post-compra.

---

## Economía unitaria por venta (sin upsell)

| Concepto | Monto |
|---|---|
| Venta front end | $14.90 |
| Comisión Hotmart (~10%) | -$1.49 |
| **Neto por venta (sin upsell)** | **$13.41** |

> Este número ($13.41) es tu referencia para calcular si un creativo es ganador.
> Si tu CPA (costo por adquisición) < $13.41, estás en profit incluso sin el upsell.

---

## Promesa principal del producto

> "En 7 días vas a notar tu panza desinflada, sin pastillas, sin dietas extremas, sin contar calorías."

### Variantes según contexto

- **Ad:** "Bajá la hinchazón en 7 días" / "Desinflamá tu panza en una semana"
- **Quiz pregunta final:** "¿Te gustaría desinflamarte de forma natural?"
- **Página de resultados:** "Tu plan personalizado para desinflamarte en 7 días"
- **PDF tapa:** "Plan de 7 días para desinflamar tu abdomen y recuperar tu energía digestiva"

---

## Los 4 Tipos de Hinchazón (categorías de personalización)

> Son labels de personalización en el funnel. **El producto es el mismo para los 4 tipos.**

| Tipo | Nombre | Descripción corta |
|---|---|---|
| 1 | HINCHAZÓN MATUTINA | "Tu cuerpo arrastra inflamación de la noche anterior. Indicador de microbiota desequilibrada." |
| 2 | HINCHAZÓN POSTPRANDIAL | "Tu sistema reacciona a alimentos del almuerzo. De los más fáciles de revertir." |
| 3 | HINCHAZÓN INFLAMATORIA VESPERTINA | "El más común en mujeres adultas. Acumulación de inflamación durante el día." |
| 4 | HINCHAZÓN CRÓNICA PERSISTENTE | "Microbiota significativamente desequilibrada. Necesita reset estructurado." |

---

## Las 3 Causas (parte del copy)

1. **Disbiosis intestinal** — microbiota desequilibrada
2. **Alimentos inflamatorios "ocultos"** — los 12 que comemos creyéndolos saludables
3. **Eje intestino-cerebro alterado** — estrés y descanso afectan digestión

---

## Lista de los 12 alimentos inflamatorios "ocultos"

Para que el copy en distintos lugares la nombre consistentemente:

1. Lácteos enteros (especialmente quesos duros)
2. Gluten en harinas refinadas
3. Ultraprocesados (snacks de bolsa)
4. Edulcorantes artificiales (sucralosa, aspartamo)
5. Harinas refinadas
6. Embutidos
7. Alcohol
8. Gaseosas (incluso "light")
9. Fritos
10. Soja procesada
11. Exceso de cafeína
12. Exceso de sal y caldos en cubo

---

## Lista de los 15 alimentos antiinflamatorios estrella

1. Jengibre
2. Cúrcuma
3. Palta
4. Salmón
5. Kiwi
6. Papaya
7. Ananá
8. Hojas verdes (espinaca, rúcula, kale)
9. Kéfir
10. Yogur natural
11. Nueces
12. Chía
13. Lino
14. Té verde
15. Agua con limón en ayunas

---

## Las 4 reglas de oro

1. **Hidratación estratégica** — 2L mínimo, NO durante las comidas
2. **Comer despacio** — masticar 20 veces por bocado
3. **Última comida 3 horas antes de dormir**
4. **Movimiento mínimo post-comida** — caminar 10 min después de almorzar/cenar

---

## Testimonios (placeholders, reemplazar con reales en semana 2)

```
Testimonio 1
- Nombre: Carolina M.
- Edad: 42
- Ciudad: Buenos Aires
- Texto: "En 7 días no podía creer la diferencia. Me bajó la panza visiblemente y dejé de sentirme pesada después de comer. Hace años que no me sentía así."

Testimonio 2
- Nombre: Lucía P.
- Edad: 38
- Ciudad: Rosario
- Texto: "A los 4 días me probé un jean que no me entraba hace 8 meses. Y no era que había bajado de peso — era que se me había ido la inflamación."

Testimonio 3
- Nombre: Verónica T.
- Edad: 51
- Ciudad: Córdoba
- Texto: "Probé keto, ayuno, detox, todo. Esto fue lo primero que me funcionó de verdad. Ya estoy recomendándolo a mis amigas."
```

---

## Datos misceláneos para copy

- **Estudio citable** (parafraseado): "El 73% de las mujeres confunde inflamación intestinal con grasa abdominal. — *Journal of Gastroenterology, 2023*"
- **Frase del autor del programa** (genérica, sin nombre real): "Después de 8 años trabajando con mujeres con hinchazón crónica, identifiqué los 12 alimentos que estaban inflamando a casi todas."
- **Claim de cantidad**: "Más de 12.000 mujeres ya hicieron este test"


---

## Garantía

- **Período:** 30 días desde la compra
- **Política:** 100% del importe, sin preguntas
- **Trigger:** email a `soporte@anti-hinchazon.com` (placeholder — reemplazar por el email operativo real antes de publicar)
- **Aplica a:** front + bump + upsell (los 3 productos de Hotmart deben tener el mismo período configurado)
- **Tono del copy:** "asumimos NOSOTROS el riesgo", énfasis en que no hay que demostrar nada ni completar formularios
