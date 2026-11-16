'use client';

import { useEffect } from 'react';
import { reportError } from '../lib/report';

// Reports uncaught errors, including ones from the Phaser game loop that React
// error boundaries never see.
export function ErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) =>
      reportError(
        'error',
        event.error ?? event.message,
        `${event.filename}:${event.lineno}:${event.colno}`,
      );
    const onRejection = (event: PromiseRejectionEvent) =>
      reportError(
        'unhandledrejection',
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason),
      );
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return null;
}
