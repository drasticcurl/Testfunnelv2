# DormíBien — Overview

## Qué es
PWA interactiva que guía al usuario noche a noche para resolver su insomnio mediante un protocolo de 7 noches personalizado.

## Flujo completo
1. Usuario llega vía Google Ads → /quiz (corto, 10-12 slides) o Facebook Ads → /quiz-v2 (largo, 18-22 slides)
2. Quiz determina perfil de insomnio (4 tipos) + severidad
3. Sales page embebida como último slide del quiz (NO redirige)
4. Compra en Hotmart → webhook crea acceso en Supabase
5. Usuario accede a la PWA con su email → protocolo de 7 noches personalizado

## Producto
- **Nombre:** DormíBien
- **Precio front-end:** $4.990 ARS (presentado como "$713/noche")
- **Precio tachado:** $14.990 ARS
- **Upsell (Hotmart, no en nuestro código):** $9.990 ARS

## 4 Perfiles de Insomnio
| # | Nombre | Descripción |
|---|--------|-------------|
| 1 | El Mente Acelerada | No puede dormirse, la cabeza no para |
| 2 | El Despertador | Se duerme pero se despierta a las 2-4am |
| 3 | El Zombi | Duerme las horas pero se levanta destruido |
| 4 | El Irregular | Sin horario, ritmo circadiano roto |

## Target
Hombres y mujeres 25-55 que duermen mal (Argentina)

## Stack
- Next.js 14+ App Router, TypeScript, Tailwind CSS
- Framer Motion, Zustand
- Supabase (DB), Hotmart (checkout), Vercel (deploy)
- PWA: manifest.json + service worker + installable
