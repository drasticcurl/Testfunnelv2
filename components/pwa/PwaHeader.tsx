'use client';

import Link from 'next/link';

interface PwaHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function PwaHeader({ title = 'DormíBien', showBack = false, backHref = '/pwa/dashboard' }: PwaHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-pwa-bg/95 backdrop-blur-sm border-b border-pwa-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {showBack ? (
          <Link href={backHref} className="text-pwa-accent text-sm font-medium flex items-center gap-1">
            <span>←</span> Volver
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <span className="font-serif text-lg text-pwa-accent font-semibold">{title}</span>
          </div>
        )}
        {!showBack && (
          <Link href="/pwa/dashboard" className="text-xs text-pwa-text-secondary">
            Mi cuenta
          </Link>
        )}
      </div>
    </header>
  );
}
