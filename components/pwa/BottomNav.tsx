'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/pwa/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/pwa/plan', label: 'Plan', icon: '📋' },
  { href: '/pwa/diario', label: 'Diario', icon: '📊' },
  { href: '/pwa/recetas', label: 'Recetas', icon: '🍽️' },
  { href: '/pwa/guias', label: 'Guías', icon: '📚' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sand/30 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive ? 'text-sage' : 'text-charcoal/40'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-sage' : 'text-charcoal/40'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
