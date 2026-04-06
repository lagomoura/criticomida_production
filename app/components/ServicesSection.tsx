import Image from 'next/image';

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="services scroll-mt-24 py-5 text-white"
    >
      <div className="cc-container">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="service-card-animate my-3 text-center">
            <div className="service-card-hover rounded-4 p-3">
              <div className="service-icon-animate mb-2 flex items-center justify-center">
                <Image
                  src="/img/store.png"
                  alt="Leé reseñas honestas"
                  width={80}
                  height={80}
                />
              </div>
              <h6 className="service-title my-3 uppercase">
                millones de reseñas de platos
              </h6>
              <p className="service-text mx-auto w-full max-w-xs text-left md:w-3/4">
                Consultá opiniones auténticas de miles de platos en todo el país. Descubrí lo mejor (y lo peor) de cada restaurante y evitá sorpresas: todas las reseñas son de comensales reales.
              </p>
            </div>
          </div>
          <div className="service-card-animate my-3 text-center">
            <div className="service-card-hover rounded-4 p-3">
              <div className="service-icon-animate mb-2 flex items-center justify-center">
                <Image
                  src="/img/delivery.png"
                  alt="Buscá por plato o lugar"
                  width={80}
                  height={80}
                />
              </div>
              <h6 className="service-title my-3 uppercase">
                buscá por plato, lugar o estilo
              </h6>
              <p className="service-text mx-auto w-full max-w-xs text-left md:w-3/4">
                Filtrá por nombre de plato, restaurante, tipo de cocina, precio, barrio y más. Encontrá exactamente lo que querés comer, estés donde estés.
              </p>
            </div>
          </div>
          <div className="service-card-animate my-3 text-center">
            <div className="service-card-hover rounded-4 p-3">
              <div className="service-icon-animate mb-2 flex items-center justify-center">
                <Image
                  src="/img/vending.png"
                  alt="Ranking confiable"
                  width={80}
                  height={80}
                />
              </div>
              <h6 className="service-title my-3 uppercase">
                ranking y comunidad activa
              </h6>
              <p className="service-text mx-auto w-full max-w-xs text-left md:w-3/4">
                Descubrí los platos top de cada ciudad, los restaurantes más valorados y hasta joyitas ocultas recomendadas por la comunidad. Sumá tus propias reseñas y formá parte de la guía gastronómica más grande del país.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
