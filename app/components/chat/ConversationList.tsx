'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxArchive,
  faCheck,
  faClockRotateLeft,
  faRotateLeft,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  ChatAgent,
  ChatConversationSummary,
  archiveConversation,
  hardDeleteConversation,
  listMyConversations,
  unarchiveConversation,
} from '@/app/lib/api/chat';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
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
/**
 * localStorage key for the "Show archived" toggle. Persisting the
 * preference is the small DMMT investment that makes the toggle feel
 * like a real setting and not a per-session blip — owners who *do*
 * archive aggressively don't need to re-toggle every time they open
 * the panel.
 */
const SHOW_ARCHIVED_STORAGE_KEY = 'cc:chat:conversationList:showArchived';

function readShowArchivedPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SHOW_ARCHIVED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeShowArchivedPreference(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      window.localStorage.setItem(SHOW_ARCHIVED_STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(SHOW_ARCHIVED_STORAGE_KEY);
    }
  } catch {
    /* localStorage may be unavailable — toggle still works in-memory. */
  }
}

export default function ConversationList({
  agent,
  restaurantScopeId,
  currentConversationId,
  onPick,
  onArchivedActive,
}: ConversationListProps) {
  const t = useTranslations('chat.conversationList');
  const locale = useLocale();
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin';
  const [items, setItems] = useState<ChatConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** ID currently in the "confirming archive" state (one-click → ask). */
  const [pendingArchive, setPendingArchive] = useState<string | null>(null);
  /** ID currently confirming a hard-delete. Admin-only flow. */
  const [pendingHardDelete, setPendingHardDelete] = useState<string | null>(
    null,
  );
  const [showArchived, setShowArchived] = useState<boolean>(
    readShowArchivedPreference,
  );

  const cancelPending = useCallback(() => {
    setPendingArchive(null);
    setPendingHardDelete(null);
  }, []);

  // While an archive confirmation is pending, listen for clicks outside
  // any archive button + the Escape key. Either path cancels the
  // pending state without committing — gives the owner a real "oops"
  // exit instead of forcing them to either confirm or click another
  // row.
  useEffect(() => {
    if (!pendingArchive && !pendingHardDelete) return;

    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-archive-button]')) return;
      cancelPending();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') cancelPending();
    }

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [pendingArchive, pendingHardDelete, cancelPending]);

  async function handleArchive(id: string) {
    if (pendingArchive !== id) {
      // First click on this item → enter confirm mode.
      setPendingArchive(id);
      return;
    }
    setPendingArchive(null);
    try {
      await archiveConversation(id);
      // When the toggle is OFF the archived row simply disappears.
      // When it's ON we keep the row visible (now muted) so the owner
      // can immediately undo with "Restaurar" — same affordance the
      // toggle promises ("look, here are your archived ones too").
      if (showArchived) {
        const at = new Date().toISOString();
        setItems((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, archived_at: at } : c,
          ),
        );
      } else {
        setItems((prev) => prev.filter((c) => c.id !== id));
      }
      if (id === currentConversationId) onArchivedActive?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    }
  }

  async function handleUnarchive(id: string) {
    try {
      await unarchiveConversation(id);
      setItems((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, archived_at: null } : c,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    }
  }

  async function handleHardDelete(id: string) {
    if (pendingHardDelete !== id) {
      setPendingHardDelete(id);
      return;
    }
    setPendingHardDelete(null);
    try {
      await hardDeleteConversation(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      if (id === currentConversationId) onArchivedActive?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    }
  }

  function handleToggleShowArchived() {
    setShowArchived((current) => {
      const next = !current;
      writeShowArchivedPreference(next);
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listMyConversations({
      agent,
      restaurantScopeId,
      limit: 30,
      includeArchived: showArchived,
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
  }, [agent, restaurantScopeId, showArchived, t]);

  const header = (
    <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2">
      <span className="font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
        {t('headerLabel')}
      </span>
      <label className="flex cursor-pointer items-center gap-2 font-sans text-xs text-text-muted">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={handleToggleShowArchived}
          className="h-3.5 w-3.5 rounded border-border-default text-action-primary focus:ring-action-primary"
        />
        <span>{t('showArchivedToggle')}</span>
      </label>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col">
        {header}
        <div className="flex items-center justify-center py-8 text-sm text-text-muted">
          {t('loading')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        {header}
        <div className="px-4 py-6 text-center text-sm text-text-muted">
          {t('error')}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col">
        {header}
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-text-muted">
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            aria-hidden
            className="h-5 w-5 opacity-50"
          />
          <span>{t('empty')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {header}
      <ul className="flex flex-col gap-1 px-2 py-2">
      {items.map((convo) => {
        const isActive = convo.id === currentConversationId;
        const isConfirming = pendingArchive === convo.id;
        const isArchived = Boolean(convo.archived_at);
        return (
          <li key={convo.id}>
            <div
              className={cn(
                'group flex items-center gap-1 rounded-xl pr-1 transition-colors',
                'hover:bg-surface-subtle focus-within:bg-surface-subtle',
                isActive && 'bg-action-primary/10',
                // Archived rows mute by default — clear visual signal
                // ("not part of the working set") that lifts on hover so
                // the owner can still read details and act on them.
                isArchived && 'opacity-60 hover:opacity-100',
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
                    'flex items-center gap-1.5 truncate text-sm',
                    isActive
                      ? 'font-semibold text-action-primary'
                      : 'text-text-primary',
                  )}
                >
                  <span className="truncate">
                    {convo.title || t('untitled')}
                  </span>
                  {isArchived && (
                    <span className="shrink-0 rounded-full bg-surface-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                      {t('archivedBadge')}
                    </span>
                  )}
                </span>
                <time
                  dateTime={convo.last_message_at}
                  className="text-xs text-text-muted"
                >
                  {formatRelativeTime(convo.last_message_at, locale)}
                </time>
              </button>
              {/*
                Confirm/cancel pair — Krug's "Don't Make Me Think":
                instead of a single icon button that toggles state
                ("orange means click-again-to-confirm"), we show TWO
                explicit buttons when the user has tapped archive:
                ✓ "Archivar" (committal, warning-tinted) and ✗
                cancel. Universal yes/no convention; no tooltip
                hover required to know what does what.

                Default state: only the archive icon, invisible until
                the row is hovered (keeps the list visually quiet).
              */}
              {isArchived ? (
                <>
                  {pendingHardDelete === convo.id ? (
                    <>
                      <button
                        type="button"
                        data-archive-button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleHardDelete(convo.id);
                        }}
                        className={cn(
                          'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
                          'bg-action-danger/15 text-action-danger',
                          'hover:bg-action-danger/25',
                          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                        )}
                        aria-label={t('hardDelete')}
                        title={t('hardDelete')}
                      >
                        <FontAwesomeIcon
                          icon={faCheck}
                          aria-hidden
                          className="h-3 w-3"
                        />
                        <span>{t('hardDelete')}</span>
                      </button>
                      <button
                        type="button"
                        data-archive-button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelPending();
                        }}
                        className={cn(
                          'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                          'text-text-muted hover:bg-surface-card hover:text-text-primary',
                          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                        )}
                        aria-label={t('hardDeleteCancel')}
                        title={t('hardDeleteCancel')}
                      >
                        <FontAwesomeIcon icon={faXmark} aria-hidden />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        data-archive-button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleUnarchive(convo.id);
                        }}
                        className={cn(
                          'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
                          'text-text-muted hover:bg-surface-card hover:text-text-primary',
                          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                        )}
                        aria-label={t('restore')}
                        title={t('restore')}
                      >
                        <FontAwesomeIcon
                          icon={faRotateLeft}
                          aria-hidden
                          className="h-3 w-3"
                        />
                        <span>{t('restore')}</span>
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          data-archive-button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleHardDelete(convo.id);
                          }}
                          className={cn(
                            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs transition-colors',
                            'text-text-muted opacity-0',
                            'group-hover:opacity-100 focus:opacity-100',
                            'hover:bg-action-danger/10 hover:text-action-danger',
                            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                          )}
                          aria-label={t('hardDelete')}
                          title={t('hardDelete')}
                        >
                          <FontAwesomeIcon icon={faTrash} aria-hidden />
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : isConfirming ? (
                <>
                  <button
                    type="button"
                    data-archive-button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleArchive(convo.id);
                    }}
                    className={cn(
                      'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
                      'bg-feedback-warning/15 text-feedback-warning',
                      'hover:bg-feedback-warning/25',
                      'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                    )}
                    aria-label={t('archive')}
                    title={t('archive')}
                  >
                    <FontAwesomeIcon
                      icon={faCheck}
                      aria-hidden
                      className="h-3 w-3"
                    />
                    <span>{t('archive')}</span>
                  </button>
                  <button
                    type="button"
                    data-archive-button
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelPending();
                    }}
                    className={cn(
                      'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                      'text-text-muted hover:bg-surface-card hover:text-text-primary',
                      'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                    )}
                    aria-label={t('archiveCancel')}
                    title={t('archiveCancel')}
                  >
                    <FontAwesomeIcon icon={faXmark} aria-hidden />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  data-archive-button
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleArchive(convo.id);
                  }}
                  className={cn(
                    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs transition-colors',
                    'text-text-muted opacity-0',
                    'group-hover:opacity-100 focus:opacity-100',
                    'hover:bg-surface-card hover:text-text-primary',
                    'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  )}
                  aria-label={t('archive')}
                  title={t('archive')}
                >
                  <FontAwesomeIcon icon={faBoxArchive} aria-hidden />
                </button>
              )}
            </div>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
