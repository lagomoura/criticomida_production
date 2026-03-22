'use client';

import { useEffect } from 'react';
import './globals.css';

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
      <body className="antialiased">
        <main
          className={
            'mx-auto flex min-h-screen max-w-lg flex-col items-center ' +
            'justify-center gap-6 px-4 py-16 text-center'
          }
        >
          <h1 className="m-0 text-2xl font-bold text-neutral-900">
            Error en la aplicación
          </h1>
          <p className="m-0 text-neutral-600">
            No pudimos cargar la página. Probá de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className={
              'rounded-xl bg-[#ef7998] px-5 py-2.5 text-sm font-semibold ' +
              'text-white shadow-md hover:opacity-90'
            }
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
