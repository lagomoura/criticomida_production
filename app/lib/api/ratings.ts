import { fetchApi } from './client';
import { RatingDimensionKey, RestaurantRatingsResponse } from '../types';

export async function getRestaurantRatings(slug: string): Promise<RestaurantRatingsResponse> {
  return fetchApi<RestaurantRatingsResponse>(`/api/restaurants/${slug}/ratings`);
}

export async function setRestaurantRatings(
  slug: string,
  ratings: { dimension: RatingDimensionKey; score: number }[]
): Promise<void> {
  await fetchApi<unknown>(`/api/restaurants/${slug}/ratings`, {
    method: 'PUT',
    body: JSON.stringify(ratings),
  });
}
