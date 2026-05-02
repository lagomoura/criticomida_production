'use client';

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsisVertical,
  faHeart,
  faReply,
} from '@fortawesome/free-solid-svg-icons';
import { useLocale, useTranslations } from 'next-intl';
import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Textarea from '@/app/components/ui/Textarea';
import { formatRelativeTime } from '@/app/lib/utils/time';
import type { Comment } from '@/app/lib/types/social';

const COMMENT_MAX_LENGTH = 500;

export interface CommentItemProps {
  comment: Comment;
  onOpenAuthor?: (userId: string) => void;
  /** Save edited body. Throws on failure so the row can show an inline error. */
  onSaveEdit?: (commentId: string, nextText: string) => Promise<void>;
  /** Delete the comment. Throws on failure. */
  onDelete?: (commentId: string) => Promise<void>;
  /** Trigger the report modal in the parent. */
  onReport?: (commentId: string) => void;
  /** Toggle a like (optimistic; parent rolls back on failure). */
  onToggleLike?: (commentId: string, next: boolean) => Promise<void>;
  /** Submit a reply to this top-level comment. Throws on failure. */
  onSubmitReply?: (parentCommentId: string, nextText: string) => Promise<void>;
  /** Toggle visibility / lazy-load replies for this top-level comment. */
  onToggleReplies?: (parentCommentId: string) => Promise<void>;
  /** Replies passed by the parent when expanded; undefined collapses the section. */
  replies?: Comment[];
  repliesLoading?: boolean;
  repliesExpanded?: boolean;
}

export default function CommentItem({
  comment,
  onOpenAuthor,
  onSaveEdit,
  onDelete,
  onReport,
  onToggleLike,
  onSubmitReply,
  onToggleReplies,
  replies,
  repliesLoading = false,
  repliesExpanded = false,
}: CommentItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<'bottom' | 'top'>('bottom');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations('social.comment');
  const tPost = useTranslations('social.post');
  const tActions = useTranslations('social.postActions');
  const locale = useLocale();

  const isReply = comment.parentCommentId !== null;
  const canEdit = Boolean(onSaveEdit && comment.canEdit);
  const canDelete = Boolean(onDelete && comment.canDelete);
  const canReport = Boolean(onReport && comment.canReport);
  const canReply = !isReply && Boolean(onSubmitReply);
  const canToggleReplies = !isReply && comment.repliesCount > 0 && Boolean(onToggleReplies);
  const showMenuButton = canEdit || canDelete || canReport;
  const wasEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  function openMenu() {
    // Flip the dropdown above the kebab when there isn't room below it.
    // ~140px is enough for 3 menu items + paddings.
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect && window.innerHeight - rect.bottom < 140) {
      setMenuPlacement('top');
    } else {
      setMenuPlacement('bottom');
    }
    setMenuOpen(true);
  }

  function startEdit() {
    setDraft(comment.text);
    setError(undefined);
    setEditing(true);
    setMenuOpen(false);
  }

  function cancelEdit() {
    setEditing(false);
    setError(undefined);
    setDraft(comment.text);
  }

  async function saveEdit() {
    if (!onSaveEdit) return;
    const next = draft.trim();
    if (!next || next === comment.text.trim()) {
      cancelEdit();
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onSaveEdit(comment.id, next);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setMenuOpen(false);
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await onDelete(comment.id);
    } catch {
      // Parent surfaces failure if needed; nothing to roll back here.
    }
  }

  function handleReport() {
    setMenuOpen(false);
    onReport?.(comment.id);
  }

  function startReply() {
    setReplyDraft('');
    setReplyError(undefined);
    setReplying(true);
  }

  function cancelReply() {
    setReplying(false);
    setReplyError(undefined);
    setReplyDraft('');
  }

  async function submitReply() {
    if (!onSubmitReply) return;
    const next = replyDraft.trim();
    if (!next) return;
    setReplySubmitting(true);
    setReplyError(undefined);
    try {
      await onSubmitReply(comment.id, next);
      setReplying(false);
      setReplyDraft('');
    } catch (err) {
      setReplyError(
        err instanceof Error ? err.message : t('replyError'),
      );
    } finally {
      setReplySubmitting(false);
    }
  }

  function handleToggleLike() {
    if (!onToggleLike) return;
    void onToggleLike(comment.id, !comment.viewerLiked);
  }

  function handleToggleReplies() {
    if (!onToggleReplies) return;
    void onToggleReplies(comment.id);
  }

  return (
    <article className="flex items-start gap-3">
      {onOpenAuthor ? (
        <button
          type="button"
          onClick={() => onOpenAuthor(comment.author.id)}
          aria-label={tPost('openProfileOf', { name: comment.author.displayName })}
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
            {formatRelativeTime(comment.createdAt, locale)}
          </time>
          {wasEdited && !editing && (
            <span className="shrink-0 font-sans text-xs text-text-muted" aria-label={t('editedAria')}>
              · {t('edited')}
            </span>
          )}
        </div>
        {editing ? (
          <div className="mt-1.5 flex flex-col gap-2">
            <Textarea
              label={t('editLabel')}
              hideLabel
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={saving}
              error={error}
              maxLength={COMMENT_MAX_LENGTH}
              valueLength={draft.length}
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => void saveEdit()}
                loading={saving}
                disabled={saving || !draft.trim() || draft.trim() === comment.text.trim()}
              >
                {t('save')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-text-primary">
            {comment.text}
          </p>
        )}

        {!editing && (onToggleLike || canReply || canToggleReplies) && (
          <div className="mt-1 flex flex-wrap items-center gap-1 -ml-2">
            {onToggleLike && (
              <IconButton
                intent="like"
                selected={comment.viewerLiked}
                count={comment.likesCount}
                ariaLabel={comment.viewerLiked ? tActions('unlike') : tActions('like')}
                icon={<FontAwesomeIcon icon={faHeart} className="h-3.5 w-3.5" />}
                onClick={handleToggleLike}
                className="min-h-[36px] min-w-[36px]"
              />
            )}
            {canReply && (
              <button
                type="button"
                onClick={startReply}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-2.5 font-sans text-xs font-medium text-text-muted transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                <FontAwesomeIcon icon={faReply} className="h-3 w-3" aria-hidden />
                {t('reply')}
              </button>
            )}
            {canToggleReplies && (
              <button
                type="button"
                onClick={handleToggleReplies}
                disabled={repliesLoading}
                aria-expanded={repliesExpanded}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-2.5 font-sans text-xs font-medium text-[color:var(--mainPink)] transition-colors hover:bg-surface-subtle disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                {repliesExpanded
                  ? t('hideReplies')
                  : repliesLoading
                  ? t('loading')
                  : comment.repliesCount === 1
                  ? t('viewReplyOne', { count: comment.repliesCount })
                  : t('viewReplyMany', { count: comment.repliesCount })}
              </button>
            )}
          </div>
        )}

        {replying && canReply && (
          <div className="mt-2 flex flex-col gap-2">
            <Textarea
              label={t('replyTo', { name: comment.author.displayName })}
              hideLabel
              placeholder={t('replyPlaceholder', {
                handle: comment.author.handle ?? comment.author.displayName,
              })}
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              disabled={replySubmitting}
              error={replyError}
              maxLength={COMMENT_MAX_LENGTH}
              valueLength={replyDraft.length}
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={cancelReply} disabled={replySubmitting}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => void submitReply()}
                loading={replySubmitting}
                disabled={replySubmitting || !replyDraft.trim()}
              >
                {t('reply')}
              </Button>
            </div>
          </div>
        )}

        {repliesExpanded && replies && replies.length > 0 && (
          <ul className="mt-3 flex list-none flex-col gap-4 border-l-2 border-border-default pl-4">
            {replies.map((r) => (
              <li key={r.id}>
                <CommentItem
                  comment={r}
                  onOpenAuthor={onOpenAuthor}
                  onSaveEdit={onSaveEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                  onToggleLike={onToggleLike}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      {showMenuButton && !editing && (
        <div ref={menuRef} className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
            aria-label={tPost('moreOptions')}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <FontAwesomeIcon icon={faEllipsisVertical} className="h-3.5 w-3.5" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className={`absolute right-0 z-10 min-w-[10rem] overflow-hidden rounded-lg border border-border-default bg-surface-card shadow-lg ${
                menuPlacement === 'top' ? 'bottom-9' : 'top-9'
              }`}
            >
              {canEdit && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={startEdit}
                  className="block w-full px-3 py-2 text-left font-sans text-sm text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:bg-surface-subtle"
                >
                  {t('edit')}
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleDelete()}
                  className="block w-full px-3 py-2 text-left font-sans text-sm text-action-danger transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:bg-surface-subtle"
                >
                  {t('delete')}
                </button>
              )}
              {canReport && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleReport}
                  className="block w-full px-3 py-2 text-left font-sans text-sm text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:bg-surface-subtle"
                >
                  {t('report')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
