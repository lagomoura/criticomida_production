'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBellSlash } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import NotificationItem from '@/app/components/social/NotificationItem';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { useNotifications } from '@/app/lib/contexts/NotificationContext';
import type { SocialNotification } from '@/app/lib/types/social';

export default function NotificationsClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const { items, loading, refresh, markRead, markAllRead } = useNotifications();
  const router = useRouter();

  // When the user lands on /notifications, force a fresh fetch so we don't
  // rely on the most recent poll tick (which may be up to 60s old).
  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  const handleOpen = useCallback(
    async (notification: SocialNotification) => {
      if (notification.unread) {
        void markRead(notification.id);
      }
      if (notification.target?.postId) {
        router.push(`/reviews/${notification.target.postId}`);
      } else if (notification.target?.userId) {
        router.push(`/u/${notification.target.userId}`);
      }
    },
    [markRead, router],
  );

  if (authLoading) return <LoadingView />;

  if (!user) {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <FontAwesomeIcon icon={faBellSlash} className="h-8 w-8 text-text-muted" aria-hidden />
        <h1 className="font-display text-3xl font-medium text-text-primary">
          Iniciá sesión para ver tus notificaciones
        </h1>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          Volver al feed
        </Button>
      </div>
    );
  }

  if (loading && items.length === 0) return <LoadingView />;

  const hasUnread = items.some((n) => n.unread);

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action-primary">
            Tu actividad
          </p>
          <h1 className="mt-1.5 m-0 font-display text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.05] text-text-primary">
            Notificaciones
          </h1>
        </div>
        {hasUnread && (
          <Button variant="ghost" size="sm" onClick={() => void markAllRead()}>
            Marcar todas como leídas
          </Button>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={<FontAwesomeIcon icon={faBellSlash} className="h-8 w-8" aria-hidden />}
          title="No tenés notificaciones"
          description="Cuando alguien interactúe con tus reseñas te avisamos acá."
        />
      ) : (
        <ul className="flex list-none flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card p-0">
          {items.map((notification, i) => (
            <li
              key={notification.id}
              className={i > 0 ? 'border-t border-border-default' : undefined}
            >
              <NotificationItem notification={notification} onOpen={handleOpen} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LoadingView() {
  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <Skeleton shape="line" width={220} height={32} />
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={
              'flex items-start gap-3 px-4 py-3' + (i > 0 ? ' border-t border-border-default' : '')
            }
          >
            <Skeleton shape="circle" width={40} height={40} />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton shape="line" />
              <Skeleton shape="line" width={100} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
