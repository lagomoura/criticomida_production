import { fetchApi } from './client';
import { DishReview, CreateReviewRequest, UpdateReviewRequest } from '../types';

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

/** Reviews del plato hechas por un usuario, ordenadas por `date_tasted` ASC.
 * Cuando hay varias el mismo día, se conserva sólo la de `created_at` más
 * reciente (regla de "misma jornada = corrección, no evolución").
 * Normaliza `rating` y `price_paid` a number — el backend los serializa como
 * string (Decimal) aunque el tipo diga `number`. */
export async function getMyReviewsForDish(
  dishId: string,
  userId: string,
): Promise<DishReview[]> {
  const all = await getReviews(dishId);
  const mine = all.filter((r) => r.user_id === userId).map(normalizeReviewNumbers);
  const byDay = new Map<string, DishReview>();
  for (const review of mine) {
    const day = review.date_tasted;
    const existing = byDay.get(day);
    if (!existing || review.created_at > existing.created_at) {
      byDay.set(day, review);
    }
  }
  return Array.from(byDay.values()).sort((a, b) =>
    a.date_tasted < b.date_tasted ? -1 : a.date_tasted > b.date_tasted ? 1 : 0,
  );
}

function normalizeReviewNumbers(review: DishReview): DishReview {
  return {
    ...review,
    rating: Number(review.rating),
    price_paid: review.price_paid != null ? Number(review.price_paid) : null,
  };
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
