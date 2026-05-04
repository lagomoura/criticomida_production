'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  CreateRouteResult,
  DishCardData,
  MapPayload,
  SearchDishesResult,
} from '@/app/lib/api/chat';
import { cn } from '@/app/lib/utils/cn';
import DishCard from './cards/DishCard';
import MapEmbed from './cards/MapEmbed';
import RouteCard from './cards/RouteCard';
import { UiMessage, UiToolInvocation } from './useChatStream';

interface MessageListProps {
  messages: UiMessage[];
  isStreaming: boolean;
  /** Optional handler so cards can ask the parent to open the map. */
  onShowDishOnMap?: (dish: DishCardData) => void;
}

export default function MessageList({
  messages,
  isStreaming,
  onShowDishOnMap,
}: MessageListProps) {
  const t = useTranslations('chat');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-text-muted">
        {t('emptyState')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {messages.map((msg) => (
        <MessageRow
          key={msg.id}
          message={msg}
          onShowDishOnMap={onShowDishOnMap}
        />
      ))}
      {isStreaming &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'assistant' &&
        messages[messages.length - 1].content === '' && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}

interface MessageRowProps {
  message: UiMessage;
  onShowDishOnMap?: (dish: DishCardData) => void;
}

function MessageRow({ message, onShowDishOnMap }: MessageRowProps) {
  const isUser = message.role === 'user';
  const renderedTools = isUser ? [] : collapseChipDuplicates(message.tools);

  return (
    <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
      {/*
        Tool invocations render BEFORE the assistant text. That's the
        causal order — the agent runs the tool first and then replies
        based on the result, so showing "✓ Platos rankeados" above
        the answer reads more naturally and also aligns with the
        streaming sequence (tool_call_start arrives before text_delta).
      */}
      {renderedTools.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {renderedTools.map((tool) => (
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
    </div>
  );
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
  if (tool.name === 'search_dishes') {
    const result = tool.output as SearchDishesResult | null;
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
  'search_dishes',
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
 * any TypeScript: only the i18n catalog (optional, falls back gracefully).
 */
function labelForTool(
  t: ToolsTranslator,
  state: 'pending' | 'completed',
  toolName: string,
): string {
  try {
    return t(`${state}.${toolName}` as Parameters<ToolsTranslator>[0]);
  } catch {
    return t(`${state}.generic` as Parameters<ToolsTranslator>[0]);
  }
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
