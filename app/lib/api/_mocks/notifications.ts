import type { CursorPage, SocialNotification } from '@/app/lib/types/social';

const BASE_TIME = new Date('2026-04-22T14:30:00-03:00').getTime();
const ago = (seconds: number) => new Date(BASE_TIME - seconds * 1000).toISOString();

// Module-level mutable state: mark-read toggles persist within a dev session.
let store: SocialNotification[] = [
  {
    id: 'notif-001',
    kind: 'like',
    unread: true,
    createdAt: ago(60 * 12),
    actor: { id: 'user-mica', displayName: 'Mica Fernández', handle: 'micacomelona' },
    target: { postId: 'rev-004' },
    text: 'le dio like a tu reseña de Pizza de muzzarella.',
  },
  {
    id: 'notif-002',
    kind: 'comment',
    unread: true,
    createdAt: ago(60 * 45),
    actor: { id: 'user-juli', displayName: 'Juli Mendes', handle: 'julipicacomida' },
    target: { postId: 'rev-001' },
    text: 'comentó tu reseña: "¿Cuánto picante? Soy ñoña con el chile."',
  },
  {
    id: 'notif-003',
    kind: 'follow',
    unread: true,
    createdAt: ago(60 * 60 * 2),
    actor: { id: 'user-tomi', displayName: 'Tomás Echeverría', handle: 'tomiplatos' },
    target: { userId: 'user-tomi' },
    text: 'empezó a seguirte.',
  },
  {
    id: 'notif-004',
    kind: 'like',
    unread: false,
    createdAt: ago(60 * 60 * 8),
    actor: { id: 'user-caro', displayName: 'Carolina R.', handle: null },
    target: { postId: 'rev-007' },
    text: 'le dio like a tu reseña de Empanadas.',
  },
  {
    id: 'notif-005',
    kind: 'comment',
    unread: false,
    createdAt: ago(60 * 60 * 14),
    actor: { id: 'user-dani', displayName: 'Daniel López', handle: 'danicome' },
    target: { postId: 'rev-002' },
    text: 'comentó tu reseña de Milanesa napolitana.',
  },
  {
    id: 'notif-006',
    kind: 'follow',
    unread: false,
    createdAt: ago(60 * 60 * 24 * 2),
    actor: { id: 'user-lucia', displayName: 'Lucía Romero', handle: 'lucia_r' },
    target: { userId: 'user-lucia' },
    text: 'empezó a seguirte.',
  },
  {
    id: 'notif-007',
    kind: 'like',
    unread: false,
    createdAt: ago(60 * 60 * 24 * 4),
    actor: { id: 'user-ana', displayName: 'Ana Paula', handle: 'anapaulacome' },
    target: { postId: 'rev-005' },
    text: 'le dio like a tu reseña de Cheesecake de frutos rojos.',
  },
];

export function mockGetNotifications(): CursorPage<SocialNotification> {
  return { items: [...store], nextCursor: null };
}

export function mockMarkRead(id: string): void {
  store = store.map((n) => (n.id === id ? { ...n, unread: false } : n));
}

export function mockMarkAllRead(): void {
  store = store.map((n) => ({ ...n, unread: false }));
}

export function mockUnreadCount(): number {
  return store.filter((n) => n.unread).length;
}
