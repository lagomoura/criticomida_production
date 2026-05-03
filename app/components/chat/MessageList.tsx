'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
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

  return (
    <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
      {message.content && (
        <div
          className={cn(
            'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 font-sans text-sm leading-relaxed',
            isUser
              ? 'rounded-br-sm bg-action-primary text-text-inverse'
              : 'rounded-bl-sm bg-surface-subtle text-text-primary',
          )}
        >
          {message.content}
        </div>
      )}
      {!isUser && message.tools.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {message.tools.map((tool) => (
            <ToolInvocation
              key={tool.id}
              tool={tool}
              onShowDishOnMap={onShowDishOnMap}
            />
          ))}
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
        {pendingLabelFor(tool.name, t)}
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

  // Unknown tool: don't try to render — the assistant text usually
  // already paraphrases what happened.
  return null;
}

type ToolsTranslator = ReturnType<typeof useTranslations<'chat.tools'>>;

function pendingLabelFor(toolName: string, t: ToolsTranslator): string {
  switch (toolName) {
    case 'search_dishes':
      return t('pending.search_dishes');
    case 'get_dish_detail':
      return t('pending.get_dish_detail');
    case 'add_to_wishlist':
      return t('pending.add_to_wishlist');
    case 'open_in_map':
      return t('pending.open_in_map');
    case 'update_taste_profile':
      return t('pending.update_taste_profile');
    case 'create_dish_route':
      return t('pending.create_dish_route');
    case 'request_reservation':
      return t('pending.request_reservation');
    case 'analyze_dish_pillar_drop':
      return t('pending.analyze_dish_pillar_drop');
    case 'benchmark_dish':
      return t('pending.benchmark_dish');
    case 'list_reviews':
      return t('pending.list_reviews');
    case 'rank_my_dishes':
      return t('pending.rank_my_dishes');
    case 'suggest_tags_from_photo':
      return t('pending.suggest_tags_from_photo');
    default:
      return t('pending.generic');
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
