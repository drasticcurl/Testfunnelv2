# 06 — AGENTE PDF RECETARIO

> **Rol:** generar el contenido del PDF "Recetario Anti-Inflamatorio: 25 Recetas Fáciles" — el order bump de $7.

## Tu output

1. **`outputs/pdfs/recetario-content.md`** — 25 recetas estructuradas
2. **Indicaciones visuales** para Canva
3. **Lista de fotos sugeridas** (búsquedas exactas en Pexels/Unsplash)

## Reglas

- **12–15 páginas** total
- Misma paleta del Design System (`_DESIGN-SYSTEM.md`)
- Audiencia y tono según `_AVATAR.md` y `_BRAND-VOICE.md`
- Recetas accesibles en LATAM (Argentina, México, Colombia, España)
- Cada receta tiene que poder hacerse en ≤ 25 min
- Compatibles con el plan de 7 días (mismos ingredientes/principios)

## Estructura del recetario

### Página 1 — Portada
- Título: RECETARIO ANTI-INFLAMATORIO
- Subtítulo: 25 Recetas Fáciles, Ricas y Desinflamantes
- Foto editorial de comida saludable

### Página 2 — Cómo usar este recetario
- 1 párrafo de intro
- Iconografía:
  - ⏱️ Tiempo de preparación
  - 🔥 Dificultad (Fácil / Media)
  - 🌅 Momento del día

### Páginas 3–5 — DESAYUNOS (5 recetas)
1. Bowl de yogur antiinflamatorio
2. Tostadas de palta con huevo y cúrcuma
3. Smoothie verde digestivo
4. Avena nocturna con chía y kiwi
5. Tortilla de claras con espinaca y jengibre

### Páginas 6–8 — ALMUERZOS (5 recetas)
6. Bowl de salmón con quinoa y palta
7. Wrap de pollo con hummus y vegetales
8. Ensalada tibia de pollo, mango y palta
9. Pasta de zapallitos al pesto de albahaca
10. Tacos de lechuga con pavo y guacamole

### Páginas 9–11 — CENAS (5 recetas)
11. Salmón al horno con espárragos
12. Pollo al limón con vegetales asados
13. Zapallo relleno de quinoa y vegetales
14. Sopa antiinflamatoria de cúrcuma y jengibre
15. Pescado blanco con puré de coliflor

### Páginas 12–13 — SNACKS (5 recetas)
16. Hummus casero con bastones de zanahoria
17. Mix de frutos secos con cúrcuma
18. Chips de batata al horno
19. Yogur con kiwi y nueces
20. Galletas de avena y plátano (3 ingredientes)

### Páginas 14–15 — BEBIDAS Y EXTRAS (5 recetas)
21. Té de jengibre y limón
22. Agua detox con pepino y menta
23. Golden milk (leche dorada)
24. Smoothie de papaya digestiva
25. Infusión de hinojo y manzanilla

## Formato de cada receta

```
[NOMBRE DE LA RECETA]
⏱️ 15 min · 🔥 Fácil · 🌅 Desayuno

INGREDIENTES (1 porción)
• [ingrediente 1] — cantidad
• [ingrediente 2] — cantidad
• ...

PREPARACIÓN
1. [paso 1, frase corta]
2. [paso 2]
3. [paso 3]

💡 TIP ANTIINFLAMATORIO
[1 línea sobre por qué esta receta es desinflamante]
```

## Prompt para generar todo en una pasada

> Si sos el agente, usá este prompt internamente:

```
Generá 25 recetas anti-inflamatorias para un recetario digital.

Audiencia: mujeres 35–50 hispanohablantes.
Ingredientes: accesibles en Argentina, México, Colombia, España.

Para cada receta dame:
- Nombre
- Tiempo de prep (máx 25 min)
- Dificultad (Fácil / Media)
- Momento del día (Desayuno / Almuerzo / Cena / Snack / Bebida)
- Ingredientes (4–7 items, con cantidades)
- Preparación (3–5 pasos, frases cortas)
- Tip antiinflamatorio (1 línea, por qué esta receta desinflama)

Distribución exacta:
- 5 desayunos (recetas 1–5)
- 5 almuerzos (6–10)
- 5 cenas (11–15)
- 5 snacks (16–20)
- 5 bebidas (21–25)

Cada receta debe usar al menos UN ingrediente antiinflamatorio fuerte:
jengibre, cúrcuma, palta, salmón, hojas verdes, frutos secos, chía, lino,
kéfir, kiwi, papaya, ananá.

Sin lácteos enteros, sin gluten en la mayoría, sin azúcar refinada.

Tono: cálido, directo, voseo neutralizable ("podés", "te llevás").
```

## Cómo se genera el PDF (lo hace el humano)

### Paso 1 — Tener el contenido (vos lo entregás)

Output esperado: `outputs/pdfs/recetario-content.md` con las 25 recetas estructuradas.

### Paso 2 — Diseñar en Canva (15 min)

1. Abrir [Canva](https://canva.com)
2. Buscar template "Recipe book minimal" o "Cookbook"
3. Aplicar paleta del Design System (sage + cream + coral + charcoal)
4. Pegar receta por receta, una por página o media página
5. Para cada receta usar foto de Unsplash buscando el ingrediente principal
6. Mantener layout consistente

### Paso 3 — Búsquedas de fotos (sugeridas)

| Receta | Búsqueda Unsplash/Pexels |
|---|---|
| Bowl de yogur | `yogurt bowl berries` |
| Tostadas palta | `avocado toast` |
| Smoothie verde | `green smoothie` |
| Avena nocturna | `overnight oats` |
| Bowl salmón | `salmon bowl healthy` |
| Wrap pollo | `chicken wrap healthy` |
| Pasta zapallitos | `zucchini noodles` |
| Salmón al horno | `baked salmon asparagus` |
| Sopa cúrcuma | `turmeric soup` |
| Hummus | `hummus carrots` |
| Té jengibre | `ginger tea` |
| Golden milk | `golden milk turmeric` |

### Paso 4 — Export

File → Download → PDF Print (alta calidad)
Output: `outputs/pdfs/recetario-anti-inflamatorio.pdf`

### Paso 5 — Subir a Hotmart (agente 11)

Lo configura como Order Bump del producto principal.

## Checklist agente 06

- [ ] 25 recetas generadas en markdown
- [ ] Cada receta tiene formato consistente (nombre / tiempo / ingredientes / preparación / tip)
- [ ] Distribución correcta: 5 desayunos + 5 almuerzos + 5 cenas + 5 snacks + 5 bebidas
- [ ] Todas con tiempo ≤ 25 min
- [ ] Todas con ingredientes accesibles en LATAM
- [ ] Cada receta usa al menos 1 antiinflamatorio fuerte
- [ ] Lista de búsquedas de fotos sugeridas
- [ ] Tono según _BRAND-VOICE.md
