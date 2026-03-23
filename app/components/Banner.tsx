import Link from 'next/link';

export default function Banner() {
  return (
    <section aria-label="Presentación">
      <div className="w-full px-0">
        <div
          className={
            'max-height flex flex-col items-center justify-center px-4 py-8'
          }
        >
          <div
            className={
              'banner banner-animate-content mx-auto w-full max-w-4xl ' +
              'text-center text-white'
            }
          >
            <h1 className="font-sans text-balance font-extrabold capitalize">
              Bienvenidos a{' '}
              <strong className="banner-title">CritiComida</strong>
            </h1>
            <Link
              href="/#reviews"
              className="banner-link mt-6 inline-block uppercase"
            >
              Ver reseñas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
