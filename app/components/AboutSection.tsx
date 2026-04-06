import Image from 'next/image';
import Link from 'next/link';

export default function AboutSection() {
  return (
    <section className="about scroll-mt-24 py-5" id="about">
      <div className="cc-container">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="about-text-animate mx-auto my-10 max-w-xl md:mx-0">
            <h2 className="capitalize">
              Sobre <strong className="banner-title">nosotros</strong>
            </h2>
            <p className="about-text my-4 w-full max-w-md text-muted md:w-3/4">
              CritiComida es la comunidad de personas reales que reseñan cada plato, en cada lugar. Miles de opiniones auténticas de usuarios de todo el país para que descubras qué pedir y dónde probar algo nuevo. Sumate a compartir tus experiencias, recomendá tus favoritos y ayudá a decidir a miles de comensales antes de salir a comer. Acá la recomendación la hace la gente, plato por plato.
            </p>
            <Link
              href="/#reviews"
              className="btn btn-primary uppercase tracking-wide"
            >
              Explorar reseñas
            </Link>
          </div>
          <div className="about-img-animate mx-auto my-10 self-center md:mx-0">
            <div className="about-img_container about-img-hover relative aspect-[10/7] w-full min-h-0 overflow-hidden">
              <Image
                src="/img/aboutnew.jpg"
                alt="Sobre CritiComida Argentina"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
