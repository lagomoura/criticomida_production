import { fetchApi } from './client';
import type {
  ClaimAdminItem,
  ClaimAdminListResponse,
  ClaimStatus,
  MyClaim,
  VerificationMethod,
} from '../types/claim';

export interface ClaimStatusResponse {
  is_claimed: boolean;
}

export async function getClaimStatus(slug: string): Promise<ClaimStatusResponse> {
  return fetchApi<ClaimStatusResponse>(`/api/restaurants/${slug}/claim-status`);
}

export interface CreateClaimInput {
  verification_method: VerificationMethod;
  contact_email?: string | null;
  evidence_urls?: string[];
}

export async function createClaim(
  slug: string,
  body: CreateClaimInput,
): Promise<MyClaim> {
  return fetchApi<MyClaim>(`/api/restaurants/${slug}/claims`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listMyClaims(): Promise<{ items: MyClaim[] }> {
  return fetchApi<{ items: MyClaim[] }>('/api/me/claims');
}

// ----- Admin -----

export interface ListAdminClaimsParams {
  status?: ClaimStatus;
  page?: number;
  page_size?: number;
}

export async function listAdminClaims(
  params?: ListAdminClaimsParams,
): Promise<ClaimAdminListResponse> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.page) sp.set('page', String(params.page));
  if (params?.page_size) sp.set('page_size', String(params.page_size));
  const query = sp.toString();
  return fetchApi<ClaimAdminListResponse>(
    `/api/admin/claims${query ? `?${query}` : ''}`,
  );
}

export async function approveClaim(
  claimId: string,
  notes?: string,
): Promise<ClaimAdminItem> {
  return fetchApi<ClaimAdminItem>(`/api/admin/claims/${claimId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes ?? null }),
  });
}

export async function rejectClaim(
  claimId: string,
  reason: string,
): Promise<ClaimAdminItem> {
  return fetchApi<ClaimAdminItem>(`/api/admin/claims/${claimId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function revokeClaim(
  claimId: string,
  reason: string,
): Promise<ClaimAdminItem> {
  return fetchApi<ClaimAdminItem>(`/api/admin/claims/${claimId}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
