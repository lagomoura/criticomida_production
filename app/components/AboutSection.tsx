import Image from 'next/image';

export default function AboutSection() {
  return (
    <section className="about py-5" id="about">
      <div className="container">
        <div className="row">
          <div className="col-10 mx-auto col-md-6 my-5 about-text-animate">
            <h1 className="text-capitalize">
              Sobre <strong className="banner-title">nosotros</strong>
            </h1>
            <p className="my-4 text-muted w-75 about-text">
              Somos CritiComida, hecho por una pareja que comparten opiniones reales sobre los mejores (¡y peores!) lugares para comer. Unite a descubrir sabores, recomendar tus favoritos y ayude a otros a elegir dónde darse un buen gusto. ¡Acá la posta la tenés vos!
            </p>
            <a href="#" className="btn btn-black text-uppercase about-btn-animate">explorar más</a>
          </div>
          <div className="col-10 mx-auto col-md-6 my-5 align-self-center about-img-animate">
            <div className="about-img_container about-img-hover" style={{ position: 'relative', width: '100%', aspectRatio: '10/7', minHeight: 0, overflow: 'hidden' }}>
              <Image
                src="/img/aboutnew.jpg"
                alt="Sobre CritiComida Argentina"
                fill
                className="img-fluid"
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 