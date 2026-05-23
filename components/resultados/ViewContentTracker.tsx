'use client';

/**
 * ViewContentTracker - dispara eventos al montar y al hacer scroll.
 *  - Meta Pixel ViewContent (con tipo)
 *  - POST /api/track (Agente 04 lo procesa) con fbc/fbp para CAPI dedupe
 *  - Meta Pixel ScrollResultados50 al pasar 50%
 */

import { useEffect } from 'react';
import { TipoHinchazon } from '@/lib/quiz-types';
import { getMetaCookies } from '@/lib/cookies';

interface Props {
  tipo: TipoHinchazon;
}

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

export function ViewContentTracker({ tipo }: Props) {
  useEffect(() => {
    // 1. ViewContent al mount
    if (typeof window !== 'undefined') {
      const w = window as FbqWindow;
      if (w.fbq) {
        w.fbq('track', 'ViewContent', {
          content_name: `Resultados Tipo ${tipo}`,
          content_category: 'Quiz Anti-Hinchazón',
        });
      }
    }

    // 2. POST /api/track (no-block)
    const meta = getMetaCookies();
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ViewContent',
        fbc: meta.fbc,
        fbp: meta.fbp,
        contentName: `Resultados Tipo ${tipo}`,
        contentCategory: 'Quiz Anti-Hinchazon',
        custom: { tipo },
      }),
    }).catch(() => {
      /* fail silently — no bloquea al usuario */
    });

    // 3. Scroll 50% tracker (one-shot)
    let fired = false;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = max > 0 ? window.scrollY / max : 0;
      if (!fired && scrolled > 0.5) {
        fired = true;
        const w = window as FbqWindow;
        if (w.fbq) w.fbq('trackCustom', 'ScrollResultados50');
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [tipo]);

  return null;
}
