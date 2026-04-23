import { fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import { mockGetUserProfile, mockGetUserPosts } from './_mocks/users';
import { toReviewPost, type FeedItemDTO } from './feed';
import type { CursorPage, PublicUserProfile, ReviewPost } from '@/app/lib/types/social';
import type { UpdateProfileRequest, User } from '@/app/lib/types/user';

/**
 * Backend wire format for the public profile endpoint (`GET /api/users/{id_or_handle}`).
 * Snake_case mirrors the rest of the FastAPI responses.
 */
interface PublicUserResponseDTO {
  id: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  counts: { reviews: number; followers: number; following: number };
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
