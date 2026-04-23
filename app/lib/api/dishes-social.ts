import { ApiError, fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import { mockGetDishDetail, mockGetDishReviews } from './_mocks/dishes-social';
import type { CursorPage, DishDetail, ReviewPost } from '@/app/lib/types/social';

export async function getDishDetail(dishId: string): Promise<DishDetail> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    const detail = mockGetDishDetail(dishId);
    if (!detail) throw new ApiError(404, 'Dish not found');
    return detail;
  }
  return fetchApi<DishDetail>(`/api/dishes/${encodeURIComponent(dishId)}`);
}

export async function getDishReviews(
  dishId: string,
  cursor?: string | null,
): Promise<CursorPage<ReviewPost>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetDishReviews(dishId);
  }
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return fetchApi<CursorPage<ReviewPost>>(
    `/api/dishes/${encodeURIComponent(dishId)}/reviews${params}`,
  );
}
