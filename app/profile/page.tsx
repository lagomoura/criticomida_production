import Link from 'next/link';

export default function ProfilePage() {
  return (
    <main id="main-content" className="cc-container py-12 md:py-16">
      <h1 className="mb-3 text-2xl font-bold text-neutral-900 md:text-3xl">
        Tu perfil
      </h1>
      <p className="mb-6 max-w-xl text-neutral-600">
        Pronto vas a poder ver y editar tu cuenta desde acá. Mientras tanto,
        explorá las reseñas o volvé al inicio.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/#reviews"
          className={
            'rounded-xl bg-main-pink px-5 py-2.5 text-sm font-semibold ' +
            'text-white no-underline shadow-md hover:opacity-90'
          }
        >
          Ver reseñas
        </Link>
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
