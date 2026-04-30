import { fetchApi } from './client';
import type {
  RestaurantDetail,
  RestaurantListItem,
  CreateRestaurantRequest,
  CreateRestaurantResponse,
  MatchCandidatesResponse,
  RestaurantAggregates,
  RestaurantPhotosResponse,
  DiaryStats,
  SignatureDishesResponse,
  NearbyRestaurantsResponse,
} from '../types';
import { PaginatedResponse } from '../types/common';

export interface GetRestaurantsParams {
  category_slug?: string;
  search?: string;
  page?: number;
  per_page?: number;
  min_rating?: number;
  max_rating?: number;
}

export async function getRestaurants(
  params?: GetRestaurantsParams
): Promise<PaginatedResponse<RestaurantListItem>> {
  const searchParams = new URLSearchParams();

  if (params?.category_slug) searchParams.set('category_slug', params.category_slug);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.min_rating !== undefined) searchParams.set('min_rating', String(params.min_rating));
  if (params?.max_rating !== undefined) searchParams.set('max_rating', String(params.max_rating));

  const query = searchParams.toString();
  const endpoint = `/api/restaurants${query ? `?${query}` : ''}`;

  return fetchApi<PaginatedResponse<RestaurantListItem>>(endpoint);
}

export async function getRestaurant(slug: string): Promise<RestaurantDetail> {
  return fetchApi<RestaurantDetail>(`/api/restaurants/${slug}`);
}

export async function createRestaurant(
  data: CreateRestaurantRequest,
): Promise<CreateRestaurantResponse> {
  return fetchApi<CreateRestaurantResponse>('/api/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface UpdateRestaurantRequest {
  reservation_url?: string | null;
  reservation_provider?: string | null;
  reservation_partner_meta?: Record<string, unknown> | null;
}

export async function updateRestaurant(
  slug: string,
  data: UpdateRestaurantRequest,
): Promise<RestaurantDetail> {
  return fetchApi<RestaurantDetail>(`/api/restaurants/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export interface GetMatchCandidatesParams {
  name: string;
  lat: number;
  lng: number;
  excludePlaceId?: string;
}

export async function getMatchCandidates(
  params: GetMatchCandidatesParams,
): Promise<MatchCandidatesResponse> {
  const sp = new URLSearchParams({
    name: params.name,
    lat: String(params.lat),
    lng: String(params.lng),
  });
  if (params.excludePlaceId) sp.set('exclude_place_id', params.excludePlaceId);
  return fetchApi<MatchCandidatesResponse>(
    `/api/restaurants/match-candidates?${sp.toString()}`,
  );
}

export async function getRestaurantAggregates(slug: string): Promise<RestaurantAggregates> {
  return fetchApi<RestaurantAggregates>(`/api/restaurants/${slug}/aggregates`);
}

export interface GetRestaurantPhotosParams {
  limit?: number;
  cursor?: string;
}

export async function getRestaurantPhotos(
  slug: string,
  params?: GetRestaurantPhotosParams,
): Promise<RestaurantPhotosResponse> {
  const sp = new URLSearchParams();
  if (params?.limit !== undefined) sp.set('limit', String(params.limit));
  if (params?.cursor) sp.set('cursor', params.cursor);
  const query = sp.toString();
  return fetchApi<RestaurantPhotosResponse>(
    `/api/restaurants/${slug}/photos${query ? `?${query}` : ''}`,
  );
}

export async function getDiaryStats(slug: string): Promise<DiaryStats> {
  return fetchApi<DiaryStats>(`/api/restaurants/${slug}/diary-stats`);
}

export async function getSignatureDishes(
  slug: string,
  limit?: number,
): Promise<SignatureDishesResponse> {
  const query = limit !== undefined ? `?limit=${limit}` : '';
  return fetchApi<SignatureDishesResponse>(
    `/api/restaurants/${slug}/signature-dishes${query}`,
  );
}

export interface GetNearbyParams {
  radius_km?: number;
  limit?: number;
}

export async function getNearbyRestaurants(
  slug: string,
  params?: GetNearbyParams,
): Promise<NearbyRestaurantsResponse> {
  const sp = new URLSearchParams();
  if (params?.radius_km !== undefined) sp.set('radius_km', String(params.radius_km));
  if (params?.limit !== undefined) sp.set('limit', String(params.limit));
  const query = sp.toString();
  return fetchApi<NearbyRestaurantsResponse>(
    `/api/restaurants/${slug}/nearby${query ? `?${query}` : ''}`,
  );
}

export interface LogReservationClickInput {
  provider?: string | null;
  utm?: Record<string, string> | null;
  session_id?: string | null;
  referrer?: string | null;
}

const RESERVATION_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8002';

/** Logs a click on the "Reservar mesa" CTA. Uses fetch directly (instead of
 *  fetchApi) so we can pass `keepalive: true` — the browser keeps the request
 *  alive even after we navigate away to the partner's site. */
export async function logReservationClick(
  slug: string,
  body: LogReservationClickInput,
): Promise<void> {
  try {
    await fetch(`${RESERVATION_API_URL}/api/restaurants/${slug}/reservation-click`, {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    /* Click tracking failures must never block the user — the CTA still opens
     *  the partner URL. We swallow errors deliberately. */
  }
}
