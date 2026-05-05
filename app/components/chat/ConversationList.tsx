'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxArchive,
  faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import {
  ChatAgent,
  ChatConversationSummary,
  archiveConversation,
  listMyConversations,
} from '@/app/lib/api/chat';
import { cn } from '@/app/lib/utils/cn';
import { formatRelativeTime } from '@/app/lib/utils/time';

interface ConversationListProps {
  agent: ChatAgent;
  restaurantScopeId?: string | null;
  /** Highlight the currently-active conversation in the list. */
  currentConversationId: string | null;
  /** Caller hydrates the picked conversation into the chat surface. */
  onPick: (conversationId: string) => void;
  /**
   * Caller is told when the active conversation gets archived so it
   * can clear the chat surface (active conversation no longer exists
   * from the FE's perspective, even though the row stays in the DB).
   */
  onArchivedActive?: () => void;
}

/**
 * Past conversations panel for the chat drawer.
 *
 * Loads the owner's history scoped to the current ``(agent, restaurant)``
 * pair (the backend filters do the heavy lifting — no client-side
 * filtering required). Renders a vertical list of items with title +
 * relative timestamp. Clicking an item delegates back to the parent
 * to actually swap the active conversation; we don't own that state.
 *
 * Title fallback: when ``title`` is null (auto-titling not yet
 * implemented — see F-CONVO.4), we render a generic label tied to
 * the start date. Once F-CONVO.4 lands, this fallback rarely fires.
 */
export default function ConversationList({
  agent,
  restaurantScopeId,
  currentConversationId,
  onPick,
  onArchivedActive,
}: ConversationListProps) {
  const t = useTranslations('chat.conversationList');
  const locale = useLocale();
  const [items, setItems] = useState<ChatConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** ID currently in the "confirming archive" state (one-click → ask). */
  const [pendingArchive, setPendingArchive] = useState<string | null>(null);

  async function handleArchive(id: string) {
    if (pendingArchive !== id) {
      // First click on this item → enter confirm mode. Second click on
      // the same row commits. Click anywhere else clears the prompt.
      setPendingArchive(id);
      return;
    }
    setPendingArchive(null);
    try {
      await archiveConversation(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      if (id === currentConversationId) onArchivedActive?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listMyConversations({
      agent,
      restaurantScopeId,
      limit: 30,
    })
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : t('error'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agent, restaurantScopeId, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-text-muted">
        {t('loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 text-center text-sm text-text-muted">
        {t('error')}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-text-muted">
        <FontAwesomeIcon
          icon={faClockRotateLeft}
          aria-hidden
          className="h-5 w-5 opacity-50"
        />
        <span>{t('empty')}</span>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1 px-2 py-2">
      {items.map((convo) => {
        const isActive = convo.id === currentConversationId;
        const isConfirming = pendingArchive === convo.id;
        return (
          <li key={convo.id}>
            <div
              className={cn(
                'group flex items-center gap-1 rounded-xl pr-1 transition-colors',
                'hover:bg-surface-subtle focus-within:bg-surface-subtle',
                isActive && 'bg-action-primary/10',
              )}
            >
              <button
                type="button"
                onClick={() => {
                  if (isConfirming) {
                    setPendingArchive(null);
                    return;
                  }
                  onPick(convo.id);
                }}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex flex-1 flex-col gap-0.5 rounded-l-xl px-3 py-2 text-left',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                )}
              >
                <span
                  className={cn(
                    'truncate text-sm',
                    isActive
                      ? 'font-semibold text-action-primary'
                      : 'text-text-primary',
                  )}
                >
                  {convo.title || t('untitled')}
                </span>
                <time
                  dateTime={convo.last_message_at}
                  className="text-xs text-text-muted"
                >
                  {formatRelativeTime(convo.last_message_at, locale)}
                </time>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleArchive(convo.id);
                }}
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs transition-colors',
                  'text-text-muted opacity-0 group-hover:opacity-100',
                  'hover:bg-surface-card hover:text-text-primary',
                  'focus:opacity-100 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  isConfirming &&
                    'bg-feedback-warning/15 text-feedback-warning opacity-100',
                )}
                aria-label={
                  isConfirming
                    ? t('archiveConfirm')
                    : t('archive')
                }
                title={isConfirming ? t('archiveConfirm') : t('archive')}
              >
                <FontAwesomeIcon icon={faBoxArchive} aria-hidden />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
