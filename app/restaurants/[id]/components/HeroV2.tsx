import Link from 'next/link';
import Image from 'next/image';
import { RestaurantDetail } from '@/app/lib/types';
import OpenStatus from './OpenStatus';
import RestaurantActionsBar from './RestaurantActionsBar';
import DistanceBadge from './DistanceBadge';

interface HeroV2Props {
  restaurant: RestaurantDetail;
  dishesCount: number;
  reviewsCount: number;
  backHref: string;
  backLabel: string;
  /** Optional fallback cover (e.g. top signature dish photo) when the
   *  restaurant has no usable cover_image_url and no google_photos. */
  fallbackCoverUrl?: string | null;
}

const PRICE_LABEL = ['$', '$$', '$$$', '$$$$'];

export default function HeroV2({
  restaurant,
  dishesCount,
  reviewsCount,
  backHref,
  backLabel,
  fallbackCoverUrl,
}: HeroV2Props) {
  // Legacy cover_image_url often points to Google's JS SDK PhotoService URL
  // (place/js/PhotoService.GetPhoto?...token=...&callback=none), which is
  // session-bound and expires within minutes. Prefer the Places HTTP photo
  // URL we cached during Fase B enrichment when present.
  const isStaleJsSdkUrl = (url: string | null | undefined) =>
    !!url && url.includes('/maps/api/place/js/PhotoService');
  const googleCover = restaurant.google_photos?.find((g) => g.url)?.url ?? null;
  // Hierarchy of cover sources:
  //   1. restaurant.cover_image_url (unless it's a stale JS SDK URL and we have
  //      a fresh google_photos URL that supersedes it)
  //   2. google_photos[0].url (Fase B Places HTTP API, persistent)
  //   3. fallbackCoverUrl (e.g. top signature dish photo)
  const cover = isStaleJsSdkUrl(restaurant.cover_image_url) && googleCover
    ? null
    : restaurant.cover_image_url;
  const dishFallback =
    !cover && !googleCover && !isStaleJsSdkUrl(fallbackCoverUrl)
      ? fallbackCoverUrl ?? null
      : null;
  const rating = Number(restaurant.computed_rating ?? 0);
  const ratingTone = rating >= 9 ? 'text-[var(--color-albahaca)]' : 'text-[var(--color-azafran)]';
  const priceLabel =
    typeof restaurant.price_level === 'number' && restaurant.price_level >= 1
      ? PRICE_LABEL[Math.min(restaurant.price_level, 4) - 1]
      : null;

  return (
    <section className="relative -mx-4 mb-8 sm:-mx-6 lg:-mx-8">
      <div className="relative h-72 w-full overflow-hidden bg-[var(--color-carbon)] sm:h-[22rem] md:h-[26rem]">
        {cover ? (
          <Image
            src={cover}
            alt={`Foto de ${restaurant.name}`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : googleCover && !cover ? (
          <>
            {/* Google photo URLs are external and follow a 302 redirect.
                next/image would require host whitelisting; plain <img> is the
                pragmatic choice here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={googleCover}
              alt={`Foto de ${restaurant.name}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </>
        ) : dishFallback ? (
          <Image
            src={dishFallback}
            alt={`Foto de ${restaurant.name}`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-canela)] to-[var(--color-carbon)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-[var(--color-carbon)]" />

        <Link
          href={backHref}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-[var(--color-carbon)] no-underline shadow-sm backdrop-blur transition hover:bg-white sm:left-6 sm:top-6"
        >
          <span aria-hidden>←</span>
          {backLabel}
        </Link>

        <div className="cc-container absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/85">
            {restaurant.category && (
              <Link
                href={`/categorias/${restaurant.category.slug}`}
                className="rounded-full bg-[var(--color-azafran)] px-3 py-1 text-white no-underline transition hover:bg-[var(--color-canela)]"
              >
                {restaurant.category.name}
              </Link>
            )}
            {restaurant.cuisine_types?.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-full bg-white/15 px-3 py-1 capitalize backdrop-blur"
              >
                {c.replace(/_/g, ' ')}
              </span>
            ))}
            {priceLabel && (
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                {priceLabel}
              </span>
            )}
            <OpenStatus openingHours={restaurant.opening_hours} />
            <DistanceBadge
              latitude={restaurant.latitude !== null ? Number(restaurant.latitude) : null}
              longitude={restaurant.longitude !== null ? Number(restaurant.longitude) : null}
            />
          </div>

          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] text-white sm:text-5xl md:text-6xl">
            {restaurant.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>📍</span>
              {restaurant.location_name}
            </span>
            {rating > 0 && (
              <span className="inline-flex items-baseline gap-1.5" title="Promedio CritiComida">
                <span aria-hidden className="text-[var(--color-azafran-light)]">★</span>
                <span className={`text-2xl font-semibold ${ratingTone === 'text-[var(--color-albahaca)]' ? 'text-[var(--color-albahaca-light)]' : 'text-[var(--color-azafran-light)]'}`}>
                  {rating.toFixed(1)}
                </span>
                <span className="text-white/70">
                  · {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
                </span>
              </span>
            )}
            {restaurant.google_rating !== null && restaurant.google_rating !== undefined && (
              <span
                className="inline-flex items-baseline gap-1.5 border-l border-white/20 pl-5 text-white/70"
                title="Promedio en Google Maps"
              >
                <span aria-hidden>G</span>
                <span className="font-semibold text-white/90">
                  {Number(restaurant.google_rating).toFixed(1)}
                </span>
                {typeof restaurant.google_user_ratings_total === 'number' && (
                  <span className="text-white/60">
                    ({restaurant.google_user_ratings_total.toLocaleString('es-AR')})
                  </span>
                )}
              </span>
            )}
            {dishesCount > 0 && (
              <span className="text-white/80">
                · {dishesCount} {dishesCount === 1 ? 'plato' : 'platos'} reseñados
              </span>
            )}
          </div>

          {restaurant.creator && (
            <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
              <span>Curado por</span>
              <Link
                href={`/u/${restaurant.creator.id}`}
                className="font-semibold text-white no-underline hover:underline"
              >
                {restaurant.creator.display_name}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="cc-container relative -mt-3 px-4 sm:px-6 lg:px-8">
        <RestaurantActionsBar
          restaurantSlug={restaurant.slug}
          restaurantName={restaurant.name}
          googleMapsUrl={restaurant.google_maps_url}
        />
      </div>
    </section>
  );
}
