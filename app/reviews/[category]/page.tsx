import type { Metadata } from 'next';
import Link from 'next/link';
import RestaurantCard from '@/app/components/RestaurantCard';
import MapComponent from '@/app/components/maps';
import { visitedRestaurants } from '@/app/data/restaurants';
import {
  getReviewCategoryLabel,
  isValidReviewCategorySlug,
} from '@/app/data/review-categories';
import { notFound } from 'next/navigation';
import CategoryEmptyState from './CategoryEmptyState';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isValidReviewCategorySlug(category)) {
    return { title: 'Categoría no encontrada | Criticomida' };
  }

  const label = getReviewCategoryLabel(category);
  return {
    title: `${label} | Restaurantes | Criticomida`,
    description: `Restaurantes y reseñas en la categoría ${label} en Criticomida.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isValidReviewCategorySlug(category)) {
    notFound();
  }

  const categoryLabel = getReviewCategoryLabel(category);
  const restaurants = visitedRestaurants.filter(
    (restaurant) => restaurant.category === category,
  );

  return (
    <main className="cc-container py-5">
      <nav className="mb-6" aria-label="Navegación de sección">
        <Link
          href="/#reviews"
          className="font-semibold text-primary-coral no-underline hover:underline"
        >
          ← Volver a reseñas
        </Link>
      </nav>

      {restaurants.length === 0 ? (
        <CategoryEmptyState categoryLabel={categoryLabel} />
      ) : (
        <>
          <h1 className="mb-2 text-3xl font-bold text-neutral-900 md:text-4xl">
            Restaurantes:{' '}
            <strong className="text-primary-coral">{categoryLabel}</strong>
          </h1>
          <p className="mb-8 text-neutral-600">
            Lugares que visitamos en esta categoría.
          </p>
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-neutral-800">
              Mapa
            </h2>
            <MapComponent restaurants={restaurants} />
          </div>
          <h2 className="mb-4 text-lg font-semibold text-neutral-800">
            Listado
          </h2>
          <div
            className={
              'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
            }
          >
            {restaurants.map((restaurant) => (
              <div key={restaurant.id}>
                <RestaurantCard
                  name={restaurant.name}
                  image={restaurant.image}
                  location={restaurant.location}
                  rating={restaurant.rating}
                  description={restaurant.description}
                  reviewCount={restaurant.reviewCount}
                  showInfo={true}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
