import { ApiError, fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import {
  mockGetDishDetail,
  mockGetDishReviews,
  mockGetDishAggregates,
  mockGetDishPhotos,
  mockGetDishDiaryStats,
  mockGetRelatedDishes,
} from './_mocks/dishes-social';
import { toReviewPost, type FeedItemDTO, type FeedPageDTO } from './feed';
import type {
  CursorPage,
  DishAggregates,
  DishDetail,
  DishDiaryStats,
  DishFirstDiscoverer,
  DishPhotosPage,
  DishTimeline,
  DishTimelineBucket,
  RelatedDishItem,
  ReviewPost,
} from '@/app/lib/types/social';

interface DishSocialDetailDTO {
  id: string;
  name: string;
  description: string | null;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  restaurant_location_name: string | null;
  restaurant_cover_url: string | null;
  restaurant_average_rating: number | string | null;
  restaurant_google_rating: number | string | null;
  restaurant_latitude: number | string | null;
  restaurant_longitude: number | string | null;
  category: string | null;
  cuisine_types: string[] | null;
  hero_image: string | null;
  average_score: number;
  review_count: number;
  would_order_again_pct: number | null;
  price_range: string | null;
  is_signature: boolean;
  editorial_blurb: string | null;
  editorial_source: string | null;
  editorial_origin: string | null;
  created_by_display_name: string | null;
  want_to_try?: boolean;
  first_discoverers?: FirstDiscovererDTO[];
}

interface FirstDiscovererDTO {
  rank: 1 | 2 | 3;
  user_id: string;
  handle: string | null;
  display_name: string | null;
  avatar_url: string | null;
  discovered_at: string;
  review_id: string;
}

interface DishTimelineBucketDTO {
  period: string;
  review_count: number;
  avg_rating: number | string;
  presentation_avg: number | null;
  value_prop_avg: number | null;
  execution_avg: number | null;
  delta_rating: number | string | null;
  price_avg: number | null;
  delta_price_avg: number | null;
}

interface DishTimelineDTO {
  granularity: 'quarter' | 'month';
  buckets: DishTimelineBucketDTO[];
  currency_code: string | null;
}

interface DishPillarBreakdownDTO {
  one: number;
  two: number;
  three: number;
  answered: number;
  avg: number | null;
}

interface DishAggregatesDTO {
  pros_top: { text: string; count: number }[];
  cons_top: { text: string; count: number }[];
  tags_top: { tag: string; count: number }[];
  rating_histogram: Record<string, number>;
  portion_distribution: Record<string, number>;
  would_order_again: { yes: number; no: number; no_answer: number; pct: number | null };
  pillars: {
    presentation: DishPillarBreakdownDTO;
    value_prop: DishPillarBreakdownDTO;
    execution: DishPillarBreakdownDTO;
  };
  photos_count: number;
  unique_eaters: number;
}

interface DishPhotosPageDTO {
  items: {
    id: string;
    url: string;
    alt_text: string | null;
    taken_at: string | null;
    dish_id: string;
    dish_name: string | null;
    review_id: string | null;
    user_id: string | null;
    user_handle: string | null;
    user_display_name: string | null;
    is_cover: boolean;
  }[];
  next_cursor: string | null;
}

interface DishDiaryStatsDTO {
  unique_eaters: number;
  reviews_total: number;
  reviews_last_7d: number;
  recent_eaters: {
    id: string;
    handle: string | null;
    display_name: string | null;
    avatar_url: string | null;
  }[];
}

interface RelatedDishesDTO {
  items: {
    id: string;
    name: string;
    cover_image_url: string | null;
    computed_rating: number | string;
    review_count: number;
    price_tier: '$' | '$$' | '$$$' | null;
    restaurant_id: string;
    restaurant_slug: string;
    restaurant_name: string;
    restaurant_location: string;
    restaurant_city: string | null;
  }[];
}

function toNumberOrNull(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDishDetail(dto: DishSocialDetailDTO): DishDetail {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    restaurantId: dto.restaurant_id,
    restaurantName: dto.restaurant_name,
    restaurantSlug: dto.restaurant_slug,
    restaurantLocationName: dto.restaurant_location_name,
    restaurantCoverUrl: dto.restaurant_cover_url,
    restaurantAverageRating: toNumberOrNull(dto.restaurant_average_rating),
    restaurantGoogleRating: toNumberOrNull(dto.restaurant_google_rating),
    restaurantLatitude: toNumberOrNull(dto.restaurant_latitude),
    restaurantLongitude: toNumberOrNull(dto.restaurant_longitude),
    category: dto.category,
    cuisineTypes: dto.cuisine_types,
    heroImage: dto.hero_image,
    averageScore: dto.average_score,
    reviewCount: dto.review_count,
    wouldOrderAgainPct: dto.would_order_again_pct ?? undefined,
    priceRange: dto.price_range,
    isSignature: dto.is_signature,
    editorialBlurb: dto.editorial_blurb,
    editorialSource: dto.editorial_source,
    editorialOrigin: dto.editorial_origin,
    createdByDisplayName: dto.created_by_display_name,
    wantToTry: dto.want_to_try ?? false,
    firstDiscoverers: (dto.first_discoverers ?? []).map(
      (d): DishFirstDiscoverer => ({
        rank: d.rank,
        userId: d.user_id,
        handle: d.handle,
        displayName: d.display_name,
        avatarUrl: d.avatar_url,
        discoveredAt: d.discovered_at,
        reviewId: d.review_id,
      }),
    ),
  };
}

function toDishTimeline(dto: DishTimelineDTO): DishTimeline {
  return {
    granularity: dto.granularity,
    currencyCode: dto.currency_code ?? null,
    buckets: dto.buckets.map(
      (b): DishTimelineBucket => ({
        period: b.period,
        reviewCount: b.review_count,
        avgRating: typeof b.avg_rating === 'number' ? b.avg_rating : Number(b.avg_rating),
        presentationAvg: b.presentation_avg,
        valuePropAvg: b.value_prop_avg,
        executionAvg: b.execution_avg,
        deltaRating:
          b.delta_rating == null
            ? null
            : typeof b.delta_rating === 'number'
              ? b.delta_rating
              : Number(b.delta_rating),
        priceAvg: b.price_avg,
        deltaPriceAvg: b.delta_price_avg,
      }),
    ),
  };
}

function toAggregates(dto: DishAggregatesDTO): DishAggregates {
  const histogram: Record<'1' | '2' | '3' | '4' | '5', number> = {
    '1': dto.rating_histogram['1'] ?? 0,
    '2': dto.rating_histogram['2'] ?? 0,
    '3': dto.rating_histogram['3'] ?? 0,
    '4': dto.rating_histogram['4'] ?? 0,
    '5': dto.rating_histogram['5'] ?? 0,
  };
  return {
    prosTop: dto.pros_top,
    consTop: dto.cons_top,
    tagsTop: dto.tags_top,
    ratingHistogram: histogram,
    portionDistribution: {
      small: dto.portion_distribution.small ?? 0,
      medium: dto.portion_distribution.medium ?? 0,
      large: dto.portion_distribution.large ?? 0,
      noAnswer: dto.portion_distribution.no_answer ?? 0,
    },
    wouldOrderAgain: {
      yes: dto.would_order_again.yes,
      no: dto.would_order_again.no,
      noAnswer: dto.would_order_again.no_answer,
      pct: dto.would_order_again.pct,
    },
    pillars: {
      presentation: dto.pillars?.presentation ?? emptyPillar,
      valueProp: dto.pillars?.value_prop ?? emptyPillar,
      execution: dto.pillars?.execution ?? emptyPillar,
    },
    photosCount: dto.photos_count,
    uniqueEaters: dto.unique_eaters,
  };
}

const emptyPillar = { one: 0, two: 0, three: 0, answered: 0, avg: null };

function toPhotosPage(dto: DishPhotosPageDTO): DishPhotosPage {
  return {
    items: dto.items.map((p) => ({
      id: p.id,
      url: p.url,
      altText: p.alt_text,
      takenAt: p.taken_at,
      dishId: p.dish_id,
      dishName: p.dish_name,
      reviewId: p.review_id,
      userId: p.user_id,
      userHandle: p.user_handle,
      userDisplayName: p.user_display_name,
      isCover: p.is_cover,
    })),
    nextCursor: dto.next_cursor,
  };
}

function toDiaryStats(dto: DishDiaryStatsDTO): DishDiaryStats {
  return {
    uniqueEaters: dto.unique_eaters,
    reviewsTotal: dto.reviews_total,
    reviewsLast7d: dto.reviews_last_7d,
    recentEaters: dto.recent_eaters.map((u) => ({
      id: u.id,
      handle: u.handle,
      displayName: u.display_name,
      avatarUrl: u.avatar_url,
    })),
  };
}

function toRelatedDishes(dto: RelatedDishesDTO): RelatedDishItem[] {
  return dto.items.map((it) => ({
    id: it.id,
    name: it.name,
    coverImageUrl: it.cover_image_url,
    computedRating: typeof it.computed_rating === 'number' ? it.computed_rating : Number(it.computed_rating),
    reviewCount: it.review_count,
    priceTier: it.price_tier,
    restaurantId: it.restaurant_id,
    restaurantSlug: it.restaurant_slug,
    restaurantName: it.restaurant_name,
    restaurantLocation: it.restaurant_location,
    restaurantCity: it.restaurant_city,
  }));
}

export async function getDishDetail(
  dishId: string,
  lang?: string,
): Promise<DishDetail> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    const detail = mockGetDishDetail(dishId);
    if (!detail) throw new ApiError(404, 'Dish not found');
    return detail;
  }
  const qs = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const dto = await fetchApi<DishSocialDetailDTO>(
    `/api/social/dishes/${encodeURIComponent(dishId)}${qs}`,
  );
  return toDishDetail(dto);
}

export async function getDishReviews(
  dishId: string,
  cursor?: string | null,
): Promise<CursorPage<ReviewPost>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetDishReviews(dishId);
  }
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const raw = await fetchApi<FeedPageDTO>(
    `/api/social/dishes/${encodeURIComponent(dishId)}/reviews${params}`,
  );
  return {
    items: raw.items.map(toReviewPost),
    nextCursor: raw.next_cursor,
  };
}

export async function getDishAggregates(dishId: string): Promise<DishAggregates> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetDishAggregates(dishId);
  }
  const dto = await fetchApi<DishAggregatesDTO>(
    `/api/social/dishes/${encodeURIComponent(dishId)}/aggregates`,
  );
  return toAggregates(dto);
}

export async function getDishPhotos(
  dishId: string,
  opts?: { limit?: number; cursor?: string | null },
): Promise<DishPhotosPage> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetDishPhotos(dishId);
  }
  const params = new URLSearchParams();
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.cursor) params.set('cursor', opts.cursor);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const dto = await fetchApi<DishPhotosPageDTO>(
    `/api/social/dishes/${encodeURIComponent(dishId)}/photos${qs}`,
  );
  return toPhotosPage(dto);
}

export async function getDishDiaryStats(dishId: string): Promise<DishDiaryStats> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetDishDiaryStats(dishId);
  }
  const dto = await fetchApi<DishDiaryStatsDTO>(
    `/api/social/dishes/${encodeURIComponent(dishId)}/diary-stats`,
  );
  return toDiaryStats(dto);
}

export async function getDishTimeline(
  dishId: string,
  opts?: { granularity?: 'quarter' | 'month' },
): Promise<DishTimeline> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    // Mock vacío hasta que se implemente — la UI muestra el estado vacío.
    return { granularity: opts?.granularity ?? 'quarter', buckets: [] };
  }
  const granularity = opts?.granularity ?? 'quarter';
  const dto = await fetchApi<DishTimelineDTO>(
    `/api/social/dishes/${encodeURIComponent(dishId)}/timeline?granularity=${granularity}`,
  );
  return toDishTimeline(dto);
}

export async function getRelatedDishes(
  dishId: string,
  opts?: { limit?: number },
): Promise<RelatedDishItem[]> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetRelatedDishes(dishId);
  }
  const params = opts?.limit ? `?limit=${opts.limit}` : '';
  const dto = await fetchApi<RelatedDishesDTO>(
    `/api/social/dishes/${encodeURIComponent(dishId)}/related${params}`,
  );
  return toRelatedDishes(dto);
}

export type { FeedItemDTO };
