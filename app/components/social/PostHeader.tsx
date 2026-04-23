import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import Avatar from '@/app/components/ui/Avatar';
import { formatRelativeTime } from '@/app/lib/utils/time';
import type { AuthorSummary } from '@/app/lib/types/social';

export interface PostHeaderProps {
  author: AuthorSummary;
  createdAt: string;
  onOpenAuthor?: (userId: string) => void;
  onOpenMenu?: () => void;
}

export default function PostHeader({ author, createdAt, onOpenAuthor, onOpenMenu }: PostHeaderProps) {
  const authorLabel = author.handle ? `@${author.handle}` : author.displayName;

  const AuthorBlock = (
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="truncate font-sans text-sm font-medium text-text-primary">
        {author.displayName}
      </span>
      <span className="truncate font-sans text-xs text-text-muted">
        {author.handle ? `@${author.handle} · ` : ''}
        <time dateTime={createdAt}>{formatRelativeTime(createdAt)}</time>
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
          aria-label={`Abrir perfil de ${authorLabel}`}
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
          aria-label="Más opciones"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
        </button>
      )}
    </header>
  );
}
