'use client';

import { Link } from '@/app/lib/i18n/navigation';
import Avatar from '@/app/components/ui/Avatar';
import FollowButton from './FollowButton';
import type { FollowerSummary } from '@/app/lib/types/social';

export interface FollowListRowProps {
  item: FollowerSummary;
  /** ID del viewer autenticado, o null si anónimo. */
  viewerUserId: string | null;
  followLoading: boolean;
  onToggleFollow: (userId: string, next: boolean) => void;
}

export default function FollowListRow({
  item,
  viewerUserId,
  followLoading,
  onToggleFollow,
}: FollowListRowProps) {
  // El FollowButton solo aparece cuando hay viewer logueado, no es uno mismo,
  // y el backend dio el flag (no null → significa que el viewer está logueado
  // según el backend; el chequeo es defensivo).
  const showFollowButton =
    viewerUserId !== null &&
    viewerUserId !== item.id &&
    item.viewerFollowing !== null;

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-border-default bg-surface-card p-3 sm:gap-4 sm:p-4">
      <Link
        href={`/u/${item.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md no-underline transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] sm:gap-4"
      >
        <Avatar src={item.avatarUrl} name={item.displayName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-base font-medium text-text-primary">
            {item.displayName}
          </p>
          {item.handle && (
            <p className="truncate font-sans text-sm text-text-muted">
              @{item.handle}
            </p>
          )}
          {item.bio && (
            <p className="mt-0.5 line-clamp-2 font-sans text-sm text-text-secondary">
              {item.bio}
            </p>
          )}
        </div>
      </Link>
      {showFollowButton && (
        <FollowButton
          userId={item.id}
          following={item.viewerFollowing === true}
          loading={followLoading}
          size="sm"
          onToggle={onToggleFollow}
        />
      )}
    </article>
  );
}
