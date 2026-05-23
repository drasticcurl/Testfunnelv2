# DormíBien — Design System

## Filosofía
Mobile-first absoluto. Transmitir CALMA y NOCHE en el quiz/sales, DESCANSO y BIENESTAR en la PWA.

## Paleta: Quiz + Sales Page
| Token | Hex | Uso |
|-------|-----|-----|
| bg-primary | #0F1B2D | Fondo principal oscuro |
| bg-secondary | #162436 | Cards, secciones alternadas |
| accent | #D4A853 | CTAs, highlights, dorado/ámbar |
| accent-hover | #E5BC6A | Hover de CTAs |
| text-primary | #FFFFFF | Texto principal |
| text-secondary | #A3B8CC | Texto secundario |
| gradient-start | #0F1B2D | Degradado azul oscuro |
| gradient-end | #1A1040 | Degradado púrpura oscuro |
| success | #4ADE80 | Barras de progreso positivas |
| warning | #FBBF24 | Alertas, severidad media |
| danger | #EF4444 | Severidad alta |

## Paleta: PWA (Post-compra)
| Token | Hex | Uso |
|-------|-----|-----|
| pwa-bg | #F8F6F2 | Fondo principal cálido |
| pwa-card | #FFFFFF | Cards |
| pwa-accent | #1E3A5F | Azul noche suave, headers |
| pwa-highlight | #9B8EC4 | Lavanda, highlights |
| pwa-text | #1F2937 | Texto principal |
| pwa-text-secondary | #6B7280 | Texto secundario |
| pwa-success | #10B981 | Completado, positivo |
| pwa-border | #E5E7EB | Bordes sutiles |

## Tipografía
- **Headlines:** Serif (Playfair Display o similar via Google Fonts) — elegante, transmite calma
- **Body:** Sans-serif (Inter) — legible, moderno
- **Tamaños:** text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px), text-3xl (30px)

## Bordes y sombras
- border-radius: 12px para cards, 8px para botones, full para pills
- Sombras suaves: shadow-md para cards elevadas
- No sombras duras ni bordes gruesos

## Animaciones (Framer Motion)
- **fadeIn:** opacity 0→1, duration 0.5s
- **slideUp:** y: 20→0, opacity 0→1, duration 0.4s
- **scaleIn:** scale 0.95→1, opacity 0→1, duration 0.3s
- **stagger:** staggerChildren 0.1s para listas
- **NO:** bounces, shakes, rotaciones excesivas

## Espaciado
- Padding de sección: py-8 px-4 (mobile)
- Gap entre elementos: gap-4 (16px) estándar
- Max-width contenido: max-w-md (28rem) para quiz, max-w-lg para sales

## Componentes clave
- **Botón primario:** bg-accent text-dark font-semibold rounded-lg py-3 px-6
- **Card:** bg-card rounded-xl p-6 shadow-md
- **Progress bar:** h-2 rounded-full bg-gray-700, fill con accent
- **Input:** bg-transparent border border-gray-600 rounded-lg py-3 px-4 text-white
