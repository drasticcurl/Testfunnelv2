/**
 * Auth-route classifier for the PwaShell.
 *
 * `isAuthRoute` reports whether a pathname is one of the pre-authentication
 * Auth_Screens (`/pwa/login`, `/pwa/registro`, `/pwa/recuperar`, `/pwa/reset`)
 * or any of their sub-paths. The PwaShell omits the AppHeader and BottomNav for
 * auth routes and renders the full chrome for any other `/pwa/*` route.
 *
 * This mirrors the omission logic already present in `PwaShell` so it can be
 * verified independently and reused.
 *
 * Requirements: 6.8
 */

/** The four Auth_Screen base routes (chrome omitted on these and sub-paths). */
export const AUTH_ROUTES = [
  '/pwa/login',
  '/pwa/registro',
  '/pwa/recuperar',
  '/pwa/reset',
] as const;

/**
 * Returns `true` when `pathname` is an Auth_Screen route or a sub-path of one
 * (so the shell omits header + nav), and `false` for any other route.
 *
 * A route matches when it is exactly an auth base route or a descendant
 * (`base` or `base + "/"`), preventing `/pwa/login` from matching an unrelated
 * sibling such as `/pwa/loginx`.
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (base) => pathname === base || pathname.startsWith(base + '/'),
  );
}
