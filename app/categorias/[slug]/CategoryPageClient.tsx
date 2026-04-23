'use client';

import { useState } from 'react';
import Link from 'next/link';
import RestaurantCard from '@/app/components/RestaurantCard';
import MapComponent from '@/app/components/maps';
import CategoryEmptyState from './CategoryEmptyState';
import AddRestaurantModal from './AddRestaurantModal';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { RestaurantListItem } from '@/app/lib/types';

interface CategoryPageClientProps {
  categorySlug: string;
  categoryLabel: string;
  categoryId: number | null;
  initialRestaurants: RestaurantListItem[];
}

export default function CategoryPageClient({
  categoryLabel,
  categoryId,
  initialRestaurants,
}: CategoryPageClientProps) {
  const { user } = useAuthContext();
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);

  function handleRestaurantCreated(restaurant: RestaurantListItem) {
    setRestaurants(prev => [restaurant, ...prev]);
    setShowAddRestaurant(false);
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-800">
              Listado
            </h2>
            {user && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddRestaurant(true)}
              >
                Agregar restaurante
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      {user && (
        <AddRestaurantModal
          show={showAddRestaurant}
          categoryId={categoryId}
          onClose={() => setShowAddRestaurant(false)}
          onRestaurantCreated={handleRestaurantCreated}
        />
      )}
    </main>
  );
}
