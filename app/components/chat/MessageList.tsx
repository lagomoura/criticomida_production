'use client';

import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from '@/app/lib/i18n/navigation';
import {
  ComparisonResult,
  CreateRouteResult,
  DishCardData,
  MapPayload,
  SearchDishesResult,
} from '@/app/lib/api/chat';
import { cn } from '@/app/lib/utils/cn';
import ComparisonCard from './cards/ComparisonCard';
import DishCard from './cards/DishCard';
import MapEmbed from './cards/MapEmbed';
import RouteCard from './cards/RouteCard';
import { UiMessage, UiToolInvocation } from './useChatStream';

interface MessageListProps {
  messages: UiMessage[];
  isStreaming: boolean;
  /** Optional handler so cards can ask the parent to open the map. */
  onShowDishOnMap?: (dish: DishCardData) => void;
  /**
   * Slug of the restaurant whose owner panel should receive the
   * "Responder esta reseña" deep link. When set, ``MessageList``
   * renders a button below assistant drafts (text that follows a
   * ``suggest_review_response`` tool call) that pre-loads the draft
   * into ``OwnerReviewModal``. ``null`` disables the affordance —
   * useful for the global Sommelier launcher where there's no owner
   * context to land on.
   */
  draftDeepLinkSlug?: string | null;
  /**
   * Fired synchronously when the deep-link button is clicked, just
   * before navigation. ``ChatDrawer`` wires this to its ``onClose``
   * so the drawer slides off and the ``OwnerReviewModal`` becomes
   * visible — without it the modal opens behind the still-open
   * drawer and the owner has no idea the click did anything.
   */
  onDraftDeepLinkClick?: () => void;
  /**
   * Custom empty state node. When omitted falls back to the generic
   * Sommelier hint (``chat.emptyState``). The Business agent passes
   * its own polished version because the Sommelier example doesn't
   * apply to the owner-facing chat.
   */
  emptyState?: ReactNode;
}

export default function MessageList({
  messages,
  isStreaming,
  onShowDishOnMap,
  draftDeepLinkSlug = null,
  onDraftDeepLinkClick,
  emptyState,
}: MessageListProps) {
  const t = useTranslations('chat');
  const endRef = useRef<HTMLDivElement>(null);

  // Pair each assistant draft (text bubble that follows a
  // ``suggest_review_response`` tool call) with the review id the
  // tool was invoked against. We compute the map once per render so
  // ``MessageRow`` can do an O(1) lookup. Drafts without a known
  // ``review_id`` (history rows without ``arguments`` or a malformed
  // payload) are skipped — better to hide the button than to land
  // the owner on a 404.
  const draftAnchors = useMemo(
    () => (draftDeepLinkSlug ? buildDraftAnchors(messages) : new Map()),
    [messages, draftDeepLinkSlug],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-text-muted">
        {emptyState ?? t('emptyState')}
      </div>
    );
  }

  const lastIndex = messages.length - 1;
  const lastMessage = lastIndex >= 0 ? messages[lastIndex] : null;
  // ``inflightAssistantId`` is the id of the assistant turn whose text
  // hasn't started arriving yet. We use it inside ``MessageRow`` to
  // suppress completed-tool cards during the gap between
  // ``tool_call_result`` (cards ready) and ``text_delta`` (first
  // editorial token). Without this gating the user sees the cards
  // pop in first and the framing sentence sliding in above them
  // ~half a second later — that order made irrelevant cards look
  // like the answer instead of supporting context.
  const inflightAssistantId =
    isStreaming &&
    lastMessage &&
    lastMessage.role === 'assistant' &&
    lastMessage.content === ''
      ? lastMessage.id
      : null;

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {messages.map((msg) => (
        <MessageRow
          key={msg.id}
          message={msg}
          onShowDishOnMap={onShowDishOnMap}
          draftReviewId={draftAnchors.get(msg.id) ?? null}
          draftDeepLinkSlug={draftDeepLinkSlug}
          onDraftDeepLinkClick={onDraftDeepLinkClick}
          isInflight={msg.id === inflightAssistantId}
        />
      ))}
      {inflightAssistantId !== null && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}

interface MessageRowProps {
  message: UiMessage;
  onShowDishOnMap?: (dish: DishCardData) => void;
  /** Review id this assistant message drafts a response for, or
   *  ``null`` if it isn't a draft. Computed in the parent so we
   *  don't re-scan history on every row render. */
  draftReviewId?: string | null;
  draftDeepLinkSlug?: string | null;
  onDraftDeepLinkClick?: () => void;
  /** True while the LLM is still generating this turn AND the
   *  text bubble is empty. Used to defer card rendering until the
   *  framing sentence starts arriving. */
  isInflight?: boolean;
}

function MessageRow({
  message,
  onShowDishOnMap,
  draftReviewId,
  draftDeepLinkSlug,
  onDraftDeepLinkClick,
  isInflight = false,
}: MessageRowProps) {
  const isUser = message.role === 'user';
  const renderedTools = isUser ? [] : collapseChipDuplicates(message.tools);
  const showDraftLink =
    !isUser &&
    Boolean(draftReviewId) &&
    Boolean(draftDeepLinkSlug) &&
    Boolean(message.content);

  // Pending tool invocations (the spinning chips) belong above the
  // text — they signal the agent is still working and the empty bubble
  // would look broken. Completed tools (the dish/route/map cards) go
  // BELOW the text: the editorial sentence frames what the cards mean
  // ("te recomiendo solo Café Turco"), and the cards are visual
  // reinforcement. Showing 6 unrelated cards above a one-sentence
  // recommendation made the irrelevant grid look like the answer.
  //
  // While the message is inflight (LLM still generating, no text yet)
  // we DON'T reveal the completed cards. The streaming order is
  // tool_call_result → text_delta, so without this gate the cards
  // would land first and the framing sentence would slide in above
  // them ~500ms later. We keep showing the completed tools as
  // chips-style indicators (via ``ToolInvocation`` itself, which
  // collapses into a small "Resultado" line when the card section
  // is hidden) so the comensal still sees that something happened.
  const pendingTools = renderedTools.filter((t) => t.pending);
  const completedTools = renderedTools.filter((t) => !t.pending);
  const showCompletedCards = !isInflight || Boolean(message.content);

  return (
    <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
      {pendingTools.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {pendingTools.map((tool) => (
            <ToolInvocation
              key={tool.id}
              tool={tool}
              onShowDishOnMap={onShowDishOnMap}
            />
          ))}
        </div>
      )}
      {message.content && (
        <div
          className={cn(
            'max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans text-sm leading-relaxed',
            isUser
              ? 'whitespace-pre-wrap rounded-br-sm bg-action-primary text-text-inverse'
              : 'rounded-bl-sm bg-surface-subtle text-text-primary',
          )}
        >
          {isUser ? (
            message.content
          ) : (
            <AssistantContent text={message.content} />
          )}
        </div>
      )}
      {showCompletedCards && completedTools.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {completedTools.map((tool) => (
            <ToolInvocation
              key={tool.id}
              tool={tool}
              onShowDishOnMap={onShowDishOnMap}
            />
          ))}
        </div>
      )}
      {showDraftLink && (
        <DraftDeepLink
          slug={draftDeepLinkSlug as string}
          reviewId={draftReviewId as string}
          draftText={extractDraftFromBlockquote(message.content)}
          onClick={onDraftDeepLinkClick}
        />
      )}
    </div>
  );
}

interface DraftDeepLinkProps {
  slug: string;
  reviewId: string;
  draftText: string;
  /** Fired synchronously on click so the caller (``ChatDrawer``) can
   *  close itself before the navigation lands. Without this the
   *  modal opens behind the still-open drawer. */
  onClick?: () => void;
}

/**
 * Action that opens ``OwnerReviewModal`` with the agent's draft
 * pre-loaded. Why a button anchor and not a plain text hint: the
 * owner expects to ACT on a draft, not re-read it. DMMT — make the
 * affordance unambiguous (memory ``feedback_dmmt.md``).
 *
 * The draft travels in the URL query string. Drafts are typically
 * 200–600 characters; even a generous one stays well under common
 * URL length caps. If we ever ship long-form drafts we'll switch to
 * sessionStorage with a short id.
 */
function DraftDeepLink({
  slug,
  reviewId,
  draftText,
  onClick,
}: DraftDeepLinkProps) {
  const t = useTranslations('chat');
  const href = `/restaurants/${slug}/owner?review=${encodeURIComponent(
    reviewId,
  )}&draft=${encodeURIComponent(draftText)}`;
  return (
    <Link
      href={href}
      onClick={() => onClick?.()}
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full',
        'bg-action-primary px-3.5 py-1.5 text-xs font-semibold text-text-inverse',
        'no-underline transition-colors hover:bg-action-primary-hover',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
      )}
    >
      {t('respondReviewWithDraft')}
    </Link>
  );
}

/**
 * Build a map from assistant-message id to the review id its draft
 * targets.
 *
 * Heuristic: an assistant message is treated as a draft when (a) it
 * has text content and (b) the most recent ``suggest_review_response``
 * invocation in the same turn or the immediately preceding assistant
 * turn carries a ``review_id`` argument we can extract. This matches
 * Claude's typical loop shape — assistant turn 1 calls the tool,
 * assistant turn 2 emits the draft text — without coupling the FE to
 * the exact iteration count.
 */
function buildDraftAnchors(messages: UiMessage[]): Map<string, string> {
  const anchors = new Map<string, string>();
  let pendingReviewId: string | null = null;
  for (const msg of messages) {
    if (msg.role !== 'assistant') {
      pendingReviewId = null;
      continue;
    }

    const ownReviewId = extractDraftReviewId(msg.tools);
    if (ownReviewId && msg.content) {
      // Same-turn case: assistant emitted text + tool call together.
      anchors.set(msg.id, ownReviewId);
      pendingReviewId = null;
      continue;
    }

    if (pendingReviewId && msg.content) {
      anchors.set(msg.id, pendingReviewId);
      pendingReviewId = null;
      continue;
    }

    if (ownReviewId) {
      // Tool call now, draft text in the next assistant turn.
      pendingReviewId = ownReviewId;
    }
  }
  return anchors;
}

/**
 * Extract the actual reply text from an assistant draft message.
 *
 * The Business agent is instructed (see ``suggest_review_response``
 * tool's ``format`` field) to wrap the draft in a markdown
 * blockquote — one short intro line ("Te propongo este draft…") and
 * then ``> ``-prefixed lines containing the proposed reply. Without
 * this extraction, clicking "Responder esta reseña" pre-fills the
 * owner's modal with the agent's intro phrase included, which then
 * gets published to the customer if the owner doesn't notice.
 *
 * Behaviour:
 * - If the message contains a contiguous blockquote block, return
 *   its text with the leading ``> `` markers stripped.
 * - If no blockquote is found (the model disobeyed the format),
 *   fall back to the full content. Better to ship the intro than
 *   to land on an empty modal.
 *
 * Blank lines INSIDE a blockquote (paragraph breaks the agent might
 * use for multi-paragraph drafts) are preserved. The first non-quote
 * non-blank line ends the block.
 */
function extractDraftFromBlockquote(messageContent: string): string {
  const lines = messageContent.split('\n');
  const quoted: string[] = [];
  let inQuote = false;
  let pendingBlank = false;

  for (const line of lines) {
    const match = line.match(/^>+\s?(.*)$/);
    if (match) {
      if (pendingBlank) {
        quoted.push('');
        pendingBlank = false;
      }
      quoted.push(match[1]);
      inQuote = true;
      continue;
    }
    if (!inQuote) continue;
    if (line.trim() === '') {
      // Could be an internal paragraph break or the gap before the
      // closing intro paragraph. Defer the decision to the next line.
      pendingBlank = true;
      continue;
    }
    // Non-quote, non-blank: end of blockquote.
    break;
  }

  if (quoted.length === 0) {
    return messageContent.trim();
  }
  return quoted.join('\n').trim();
}


function extractDraftReviewId(tools: UiToolInvocation[]): string | null {
  for (const tool of tools) {
    if (tool.name !== 'suggest_review_response') continue;
    const input = tool.input;
    if (!input || typeof input !== 'object') continue;
    const value = (input as Record<string, unknown>).review_id;
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

interface ToolInvocationProps {
  tool: UiToolInvocation;
  onShowDishOnMap?: (dish: DishCardData) => void;
}

function ToolInvocation({ tool, onShowDishOnMap }: ToolInvocationProps) {
  const t = useTranslations('chat.tools');

  if (tool.pending) {
    return (
      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-subtle px-3 py-1.5 text-xs text-text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-action-primary" />
        {labelForTool(t, 'pending', tool.name)}
      </div>
    );
  }

  if (tool.isError) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-3 py-2 text-xs text-text-muted">
        {t('error', { name: tool.name })}
      </div>
    );
  }

  // Render specific cards based on tool name.
  //
  // ``search_dishes`` is **data-only** — it serves the agent context,
  // not the comensal. So when it completes we fall through to the
  // generic chip path ("Consulté el catálogo"). The visible card grid
  // comes from ``recommend_dishes`` below, which the agent only fires
  // for the curated subset it actually wants to recommend. Splitting
  // these responsibilities is what keeps the visible grid in sync
  // with the agent's editorial text.
  if (tool.name === 'recommend_dishes') {
    const raw = tool.output as Record<string, unknown> | null;
    // The handler returns ``{"error": ...}`` on resolver failures
    // (no_valid_ids, no_match, missing uuids). The agent reads that
    // and typically recovers in the next iteration with a corrected
    // call — so showing an "empty grid" card here would just
    // contradict the rest of the answer. Skip rendering anything
    // and let the generic completed-tool chip carry the signal.
    if (raw && typeof raw === 'object' && 'error' in raw) {
      return null;
    }
    const result = raw as unknown as SearchDishesResult | null;
    if (!result || !Array.isArray(result.dishes) || result.dishes.length === 0) {
      return (
        <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-3 py-2 text-xs text-text-muted">
          {t('searchEmpty')}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {result.dishes.map((dish) => (
          <DishCard
            key={dish.dish_id}
            dish={dish}
            onShowOnMap={onShowDishOnMap}
          />
        ))}
      </div>
    );
  }

  if (tool.name === 'compare_dishes') {
    const raw = tool.output as Record<string, unknown> | null;
    // Same idea as recommend_dishes: when the handler returns an
    // error / disambiguation payload, the agent recovers next
    // iteration. Don't paint a misleading "empty grid" card.
    if (raw && typeof raw === 'object' && 'error' in raw) {
      return null;
    }
    if (raw && typeof raw === 'object' && 'needs_disambiguation' in raw) {
      return null;
    }
    const result = raw as unknown as ComparisonResult | null;
    if (!result || !Array.isArray(result.dishes) || result.dishes.length === 0) {
      return (
        <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-3 py-2 text-xs text-text-muted">
          {t('searchEmpty')}
        </div>
      );
    }
    return <ComparisonCard result={result} onShowDishOnMap={onShowDishOnMap} />;
  }

  if (tool.name === 'open_in_map') {
    const payload = tool.output as MapPayload;
    return <MapEmbed payload={payload} />;
  }

  if (tool.name === 'create_dish_route') {
    const result = tool.output as CreateRouteResult;
    return <RouteCard result={result} />;
  }

  if (tool.name === 'add_to_wishlist') {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-3 py-2 text-xs text-text-primary">
        {t('savedConfirm')}
      </div>
    );
  }

  if (tool.name === 'update_taste_profile') {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-3 py-2 text-xs text-text-primary">
        {t('profileUpdated')}
      </div>
    );
  }

  // Tools without a custom card (list_reviews, rank_my_dishes,
  // summarize_reviews_period, etc.) still leave a small "completed"
  // chip so the owner can see that the agent actually used a tool —
  // otherwise the assistant text appears out of nowhere and feels
  // opaque. This row is what makes "fue usada esta funcionalidad"
  // legible in the persisted transcript.
  return (
    <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-subtle px-2.5 py-1 font-sans text-[11px] text-text-muted">
      <span aria-hidden className="leading-none">✓</span>
      <span>{labelForTool(t, 'completed', tool.name)}</span>
    </div>
  );
}

/**
 * Markdown renderer for assistant text bubbles.
 *
 * The agent emits real markdown (``**bold**``, lists, links, etc.) and
 * we want it rendered as such — not shown as literal asterisks. We
 * keep the user's own bubble as plain text because they typically
 * type prose and treating ``**`` as bold there would surprise them.
 *
 * GFM is enabled so autolinks, strikethrough, and table-style fences
 * work without extra plugins. Component overrides apply the design
 * tokens used elsewhere (font weights, spacing, focusable links).
 */
function AssistantContent({ text }: { text: string }) {
  return (
    <div className="cc-chat-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text-strong">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-1 list-disc space-y-0.5 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1 list-decimal space-y-0.5 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h3 className="mb-1 mt-2 font-display text-base font-semibold first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="mb-1 mt-2 font-display text-base font-semibold first:mt-0">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="mb-1 mt-2 font-sans text-sm font-semibold first:mt-0">
              {children}
            </h5>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[0.85em]">
              {children}
            </code>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-action-primary underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-border-subtle pl-3 italic text-text-muted">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-2 border-border-subtle" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

type ToolsTranslator = ReturnType<typeof useTranslations<'chat.tools'>>;

/**
 * Tools that render their own bespoke card (DishCard, MapEmbed,
 * RouteCard, savedConfirm, profileUpdated). Multiple invocations of
 * these are *meaningful* — each call returns different content — so
 * we never dedup them. Everything else falls back to the generic
 * ✓ chip; consecutive identical chips are noise, so we collapse them.
 *
 * Single source of truth: this set drives both the render branch in
 * ``ToolInvocation`` and the dedup logic in ``collapseChipDuplicates``.
 */
const TOOLS_WITH_OWN_CARD = new Set([
  'recommend_dishes',
  'compare_dishes',
  'open_in_map',
  'create_dish_route',
  'add_to_wishlist',
  'update_taste_profile',
]);

/**
 * Collapse consecutive same-name chip invocations to one entry.
 *
 * The LLM may call the same chip-tool several times within one turn
 * (e.g. ``summarize_reviews_period`` for current month + prior month
 * + last quarter). Each call produces a separate ``UiToolInvocation``
 * with its own id and possibly different args. From the owner's UX
 * perspective, four "✓ Resumen del período calculado" stacked on top
 * of each other is visual noise — they only need to know the tool
 * was used. We keep the latest entry's status (so a still-pending
 * later call wins over an earlier completed one) and drop the rest.
 *
 * Card-rendering tools are exempt because each invocation legitimately
 * shows different content.
 */
function collapseChipDuplicates(
  tools: UiToolInvocation[],
): UiToolInvocation[] {
  const positionByName = new Map<string, number>();
  const out: UiToolInvocation[] = [];
  for (const tool of tools) {
    if (TOOLS_WITH_OWN_CARD.has(tool.name)) {
      out.push(tool);
      continue;
    }
    const existing = positionByName.get(tool.name);
    if (existing === undefined) {
      positionByName.set(tool.name, out.length);
      out.push(tool);
    } else {
      out[existing] = tool;
    }
  }
  return out;
}

/**
 * Resolve the chip label for a tool by name, with a generic fallback.
 *
 * Convention: the i18n catalog has ``chat.tools.{state}.{tool_name}``
 * for any tool we want a custom chip for, plus ``chat.tools.{state}.generic``
 * for everything else. New tools without dedicated copy fall back to
 * the generic verb — the chip still renders ("Tarea completada") so the
 * owner sees the tool ran. Adding a tool no longer requires touching
 * any TypeScript; the i18n entries are optional.
 *
 * Uses ``t.has`` (next-intl v4) instead of try/catch because next-intl
 * surfaces missing keys via a dev-mode notification channel that does
 * NOT throw — try/catch would silently miss the failure and the chip
 * would render the raw key (``"chat.tools.completed.foo"``).
 */
function labelForTool(
  t: ToolsTranslator,
  state: 'pending' | 'completed',
  toolName: string,
): string {
  const key = `${state}.${toolName}` as Parameters<ToolsTranslator>[0];
  if (t.has(key)) {
    return t(key);
  }
  return t(`${state}.generic` as Parameters<ToolsTranslator>[0]);
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-surface-subtle px-4 py-3">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
