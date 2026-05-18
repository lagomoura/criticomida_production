'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faComment,
  faReply,
  faUserPlus,
  faCircleCheck,
  faCircleXmark,
  faShieldHalved,
  faUtensils,
  faCalendarCheck,
  faAt,
  faPenToSquare,
  faTag,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useLocale, useTranslations } from 'next-intl';
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
  claim_approved: faCircleCheck,
  claim_rejected: faCircleXmark,
  claim_revoked: faShieldHalved,
  comment_like: faHeart,
  comment_reply: faReply,
  reservation_requested: faCalendarCheck,
  review_on_owned_restaurant: faUtensils,
  mention: faAt,
  sommelier_review_recall: faPenToSquare,
  category_pending_review: faTag,
  user_created: faUserCheck,
};

const kindTint: Record<NotificationKind, string> = {
  like: 'text-[var(--state-like-on)]',
  comment: 'text-action-primary',
  follow: 'text-[var(--state-follow-on)]',
  claim_approved: 'text-emerald-600',
  claim_rejected: 'text-red-600',
  claim_revoked: 'text-amber-600',
  comment_like: 'text-[var(--state-like-on)]',
  comment_reply: 'text-action-primary',
  reservation_requested: 'text-[var(--color-terracota-deep)]',
  review_on_owned_restaurant: 'text-[var(--color-terracota-deep)]',
  mention: 'text-action-primary',
  sommelier_review_recall: 'text-action-highlight',
  category_pending_review: 'text-amber-600',
  user_created: 'text-action-primary',
};

export default function NotificationItem({ notification, onOpen }: NotificationItemProps) {
  const tKicker = useTranslations('social.notifications.kicker');
  const tNotif = useTranslations('social.notifications');
  const locale = useLocale();
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
        <p
          className={cn(
            'm-0 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em]',
            kindTint[notification.kind],
          )}
        >
          {tKicker(notification.kind)}
        </p>
        <p className="mt-0.5 m-0 font-sans text-sm text-text-primary">
          <span className="font-medium">{notification.actor.displayName}</span>{' '}
          <span className="text-text-secondary">{notification.text}</span>
        </p>
        <time
          dateTime={notification.createdAt}
          className="mt-0.5 block font-sans text-xs text-text-muted"
        >
          {formatRelativeTime(notification.createdAt, locale)}
        </time>
      </div>
      {notification.unread && (
        <span aria-label={tNotif('unread')} className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-action-highlight" />
      )}
    </Wrapper>
  );
}
