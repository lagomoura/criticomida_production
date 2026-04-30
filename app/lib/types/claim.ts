export type ClaimStatus =
  | 'pending'
  | 'verifying'
  | 'verified'
  | 'rejected'
  | 'revoked';

export type VerificationMethod =
  | 'domain_email'
  | 'google_business'
  | 'manual_admin'
  | 'phone_callback';

export interface ClaimRestaurantSummary {
  id: string;
  slug: string;
  name: string;
  location_name: string;
  is_claimed: boolean;
}

export interface ClaimClaimantSummary {
  id: string;
  email: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
  role: string;
}

export interface ClaimAdminItem {
  id: string;
  status: ClaimStatus;
  verification_method: VerificationMethod;
  contact_email: string | null;
  evidence_urls: string[] | null;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  expires_at: string | null;
  restaurant: ClaimRestaurantSummary;
  claimant: ClaimClaimantSummary;
}

export interface ClaimAdminListResponse {
  items: ClaimAdminItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MyClaim {
  id: string;
  restaurant_id: string;
  claimant_user_id: string;
  status: ClaimStatus;
  verification_method: VerificationMethod;
  contact_email: string | null;
  evidence_urls: string[] | null;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  expires_at: string | null;
}
