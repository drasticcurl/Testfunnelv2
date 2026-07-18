# Requirements Document

## Introduction

This feature introduces a **full-funnel A/B test for Argentina traffic only**, comparing the current Argentine funnel (**Funnel A / control**) against a fully rebranded variant (**Funnel B / variant**). The objective is to measure which *entire* funnel — quiz branding plus sales page — converts better end to end, from quiz start through purchase.

Funnel A is the existing Argentine experience left completely unchanged. Funnel B reuses the **exact same quiz questions and logic** but applies a **scoped pink/feminine ("mujer") theme** (colors, typography, copy tone) and presents a **new conversion-optimized sales page (v2)** written for the Argentine audience (local slang, "vos" treatment). Logo, product name, pricing, currency, payment methods, and testimonials are reused as-is.

A single **environment-variable kill switch** (`NEXT_PUBLIC_AB_FUNNEL_ENABLED`) turns the experiment on or off. When OFF, all Argentine traffic sees Funnel A and the system behaves exactly as it does today. When ON, the legacy entry-hook test (`ab_entry`, variants A/B/C) randomization is paused (pinned to its current default) so the only experimental variable is Funnel A vs Funnel B. The LATAM funnel is never touched and is never assigned a variant.

The experiment is delivered as isolated, additive, reusable modules: dedicated variant assignment and persistence, dedicated internal tracking events that flow through the existing aggregate counters (no counter schema change), an additive lead column for purchase attribution, and a new side-by-side comparison view in the admin dashboard.

## Glossary

- **Funnel_Variant_Module**: The single source of truth for full-funnel variant assignment, persistence, the on/off flag, and the dedicated event-name vocabulary.
- **Quiz_Container**: The Argentine quiz runtime that resolves the variant, applies branding, and renders the appropriate sales page.
- **Funnel_B_Theme**: A scoped visual wrapper that redefines design-token CSS custom properties to the pink/feminine "mujer" palette for Funnel B only.
- **Sales_Page_A**: The current Argentine sales page used by Funnel A, left unchanged.
- **Sales_Page_B**: The new conversion-optimized Argentine sales page (v2) used by Funnel B.
- **Funnel_Store**: The admin aggregation layer that accumulates events into per-variant counters and builds the comparison breakdown.
- **Track_API**: The internal tracking endpoint that records funnel-variant events and short-circuits internal events before forwarding to external analytics.
- **Submit_Quiz_API**: The endpoint that persists lead data, including the assigned funnel variant, for email-bridged purchase attribution.
- **Shopify_Webhook**: The endpoint that attributes upsell/downsell purchases to a funnel variant via a cart attribute.
- **Admin_Funnel_View**: The admin dashboard section that displays the Funnel A vs Funnel B comparison.
- **Funnel_Variant**: A single-letter label, `A` (control) or `B` (rebranded), identifying which funnel a visitor experiences.
- **Kill_Switch**: The environment variable `NEXT_PUBLIC_AB_FUNNEL_ENABLED`; experiment is enabled only when its value equals `'true'`.
- **Quiz_Version**: The funnel locale, either `ar` (Argentina) or `latam` (rest of Latin America).
- **QA_Override**: The `?af=A|B` querystring parameter that forces a specific variant for testing, active only when the experiment is enabled.
- **QA_Preview_Override**: The `?af_preview=A|B` querystring parameter (case-insensitive) that previews a specific funnel for manual QA, independent of the Kill_Switch (works even when the experiment is OFF). AR-only; never persisted; never fires events.
- **Funnel_Step**: A measured funnel stage: `quiz_start`, `quiz_complete`, `salespage_view`, `checkout`, or `purchase`.
- **Funnel_Variant_Event**: An internal event named `af_<variant>_<step>` (e.g. `af_B_checkout`).
- **Entry_Hook_Test**: The pre-existing `ab_entry` experiment (variants A/B/C) on the first quiz slide.
- **Total_Conversion_Rate**: The headline KPI, `purchases / quiz_starts * 100`, for a variant.

## Requirements

### Requirement 1: Argentina-only full-funnel variant assignment

**User Story:** As a growth analyst, I want each Argentine visitor randomly assigned to Funnel A or Funnel B with an even split, so that I can compare the two complete funnels on a fair sample.

#### Acceptance Criteria

1. WHILE the Kill_Switch is enabled AND the Quiz_Version is `ar`, THE Funnel_Variant_Module SHALL assign each previously-unassigned visitor a Funnel_Variant of `A` or `B`.
2. WHILE the Kill_Switch is enabled AND the Quiz_Version is `ar`, THE Funnel_Variant_Module SHALL assign Funnel_Variant `B` to approximately 50 percent of newly-assigned visitors, within a tolerance of 5 percentage points over a sample of at least 10000 assignments.
3. THE Funnel_Variant_Module SHALL return a Funnel_Variant value that is exactly `A` or exactly `B`.
4. WHEN the Funnel_Variant_Module assigns a new Funnel_Variant, THE Funnel_Variant_Module SHALL persist that value in browser local storage under the key `ab_funnel_v1`.
5. WHEN the Funnel_Variant_Module runs on the server during server-side rendering, THE Funnel_Variant_Module SHALL return Funnel_Variant `A` without persisting any value.

### Requirement 2: Variant stability across the session

**User Story:** As a growth analyst, I want a visitor's assigned variant to stay the same for their whole session, so that conversion measurement is not corrupted by mid-funnel reassignment.

#### Acceptance Criteria

1. WHILE local storage holds an assigned Funnel_Variant of `A` or `B`, THE Funnel_Variant_Module SHALL return that same stored Funnel_Variant on every subsequent call.
2. WHILE local storage holds an assigned Funnel_Variant, THE Funnel_Variant_Module SHALL NOT overwrite that stored value with a newly randomized value.
3. WHEN a later funnel step reads the variant through the read-only peek operation, THE Funnel_Variant_Module SHALL return the already-assigned Funnel_Variant without creating a new assignment.
4. WHERE no Funnel_Variant has been assigned, THE Funnel_Variant_Module read-only peek operation SHALL return a null result.

### Requirement 3: Kill switch disables the experiment

**User Story:** As a site operator, I want a single environment-variable kill switch, so that I can instantly turn the experiment off and have all Argentine traffic behave exactly as it does today.

#### Acceptance Criteria

1. IF the Kill_Switch is unset OR its value is not `'true'`, THEN THE Funnel_Variant_Module SHALL return Funnel_Variant `A` for every visitor without a QA_Preview_Override, regardless of Quiz_Version, stored value, or randomness.
2. IF the Kill_Switch is disabled, THEN THE Funnel_Variant_Module SHALL NOT write any value to the `ab_funnel_v1` local storage key.
3. WHILE the Kill_Switch is disabled AND no QA_Preview_Override is present, THE Quiz_Container SHALL render Sales_Page_A and apply no Funnel_B_Theme branding.
4. WHILE the Kill_Switch is disabled, THE Quiz_Container SHALL execute the Entry_Hook_Test randomization with its existing behavior unchanged.
5. WHEN a visitor with a persisted Funnel_Variant `B` and no QA_Preview_Override reloads after the Kill_Switch is disabled, THE Funnel_Variant_Module SHALL return Funnel_Variant `A`.

> Note: Requirement 8 establishes that Sales_Page_B reuses pricing/checkout/testimonials and uses Argentine "vos" copy. **Requirement 18 (below)** extends Requirement 8 with the concrete conversion-rate-optimization (CRO) behaviors that make Funnel B a genuinely optimized page rather than a re-skin, while explicitly preserving the testimonial content and the payment methods.
>
> **Shared single-source price note (applies to Requirements 3, 4, and 8):** The Argentine front price is a single source of truth in `lib/quiz-v2/config.ts` (`PRICING.front`), consumed by BOTH Funnel A (`SlideSalesPageV3`) and Funnel B (`SlideSalesPageV3B`). Therefore, changing that value (e.g. from `$8.000` to `$7.790`) is an explicit, intentional exception to "Funnel A is unchanged": the **displayed price** in Funnel A changes too. This is by design — the *structure and logic* of Funnel A stay identical (no copy reordering, no new components); only the derived price value updates. The LATAM funnel has its OWN separate price (`PRICING_LATAM` in `config-latam.ts`, in USD) and is NOT affected. The real charged price is configured out-of-repo in Tienda Nube / Shopify, so this change only updates the DISPLAYED price plus the Meta intent-tracking value.

### Requirement 4: Funnel A is unchanged when the experiment is off

**User Story:** As a site operator, I want Funnel A to be byte-identical to the current production funnel when the experiment is off, so that turning the experiment off carries zero behavioral risk.

#### Acceptance Criteria

1. WHILE the Kill_Switch is disabled, THE Quiz_Container SHALL present the current Argentine quiz questions, logic, branding, and Sales_Page_A without modification.
2. WHILE the Kill_Switch is disabled, THE Track_API SHALL NOT record any Funnel_Variant_Event.
3. THE Quiz_Container SHALL preserve the existing Argentine quiz questions and answer logic identically for both Funnel_Variant `A` and Funnel_Variant `B`.

### Requirement 5: Pause the legacy entry-hook test while the experiment is on

**User Story:** As a growth analyst, I want the legacy entry-hook test paused while this experiment runs, so that Funnel A vs Funnel B is the only experimental variable.

#### Acceptance Criteria

1. WHILE the Kill_Switch is enabled, THE Quiz_Container SHALL pin the Entry_Hook_Test to its current production default instead of randomizing a new entry variant.
2. WHILE the Kill_Switch is enabled, THE Quiz_Container SHALL preserve any Entry_Hook_Test variant already persisted for the visitor.
3. WHILE the Kill_Switch is enabled, THE system SHALL retain historical Entry_Hook_Test data and existing webhook attribution behavior without modification.

### Requirement 6: LATAM funnel is never affected

**User Story:** As a site operator, I want the LATAM funnel to be completely excluded from this experiment, so that only Argentine traffic is part of the test.

#### Acceptance Criteria

1. IF the Quiz_Version is `latam`, THEN THE Funnel_Variant_Module SHALL return Funnel_Variant `A` regardless of the Kill_Switch state or randomness.
2. IF the Quiz_Version is `latam`, THEN THE Funnel_Variant_Module SHALL NOT write any value to the `ab_funnel_v1` local storage key.
3. WHILE the Quiz_Version is `latam`, THE Track_API SHALL NOT record any Funnel_Variant_Event for the visitor.
4. THE system SHALL leave all LATAM quiz, branding, sales, and tracking behavior unchanged.

### Requirement 7: Funnel B scoped rebrand

**User Story:** As a brand designer, I want Funnel B to apply a pink/feminine "mujer" theme scoped only to its own subtree, so that the rebrand never alters Funnel A or shared style defaults.

#### Acceptance Criteria

1. WHERE the resolved Funnel_Variant is `B`, THE Quiz_Container SHALL wrap the quiz and sales-page rendering in the Funnel_B_Theme.
2. WHEN the Funnel_B_Theme is applied, THE Funnel_B_Theme SHALL redefine the brand design-token CSS custom properties to the pink/feminine palette only within its own scoped subtree.
3. THE Funnel_B_Theme SHALL leave the shared global style token defaults unchanged.
4. WHERE the resolved Funnel_Variant is `A`, THE Quiz_Container SHALL render without applying the Funnel_B_Theme.
5. THE Funnel_B_Theme SHALL preserve the existing logo and product name.

### Requirement 8: Funnel B conversion-optimized sales page

**User Story:** As a conversion specialist, I want Funnel B to use a new Argentine sales page that reuses existing pricing, checkout, and testimonials, so that I can test improved copy and framing without changing commercial configuration.

#### Acceptance Criteria

1. WHERE the resolved Funnel_Variant is `B`, THE Quiz_Container SHALL render Sales_Page_B in place of Sales_Page_A.
2. THE Sales_Page_B SHALL reuse the existing pricing, checkout configuration, and testimonial content without modification.
3. THE Sales_Page_B SHALL present copy written for the Argentine audience using the "vos" treatment and local language.
4. THE Sales_Page_B SHALL visually match the Funnel_B_Theme branding.

### Requirement 9: Variant consistency across quiz and sales page

**User Story:** As a growth analyst, I want a visitor's assigned variant to drive both the quiz branding and the sales page within a single session, so that each visitor experiences one coherent funnel.

#### Acceptance Criteria

1. WHERE the resolved Funnel_Variant is `B`, THE Quiz_Container SHALL apply the Funnel_B_Theme AND render Sales_Page_B together.
2. WHERE the resolved Funnel_Variant is `A`, THE Quiz_Container SHALL apply no theme wrapper AND render Sales_Page_A together.
3. THE Quiz_Container SHALL use a single resolved Funnel_Variant value to drive both the branding and the sales-page selection within one mount.

### Requirement 10: QA querystring override

**User Story:** As a QA engineer, I want to force a specific variant via a querystring parameter, so that I can verify each funnel deterministically.

> Note: The `?af` QA_Override described here is the experiment-scoped override (only active when the Kill_Switch is enabled). It is a **distinct mechanism** from the flag-independent `?af_preview` QA_Preview_Override defined in Requirement 17; the two never interfere.

#### Acceptance Criteria

1. WHERE the Kill_Switch is enabled AND the Quiz_Version is `ar` AND a QA_Override of `A` or `B` is present, THE Funnel_Variant_Module SHALL return the overridden Funnel_Variant.
2. WHERE the Kill_Switch is enabled AND the Quiz_Version is `ar` AND a QA_Override of `A` or `B` is present, THE Funnel_Variant_Module SHALL persist the overridden Funnel_Variant in the `ab_funnel_v1` local storage key.
3. IF the Kill_Switch is disabled, THEN THE Funnel_Variant_Module SHALL ignore the `?af` QA_Override and return Funnel_Variant `A` without persisting.
4. IF the Quiz_Version is `latam`, THEN THE Funnel_Variant_Module SHALL ignore the `?af` QA_Override and return Funnel_Variant `A` without persisting.

### Requirement 11: Dedicated funnel-variant event vocabulary

**User Story:** As a developer, I want a dedicated event-name vocabulary for the funnel test, so that funnel-variant events never collide with other experiments and can be parsed reliably.

#### Acceptance Criteria

1. WHEN given a Funnel_Variant and a Funnel_Step, THE Funnel_Variant_Module SHALL produce an event name of the form `af_<variant>_<step>`.
2. WHEN given an event name produced by the Funnel_Variant_Module, THE Funnel_Variant_Module SHALL parse it back into the original Funnel_Variant and Funnel_Step (round-trip).
3. IF an event name does not begin with the `af_` prefix, THEN THE Funnel_Variant_Module SHALL classify it as not a Funnel_Variant_Event and SHALL return a null parse result.
4. THE Funnel_Variant_Module SHALL classify any `af_*` event name as mutually exclusive from `ab_entry_*` and `sp_*` event names.

### Requirement 12: Funnel-step tracking through existing counters

**User Story:** As a growth analyst, I want each funnel step tracked per variant through the existing aggregate counters, so that I can measure step-by-step conversion without changing the analytics schema.

#### Acceptance Criteria

1. WHEN an Argentine visitor reaches the first real quiz question with the experiment enabled, THE Quiz_Container SHALL record the `af_<variant>_quiz_start` event.
2. WHEN an Argentine visitor reaches the sales-page slide, THE Quiz_Container SHALL record the `af_<variant>_quiz_complete` event.
3. WHEN the sales page is viewed, THE Quiz_Container SHALL record the `af_<variant>_salespage_view` event.
4. WHEN the visitor clicks the buy call-to-action, THE Quiz_Container SHALL record the `af_<variant>_checkout` event.
5. THE Funnel_Store SHALL accumulate Funnel_Variant_Events through the existing aggregate counter store without any counter schema change.
6. WHEN the Track_API receives a Funnel_Variant_Event, THE Track_API SHALL record the event and SHALL NOT forward it to the external analytics platform.

### Requirement 13: Purchase attribution by variant

**User Story:** As a growth analyst, I want each purchase attributed to the visitor's funnel variant, so that I can compute true end-to-end conversion for Funnel A vs Funnel B.

#### Acceptance Criteria

1. WHEN a lead is submitted, THE Submit_Quiz_API SHALL persist the visitor's assigned Funnel_Variant on the lead record.
2. THE system SHALL store the assigned Funnel_Variant in an additive, nullable lead column that leaves existing lead records and schema non-breaking.
3. WHEN a front-store purchase is confirmed, THE Track_API SHALL attribute the purchase to the lead's stored Funnel_Variant by matching on email and SHALL record the `af_<variant>_purchase` event.
4. WHEN a Funnel B checkout begins, THE Sales_Page_B SHALL attach the Funnel_Variant as a cart attribute so that upsell and downsell purchases carry the variant.
5. WHEN the Shopify_Webhook receives an order carrying a Funnel_Variant cart attribute, THE Shopify_Webhook SHALL record the `af_<variant>_purchase` event for that variant.
6. IF a confirmed purchase has no associated Funnel_Variant, THEN THE system SHALL count the purchase toward overall totals without attributing it to a specific variant.

### Requirement 14: Admin side-by-side comparison

**User Story:** As a growth analyst, I want a side-by-side comparison of Funnel A and Funnel B in the admin dashboard, so that I can see which entire funnel converts better.

#### Acceptance Criteria

1. WHEN Funnel_Variant_Event data exists, THE Admin_Funnel_View SHALL display a side-by-side comparison of Funnel_Variant `A` and Funnel_Variant `B`.
2. THE Admin_Funnel_View SHALL display, per variant, the per-step conversion rates for completion, sales-page view, checkout, and purchase.
3. THE Admin_Funnel_View SHALL display, per variant, the Total_Conversion_Rate computed as purchases divided by quiz starts.
4. IF no Funnel_Variant_Event data exists, THEN THE Admin_Funnel_View SHALL hide the comparison section.

### Requirement 15: Denominator-safe breakdown metrics

**User Story:** As a growth analyst, I want all comparison rates to be mathematically safe, so that the dashboard never shows invalid or misleading numbers.

#### Acceptance Criteria

1. THE Funnel_Store SHALL compute every per-variant count as a non-negative integer equal to the sum of the corresponding input event counts for that variant and step.
2. IF the denominator of a rate is zero, THEN THE Funnel_Store SHALL return that rate as `0` rather than an undefined or infinite value.
3. THE Funnel_Store SHALL produce every rate within the inclusive range `[0, 100]`.
4. WHEN no Funnel_Variant_Event data exists, THE Funnel_Store SHALL return an empty breakdown.

### Requirement 16: Resilient client behavior

**User Story:** As a visitor, I want the funnel to keep working even when storage or tracking fails, so that my experience is never blocked by analytics infrastructure.

#### Acceptance Criteria

1. IF local storage access throws an error, THEN THE Funnel_Variant_Module SHALL fall back to an in-memory variant for the current mount without throwing.
2. IF a tracking request to the Track_API fails, THEN THE Quiz_Container SHALL continue funnel progression without interruption.
3. IF the lead attribution column has not yet been provisioned, THEN THE Submit_Quiz_API SHALL persist the remaining lead data without failing the submission.

### Requirement 17: QA preview override (flag-independent)

**User Story:** As a QA engineer, I want to preview Funnel B (or Funnel A) by visiting the Argentine quiz with an explicit querystring, even when the experiment Kill_Switch is OFF and without setting any environment variable, so that I can manually verify each funnel end to end before launch.

#### Acceptance Criteria

1. WHERE the Quiz_Version is `ar` AND a QA_Preview_Override of `A` or `B` (case-insensitive) is present, THE Funnel_Variant_Module SHALL return that previewed Funnel_Variant regardless of the Kill_Switch state, stored value, or randomness, resolving it before the Kill_Switch check.
2. WHEN the Funnel_Variant_Module resolves a QA_Preview_Override, THE Funnel_Variant_Module SHALL NOT write any value to the `ab_funnel_v1` local storage key.
3. IF the Quiz_Version is `latam`, THEN THE Funnel_Variant_Module SHALL ignore the QA_Preview_Override and return Funnel_Variant `A` without persisting, preserving the "LATAM never assigned" invariant.
4. WHEN a later funnel step reads the variant through the read-only peek operation AND a valid QA_Preview_Override is present, THE Funnel_Variant_Module SHALL return the previewed Funnel_Variant so that the quiz branding, sales page, and checkout stay consistent for the whole session.
5. IF the QA_Preview_Override value is absent or is not `A` or `B`, THEN THE Funnel_Variant_Module SHALL fall through to its normal resolution logic, leaving the "OFF ⇒ Funnel A for normal traffic" guarantee intact.
6. WHILE the Kill_Switch is disabled, THE Quiz_Container SHALL NOT fire any Funnel_Variant_Event during a preview, because event firing remains gated solely on the Kill_Switch and is not affected by the QA_Preview_Override.
7. THE QA_Preview_Override SHALL be a mechanism separate and independent from the `?af` QA_Override, leaving the existing `?af` behavior unchanged.


### Requirement 18: Funnel B conversion optimizations (Argentine-market CRO)

**User Story:** As a conversion specialist, I want Funnel B's sales page (Sales_Page_B) to apply concrete Argentine-market conversion best practices — derived per-day price framing, an explicit discount badge, a sticky mobile buy-bar, social proof placement, honest urgency, and an elevated guarantee — so that Funnel B is a genuinely optimized page and not a color re-skin of Funnel A, while the price, testimonial content, and payment methods stay unchanged.

> Note: This requirement extends Requirement 8. All Requirement 8 criteria (pricing/checkout/testimonial reuse, "vos" copy, theme match) continue to hold. Requirement 18 adds the CRO-specific behaviors. The tracking behaviors (`af_<V>_salespage_view` on mount, `af_<V>_checkout` on CTA click, Meta ViewContent/InitiateCheckout, and the `funnel_variant` cart attribute) defined in Requirements 12–13 remain intact and are reused by every CTA, including the sticky one.
>
> **30-day plan framing (Argentina has no upsell):** Unlike other markets, the Argentine funnel has **no upsell**, so the front product is positioned as a **complete 30-day plan**. Consequently: (a) the per-day price is divided over a **30-day basis** (`Math.round(amount / 30)` → ~$260/día with $7.790); (b) plan/protocol copy frames the plan as **30 days**; and (c) the money-back **guarantee is 7 days**. These copy/framing changes apply to **Funnel B (`SlideSalesPageV3B`)**; aligning **Funnel A** to the same framing is a **separate decision** handled outside this change. The price (7.790) and pricing config are unchanged; testimonial content and LATAM are untouched.

#### Acceptance Criteria

1. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL display a per-day cost line computed from `PRICING.front.amount` on the **30-day plan basis** as `Math.round(amount / 30)`, rendered in ARS, AND SHALL display the **final total price beside the per-day figure** (for example "~$260 por día · $7.790 en total"), both derived from `PRICING.front` so the figures stay correct if the price changes.
2. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL display a discount-percentage badge next to the struck-through "valor total" anchor, computed from the anchor versus `PRICING.front.amount` (for example `1 - 7790/51000 ≈ 85% OFF`), rather than a hardcoded percentage.
3. THE Sales_Page_B SHALL NOT hardcode the price anywhere, always sourcing the displayed price from `PRICING.front.display` / `PRICING.front.amount`. (Note: the Argentine front price value itself is a shared single-source value — see the note under Requirements 3/4/8 — and may be changed intentionally in `config.ts`.)
4. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL render a sticky bottom buy-bar on mobile that **MUST NOT appear until the price section has entered the viewport at least once** (curiosity preservation: the visitor consumes the value stack without knowing the price, then sees $7.790). Before the price section has been seen the sticky bar SHALL be hidden (translated off-screen / `aria-hidden`); after it has been seen it MAY act as a reminder on subsequent scroll. The sticky bar SHALL stay mounted in the DOM, expose an accessible button (a `<button>` element with an `aria-label`), and invoke the same `handleCheckout` handler as the inline CTAs so that tracking and the `funnel_variant` cart attribute fire identically.
5. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL present a benefit-driven primary CTA copy (for example "EMPEZAR A DESHINCHARME") and retain the repeated inline CTAs.
6. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL show social proof near the top of the page AND repeat social proof near the price CTA, reusing the existing testimonial content without modifying its text, author, age, or city.
7. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL keep the countdown urgency and pair it with an explicit honest rationale (for example "precio promo solo hoy" and "después vuelve a $51.000"), and SHALL NOT present fake stock-scarcity claims.
8. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL present a compact **7-day** money-back guarantee adjacent to the main price/CTA box in addition to the full guarantee section, and ALL guarantee references on the page (compact block, elevated section heading/body, FAQ answer, and final-CTA trust badge) SHALL state **7 días**.
9. THE Sales_Page_B SHALL present copy in Argentine "vos" with local comparisons (for example café, alfajor, SUBE), kept tasteful.
10. THE Sales_Page_B SHALL NOT claim installments ("cuotas") or financing anywhere, and SHALL keep the payment trust row exactly as Funnel A: "Visa · Mastercard · MercadoPago" (single payment), without inventing payment methods.
11. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL preserve a mobile-first layout and add bottom padding so page content (including the footer/legal text) is never hidden behind the sticky buy-bar.
12. THE Sales_Page_B SHALL keep the Tienda Nube versus Shopify checkout branching identical to the existing behavior, including the `funnel_variant` cart attribute on the Shopify fallback path.
13. WHERE the resolved Funnel_Variant is `B`, THE Sales_Page_B SHALL render a **real-world cost price-anchor block immediately before the price reveal** (after the value stack, before the $7.790 box) that builds the expectation of an expensive alternative — a professional-help cost anchor for a private nutritionist consult. The anchor amount SHALL be derived from a constant (for example `NUTRI_ANCHOR = 30000`, rendered via `formatArs`) and the copy SHALL use soft, non-absolute wording in "vos" ("arranca en / suele costar ~$30.000"), not a hard factual claim. This anchor complements — and does not replace — the existing struck-through "$51.000 valor total" anchor, producing a coherent sequence: real-world cost anchor (nutritionist) → bundle "valor total $51.000" → real price $7.790 (~$1.113/día).
