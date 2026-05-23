# PLAYBOOK-ADS.md — Manual de operaciones de ads

> Si seguís este doc, no tenés que pensar.
> Cada día abrís Meta, mirás 4 cosas, tomás 3 decisiones, cerrás. 5 minutos.

---

## 1. Para qué sirve esto

Cuando termines de leer vas a saber **cuatro cosas**:

1. **Cuánta plata** poner cada día.
2. **Cuándo matar** un ad que no funciona.
3. **Cuándo escalar** (poner más plata) un ad que sí funciona.
4. **Qué mirar** cada mañana en 5 minutos.

Nada más. Si querés saber más, hay otros docs. Este es el de la guardia diaria.

**Producto:** USD 14.90 con bumps y upsells (AOV objetivo USD 25).
**Plataforma:** Meta Ads (Facebook + Instagram).
**Mercados:** Argentina + LATAM.

---

## 2. Glosario en una línea

```
CPM   = lo que pagás cada 1.000 veces que se muestra tu ad.
CPC   = lo que pagás cada vez que alguien clickea.
CTR   = de cada 100 que ven el ad, cuántos clickean.
CPA   = cuánto te sale conseguir UNA venta.
ROAS  = por cada USD 1 que ponés en ads, cuánto facturás.
AOV   = cuánto te gasta en promedio cada comprador (con bumps incluidos).
CBO   = vos le ponés guita a la campaña y Meta reparte solo entre conjuntos.
ABO   = vos repartís la guita a mano entre conjuntos.
HOOK  = el primer segundo del video, donde se decide si te miran o se van.
LEAD  = persona que arrancó el quiz (todavía no compró).
```

Si te cruzás con otra sigla y no está acá, ignorala. No es importante todavía.

---

## 3. Cuánto poner (presupuesto diario)

**Regla del 1.5×:**

> Presupuesto diario por conjunto = **1.5 × precio del producto.**
> Producto = USD 14.90 → poné **USD 22 por día por conjunto.**
> Tené **mínimo 3 conjuntos** corriendo en paralelo.

Plan base:

```
Total mínimo recomendado:  USD 66/día  (3 conjuntos × USD 22)
Total cómodo:              USD 90/día  (3 conjuntos × USD 30)
```

Si no tenés esa plata, arrancá con **USD 10/día por conjunto**, pero entendé que Meta tarda más en aprender y los primeros días van a parecer un desastre. Es normal.

**No bajes de USD 10/día por conjunto.** Por debajo de eso, Meta no junta data suficiente y nunca sabés si el ad sirve o no.

---

## 4. Cuántos creativos hacer

**Regla del 9:**

> Tené entre **9 y 15 creativos diferentes** corriendo.
> "Diferentes" = ángulos distintos, no el mismo video con otro fondo.

Tres ángulos típicos:

```
A) Estilo Twitter / captura de chat
B) Estilo noticia / titular
C) UGC (alguien hablando a cámara, real o IA)
```

Hacé al menos 3 de cada estilo = 9 creativos. Si podés hacer 15, mejor.

**Por qué tantos:** el primer creativo casi nunca es el ganador. Necesitás material para descartar.

---

## 5. Estructura de campaña (el "Sistema Solar")

Pensá tu cuenta de ads como un sistema solar:

- **El Sol** = tu campaña principal (CBO). Acá viven los creativos que ya **ganaron** (ROAS sostenido > 2.0).
- **Las Estrellas** = tu laboratorio. Cada estrella es un conjunto ABO con UN solo creativo nuevo. Sirven para probar.
- **Los planetas** que orbitan = los creativos del Sol, cada uno con su brillo (ROAS).

```
                ┌─────────────────────────┐
                │      ☀  EL SOL          │
                │   Campaña CBO            │
                │   USD 60/día             │
                │   Solo creativos con     │
                │   ROAS > 2.0 sostenido   │
                └─────────────────────────┘
                          ↑
                          │ los que validan
                          │ suben al Sol
                          │
       ┌──────────┬───────┴───────┬──────────┐
       │          │               │          │
       ⭐         ⭐              ⭐         ⭐
   Estrella 1  Estrella 2     Estrella 3  Estrella 4
   ABO          ABO             ABO        ABO
   USD 15/día   USD 15/día      USD 15/día USD 15/día
   1 creativo   1 creativo      1 creativo 1 creativo
   nuevo        nuevo           nuevo      nuevo
       │          │               │          │
       └──── si ROAS > 2.0 en 3 días, sube al Sol ────┘
       └──── si ROAS < 1.0 en 3 días, se apaga ───────┘
```

**Cómo se usa en la práctica:**

1. Cada semana lanzás 2-3 estrellas nuevas (creativos nuevos).
2. A los 3 días mirás: ¿ganó? ¿perdió? ¿está en el medio?
3. Los ganadores los copiás al Sol.
4. Los perdedores los apagás.
5. El Sol nunca lo tocás salvo para escalarlo de a poco.

---

## 6. Cuándo matar un ad (semáforo)

**🔴 MATALO** si pasa cualquiera de estas:

- Día 3 con **ROAS menor a 1.0** (estás perdiendo plata).
- **100 clicks o más** y **0 ventas**.
- **CTR menor a 1.5%** después de gastar USD 30+.

**🟡 ESPERÁ** si:

- Llevás solo 1 o 2 días corriendo (todavía no es estadísticamente válido).
- ROAS está entre **1.0 y 2.0** (no estás perdiendo, pero no es para escalar).
- CPC sigue bajo (menor a USD 0.30) aunque todavía no haya ventas.

**🟢 DEJALO TRANQUILO** si:

- ROAS entre **1.5 y 2.0** (zona de mantener).
- CTR mayor a 2.5%.
- CPA por debajo de USD 12.

**Importante:** el ROAS se mide a **3 días mínimo**. No mates nada el día 1.

---

## 7. Cuándo escalar un ad

**Regla del +30%:**

> Si un creativo (en una estrella o en el Sol) tiene **ROAS sostenido mayor a 2.0** durante 48 horas:
>
> 1. **Duplicá** el conjunto (no edites el original).
> 2. Al duplicado subile el presupuesto **+30%**.
> 3. **No toques** el conjunto original.
> 4. Esperá **48 horas** antes de volver a tocar nada.

**Por qué +30% y no más:** Meta usa una fase de aprendizaje para cada conjunto. Si le cambiás el presupuesto de golpe (ej: USD 30 → USD 100), reinicia el aprendizaje y mata las conversiones por varios días.

**Cadencia segura para escalar:**

```
Día 0:   USD 22/día
Día 2:   USD 28/día   (+30%)
Día 4:   USD 36/día   (+30%)
Día 6:   USD 47/día   (+30%)
Día 8:   USD 61/día   (+30%)
```

Eso es escalar **bien**. Lento, pero sin romper nada.

---

## 8. Los 5 errores típicos

1. **Tirar todo el presupuesto a un solo creativo.** El primero casi nunca gana. Necesitás 9+ para tener uno bueno.
2. **Apagar y prender el ad.** Cada vez que tocás algo, Meta reinicia el aprendizaje y arrancás de cero.
3. **Cerrar el ad porque el día 1 no vendió.** Esperá 3 días siempre. La data del día 1 no sirve.
4. **Escalar de golpe.** USD 30 → USD 200 = muerte. Subí +30% cada 48 horas.
5. **Cambiar el ad porque "te cansa".** Si convierte, dejalo. La que se cansa sos vos, no el público nuevo que recién lo ve.

---

## 9. Lo que NO mirás

Estas métricas confunden y no te ayudan a tomar decisiones:

- **Likes, comentarios, shares.** Vanity. Plata no entra por ahí.
- **Frecuencia.** Solo importa si pasa de 3.0 (ahí sí, rotá creativos).
- **Métricas de un ad con menos de 100 clicks.** Estadísticamente no significa nada.
- **ROI a 30 días** en la primera semana. Todavía no tenés data suficiente.

---

## 10. Checklist diario (5 minutos)

Cada mañana, abrís Meta Ads Manager y mirás esto en orden:

```
[ ] 1. ¿Cuánto gasté ayer y cuánto facturé en Hotmart?
       → ROAS = facturado / gastado.
       → Si ROAS < 1.0 con USD 30+ gastados, identificá qué conjunto pierde.

[ ] 2. ¿CTR de cada creativo?
       → Menor a 1.5% con USD 30+ gastados → candidato a matar (🔴).

[ ] 3. ¿CPM general subió mucho esta semana?
       → +30% en 7 días = el público está saturado.
       → Lanzá creativos nuevos (estrellas nuevas).

[ ] 4. ¿Alguna estrella llegó a ROAS > 2.0 sostenido 48hs?
       → Subila al Sol (duplicar conjunto + 30% más de plata).

[ ] 5. ¿Hay algún ad que ya está en 🔴 (3 días, ROAS < 1.0)?
       → Matalo. Sin culpa.
```

Cinco puntos. Cinco minutos. Cerrá el navegador y andá a hacer otra cosa.

---

## 11. Resumen ultra-corto (la chuleta)

```
Presupuesto:    USD 22/día por conjunto, mínimo 3 conjuntos.
Creativos:      9 a 15 diferentes.
Estructura:     Sol (CBO con ganadores) + Estrellas (ABO probando).
Matar:          ROAS < 1.0 al día 3, o 100 clicks sin ventas.
Mantener:       ROAS entre 1.0 y 2.0.
Escalar:        ROAS > 2.0 → duplicar conjunto y +30% cada 48hs.
Mirar:          ROAS, CTR, CPM, estrellas que validan, ads en rojo.
Tiempo:         5 minutos por día.
```

Eso. Pegate esta tablita en la heladera y listo.
