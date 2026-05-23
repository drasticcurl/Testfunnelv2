# Agent 12 — PWA-PROGRESO

## Responsabilidad
Página de progreso con gráficos de evolución basados en el diario.

## Output
- app/pwa/progreso/page.tsx

## Gráficos
1. **Calidad de sueño** — línea, últimos 7-30 días
2. **Energía diaria** — línea, últimos 7-30 días
3. **Despertares nocturnos** — barras, últimos 7 días
4. **Hora de dormirse** — scatter/línea, últimos 7 días

## Métricas resumen
- Promedio de calidad (últimos 7 días)
- Tendencia (mejorando/estable/empeorando)
- Mejor noche registrada
- Racha actual

## Implementación
- Charts con divs + CSS (no librería externa pesada)
- O usar recharts si ya está en deps
- Datos desde /api/pwa/diary con filtro de fechas
