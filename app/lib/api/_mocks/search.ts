import type {
  DishSearchResult,
  RestaurantSearchResult,
  UserSearchResult,
} from '@/app/lib/types/social';
import { mockFeed } from './feed';
import { mockGetUserProfile } from './users';

const norm = (s: string) => s.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function matches(haystack: string, needle: string): boolean {
  return norm(haystack).includes(norm(needle));
}

export function mockSearchDishes(query: string): DishSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const feed = mockFeed({ type: 'for_you' }).items;
  const byDishId = new Map<string, DishSearchResult>();

  for (const post of feed) {
    const hit =
      matches(post.dish.name, q) ||
      matches(post.dish.restaurantName, q) ||
      (post.dish.category ? matches(post.dish.category, q) : false);
    if (!hit) continue;

    const existing = byDishId.get(post.dish.id);
    if (!existing) {
      byDishId.set(post.dish.id, {
        id: post.dish.id,
        name: post.dish.name,
        restaurantId: post.dish.restaurantId,
        restaurantName: post.dish.restaurantName,
        category: post.dish.category ?? null,
        averageScore: post.score,
        reviewCount: 1,
      });
    } else {
      const next = existing.reviewCount + 1;
      byDishId.set(post.dish.id, {
        ...existing,
        averageScore:
          Math.round(((existing.averageScore * existing.reviewCount + post.score) / next) * 10) / 10,
        reviewCount: next,
      });
    }
  }
  return Array.from(byDishId.values());
}

export function mockSearchRestaurants(query: string): RestaurantSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const feed = mockFeed({ type: 'for_you' }).items;
  const byRestaurantId = new Map<string, RestaurantSearchResult>();

  for (const post of feed) {
    const hit =
      matches(post.dish.restaurantName, q) ||
      (post.dish.category ? matches(post.dish.category, q) : false);
    if (!hit) continue;

    const existing = byRestaurantId.get(post.dish.restaurantId);
    if (!existing) {
      byRestaurantId.set(post.dish.restaurantId, {
        id: post.dish.restaurantId,
        name: post.dish.restaurantName,
        category: post.dish.category ?? null,
        dishCount: 1,
      });
    } else {
      byRestaurantId.set(post.dish.restaurantId, {
        ...existing,
        dishCount: existing.dishCount + 1,
      });
    }
  }
  return Array.from(byRestaurantId.values());
}

const KNOWN_USER_IDS = [
  'user-mica',
  'user-juli',
  'user-caro',
  'user-tomi',
  'user-ana',
  'user-dani',
  'user-lucia',
  'user-pedro',
  'user-sol',
];

export function mockSearchUsers(query: string): UserSearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const results: UserSearchResult[] = [];
  for (const id of KNOWN_USER_IDS) {
    const profile = mockGetUserProfile(id);
    if (
      matches(profile.displayName, q) ||
      (profile.handle ? matches(profile.handle, q) : false) ||
      (profile.bio ? matches(profile.bio, q) : false)
    ) {
      results.push({
        id: profile.id,
        displayName: profile.displayName,
        handle: profile.handle,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        followers: profile.counts.followers,
      });
    }
  }
  return results;
}
