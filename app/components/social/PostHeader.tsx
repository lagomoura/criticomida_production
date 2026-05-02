'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { useLocale, useTranslations } from 'next-intl';
import Avatar from '@/app/components/ui/Avatar';
import DiscoveryBadge from '@/app/components/ui/DiscoveryBadge';
import Tooltip from '@/app/components/ui/Tooltip';
import { formatRelativeTime } from '@/app/lib/utils/time';
import type { AuthorSummary } from '@/app/lib/types/social';

export interface PostHeaderProps {
  author: AuthorSummary;
  createdAt: string;
  onOpenAuthor?: (userId: string) => void;
  onOpenMenu?: () => void;
  verified?: boolean;
  discoveryRank?: 1 | 2 | 3 | null;
}

export default function PostHeader({
  author,
  createdAt,
  onOpenAuthor,
  onOpenMenu,
  verified = false,
  discoveryRank = null,
}: PostHeaderProps) {
  const t = useTranslations('social.post');
  const locale = useLocale();
  const authorLabel = author.handle ? `@${author.handle}` : author.displayName;

  const AuthorBlock = (
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="truncate font-sans text-sm font-medium text-text-primary">
          {author.displayName}
        </span>
        {discoveryRank && (
          <DiscoveryBadge rank={discoveryRank} variant="compact" />
        )}
        {verified && (
          <Tooltip
            multiline
            label={
              <>
                <strong className="font-semibold">{t('expertReviewTooltipLead')}</strong>{' '}
                {t('expertReviewTooltipBody')}
              </>
            }
          >
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[color:var(--color-azafran)]/12 px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-azafran)]"
              aria-label={t('expertReviewBadgeAria')}
              tabIndex={0}
            >
              <span aria-hidden>✦</span>
              {t('expertReviewBadge')}
            </span>
          </Tooltip>
        )}
      </span>
      <span className="truncate font-sans text-xs text-text-muted">
        {author.handle ? `@${author.handle} · ` : ''}
        <time dateTime={createdAt}>{formatRelativeTime(createdAt, locale)}</time>
      </span>
    </span>
  );

  return (
    <header className="flex items-center gap-3">
      {onOpenAuthor ? (
        <button
          type="button"
          onClick={() => onOpenAuthor(author.id)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          aria-label={t('openProfileOf', { name: authorLabel })}
        >
          <Avatar src={author.avatarUrl} name={author.displayName} size="sm" />
          {AuthorBlock}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar src={author.avatarUrl} name={author.displayName} size="sm" />
          {AuthorBlock}
        </div>
      )}
      {onOpenMenu && (
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t('moreOptions')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
        </button>
      )}
    </header>
  );
}
