import { fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import {
  mockGetUserProfile,
  mockGetUserPosts,
  mockGetFollowers,
  mockGetFollowing,
} from './_mocks/users';
import { toReviewPost, type FeedItemDTO } from './feed';
import type {
  CursorPage,
  FollowerSummary,
  MasteryLevel,
  PublicUserProfile,
  ReviewPost,
} from '@/app/lib/types/social';
import type { UpdateProfileRequest, User } from '@/app/lib/types/user';

/**
 * Backend wire format for the public profile endpoint (`GET /api/users/{id_or_handle}`).
 * Snake_case mirrors the rest of the FastAPI responses.
 */
interface CategoryStatDTO {
  name: string;
  review_count: number;
  avg_rating: number;
  score: number;
  mastery_level?: MasteryLevel | null;
}

interface FeaturedTitleDTO {
  category: string;
  level: MasteryLevel;
}

interface ReputationDTO {
  verified_review_count: number;
  restaurants_visited: number;
  top_categories: CategoryStatDTO[];
  featured_title?: FeaturedTitleDTO | null;
}

interface PublicUserResponseDTO {
  id: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  counts: { reviews: number; followers: number; following: number };
  reputation?: ReputationDTO;
  viewer_state: { is_self: boolean; following: boolean };
}

function toPublicUserProfile(dto: PublicUserResponseDTO): PublicUserProfile {
  return {
    id: dto.id,
    displayName: dto.display_name,
    handle: dto.handle,
    avatarUrl: dto.avatar_url,
    bio: dto.bio,
    location: dto.location,
    counts: dto.counts,
    reputation: dto.reputation
      ? {
          verifiedReviewCount: dto.reputation.verified_review_count,
          restaurantsVisited: dto.reputation.restaurants_visited,
          topCategories: dto.reputation.top_categories.map((c) => ({
            name: c.name,
            reviewCount: c.review_count,
            avgRating: c.avg_rating,
            score: c.score,
            masteryLevel: c.mastery_level ?? null,
          })),
          featuredTitle: dto.reputation.featured_title
            ? {
                category: dto.reputation.featured_title.category,
                level: dto.reputation.featured_title.level,
              }
            : null,
        }
      : undefined,
    // `is_self` and `following` come resolved from the backend when the caller
    // carries a session; PublicProfileClient still guards `is_self` locally so
    // mock mode (where the backend doesn't know the viewer) stays correct.
    viewerState: {
      isSelf: dto.viewer_state.is_self,
      following: dto.viewer_state.following,
    },
  };
}

export async function getUserProfile(idOrHandle: string): Promise<PublicUserProfile> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetUserProfile(idOrHandle);
  }
  const raw = await fetchApi<PublicUserResponseDTO>(
    `/api/users/${encodeURIComponent(idOrHandle)}`,
  );
  return toPublicUserProfile(raw);
}

export async function getUserPosts(
  userId: string,
  cursor?: string | null,
): Promise<CursorPage<ReviewPost>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetUserPosts(userId);
  }
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const raw = await fetchApi<{ items: FeedItemDTO[]; next_cursor: string | null }>(
    `/api/users/${encodeURIComponent(userId)}/reviews${params}`,
  );
  return {
    items: raw.items.map(toReviewPost),
    nextCursor: raw.next_cursor,
  };
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return fetchApi<User>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function followUser(userId: string): Promise<void> {
  if (isSocialMockEnabled()) {
    await mockDelay(300);
    return;
  }
  await fetchApi(`/api/users/${encodeURIComponent(userId)}/follow`, { method: 'POST' });
}

export async function unfollowUser(userId: string): Promise<void> {
  if (isSocialMockEnabled()) {
    await mockDelay(300);
    return;
  }
  await fetchApi(`/api/users/${encodeURIComponent(userId)}/follow`, { method: 'DELETE' });
}

interface FollowerSummaryDTO {
  id: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  viewer_following: boolean | null;
}

interface FollowersPageDTO {
  items: FollowerSummaryDTO[];
  next_cursor: string | null;
}

function toFollowerSummary(dto: FollowerSummaryDTO): FollowerSummary {
  return {
    id: dto.id,
    displayName: dto.display_name,
    handle: dto.handle,
    avatarUrl: dto.avatar_url,
    bio: dto.bio,
    createdAt: dto.created_at,
    viewerFollowing: dto.viewer_following,
  };
}

export async function getFollowers(
  idOrHandle: string,
  cursor?: string | null,
  limit = 20,
): Promise<CursorPage<FollowerSummary>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetFollowers(idOrHandle, cursor ?? null);
  }
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const raw = await fetchApi<FollowersPageDTO>(
    `/api/users/${encodeURIComponent(idOrHandle)}/followers?${params.toString()}`,
  );
  return { items: raw.items.map(toFollowerSummary), nextCursor: raw.next_cursor };
}

export async function getFollowing(
  idOrHandle: string,
  cursor?: string | null,
  limit = 20,
): Promise<CursorPage<FollowerSummary>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetFollowing(idOrHandle, cursor ?? null);
  }
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const raw = await fetchApi<FollowersPageDTO>(
    `/api/users/${encodeURIComponent(idOrHandle)}/following?${params.toString()}`,
  );
  return { items: raw.items.map(toFollowerSummary), nextCursor: raw.next_cursor };
}

export interface UserSuggestion {
  id: string;
  displayName: string;
  handle: string | null;
  avatarUrl: string | null;
  bio: string | null;
  /**
   * Cantidad de personas que el viewer ya sigue y que también siguen a este
   * candidato. Señal social principal (peso 3× en el score backend).
   */
  sharedFollowers: number;
  /**
   * Restaurantes donde tanto el viewer como el candidato reseñaron platos.
   * Señal de afinidad gastronómica.
   */
  sharedRestaurants: number;
}

interface UserSuggestionDTO {
  id: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  shared_followers: number;
  shared_restaurants: number;
}

interface UserSuggestionsPageDTO {
  items: UserSuggestionDTO[];
}

export async function getMyUserSuggestions(
  limit = 10,
): Promise<UserSuggestion[]> {
  if (isSocialMockEnabled()) {
    await mockDelay(300);
    return [];
  }
  const raw = await fetchApi<UserSuggestionsPageDTO>(
    `/api/users/me/suggestions?limit=${limit}`,
  );
  return raw.items.map((dto) => ({
    id: dto.id,
    displayName: dto.display_name,
    handle: dto.handle,
    avatarUrl: dto.avatar_url,
    bio: dto.bio,
    sharedFollowers: dto.shared_followers,
    sharedRestaurants: dto.shared_restaurants,
  }));
}
