import { Link } from '@/app/lib/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { DishDetail } from '@/app/lib/types/social';
import Breadcrumb from '@/app/components/ui/Breadcrumb';

interface DishHeroV2Props {
  dish: DishDetail;
  reviewsCount: number;
  photosCount: number;
  topTags?: string[];
  wouldOrderAgainPct?: number | null;
}

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

export default function DishHeroV2({
  dish,
  reviewsCount,
  photosCount,
  topTags,
  wouldOrderAgainPct,
}: DishHeroV2Props) {
  const t = useTranslations('dish.hero');
  const cover = dish.heroImage ?? dish.restaurantCoverUrl ?? null;
  const restaurantHref = dish.restaurantSlug
    ? `/restaurants/${encodeURIComponent(dish.restaurantSlug)}`
    : `/restaurants/${dish.restaurantId}`;
  const ratingOnTen = dish.averageScore * 2;
  const ratingDisplay = Number.isFinite(ratingOnTen) ? ratingOnTen.toFixed(1) : '—';
  const tone = scoreTone(Number.isFinite(ratingOnTen) ? ratingOnTen : 0);
  const tags = (topTags ?? []).filter(Boolean).slice(0, 3);
  const orderAgain =
    typeof wouldOrderAgainPct === 'number' && wouldOrderAgainPct > 0
      ? Math.round(wouldOrderAgainPct)
      : null;

  return (
    <section className="mb-10">
      <div className="relative h-[28rem] w-full overflow-hidden rounded-3xl border border-border-default bg-[var(--color-espresso)] shadow-elevated sm:h-[32rem] md:h-[34rem] dark:bg-[var(--neutral-100)]">
        {cover ? (
          <Image
            src={cover}
            alt={t('photoOf', { name: dish.name })}
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
              { label: dish.restaurantName, href: restaurantHref },
              { label: dish.name },
            ]}
          />
          {dish.isSignature && (
            <span
              className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] shadow-media ring-1 ring-[#E8BE7A]/70"
              style={{ background: 'rgba(214, 167, 92, 0.95)', color: '#2A211C' }}
              aria-label={t('signature')}
            >
              <span aria-hidden>★</span>
              {t('signature')}
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
                {dish.category && (
                  <p className="flex items-center gap-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-terracota-light)]">
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-terracota-light)]"
                    />
                    {dish.category}
                  </p>
                )}

                <h1
                  className="mt-2 font-display text-[clamp(2rem,5vw,3.75rem)] font-medium italic leading-[1.02] text-white"
                  style={{ textShadow: '0 2px 10px rgba(42, 33, 28, 0.6)' }}
                >
                  {dish.name}
                </h1>

                <p className="mt-2 font-sans text-base text-white/95">
                  <span className="font-display italic text-white/75">
                    {t('atRestaurant')}
                  </span>
                  <Link
                    href={restaurantHref}
                    className="font-medium decoration-[var(--color-terracota-light)] decoration-2 underline-offset-[6px] hover:underline"
                  >
                    {dish.restaurantName}
                  </Link>
                  {dish.restaurantLocationName ? (
                    <span className="text-white/75"> · {dish.restaurantLocationName}</span>
                  ) : null}
                </p>
              </div>

              <div
                className="flex shrink-0 items-baseline gap-2 md:flex-col md:items-end md:gap-1"
                aria-label={`Puntuación ${ratingDisplay} sobre 10`}
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
            </div>

            <div
              aria-hidden
              className="my-5 flex items-center gap-3"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <span
                className="inline-block h-1.5 w-1.5 rotate-45"
                style={{ background: 'var(--color-dorado-light)' }}
              />
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="text-[var(--color-dorado-light)]">
                  ★
                </span>
                {reviewsCount === 1
                  ? t('reviewOne', { count: reviewsCount })
                  : t('reviewMany', { count: reviewsCount })}
              </span>
              {orderAgain !== null && (
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="text-[var(--color-dorado-light)]">
                    ↻
                  </span>
                  {t('wouldOrderAgain', { pct: orderAgain })}
                </span>
              )}
              {photosCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-white/80">
                  <span aria-hidden>◇</span>
                  {photosCount === 1
                    ? t('photoOne', { count: photosCount })
                    : t('photoMany', { count: photosCount })}
                </span>
              )}
            </div>

            {(dish.priceRange || tags.length > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {dish.priceRange && (
                  <span className="rounded-full bg-white/12 px-3 py-1 font-sans text-xs font-medium tabular-nums text-white ring-1 ring-white/20 backdrop-blur">
                    {dish.priceRange}
                  </span>
                )}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--color-terracota)]/20 px-3 py-1 font-sans text-xs text-white ring-1 ring-[var(--color-terracota-light)]/45 backdrop-blur"
                  >
                    <span aria-hidden className="mr-0.5 text-[var(--color-terracota-light)]">
                      #
                    </span>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {(typeof dish.restaurantAverageRating === 'number' ||
              dish.createdByDisplayName) && (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-white/75">
                {typeof dish.restaurantAverageRating === 'number' && (
                  <span>
                    <span className="opacity-70">{t('venueLabel')}</span>{' '}
                    <span className="font-medium tabular-nums text-white/95">
                      {dish.restaurantAverageRating.toFixed(1)}
                    </span>
                  </span>
                )}
                {typeof dish.restaurantGoogleRating === 'number' && (
                  <span>
                    <span className="opacity-70">{t('googleLabel')}</span>{' '}
                    <span className="font-medium tabular-nums text-white/95">
                      {dish.restaurantGoogleRating.toFixed(1)}
                    </span>
                  </span>
                )}
                {dish.createdByDisplayName && (
                  <span>
                    <span className="opacity-70">{t('curatedBy')}</span>{' '}
                    <span className="font-medium italic text-white/95">
                      {dish.createdByDisplayName}
                    </span>
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
