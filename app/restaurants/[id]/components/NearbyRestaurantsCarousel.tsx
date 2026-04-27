import Image from 'next/image';
import Link from 'next/link';
import type { NearbyRestaurantItem } from '@/app/lib/types/restaurant';

interface NearbyRestaurantsCarouselProps {
  items: NearbyRestaurantItem[];
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export default function NearbyRestaurantsCarousel({
  items,
}: NearbyRestaurantsCarouselProps) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 shadow-sm sm:p-8">
      <header className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)] sm:text-3xl">
          Cerca de aquí
        </h2>
        <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
          Otros lugares a un paso, ordenados por distancia.
        </p>
      </header>
      <ul className="-mx-2 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((r) => (
          <li key={r.id} className="shrink-0 first:ml-2 last:mr-2">
            <Link
              href={`/restaurants/${r.slug}`}
              className="group flex w-56 flex-col overflow-hidden rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] no-underline transition hover:border-[var(--color-azafran)]"
            >
              <div className="relative h-32 w-full bg-[var(--color-canela)]">
                {r.cover_image_url ? (
                  <Image
                    src={r.cover_image_url}
                    alt={r.name}
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-white/70">
                    🍽️
                  </div>
                )}
                <span className="absolute right-2 top-2 rounded-full bg-[var(--color-carbon)]/85 px-2 py-0.5 text-xs font-semibold text-white">
                  {formatDistance(r.distance_km)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-lg font-medium leading-tight text-[var(--color-carbon)] group-hover:text-[var(--color-azafran)]">
                  {r.name}
                </h3>
                <p className="line-clamp-1 text-xs text-[var(--color-carbon-soft)]">
                  {r.location_name}
                </p>
                <div className="mt-auto flex items-center gap-1.5 text-sm">
                  {Number(r.computed_rating) > 0 ? (
                    <>
                      <span aria-hidden className="text-[var(--color-azafran)]">★</span>
                      <span className="font-semibold">
                        {Number(r.computed_rating).toFixed(1)}
                      </span>
                      <span className="text-xs text-[var(--color-carbon-soft)]">
                        · {r.review_count} {r.review_count === 1 ? 'reseña' : 'reseñas'}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs italic text-[var(--color-carbon-soft)]">
                      Sin reseñas aún
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
