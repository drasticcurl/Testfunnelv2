# Agent 00 — SETUP

## Responsabilidad
Crear la estructura base del proyecto: configuración, tipos globales, esquema de DB.

## Output
- package.json (dependencies + scripts)
- tsconfig.json
- tailwind.config.ts (tokens del design system)
- postcss.config.mjs
- next.config.mjs (PWA headers)
- app/layout.tsx (root layout con fonts)
- app/globals.css (Tailwind + custom properties)
- lib/types.ts (tipos compartidos)
- lib/supabase.ts (client de Supabase)
- supabase/schema.sql (tablas: sleep_leads, sleep_users, sleep_diary)
- .env.example

## Decisiones
- Next.js 14+ App Router
- TypeScript strict mode
- Tailwind con custom colors del design system
- Google Fonts: Playfair Display (serif) + Inter (sans)
- Zustand, Framer Motion, @supabase/supabase-js como deps
