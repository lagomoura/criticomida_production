'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faComment,
  faBookmark,
  faShareNodes,
  faFlag,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import IconButton from '@/app/components/ui/IconButton';
import PostLikersModal from './PostLikersModal';
import type { PostStats, PostViewerState } from '@/app/lib/types/social';

export interface PostActionsProps {
  postId: string;
  stats: PostStats;
  viewerState: PostViewerState;
  onToggleLike?: (postId: string, next: boolean) => void;
  onToggleSave?: (postId: string, next: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

export default function PostActions({
  postId,
  stats,
  viewerState,
  onToggleLike,
  onToggleSave,
  onComment,
  onShare,
  onReport,
}: PostActionsProps) {
  const t = useTranslations('social.postActions');
  const tLikers = useTranslations('social.likers');
  const [likersOpen, setLikersOpen] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <IconButton
        intent="like"
        selected={viewerState.liked}
        ariaLabel={viewerState.liked ? t('unlike') : t('like')}
        icon={<FontAwesomeIcon icon={faHeart} className="h-4 w-4" />}
        onClick={() => onToggleLike?.(postId, !viewerState.liked)}
      />
      {stats.likes > 0 && (
        <button
          type="button"
          onClick={() => setLikersOpen(true)}
          aria-label={tLikers('seeLikers', { count: stats.likes })}
          className="-ml-1 inline-flex min-h-[44px] items-center rounded-full px-1.5 font-sans text-xs tabular-nums text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          {stats.likes}
        </button>
      )}
      <PostLikersModal
        postId={postId}
        open={likersOpen}
        onClose={() => setLikersOpen(false)}
      />
      <IconButton
        intent="neutral"
        count={stats.comments}
        ariaLabel={t('comment')}
        icon={<FontAwesomeIcon icon={faComment} className="h-4 w-4" />}
        onClick={() => onComment?.(postId)}
      />
      <IconButton
        intent="save"
        selected={viewerState.saved}
        count={stats.saves}
        ariaLabel={viewerState.saved ? t('unsave') : t('save')}
        icon={<FontAwesomeIcon icon={faBookmark} className="h-4 w-4" />}
        onClick={() => onToggleSave?.(postId, !viewerState.saved)}
      />
      <IconButton
        intent="neutral"
        ariaLabel={t('share')}
        icon={<FontAwesomeIcon icon={faShareNodes} className="h-4 w-4" />}
        onClick={() => onShare?.(postId)}
        className="ml-auto"
      />
      {onReport && (
        <IconButton
          intent="neutral"
          ariaLabel={t('report')}
          icon={<FontAwesomeIcon icon={faFlag} className="h-4 w-4" />}
          onClick={() => onReport(postId)}
        />
      )}
    </div>
  );
}
