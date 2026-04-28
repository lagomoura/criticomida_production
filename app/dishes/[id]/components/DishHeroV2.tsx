import Link from 'next/link';
import Image from 'next/image';
import type { DishDetail } from '@/app/lib/types/social';
import RatingPill from '@/app/components/ui/RatingPill';
import Breadcrumb from '@/app/components/ui/Breadcrumb';

interface DishHeroV2Props {
  dish: DishDetail;
  reviewsCount: number;
  photosCount: number;
}

export default function DishHeroV2({ dish, reviewsCount, photosCount }: DishHeroV2Props) {
  const cover = dish.heroImage ?? dish.restaurantCoverUrl ?? null;
  const restaurantHref = dish.restaurantSlug
    ? `/restaurants/${encodeURIComponent(dish.restaurantSlug)}`
    : `/restaurants/${dish.restaurantId}`;
  // Convert from /5 scale to /10 scale used by RatingPill tone thresholds.
  const ratingOnTen = dish.averageScore * 2;

  return (
    <section className="relative -mx-4 mb-8 sm:-mx-6 lg:-mx-8">
      <div className="relative h-80 w-full overflow-hidden bg-[var(--color-carbon)] sm:h-[24rem] md:h-[28rem]">
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
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-azafran-pale)] to-[var(--color-canela)]/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-carbon)]/90 via-[var(--color-carbon)]/35 to-transparent" />

        <div className="absolute inset-x-0 top-0 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
          <Breadcrumb
            tone="on-dark"
            items={[
              { label: dish.restaurantName, href: restaurantHref },
              { label: dish.name },
            ]}
          />
        </div>

        <div className="cc-container absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          {dish.isSignature && (
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-azafran-light)]">
              El de la casa
            </p>
          )}

          <h1 className="mt-2 font-display text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium italic leading-[1.02] text-white">
            {dish.name}
          </h1>

          <p className="mt-2 font-sans text-base text-white/90">
            <span className="font-display italic text-white/80">en </span>
            <Link
              href={restaurantHref}
              className="font-medium underline-offset-4 hover:underline"
            >
              {dish.restaurantName}
            </Link>
            {dish.restaurantLocationName ? (
              <span className="text-white/65"> · {dish.restaurantLocationName}</span>
            ) : null}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <RatingPill value={ratingOnTen} size="lg" />
            <span className="font-sans text-sm text-white/80">
              {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
            </span>
            {dish.category && (
              <span className="rounded-full bg-white/15 px-3 py-1 font-sans text-xs font-medium text-white backdrop-blur">
                {dish.category}
              </span>
            )}
            {dish.priceRange && (
              <span className="rounded-full bg-white/15 px-3 py-1 font-sans text-xs font-medium tabular-nums text-white backdrop-blur">
                {dish.priceRange}
              </span>
            )}
            {photosCount > 0 && (
              <span className="font-sans text-xs text-white/70">
                {photosCount} {photosCount === 1 ? 'foto' : 'fotos'}
              </span>
            )}
          </div>

          {typeof dish.restaurantAverageRating === 'number' && (
            <p className="mt-3 font-sans text-xs text-white/70">
              <span className="opacity-80">Local:</span>{' '}
              <span className="font-medium text-white/90 tabular-nums">
                {dish.restaurantAverageRating.toFixed(1)}
              </span>
              {typeof dish.restaurantGoogleRating === 'number' && (
                <>
                  {' · '}
                  <span className="opacity-80">Google:</span>{' '}
                  <span className="font-medium text-white/90 tabular-nums">
                    {dish.restaurantGoogleRating.toFixed(1)}
                  </span>
                </>
              )}
            </p>
          )}

          {dish.createdByDisplayName && (
            <p className="mt-3 font-sans text-xs text-white/65">
              Curado por <span className="font-medium text-white/85">{dish.createdByDisplayName}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
