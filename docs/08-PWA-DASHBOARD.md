# Agent 08 — PWA-DASHBOARD

## Responsabilidad
Dashboard principal de la PWA con resumen del progreso.

## Output
- app/pwa/dashboard/page.tsx

## Contenido
- Saludo personalizado ("Hola, [nombre]" o "Hola")
- Día actual del protocolo (1-7, basado en created_at del usuario)
- Racha: días consecutivos con entrada en el diario
- Score de calidad de sueño (promedio últimos 3 días del diario)
- Accesos rápidos: "Tu noche de hoy", "Registrar sueño", "Ver progreso"
- Si completó las 7 noches: mensaje de felicitación + link a plan de mantenimiento
