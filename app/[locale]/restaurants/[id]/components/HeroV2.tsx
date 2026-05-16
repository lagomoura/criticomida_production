import { Link } from '@/app/lib/i18n/navigation';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { RestaurantDetail } from '@/app/lib/types';
import Breadcrumb from '@/app/components/ui/Breadcrumb';
import OpenStatus from './OpenStatus';
import RestaurantActionsBar from './RestaurantActionsBar';
import DistanceBadge from './DistanceBadge';
import RestaurantCategoryEditor from '@/app/components/admin/RestaurantCategoryEditor';

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

function scoreTone(value: number) {
  if (value >= 9)
    return {
      number: 'text-[var(--color-dorado-light)]',
      accent: 'var(--color-dorado)',
    };
  if (value >= 7)
    return {
      number: 'text-[var(--color-terracota-light)]',
      accent: 'var(--color-terracota)',
    };
  return { number: 'text-white/90', accent: 'rgba(255,255,255,0.45)' };
}

export default function HeroV2({
  restaurant,
  dishesCount,
  reviewsCount,
  backHref,
  backLabel,
  fallbackCoverUrl,
}: HeroV2Props) {
  const t = useTranslations('restaurant.hero');
  const locale = useLocale();
  // Legacy cover_image_url often points to Google's JS SDK PhotoService URL
  // (place/js/PhotoService.GetPhoto?...token=...&callback=none), which is
  // session-bound and expires within minutes. Prefer the Places HTTP photo
  // URL we cached during Fase B enrichment when present.
  const isStaleJsSdkUrl = (url: string | null | undefined) =>
    !!url && url.includes('/maps/api/place/js/PhotoService');
  // Verified owners suben fotos oficiales que tienen prioridad sobre cualquier
  // fuente externa — son la voz oficial del local.
  const officialCover = restaurant.official_photos?.[0]?.url ?? null;
  const googleCover = restaurant.google_photos?.find((g) => g.url)?.url ?? null;
  // Hierarchy of cover sources:
  //   1. official_photos[0].url (verified owner upload — highest authority)
  //   2. restaurant.cover_image_url (unless it's a stale JS SDK URL and we have
  //      a fresh google_photos URL that supersedes it)
  //   3. google_photos[0].url (Fase B Places HTTP API, persistent)
  //   4. fallbackCoverUrl (e.g. top signature dish photo)
  const cover = officialCover
    ? officialCover
    : isStaleJsSdkUrl(restaurant.cover_image_url) && googleCover
      ? null
      : restaurant.cover_image_url;
  const dishFallback =
    !cover && !googleCover && !isStaleJsSdkUrl(fallbackCoverUrl)
      ? fallbackCoverUrl ?? null
      : null;
  const rating = Number(restaurant.computed_rating ?? 0);
  // computed_rating ya viene en escala 0–10 (igual que RatingPill), así que se
  // usa directo sin multiplicar por 2 (a diferencia del plato).
  const ratingDisplay = rating > 0 && Number.isFinite(rating) ? rating.toFixed(1) : '—';
  const tone = scoreTone(Number.isFinite(rating) ? rating : 0);
  const priceLabel =
    typeof restaurant.price_level === 'number' && restaurant.price_level >= 1
      ? PRICE_LABEL[Math.min(restaurant.price_level, 4) - 1]
      : null;
  const cuisines = restaurant.cuisine_types?.slice(0, 3) ?? [];
  const googleRating =
    restaurant.google_rating !== null && restaurant.google_rating !== undefined
      ? Number(restaurant.google_rating)
      : null;

  return (
    <section className="mb-10">
      <div className="relative h-[28rem] w-full overflow-hidden rounded-3xl border border-border-default bg-[var(--color-espresso)] shadow-elevated sm:h-[32rem] md:h-[34rem] dark:bg-[var(--neutral-100)]">
        {cover ? (
          <Image
            src={cover}
            alt={t('photoOf', { name: restaurant.name })}
            fill
            sizes="(min-width: 1024px) 72rem, 100vw"
            priority
            className="object-cover"
            unoptimized
          />
        ) : googleCover && !cover ? (
          <>
            {/* Google photo URLs are external and follow a 302 redirect.
                next/image would require host whitelisting; plain <img> is the
                pragmatic choice here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={googleCover}
              alt={t('photoOf', { name: restaurant.name })}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </>
        ) : dishFallback ? (
          <Image
            src={dishFallback}
            alt={t('photoOf', { name: restaurant.name })}
            fill
            sizes="(min-width: 1024px) 72rem, 100vw"
            priority
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-terracota-pale)] to-[var(--color-terracota-deep)]/40" />
        )}

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background:
              'linear-gradient(to bottom, rgba(20, 14, 10, 0.78) 0%, rgba(20, 14, 10, 0.30) 55%, transparent 100%)',
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
          style={{
            background:
              'linear-gradient(to top, rgba(20, 14, 10, 0.96) 0%, rgba(20, 14, 10, 0.72) 45%, transparent 100%)',
          }}
        />

        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 mix-blend-soft-light blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, var(--color-terracota-light) 0%, transparent 65%)',
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-32 -bottom-32 h-80 w-80 rounded-full opacity-40 mix-blend-soft-light blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, var(--color-dorado) 0%, transparent 70%)',
          }}
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
          <Breadcrumb
            tone="on-dark"
            items={[
              { label: backLabel, href: backHref },
              { label: restaurant.name },
            ]}
          />
          {restaurant.is_claimed && (
            <span
              className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] shadow-media ring-1 ring-[#E8BE7A]/70"
              style={{ background: 'rgba(214, 167, 92, 0.95)', color: '#2A211C' }}
              title={t('verifiedTitle')}
              aria-label={t('verifiedBadge')}
            >
              <span aria-hidden>✓</span>
              {t('verifiedBadge')}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 sm:px-5 sm:pb-5">
          <div
            className="relative overflow-hidden rounded-2xl px-5 py-5 backdrop-blur-md ring-1 ring-[var(--color-dorado)]/30 sm:px-7 sm:py-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(20, 14, 10, 0.78) 0%, rgba(28, 20, 15, 0.72) 50%, rgba(42, 33, 28, 0.68) 100%)',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-full w-[3px]"
              style={{
                background:
                  'linear-gradient(180deg, var(--color-dorado) 0%, var(--color-terracota) 100%)',
              }}
            />

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
              <div className="min-w-0 flex-1">
                {restaurant.category && (
                  <p className="flex items-center gap-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-terracota-light)]">
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-terracota-light)]"
                    />
                    <Link
                      href={`/categorias/${restaurant.category.slug}`}
                      className="hover:underline"
                    >
                      {restaurant.category.name}
                    </Link>
                    <RestaurantCategoryEditor
                      restaurantSlug={restaurant.slug}
                      restaurantName={restaurant.name}
                      currentCategoryId={restaurant.category?.id ?? null}
                    />
                  </p>
                )}

                <h1
                  className="mt-2 font-display text-[clamp(2rem,5vw,3.75rem)] font-medium italic leading-[1.02] text-white"
                  style={{ textShadow: '0 2px 10px rgba(42, 33, 28, 0.6)' }}
                >
                  {restaurant.name}
                </h1>

                {restaurant.location_name && (
                  <p className="mt-2 font-sans text-base text-white/95">
                    {restaurant.location_name}
                  </p>
                )}
              </div>

              {rating > 0 && (
                <div
                  className="flex shrink-0 items-baseline gap-2 md:flex-col md:items-end md:gap-1"
                  aria-label={`Puntuación ${ratingDisplay} sobre 10`}
                  title={t('averageTitle')}
                >
                  <span
                    className={`font-display text-[clamp(3rem,7vw,5rem)] font-medium leading-none tabular-nums ${tone.number}`}
                    style={{
                      textShadow: '0 2px 14px rgba(42, 33, 28, 0.55)',
                    }}
                  >
                    {ratingDisplay}
                  </span>
                  <span className="font-sans text-sm font-medium uppercase tracking-[0.18em] text-white/65">
                    /10
                  </span>
                </div>
              )}
            </div>

            <div aria-hidden className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <span
                className="inline-block h-1.5 w-1.5 rotate-45"
                style={{ background: 'var(--color-dorado-light)' }}
              />
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-sm text-white/90">
              {rating > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="text-[var(--color-dorado-light)]">
                    ★
                  </span>
                  {reviewsCount === 1
                    ? t('reviewOne', { count: reviewsCount })
                    : t('reviewMany', { count: reviewsCount })}
                </span>
              )}
              {googleRating !== null && (
                <span
                  className="inline-flex items-center gap-1.5 text-white/80"
                  title={t('googleAverageTitle')}
                >
                  <span aria-hidden>G</span>
                  <span className="font-medium tabular-nums text-white/95">
                    {googleRating.toFixed(1)}
                  </span>
                  {typeof restaurant.google_user_ratings_total === 'number' && (
                    <span className="text-white/60">
                      ({restaurant.google_user_ratings_total.toLocaleString(locale)})
                    </span>
                  )}
                </span>
              )}
              {dishesCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-white/80">
                  <span aria-hidden>◇</span>
                  {dishesCount === 1
                    ? t('dishesOne', { count: dishesCount })
                    : t('dishesMany', { count: dishesCount })}
                </span>
              )}
            </div>

            {(priceLabel || cuisines.length > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {priceLabel && (
                  <span className="rounded-full bg-white/12 px-3 py-1 font-sans text-xs font-medium tabular-nums text-white ring-1 ring-white/20 backdrop-blur">
                    {priceLabel}
                  </span>
                )}
                {cuisines.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-[var(--color-terracota)]/20 px-3 py-1 font-sans text-xs capitalize text-white ring-1 ring-[var(--color-terracota-light)]/45 backdrop-blur"
                  >
                    <span aria-hidden className="mr-0.5 text-[var(--color-terracota-light)]">
                      #
                    </span>
                    {c.replace(/_/g, ' ')}
                  </span>
                ))}
                <OpenStatus openingHours={restaurant.opening_hours} />
                <DistanceBadge
                  latitude={restaurant.latitude !== null ? Number(restaurant.latitude) : null}
                  longitude={
                    restaurant.longitude !== null ? Number(restaurant.longitude) : null
                  }
                />
              </div>
            )}

            {restaurant.creator && (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-white/75">
                <span>
                  <span className="opacity-70">{t('curatedBy')}</span>{' '}
                  <Link
                    href={`/u/${restaurant.creator.id}`}
                    className="font-medium italic text-white/95 hover:underline"
                  >
                    {restaurant.creator.display_name}
                  </Link>
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-4 mb-2">
        <RestaurantActionsBar
          restaurantSlug={restaurant.slug}
          restaurantName={restaurant.name}
          googleMapsUrl={restaurant.google_maps_url}
          reservationUrl={restaurant.reservation_url}
          reservationProvider={restaurant.reservation_provider}
        />
      </div>
    </section>
  );
}
