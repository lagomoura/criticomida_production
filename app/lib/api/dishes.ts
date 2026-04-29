import { fetchApi } from './client';
import { Dish, CreateDishRequest, UpdateDishRequest } from '../types';

export interface DishSuggestion {
  id: string;
  name: string;
  reviewCount: number;
  similarity: number;
  isExactNormalized: boolean;
}

interface DishSuggestionDTO {
  id: string;
  name: string;
  review_count: number;
  similarity: number;
  is_exact_normalized: boolean;
}

interface DishSuggestionPageDTO {
  items: DishSuggestionDTO[];
}

/** Ask the backend whether `name` would duplicate an existing dish at this
 *  restaurant. Empty array = green light to create. Used by the compose flow
 *  to pop a "¿quisiste decir...?" modal before silently creating dupes. */
export async function suggestSimilarDishes(
  restaurantPlaceId: string,
  name: string,
): Promise<DishSuggestion[]> {
  const params = new URLSearchParams({
    restaurant_place_id: restaurantPlaceId,
    name,
    limit: '5',
  });
  const raw = await fetchApi<DishSuggestionPageDTO>(
    `/api/dishes/suggest-similar?${params.toString()}`,
  );
  return raw.items.map((dto) => ({
    id: dto.id,
    name: dto.name,
    reviewCount: dto.review_count,
    similarity: dto.similarity,
    isExactNormalized: dto.is_exact_normalized,
  }));
}

export async function getDishes(restaurantSlug: string): Promise<Dish[]> {
  return fetchApi<Dish[]>(`/api/restaurants/${restaurantSlug}/dishes`);
}

export async function getDish(dishId: string): Promise<Dish> {
  return fetchApi<Dish>(`/api/dishes/${dishId}`);
}

export async function createDish(
  restaurantSlug: string,
  data: CreateDishRequest
): Promise<Dish> {
  return fetchApi<Dish>(`/api/restaurants/${restaurantSlug}/dishes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDish(
  dishId: string,
  data: UpdateDishRequest
): Promise<Dish> {
  return fetchApi<Dish>(`/api/dishes/${dishId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
