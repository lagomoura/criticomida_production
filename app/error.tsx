'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
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
    <main
      id="main-content"
      className={
        'cc-container flex min-h-[50vh] flex-col items-center ' +
        'justify-center gap-6 py-16 text-center'
      }
    >
      <h1 className="m-0 text-2xl font-bold text-neutral-900 md:text-3xl">
        Algo salió mal
      </h1>
      <p className="m-0 max-w-md text-neutral-600">
        Ocurrió un error al cargar esta página. Podés intentar de nuevo o
        volver al inicio.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={
            'rounded-xl bg-main-pink px-5 py-2.5 text-sm font-semibold ' +
            'text-white shadow-md hover:opacity-90'
          }
        >
          Reintentar
        </button>
        <Link
          href="/"
          className={
            'rounded-xl border border-main-pink/50 px-5 py-2.5 text-sm ' +
            'font-semibold text-main-pink no-underline hover:bg-main-pink/10'
          }
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
