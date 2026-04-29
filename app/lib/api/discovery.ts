import { fetchApi } from './client';
import type {
  DiscoveryDishItem,
  DiscoveryDishPage,
  DiscoverySort,
  DishDuel,
  PriceTier,
} from '@/app/lib/types/social';

interface DiscoveryPillarStatsDTO {
  presentation_avg: number | null;
  presentation_n: number;
  value_prop_avg: number | null;
  value_prop_n: number;
  execution_avg: number | null;
  execution_n: number;
}

interface DiscoveryDishItemDTO {
  dish_id: string;
  dish_name: string;
  cover_image_url: string | null;
  price_tier: PriceTier | null;
  computed_rating: number | string;
  review_count: number;
  geek_score: number;
  pillars: DiscoveryPillarStatsDTO;
  distance_km: number | null;
  restaurant_id: string;
  restaurant_slug: string;
  restaurant_name: string;
  restaurant_city: string | null;
  category: string | null;
  want_to_try: boolean;
}

interface DiscoveryDishPageDTO {
  items: DiscoveryDishItemDTO[];
}

interface DishDuelDTO {
  category: string | null;
  items: DiscoveryDishItemDTO[];
}

function toItem(dto: DiscoveryDishItemDTO): DiscoveryDishItem {
  return {
    dishId: dto.dish_id,
    dishName: dto.dish_name,
    coverImageUrl: dto.cover_image_url,
    priceTier: dto.price_tier,
    computedRating:
      typeof dto.computed_rating === 'number'
        ? dto.computed_rating
        : Number(dto.computed_rating),
    reviewCount: dto.review_count,
    geekScore: dto.geek_score,
    pillars: {
      presentationAvg: dto.pillars.presentation_avg,
      presentationN: dto.pillars.presentation_n,
      valuePropAvg: dto.pillars.value_prop_avg,
      valuePropN: dto.pillars.value_prop_n,
      executionAvg: dto.pillars.execution_avg,
      executionN: dto.pillars.execution_n,
    },
    distanceKm: dto.distance_km,
    restaurantId: dto.restaurant_id,
    restaurantSlug: dto.restaurant_slug,
    restaurantName: dto.restaurant_name,
    restaurantCity: dto.restaurant_city,
    category: dto.category,
    wantToTry: dto.want_to_try,
  };
}

export interface DiscoverParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: DiscoverySort;
  category?: string;
  limit?: number;
  offset?: number;
}

export async function discoverDishes(
  params: DiscoverParams = {},
): Promise<DiscoveryDishPage> {
  const qs = new URLSearchParams();
  if (params.lat !== undefined) qs.set('lat', String(params.lat));
  if (params.lng !== undefined) qs.set('lng', String(params.lng));
  if (params.radiusKm !== undefined) qs.set('radius_km', String(params.radiusKm));
  if (params.sort) qs.set('sort', params.sort);
  if (params.category) qs.set('category', params.category);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.offset !== undefined) qs.set('offset', String(params.offset));

  const raw = await fetchApi<DiscoveryDishPageDTO>(
    `/api/dishes/discover${qs.toString() ? `?${qs}` : ''}`,
  );
  return { items: raw.items.map(toItem) };
}

export interface DishDuelParams {
  category: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export async function getDishDuel(params: DishDuelParams): Promise<DishDuel> {
  const qs = new URLSearchParams({ category: params.category });
  if (params.lat !== undefined) qs.set('lat', String(params.lat));
  if (params.lng !== undefined) qs.set('lng', String(params.lng));
  if (params.radiusKm !== undefined) qs.set('radius_km', String(params.radiusKm));

  const raw = await fetchApi<DishDuelDTO>(`/api/dishes/duel?${qs}`);
  return { category: raw.category, items: raw.items.map(toItem) };
}
