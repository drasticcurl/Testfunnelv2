# Requirements Document

## Introduction

This feature covers a visual and UI polish effort for the existing Progressive Web App (PWA) located at `app/pwa`. The PWA is a Spanish-language Next.js application that guides users through a personalized "agua de arroz" (rice water) anti-bloating protocol. It includes the screens: calculadora, dashboard, diario, guias, kit-express, lista-compras, login, onboarding, plan, preferencias, progreso, recetas, recuperar, registro, reset, and vip, plus shared chrome (AppHeader, BottomNav, PwaShell, InstallPrompt).

The current visuals are considered poor and inconsistent. A core problem is that the codebase defines two parallel color systems in `globals.css`: a current "terracotta/warm" token set and a legacy "sage/cream/coral/sand" token set. The PWA screens render with the legacy palette while design intent points to the terracotta system, producing visual fragmentation. Typography utility names also diverge across screens (`font-serif` vs `font-heading`), and iconography relies on ad-hoc emoji.

The goal of this effort is to raise the visual quality, consistency, hierarchy, and polish of the PWA by establishing a single design system and applying it uniformly across all PWA screens and shared components — without changing application behavior, routing, or data logic. This is a presentation-layer effort.

## Glossary

- **PWA**: The Progressive Web App under `app/pwa`, including its routes and the shared components in `components/pwa` that render exclusively within the PWA shell.
- **Design_System**: The single, authoritative set of design tokens (color, typography, spacing, radius, shadow, motion) and their documented usage that the PWA SHALL consume.
- **Design_Token**: A named, reusable design value (for example a color, font family, spacing step, border radius, or shadow) defined once and referenced by name.
- **PWA_Screen**: Any user-facing route rendered under `app/pwa` (calculadora, dashboard, diario, guias, kit-express, lista-compras, login, onboarding, plan, preferencias, progreso, recetas, recuperar, registro, reset, vip).
- **Shared_Component**: A reusable UI element rendered across multiple PWA_Screens, including AppHeader, BottomNav, PwaShell, and InstallPrompt.
- **UI_Component**: A discrete visual building block such as a card, button, text input, badge, progress bar, or list item.
- **Auth_Screen**: A PWA_Screen used before authentication: login, registro, recuperar, reset.
- **Loading_State**: The visual representation shown while asynchronous data required by a PWA_Screen is being retrieved.
- **Empty_State**: The visual representation shown when a PWA_Screen has no user data to display.
- **Error_State**: The visual representation shown when a user-initiated action or data retrieval fails.
- **Touch_Target**: The interactive hit area of a UI_Component that responds to tap or click.
- **Contrast_Ratio**: The luminance contrast ratio between foreground and background colors as defined by WCAG 2.1.
- **Reduced_Motion**: The user agent preference expressed via the `prefers-reduced-motion: reduce` media query.
- **Safe_Area**: The device-reported inset region (for example notches and home indicators) exposed via CSS environment variables.
- **Breakpoint**: A defined viewport width threshold at which layout rules change.

## Requirements

### Requirement 1: Unified Design System and Token Source

**User Story:** As a user of the PWA, I want every screen to share one consistent visual language, so that the app feels cohesive and trustworthy.

#### Acceptance Criteria

1. THE Design_System SHALL define exactly one authoritative set of Design_Tokens that covers all six categories color, typography, spacing, border radius, shadow, and motion, with each category containing at least one named token, and SHALL declare these tokens in a single source location.
2. THE PWA SHALL reference every color, font, spacing, radius, and shadow value through a named Design_Token, such that no PWA_Screen or Shared_Component contains a literal color, font, spacing, radius, or shadow value embedded directly in the component.
3. WHERE a legacy Design_Token is retained for backward compatibility, THE Design_System SHALL map that legacy token to a corresponding current Design_Token value so that both names resolve to an identical visual result.
4. THE PWA SHALL apply the terracotta/warm primary color family as the single primary color family for all brand and primary-action elements across every PWA_Screen and Shared_Component.
5. IF a PWA_Screen requires a visual value that is not represented by an existing Design_Token, THEN THE Design_System SHALL define a new named Design_Token for that value before the value is referenced by any component.
6. WHERE both a legacy color token and a current color token resolve to the same visual role, THE Design_System SHALL give precedence to the current terracotta/warm token value so that the PWA renders the current palette rather than the legacy sage/cream/coral/sand palette.

### Requirement 2: Typography Consistency and Hierarchy

**User Story:** As a user, I want headings and body text to follow a clear, consistent hierarchy, so that I can scan and understand each screen quickly.

#### Acceptance Criteria

1. THE PWA SHALL render heading text using the heading font family defined by the Design_System on all PWA_Screens.
2. THE PWA SHALL render body text using the body font family defined by the Design_System at a minimum font size of 16 CSS pixels on all PWA_Screens.
3. THE Design_System SHALL define a typographic scale with named levels for page title, section heading, body text, and caption text, where each named level specifies a distinct font size, font weight, and line height, and the font sizes decrease monotonically in the order page title, section heading, body text, caption text.
4. WHERE a UI_Component displays a page title, section heading, body text, or caption, THE PWA SHALL apply exactly one corresponding named level from the typographic scale.
5. THE PWA SHALL use one consistent utility name to reference the heading font family across all PWA_Screens.
6. THE PWA SHALL use one consistent utility name to reference the body font family across all PWA_Screens.

### Requirement 3: Color Usage and Contrast Accessibility

**User Story:** As a user including those with low vision, I want text and interactive elements to be legible, so that I can read and use the app comfortably.

#### Acceptance Criteria

1. THE PWA SHALL render body text and its background with a Contrast_Ratio of at least 4.5:1 on all PWA_Screens.
2. THE PWA SHALL render large text, defined as at least 18.66px bold or at least 24px regular, and its background with a Contrast_Ratio of at least 3:1 on all PWA_Screens.
3. THE PWA SHALL render the visual boundary or text of each enabled interactive UI_Component against its adjacent background with a Contrast_Ratio of at least 3:1.
4. WHERE an interactive UI_Component is disabled or inactive, THE PWA SHALL be permitted to render that UI_Component below the contrast minimums.
5. THE PWA SHALL apply semantic status colors for success, warning, and error states using the named status Design_Tokens.
6. WHERE a status Design_Token color is used as text, THE PWA SHALL render that text against its background with a Contrast_Ratio of at least 4.5:1, or at least 3:1 where the text qualifies as large text.
7. WHERE color communicates status or state, THE PWA SHALL provide an additional non-color cue comprising visible text or an icon that is exposed to assistive technology.
8. WHERE a UI_Component conveys no status or state information, THE PWA SHALL be permitted to omit status cues.

### Requirement 4: Spacing and Layout Consistency

**User Story:** As a user, I want consistent spacing and alignment across screens, so that the app looks intentional and organized.

#### Acceptance Criteria

1. THE PWA SHALL apply spacing between and within UI_Components using only the named spacing steps defined by the Design_System, such that no literal spacing values outside those named steps are used.
2. THE PWA SHALL constrain primary content to a maximum readable width of no more than 768 CSS pixels on all PWA_Screens, and SHALL horizontally center that content within the viewport when the viewport width exceeds the maximum readable width.
3. THE PWA SHALL apply a horizontal page margin of at least 16 CSS pixels on each side, drawn from a single named spacing step of the Design_System, and SHALL apply that identical margin value across all PWA_Screens.
4. THE PWA SHALL apply identical corner radius values to all UI_Components of the same type, using the named radius Design_Tokens, across all PWA_Screens.
5. THE PWA SHALL apply an identical vertical gap, drawn from a single named spacing step of the Design_System, between consecutive UI_Components of the same type within a PWA_Screen.

### Requirement 5: Standardized UI Component Styling

**User Story:** As a user, I want buttons, cards, inputs, and badges to look and behave the same everywhere, so that I always recognize how to interact with them.

#### Acceptance Criteria

1. THE PWA SHALL render each primary action button with a single consistent visual style, defined by the Design_System tokens for color, typography, corner radius, spacing, border, and shadow, across all PWA_Screens.
2. THE PWA SHALL render each text input with a single consistent visual style defined by Design_System tokens, including a visible programmatically linked label, across all PWA_Screens.
3. THE PWA SHALL render content cards with a single consistent style for background, border, corner radius, and shadow, defined by Design_System tokens, across all PWA_Screens.
4. WHEN a user activates an interactive UI_Component by tap, click, or keyboard, THE PWA SHALL present a visible visual state change that differs from its at-rest state with a Contrast_Ratio of at least 3:1 against the adjacent background.
5. WHERE a pointing device reports hover capability, WHEN a user hovers over an interactive UI_Component, THE PWA SHALL present a visible visual state change for that hover.
6. WHILE a primary action button is disabled, THE PWA SHALL present a distinct disabled visual style and SHALL indicate the disabled state to assistive technology.
7. WHILE an interactive UI_Component is at rest, THE PWA SHALL present a visual affordance comprising a fill, border, or underline distinct from adjacent non-interactive content that indicates the UI_Component is interactive.
8. THE PWA SHALL render badges with a single consistent style for background, text color, corner radius, and spacing, defined by Design_System tokens, across all PWA_Screens.

### Requirement 6: Navigation Chrome Polish

**User Story:** As a user, I want the header and bottom navigation to look polished and clearly show where I am, so that I can move through the app confidently.

#### Acceptance Criteria

1. THE PWA SHALL render the AppHeader using named Design_System tokens for color, typography, and spacing rather than literal color, font, or spacing values.
2. THE PWA SHALL render the BottomNav using named Design_System tokens for color, typography, and spacing rather than literal color, font, or spacing values.
3. WHEN a PWA_Screen is active, THE BottomNav SHALL render its corresponding navigation item in an active style that differs from non-active navigation items by at least two visual cues, one of which is non-color, so that the active item is distinguishable without relying on color alone.
4. WHEN a PWA_Screen is active, THE BottomNav SHALL communicate the active navigation item's current state to assistive technology.
5. THE BottomNav SHALL render at most one navigation item in the active style at any time.
6. IF the active PWA_Screen does not correspond to any BottomNav navigation item, THEN THE BottomNav SHALL render all navigation items in the non-active style.
7. THE BottomNav SHALL apply the device-reported bottom Safe_Area inset so that all navigation items remain fully visible and within their Touch_Target above device home indicators.
8. WHILE a PWA_Screen is an Auth_Screen, THE PwaShell SHALL omit the AppHeader and BottomNav.

### Requirement 7: Iconography Consistency

**User Story:** As a user, I want icons to look consistent and intentional, so that the interface feels professional.

#### Acceptance Criteria

1. THE PWA SHALL render decorative and navigational icons drawn from a single consistent icon set, such that no PWA_Screen mixes differing icon styles for icons serving the same role.
2. THE PWA SHALL render icons of the same role at a consistent pixel size referenced from a named icon-size Design_Token defined by the Design_System.
3. THE PWA SHALL render icon color using the named color Design_Tokens defined by the Design_System rather than literal color values embedded in components.
4. WHERE an icon conveys meaning that is not otherwise present in adjacent text, THE PWA SHALL provide an accessible text alternative for the icon and SHALL keep the icon exposed to assistive technology.
5. WHERE an icon is purely decorative, THE PWA SHALL hide the icon from assistive technology.

### Requirement 8: Responsive and Mobile-First Layout

**User Story:** As a user on a phone, tablet, or desktop browser, I want each screen to adapt to my screen size, so that content is readable and usable on any device.

#### Acceptance Criteria

1. THE PWA SHALL render all PWA_Screens without horizontal overflow at every viewport width from 320px to 1920px inclusive.
2. WHILE the viewport width is below 640px, THE PWA SHALL present all primary content in a single-column layout.
3. THE PWA SHALL apply Safe_Area insets to content that would otherwise be obscured by device notches or home indicators, so that no text or interactive UI_Component is clipped or hidden.
4. WHEN the viewport width crosses any defined Breakpoint at 640px, 768px, or 1024px, THE PWA SHALL apply the layout rules associated with the Breakpoint that applies at the resulting width.
5. THE PWA SHALL render images and media so that their rendered width does not exceed the width of their container and their original aspect ratio is preserved with no stretching or cropping.

### Requirement 9: Loading, Empty, and Error States

**User Story:** As a user, I want clear feedback while data loads, when there is nothing to show, and when something fails, so that I am never confronted with a blank or broken screen.

#### Acceptance Criteria

1. WHILE a PWA_Screen is retrieving required data, THE PWA SHALL present a Loading_State styled with Design_System tokens in the region where the retrieved content will appear.
2. WHEN a PWA_Screen has no user data to display, THE PWA SHALL present an Empty_State that includes explanatory text and an interactive control for a suggested next action.
3. IF a user-initiated action fails, THEN THE PWA SHALL present an Error_State that includes a text message identifying which action failed, SHALL provide a control that allows the user to retry or dismiss the failed action, and SHALL preserve any user-entered input associated with that action so it is not lost.
4. WHEN a Loading_State, Empty_State, or Error_State of the same kind appears on different PWA_Screens, THE PWA SHALL render that state with a consistent visual treatment using Design_System tokens.
5. WHILE a Loading_State is displayed, THE PWA SHALL communicate the loading status to assistive technology.
6. WHEN data retrieval required by a PWA_Screen completes successfully, THE PWA SHALL remove the Loading_State and render the retrieved content.
7. IF data retrieval required by a PWA_Screen fails, THEN THE PWA SHALL replace the Loading_State with an Error_State that includes a human-readable message and a control that allows the user to retry the retrieval.

### Requirement 10: Motion and Animation Consistency

**User Story:** As a user, I want smooth and consistent transitions, so that the app feels responsive without being distracting.

#### Acceptance Criteria

1. THE PWA SHALL apply all entrance and transition animations using the named motion Design_Tokens for duration and easing, and SHALL NOT use animation duration or easing values that are not defined as motion Design_Tokens.
2. WHEN a PWA_Screen mounts a list of repeated UI_Components, THE PWA SHALL apply a staggered entrance using a single consistent inter-item delay of 40 to 80 milliseconds between consecutive items across all PWA_Screens.
3. WHEN a PWA_Screen mounts a list of more than 10 repeated UI_Components, THE PWA SHALL cap the cumulative stagger so that the entrance of the last animated item begins no later than 800 milliseconds after the first item begins.
4. WHILE the user agent reports Reduced_Motion, THE PWA SHALL disable all non-essential animations, defined as movement, scale, and staggered entrance effects, so that affected content appears in its final state without transition.
5. WHILE the user agent reports Reduced_Motion, THE PWA SHALL be permitted to retain essential animations that communicate system state, provided each such animation completes within 200 milliseconds.
6. THE PWA SHALL complete any individual entrance or transition animation within 600 milliseconds.

### Requirement 11: Interaction Accessibility

**User Story:** As a user navigating by keyboard, touch, or assistive technology, I want interactive elements to be reachable and clearly focused, so that I can operate the app independently.

#### Acceptance Criteria

1. THE PWA SHALL render each interactive UI_Component with a Touch_Target of at least 44 by 44 CSS pixels.
2. WHEN an interactive UI_Component receives keyboard focus, THE PWA SHALL present a visible focus indicator that renders against the adjacent background with a Contrast_Ratio of at least 3:1 and remains visible independent of color alone.
3. THE PWA SHALL associate every text input with a programmatically linked label.
4. THE PWA SHALL preserve a logical reading and focus order that matches the visual layout of each PWA_Screen.
5. WHEN a user activates a focused interactive UI_Component using the Enter key or Space key, THE PWA SHALL perform the same action that pointer activation of that UI_Component performs.

### Requirement 12: Behavior-Preserving Visual Changes

**User Story:** As a developer and product owner, I want the visual improvements to leave functionality intact, so that the redesign carries no regression risk to existing features.

#### Acceptance Criteria

1. THE PWA SHALL preserve all existing route paths under `app/pwa` such that each prior path resolves to the same PWA_Screen after the visual changes are applied.
2. WHEN a user activates a link or navigation item, THE PWA SHALL resolve it to the same target route as before the visual changes.
3. WHEN a user completes an existing flow such as login, onboarding, diary entry, or plan progression, THE PWA SHALL produce the same resulting destination route, the same persisted data, and the same success indication as before the visual changes.
4. THE PWA SHALL preserve existing data persistence behavior such that local storage keys and values, and backend request and response data, are identical to those produced before the visual changes.
5. IF an existing flow fails after the visual changes due to a regression, THEN THE PWA SHALL present an Error_State and SHALL preserve any data the user has entered in that flow.
