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
              Somos CritiComida, hecho por una familia que comparten opiniones
              reales sobre los mejores (¡y peores!) lugares para comer. Unite a
              descubrir sabores, recomendar tus favoritos y ayude a otros a
              elegir dónde darse un buen gusto. ¡Acá la posta la tenés vos!
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
