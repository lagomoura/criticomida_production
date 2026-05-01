import Link from 'next/link';
import type { DishDetail } from '@/app/lib/types/social';

interface RestaurantContextCardProps {
  dish: DishDetail;
}

export default function RestaurantContextCard({ dish }: RestaurantContextCardProps) {
  const restaurantHref = dish.restaurantSlug
    ? `/restaurants/${encodeURIComponent(dish.restaurantSlug)}`
    : `/restaurants/${dish.restaurantId}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)]">
      <div className="grid gap-0 sm:grid-cols-[200px,1fr]">
        <div className="relative h-44 w-full bg-[var(--color-crema-dark)] sm:h-full">
          {dish.restaurantCoverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dish.restaurantCoverUrl}
              alt={`Foto de ${dish.restaurantName}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-azafran-pale)] to-[var(--color-canela)]/40" />
          )}
        </div>
        <div className="flex flex-col justify-between gap-3 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-canela)]">
              Servido en
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)] sm:text-3xl">
              <Link
                href={restaurantHref}
                className="hover:text-[var(--color-azafran)]"
              >
                {dish.restaurantName}
              </Link>
            </h2>
            {dish.restaurantLocationName && (
              <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
                {dish.restaurantLocationName}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {typeof dish.restaurantAverageRating === 'number' && (
                <span className="rounded-full bg-[var(--color-azafran-pale)] px-2.5 py-1 font-semibold text-[var(--color-canela)]">
                  ★ {dish.restaurantAverageRating.toFixed(1)} CritiComida
                </span>
              )}
              {typeof dish.restaurantGoogleRating === 'number' && (
                <span className="rounded-full bg-[var(--color-crema-dark)] px-2.5 py-1 font-semibold text-[var(--color-carbon-soft)]">
                  Google {dish.restaurantGoogleRating.toFixed(1)}
                </span>
              )}
              {dish.cuisineTypes && dish.cuisineTypes.length > 0 && (
                <span className="rounded-full bg-[var(--color-crema-dark)] px-2.5 py-1 text-[var(--color-carbon-soft)]">
                  {dish.cuisineTypes.slice(0, 2).join(' · ')}
                </span>
              )}
            </div>
          </div>
          <div>
            <Link
              href={restaurantHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-azafran)] px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-[var(--color-canela)]"
            >
              Ver el restaurante completo →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
