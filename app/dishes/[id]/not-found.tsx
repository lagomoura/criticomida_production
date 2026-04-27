import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="cc-container px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-6xl" aria-hidden>🍽️</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-medium text-[var(--color-carbon)]">
        Plato no encontrado
      </h1>
      <p className="mt-2 text-[var(--color-carbon-soft)]">
        Puede que el plato haya sido dado de baja o nunca haya existido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-azafran)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-[var(--color-canela)]"
      >
        Volver al feed
      </Link>
    </main>
  );
}
