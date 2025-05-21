import Image from 'next/image';

export default function ServicesSection() {
  return (
    <section id="services" className="services py-5 text-light">
      <div className="container">
        <div className="row">
          {/* Leé reseñas honestas */}
          <div className="col-md-4 text-center my-3 service-card-animate">
            <div className="service-card-hover p-3 rounded-4">
              <div className="service-icon-animate d-flex justify-content-center align-items-center mb-2">
                <Image src="/img/store.png" alt="Leé reseñas honestas" width={80} height={80} />
              </div>
              <h6 className="text-uppercase my-3 service-title">leé reseñas honestas</h6>
              <p className="w-75 mx-auto text-left service-text">
                Accedé a críticas detalladas y sinceras sobre restaurantes, bares y cafés de Argentina. Probamos todo para que vos elijas con confianza.
              </p>
            </div>
          </div>
          {/* Buscar restaurantes y platos */}
          <div className="col-md-4 text-center my-3 service-card-animate">
            <div className="service-card-hover p-3 rounded-4">
              <div className="service-icon-animate d-flex justify-content-center align-items-center mb-2">
                <Image src="/img/delivery.png" alt="Buscar restaurantes" width={80} height={80} />
              </div>
              <h6 className="text-uppercase my-3 service-title">buscá y descubrí</h6>
              <p className="w-75 mx-auto text-left service-text">
                Encontrá restaurantes, platos y estilos de comida según tu antojo. Filtrá por barrio, tipo de cocina o recomendación de la comunidad.
              </p>
            </div>
          </div>
          {/* Recomendaciones de la comunidad */}
          <div className="col-md-4 text-center my-3 service-card-animate">
            <div className="service-card-hover p-3 rounded-4">
              <div className="service-icon-animate d-flex justify-content-center align-items-center mb-2">
                <Image src="/img/vending.png" alt="Recomendaciones" width={80} height={80} />
              </div>
              <h6 className="text-uppercase my-3 service-title">recomendaciones reales</h6>
              <p className="w-75 mx-auto text-left service-text">
                Descubrí los lugares favoritos de la comunidad, las joyitas ocultas y los platos que no te podés perder. ¡Sumate y recomendá vos también!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 