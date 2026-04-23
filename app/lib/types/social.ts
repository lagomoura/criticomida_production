export interface AuthorSummary {
  id: string;
  displayName: string;
  handle?: string | null;
  avatarUrl?: string | null;
}

export interface DishSummary {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  category?: string | null;
}

export interface PostMediaImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export type PostStatus = 'active' | 'removed';

export type PortionSize = 'small' | 'medium' | 'large';
export type PriceTier = '$' | '$$' | '$$$';

/**
 * Rich metadata captured by the compose form as optional extras. Shown in
 * the review detail view (PostCard with `expanded`) and preserved when the
 * social `/api/posts` endpoint stores them.
 */
export interface ReviewExtras {
  portionSize?: PortionSize | null;
  wouldOrderAgain?: boolean | null;
  pros?: string[];
  cons?: string[];
  tags?: string[];
  /** ISO date (yyyy-mm-dd). */
  dateTasted?: string | null;
  visitedWith?: string | null;
  isAnonymous?: boolean | null;
  priceTier?: PriceTier | null;
}

export interface PostStats {
  likes: number;
  comments: number;
  saves: number;
}

export interface PostViewerState {
  liked: boolean;
  saved: boolean;
  followingAuthor?: boolean;
}

export interface ReviewPost {
  id: string;
  createdAt: string;
  author: AuthorSummary;
  dish: DishSummary;
  score: number;
  text: string;
  media?: PostMediaImage[];
  stats: PostStats;
  viewerState: PostViewerState;
  status?: PostStatus;
  extras?: ReviewExtras | null;
}

export interface Comment {
  id: string;
  reviewId: string;
  createdAt: string;
  author: AuthorSummary;
  text: string;
  canDelete?: boolean;
  canReport?: boolean;
}

export type NotificationKind = 'like' | 'comment' | 'follow';

export interface SocialNotification {
  id: string;
  kind: NotificationKind;
  unread: boolean;
  createdAt: string;
  actor: AuthorSummary;
  target?: {
    postId?: string | null;
    userId?: string | null;
  };
  /** Message already resolved by backend or formatter. */
  text: string;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface DishSearchResult {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  category?: string | null;
  averageScore: number;
  reviewCount: number;
}

export interface RestaurantSearchResult {
  id: string;
  name: string;
  category?: string | null;
  dishCount: number;
}

export interface UserSearchResult {
  id: string;
  displayName: string;
  handle?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  followers: number;
}

export interface DishDetail {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  category?: string | null;
  heroImage?: string | null;
  averageScore: number;
  reviewCount: number;
  /** 0–100, percentage of reviewers that scored ≥ 3.5 (scale is 1..5). */
  wouldOrderAgainPct?: number;
  priceRange?: string | null;
}

export type FeedType = 'for_you' | 'following';

export interface PublicUserProfile {
  id: string;
  displayName: string;
  handle?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  counts: {
    reviews: number;
    followers: number;
    following: number;
  };
  viewerState: {
    isSelf: boolean;
    following: boolean;
  };
}
