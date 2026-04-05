import { fetchApi } from './client';
import { DishReview, MyReview, CreateReviewRequest, UpdateReviewRequest } from '../types';

export async function uploadReviewPhoto(dishId: string, file: File, displayOrder: number): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('entity_type', 'dish_cover');
  form.append('entity_id', dishId);
  form.append('display_order', String(displayOrder));
  const result = await fetchApi<{ url: string }>('/api/images/upload', { method: 'POST', body: form });
  return result.url;
}

export async function getReviews(dishId: string): Promise<DishReview[]> {
  return fetchApi<DishReview[]>(`/api/dishes/${dishId}/reviews`);
}

export async function createReview(
  dishId: string,
  data: CreateReviewRequest
): Promise<DishReview> {
  return fetchApi<DishReview>(`/api/dishes/${dishId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ dish_id: dishId, ...data }),
  });
}

export async function updateReview(
  reviewId: string,
  data: UpdateReviewRequest
): Promise<DishReview> {
  return fetchApi<DishReview>(`/api/dish-reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReview(reviewId: string): Promise<void> {
  return fetchApi<void>(`/api/dish-reviews/${reviewId}`, {
    method: 'DELETE',
  });
}

export async function getMyReviews(): Promise<MyReview[]> {
  return fetchApi<MyReview[]>('/api/users/me/reviews');
}
