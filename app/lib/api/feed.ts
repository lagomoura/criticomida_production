import { fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import { mockFeed } from './_mocks/feed';
import type {
  CursorPage,
  FeedType,
  PortionSize,
  PriceTier,
  ReviewExtras,
  ReviewPost,
} from '@/app/lib/types/social';

export interface GetFeedParams {
  type: FeedType;
  cursor?: string | null;
  limit?: number;
}

/** Raw wire format for a feed item (what FastAPI emits). */
interface FeedAuthorDTO {
  id: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
}

interface FeedDishDTO {
  id: string;
  name: string;
  restaurant_id: string;
  restaurant_name: string;
  category: string | null;
}

interface FeedMediaDTO {
  url: string;
  alt: string | null;
}

interface FeedStatsDTO {
  likes: number;
  comments: number;
  saves: number;
}

interface FeedViewerStateDTO {
  liked: boolean;
  saved: boolean;
  following_author: boolean;
}

interface FeedExtrasDTO {
  portion_size: PortionSize | null;
  would_order_again: boolean | null;
  pros: string[];
  cons: string[];
  tags: string[];
  date_tasted: string | null;
  visited_with: string | null;
  is_anonymous: boolean | null;
  price_tier: PriceTier | null;
}

export interface FeedItemDTO {
  id: string;
  created_at: string;
  author: FeedAuthorDTO;
  dish: FeedDishDTO;
  score: number;
  text: string;
  media: FeedMediaDTO[];
  stats: FeedStatsDTO;
  viewer_state: FeedViewerStateDTO;
  extras: FeedExtrasDTO | null;
}

export interface FeedPageDTO {
  items: FeedItemDTO[];
  next_cursor: string | null;
}

export function toReviewPost(dto: FeedItemDTO): ReviewPost {
  const extras: ReviewExtras | null = dto.extras
    ? {
        portionSize: dto.extras.portion_size,
        wouldOrderAgain: dto.extras.would_order_again,
        pros: dto.extras.pros,
        cons: dto.extras.cons,
        tags: dto.extras.tags,
        dateTasted: dto.extras.date_tasted,
        visitedWith: dto.extras.visited_with,
        isAnonymous: dto.extras.is_anonymous,
        priceTier: dto.extras.price_tier,
      }
    : null;

  return {
    id: dto.id,
    createdAt: dto.created_at,
    author: {
      id: dto.author.id,
      displayName: dto.author.display_name,
      handle: dto.author.handle,
      avatarUrl: dto.author.avatar_url,
    },
    dish: {
      id: dto.dish.id,
      name: dto.dish.name,
      restaurantId: dto.dish.restaurant_id,
      restaurantName: dto.dish.restaurant_name,
      category: dto.dish.category,
    },
    score: dto.score,
    text: dto.text,
    media: dto.media.map((m) => ({ url: m.url, alt: m.alt ?? undefined })),
    stats: dto.stats,
    viewerState: {
      liked: dto.viewer_state.liked,
      saved: dto.viewer_state.saved,
      followingAuthor: dto.viewer_state.following_author,
    },
    extras,
  };
}

export async function getFeed({ type, cursor, limit = 20 }: GetFeedParams): Promise<CursorPage<ReviewPost>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockFeed({ type, cursor });
  }

  const params = new URLSearchParams({ type, limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const raw = await fetchApi<FeedPageDTO>(`/api/feed?${params.toString()}`);
  return {
    items: raw.items.map(toReviewPost),
    nextCursor: raw.next_cursor,
  };
}

