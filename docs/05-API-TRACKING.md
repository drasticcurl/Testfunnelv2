# Agent 05 — API-TRACKING

## Responsabilidad
APIs server-side, tracking client-side (Meta Pixel), UTM capture.

## Output
- app/api/track/route.ts — evento server-side genérico
- app/api/submit-quiz/route.ts — guarda lead en Supabase
- app/api/hotmart-webhook/route.ts — recibe postback de venta
- lib/tracking.ts — helpers de Meta Pixel + UTM
- components/MetaPixel.tsx — script del pixel

## Eventos
- QuizStart: al iniciar el quiz
- QuizComplete: al terminar (antes de sales page)
- ViewContent: al mostrar la sales page
- InitiateCheckout: al clickear CTA de compra

## UTM capture
- Al cargar /quiz o /quiz-v2, guardar UTMs en localStorage
- Keys: utm_source, utm_medium, utm_campaign, utm_content, utm_term
- Pasar a Hotmart checkout URL como query params
- Enviar en submit-quiz para guardar en sleep_leads

## Webhook Hotmart
- POST /api/hotmart-webhook
- Verifica token (env var)
- Extrae email del buyer
- Crea registro en sleep_users
