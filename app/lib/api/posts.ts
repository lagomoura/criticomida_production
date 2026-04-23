import { ApiError, fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import { mockCreateComment, mockGetComments, mockGetPost } from './_mocks/posts';
import { toReviewPost, type FeedItemDTO } from './feed';
import type { Comment, CursorPage, ReviewPost } from '@/app/lib/types/social';

/** Backend wire format for comment list / create responses. */
interface CommentDTO {
  id: string;
  review_id: string;
  created_at: string;
  author: {
    id: string;
    display_name: string;
    handle: string | null;
    avatar_url: string | null;
  };
  body: string;
  can_delete: boolean;
  can_report: boolean;
}

interface CommentsPageDTO {
  items: CommentDTO[];
  next_cursor: string | null;
}

function toComment(dto: CommentDTO): Comment {
  return {
    id: dto.id,
    reviewId: dto.review_id,
    createdAt: dto.created_at,
    author: {
      id: dto.author.id,
      displayName: dto.author.display_name,
      handle: dto.author.handle,
      avatarUrl: dto.author.avatar_url,
    },
    text: dto.body,
    canDelete: dto.can_delete,
    canReport: dto.can_report,
  };
}

export async function getPost(id: string): Promise<ReviewPost> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    const post = mockGetPost(id);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    return post;
  }
  const raw = await fetchApi<FeedItemDTO>(`/api/reviews/${encodeURIComponent(id)}`);
  return toReviewPost(raw);
}

/** FeedItemDTO is re-exported purely so other modules don't need to import
 * the feed module's internals when they already use posts.ts helpers. */
export type { FeedItemDTO };

export async function getComments(
  postId: string,
  cursor?: string | null,
): Promise<CursorPage<Comment>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetComments(postId);
  }
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const raw = await fetchApi<CommentsPageDTO>(
    `/api/reviews/${encodeURIComponent(postId)}/comments${params}`,
  );
  return {
    items: raw.items.map(toComment),
    nextCursor: raw.next_cursor,
  };
}

export async function createComment(postId: string, text: string): Promise<Comment> {
  if (isSocialMockEnabled()) {
    await mockDelay(400);
    return mockCreateComment(postId, text);
  }
  const raw = await fetchApi<CommentDTO>(
    `/api/reviews/${encodeURIComponent(postId)}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({ body: text }),
    },
  );
  return toComment(raw);
}

export async function deleteComment(commentId: string): Promise<void> {
  if (isSocialMockEnabled()) {
    await mockDelay(200);
    return;
  }
  await fetchApi(`/api/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  });
}
