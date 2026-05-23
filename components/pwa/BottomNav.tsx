'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/pwa/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/pwa/plan', label: 'Plan', icon: '🌙' },
  { href: '/pwa/diario', label: 'Diario', icon: '📝' },
  { href: '/pwa/guias', label: 'Guías', icon: '📖' },
  { href: '/pwa/progreso', label: 'Progreso', icon: '📊' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pwa-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-pwa-accent'
                  : 'text-pwa-text-secondary hover:text-pwa-accent'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
