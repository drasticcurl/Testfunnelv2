/**
 * chooseFunnelRender — helper PURO de decisión de render del Funnel A vs B.
 *
 * Extraído del QuizContainerV2 para poder testearlo de forma aislada (Property
 * P5: consistencia de render). Dado un único `FunnelVariant` resuelto, decide:
 *  - qué tema aplicar (`'b'` = envolver en FunnelBTheme; `'none'` = sin wrapper)
 *  - qué sales page renderizar (`'B'` = SlideSalesPageV3B; `'A'` = SlideSalesPageV3)
 *
 * Invariante de consistencia: un mismo `v` SIEMPRE produce branding y sales page
 * coherentes (B⇒{b,B}, A⇒{none,A}) dentro de un único mount.
 */

import type { FunnelVariant } from '@/lib/quiz-v2/funnelVariant';

export type FunnelRenderPlan = {
  theme: 'b' | 'none';
  sales: 'A' | 'B';
};

export function chooseRender(v: FunnelVariant): FunnelRenderPlan {
  return v === 'B'
    ? { theme: 'b', sales: 'B' }
    : { theme: 'none', sales: 'A' };
}
