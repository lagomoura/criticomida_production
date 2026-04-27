import Link from 'next/link';
import Image from 'next/image';
import type { DishDetail } from '@/app/lib/types/social';

interface DishHeroV2Props {
  dish: DishDetail;
  reviewsCount: number;
  photosCount: number;
}

export default function DishHeroV2({ dish, reviewsCount, photosCount }: DishHeroV2Props) {
  const cover = dish.heroImage ?? dish.restaurantCoverUrl ?? null;
  const ratingTone =
    dish.averageScore >= 4.5 ? 'text-[var(--color-albahaca)]' : 'text-[var(--color-azafran)]';
  const restaurantHref = dish.restaurantSlug
    ? `/restaurants/${encodeURIComponent(dish.restaurantSlug)}`
    : `/restaurants/${dish.restaurantId}`;

  return (
    <section className="relative -mx-4 mb-8 sm:-mx-6 lg:-mx-8">
      <div className="relative h-72 w-full overflow-hidden bg-[var(--color-carbon)] sm:h-[22rem] md:h-[26rem]">
        {cover ? (
          <Image
            src={cover}
            alt={`Foto de ${dish.name}`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-azafran-pale)] to-[var(--color-canela)]/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-carbon)]/85 via-[var(--color-carbon)]/30 to-transparent" />

        <Link
          href={restaurantHref}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--color-carbon)] no-underline shadow-sm backdrop-blur transition hover:bg-white"
        >
          ← {dish.restaurantName}
        </Link>

        <div className="cc-container absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {dish.isSignature && (
              <span className="rounded-full bg-[var(--color-azafran)] px-3 py-1 font-semibold uppercase tracking-wider text-white">
                Plato firma
              </span>
            )}
            {dish.category && (
              <span className="rounded-full bg-white/85 px-3 py-1 font-semibold text-[var(--color-carbon)]">
                {dish.category}
              </span>
            )}
            {dish.priceRange && (
              <span className="rounded-full bg-white/85 px-3 py-1 font-semibold tabular-nums text-[var(--color-canela)]">
                {dish.priceRange}
              </span>
            )}
          </div>

          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium leading-tight text-white drop-shadow sm:text-5xl md:text-6xl">
            {dish.name}
          </h1>

          <p className="mt-2 text-base text-white/90">
            en{' '}
            <Link
              href={restaurantHref}
              className="font-semibold underline-offset-4 hover:underline"
            >
              {dish.restaurantName}
            </Link>
            {dish.restaurantLocationName ? (
              <span className="text-white/70"> · {dish.restaurantLocationName}</span>
            ) : null}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-[family-name:var(--font-display)] text-5xl font-medium tabular-nums ${ratingTone} drop-shadow`}
              >
                {dish.averageScore.toFixed(1)}
              </span>
              <span className="text-sm text-white/85">
                / 5 · {reviewsCount} reseñas
              </span>
            </div>

            {typeof dish.restaurantAverageRating === 'number' && (
              <div className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[var(--color-carbon-soft)]">
                Local: {dish.restaurantAverageRating.toFixed(1)}
                {typeof dish.restaurantGoogleRating === 'number'
                  ? ` · Google ${dish.restaurantGoogleRating.toFixed(1)}`
                  : null}
              </div>
            )}

            {photosCount > 0 && (
              <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-carbon)]">
                {photosCount} fotos
              </div>
            )}
          </div>

          {dish.createdByDisplayName && (
            <p className="mt-3 text-xs text-white/70">
              Curado por <span className="font-semibold">{dish.createdByDisplayName}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
