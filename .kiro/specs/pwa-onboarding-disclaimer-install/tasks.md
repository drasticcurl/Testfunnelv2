# Implementation Plan: PWA Onboarding — Disclaimer Médico + Instalar App

- [x] 1. Ampliar el estado de onboarding con el consentimiento del disclaimer
  - En `lib/pwa/onboarding-state.ts` agregar la key `MEDICAL_DISCLAIMER_KEY = 'pwa_medical_disclaimer_accepted'`.
  - Implementar `markMedicalDisclaimerAccepted()` e `isMedicalDisclaimerAccepted()` con el mismo patrón defensivo (guardas `typeof window`, try/catch) que las funciones existentes.
  - Actualizar `resetOnboarding()` para que también elimine la key del disclaimer.
  - _Requirements: 2.6, 6.3, 6.4_

- [x] 2. Extraer la lógica de instalación a un hook reutilizable `usePwaInstall`
- [x] 2.1 Crear el hook `lib/pwa/use-pwa-install.ts`
  - Definir `BeforeInstallPromptEvent`, `InstallPlatform` y `PwaInstallState` según el diseño.
  - Implementar la detección en `useEffect` (deps `[]`): standalone vía `matchMedia`, iOS vía userAgent, captura de `beforeinstallprompt` para Android; setear `platform`, `canPrompt`, `isStandalone`.
  - Remover el listener `beforeinstallprompt` en el cleanup del efecto.
  - Implementar `promptInstall()` que resuelva `'accepted' | 'dismissed' | 'unavailable'`, sin lanzar, consumiendo el deferredPrompt tras un intento.
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [x] 2.2 Refactorizar `components/pwa/InstallPrompt.tsx` para consumir el hook
  - Reemplazar el `useEffect`/estado de detección propio por `usePwaInstall()`.
  - Preservar el banner flotante, el modal de instrucciones iOS y la key `pwa-install-dismissed` con ventana de 7 días.
  - Verificar que no quede lógica de detección duplicada fuera del hook.
  - _Requirements: 4.4, 5.3_

- [x] 3. Refactorizar `app/pwa/onboarding/page.tsx` a una secuencia de pasos declarativa
- [x] 3.1 Introducir la config declarativa de pasos
  - Definir `OnboardingStep` y `ONBOARDING_STEPS` (welcome, disclaimer, dietary, tour, install) con su flag `blocking`.
  - Derivar `TOTAL_STEPS` de `ONBOARDING_STEPS.length` y renderizar los progress dots a partir de ese total.
  - Reemplazar los textos hardcodeados "Paso 2 de 3" / "Paso 3 de 3" por `Paso ${step+1} de ${total}` (incluyendo el aria-label).
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.2 Actualizar `nextStep()` para los efectos de salida por paso
  - Al salir del paso `disclaimer` invocar `markMedicalDisclaimerAccepted()`.
  - Preservar `saveDietaryPreferences()` al salir de `dietary`.
  - Al salir del último paso (`install`) invocar `markOnboardingCompleted()` y navegar a `/pwa/dashboard`.
  - Mapear el render de cada paso (`step === n`) a la nueva secuencia de 5 pasos.
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 4. Implementar el componente `StepMedicalDisclaimer` (bloqueante)
  - Estado local `accepted` inicial en `false`; texto de advertencia médica (consultar al médico ante enfermedad/condición).
  - Checkbox con label asociado y `aria-checked`; botón "Continuar" con `disabled={!accepted}` y `aria-disabled`.
  - Garantizar que `onNext` solo pueda dispararse con `accepted === true` y que desmarcar vuelva a deshabilitar el botón.
  - Renderizar el checkbox operable aunque solo se cumpla parcialmente la accesibilidad.
  - Usar tokens de diseño existentes de forma consistente con los otros pasos.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 3.1, 3.2, 3.3, 3.4_

- [x] 5. Implementar el componente `StepInstallApp` (no bloqueante)
  - Consumir `usePwaInstall()`.
  - Android (`canPrompt`): botón "Instalar ahora" que llama `promptInstall()`; si resuelve 'accepted' avanzar con `onNext()`.
  - iOS: botón que muestra instrucciones manuales (Compartir → Agregar a pantalla de inicio → Agregar).
  - Standalone: indicar que ya está instalada y ofrecer continuar.
  - Sin soporte (no iOS, sin `beforeinstallprompt`): paso informativo con opción de continuar/saltar.
  - Garantizar siempre un control visible y habilitado para avanzar/saltar (nunca bloquear).
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. Escribir tests de las propiedades de correctitud
- [x] 6.1 Tests del gating del disclaimer
  - Verificar que el botón está deshabilitado con el checkbox desmarcado y habilitado al marcarlo (P1).
  - Verificar que no se puede invocar `onNext` sin aceptar y que al salir se persiste el consentimiento (P2, P3).
  - _Requirements: 2.3, 2.4, 2.5, 2.7, 6.3_
- [x] 6.2 Tests del paso de instalación y del hook
  - Verificar que en cada plataforma existe un control habilitado para avanzar (P4, no bloqueante).
  - Verificar que `promptInstall()` retorna un valor del conjunto esperado sin lanzar y consume el deferredPrompt (P5).
  - _Requirements: 5.1, 5.2, 5.5, 5.6, 4.5, 4.6_
- [x] 6.3 Tests de progreso dinámico
  - Verificar que la cantidad de dots iguala `ONBOARDING_STEPS.length` y que el aria-label es "Paso {n} de {total}" (P6).
  - _Requirements: 1.2, 1.3, 1.4_
