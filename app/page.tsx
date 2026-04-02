import { Suspense } from 'react';
import Banner from './components/Banner';
import AboutSection from './components/AboutSection';
import ReviewsSection from './components/ReviewsSection';
import ServicesSection from './components/ServicesSection';
import Footer from './components/Footer';
import { getCategories } from './lib/api/categories';
import { Category } from './lib/types';

async function fetchCategories(): Promise<Category[]> {
  try {
    return await getCategories() ?? [];
  } catch {
    return [];
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
