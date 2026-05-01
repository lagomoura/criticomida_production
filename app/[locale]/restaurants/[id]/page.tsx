import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getRestaurant,
  getRestaurantAggregates,
  getRestaurantPhotos,
  getDiaryStats,
  getSignatureDishes,
  getNearbyRestaurants,
} from '@/app/lib/api/restaurants';
import { getDishes } from '@/app/lib/api/dishes';
import { getReviews } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { Dish, DishReview } from '@/app/lib/types';
import HeroV2 from './components/HeroV2';
import RestaurantPageClient from './components/RestaurantPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slug } = await params;
  try {
    const r = await getRestaurant(slug);
    const description =
      r.description ??
      `${r.name} en ${r.location_name} · CritiComida — reseñas, platos firma, fotos y horarios.`;
    return {
      title: `${r.name} · CritiComida`,
      description,
      openGraph: {
        title: `${r.name} · CritiComida`,
        description,
        images: r.cover_image_url ? [{ url: r.cover_image_url }] : undefined,
        type: 'website',
      },
    };
  } catch {
    return { title: 'Restaurante · CritiComida' };
  }
}

export default async function RestaurantDetailPage({ params }: PageProps) {
  const { id: slug } = await params;

  let restaurant;
  try {
    restaurant = await getRestaurant(slug);
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
    signatureResult,
    dishesResult,
    nearbyResult,
  ] = await Promise.allSettled([
    getRestaurantAggregates(slug),
    getRestaurantPhotos(slug, { limit: 24 }),
    getDiaryStats(slug),
    getSignatureDishes(slug, 4),
    getDishes(slug),
    getNearbyRestaurants(slug, { radius_km: 3, limit: 6 }),
  ]);

  const aggregates =
    aggregatesResult.status === 'fulfilled'
      ? aggregatesResult.value
      : {
          pros_top: [],
          cons_top: [],
          dimension_averages: {},
          photos_count: 0,
          dishes_count: 0,
          reviews_count: restaurant.review_count,
        };

  const photos =
    photosResult.status === 'fulfilled' ? photosResult.value : { items: [], next_cursor: null };
  const diaryStats =
    diaryResult.status === 'fulfilled'
      ? diaryResult.value
      : { unique_visitors: 0, visits_total: 0, visits_last_7d: 0, most_ordered_dish: null, recent_visitors: [] };
  const signatureDishes =
    signatureResult.status === 'fulfilled' ? signatureResult.value.items : [];
  const nearby = nearbyResult.status === 'fulfilled' ? nearbyResult.value.items : [];
  const dishes: Dish[] = dishesResult.status === 'fulfilled' ? dishesResult.value : [];

  const dishesWithReviews = await Promise.all(
    dishes.map(async (dish) => {
      try {
        const reviews = await getReviews(dish.id);
        return { dish, reviews };
      } catch {
        return { dish, reviews: [] as DishReview[] };
      }
    }),
  );

  const categorySlug = restaurant.category?.slug ?? '';
  const categoryLabel = restaurant.category?.name ?? 'inicio';
  const backHref = categorySlug ? `/categorias/${categorySlug}` : '/';
  const backLabel = categoryLabel;

  // When restaurant has no cover and no Google photos, use the top signature
  // dish photo (or any dish with an image) so the hero never falls back to
  // the empty gradient on restaurants with rich dish data.
  const fallbackCoverUrl =
    signatureDishes.find((d) => d.cover_image_url)?.cover_image_url ??
    dishes.find((d) => d.cover_image_url)?.cover_image_url ??
    null;

  return (
    <main id="main-content" className="cc-container px-4 pb-16 sm:px-6 lg:px-8">
      <HeroV2
        restaurant={restaurant}
        dishesCount={dishesWithReviews.length || aggregates.dishes_count}
        reviewsCount={aggregates.reviews_count || restaurant.review_count}
        backHref={backHref}
        backLabel={backLabel}
        fallbackCoverUrl={fallbackCoverUrl}
      />
      <RestaurantPageClient
        restaurant={restaurant}
        initialDishes={dishesWithReviews}
        aggregates={aggregates}
        photos={photos.items}
        photosTotal={aggregates.photos_count || photos.items.length}
        diaryStats={diaryStats}
        signatureDishes={signatureDishes}
        nearby={nearby}
      />
    </main>
  );
}
