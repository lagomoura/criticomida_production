import { fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import {
  mockSearchDishes,
  mockSearchRestaurants,
  mockSearchUsers,
} from './_mocks/search';
import type {
  DishSearchResult,
  RestaurantSearchResult,
  UserSearchResult,
} from '@/app/lib/types/social';

export type SearchEntity = 'dishes' | 'restaurants' | 'users';

export interface SearchResults {
  dishes: DishSearchResult[];
  restaurants: RestaurantSearchResult[];
  users: UserSearchResult[];
}

/** Backend wire formats (snake_case). */
interface DishSearchResultDTO {
  id: string;
  name: string;
  restaurant_id: string;
  restaurant_name: string;
  category: string | null;
  average_score: number;
  review_count: number;
}

interface RestaurantSearchResultDTO {
  id: string;
  name: string;
  category: string | null;
  dish_count: number;
}

interface UserSearchResultDTO {
  id: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers: number;
}

interface SearchResponseDTO {
  dishes: DishSearchResultDTO[];
  restaurants: RestaurantSearchResultDTO[];
  users: UserSearchResultDTO[];
}

function toDishResult(dto: DishSearchResultDTO): DishSearchResult {
  return {
    id: dto.id,
    name: dto.name,
    restaurantId: dto.restaurant_id,
    restaurantName: dto.restaurant_name,
    category: dto.category,
    averageScore: dto.average_score,
    reviewCount: dto.review_count,
  };
}

function toRestaurantResult(dto: RestaurantSearchResultDTO): RestaurantSearchResult {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    dishCount: dto.dish_count,
  };
}

function toUserResult(dto: UserSearchResultDTO): UserSearchResult {
  return {
    id: dto.id,
    displayName: dto.display_name,
    handle: dto.handle,
    avatarUrl: dto.avatar_url,
    bio: dto.bio,
    followers: dto.followers,
  };
}

export async function searchAll(query: string): Promise<SearchResults> {
  if (isSocialMockEnabled()) {
    await mockDelay(200);
    return {
      dishes: mockSearchDishes(query),
      restaurants: mockSearchRestaurants(query),
      users: mockSearchUsers(query),
    };
  }
  const params = new URLSearchParams({ q: query });
  const raw = await fetchApi<SearchResponseDTO>(`/api/search?${params.toString()}`);
  return {
    dishes: raw.dishes.map(toDishResult),
    restaurants: raw.restaurants.map(toRestaurantResult),
    users: raw.users.map(toUserResult),
  };
}
