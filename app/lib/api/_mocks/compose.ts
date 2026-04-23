import type { AuthorSummary, ReviewExtras, ReviewPost } from '@/app/lib/types/social';
import { mockAddUserPost } from './feed';

export interface MockCreatePostInput {
  dishName: string;
  restaurantName: string;
  category?: string | null;
  score: number;
  text: string;
  extras?: ReviewExtras;
  author: AuthorSummary;
}

export function mockCreatePost(input: MockCreatePostInput): ReviewPost {
  const id = `local-${cryptoRandomId()}`;
  const dishId = `local-dish-${cryptoRandomId()}`;
  const restaurantId = `local-rest-${cryptoRandomId()}`;

  const post: ReviewPost = {
    id,
    createdAt: new Date().toISOString(),
    author: input.author,
    dish: {
      id: dishId,
      name: input.dishName,
      restaurantId,
      restaurantName: input.restaurantName,
      category: input.category ?? null,
    },
    score: input.score,
    text: input.text,
    stats: { likes: 0, comments: 0, saves: 0 },
    viewerState: { liked: false, saved: false },
    extras: normalizeExtras(input.extras),
  };

  mockAddUserPost(post);
  return post;
}

function normalizeExtras(extras: ReviewExtras | undefined): ReviewExtras | null {
  if (!extras) return null;
  const clean: ReviewExtras = {};
  if (extras.portionSize) clean.portionSize = extras.portionSize;
  if (extras.wouldOrderAgain !== undefined && extras.wouldOrderAgain !== null) {
    clean.wouldOrderAgain = extras.wouldOrderAgain;
  }
  if (extras.pros?.length) clean.pros = extras.pros;
  if (extras.cons?.length) clean.cons = extras.cons;
  if (extras.tags?.length) clean.tags = extras.tags;
  if (extras.dateTasted) clean.dateTasted = extras.dateTasted;
  if (extras.visitedWith) clean.visitedWith = extras.visitedWith;
  if (extras.isAnonymous) clean.isAnonymous = extras.isAnonymous;
  if (extras.priceTier) clean.priceTier = extras.priceTier;
  return Object.keys(clean).length > 0 ? clean : null;
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
