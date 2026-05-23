# 07 — AGENTE PDF 30 DÍAS (Upsell 1)

> **Rol:** generar el contenido del Upsell 1 — "Programa Anti-Hinchazón 30 Días" + sus componentes (audioguía, calculadora, guía suplementación). Mínimo viable para entregar el día 1.

## Tu output

1. **`outputs/pdfs/programa-30-dias-semana-2.md`** — Plan Semana 2 completo (la semana 1 es el front end)
2. **`outputs/pdfs/recetas-extra-semana-2.md`** — 5 recetas adicionales (días premenstruales)
3. **`outputs/pdfs/guia-suplementacion.md`** — guía de suplementación natural
4. **`outputs/audios/guion-audioguia-dia-1.md`** — guión del audio día 1 para ElevenLabs
5. **Estructura de la calculadora microbiota** (Google Sheets template)

## Estrategia de entrega minimum viable

NO necesitás todo el programa de 30 días el día 1. La idea: **drip**.

| Componente | Día 1 | Drip |
|---|---|---|
| Plan Semana 1 | ✅ (es el front end) | — |
| **Plan Semana 2** | ✅ (lo entregás vos) | — |
| Plan Semana 3 | ❌ | Email automation día 14 |
| Plan Semana 4 | ❌ | Email automation día 21 |
| **5 recetas extra** (premenstruales) | ✅ | — |
| 25 recetas restantes | ❌ | Drip semanal |
| **Audioguía Día 1** | ✅ | — |
| Audioguías días 2–30 | ❌ | Drip diario |
| **Calculadora microbiota** | ✅ | — |
| **Guía suplementación** | ✅ | — |
| **Reto 30 días (planilla)** | ✅ | — |

## Componente 1 — Plan Semana 2 (Reincorporación estratégica)

8 páginas mínimo:

### Página 1 — Bienvenida a la Semana 2
- Felicitaciones por completar la Semana 1
- Qué cambia en esta semana: empezamos a reincorporar alimentos
- 2 reglas clave para esta semana

### Página 2 — Test de tolerancia personal
- Qué es: tabla para anotar reacciones a alimentos reincorporados
- Cómo usarla
- Tabla:

```
Día 8 | Alimento reincorporado | ¿Síntomas? (sí/no) | Cuáles | Severidad (1–10)
```

### Página 3 — Plan Día 8
- 5 comidas detalladas

### Página 4 — Plan Día 9
- 5 comidas detalladas

### Página 5 — Plan Día 10

### Página 6 — Plan Día 11

### Página 7 — Plan Día 12, 13, 14
- Más comprimido, 1 página para los 3

### Página 8 — Cierre Semana 2
- Reflexión sobre el progreso
- Anticipo Semana 3

## Componente 2 — 5 recetas extra (días premenstruales)

Para los días en que retención de líquidos + antojos + dolor abdominal son peores. Recetas específicas:

1. Sopa caliente de jengibre y zanahoria
2. Bowl de quinoa con salmón y palta (anti-retención)
3. Smoothie de banana, cacao y almendras (calma antojos sin azúcar)
4. Té de manzanilla y jengibre con cúrcuma
5. Galletas de avena con chips de cacao puro (snack saludable para antojos)

Mismo formato del recetario (`06-PDF-RECETARIO.md`).

## Componente 3 — Audioguía Día 1 (guión para ElevenLabs)

`outputs/audios/guion-audioguia-dia-1.md`

Guión de 5 minutos (~700 palabras), voz IA "Valentina" o "Sofia" en ElevenLabs.

### Estructura del audio

```
[0:00 - 0:30] CONTEXTO DEL DÍA
"Buenos días, [pausa] hoy es tu día 1 del Programa Anti-Hinchazón
de 30 días. [pausa] Antes de arrancar, quiero que respires
profundo conmigo..."

[0:30 - 2:00] FOCO DEL DÍA
"El foco de hoy es: [foco], explicación de por qué...
Hoy lo que vas a notar es..."

[2:00 - 3:30] EJERCICIO PRÁCTICO
"Vas a hacer esto: [ejercicio práctico simple, 2-3 min]"

[3:30 - 4:30] FRASE MOTIVACIONAL
"Recordá que... [reframe positivo]"

[4:30 - 5:00] RECORDATORIO PRÁCTICO
"Antes de cerrar el audio, completá tu Diario de Síntomas
de hoy. Nos vemos mañana."
```

### Tema del Día 1: HIDRATACIÓN ESTRATÉGICA

Generá el guión completo (700 palabras) sobre por qué el agua bien tomada es lo más importante el primer día. Sin tecnicismos. Tono cálido.

## Componente 4 — Calculadora de Microbiota (Google Sheets)

Estructura del Sheet:

### Hoja 1: Test de microbiota

```
PREGUNTA                                     | RESPUESTA (1-5)
─────────────────────────────────────────────┼─────────────
1. ¿Cuántos gases tenés al día?              | dropdown 1-5
2. ¿Cuántas evacuaciones por día?            | dropdown 1-5
3. ¿Pesadez después de comer?                | dropdown 1-5
4. ¿Hinchazón visible al final del día?      | dropdown 1-5
5. ¿Antojos por dulces?                      | dropdown 1-5
6. ¿Cansancio después del almuerzo?          | dropdown 1-5
7. ¿Estreñimiento?                           | dropdown 1-5
8. ¿Acidez o reflujo?                        | dropdown 1-5
9. ¿Mal aliento matutino?                    | dropdown 1-5
10. ¿Niebla mental?                          | dropdown 1-5
                                             |
TOTAL                                        | =SUM(B2:B11)
```

### Hoja 2: Resultado e interpretación

```
SI total <= 15  → "Microbiota saludable. Mantenimiento."
SI total 16-30 → "Disbiosis leve. Foco en alimentos antiinflamatorios."
SI total 31-40 → "Disbiosis moderada. Protocolo recomendado."
SI total > 40  → "Disbiosis severa. Protocolo + posible suplementación."
```

Usar fórmula condicional `IF(SUM(B2:B11)<=15, "...", IF(...))`

### Hoja 3: Tracking semanal

```
Semana | Total Score | Cambio %
1      |             |
2      |             | =(B3-B2)/B2*100%
...
```

Permite ver evolución a lo largo de las 4 semanas.

## Componente 5 — Guía de Suplementación Natural (PDF, 4–6 páginas)

`outputs/pdfs/guia-suplementacion.md`

### Página 1 — Disclaimer + cómo usar la guía
- Esto NO reemplaza consulta médica
- Empezar con 1 suplemento por vez
- Esperar 7 días antes de agregar otro

### Página 2 — TOP 3 suplementos esenciales
1. **Probiótico de cepa Lactobacillus** — qué hace, marcas accesibles en LATAM, cómo tomarlo, dosis, contraindicaciones
2. **Omega 3** — idem
3. **Magnesio glicinato** — idem

### Página 3 — Suplementos opcionales según síntoma
- Si tenés mucha hinchazón postprandial → enzimas digestivas
- Si tenés estreñimiento → fibra soluble (psyllium)
- Si tenés cansancio → B12

### Página 4 — Alternativas naturales (sin pastillas)
- Si no querés tomar suplementos
- Equivalentes naturales: kéfir, chucrut, miso, kombucha
- Cantidades sugeridas

### Página 5 — Marcas accesibles en LATAM
| País | Marca probiótico | Marca omega 3 | Marca magnesio |
|---|---|---|---|
| Argentina | ... | ... | ... |
| México | ... | ... | ... |
| ... | ... | ... | ... |

### Página 6 — Cuándo consultar al médico
- Síntomas que requieren consulta inmediata
- Cómo presentarle tu progreso al médico

## Reto 30 días "Panza Plana" (Google Sheet template)

Estructura simple:
- 30 filas (1 por día)
- Columnas: Día / Mini-desafío / ¿Lo hiciste? (checkbox) / Notas
- Mini-desafíos sugeridos (vos generás los 30):
  - Día 1: Tomá 2L de agua hoy
  - Día 2: Caminá 20 min después de comer
  - Día 3: Eliminá gaseosas hoy
  - Día 4: Comé al menos 3 hojas verdes
  - ...

## Cómo se entrega esto al usuario

### Si compró el upsell ($37):
1. Recibe email con todos los links de descarga (PDFs)
2. Acceso al Google Sheet "Calculadora microbiota"
3. Acceso al Google Sheet "Reto 30 días"
4. Link al grupo privado de Telegram (creado por el humano)
5. Audio Día 1 disponible inmediato; días 2–30 vía drip por email diario
6. Plan Semanas 3 y 4 vía email automation días 14 y 21

### Si no compró el upsell:
- Sigue solo con su Plan 7 Días del front end
- Recibe email de invitación al upsell con descuento de cliente

## Checklist agente 07

- [ ] Plan Semana 2 completo (8 páginas, 7 días con 5 comidas)
- [ ] 5 recetas premenstruales (mismo formato del recetario)
- [ ] Guión audioguía Día 1 (~700 palabras, 5 minutos)
- [ ] Estructura calculadora microbiota (Google Sheet con fórmulas)
- [ ] Guía suplementación natural (4–6 páginas)
- [ ] Estructura reto 30 días (Google Sheet con 30 mini-desafíos)
- [ ] Tono según _BRAND-VOICE.md
- [ ] Coherente con el plan de 7 días del front end
- [ ] Incluye disclaimer médico en suplementación
