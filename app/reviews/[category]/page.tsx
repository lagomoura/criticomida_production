import type { Metadata } from 'next';
import Link from 'next/link';
import RestaurantCard from '@/app/components/RestaurantCard';
import MapComponent from '@/app/components/maps';
import {
  getReviewCategoryLabel,
  isValidReviewCategorySlug,
} from '@/app/data/review-categories';
import { notFound } from 'next/navigation';
import CategoryEmptyState from './CategoryEmptyState';
import { getRestaurants } from '@/app/lib/api/restaurants';
import { RestaurantListItem } from '@/app/lib/types';

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

  let restaurants: RestaurantListItem[] = [];
  try {
    const result = await getRestaurants({ category_slug: category, per_page: 100 });
    restaurants = result.items ?? [];
  } catch {
    restaurants = [];
  }

  return (
    <main id="main-content" className="cc-container py-5">
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
                <Link
                  href={`/restaurants/${restaurant.slug}`}
                  className={
                    'block rounded-2xl no-underline ' +
                    'focus-visible:outline-none focus-visible:ring-2 ' +
                    'focus-visible:ring-main-pink focus-visible:ring-offset-2'
                  }
                >
                  <RestaurantCard
                    name={restaurant.name}
                    image={restaurant.cover_image_url || '/img/restaurant-fallback.jpg'}
                    location={restaurant.location_name}
                    rating={restaurant.computed_rating}
                    description={restaurant.category?.description || restaurant.category?.name || ''}
                    reviewCount={restaurant.review_count}
                    showInfo={true}
                  />
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
