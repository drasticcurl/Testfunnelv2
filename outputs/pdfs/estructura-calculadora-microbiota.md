# CALCULADORA DE MICROBIOTA
## Estructura del Google Sheet — Programa Anti-Hinchazón 30 Días

> **Componente 4 del Upsell · Entrega: Día 1 post-compra**
>
> Instrucciones de configuración para crear el Google Sheet template.
> Compartir en modo "Cualquiera con el link puede hacer una copia" (File → Share → Anyone with link → Viewer → Make a copy).

---

## OVERVIEW DEL ARCHIVO

**Nombre del archivo:** `Calculadora de Microbiota — Programa 30 Días`
**Hojas (tabs):**
1. `INICIO` — Instrucciones + contexto
2. `SÍNTOMAS SEMANALES` — Evaluación semanal automatizada
3. `TEST DE TOLERANCIA` — Registro de reincorporaciones (Semana 2)
4. `DIARIO DIARIO` — Tracking diario de síntomas (30 días)
5. `MI RESULTADO` — Score de microbiota + recomendación personalizada
6. `REFERENCIA` — Tablas de referencia (oculta para el usuario, usada por fórmulas)

---

## HOJA 1: INICIO

### Celda A1 (título)
```
CALCULADORA DE MICROBIOTA
Programa Anti-Hinchazón 30 Días
```
Formato: Fraunces / Georgia, 24pt, color `#2D3A2E`

### Celda A3–A8 (instrucciones)
```
Cómo usar esta calculadora:

1. EMPEZÁ por la hoja "SÍNTOMAS SEMANALES" — completala al inicio del programa (Día 1) y cada 7 días.
2. Usá la hoja "TEST DE TOLERANCIA" durante la Semana 2 (Días 8–14) para registrar cada reincorporación.
3. Completá el "DIARIO DIARIO" cada noche antes de dormir.
4. La hoja "MI RESULTADO" se actualiza sola con tus datos.

Esta calculadora no diagnostica enfermedades. Es una herramienta de autoconocimiento.
```

### Botones de navegación (usar hipervínculos a cada hoja)
- → IR A SÍNTOMAS SEMANALES
- → IR A TEST DE TOLERANCIA
- → IR A DIARIO DIARIO
- → VER MI RESULTADO

---

## HOJA 2: SÍNTOMAS SEMANALES

### Descripción
Evaluación de 20 síntomas. Se completa 4 veces: Día 1, Día 7, Día 14, Día 30. Los puntajes se promedian para calcular el Score de Microbiota.

### Estructura de columnas

| Col | Contenido |
|-----|-----------|
| A | N° de síntoma |
| B | Descripción del síntoma |
| C | Día 1 (escala 0–4) |
| D | Día 7 (escala 0–4) |
| E | Día 14 (escala 0–4) |
| F | Día 30 (escala 0–4) |
| G | Variación Día 1 → 30 (fórmula) |

### Escala de síntomas (encabezado fijo, fila 3)
```
0 = Nunca / No tengo
1 = Raramente (1-2 veces por semana)
2 = Frecuentemente (3-4 veces por semana)
3 = Casi siempre (5-6 veces por semana)
4 = Siempre (todos los días)
```

### Lista de síntomas (filas 5–24)

| # | Síntoma | Categoría |
|---|---------|-----------|
| 1 | Hinchazón abdominal visible | Digestión |
| 2 | Gases frecuentes (> 3 episodios/día) | Digestión |
| 3 | Eructos frecuentes | Digestión |
| 4 | Pesadez post-comida (dura > 2 horas) | Digestión |
| 5 | Ruidos abdominales frecuentes | Digestión |
| 6 | Estreñimiento (< 1 vez/día) | Tránsito |
| 7 | Diarrea o heces blandas frecuentes | Tránsito |
| 8 | Sensación de vaciado incompleto | Tránsito |
| 9 | Urgencia para ir al baño | Tránsito |
| 10 | Moco en heces | Tránsito |
| 11 | Fatiga después de comer | Energía |
| 12 | Cansancio general sin causa aparente | Energía |
| 13 | Niebla mental / dificultad de concentración | Cerebro |
| 14 | Cambios de humor relacionados con el hambre | Cerebro |
| 15 | Antojos intensos de azúcar o harinas | Cerebro |
| 16 | Acné o rosácea | Piel |
| 17 | Eczema u otras reacciones cutáneas | Piel |
| 18 | Resfríos frecuentes (> 4/año) | Inmunidad |
| 19 | Infecciones urinarias o vaginales recurrentes | Inmunidad |
| 20 | Intolerancia a alimentos nuevos / variados | Tolerancia |

### Fórmulas — fila de totales (fila 26)

**Total Día 1 (C26):**
```excel
=SUMA(C5:C24)
```

**Total Día 7 (D26):**
```excel
=SUMA(D5:D24)
```

**Total Día 14 (E26):**
```excel
=SUMA(E5:E24)
```

**Total Día 30 (F26):**
```excel
=SUMA(F5:F24)
```

**Variación total (G26):**
```excel
=SI(F26>0, REDONDEAR(((C26-F26)/C26)*100, 1) & "% mejora", "Completar Día 30")
```

### Score de microbiota (fila 28)

**Score Día 1 (C28):**
```excel
=REDONDEAR(10 - (C26/80)*10, 1)
```

*(El máximo puntaje de síntomas es 80 — 20 síntomas × 4 puntos. El score va de 0 a 10, donde 10 es microbiota óptima.)*

**Score Día 30 (F28):**
```excel
=REDONDEAR(10 - (F26/80)*10, 1)
```

**Interpretación del score (G28):**
```excel
=SI(F28="","Completar Día 30",
   SI(F28>=8,"🌿 MICROBIOTA SALUDABLE — Tu intestino está funcionando bien.",
   SI(F28>=6,"🌱 EN RECUPERACIÓN — Vas por buen camino, mantené el protocolo.",
   SI(F28>=4,"⚠️ DESEQUILIBRIO MODERADO — Necesitás continuar con el protocolo.",
   "🔴 DESEQUILIBRIO SIGNIFICATIVO — Considerá consultar con un profesional."))))
```

### Formato condicional (columnas C–F)
- Valor 0: fondo blanco
- Valor 1: fondo `#E8EFE9` (sage-soft)
- Valor 2: fondo `#FFF3CD` (amarillo claro)
- Valor 3: fondo `#FFE0B2` (naranja claro)
- Valor 4: fondo `#FFCDD2` (rojo claro)

---

## HOJA 3: TEST DE TOLERANCIA

### Descripción
Se usa durante la Semana 2 (Días 8–14) para registrar cada alimento reincorporado y la reacción observada. Genera el "mapa de tolerancias personal" automáticamente.

### Estructura de columnas

| Col | Encabezado | Tipo |
|-----|-----------|------|
| A | Día del programa | Número (8–14) |
| B | Alimento testeado | Texto libre |
| C | Categoría | Desplegable |
| D | Porción consumida | Texto libre |
| E | Síntomas en 3 horas | Texto libre |
| F | Síntomas en 24 horas | Texto libre |
| G | Intensidad síntomas (0–3) | Número |
| H | Tu tolerancia | Fórmula/Desplegable |
| I | Notas | Texto libre |

### Validación de datos — Columna C (Categoría)
Desplegable con opciones:
```
Legumbres
Lácteos fermentados
Lácteos enteros
Cereales sin gluten
Cereales con gluten
Frutas
Proteínas
Otros
```

### Fórmula — Columna H (Tu tolerancia)
```excel
=SI(G2=0,"✅ Verde — Tolerás bien",
   SI(G2=1,"🟡 Amarillo — Tolerar con moderación",
   SI(G2=2,"🟡 Amarillo — Solo ocasionalmente",
   "🔴 Rojo — Evitar por 4 semanas")))
```

### Tabla resumen automática (filas 20–35)

**Encabezado (fila 19):**
`MI MAPA DE TOLERANCIAS PERSONAL`

**Alimentos verdes (fila 21):**
```excel
=UNIRCADENAS(", ", VERDADERO, SI(H2:H15="✅ Verde — Tolerás bien", B2:B15, ""))
```
*(Fórmula de array — ingresar con Ctrl+Shift+Enter)*

**Alimentos amarillos (fila 23):**
```excel
=UNIRCADENAS(", ", VERDADERO, SI(IZQUIERDA(H2:H15,2)="🟡", B2:B15, ""))
```

**Alimentos rojos (fila 25):**
```excel
=UNIRCADENAS(", ", VERDADERO, SI(IZQUIERDA(H2:H15,2)="🔴", B2:B15, ""))
```

---

## HOJA 4: DIARIO DIARIO

### Descripción
Tracking diario de síntomas durante los 30 días del programa. Se completa cada noche (5 minutos).

### Estructura de columnas

| Col | Encabezado | Tipo | Rango |
|-----|-----------|------|-------|
| A | Día | Número (1–30) | — |
| B | Fecha | Fecha | — |
| C | Hinchazón AM (al levantarse) | Número | 1–10 |
| D | Hinchazón PM (al acostarse) | Número | 1–10 |
| E | Energía general | Número | 1–10 |
| F | Movimiento intestinal | Desplegable | — |
| G | Calidad del sueño | Número | 1–10 |
| H | Nivel de estrés del día | Número | 1–10 |
| I | Cumplí el plan de comidas | Desplegable | — |
| J | Agua tomada (vasos) | Número | 0–15 |
| K | Notas / observaciones | Texto libre | — |

### Validación de datos — Columna F (Movimiento intestinal)
```
✅ Normal (1-2 veces, sin esfuerzo)
⬆️ Más de lo habitual
⬇️ Estreñimiento leve
🔴 Estreñimiento marcado
💧 Heces blandas / diarrea
⭕ No tuve movimiento
```

### Validación de datos — Columna I (Cumplí el plan)
```
✅ 100% del plan
🟡 Mayoría (75%+)
🟠 Parcialmente (50%)
🔴 No pude seguirlo hoy
```

### Filas prefijadas (A2:B31)
Pre-llenar la columna A con números 1–30. Columna B dejar vacía para que la usuaria ingrese la fecha.

### Gráfico integrado en la hoja (insertar después de fila 35)

**Gráfico de líneas — Evolución de hinchazón:**
- Eje X: Día (1–30)
- Serie 1: Hinchazón AM (columna C) — color sage `#7A9B7E`
- Serie 2: Hinchazón PM (columna D) — color coral `#E07856`
- Título: "Mi evolución de hinchazón — 30 días"

**Instrucción de creación:**
Insertar → Gráfico → Tipo: Línea → Rango de datos: A2:D31

---

## HOJA 5: MI RESULTADO

### Descripción
Dashboard final. Se alimenta automáticamente con datos de las otras hojas. Es la hoja que la usuaria muestra "como logro" al terminar el programa.

### Sección 1 — Score de microbiota

| Celda | Contenido | Fórmula |
|-------|-----------|---------|
| B3 | Score Día 1 | `='SÍNTOMAS SEMANALES'!C28` |
| B4 | Score Día 30 | `='SÍNTOMAS SEMANALES'!F28` |
| B5 | Mejora en puntos | `=B4-B3` |
| B6 | Interpretación | `='SÍNTOMAS SEMANALES'!G28` |

### Sección 2 — Promedio de hinchazón

| Celda | Contenido | Fórmula |
|-------|-----------|---------|
| B9 | Hinchazón promedio semana 1 | `=PROMEDIO('DIARIO DIARIO'!C2:C8)` |
| B10 | Hinchazón promedio semana 4 | `=PROMEDIO('DIARIO DIARIO'!C23:C30)` |
| B11 | Reducción % | `=SI(B9>0, REDONDEAR(((B9-B10)/B9)*100,1) & "% de reducción", "—")` |

### Sección 3 — Mi mapa de tolerancias

| Celda | Contenido | Fórmula |
|-------|-----------|---------|
| B14 | Alimentos verdes | `='TEST DE TOLERANCIA'!B21` |
| B15 | Alimentos amarillos | `='TEST DE TOLERANCIA'!B23` |
| B16 | Alimentos rojos | `='TEST DE TOLERANCIA'!B25` |

### Sección 4 — Mis logros del programa

Celdas de texto fijo con formato motivacional:

```
🎉 COMPLETASTE EL PROGRAMA DE 30 DÍAS

Tu intestino de hoy ya no es el mismo que hace 30 días.
Guardá este archivo. Es tu punto de partida para los próximos 30.
```

**Botón de próximo paso (hipervínculo):**
`→ CONOCER EL PROGRAMA DE CONTINUACIÓN`
*(Link a la página de la Membresía Vida Sin Hinchazón — Upsell 2)*

---

## HOJA 6: REFERENCIA (oculta)

Esta hoja no es visible para el usuario final. Contiene las tablas de referencia usadas por las fórmulas de interpretación.

### Tabla de interpretación de score

| Score | Interpretación | Color |
|-------|---------------|-------|
| 8–10 | Microbiota saludable | Verde |
| 6–7.9 | En recuperación | Verde claro |
| 4–5.9 | Desequilibrio moderado | Amarillo |
| 0–3.9 | Desequilibrio significativo | Rojo |

---

## INSTRUCCIONES DE CONFIGURACIÓN FINAL

### Paso 1 — Crear el archivo
```
Google Drive → Nuevo → Google Sheets
Nombre: "Calculadora de Microbiota — Programa 30 Días [COPIA TU NOMBRE AQUÍ]"
```

### Paso 2 — Crear las 6 hojas
Clic derecho en la pestaña inferior → Insertar hoja × 5 adicionales
Renombrar en orden: INICIO / SÍNTOMAS SEMANALES / TEST DE TOLERANCIA / DIARIO DIARIO / MI RESULTADO / REFERENCIA

### Paso 3 — Ocultar hoja REFERENCIA
Clic derecho en la pestaña REFERENCIA → Ocultar hoja

### Paso 4 — Proteger hojas de fórmulas
Datos → Proteger hojas y rangos → Proteger hojas MI RESULTADO y REFERENCIA contra edición

### Paso 5 — Configurar permisos de compartir
Compartir → "Cualquiera con el link" → Lector
Nota: las usuarias hacen "Archivo → Crear una copia" para tener su propia versión editable.

### Paso 6 — Copiar el link de "Hacer una copia"

Formato del link directo a copia:
```
https://docs.google.com/spreadsheets/d/[ID_DEL_ARCHIVO]/copy
```
Este link es el que se entrega en el thank you page del upsell.

---

## Texto de instrucciones para el thank you page

```
📊 TU CALCULADORA DE MICROBIOTA YA ESTÁ LISTA

Hacé clic en el botón para abrir tu calculadora personal.
Al abrirla, Google te pedirá que hagas una copia — aceptá.
Esa copia es tuya y solo vos podés editarla.

Completá la primera columna HOY (Día 1) para tener tu punto de partida.
En 30 días, vas a poder comparar y ver exactamente cuánto mejoró tu microbiota.

→ [ABRIR MI CALCULADORA DE MICROBIOTA]
```

---

*Programa Anti-Hinchazón 30 Días — Estructura Calculadora de Microbiota · Edición 2026*
