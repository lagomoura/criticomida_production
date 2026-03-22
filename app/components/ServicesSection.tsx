import Image from 'next/image';

export default function ServicesSection() {
  return (
    <section id="services" className="services py-5 text-white">
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
                leé reseñas honestas
              </h6>
              <p className="service-text mx-auto w-full max-w-xs text-left md:w-3/4">
                Accedé a críticas detalladas y sinceras sobre restaurantes,
                bares y cafés de Argentina. Probamos todo para que vos elijas
                con confianza.
              </p>
            </div>
          </div>
          <div className="service-card-animate my-3 text-center">
            <div className="service-card-hover rounded-4 p-3">
              <div className="service-icon-animate mb-2 flex items-center justify-center">
                <Image
                  src="/img/delivery.png"
                  alt="Buscar restaurantes"
                  width={80}
                  height={80}
                />
              </div>
              <h6 className="service-title my-3 uppercase">
                buscá y descubrí
              </h6>
              <p className="service-text mx-auto w-full max-w-xs text-left md:w-3/4">
                Encontrá restaurantes, platos y estilos de comida según tu
                antojo. Filtrá por barrio, tipo de cocina o recomendación de
                la comunidad.
              </p>
            </div>
          </div>
          <div className="service-card-animate my-3 text-center">
            <div className="service-card-hover rounded-4 p-3">
              <div className="service-icon-animate mb-2 flex items-center justify-center">
                <Image
                  src="/img/vending.png"
                  alt="Recomendaciones"
                  width={80}
                  height={80}
                />
              </div>
              <h6 className="service-title my-3 uppercase">
                recomendaciones reales
              </h6>
              <p className="service-text mx-auto w-full max-w-xs text-left md:w-3/4">
                Descubrí los lugares favoritos de la comunidad, las joyitas
                ocultas y los platos que no te podés perder. ¡Sumate y
                recomendá vos también!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
