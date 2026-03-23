import { Suspense } from 'react';
import Banner from './components/Banner';
import AboutSection from './components/AboutSection';
import ReviewsSection from './components/ReviewsSection';
import ServicesSection from './components/ServicesSection';
import Footer from './components/Footer';
import { getCategories } from './lib/api/categories';
import { Category } from './lib/types';

// Static fallback categories (mirrors the hardcoded list) used when the
// backend is unreachable during build / SSR.
const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, slug: 'dulces', name: 'Dulces', description: '¡Descubrí los mejores postres y dulces de la ciudad!', image_url: '/img/dulces.jpg', display_order: 1 },
  { id: 2, slug: 'brunchs', name: 'Brunchs', description: 'Los mejores lugares para brunchear con amigos.', image_url: '/img/brunch.jpg', display_order: 2 },
  { id: 3, slug: 'desayunos', name: 'Desayunos', description: 'Arrancá el día con los desayunos más ricos.', image_url: '/img/breakfast.jpg', display_order: 3 },
  { id: 4, slug: 'mexico-food', name: 'Mexicana', description: 'Comida mexicana picante y llena de sabor.', image_url: '/img/mexfood2.jpg', display_order: 4 },
  { id: 5, slug: 'japan-food', name: 'Japonesa', description: 'Sushi, ramen y mucho más de Japón.', image_url: '/img/japanfood.jpg', display_order: 5 },
  { id: 6, slug: 'arabic-food', name: 'Árabe', description: 'Sabores y delicias de Medio Oriente.', image_url: '/img/arabicfood.jpg', display_order: 6 },
  { id: 7, slug: 'israelfood', name: 'Israelí', description: 'Platos únicos y tradicionales de Israel.', image_url: '/img/israelfood.jpg', display_order: 7 },
  { id: 8, slug: 'thaifood', name: 'Tailandesa', description: 'Comida tailandesa exótica y picante.', image_url: '/img/thaifood.jpg', display_order: 8 },
  { id: 9, slug: 'koreanfood', name: 'Coreana', description: 'BBQ coreano, kimchi y más.', image_url: '/img/koreanfood.jpg', display_order: 9 },
  { id: 10, slug: 'chinafood', name: 'China', description: 'Dim sum, fideos y clásicos chinos.', image_url: '/img/chinafood.jpg', display_order: 10 },
  { id: 11, slug: 'parrillas', name: 'Parrilla', description: 'Las mejores parrillas y carnes asadas.', image_url: '/img/parrilla.jpg', display_order: 11 },
  { id: 12, slug: 'brazilfood', name: 'Brasileña', description: 'Churrasquerías y sabores de Brasil.', image_url: '/img/brazilfood.jpg', display_order: 12 },
  { id: 13, slug: 'burguers', name: 'Hamburguesas', description: 'Las hamburguesas más jugosas y sabrosas.', image_url: '/img/burguers.jpg', display_order: 13 },
  { id: 14, slug: 'helados', name: 'Helados', description: 'Refrescate con los mejores helados.', image_url: '/img/helados.jpg', display_order: 14 },
  { id: 15, slug: 'peru-food', name: 'Peruana', description: 'Ceviche y delicias peruanas.', image_url: '/img/perufood.jpg', display_order: 15 },
];

async function fetchCategories(): Promise<Category[]> {
  try {
    const cats = await getCategories();
    return cats && cats.length > 0 ? cats : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

function ReviewsSectionFallback() {
  return (
    <section
      id="reviews"
      className="reviews scroll-mt-24 py-5"
      aria-busy="true"
      aria-label="Reseñas"
    >
      <div className="cc-container">
        <div className="min-h-[12rem] animate-pulse rounded-xl bg-neutral-100" />
      </div>
    </section>
  );
}

async function ReviewsSectionWithData() {
  const categories = await fetchCategories();
  return <ReviewsSection categories={categories} />;
}

export default function Home() {
  return (
    <main id="main-content">
      <Banner />
      <AboutSection />
      <Suspense fallback={<ReviewsSectionFallback />}>
        <ReviewsSectionWithData />
      </Suspense>
      <ServicesSection />
      <Footer />
    </main>
  );
}
