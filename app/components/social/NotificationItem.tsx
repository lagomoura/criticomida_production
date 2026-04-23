import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Avatar from '@/app/components/ui/Avatar';
import { formatRelativeTime } from '@/app/lib/utils/time';
import { cn } from '@/app/lib/utils/cn';
import type { SocialNotification, NotificationKind } from '@/app/lib/types/social';

export interface NotificationItemProps {
  notification: SocialNotification;
  onOpen?: (notification: SocialNotification) => void;
}

const kindIcon: Record<NotificationKind, typeof faHeart> = {
  like: faHeart,
  comment: faComment,
  follow: faUserPlus,
};

const kindTint: Record<NotificationKind, string> = {
  like: 'text-[var(--state-like-on)]',
  comment: 'text-action-primary',
  follow: 'text-[var(--state-follow-on)]',
};

export default function NotificationItem({ notification, onOpen }: NotificationItemProps) {
  const Wrapper = onOpen ? 'button' : 'div';
  const wrapperProps = onOpen
    ? {
        type: 'button' as const,
        onClick: () => onOpen(notification),
        'aria-label': notification.text,
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
        notification.unread
          ? 'border-l-[3px] border-l-action-highlight bg-surface-subtle'
          : 'border-l-[3px] border-l-transparent hover:bg-surface-subtle/60',
        onOpen && 'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
      )}
    >
      <div className="relative shrink-0">
        <Avatar src={notification.actor.avatarUrl} name={notification.actor.displayName} size="md" />
        <span
          aria-hidden
          className={cn(
            'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-card',
            kindTint[notification.kind],
          )}
        >
          <FontAwesomeIcon icon={kindIcon[notification.kind]} className="h-2.5 w-2.5" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-sm text-text-primary">
          <span className="font-medium">{notification.actor.displayName}</span>{' '}
          <span className="text-text-secondary">{notification.text}</span>
        </p>
        <time
          dateTime={notification.createdAt}
          className="mt-0.5 block font-sans text-xs text-text-muted"
        >
          {formatRelativeTime(notification.createdAt)}
        </time>
      </div>
      {notification.unread && (
        <span aria-label="Sin leer" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-action-highlight" />
      )}
    </Wrapper>
  );
}
