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
  /** Technical pillars: 1=poor / 2=neutral / 3=excellent. */
  presentation?: 1 | 2 | 3 | null;
  valueProp?: 1 | 2 | 3 | null;
  execution?: 1 | 2 | 3 | null;
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
  /** Marcado por el usuario como 'Quiero probarlo' (wishlist a nivel plato). */
  wantToTry?: boolean;
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
  /** True cuando la review tiene los 3 pilares técnicos completos
   * (presentación + costo/beneficio + ejecución). Habilita el sello
   * "Verificada por experto" en la UI. */
  verifiedByExpert?: boolean;
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
  description?: string | null;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug?: string | null;
  restaurantLocationName?: string | null;
  restaurantCoverUrl?: string | null;
  restaurantAverageRating?: number | null;
  restaurantGoogleRating?: number | null;
  restaurantLatitude?: number | null;
  restaurantLongitude?: number | null;
  category?: string | null;
  cuisineTypes?: string[] | null;
  heroImage?: string | null;
  averageScore: number;
  reviewCount: number;
  /** 0–100, percentage of reviewers that scored ≥ 3.5 (scale is 1..5). */
  wouldOrderAgainPct?: number;
  priceRange?: string | null;
  isSignature?: boolean;
  editorialBlurb?: string | null;
  editorialSource?: string | null;
  createdByDisplayName?: string | null;
  wantToTry?: boolean;
}

export interface DishProsConsItem {
  text: string;
  count: number;
}

export interface DishTagItem {
  tag: string;
  count: number;
}

export interface DishWouldOrderAgainBreakdown {
  yes: number;
  no: number;
  noAnswer: number;
  pct: number | null;
}

export interface DishPillarBreakdown {
  /** Cuántos reviewers calificaron con 1 (negativo). */
  one: number;
  /** Cuántos con 2 (neutral). */
  two: number;
  /** Cuántos con 3 (positivo). */
  three: number;
  /** Total de reviewers que contestaron este pilar (one+two+three). */
  answered: number;
  /** Promedio (1..3) o null si nadie contestó. */
  avg: number | null;
}

export interface DishPillarsAggregates {
  presentation: DishPillarBreakdown;
  valueProp: DishPillarBreakdown;
  execution: DishPillarBreakdown;
}

export interface DishAggregates {
  prosTop: DishProsConsItem[];
  consTop: DishProsConsItem[];
  tagsTop: DishTagItem[];
  ratingHistogram: Record<'1' | '2' | '3' | '4' | '5', number>;
  portionDistribution: { small: number; medium: number; large: number; noAnswer: number };
  wouldOrderAgain: DishWouldOrderAgainBreakdown;
  pillars: DishPillarsAggregates;
  photosCount: number;
  uniqueEaters: number;
}

export interface DishPhoto {
  id: string;
  url: string;
  altText?: string | null;
  takenAt?: string | null;
  dishId: string;
  dishName?: string | null;
  reviewId?: string | null;
  userId?: string | null;
  userHandle?: string | null;
  userDisplayName?: string | null;
  isCover?: boolean;
}

export interface DishPhotosPage {
  items: DishPhoto[];
  nextCursor: string | null;
}

export interface DishRecentEater {
  id: string;
  handle?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface DishDiaryStats {
  uniqueEaters: number;
  reviewsTotal: number;
  reviewsLast7d: number;
  recentEaters: DishRecentEater[];
}

export interface RelatedDishItem {
  id: string;
  name: string;
  coverImageUrl?: string | null;
  computedRating: number;
  reviewCount: number;
  priceTier?: '$' | '$$' | '$$$' | null;
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  restaurantLocation: string;
  restaurantCity?: string | null;
}

export type FeedType = 'for_you' | 'following';

/** Orden del feed 'Siguiendo': cronológico vs ranking por priority. */
export type FeedSort = 'recent' | 'top';

// --- Discovery feed (Geek Score, rails) ---

export type DiscoverySort =
  | 'geek_score'
  | 'execution'
  | 'value_prop'
  | 'presentation'
  | 'distance';

export interface DiscoveryPillarStats {
  presentationAvg: number | null;
  presentationN: number;
  valuePropAvg: number | null;
  valuePropN: number;
  executionAvg: number | null;
  executionN: number;
}

export interface DiscoveryDishItem {
  dishId: string;
  dishName: string;
  coverImageUrl: string | null;
  priceTier: PriceTier | null;
  computedRating: number;
  reviewCount: number;
  /** 0..100 — combinación bayesiana de pilares + estrellas. */
  geekScore: number;
  pillars: DiscoveryPillarStats;
  distanceKm: number | null;
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  restaurantCity: string | null;
  category: string | null;
  wantToTry: boolean;
}

export interface DiscoveryDishPage {
  items: DiscoveryDishItem[];
}

export interface DishDuel {
  category: string | null;
  items: DiscoveryDishItem[];
}

// --- Wishlist 'Quiero probarlo' ---

export interface WantToTryItem {
  dishId: string;
  dishName: string;
  coverImageUrl: string | null;
  computedRating: number;
  reviewCount: number;
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  restaurantCity: string | null;
  restaurantLatitude: number | null;
  restaurantLongitude: number | null;
  /** ISO timestamp del momento en que se agregó a la wishlist. */
  savedAt: string;
}

export interface WantToTryPage {
  items: WantToTryItem[];
  nextCursor: string | null;
}

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
