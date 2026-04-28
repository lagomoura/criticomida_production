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
    <main id="main-content" className="cc-container py-6">
      {restaurants.length === 0 ? (
        <CategoryEmptyState categoryLabel={categoryLabel} />
      ) : (
        <>
          <header className="mb-10">
            <nav className="mb-5" aria-label="Migas de pan">
              <Link
                href="/"
                className="font-display italic text-sm text-text-muted no-underline transition-colors hover:text-text-primary"
              >
                ← Volver al feed
              </Link>
            </nav>
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-action-primary">
              Categoría
            </p>
            <h1 className="mt-2 m-0 font-display text-[clamp(2.5rem,6.5vw,5rem)] font-medium leading-[0.98] text-text-primary">
              <em className="not-italic">{categoryLabel}</em>
            </h1>
            <p className="mt-3 max-w-xl font-display italic text-base leading-relaxed text-text-secondary md:text-lg">
              Lo que CritiComida tiene mapeado dentro de {categoryLabel.toLowerCase()}.
            </p>
          </header>

          <section className="mb-10">
            <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Mapa
            </h2>
            <MapComponent restaurants={restaurants} />
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="m-0 font-display text-2xl font-medium text-text-primary sm:text-3xl">
                Listado
              </h2>
              {user && (
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-action-primary px-3 font-sans text-sm font-medium text-text-inverse transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
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
                    className="block rounded-2xl no-underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
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
          </section>
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
