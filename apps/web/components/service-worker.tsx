'use client';

import { useEffect } from 'react';
import { asset } from '../lib/asset';

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(asset('/sw.js')).catch(() => {
        // The site remains usable when service workers are unavailable.
      });
    }
  }, []);
  return null;
}
