'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isVipUnlocked } from '@/lib/pwa/vip-access';
import { Icon, type IconName } from '@/components/pwa/ui/Icon';
import { resolveActiveNav, type NavTab } from '@/lib/pwa/ui/nav';
import { computeStagger } from '@/lib/pwa/ui/motion';

const baseTabs: NavTab[] = [
  { href: '/pwa/dashboard', label: 'Inicio', iconName: 'home' },
  { href: '/pwa/plan', label: 'Plan', iconName: 'plan' },
  { href: '/pwa/diario', label: 'Diario', iconName: 'diary' },
  { href: '/pwa/recetas', label: 'Recetas', iconName: 'recipes' },
  { href: '/pwa/guias', label: 'Guías', iconName: 'guides' },
];

const VIP_TAB: NavTab = { href: '/pwa/vip', label: 'VIP', iconName: 'vip' };

/**
 * BottomNav — shared bottom navigation for the authenticated PWA shell.
 *
 * Presentation-layer only: route targets, the conditional VIP tab and its
 * unlock re-read on navigation behave exactly as before. The active tab is now
 * resolved by the pure `resolveActiveNav` helper (longest-match wins, so at most
 * one item is ever active) and rendered with TWO distinguishing cues — the
 * terracotta token color AND a non-color cue (a top indicator bar plus a bolder
 * label weight) — together with `aria-current="page"` for assistive technology.
 * Emoji glyphs are replaced by the `Icon` primitive (token size + token color),
 * the bottom Safe_Area inset (`pb-safe`) is kept, and the one-time mount
 * entrance is driven by `computeStagger`.
 *
 * Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3
 */
export default function BottomNav() {
  const pathname = usePathname();

  // El tab VIP solo aparece si el dispositivo desbloqueó la sección con el
  // código. Re-leemos en cada cambio de ruta para que, apenas el usuario
  // desbloquea en /pwa/vip y navega, el tab pase a mostrarse.
  const [showVip, setShowVip] = useState(false);
  useEffect(() => {
    setShowVip(isVipUnlocked());
  }, [pathname]);

  const tabs = showVip ? [...baseTabs, VIP_TAB] : baseTabs;
  const activeIndex = resolveActiveNav(pathname, tabs);

  // Entrance stagger (one consistent inter-item delay, capped) — neutralized by
  // the global prefers-reduced-motion block.
  const delays = computeStagger(tabs.length);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-warm border-t border-warm-border pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              style={{ animationDelay: `${delays[index]}ms` }}
              className={`animate-fade-in relative flex flex-col items-center justify-center gap-0.5 min-w-[44px] px-2 py-1 rounded-lg transition-colors duration-fast ease-standard ${
                isActive ? 'text-terracotta' : 'text-muted'
              }`}
            >
              {/* Non-color cue #1: top indicator bar on the active item. */}
              <span
                aria-hidden="true"
                className={`absolute top-0 h-0.5 w-8 rounded-full bg-terracotta transition-opacity duration-fast ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <Icon name={tab.iconName as IconName} size="md" decorative />
              {/* Non-color cue #2: bolder label weight on the active item. */}
              <span
                className={`font-body text-xs ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
