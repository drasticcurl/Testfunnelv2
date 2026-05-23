# Agente 23 — Garantía 30 Días

> Cambia la garantía actual a 30 días en todo el copy + da las instrucciones para actualizar Hotmart. Más fuerte que la garantía estándar de 7-15 días.

---

## Goal

Subir la garantía a 30 días para reducir fricción en el checkout. La idea es que el usuario perciba "ningún riesgo" al comprar.

Esto **NO** es A/B test, es cambio definitivo según decisión del usuario.

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `components/resultados/Garantia.tsx` | MODIFY — bloque principal de garantía |
| `components/resultados/FAQ.tsx` | MODIFY — pregunta sobre devoluciones |
| `components/resultados/PrecioStack.tsx` | MODIFY si menciona garantía |
| `components/resultados/CTAFinal.tsx` | MODIFY si menciona garantía |
| `docs/_PRODUCT-DATA.md` | MODIFY — actualizar período canónico |

---

## Archivos read-only

Ninguno crítico.

---

## Implementation outline

### 1. Detectar referencias a "7 días" y "15 días"

Cuidado: hay DOS conceptos de "días" en el proyecto que NO se deben tocar:

- ✅ Tocar: "Garantía 7 días" / "devolución 15 días" → cambiar a 30 días
- ❌ NO tocar: "Plan de 7 días" (es la duración del plan front, NO la garantía)
- ❌ NO tocar: "30 días" del upsell (programa 30 días — eso ya es 30, perfecto)

**Sugerencia para el agente:** buscar la palabra `garantía` o `garantia` o `devolución` o `reembolso` y revisar cada match.

### 2. Copy nuevo del componente Garantia

Reescribir con énfasis en el período largo:

```
🛡️ Garantía Total 30 Días

Probálo durante 30 días completos.
Si no notás cambios reales en cómo te sentís — pero literalmente
cualquier cosa: menos hinchazón, mejor digestión, menos pesadez —
te devolvemos cada centavo.

Sin preguntas. Sin formularios largos. Sin "demuéstranos que probaste".
Un email a soporte y la plata vuelve.

Asumimos NOSOTROS el riesgo. Vos solo asumís el compromiso de probarlo.
```

### 3. FAQ

Si hay una pregunta como "¿Qué pasa si no me funciona?", la respuesta debe reflejar 30 días.

Si NO existe esa pregunta, agregarla:

```
P: ¿Qué pasa si no me funciona?
R: Tenés 30 días desde tu compra para pedir reembolso. Mandás un email a [contacto]
y te devolvemos el 100% del importe. Sin tener que dar explicaciones ni demostrar
nada. La idea es que pruebes el método sin riesgo.
```

### 4. Actualizar `_PRODUCT-DATA.md`

Sección de "Garantías":

```
## Garantía
- Período: 30 días desde la compra
- Política: 100% del importe, sin preguntas
- Trigger: email a soporte
- Aplica a: front + bump + upsell
```

### 5. Coherencia con Hotmart

Hotmart **debe estar configurado igual**. Si el código dice 30 y Hotmart sigue en 7, el comprador puede llegar al día 20 y pedir reembolso, pero Hotmart se lo rechaza. Eso te hace perder reputación.

---

## Acceptance criteria

- [ ] El componente `Garantia.tsx` muestra "30 días" prominentemente.
- [ ] El FAQ menciona los 30 días.
- [ ] No hay menciones residuales a "7 días de garantía" o "15 días de garantía".
- [ ] Las menciones al "Plan de 7 días" siguen intactas (es la duración del producto, no la garantía).
- [ ] `_PRODUCT-DATA.md` actualizado.
- [ ] Build TypeScript pasa.

---

## Dependencies

Ninguna. Si corre en paralelo con Agente 22 (precio), coordinar commits para evitar merge conflicts en `PrecioStack.tsx` y `CTAFinal.tsx`.

---

## Human inputs needed

### Pasos para configurar 30 días en Hotmart

1. Ingresá a [app.hotmart.com](https://app.hotmart.com).
2. Ir a **Productos** → seleccionar tu producto front.
3. Click en **Editar** → tab **Configuración** o **General** (varía según versión).
4. Buscar el campo **Período de devolución** (`Refund period` / `Período de reembolso`).
5. Cambiarlo a **30 días**.
6. **Guardar**.
7. **Repetir el mismo cambio en el bump y upsell** (cada producto tiene su propio período).
8. Verificar en el checkout que se muestra "30 días de garantía" en el footer.

### Notas operativas

- Hotmart por default ofrece 7, 15 o 30 días. Tenés que elegir 30.
- 30 días puede aumentar levemente la tasa de reembolsos. Datos del curso sugieren que sube de ~3% a ~5%, pero la conversión sube ~10-15%, neto positivo.
- Si en algún momento pensás bajar a 15 días, requiere otro update de código. Mejor dejarlo configurado de una.

### Email de soporte

Confirmar que tenés un email operativo para recibir pedidos de reembolso (ej: `soporte@anti-hinchazon.com`). Si no, NO publicar la nueva garantía hasta tenerlo. La promesa "un email y la plata vuelve" requiere que ese email exista y se conteste rápido.

---

## Notes

- Filosofía: la garantía larga NO se trata de quién pide reembolso, sino de quién duda al comprar. El que duda NO te dice "tengo dudas", simplemente no compra. Una garantía larga reduce esa duda silenciosa.
- Si en datos reales después de 60 días ves que los reembolsos suben a > 8%, evaluar volver a 15 días.
