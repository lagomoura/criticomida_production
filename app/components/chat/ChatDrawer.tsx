'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faClockRotateLeft,
  faComments,
  faPaperPlane,
  faPenToSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { ChatAgent, DishCardData, MapPayload } from '@/app/lib/api/chat';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { cn } from '@/app/lib/utils/cn';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import { useChatStream } from './useChatStream';

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  agent?: ChatAgent;
  restaurantScopeId?: string | null;
  /**
   * Restaurant slug for the Business agent. Threaded down to
   * ``MessageList`` so it can build the "Responder esta reseña" deep
   * link from a chat draft into the owner dashboard's review modal.
   * Required for ``agent='business'`` flows where drafting happens;
   * harmless when omitted (the deep-link button just won't render).
   */
  restaurantSlug?: string | null;
}

/**
 * Single chat surface that adapts to viewport:
 * - Mobile: bottom sheet at 90vh (cards + map fit comfortably).
 * - Desktop: right-side drawer ~480px wide.
 */
export default function ChatDrawer({
  open,
  onClose,
  agent = 'sommelier',
  restaurantScopeId = null,
  restaurantSlug = null,
}: ChatDrawerProps) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuthContext();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    conversationId,
    messages,
    isStreaming,
    error,
    send,
    abort,
    reset,
    loadConversation,
  } = useChatStream({ agent, restaurantScopeId });

  const [historyOpen, setHistoryOpen] = useState(false);

  // Authenticated owners only — anonymous sessions can't enumerate
  // their conversations (the endpoint requires auth) so we hide the
  // button entirely instead of showing a broken state.
  const showHistoryButton = Boolean(user);

  const onPickConversation = async (id: string) => {
    setHistoryOpen(false);
    await loadConversation(id);
  };

  // Focus input on open + cancel any in-flight stream on close.
  useEffect(() => {
    if (open) {
      // Defer to next tick so the drawer is visible before focusing.
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    abort();
  }, [open, abort]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    void send(text);
  }

  function onShowDishOnMap(dish: DishCardData) {
    if (!dish.restaurant.lat || !dish.restaurant.lng) return;
    const payload: MapPayload = {
      action: 'open_in_map',
      center: { lat: dish.restaurant.lat, lng: dish.restaurant.lng, zoom: 15 },
      dish_ids: [dish.dish_id],
    };
    const params = new URLSearchParams({
      lat: String(payload.center?.lat),
      lng: String(payload.center?.lng),
      zoom: '15',
      dishes: dish.dish_id,
    });
    router.push(`/${locale}/mapa?${params.toString()}`);
    onClose();
  }

  if (!open) return null;

  const greeting = user?.display_name
    ? t('greetingNamed', { name: user.display_name })
    : t('greetingAnon');

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t('close')}
        onClick={onClose}
        className="fixed inset-0 z-[1100] bg-black/30 backdrop-blur-[2px]"
      />

      {/* Drawer / sheet */}
      <aside
        role="dialog"
        aria-label={t('title')}
        aria-modal="true"
        className={cn(
          'fixed z-[1101] flex flex-col overflow-hidden bg-surface-card shadow-[var(--shadow-floating)]',
          // Mobile: bottom sheet
          'inset-x-0 bottom-0 h-[90vh] rounded-t-3xl',
          // Desktop: right drawer
          'md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[440px] md:rounded-none md:rounded-l-3xl',
        )}
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center py-2 md:hidden">
          <span className="h-1 w-10 rounded-full bg-border-default" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle px-4 py-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faComments}
              aria-hidden
              className="text-action-primary"
            />
            <div className="flex flex-col">
              <span className="font-display text-base font-medium text-text-primary">
                {agent === 'business' ? t('businessTitle') : t('title')}
              </span>
              {messages.length === 0 && (
                <span className="text-xs text-text-muted">{greeting}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {showHistoryButton && (
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors',
                  'hover:bg-surface-card hover:text-text-primary',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  historyOpen && 'bg-surface-card text-action-primary',
                )}
                aria-label={t('history')}
                aria-expanded={historyOpen}
                title={t('history')}
              >
                <FontAwesomeIcon icon={faClockRotateLeft} aria-hidden />
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setHistoryOpen(false);
                  reset();
                }}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors',
                  'hover:bg-surface-card hover:text-text-primary',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                )}
                aria-label={t('newConversation')}
                title={t('newConversation')}
              >
                <FontAwesomeIcon icon={faPenToSquare} aria-hidden />
              </button>
            )}
            <button
              onClick={onClose}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors',
                'hover:bg-surface-card hover:text-text-primary',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              )}
              aria-label={t('close')}
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {historyOpen ? (
            <ConversationList
              agent={agent}
              restaurantScopeId={restaurantScopeId}
              currentConversationId={conversationId}
              onPick={onPickConversation}
              onArchivedActive={() => {
                // The active conversation just got archived: clear
                // the chat surface so the owner doesn't keep typing
                // into a hidden conversation. ``reset`` also wipes
                // the localStorage pointer.
                reset();
              }}
            />
          ) : (
            <MessageList
              messages={messages}
              isStreaming={isStreaming}
              onShowDishOnMap={onShowDishOnMap}
              draftDeepLinkSlug={
                agent === 'business' ? restaurantSlug ?? null : null
              }
              onDraftDeepLinkClick={onClose}
              emptyState={
                agent === 'business' ? (
                  <BusinessEmptyState
                    ownerName={user?.display_name ?? null}
                    onSendStarter={(text) => void send(text)}
                    disabled={isStreaming}
                  />
                ) : undefined
              }
            />
          )}
        </div>

        {error && (
          <div className="border-t border-border-subtle bg-surface-subtle px-4 py-2 text-xs text-text-muted">
            {error}
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-border-subtle bg-surface-card p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={t('placeholder')}
              rows={1}
              className={cn(
                'flex-1 resize-none rounded-md border border-border-default bg-surface-card px-3 py-2 font-sans text-sm text-text-primary',
                'placeholder:text-text-muted',
                'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
                'disabled:opacity-60',
              )}
              style={{ minHeight: '38px', maxHeight: '120px' }}
              disabled={isStreaming}
              aria-label={t('placeholder')}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming}
              className={cn(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                'bg-action-primary text-text-inverse transition-colors',
                'hover:bg-action-primary-hover',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              )}
              aria-label={t('send')}
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                aria-hidden
                className="h-3.5 w-3.5"
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface BusinessEmptyStateProps {
  ownerName: string | null;
  /** Click handler for starter chips. The chip's question is sent
   *  straight as a user turn — no "fill the input first" step,
   *  because adding a step would defeat the icebreaker purpose. */
  onSendStarter: (text: string) => void;
  /** Disable chips while another turn is in flight. */
  disabled?: boolean;
}

/**
 * Empty state for the Business agent — both the warm welcome and the
 * "icebreaker" surface.
 *
 * The four starter chips below the greeting are the entry point that
 * actually exercises the owner's KPI preferences: clicking a chip
 * fires a real user turn and the agent answers using whatever tone /
 * language / KPI focus the owner pinned in the settings panel. So
 * the copy in ``ownerSettings.kpis.hint`` ("the ones you want to see
 * first when the agent answers a summary") cashes out HERE — not in
 * an autonomous greeting.
 *
 * Mobile + desktop fit: the chips wrap into rows; we keep them
 * concise (under ~7 words) so two fit per row on a 360-px screen.
 */
function BusinessEmptyState({
  ownerName,
  onSendStarter,
  disabled = false,
}: BusinessEmptyStateProps) {
  const t = useTranslations('chat.businessEmpty');
  // Keys + i18n payload kept side-by-side: each starter has a short
  // chip label and a longer message that's actually sent. The labels
  // stay scannable; the messages give the agent enough context.
  const starters: { key: string; label: string; message: string }[] = [
    {
      key: 'pending',
      label: t('starters.pending.label'),
      message: t('starters.pending.message'),
    },
    {
      key: 'summary',
      label: t('starters.summary.label'),
      message: t('starters.summary.message'),
    },
    {
      key: 'negatives',
      label: t('starters.negatives.label'),
      message: t('starters.negatives.message'),
    },
    {
      key: 'benchmark',
      label: t('starters.benchmark.label'),
      message: t('starters.benchmark.message'),
    },
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <span
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full',
          'bg-action-primary/10 text-action-primary',
          'shadow-[var(--shadow-floating)]',
        )}
        aria-hidden
      >
        <FontAwesomeIcon icon={faChartLine} className="h-8 w-8" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-xl text-text-primary">
          {ownerName ? t('greeting', { name: ownerName }) : t('greetingAnon')}
        </h2>
        <p className="text-sm text-text-muted">{t('subtitle')}</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-wider text-text-muted">
          {t('startersHeading')}
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {starters.map((starter) => (
            <li key={starter.key}>
              <button
                type="button"
                onClick={() => onSendStarter(starter.message)}
                disabled={disabled}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full',
                  'border border-border-default bg-surface-card px-3 py-1.5',
                  'font-sans text-xs font-medium text-text-primary',
                  'transition-colors hover:border-action-primary hover:bg-action-primary/5',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                {starter.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
