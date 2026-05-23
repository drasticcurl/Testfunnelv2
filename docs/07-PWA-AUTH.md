# Agent 07 — PWA-AUTH

## Responsabilidad
Sistema de login por email (sin contraseña), verificación contra Supabase.

## Output
- app/pwa/login/page.tsx — formulario de email
- app/api/pwa/auth/login/route.ts — verifica email en sleep_users, setea cookie
- app/api/pwa/auth/logout/route.ts — borra cookie
- app/api/pwa/me/route.ts — retorna datos del usuario logueado

## Flujo
1. Usuario pone email en /pwa/login
2. POST /api/pwa/auth/login con email
3. API busca email en sleep_users
4. Si existe → setea cookie HttpOnly "dormibien_session" con email
5. Redirige a /pwa/dashboard
6. Si no existe → muestra error "No encontramos una compra con ese email"
