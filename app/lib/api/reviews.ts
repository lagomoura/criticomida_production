import { fetchApi } from './client';
import { DishReview, CreateReviewRequest, UpdateReviewRequest } from '../types';

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
