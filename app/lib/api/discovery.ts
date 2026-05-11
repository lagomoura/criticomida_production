import { fetchApi } from './client';
import type {
  DiscoveryDishItem,
  DiscoveryDishPage,
  DiscoverySort,
  DishDuel,
  DuelFallbackReason,
  DuelFamily,
  DuelPillar,
  DuelRoot,
  PriceTier,
} from '@/app/lib/types/social';
import type {
  BboxQuery,
  MapBboxResponse,
  MapDishHighlight,
  MapRestaurantPin,
} from '@/app/lib/types/discovery';

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
  root: string | null;
  family: string | null;
  pillar: DuelPillar | null;
  items: DiscoveryDishItemDTO[];
  fallback_reason: DuelFallbackReason | null;
}

interface DuelRootItemDTO {
  root: string;
  restaurant_count: number;
  recent_reviews: number;
  sample_name: string;
}

interface DuelRootsResponseDTO {
  items: DuelRootItemDTO[];
}

interface DuelFamilyItemDTO {
  family: string;
  restaurant_count: number;
  recent_reviews: number;
  sample_name: string;
}

interface DuelFamiliesResponseDTO {
  items: DuelFamilyItemDTO[];
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
  /** Familia semántica (ej. "burger"). Default del rail nuevo. */
  family?: string;
  /** Raíz exacta del plato (ej. "sorrentinos"). Más estricto que family. */
  root?: string;
  /** Pilar a duelar. Default backend: 'value_prop'. */
  pillar?: DuelPillar;
  /** Filtro adicional opcional por categoría de restaurante (slug). */
  category?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export async function getDishDuel(params: DishDuelParams = {}): Promise<DishDuel> {
  const qs = new URLSearchParams();
  if (params.family) qs.set('family', params.family);
  if (params.root) qs.set('root', params.root);
  if (params.pillar) qs.set('pillar', params.pillar);
  if (params.category) qs.set('category', params.category);
  if (params.lat !== undefined) qs.set('lat', String(params.lat));
  if (params.lng !== undefined) qs.set('lng', String(params.lng));
  if (params.radiusKm !== undefined) qs.set('radius_km', String(params.radiusKm));

  const raw = await fetchApi<DishDuelDTO>(
    `/api/dishes/duel${qs.toString() ? `?${qs}` : ''}`,
  );
  return {
    category: raw.category,
    root: raw.root,
    family: raw.family,
    pillar: raw.pillar,
    items: raw.items.map(toItem),
    fallbackReason: raw.fallback_reason,
  };
}

export interface DuelFamiliesParams {
  category?: string;
  limit?: number;
  minRestaurants?: number;
  recentDays?: number;
}

export async function getDuelFamilies(
  params: DuelFamiliesParams = {},
): Promise<DuelFamily[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.minRestaurants !== undefined)
    qs.set('min_restaurants', String(params.minRestaurants));
  if (params.recentDays !== undefined)
    qs.set('recent_days', String(params.recentDays));

  const raw = await fetchApi<DuelFamiliesResponseDTO>(
    `/api/dishes/duel/families${qs.toString() ? `?${qs}` : ''}`,
  );
  return raw.items.map((it) => ({
    family: it.family,
    restaurantCount: it.restaurant_count,
    recentReviews: it.recent_reviews,
    sampleName: it.sample_name,
  }));
}

export interface DuelRootsParams {
  category?: string;
  limit?: number;
  minRestaurants?: number;
  recentDays?: number;
}

export async function getDuelRoots(
  params: DuelRootsParams = {},
): Promise<DuelRoot[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.minRestaurants !== undefined)
    qs.set('min_restaurants', String(params.minRestaurants));
  if (params.recentDays !== undefined)
    qs.set('recent_days', String(params.recentDays));

  const raw = await fetchApi<DuelRootsResponseDTO>(
    `/api/dishes/duel/roots${qs.toString() ? `?${qs}` : ''}`,
  );
  return raw.items.map((it) => ({
    root: it.root,
    restaurantCount: it.restaurant_count,
    recentReviews: it.recent_reviews,
    sampleName: it.sample_name,
  }));
}

interface MapDishHighlightDTO {
  dish_id: string;
  name: string;
  cover_image_url: string | null;
  execution_avg: number | null;
  value_prop_avg: number | null;
  presentation_avg: number | null;
  review_count: number;
  geek_score: number;
}

interface MapRestaurantPinDTO {
  restaurant_id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  top_geek_score: number;
  has_chef_badge: boolean;
  has_gem_badge: boolean;
  cover_image_url: string | null;
  location_name: string | null;
  computed_rating: number;
  review_count: number;
  price_level: number | null;
  cuisine_types: string[] | null;
  category_name: string | null;
  trending_count: number;
  is_empty: boolean;
  golden_dish: MapDishHighlightDTO | null;
  best_value_dish: MapDishHighlightDTO | null;
}

interface MapBboxResponseDTO {
  items: MapRestaurantPinDTO[];
  truncated: boolean;
}

function toHighlight(dto: MapDishHighlightDTO | null): MapDishHighlight | null {
  if (dto === null) return null;
  return {
    dishId: dto.dish_id,
    name: dto.name,
    coverImageUrl: dto.cover_image_url,
    executionAvg: dto.execution_avg,
    valuePropAvg: dto.value_prop_avg,
    presentationAvg: dto.presentation_avg,
    reviewCount: dto.review_count,
    geekScore: dto.geek_score,
  };
}

function toPin(dto: MapRestaurantPinDTO): MapRestaurantPin {
  return {
    restaurantId: dto.restaurant_id,
    slug: dto.slug,
    name: dto.name,
    latitude: dto.latitude,
    longitude: dto.longitude,
    topGeekScore: dto.top_geek_score,
    hasChefBadge: dto.has_chef_badge,
    hasGemBadge: dto.has_gem_badge,
    coverImageUrl: dto.cover_image_url,
    locationName: dto.location_name,
    computedRating: dto.computed_rating,
    reviewCount: dto.review_count,
    priceLevel: dto.price_level,
    cuisineTypes: dto.cuisine_types,
    categoryName: dto.category_name,
    trendingCount: dto.trending_count,
    isEmpty: dto.is_empty,
    goldenDish: toHighlight(dto.golden_dish),
    bestValueDish: toHighlight(dto.best_value_dish),
  };
}

export async function getRestaurantsInBbox(
  bbox: BboxQuery,
  signal?: AbortSignal,
): Promise<MapBboxResponse> {
  const qs = new URLSearchParams({
    min_lat: String(bbox.minLat),
    min_lng: String(bbox.minLng),
    max_lat: String(bbox.maxLat),
    max_lng: String(bbox.maxLng),
  });
  if (bbox.limit !== undefined) qs.set('limit', String(bbox.limit));
  if (bbox.sort) qs.set('sort', bbox.sort);
  if (bbox.includeEmpty) qs.set('include_empty', 'true');
  if (bbox.chefOnly) qs.set('chef_only', 'true');

  const raw = await fetchApi<MapBboxResponseDTO>(
    `/api/restaurants/in-bbox?${qs}`,
    { signal },
  );
  return { items: raw.items.map(toPin), truncated: raw.truncated };
}
