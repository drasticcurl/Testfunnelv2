/**
 * Active-navigation resolver for the BottomNav.
 *
 * `resolveActiveNav` replaces the inline `pathname.startsWith(tab.href)` logic
 * in `BottomNav`. A tab matches when the pathname is exactly the tab href or
 * the pathname is a descendant of it (`pathname === href` or
 * `pathname.startsWith(href + "/")`). When several tabs match (because their
 * hrefs are nested), the LONGEST / most-specific href wins, which guarantees
 * that at most one navigation item is ever active. When nothing matches the
 * resolver returns `-1`, so all items render in the non-active style.
 *
 * Requirements: 6.3, 6.5, 6.6
 */

export interface NavTab {
  /** The route this tab links to. */
  href: string;
  /** Visible label rendered under the icon. */
  label: string;
  /** Name of the `Icon` primitive glyph to render. */
  iconName: string;
}

/**
 * The canonical BottomNav tab list (from `design.md`). The VIP tab is rendered
 * conditionally by the component, but is part of the canonical model here.
 */
export const BOTTOM_NAV_TABS: NavTab[] = [
  { href: '/pwa/dashboard', label: 'Inicio', iconName: 'home' },
  { href: '/pwa/plan', label: 'Plan', iconName: 'plan' },
  { href: '/pwa/diario', label: 'Diario', iconName: 'diary' },
  { href: '/pwa/recetas', label: 'Recetas', iconName: 'recipes' },
  { href: '/pwa/guias', label: 'Guías', iconName: 'guides' },
  { href: '/pwa/vip', label: 'VIP', iconName: 'vip' },
];

/**
 * Whether `pathname` is covered by `href` (exact match or a descendant path).
 * Using the `href + "/"` boundary prevents `/pwa/plan` from matching
 * `/pwa/planificador`.
 */
function matches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * Returns the index of the single active tab, or `-1` if none match.
 *
 * When multiple tabs match (nested hrefs), the longest (most specific) href
 * wins, guaranteeing at most one active tab.
 */
export function resolveActiveNav(pathname: string, tabs: NavTab[]): number {
  let bestIndex = -1;
  let bestLength = -1;

  for (let i = 0; i < tabs.length; i++) {
    const href = tabs[i].href;
    if (matches(pathname, href) && href.length > bestLength) {
      bestLength = href.length;
      bestIndex = i;
    }
  }

  return bestIndex;
}
