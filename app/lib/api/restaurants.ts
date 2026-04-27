import { fetchApi } from './client';
import type {
  RestaurantDetail,
  RestaurantListItem,
  CreateRestaurantRequest,
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

export async function createRestaurant(data: CreateRestaurantRequest): Promise<RestaurantDetail> {
  return fetchApi<RestaurantDetail>('/api/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
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
