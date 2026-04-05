import { fetchApi } from './client';
import type { RestaurantDetail, RestaurantListItem, CreateRestaurantRequest } from '../types';
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
