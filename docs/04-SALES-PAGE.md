# Agent 04 — SALES-PAGE

## Responsabilidad
Sales page embebida como último slide del quiz (ambas versiones).

## Output
- components/quiz/SlideSalesPage.tsx

## Estructura (en orden)
1. Countdown bar (10 min, "75% off por X:XX") — scrollea con la página
2. Resultado personalizado: tipo + badge severidad
3. Explicación (2-3 párrafos según tipo)
4. Consecuencias de no solucionarlo
5. "La solución: Tu Protocolo de Sueño de 7 Noches"
6. Lo que incluye (bullets)
7. Precio: "$713/noche" + tachado $14.990 → $4.990
8. 3 Testimonios burbuja de chat
9. Garantía 30 días
10. FAQ (3 preguntas)
11. CTA final → Hotmart
12. Badges de pago

## Reglas
- Countdown real (10 min desde que se muestra)
- Al llegar a 0: mostrar "Oferta expirada" pero dejar el botón activo
- CTA dispara fbq('track', 'InitiateCheckout') + abre Hotmart URL con UTMs
- Hotmart URL desde env var (fallback a "#" + console.warn)
