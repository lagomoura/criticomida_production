import { fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import { toReviewPost, type FeedItemDTO } from './feed';
import { toFollowerSummary, type FollowersPageDTO } from './users';
import type {
  CursorPage,
  FollowerSummary,
  ReviewPost,
} from '@/app/lib/types/social';

/**
 * Like/save are optimistic in the UI — these helpers just hit the network
 * so the caller can roll back on failure. In mock mode they just delay.
 */
export async function likePost(postId: string): Promise<void> {
  if (isSocialMockEnabled()) {
    await mockDelay(200);
    return;
  }
  await fetchApi(`/api/reviews/${encodeURIComponent(postId)}/like`, { method: 'POST' });
}

export async function unlikePost(postId: string): Promise<void> {
  if (isSocialMockEnabled()) {
    await mockDelay(200);
    return;
  }
  await fetchApi(`/api/reviews/${encodeURIComponent(postId)}/like`, { method: 'DELETE' });
}

export async function savePost(postId: string): Promise<void> {
  if (isSocialMockEnabled()) {
    await mockDelay(200);
    return;
  }
  await fetchApi(`/api/reviews/${encodeURIComponent(postId)}/save`, { method: 'POST' });
}

export async function unsavePost(postId: string): Promise<void> {
  if (isSocialMockEnabled()) {
    await mockDelay(200);
    return;
  }
  await fetchApi(`/api/reviews/${encodeURIComponent(postId)}/save`, { method: 'DELETE' });
}

/**
 * Users who liked a post, newest first. Reuses the followers `FollowerSummary`
 * shape (the backend returns the same schema) so the UI can render it with the
 * same row component. In mock mode there is no liker store → empty list.
 */
export async function getPostLikers(
  postId: string,
  cursor?: string | null,
  limit = 20,
): Promise<CursorPage<FollowerSummary>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return { items: [], nextCursor: null };
  }
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const raw = await fetchApi<FollowersPageDTO>(
    `/api/reviews/${encodeURIComponent(postId)}/likers?${params.toString()}`,
  );
  return { items: raw.items.map(toFollowerSummary), nextCursor: raw.next_cursor };
}

interface BookmarksPageDTO {
  items: FeedItemDTO[];
  next_cursor: string | null;
}

export async function getMyBookmarks(
  cursor?: string | null,
  limit = 20,
): Promise<CursorPage<ReviewPost>> {
  if (isSocialMockEnabled()) {
    await mockDelay(300);
    // No mock store for bookmarks yet — return empty so the page shows its
    // empty state cleanly during offline dev.
    return { items: [], nextCursor: null };
  }
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const raw = await fetchApi<BookmarksPageDTO>(`/api/users/me/bookmarks?${params.toString()}`);
  return {
    items: raw.items.map(toReviewPost),
    nextCursor: raw.next_cursor,
  };
}
