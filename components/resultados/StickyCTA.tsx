'use client';

/**
 * StickyCTA - barra fija en mobile que aparece despues de scroll 30%.
 * Lleva al CTA final via anchor (no abre Hotmart directo, deja al usuario ver
 * el CTA principal).
 */

import { useEffect, useState } from 'react';

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = max > 0 ? window.scrollY / max : 0;
      setVisible(scrolled > 0.3);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EFECE7] px-4 py-3 z-50 shadow-xl flex items-center justify-between gap-3"
      role="region"
      aria-label="Acceder al protocolo"
    >
      <div>
        <div className="font-sans text-xs text-[#5C5852]">Tu Protocolo</div>
        <div className="font-serif font-bold text-coral text-lg leading-none">
          $9.990 <span className="text-xs text-[#9B9890] line-through font-normal">$31.950</span>
        </div>
      </div>
      <a
        href="#cta-final"
        className="bg-coral text-white px-5 py-3 rounded-full text-sm font-sans font-semibold uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      >
        EMPEZAR AHORA →
      </a>
    </div>
  );
}
