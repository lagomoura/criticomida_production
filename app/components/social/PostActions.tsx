'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faComment,
  faBookmark,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import IconButton from '@/app/components/ui/IconButton';
import type { PostStats, PostViewerState } from '@/app/lib/types/social';

export interface PostActionsProps {
  postId: string;
  stats: PostStats;
  viewerState: PostViewerState;
  onToggleLike?: (postId: string, next: boolean) => void;
  onToggleSave?: (postId: string, next: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export default function PostActions({
  postId,
  stats,
  viewerState,
  onToggleLike,
  onToggleSave,
  onComment,
  onShare,
}: PostActionsProps) {
  const t = useTranslations('social.postActions');
  return (
    <div className="flex items-center gap-1">
      <IconButton
        intent="like"
        selected={viewerState.liked}
        count={stats.likes}
        ariaLabel={viewerState.liked ? t('unlike') : t('like')}
        icon={<FontAwesomeIcon icon={faHeart} className="h-4 w-4" />}
        onClick={() => onToggleLike?.(postId, !viewerState.liked)}
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
    </div>
  );
}
