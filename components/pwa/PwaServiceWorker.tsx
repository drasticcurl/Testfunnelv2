'use client';

import { useEffect } from 'react';

export default function PwaServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed:', err);
      });
    }
  }, []);

  return null;
}
