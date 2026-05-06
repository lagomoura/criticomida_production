'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import RestaurantCard from '@/app/components/RestaurantCard';
import MapComponent from '@/app/components/maps';
import CategoryEmptyState from './CategoryEmptyState';
import { RestaurantListItem } from '@/app/lib/types';
import { resolveRestaurantCover } from '@/app/lib/utils/restaurantCover';

interface CategoryPageClientProps {
  categorySlug: string;
  categoryLabel: string;
  initialRestaurants: RestaurantListItem[];
}

export default function CategoryPageClient({
  categoryLabel,
  initialRestaurants,
}: CategoryPageClientProps) {
  const t = useTranslations('categoryPage');
  const restaurants = initialRestaurants;

  return (
    <main id="main-content" className="cc-container py-6">
      {restaurants.length === 0 ? (
        <CategoryEmptyState categoryLabel={categoryLabel} />
      ) : (
        <>
          <header className="mb-10">
            <nav className="mb-5" aria-label={t('breadcrumbAria')}>
              <Link
                href="/"
                className="font-display italic text-sm text-text-muted no-underline transition-colors hover:text-text-primary"
              >
                {t('backToFeed')}
              </Link>
            </nav>
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-action-primary">
              {t('kicker')}
            </p>
            <h1 className="mt-2 m-0 font-display text-[clamp(2.5rem,6.5vw,5rem)] font-medium leading-[0.98] text-text-primary">
              <em className="not-italic">{categoryLabel}</em>
            </h1>
            <p className="mt-3 max-w-xl font-display italic text-base leading-relaxed text-text-secondary md:text-lg">
              {t('subtitle', { label: categoryLabel.toLowerCase() })}
            </p>
          </header>

          <section className="mb-10">
            <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              {t('mapHeading')}
            </h2>
            <MapComponent restaurants={restaurants} />
          </section>

          <section>
            <h2 className="mb-4 m-0 font-display text-2xl font-medium text-text-primary sm:text-3xl">
              {t('listHeading')}
            </h2>
            <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.slug}`}
                  className="block h-full rounded-2xl no-underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                >
                  <RestaurantCard
                    name={restaurant.name}
                    image={resolveRestaurantCover(
                      restaurant.cover_image_url,
                      restaurant.google_photo_url,
                    )}
                    location={restaurant.location_name}
                    rating={restaurant.computed_rating}
                    description={restaurant.category?.description || restaurant.category?.name || ''}
                    reviewCount={restaurant.review_count}
                    showInfo={true}
                    hasReservation={restaurant.has_reservation ?? false}
                  />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
