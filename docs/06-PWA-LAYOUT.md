# Agent 06 — PWA-LAYOUT

## Responsabilidad
Layout de la PWA, navegación, service worker, manifest, middleware de auth.

## Output
- app/pwa/layout.tsx — layout con bottom nav + header
- components/pwa/BottomNav.tsx — navegación inferior
- components/pwa/PwaHeader.tsx — header con logo/título
- public/manifest.json — PWA manifest
- public/sw.js — service worker básico
- middleware.ts — protege /pwa/* (redirige a /pwa/login si no auth)

## Navegación bottom
5 items:
1. Inicio (dashboard)
2. Plan (noche a noche)
3. Diario
4. Guías
5. Progreso

## Middleware
- Chequea cookie "dormibien_session"
- Si no existe y ruta es /pwa/* (excepto /pwa/login), redirige a /pwa/login
- Cookie contiene email del usuario
