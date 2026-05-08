export type PriceTier = '$' | '$$' | '$$$';
export type PortionSize = 'small' | 'medium' | 'large';
export type DishReviewProsConsType = 'pro' | 'con';
export type PillarScore = 1 | 2 | 3;

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  price_tier: PriceTier | null;
  computed_rating: number;
  review_count: number;
  created_by: string;
  created_at: string;
}

export interface CreateDishRequest {
  name: string;
  description?: string;
  cover_image_url?: string;
  price_tier?: PriceTier;
}

export interface UpdateDishRequest {
  name?: string;
  description?: string | null;
  cover_image_url?: string | null;
  price_tier?: PriceTier | null;
}

export interface DishReviewProsCons {
  id: number;
  type: DishReviewProsConsType;
  text: string;
}

export interface DishReviewTag {
  id: number;
  tag: string;
}

export interface DishReviewImage {
  id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  uploaded_at: string;
}

export interface DishReview {
  id: string;
  dish_id: string;
  user_id: string;
  user_display_name: string | null;
  date_tasted: string;
  time_tasted: string | null;
  note: string;
  rating: number;
  /** Precio absoluto en la moneda del restaurante. Null cuando el crítico
   * no quiso o no pudo registrarlo (cortesía, menú degustación, reseña antigua). */
  price_paid: number | null;
  portion_size: PortionSize | null;
  would_order_again: boolean | null;
  visited_with: string | null;
  is_anonymous: boolean;
  presentation: PillarScore | null;
  value_prop: PillarScore | null;
  execution: PillarScore | null;
  created_at: string;
  updated_at: string;
  pros_cons: DishReviewProsCons[];
  tags: DishReviewTag[];
  images: DishReviewImage[];
}

export interface CreateReviewRequest {
  date_tasted: string;
  time_tasted?: string;
  note: string;
  rating: number;
  /** Numérico positivo. Omitir cuando no aplica. */
  price_paid?: number;
  portion_size?: PortionSize;
  would_order_again?: boolean;
  visited_with?: string;
  is_anonymous?: boolean;
  presentation?: PillarScore;
  value_prop?: PillarScore;
  execution?: PillarScore;
  pros_cons?: { type: DishReviewProsConsType; text: string }[];
  tags?: { tag: string }[];
  images?: { url: string; alt_text?: string; display_order?: number }[];
}

export interface UpdateReviewRequest {
  date_tasted?: string;
  time_tasted?: string;
  note?: string;
  rating?: number;
  /** Numérico positivo o null para limpiar. */
  price_paid?: number | null;
  portion_size?: PortionSize;
  would_order_again?: boolean;
  visited_with?: string;
  is_anonymous?: boolean;
  presentation?: PillarScore;
  value_prop?: PillarScore;
  execution?: PillarScore;
  /** Renombre del plato. Si el nombre normalizado cambia, el backend re-linkea
   * la review a otro Dish (find-or-create) en el mismo restaurante. */
  dish_name?: string;
  /** When omitted, leave existing rows alone. When [], clear them. */
  pros_cons?: { type: DishReviewProsConsType; text: string }[];
  tags?: { tag: string }[];
  images?: { url: string; alt_text?: string; display_order?: number }[];
}

/** Internal view-model used by restaurant detail sub-components. */
export type Plate = {
  name: string;
  date: string;
  time?: string;
  note: string;
  pros: string[];
  cons: string[];
  image?: string;
  images?: string[];
  rating?: number;
  price?: string;
  portion?: string;
  wouldOrderAgain?: boolean;
  tags?: string[];
  visitedWith?: string;
};
