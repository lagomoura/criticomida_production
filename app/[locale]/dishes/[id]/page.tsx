import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  getDishDetail,
  getDishAggregates,
  getDishPhotos,
  getDishDiaryStats,
  getDishTimeline,
  getRelatedDishes,
  getDishReviews,
} from '@/app/lib/api/dishes-social';
import { ApiError } from '@/app/lib/api/client';
import DishHeroV2 from './components/DishHeroV2';
import DishPageClient from './components/DishPageClient';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.dish' });
  try {
    const dish = await getDishDetail(id, locale);
    const description =
      dish.editorialBlurb ||
      dish.description ||
      t('fallbackDescription', { name: dish.name, restaurant: dish.restaurantName });
    return {
      title: t('title', { name: dish.name, restaurant: dish.restaurantName }),
      description,
      openGraph: {
        title: t('ogTitle', { name: dish.name, restaurant: dish.restaurantName }),
        description,
        images: dish.heroImage
          ? [{ url: dish.heroImage }]
          : dish.restaurantCoverUrl
          ? [{ url: dish.restaurantCoverUrl }]
          : undefined,
        type: 'article',
      },
    };
  } catch {
    return { title: t('fallbackTitle') };
  }
}

export default async function DishDetailPage({ params }: PageProps) {
  const { id, locale } = await params;

  let dish;
  try {
    dish = await getDishDetail(id, locale);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const [
    aggregatesResult,
    photosResult,
    diaryResult,
    relatedResult,
    reviewsResult,
    timelineResult,
  ] = await Promise.allSettled([
    getDishAggregates(id),
    getDishPhotos(id, { limit: 24 }),
    getDishDiaryStats(id),
    getRelatedDishes(id, { limit: 6 }),
    getDishReviews(id),
    getDishTimeline(id),
  ]);

  const aggregates =
    aggregatesResult.status === 'fulfilled'
      ? aggregatesResult.value
      : {
          prosTop: [],
          consTop: [],
          tagsTop: [],
          ratingHistogram: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as Record<
            '1' | '2' | '3' | '4' | '5',
            number
          >,
          portionDistribution: { small: 0, medium: 0, large: 0, noAnswer: 0 },
          wouldOrderAgain: { yes: 0, no: 0, noAnswer: 0, pct: null },
          pillars: {
            presentation: { one: 0, two: 0, three: 0, answered: 0, avg: null },
            valueProp: { one: 0, two: 0, three: 0, answered: 0, avg: null },
            execution: { one: 0, two: 0, three: 0, answered: 0, avg: null },
          },
          photosCount: 0,
          uniqueEaters: 0,
        };

  const photos =
    photosResult.status === 'fulfilled' ? photosResult.value : { items: [], nextCursor: null };
  const diary =
    diaryResult.status === 'fulfilled'
      ? diaryResult.value
      : { uniqueEaters: 0, reviewsTotal: 0, reviewsLast7d: 0, recentEaters: [] };
  const related = relatedResult.status === 'fulfilled' ? relatedResult.value : [];
  const reviews =
    reviewsResult.status === 'fulfilled' ? reviewsResult.value : { items: [], nextCursor: null };
  const timeline =
    timelineResult.status === 'fulfilled'
      ? timelineResult.value
      : { granularity: 'quarter' as const, buckets: [] };

  return (
    <main id="main-content" className="cc-container px-4 pb-16 sm:px-6 lg:px-8">
      <DishHeroV2
        dish={dish}
        reviewsCount={dish.reviewCount}
        photosCount={aggregates.photosCount}
        topTags={aggregates.tagsTop.slice(0, 3).map((t) => t.tag)}
        wouldOrderAgainPct={dish.wouldOrderAgainPct ?? aggregates.wouldOrderAgain.pct}
      />
      <DishPageClient
        dish={dish}
        aggregates={aggregates}
        photos={photos.items}
        diary={diary}
        related={related}
        initialReviews={reviews.items}
        initialReviewsCursor={reviews.nextCursor}
        timeline={timeline}
      />
    </main>
  );
}
