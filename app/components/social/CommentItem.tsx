import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import Avatar from '@/app/components/ui/Avatar';
import { formatRelativeTime } from '@/app/lib/utils/time';
import type { Comment } from '@/app/lib/types/social';

export interface CommentItemProps {
  comment: Comment;
  onOpenAuthor?: (userId: string) => void;
  onOpenMenu?: (commentId: string) => void;
}

export default function CommentItem({ comment, onOpenAuthor, onOpenMenu }: CommentItemProps) {
  const showMenu = comment.canDelete || comment.canReport;

  return (
    <article className="flex items-start gap-3">
      {onOpenAuthor ? (
        <button
          type="button"
          onClick={() => onOpenAuthor(comment.author.id)}
          aria-label={`Abrir perfil de ${comment.author.displayName}`}
          className="shrink-0 rounded-full focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <Avatar src={comment.author.avatarUrl} name={comment.author.displayName} size="sm" />
        </button>
      ) : (
        <Avatar src={comment.author.avatarUrl} name={comment.author.displayName} size="sm" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-sans text-sm font-medium text-text-primary">
            {comment.author.displayName}
          </span>
          <time
            dateTime={comment.createdAt}
            className="shrink-0 font-sans text-xs text-text-muted"
          >
            {formatRelativeTime(comment.createdAt)}
          </time>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-text-primary">
          {comment.text}
        </p>
      </div>
      {showMenu && onOpenMenu && (
        <button
          type="button"
          onClick={() => onOpenMenu(comment.id)}
          aria-label="Más opciones"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-3.5 w-3.5" />
        </button>
      )}
    </article>
  );
}
