import { fetchApi } from './client';

export interface BlockActionResponse {
  blockerId: string;
  blockedId: string;
  blocked: boolean;
}

export interface MuteActionResponse {
  muterId: string;
  mutedId: string;
  muted: boolean;
}

interface BlockActionDTO {
  blocker_id: string;
  blocked_id: string;
  blocked: boolean;
}

interface MuteActionDTO {
  muter_id: string;
  muted_id: string;
  muted: boolean;
}

export interface SafetyUser {
  id: string;
  displayName: string;
  handle: string | null;
  avatarUrl: string | null;
  /** When the block/mute was created (NOT when the user account was created). */
  createdAt: string;
}

export interface SafetyUsersPage {
  items: SafetyUser[];
  nextCursor: string | null;
}

interface SafetyUserDTO {
  id: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface SafetyUsersPageDTO {
  items: SafetyUserDTO[];
  next_cursor: string | null;
}

function toSafetyUser(dto: SafetyUserDTO): SafetyUser {
  return {
    id: dto.id,
    displayName: dto.display_name,
    handle: dto.handle,
    avatarUrl: dto.avatar_url,
    createdAt: dto.created_at,
  };
}

export async function blockUser(idOrHandle: string): Promise<BlockActionResponse> {
  const raw = await fetchApi<BlockActionDTO>(
    `/api/users/${encodeURIComponent(idOrHandle)}/block`,
    { method: 'POST' },
  );
  return { blockerId: raw.blocker_id, blockedId: raw.blocked_id, blocked: raw.blocked };
}

export async function unblockUser(idOrHandle: string): Promise<BlockActionResponse> {
  const raw = await fetchApi<BlockActionDTO>(
    `/api/users/${encodeURIComponent(idOrHandle)}/block`,
    { method: 'DELETE' },
  );
  return { blockerId: raw.blocker_id, blockedId: raw.blocked_id, blocked: raw.blocked };
}

export async function muteUser(idOrHandle: string): Promise<MuteActionResponse> {
  const raw = await fetchApi<MuteActionDTO>(
    `/api/users/${encodeURIComponent(idOrHandle)}/mute`,
    { method: 'POST' },
  );
  return { muterId: raw.muter_id, mutedId: raw.muted_id, muted: raw.muted };
}

export async function unmuteUser(idOrHandle: string): Promise<MuteActionResponse> {
  const raw = await fetchApi<MuteActionDTO>(
    `/api/users/${encodeURIComponent(idOrHandle)}/mute`,
    { method: 'DELETE' },
  );
  return { muterId: raw.muter_id, mutedId: raw.muted_id, muted: raw.muted };
}

export async function listBlockedUsers(
  cursor?: string | null,
  limit = 20,
): Promise<SafetyUsersPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const raw = await fetchApi<SafetyUsersPageDTO>(
    `/api/users/me/blocked?${params.toString()}`,
  );
  return { items: raw.items.map(toSafetyUser), nextCursor: raw.next_cursor };
}

export async function listMutedUsers(
  cursor?: string | null,
  limit = 20,
): Promise<SafetyUsersPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const raw = await fetchApi<SafetyUsersPageDTO>(
    `/api/users/me/muted?${params.toString()}`,
  );
  return { items: raw.items.map(toSafetyUser), nextCursor: raw.next_cursor };
}
