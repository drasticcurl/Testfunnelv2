# _METRICAS.md — Benchmarks y diagnóstico

> **Compartido — léelo si vas a optimizar o medir el funnel.**

## Benchmarks objetivo

### Top of funnel (Meta Ads)

| Métrica | Mínimo | Objetivo | Excelente |
|---|---|---|---|
| CTR | 1.5% | 2.5% | 4%+ |
| Hook rate (3s view) | 25% | 40% | 60%+ |
| CPM | <$5 USD (LATAM) | <$3 | <$2 |
| CPC | <$0.50 | <$0.30 | <$0.20 |
| Cost per QuizStart | <$1.50 | <$1.00 | <$0.70 |

### Quiz

| Métrica | Mínimo | Objetivo | Excelente |
|---|---|---|---|
| Tasa de inicio (de los que llegan) | 40% | 60% | 75%+ |
| Tasa de finalización del quiz | 60% | 75% | 85%+ |
| Email opt-in | 60% | 75% | 85%+ |

### Página de resultados

| Métrica | Mínimo | Objetivo | Excelente |
|---|---|---|---|
| CVR a checkout init | 3% | 6% | 10%+ |
| Tiempo en página | >40s | >90s | >180s |
| Scroll 50% | 60% | 75% | 85%+ |
| Click en CTA principal | 5% | 10% | 15%+ |

### Checkout (Hotmart)

| Métrica | Mínimo | Objetivo | Excelente |
|---|---|---|---|
| Conversión checkout → compra | 50% | 70% | 85%+ |
| Take rate upsell 1 ($9.90) | 25% | 40% | 55%+ |

### Negocio

| Métrica | Mínimo | Objetivo | Excelente |
|---|---|---|---|
| AOV | $17 | $19 | $22+ |
| ROAS | 1.5x | 2.0x | 3.0x+ |
| CPA | <$10 | <$7 | <$5 |
| Tasa de reembolso | <3% | <1.5% | <0.8% |

---

## Diagnóstico — qué tocar si no llega el ROAS al día 3

```
ROAS día 3 < 1.0
   │
   ├── Hook rate < 25% → Cambiar primer frame del creativo
   │
   ├── CTR < 1% → Cambiar el ángulo / hook del creativo
   │
   ├── Tasa inicio quiz < 30% → Problema en la landing pre-quiz
   │   - Revisar congruencia ad → headline de la landing
   │   - Hacer más explícito el CTA "Empezar el test"
   │
   ├── Finalización quiz < 50% → Quiz muy largo o confuso
   │   - Reducir a 6–7 preguntas reales
   │   - Probar con menos opciones por pregunta
   │   - Quitar info card 2
   │
   ├── Email opt-in < 50% → Problema en el slide 15
   │   - Reforzar promesa: "Tu plan personalizado para [tipo]"
   │   - Reducir fricción del form (solo email)
   │
   ├── CVR resultados < 2% → Problema en la página de ventas
   │   - Probar nuevo headline (test A/B)
   │   - Probar nuevo precio (volver a $9.90 como test, o subir a $19.90)
   │   - Reforzar garantía y testimonios
   │   - Mover CTA principal más arriba
   │
   └── Take rate upsell 1 < 20% → Página de upsell o precio
       - Reescribir headline ("antes de seguir...")
       - Reforzar ancla de valor ($37 tachado → $9.90)
       - Probar urgencia ("solo disponible ahora")
```

---

## Decisiones a las 72hs según ROAS

| ROAS | Acción |
|---|---|
| **>2.0** | Escalar 30% cada 48hs. Producir 3 variantes del creativo ganador. |
| **1.5–2.0** | Mantener presupuesto. Optimizar el cuello de botella del funnel (ver diagnóstico). |
| **1.0–1.5** | Identificar creativo perdedor y matarlo. Mantener los 2 mejores con mismo presupuesto. |
| **<1.0** | Hacer 3 nuevos ángulos creativos. Considerar revisar oferta o página de resultados. |

---

## Cuándo se considera "validada" la oferta

Una oferta está **validada** cuando, durante 7 días consecutivos, mantiene:

- ROAS ≥ 1.8x
- AOV ≥ $17
- Tasa de reembolso < 2%
- CPA estable (no creciendo más del 20% día a día)

Cuando llega a esto: **escalar agresivo** y abrir mercados adicionales (México, Colombia).

---

## Dashboard sugerido

Crear un Google Sheet con esta estructura, llenar diariamente:

| Día | Spend | Impr | Clicks | CTR | CPM | QuizStart | QuizComplete | Cart | Sales | Up1 | Revenue | ROAS | CPA |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Datos vienen de:
- **Spend, Impr, Clicks, CTR, CPM**: Meta Ads Manager
- **QuizStart, QuizComplete, Cart**: Meta Events Manager (eventos custom)
- **Sales, Up1, Revenue**: Hotmart Reportes

Después de 7 días vas a tener visibilidad clara de qué optimizar.

---

## Métricas que NO importan el día 1

Ignoralas hasta que tengas más data:

- ROI a 30 días (todavía no tenés cohortes)
- LTV (necesitás meses)
- NPS (necesitás muchas compras)
- Engagement orgánico (no vendemos por orgánico)

---

## Economía unitaria y Media Buying Calculator

### Tu número clave: $13.41

```
Venta front end:              $14.90
- Comisión Hotmart (~10%):    -$1.49
= NETO POR VENTA (sin upsell): $13.41
```

**Si tu CPA < $13.41, estás en profit incluso sin contar el upsell.**

Con upsell (AOV estimado $18.86):
```
AOV:                          $18.86
- Comisión Hotmart (~10%):    -$1.89
= NETO POR VENTA (con upsell): $16.97
```

---

### Presupuesto CBO para ecommerce low-ticket LATAM

**Regla general para CBO:** Tu presupuesto diario por campaña debe ser **al menos 3-5x tu CPA objetivo** para que Meta tenga suficiente data para optimizar.

| Escenario | CPA objetivo | Presupuesto diario CBO | Ventas esperadas/día |
|---|---|---|---|
| Conservador | $10 | $30-50/día | 3-5 ventas |
| Moderado | $7 | $35-50/día | 5-7 ventas |
| Agresivo (validado) | $5 | $50-75/día | 10-15 ventas |

**Recomendación arranque:** $30/día CBO con 3 ad sets (3-5 creativos cada uno).

**Alternativa presupuesto ajustado ($20/día x 3 días = $60 total):**
- $20/día CBO con 2 ad sets (3 creativos cada uno)
- Cada ad set recibe ~$10/día → suficiente para 1-2 ventas/día/ad set
- En 3 días tenés $60 gastados → suficiente para juzgar CTR, hook rate, y si hay alguna venta
- NO toques nada los 3 días. Dejá correr sin pausar.

**Estructura recomendada para $20/día:**

```
CAMPAÑA CBO: $20/día — broad (sin intereses, 18-55 mujeres, país)
│
├── AD SET 1: Ángulo "DOLOR / PROBLEMA"
│   (Emoción core: frustración, identificación con el sufrimiento)
│   │
│   ├── Creativo 1: Hook directo al dolor
│   │   "¿Te hinchás todos los días sin importar qué comés?"
│   │
│   ├── Creativo 2: Hook de frustración acumulada
│   │   "Probaste keto, ayuno, sin gluten... y seguís igual"
│   │
│   └── Creativo 3: Hook de situación específica
│       "Si tu panza se infla después de almorzar, mirá esto"
│
└── AD SET 2: Ángulo "PRUEBA SOCIAL / RESULTADO"
    (Emoción core: esperanza, validación, "si a ella le funcionó...")
    │
    ├── Creativo 1: Testimonio + transformación
    │   "Carolina se desinflamó en 7 días sin dietas extremas"
    │
    ├── Creativo 2: Dato de autoridad + resultado
    │   "12.000 mujeres ya hicieron este test y descubrieron..."
    │
    └── Creativo 3: Contraste antes/después conceptual
        "Día 1 vs Día 7 — lo que cambió sin pastillas ni médicos"
```

**Reglas para $20/día:**
- Solo 3 creativos por ad set (con $10/día, 5 creativos no reciben impresiones)
- NO tocar nada por 3 días completos (72hs)
- Si un ad set consume 80%+ del budget → CBO eligió ganador, dejalo
- Después de 3 días: matá el perdedor, probá un 3er ángulo ("Curiosidad/Secreto")

**Fase de aprendizaje:** Meta necesita ~50 eventos de conversión por semana por ad set para salir de learning phase. Con Purchase como evento: necesitás ~7 ventas/día por ad set, o ~21 ventas totales. Si no llegás, optimizá por Lead (quiz completado) mientras escalás.

---

### ¿Cuándo un creativo es GANADOR?

Un creativo se considera ganador cuando, **con al menos $30-50 gastados en ese creativo**:

| Métrica | Umbral ganador | Cálculo |
|---|---|---|
| CPA | ≤ $10 | < 75% de tu neto ($13.41) |
| ROAS | ≥ 1.5x | Revenue / Spend |
| CTR | ≥ 2% | Clicks / Impresiones |
| Hook rate | ≥ 35% | 3s views / Impresiones |
| Cost per QuizStart | ≤ $1.00 | Spend / QuizStarts |

**Regla rápida:** Si gastaste $40 en un creativo y no tenés al menos 3 ventas → matalo.

---

### ¿Cómo saber si el problema es el CREATIVO vs el MVP/FUNNEL?

Este es el framework de diagnóstico:

```
┌─────────────────────────────────────────────────────────────────────┐
│ PREGUNTA: ¿Es el creativo o es el funnel?                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PASO 1: ¿Llega tráfico calificado?                                │
│  ──────────────────────────────────                                 │
│  Mirá CTR + Hook rate + CPC                                        │
│                                                                     │
│  • CTR < 1% Y Hook rate < 25% → PROBLEMA DE CREATIVO               │
│    (La gente no se engancha. Cambiá hook/ángulo/formato)            │
│                                                                     │
│  • CTR > 1.5% Y Hook rate > 30% → El creativo funciona.            │
│    El problema está más abajo en el funnel. Seguí al Paso 2.       │
│                                                                     │
│  PASO 2: ¿El quiz convierte?                                       │
│  ──────────────────────────────                                     │
│  Mirá: QuizStart rate + QuizComplete rate                           │
│                                                                     │
│  • QuizStart < 40% de clicks → Landing no es congruente con el ad  │
│    (Problema de MENSAJE, no de MVP)                                 │
│                                                                     │
│  • QuizComplete < 60% → Quiz es largo/confuso                      │
│    (Problema de UX del funnel)                                      │
│                                                                     │
│  • QuizComplete > 70% → Quiz OK. Seguí al Paso 3.                  │
│                                                                     │
│  PASO 3: ¿La página de resultados vende?                            │
│  ──────────────────────────────────────────                          │
│  Mirá: CVR resultados → checkout click                              │
│                                                                     │
│  • CVR < 2% con buen tráfico → PROBLEMA DE OFERTA/MVP              │
│    La gente llega, lee, y no compra.                                │
│    Opciones:                                                        │
│    - Cambiar precio ($14.90 → $9.90 test)                           │
│    - Cambiar headline/promesa                                       │
│    - Agregar más urgencia/escasez                                   │
│    - Mejorar testimonios                                            │
│                                                                     │
│  • CVR > 3% → Funnel OK. Si el CPA sigue alto,                     │
│    el problema es VOLUMEN o CPM. Necesitás más creativos buenos     │
│    o probar otras audiencias.                                       │
│                                                                     │
│  PASO 4: ¿Hotmart cierra la venta?                                  │
│  ──────────────────────────────────                                  │
│  Mirá: Checkout init → Purchase rate                                │
│                                                                     │
│  • < 50% → Checkout de Hotmart tiene fricción                       │
│    (Normal en LATAM. Hotmart no es ideal para impulso.)             │
│    Poco que puedas hacer acá, es limitación de plataforma.          │
│                                                                     │
│  • > 60% → Checkout OK.                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Resumen: tabla de decisiones rápida

| CTR | Quiz Complete | CVR Resultados | Diagnóstico |
|---|---|---|---|
| ❌ < 1% | — | — | **Creativo malo.** Cambiá hook. |
| ✅ > 1.5% | ❌ < 50% | — | **Quiz/landing falla.** Revisá congruencia. |
| ✅ > 1.5% | ✅ > 65% | ❌ < 2% | **Oferta/MVP falla.** Revisá precio, copy, promesa. |
| ✅ > 1.5% | ✅ > 65% | ✅ > 3% | **Funnel funciona.** Escalá presupuesto + más creativos. |

---

### Cuánto esperar antes de decidir

| Presupuesto gastado en el creativo | ¿Puedo juzgarlo? |
|---|---|
| < $15 | NO. Muy poca data. Esperá. |
| $15-30 | Solo podés juzgar CTR y hook rate (métricas top-of-funnel). |
| $30-50 | Podés juzgar CPA si tenés al menos 2-3 ventas. |
| > $50 sin ventas | MATALO. Es perdedor. |
| > $50 con 3+ ventas | Es ganador. Dejalo correr y escalá. |

### Qué esperar con $60 totales (3 días x $20)

**Escenario realista con CPM $3 LATAM:**
- ~6,600 impresiones totales (~3,300 por ad set)
- ~130-165 clicks (CTR 2-2.5%)
- ~80-100 QuizStarts
- ~50-65 QuizCompletes
- ~2-4 ventas (CVR 4-6% de resultados)

**Con $60 vas a poder saber:**
- ✅ Si algún creativo tiene buen CTR y hook rate (señal de que el ángulo funciona)
- ✅ Si la gente completa el quiz (señal de que landing + quiz son congruentes)
- ✅ Si tenés al menos 1-2 ventas (señal de que la oferta tiene demanda)

**Con $60 NO vas a poder saber:**
- ❌ CPA real estabilizado (necesitás mínimo 10-15 ventas para eso)
- ❌ Take rate del upsell con certeza estadística
- ❌ Cuál es el mejor creativo definitivo

**Si en 3 días con $60:**
- 0 ventas + CTR < 1% → Creativos malos. Hacé nuevos, no toques el funnel.
- 0 ventas + CTR > 1.5% + QuizComplete alto → Funnel no cierra. Revisá /resultados.
- 1-2 ventas → Señal positiva. Si podés meter otros $60, seguí. El funnel tiene tracción.
- 3+ ventas → Felicitaciones, CPA ~$20 o menos. Buscá más budget para escalar.

---

### Breakeven y profit targets

```
BREAKEVEN (CPA = neto por venta):
  CPA máximo permitido = $13.41 (sin upsell)
  CPA máximo permitido = $16.97 (con upsell promedio)

PROFIT TARGET (ROAS 2x):
  CPA objetivo = ~$9.50 (con AOV $18.86)
  Es decir: cada $9.50 que gastás en ads → vendés $18.86

ESCALAR (ROAS 1.5x):
  CPA máximo para escalar = ~$12.57 (con AOV $18.86)
  Todavía profitable, pero margen más fino.
```

---

### Validación del MVP (primeros 7 días de ads)

**El MVP está validado SI después de 7 días:**

1. ✅ Tenés al menos 10 ventas (sample size mínimo)
2. ✅ ROAS ≥ 1.5x promedio de los 7 días
3. ✅ Al menos 1 creativo tiene CPA ≤ $10
4. ✅ CVR de resultados ≥ 3%
5. ✅ Tasa de reembolso < 5% (normal que sea 0% los primeros 7 días)

**El MVP NO está validado SI:**

1. ❌ 0-2 ventas en 7 días con $200+ gastados → Problema grave de oferta
2. ❌ Muchos clicks, quiz completados, pero 0 ventas → Página de resultados no convierte
3. ❌ Buen CTR pero nadie empieza el quiz → Landing no es congruente con el ad

**Señal de que el problema son los CREATIVOS (no el MVP):**
- Los 3-5 creativos tienen CTR < 1% todos
- Hook rate < 20% en todos
- Nadie llega al quiz porque nadie clickea el ad
- → Solución: hacer 5-10 creativos nuevos con ángulos distintos, NO tocar el funnel

**Señal de que el problema es el MVP/FUNNEL (no los creativos):**
- Al menos 1 creativo tiene CTR > 2% y buen hook rate
- La gente llega, hace el quiz, pero no compra
- CVR de resultados < 1.5% con tráfico decente
- → Solución: revisar oferta, precio, copy de /resultados, testimonios
