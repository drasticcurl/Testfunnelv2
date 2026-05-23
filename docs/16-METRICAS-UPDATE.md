# Agente 16 — Actualización de _METRICAS.md

> Pequeño agente de documentación. Actualiza el doc de métricas/benchmarks con los números concretos de la investigación de mercado.

---

## Goal

Que `docs/_METRICAS.md` deje de ser genérico y tenga **números accionables** para Argentina low-ticket en 2025-2026.

Esto te sirve como norte: cuándo escalar, cuándo matar, qué CPC esperar, etc.

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `docs/_METRICAS.md` | MODIFY (probablemente reescribir secciones) |

---

## Archivos read-only

- `docs/AGENTS.md` — para mantener coherencia con el resto de la doc

---

## Implementation outline

El doc debe tener estas secciones (en este orden):

### 1. Benchmarks de Ads (Argentina, low-ticket)

Tabla con:

| Métrica | Mínimo aceptable | Ideal | Notas |
|---|---|---|---|
| CPM | depende ARS | < AR$ 4.500 | Ugly ads bajan más |
| CPC (link click) | < AR$ 200 | < AR$ 100 | Ugly ads → menor |
| CTR (link) | > 1.5% | > 3% | Hooks fuertes lo elevan |
| ROAS día 1 | > 1.0 | > 1.6 | Si no break-even en 3 días → kill |

(Convertí los precios del curso de R$/USD a ARS al tipo de cambio actual aproximado, o dejá USD si vas a operar en dólares.)

### 2. Benchmarks del Quiz

| Métrica | Mínimo | Ideal |
|---|---|---|
| Click-through landing → quiz | > 40% | > 60% |
| Quiz completion (intro → email) | > 50% | > 70% |
| Email capture → /resultados | > 95% | 99% |
| /resultados → click checkout | > 15% | > 25% |
| Checkout → venta | > 30% | > 50% |

### 3. Benchmarks de venta

- Conversion landing → venta (cold): 1-3%
- AOV objetivo: > USD 14 (con bump)
- ROAS objetivo: 1.8-2.2 sostenido
- CPL (cost per lead): < USD 1.50

### 4. Reglas de decisión (kill / scale)

**Kill** un ad/conjunto si:
- 3 días sin break-even (gastaste más de lo facturado).
- CTR < 1% después de 100 clicks.
- 0 ventas con > USD 30 gastados.

**Scale** un ad si:
- ROAS > 1.6 día 1.
- 3+ ventas con CPA < precio venta.
- Duplicar conjunto con +50% presupuesto, NO el mismo conjunto +200%.

### 5. Presupuestos

- Test inicial: USD 30/día por conjunto, mínimo 3 conjuntos.
- O: 1.5x el precio del producto como presupuesto diario por conjunto.
- 9-15 creativos en el primer test (3 conjuntos × 3-5 creativos).

### 6. Estructura "Sistema Solar"

- **Sol** (campaña central): CBO con presupuesto alto, sólo creativos validados (ROAS > 1.6).
- **Estrellas** (testing): ABO 1-1-1 con USD 10-20/día, creativos nuevos. Si validan → migran al Sol.

### 7. Cuándo cambiar el creativo del Sol

- Cuando el CPM sube 30% sostenidamente (fatigue).
- Cuando el ROAS cae bajo 1.4 después de 7 días.

---

## Acceptance criteria

- [ ] El doc tiene las 7 secciones arriba.
- [ ] Todos los números son específicos (no "alto" o "bajo").
- [ ] Está escrito en español rioplatense (vos, podés, conviene).
- [ ] Hay 1-2 ejemplos numéricos concretos por sección.

---

## Dependencies

Ninguna.

---

## Human inputs needed

- **Decisión:** ¿operás en USD o ARS para los presupuestos? (Hotmart facturará en USD, pero Meta en ARS si la cuenta es argentina.)
- Si elegís ARS, los números del CPC/CPM hay que ajustarlos al tipo de cambio actual.

---

## Notes

- No copiar números literales del curso (era brasileño en BRL). Adaptarlo al contexto argentino.
- Mejor pecar de conservador en los números mínimos: que el equipo se sorprenda hacia arriba, no hacia abajo.
