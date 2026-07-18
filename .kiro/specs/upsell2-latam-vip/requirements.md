# Requirements Document

## Introduction

Este documento deriva los requisitos del feature **`upsell2-latam-vip`** a partir del diseño ya aprobado (`design.md`). El alcance es **solo LATAM** (Hotmart, USD, español neutro). El feature agrega un **segundo upsell** al embudo LATAM en formato Text Sales Letter (`/upsell2-latam`) que vende un **Acceso VIP de por vida** (US$27, ancla US$97), un **downsell** del mismo producto VIP a precio menor (`/downsell2-latam`, US$17), la **configuración** centralizada de precios/URLs/código VIP, una **sección VIP dentro de la PWA** desbloqueada por un código estático (sin SQL ni autenticación), y la **verificación** de que el webhook de Hotmart captura ambas compras como `latam` en Meta CAPI.

Quedan **fuera de alcance** (no se especifican aquí): el contenido literal del VIP (recetas, PDFs, texto de masterclasses), las páginas `/upsell2` y `/downsell2` para Argentina, el geo-routing, cualquier base de datos o autenticación para el candado, y el pixel nativo de Hotmart (queda desactivado; CAPI es la fuente única).

Cada requisito mantiene trazabilidad con las secciones del diseño (Architecture, Sequence Diagrams, Components and Interfaces, Data Models, Key Functions, Error Handling, Tracking & Deduplicación).

## Glossary

- **Upsell2_Page**: La página `app/upsell2-latam/page.tsx` — Text Sales Letter (TSL, sin video) que ofrece el Acceso VIP de por vida.
- **Upsell2_Offer**: El client component `components/upsell/Upsell2OfferLatam.tsx` que encapsula precio, CTAs y tracking del upsell 2.
- **Downsell2_Page**: La página `app/downsell2-latam/page.tsx` — segunda chance que ofrece el mismo producto VIP a precio menor.
- **Downsell2_Offer**: El client component `components/upsell/Downsell2OfferLatam.tsx` que encapsula precio, CTAs y tracking del downsell 2.
- **VIP_Section**: La página `app/pwa/vip/page.tsx` — sección VIP de la PWA con candado por código.
- **VIP_Access_Lib**: El módulo `lib/pwa/vip-access.ts` con `validateVipCode`, `persistVipUnlocked`, `isVipUnlocked` y `VIP_UNLOCK_STORAGE_KEY`.
- **LATAM_Config**: El módulo `lib/quiz-v2/config-latam.ts` (precios, nombres de producto, URLs de checkout, código VIP).
- **Hotmart_Webhook**: El handler `app/api/hotmart-webhook/route.ts` que procesa `PURCHASE_APPROVED`.
- **Tracking_Endpoint**: El endpoint `POST /api/track` que registra eventos de funnel y normaliza `quiz_version` vía `normalizeQuizVersion`.
- **Funnel_Store**: El almacén de eventos de funnel donde el Tracking_Endpoint persiste el `quizVersion` normalizado.
- **VIP_CODE_LATAM**: El código estático que desbloquea la VIP_Section (default `'VIPLATAM'`).
- **PRICING_LATAM.upsell2**: El precio del Acceso VIP en el upsell 2 (US$27).
- **PRICING_LATAM.downsell2**: El precio del Acceso VIP en el downsell 2 (US$17).
- **LATAM_UPSELL2_CHECKOUT_URL / LATAM_DOWNSELL2_CHECKOUT_URL**: URLs de checkout Hotmart del upsell 2 y del downsell 2.
- **PWA_BASE_URL_LATAM**: URL base de la PWA LATAM, destino final del embudo.
- **VIP_Unlock_Flag**: La clave de `localStorage` `pwa_vip_unlocked_latam`; `'true'` = desbloqueado.

## Requirements

### Requirement 1: Página de upsell 2 (TSL) `/upsell2-latam`

**User Story:** Como comprador que acaba de aprobar el pago del upsell de 30 días, quiero una carta de venta en texto que me ofrezca el Acceso VIP de por vida, para poder decidir si agrego el producto VIP a mi compra.

#### Acceptance Criteria

1. THE Upsell2_Page SHALL render the VIP offer as a text sales letter that contains no embedded video.
2. THE Upsell2_Page SHALL expose robots metadata with index set to false and follow set to false.
3. THE Upsell2_Page SHALL present the VIP product at the PRICING_LATAM.upsell2 price (US$27) together with the anchor price (US$97).
4. WHEN a user activates the primary "SÍ" CTA of the Upsell2_Page AND window.fbq is available, THE Upsell2_Offer SHALL emit exactly one InitiateCheckout event with value equal to PRICING_LATAM.upsell2.amount and currency equal to 'USD'.
5. WHEN a user activates the primary "SÍ" CTA of the Upsell2_Page, THE Upsell2_Offer SHALL send a POST request to the Tracking_Endpoint that includes quiz_version 'latam', which the Tracking_Endpoint normalizes to 'latam' in the Funnel_Store.
6. WHEN a user activates the primary "SÍ" CTA of the Upsell2_Page AND LATAM_UPSELL2_CHECKOUT_URL is non-empty, THE Upsell2_Offer SHALL redirect the browser to withHotmartCheckout(LATAM_UPSELL2_CHECKOUT_URL, { src: 'upsell2_latam' }).
7. WHEN a user activates the "No gracias" control of the Upsell2_Page, THE Upsell2_Offer SHALL redirect the browser to /downsell2-latam.
8. IF LATAM_UPSELL2_CHECKOUT_URL is empty WHEN the primary "SÍ" CTA is activated, THEN THE Upsell2_Offer SHALL keep the browser on the current page and SHALL log a warning.
9. IF the POST request to the Tracking_Endpoint fails, THEN THE Upsell2_Offer SHALL still complete the redirect to the checkout.

### Requirement 2: Página de downsell 2 `/downsell2-latam`

**User Story:** Como comprador que rechazó el upsell del VIP, quiero una segunda oferta del mismo producto VIP a un precio menor, para tener una última oportunidad de adquirirlo.

#### Acceptance Criteria

1. THE Downsell2_Page SHALL offer the same VIP product as the Upsell2_Page at the PRICING_LATAM.downsell2 price (US$17).
2. THE Downsell2_Page SHALL expose robots metadata with index set to false and follow set to false.
3. WHEN a user activates the primary "SÍ" CTA of the Downsell2_Page AND window.fbq is available, THE Downsell2_Offer SHALL emit exactly one InitiateCheckout event with value equal to PRICING_LATAM.downsell2.amount and currency equal to 'USD'.
4. WHEN a user activates the primary "SÍ" CTA of the Downsell2_Page, THE Downsell2_Offer SHALL send a POST request to the Tracking_Endpoint that includes quiz_version 'latam', which the Tracking_Endpoint normalizes to 'latam' in the Funnel_Store.
5. WHEN a user activates the primary "SÍ" CTA of the Downsell2_Page AND LATAM_DOWNSELL2_CHECKOUT_URL is non-empty, THE Downsell2_Offer SHALL redirect the browser to withHotmartCheckout(LATAM_DOWNSELL2_CHECKOUT_URL, { src: 'downsell2_latam' }).
6. WHEN a user activates the "No gracias" control of the Downsell2_Page, THE Downsell2_Offer SHALL redirect the browser to PWA_BASE_URL_LATAM.
7. IF LATAM_DOWNSELL2_CHECKOUT_URL is empty WHEN the primary "SÍ" CTA is activated, THEN THE Downsell2_Offer SHALL keep the browser on the current page and SHALL display a "config pendiente" notice.

### Requirement 3: Configuración de precios, URLs y código VIP

**User Story:** Como desarrollador, quiero la configuración centralizada de precios, nombre de producto, URLs de checkout y código VIP, para mantener consistencia y reglas de validación en un solo lugar.

#### Acceptance Criteria

1. THE LATAM_Config SHALL define PRICING_LATAM.upsell2 with amount 27.00 and PRICING_LATAM.downsell2 with amount 17.00.
2. THE LATAM_Config SHALL define UPSELL2_PRODUCT_NAME_LATAM, LATAM_UPSELL2_CHECKOUT_URL, and LATAM_DOWNSELL2_CHECKOUT_URL.
3. WHERE the environment variable for VIP_CODE_LATAM is unset, THE LATAM_Config SHALL provide the default value 'VIPLATAM'.
4. THE LATAM_Config SHALL maintain PRICING_LATAM.upsell2.amount strictly greater than PRICING_LATAM.upsell.amount.
5. THE LATAM_Config SHALL maintain PRICING_LATAM.downsell2.amount strictly less than PRICING_LATAM.upsell2.amount.
6. WHERE a checkout URL environment variable is empty, THE LATAM_Config SHALL expose an empty string so the offer components display a pending-config fallback instead of navigating.

### Requirement 4: Sección VIP en la PWA con candado por código

**User Story:** Como comprador VIP, quiero desbloquear la sección VIP con el código que recibí por email, para acceder a los módulos VIP sin necesidad de crear una cuenta.

#### Acceptance Criteria

1. WHEN the VIP_Section mounts AND the VIP_Unlock_Flag equals exactly 'true', THE VIP_Section SHALL render the VIP modules without prompting for a code.
2. WHILE the VIP_Section is in the locked state, THE VIP_Section SHALL display a code input field and a submit control.
3. WHEN a user submits a code that, after trimming and case-insensitive comparison, equals VIP_CODE_LATAM, THE VIP_Access_Lib SHALL return true, AND THE VIP_Section SHALL persist the VIP_Unlock_Flag and render the VIP modules.
4. IF a user submits a code that, after trimming and case-insensitive comparison, does not equal VIP_CODE_LATAM, THEN THE VIP_Access_Lib SHALL return false AND THE VIP_Section SHALL remain locked and display the error message "Código inválido. Revisá el email de tu compra VIP.".
5. THE VIP_Access_Lib SHALL validate submitted codes locally against LATAM_Config without performing any network call or database query.
6. THE VIP_Access_Lib SHALL report the section as unlocked if and only if the VIP_Unlock_Flag equals exactly 'true'.
7. WHEN persistVipUnlocked is invoked one or more times in sequence, THE VIP_Access_Lib SHALL leave the VIP_Unlock_Flag in the same state as a single invocation (value 'true').
8. THE VIP_Section SHALL render the nine VIP modules (B.1 through B.9) as placeholders following the PWA design system.
9. THE VIP_Section SHALL operate without authentication and SHALL persist unlock state only in localStorage on the device.
10. THE VIP_Section SHALL be unlocked by the same VIP_CODE_LATAM whether the purchase originated from the upsell 2 (US$27) or the downsell 2 (US$17), since both sell the same VIP product.
11. IF localStorage is unavailable when reading or writing the VIP_Unlock_Flag, THEN THE VIP_Access_Lib SHALL report the section as locked and SHALL complete persistVipUnlocked without throwing.

### Requirement 5: Captura de la compra VIP en el webhook de Hotmart (Meta CAPI)

**User Story:** Como operador de marketing, quiero que las compras del VIP (upsell 2 y downsell 2) se reporten a Meta CAPI como `latam`, para atribuir correctamente las conversiones del embudo LATAM.

#### Acceptance Criteria

1. WHEN a PURCHASE_APPROVED event for the VIP product is received (upsell 2 at US$27 or downsell 2 at US$17), THE Hotmart_Webhook SHALL emit a Purchase event to Meta CAPI with value and currency taken from the payload (USD).
2. WHERE a VIP purchase payload includes fbc and/or fbp, THE Hotmart_Webhook SHALL include those values in the Purchase event sent to Meta CAPI.
3. WHEN a VIP purchase event is processed, THE Hotmart_Webhook SHALL record the purchase idempotently keyed by hotmart_transaction.
4. THE Hotmart_Webhook SHALL process VIP purchases through the same code path without filtering by product, so both the upsell 2 and the downsell 2 are captured.
5. THE Hotmart_Webhook SHALL act as the single source of Purchase events to Meta CAPI while the Hotmart native pixel remains deactivated.

### Requirement 6: Entrega del código VIP por email nativo de Hotmart

**User Story:** Como comprador VIP, quiero recibir el código VIP por email después de la compra, para poder desbloquear la sección VIP en la PWA.

#### Acceptance Criteria

1. THE VIP code and the link to /pwa/vip SHALL be delivered through the Hotmart native post-purchase confirmation email, configured manually in the Hotmart panel, rather than through the application backend.
2. WHERE a purchase originates from the upsell 2 or from the downsell 2, THE delivered VIP code SHALL be the same VIP_CODE_LATAM and SHALL link to the same VIP_Section.
