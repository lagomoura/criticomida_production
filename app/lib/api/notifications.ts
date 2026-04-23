import { fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import {
  mockGetNotifications,
  mockMarkAllRead,
  mockMarkRead,
  mockUnreadCount,
} from './_mocks/notifications';
import type {
  CursorPage,
  NotificationKind,
  SocialNotification,
} from '@/app/lib/types/social';

/** Backend wire format for GET /api/notifications items. */
interface NotificationDTO {
  id: string;
  kind: NotificationKind;
  unread: boolean;
  created_at: string;
  actor: {
    id: string;
    display_name: string;
    handle: string | null;
    avatar_url: string | null;
  };
  target_review_id: string | null;
  target_user_id: string | null;
  text: string;
}

interface NotificationsPageDTO {
  items: NotificationDTO[];
  next_cursor: string | null;
}

function toSocialNotification(dto: NotificationDTO): SocialNotification {
  return {
    id: dto.id,
    kind: dto.kind,
    unread: dto.unread,
    createdAt: dto.created_at,
    actor: {
      id: dto.actor.id,
      displayName: dto.actor.display_name,
      handle: dto.actor.handle,
      avatarUrl: dto.actor.avatar_url,
    },
    target: {
      postId: dto.target_review_id,
      userId: dto.target_user_id,
    },
    text: dto.text,
  };
}

export async function getNotifications(
  cursor?: string | null,
): Promise<CursorPage<SocialNotification>> {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockGetNotifications();
  }
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const raw = await fetchApi<NotificationsPageDTO>(`/api/notifications${params}`);
  return {
    items: raw.items.map(toSocialNotification),
    nextCursor: raw.next_cursor,
  };
}

export async function getUnreadCount(): Promise<number> {
  if (isSocialMockEnabled()) {
    await mockDelay(100);
    return mockUnreadCount();
  }
  const response = await fetchApi<{ unread: number }>(`/api/notifications/unread-count`);
  return response.unread;
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isSocialMockEnabled()) {
    mockMarkRead(id);
    return;
  }
  await fetchApi(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead(): Promise<void> {
  if (isSocialMockEnabled()) {
    mockMarkAllRead();
    return;
  }
  await fetchApi(`/api/notifications/read-all`, { method: 'POST' });
}
