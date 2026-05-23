# Agent 10 — PWA-DIARIO

## Responsabilidad
Diario de sueño: registro diario + historial + visualización.

## Output
- app/pwa/diario/page.tsx — historial de entradas
- app/pwa/diario/nuevo/page.tsx — formulario de nueva entrada
- app/api/pwa/diary/route.ts — CRUD de entradas

## Campos del formulario
- Fecha (default: hoy)
- Hora de acostarse (time picker)
- Hora de dormirse (time picker)
- Despertares nocturnos (0-5+)
- Calidad al despertar (1-10, slider)
- Energía al día siguiente (1-10, slider)
- Notas (textarea opcional)

## Historial
- Lista de últimos 7 días
- Cada entrada muestra: fecha, calidad, energía, ícono de tendencia
