'use client';

import { useEffect } from 'react';

/**
 * Root-level error UI. Must not import ./globals.css: a separate CSS graph
 * for this file often desyncs in dev (GET .../global-error.js 404) and breaks
 * hydration when the main layout CSS fails to load.
 */
export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#fff',
        }}
      >
        <main
          style={{
            boxSizing: 'border-box',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '28rem',
            margin: '0 auto',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#212529',
            }}
          >
            Error en la aplicación
          </h1>
          <p
            style={{
              margin: '0.75rem 0 0',
              fontSize: '1rem',
              color: '#495057',
            }}
          >
            No pudimos cargar la página. Probá de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '1.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: '#ef7998',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
