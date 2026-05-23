# Agente 17 — Playbook de Ads (Apto para Tontos)

> Crea un manual operativo de ads para alguien que NO sabe nada de Meta Ads. Lenguaje plano, sin jerga, con dibujos ASCII si hace falta.

---

## Goal

Tener un doc `docs/PLAYBOOK-ADS.md` que cualquier humano (incluso vos en 3 meses cuando te olvides todo) pueda agarrar y ejecutar la operación de ads del día sin pensar.

**Estilo:** como si le explicaras a tu primo de 22 años que nunca puso un ad. Sin cagarse en la inteligencia, pero sin asumir conocimiento previo.

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `docs/PLAYBOOK-ADS.md` | NEW |

---

## Archivos read-only

- `docs/_METRICAS.md` — para no contradecir números

---

## Implementation outline

### Estructura del doc

#### 1. Qué es esto y para qué sirve
- 1 párrafo: "Si seguís este doc, no tenés que pensar."
- Lista: "Lo que vas a saber al final": cuánto poner, cuándo matar, cuándo escalar.

#### 2. Glosario en una línea (cada término en 1 línea, sin tecnicismos)

```
CPM = lo que pagás cada 1.000 veces que muestran tu ad.
CPC = lo que pagás cada vez que alguien clickea.
CTR = de cada 100 que ven el ad, cuántos clickean.
ROAS = por cada $1 que ponés en ads, cuánto facturás.
CBO = vos le ponés guita a la campaña y Meta reparte solo entre creativos.
ABO = vos repartís la guita manualmente entre los creativos.
AOV = cuánto te gasta en promedio cada comprador (con bumps).
CPA = cuánto te sale conseguir UNA venta.
```

#### 3. ¿Cuánto pongo?

Regla simple:
> **Presupuesto diario por conjunto = 1.5 × precio del producto.**
> Tu producto es $14.90 → ponele **USD 22 por día por conjunto**, mínimo 3 conjuntos.

Si no tenés esa plata: arrancá con USD 10/día por conjunto, pero entendé que el algoritmo de Meta tarda más en aprender.

#### 4. ¿Cuántos ads hago?

> 9 a 15 creativos diferentes. NO variaciones del mismo (cambiar fondo no cuenta). DIFERENTES.

Estructura ideal:
```
Campaña CBO ($60/día)
├─ Conjunto 1
│   ├─ Creativo A (estilo Twitter)
│   ├─ Creativo B (estilo noticia)
│   └─ Creativo C (UGC con voz IA)
├─ Conjunto 2
│   └─ ... (otros 3)
└─ Conjunto 3
    └─ ... (otros 3)
```

#### 5. ¿Cuándo mato un ad?

Regla del semáforo:

🔴 **MATALO** si:
- Después de 3 días sin haber al menos empatado (gastaste igual o más de lo que facturaste).
- 100+ clicks y 0 ventas.

🟡 **ESPERÁ** si:
- 1-2 días, todavía no cerró break-even pero el CPC es bueno (< USD 0.30).

🟢 **DEJALO** si:
- ROAS > 1.0 (al menos no estás perdiendo).
- CTR > 2%.

#### 6. ¿Cuándo escalo un ad?

Regla:
> Si el ROAS está por encima de **1.6** después de 24-48 horas:
> 1. Duplicá el conjunto.
> 2. Subí el presupuesto del nuevo conjunto un **50%** (no más).
> 3. NO toques el original.
> 4. Esperá 24 horas más antes de volver a tocar nada.

**Error común:** subir el presupuesto del conjunto que está funcionando 3x de un día para otro. Meta resetea el aprendizaje y mata las conversiones. Hacelo gradual.

#### 7. Estructura "Sistema Solar"

```
        ┌─────────────────┐
        │   ☀️  EL SOL    │  ← campaña CBO con tu mejor presupuesto
        │   (creativos    │     y SOLO creativos validados (ROAS > 1.6)
        │    validados)   │
        └─────────────────┘
              ↑
              │ los creativos suben al Sol cuando validan
              │
   ┌──────────┼──────────┬──────────┐
   │          │          │          │
  ⭐         ⭐         ⭐         ⭐
ABO 1-1-1  ABO 1-1-1  ABO 1-1-1  ABO 1-1-1
USD 15/día  USD 15/día  USD 15/día USD 15/día
1 creativo  1 creativo  1 creativo 1 creativo
nuevo       nuevo       nuevo      nuevo
```

Las "estrellas" (ABO con 1 conjunto y 1 creativo cada una, USD 10-20/día) son tu lab. Cuando una estrella valida (ROAS > 1.6 en 3 días), su creativo sube al Sol.

#### 8. Los 5 errores que hacen los principiantes

1. **Tirar todo el presupuesto a un solo creativo.** El primer creativo casi nunca es el ganador.
2. **Apagar y prender el ad.** Cada vez que tocás algo, Meta resetea el aprendizaje.
3. **Cerrar el ad porque el día 1 no vendió.** Esperá 3 días mínimo.
4. **Querer escalar de golpe (ej: USD 30 → USD 200).** Subí 50% por vez.
5. **Cambiar la imagen "porque me cansa".** Si convierte, dejala. La que se cansa sos vos, no el público.

#### 9. Tu checklist diario (5 minutos)

Cada día abrís Meta Ads Manager y mirás:

```
[ ] Gasto del día anterior vs ventas (en Hotmart)
    → Si ROAS < 1.0 con USD 30+ gastados, ¿qué conjunto está perdiendo?
[ ] CTR de cada creativo
    → Bajo 1.5%? Candidato a matar.
[ ] CPM general
    → Subió 30%+ esta semana? El público está saturado, rotá creativos.
[ ] ¿Algún ad nuevo del lab (estrella) llegó a ROAS 1.6+?
    → Migralo al Sol.
```

Eso es todo. 5 minutos.

#### 10. Lo que NO mirás (porque te confunde)

- Frecuencia (a menos que sea > 3.0).
- Engagement / likes / comments (vanity metrics).
- Métricas a nivel ad sin pasar 100 clicks (estadísticamente inválido).

---

## Acceptance criteria

- [ ] Mi vieja podría leerlo y entender qué hacer cada día.
- [ ] No usa la palabra "algoritmo" más de 2 veces.
- [ ] Tiene al menos 1 dibujo ASCII (Sistema Solar).
- [ ] Tiene un checklist diario de 5 minutos al final.
- [ ] Glosario en una sola línea por término.
- [ ] Cada regla viene con un número concreto, no "depende".

---

## Dependencies

Ninguna. Idealmente leer primero el `_METRICAS.md` (Agente 16) para coherencia.

---

## Human inputs needed

Ninguno.

---

## Notes

- No tenés que ser exhaustivo. Mejor cubrir el 80% del día a día y dejar fuera los casos raros.
- Si el agente termina con un doc de 50 páginas, fracasó. Apuntá a 5-10 páginas máximo.
