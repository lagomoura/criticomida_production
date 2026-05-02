'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatAgent,
  ChatMessageData,
  StreamEvent,
  streamChat,
} from '@/app/lib/api/chat';

export interface UiMessage {
  /** Stable id for React keying. */
  id: string;
  role: 'user' | 'assistant';
  /** Plain text content; for assistant rows this fills incrementally. */
  content: string;
  /** Tool invocations the assistant emitted within this turn. */
  tools: UiToolInvocation[];
}

export interface UiToolInvocation {
  id: string;
  name: string;
  input?: Record<string, unknown>;
  /** Set when the tool has finished. */
  output?: unknown;
  isError?: boolean;
  /** ``true`` while the tool is running. */
  pending: boolean;
}

interface UseChatStreamOptions {
  agent: ChatAgent;
  restaurantScopeId?: string | null;
}

interface UseChatStreamApi {
  conversationId: string | null;
  messages: UiMessage[];
  isStreaming: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  abort: () => void;
  reset: () => void;
  hydrate: (history: ChatMessageData[]) => void;
  setConversationId: (id: string | null) => void;
}

/**
 * Drives a chat conversation against /api/chat/stream.
 *
 * The hook keeps a UI-friendly view of the transcript (one row per
 * user/assistant message) and folds tool calls into the assistant row
 * they belong to so the renderer can interleave cards naturally.
 */
export function useChatStream({
  agent,
  restaurantScopeId = null,
}: UseChatStreamOptions): UseChatStreamApi {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight request when the component unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setConversationId(null);
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const hydrate = useCallback((history: ChatMessageData[]) => {
    // Translate persisted DB rows into the UI shape. ``role='tool'``
    // rows are folded into the preceding assistant row.
    const ui: UiMessage[] = [];
    let lastAssistant: UiMessage | null = null;

    for (const row of history) {
      if (row.role === 'user') {
        ui.push({
          id: row.id || crypto.randomUUID(),
          role: 'user',
          content: row.content || '',
          tools: [],
        });
        lastAssistant = null;
      } else if (row.role === 'assistant') {
        const m: UiMessage = {
          id: row.id || crypto.randomUUID(),
          role: 'assistant',
          content: row.content || '',
          tools: (row.tool_calls || []).map((tc) => ({
            id: tc.id,
            name: tc.name,
            pending: true,
          })),
        };
        ui.push(m);
        lastAssistant = m;
      } else if (row.role === 'tool' && lastAssistant && row.tool_result) {
        const tr = row.tool_result;
        const tool = lastAssistant.tools.find((t) => t.id === tr.id);
        if (tool) {
          tool.output = tr.content;
          tool.isError = tr.is_error;
          tool.pending = false;
        } else {
          lastAssistant.tools.push({
            id: tr.id,
            name: tr.name,
            output: tr.content,
            isError: tr.is_error,
            pending: false,
          });
        }
      }
    }
    setMessages(ui);
  }, []);

  const applyEvent = useCallback(
    (ev: StreamEvent, assistantId: string) => {
      switch (ev.type) {
        case 'conversation':
          setConversationId(ev.data.id);
          break;
        case 'text_delta':
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + ev.data }
                : m,
            ),
          );
          break;
        case 'tool_call_start':
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    tools: [
                      ...m.tools,
                      {
                        id: ev.data.id,
                        name: ev.data.name,
                        input: ev.data.input,
                        pending: true,
                      },
                    ],
                  }
                : m,
            ),
          );
          break;
        case 'tool_call_result':
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    tools: m.tools.map((t) =>
                      t.id === ev.data.id
                        ? {
                            ...t,
                            output: ev.data.output,
                            isError: ev.data.is_error,
                            pending: false,
                          }
                        : t,
                    ),
                  }
                : m,
            ),
          );
          break;
        case 'card':
          // Card is already covered by the matching tool_call_result.
          // We could surface a Toast or animation here in the future.
          break;
        case 'error': {
          const msg =
            typeof ev.data === 'string'
              ? ev.data
              : ev.data?.message || 'Error en el chat.';
          setError(msg);
          break;
        }
        case 'done':
          setIsStreaming(false);
          break;
      }
    },
    [],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const controller = new AbortController();
      abortRef.current = controller;
      setError(null);
      setIsStreaming(true);

      const userMsg: UiMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        tools: [],
      };
      const assistantMsg: UiMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        tools: [],
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      try {
        for await (const ev of streamChat(
          {
            message: trimmed,
            conversation_id: conversationId,
            agent,
            restaurant_scope_id: restaurantScopeId,
          },
          controller.signal,
        )) {
          applyEvent(ev, assistantMsg.id);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg =
          err instanceof Error ? err.message : 'Algo falló en el chat.';
        setError(msg);
      } finally {
        setIsStreaming(false);
      }
    },
    [agent, conversationId, isStreaming, restaurantScopeId, applyEvent],
  );

  return {
    conversationId,
    messages,
    isStreaming,
    error,
    send,
    abort,
    reset,
    hydrate,
    setConversationId,
  };
}
