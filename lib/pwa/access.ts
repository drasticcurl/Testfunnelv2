import { isTestMode } from './test-mode';

export type UserTier = {
  hasFront: boolean;
  hasBump: boolean;
  hasUpsell: boolean;
};

/**
 * Returns which products a user has purchased.
 *
 * DECISIÓN DE NEGOCIO: la PWA es la misma paguen lo que paguen (front, upsell o
 * downsell). No hay tiers: cualquier compra aprobada habilita acceso COMPLETO.
 * Por eso no se mapean product IDs — alcanza con tener al menos una fila
 * `status='approved'` en la tabla `purchases` para ese email.
 *
 * - Test mode: acceso completo siempre.
 * - Producción: consulta Supabase; si hay ≥1 compra aprobada → todo en true.
 */
export async function getUserTier(email: string): Promise<UserTier> {
  if (isTestMode()) {
    return { hasFront: true, hasBump: true, hasUpsell: true };
  }

  // Production: query Supabase
  const { createPwaServiceClient } = await import('./supabase');
  const supabase = createPwaServiceClient();

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'approved')
    .limit(1);

  if (error) {
    console.error('[pwa/access] Error:', error);
    return { hasFront: false, hasBump: false, hasUpsell: false };
  }

  const hasAccess = !!purchases && purchases.length > 0;

  // Sin tiers: una sola compra aprobada desbloquea todo.
  return { hasFront: hasAccess, hasBump: hasAccess, hasUpsell: hasAccess };
}
