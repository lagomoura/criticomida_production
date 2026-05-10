'use client';

import { useEffect } from 'react';

const STRINGS: Record<string, { title: string; message: string; retry: string }> = {
  es: {
    title: 'Error en la aplicación',
    message: 'No pudimos cargar la página. Probá de nuevo en unos segundos.',
    retry: 'Reintentar',
  },
  en: {
    title: 'Application error',
    message: "We couldn't load the page. Try again in a few seconds.",
    retry: 'Retry',
  },
  pt: {
    title: 'Erro no aplicativo',
    message: 'Não conseguimos carregar a página. Tente novamente em alguns segundos.',
    retry: 'Tentar novamente',
  },
};

function pickLocale(): keyof typeof STRINGS {
  if (typeof document === 'undefined') return 'es';
  const cookieMatch = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const fromCookie = cookieMatch?.[1];
  if (fromCookie && fromCookie in STRINGS) return fromCookie as keyof typeof STRINGS;
  const path = window.location.pathname.split('/')[1];
  if (path && path in STRINGS) return path as keyof typeof STRINGS;
  return 'es';
}

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

  const lang = pickLocale();
  const s = STRINGS[lang];

  return (
    <html lang={lang}>
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#F7F1E8',
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
              color: '#2A211C',
            }}
          >
            {s.title}
          </h1>
          <p
            style={{
              margin: '0.75rem 0 0',
              fontSize: '1rem',
              color: '#7A6A5D',
            }}
          >
            {s.message}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '1.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: '#C96A4B',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
