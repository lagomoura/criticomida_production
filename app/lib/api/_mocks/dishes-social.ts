import type { CursorPage, DishDetail, ReviewPost } from '@/app/lib/types/social';
import { mockFeed } from './feed';

/**
 * Fallback hero imagery keyed by dish id. Falls back to the first media on the
 * most recent review if available.
 */
const HERO_OVERRIDES: Record<string, string> = {
  'dish-001': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1600&q=70',
  'dish-004': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=70',
  'dish-008': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1600&q=70',
};

function reviewsForDish(dishId: string): ReviewPost[] {
  const feed = mockFeed({ type: 'for_you' });
  return feed.items.filter((p) => p.dish.id === dishId);
}

export function mockGetDishDetail(dishId: string): DishDetail | null {
  const reviews = reviewsForDish(dishId);
  if (reviews.length === 0) return null;

  const totalScore = reviews.reduce((sum, r) => sum + r.score, 0);
  const averageScore = Math.round((totalScore / reviews.length) * 10) / 10;
  const wouldOrderAgainPct = Math.round(
    (reviews.filter((r) => r.score >= 3.5).length / reviews.length) * 100,
  );

  const first = reviews[0];
  const heroFromReview = first.media && first.media.length > 0 ? first.media[0].url : null;

  return {
    id: first.dish.id,
    name: first.dish.name,
    restaurantId: first.dish.restaurantId,
    restaurantName: first.dish.restaurantName,
    category: first.dish.category ?? null,
    heroImage: HERO_OVERRIDES[dishId] ?? heroFromReview ?? null,
    averageScore,
    reviewCount: reviews.length,
    wouldOrderAgainPct,
    priceRange: null,
  };
}

export function mockGetDishReviews(dishId: string): CursorPage<ReviewPost> {
  return { items: reviewsForDish(dishId), nextCursor: null };
}
