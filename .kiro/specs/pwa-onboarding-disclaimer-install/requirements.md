# Requirements Document: PWA Onboarding — Disclaimer Médico + Instalar App

## Introduction

Esta funcionalidad agrega dos pasos al flujo de onboarding de la PWA (`app/pwa/onboarding/page.tsx`): un paso de **disclaimer médico bloqueante** que exige aceptación explícita mediante checkbox antes de continuar, y un paso **"Instalar App" no bloqueante** que permite instalar la PWA (Android e iOS) reutilizando la lógica existente de `components/pwa/InstallPrompt.tsx`. Estos requirements se derivan del diseño Code-First aprobado y buscan documentar el comportamiento esperado para su implementación.

## Requirements

### Requirement 1: Estructura de pasos dinámica

**User Story:** Como usuaria nueva de la PWA, quiero un flujo de onboarding con pasos claros y bien numerados, para saber cuánto falta y no perderme.

#### Acceptance Criteria

1. WHEN el onboarding se renderiza THEN el sistema SHALL definir la secuencia de pasos de forma declarativa (welcome, disclaimer, dietary, tour, install) en lugar de un `TOTAL_STEPS` hardcodeado.
2. WHEN se muestra cualquier paso THEN el sistema SHALL renderizar un indicador de progreso (dots) con una cantidad igual al total de pasos definidos.
3. WHEN se muestra cualquier paso THEN el sistema SHALL derivar dinámicamente el texto y aria-label de progreso como "Paso {index+1} de {total}", sin valores hardcodeados como "Paso 2 de 3".
4. WHEN cambia el paso actual THEN el sistema SHALL reflejar el estado activo/completado/pendiente en los dots de progreso.
5. WHERE el orden de pasos aplica THE sistema SHALL ubicar el disclaimer antes de las preferencias dietéticas y el paso de instalación como último paso previo al dashboard.

### Requirement 2: Paso de disclaimer médico bloqueante

**User Story:** Como responsable del producto, quiero que la usuaria acepte explícitamente un aviso médico antes de empezar el plan, para dejar constancia del consentimiento y advertir sobre condiciones médicas.

#### Acceptance Criteria

1. WHEN se muestra el paso de disclaimer THEN el sistema SHALL mostrar un texto que advierte que si la usuaria tiene alguna enfermedad o condición médica debe consultar a su médico antes de comenzar el plan.
2. WHEN se muestra el paso de disclaimer THEN el sistema SHALL mostrar un checkbox de aceptación inicialmente desmarcado.
3. WHILE el checkbox de aceptación está desmarcado THE sistema SHALL mantener el botón "Continuar" deshabilitado.
4. WHEN la usuaria marca el checkbox de aceptación THEN el sistema SHALL habilitar el botón "Continuar".
5. WHEN la usuaria desmarca el checkbox después de haberlo marcado THEN el sistema SHALL volver a deshabilitar el botón "Continuar".
6. WHEN la usuaria avanza desde el paso de disclaimer THEN el sistema SHALL persistir el consentimiento en localStorage bajo la key `pwa_medical_disclaimer_accepted`.
7. IF el checkbox no está marcado THEN el sistema SHALL NOT permitir avanzar al siguiente paso.

### Requirement 3: Accesibilidad del disclaimer

**User Story:** Como usuaria que utiliza tecnologías de asistencia, quiero que el paso de disclaimer sea accesible, para poder entender y operar el control de aceptación.

#### Acceptance Criteria

1. WHEN se renderiza el checkbox THEN el sistema SHALL asociar una etiqueta (label) al input y exponer `aria-checked` acorde a su estado.
2. WHEN el botón "Continuar" está deshabilitado THEN el sistema SHALL reflejar el estado mediante `aria-disabled` además del atributo `disabled`.
3. WHEN se muestra el paso de disclaimer THEN el sistema SHALL usar los tokens de diseño existentes (terracotta, warm, charcoal, warm-border, terracotta-soft) de forma consistente con los otros pasos.
4. IF solo uno de los requisitos de accesibilidad del checkbox (asociación de label o `aria-checked`) puede cumplirse THEN el sistema SHALL igualmente renderizar el checkbox operable (cumplimiento parcial permitido; nunca impedir el render).

### Requirement 4: Reutilización de la lógica de instalación

**User Story:** Como desarrollador, quiero que la lógica de instalación viva en un solo lugar, para evitar duplicación entre el banner global y el paso de onboarding.

#### Acceptance Criteria

1. WHEN se implementa el paso de instalación THEN el sistema SHALL exponer la lógica de instalación mediante un hook reutilizable `usePwaInstall()` que devuelva `{ platform, canPrompt, isStandalone, promptInstall }`.
2. WHEN se detecta el entorno THEN el hook SHALL determinar `platform` como 'standalone', 'ios', 'android' o 'unsupported' según `matchMedia('(display-mode: standalone)')`, el userAgent iOS y la captura de `beforeinstallprompt`.
3. WHEN `usePwaInstall` registra el listener `beforeinstallprompt` THEN el sistema SHALL removerlo en el cleanup del efecto.
4. WHEN se refactoriza THEN el componente `InstallPrompt.tsx` SHALL consumir `usePwaInstall()` en lugar de mantener su propia detección duplicada, preservando el banner flotante y la key `pwa-install-dismissed` con ventana de 7 días.
5. WHEN `promptInstall()` se invoca sin un deferredPrompt disponible THEN el sistema SHALL resolver 'unavailable' sin lanzar excepciones.
6. WHEN `promptInstall()` completa un intento nativo THEN el sistema SHALL consumir el deferredPrompt de modo que `canPrompt` pase a false.

### Requirement 5: Paso "Instalar App" no bloqueante

**User Story:** Como usuaria nueva, quiero poder instalar la app durante el onboarding en mi dispositivo (Android o iOS), pero sin quedar bloqueada si no quiero o no puedo instalarla.

#### Acceptance Criteria

1. WHEN se muestra el paso de instalación en Android con soporte nativo (`canPrompt === true`) THEN el sistema SHALL ofrecer un botón que dispara el prompt nativo vía `promptInstall()`.
2. WHEN el prompt nativo resuelve 'accepted' THEN el sistema SHALL avanzar al siguiente paso.
3. WHEN se muestra el paso de instalación en iOS THEN el sistema SHALL mostrar instrucciones manuales (Compartir → Agregar a pantalla de inicio → Agregar).
4. IF la app ya corre en modo standalone THEN el sistema SHALL indicarlo y ofrecer un control para continuar.
5. IF el navegador no soporta `beforeinstallprompt` y no es iOS THEN el sistema SHALL mostrar un paso informativo con opción de continuar/saltar.
6. WHEN se muestra el paso de instalación en cualquier plataforma THEN el sistema SHALL ofrecer siempre un control visible y habilitado para avanzar o saltar (el paso NUNCA bloquea el avance).

### Requirement 6: Finalización del onboarding

**User Story:** Como usuaria, quiero terminar el onboarding y entrar a mi dashboard, para empezar a usar el plan.

#### Acceptance Criteria

1. WHEN la usuaria avanza desde el último paso (instalación) THEN el sistema SHALL llamar `markOnboardingCompleted()` y navegar a `/pwa/dashboard`.
2. WHEN la usuaria avanza desde el paso de preferencias dietéticas THEN el sistema SHALL persistir las preferencias vía `saveDietaryPreferences()` (comportamiento actual preservado).
3. WHEN se completa el onboarding THEN el sistema SHALL garantizar que el consentimiento del disclaimer ya fue aceptado y persistido.
4. WHEN se invoca `resetOnboarding()` (QA/debug) THEN el sistema SHALL limpiar también la key `pwa_medical_disclaimer_accepted`.
