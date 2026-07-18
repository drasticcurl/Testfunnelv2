export type UserTier = {
  hasFront: boolean;
  hasBump: boolean;
  hasUpsell: boolean;
};

/**
 * Devuelve a qué productos tiene acceso un usuario.
 *
 * DECISIÓN DE NEGOCIO: ahora que el registro es abierto y la autenticación se
 * hace vía Supabase Auth, estar logueado YA implica tener acceso. La
 * autorización de la PWA está DESACOPLADA de la tabla `purchases`: cualquier
 * usuario autenticado obtiene acceso COMPLETO (front + bump + upsell).
 *
 * Por eso ya no se consulta la tabla `purchases` para autorizar — esa tabla se
 * mantiene únicamente para estadísticas de ventas/admin (revenue), no para
 * gatekeeping de acceso.
 *
 * Se conserva la firma async para no romper a los callers, aunque ya no haga
 * ningún `await`.
 */
export async function getUserTier(email: string): Promise<UserTier> {
  return { hasFront: true, hasBump: true, hasUpsell: true };
}
