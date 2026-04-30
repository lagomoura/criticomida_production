export interface OwnerResponse {
  review_id: string;
  owner_user_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface OfficialPhoto {
  id: string;
  restaurant_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  uploaded_by_user_id: string | null;
  created_at: string;
}

export interface OfficialPhotosListResponse {
  items: OfficialPhoto[];
}
