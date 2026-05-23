import { isTestMode } from './test-mode';

export type UserTier = {
  hasFront: boolean;
  hasBump: boolean;
  hasUpsell: boolean;
};

/**
 * Returns which products a user has purchased.
 * In test mode: returns full access always.
 * In prod: queries Supabase purchases table.
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
    .select('product_id')
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'approved');

  if (error || !purchases) {
    console.error('[pwa/access] Error:', error);
    return { hasFront: false, hasBump: false, hasUpsell: false };
  }

  const ids = purchases.map((p) => String(p.product_id));
  const frontId = process.env.HOTMART_PRODUCT_ID_FRONT ?? '';
  const bumpId = process.env.HOTMART_PRODUCT_ID_BUMP ?? '';
  const upsellId = process.env.HOTMART_PRODUCT_ID_UPSELL ?? '';

  return {
    hasFront: frontId ? ids.includes(frontId) : purchases.length > 0,
    hasBump: bumpId ? ids.includes(bumpId) : false,
    hasUpsell: upsellId ? ids.includes(upsellId) : false,
  };
}
