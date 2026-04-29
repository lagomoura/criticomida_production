import { fetchApi } from './client';
import { Dish, CreateDishRequest, UpdateDishRequest } from '../types';

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
