'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faComment,
  faBookmark,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
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

/**
 * Action bar under a post. Parents own the optimistic state — this component
 * only calls back with the intended next value.
 */
export default function PostActions({
  postId,
  stats,
  viewerState,
  onToggleLike,
  onToggleSave,
  onComment,
  onShare,
}: PostActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <IconButton
        intent="like"
        selected={viewerState.liked}
        count={stats.likes}
        ariaLabel={viewerState.liked ? 'Quitar like' : 'Dar like'}
        icon={<FontAwesomeIcon icon={faHeart} className="h-4 w-4" />}
        onClick={() => onToggleLike?.(postId, !viewerState.liked)}
      />
      <IconButton
        intent="neutral"
        count={stats.comments}
        ariaLabel="Comentar"
        icon={<FontAwesomeIcon icon={faComment} className="h-4 w-4" />}
        onClick={() => onComment?.(postId)}
      />
      <IconButton
        intent="save"
        selected={viewerState.saved}
        count={stats.saves}
        ariaLabel={viewerState.saved ? 'Quitar de guardados' : 'Guardar'}
        icon={<FontAwesomeIcon icon={faBookmark} className="h-4 w-4" />}
        onClick={() => onToggleSave?.(postId, !viewerState.saved)}
      />
      <IconButton
        intent="neutral"
        ariaLabel="Compartir"
        icon={<FontAwesomeIcon icon={faShareNodes} className="h-4 w-4" />}
        onClick={() => onShare?.(postId)}
        className="ml-auto"
      />
    </div>
  );
}
