'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatAgent,
  ChatClientContext,
  ChatMessageData,
  StreamEvent,
  listConversationMessages,
  streamChat,
} from '@/app/lib/api/chat';
import { checkWantToTry } from '@/app/lib/api/want-to-try';

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
  /**
   * A — Context Injection. Page-derived hint attached to EVERY
   * request while the diner sits on a contextual page (restaurant
   * detail, dish detail). It refreshes on navigation so a chat
   * thread that starts at restaurant X and follows a recommendation
   * into dish Y picks up the dish context on the next turn. Pass
   * ``null`` from non-contextual pages (eg. home) so the hook
   * stays inert.
   */
  clientContext?: ChatClientContext | null;
}

/**
 * Per-(agent, scope) localStorage key that holds the last conversation
 * the user was on. Letting the next page load resume that conversation
 * is what turns "F5 borra todo" into "F5 retoma donde estaba". Anonymous
 * sessions don't persist — the backend's ``listConversationMessages``
 * endpoint requires the user's cookie anyway, so a saved id without
 * auth is useless.
 */
function lastConvoStorageKey(
  agent: ChatAgent,
  scope: string | null,
): string {
  return `cc:chat:lastConvo:${agent}:${scope ?? '_'}`;
}

function readLastConversationId(
  agent: ChatAgent,
  scope: string | null,
): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(lastConvoStorageKey(agent, scope));
  } catch {
    return null;
  }
}

function writeLastConversationId(
  agent: ChatAgent,
  scope: string | null,
  id: string | null,
): void {
  if (typeof window === 'undefined') return;
  try {
    const key = lastConvoStorageKey(agent, scope);
    if (id) window.localStorage.setItem(key, id);
    else window.localStorage.removeItem(key);
  } catch {
    /* localStorage may be unavailable (private mode, quota) — fall back
       to in-memory only; the chat still works for the current session. */
  }
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
  /**
   * Load a previous conversation from history. Fetches its messages,
   * paints the chat surface with them, sets it as the active
   * conversation, and persists the choice so a refresh keeps it open.
   */
  loadConversation: (conversationId: string) => Promise<void>;
}


/**
 * Translate persisted DB rows into the UI shape used by ``MessageList``.
 *
 * Pure function — extracted so it can be shared between the on-mount
 * resume effect and the public ``hydrate`` / ``loadConversation``
 * paths. All tools coming from history are already finished, so we
 * always set ``pending: false``; live streaming uses a different
 * codepath that flips pending to false when the ``tool_call_result``
 * event arrives.
 */
function parseToolArguments(
  raw: string | null | undefined,
): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}


/**
 * Walk a hydrated message list and refresh the per-dish
 * ``want_to_try`` flag against the comensal's current wishlist.
 *
 * Why we need this: tool results are persisted in
 * ``chat_messages.tool_result`` at the moment of the original tool
 * call, so the ``want_to_try`` snapshot can be stale by the time the
 * conversation is rehydrated (the comensal may have saved or removed
 * the dish in between). One bulk lookup against
 * ``/api/users/me/want-to-try/check`` is enough to refresh every
 * card in the conversation. Anonymous callers fall back to the
 * persisted snapshot — the helper returns an empty set.
 *
 * The function is pure: it returns a new array of messages with
 * fresh ``want_to_try`` values, leaving the input untouched. Failure
 * to fetch (network blip) returns the input unchanged so the chat
 * never blocks on rehydrate.
 */
async function refreshWishlistFlags(
  messages: UiMessage[],
): Promise<UiMessage[]> {
  // Collect every dish_id mentioned by any tool output in any
  // assistant message. Tool outputs that paint cards
  // (``recommend_dishes``, ``compare_dishes``) carry a ``dishes``
  // array; we only look at those.
  const dishIds = new Set<string>();
  for (const m of messages) {
    for (const t of m.tools) {
      const out = t.output;
      if (!out || typeof out !== 'object' || Array.isArray(out)) continue;
      const dishes = (out as { dishes?: unknown }).dishes;
      if (!Array.isArray(dishes)) continue;
      for (const d of dishes) {
        if (d && typeof d === 'object' && 'dish_id' in d) {
          const id = (d as { dish_id: unknown }).dish_id;
          if (typeof id === 'string') dishIds.add(id);
        }
      }
    }
  }
  if (!dishIds.size) return messages;

  const savedSet = await checkWantToTry(Array.from(dishIds));
  if (!savedSet.size) {
    // Nothing matched (or anon caller). Skip the rebuild entirely.
    return messages;
  }
  return messages.map((m) => ({
    ...m,
    tools: m.tools.map((t) => {
      const out = t.output;
      if (!out || typeof out !== 'object' || Array.isArray(out)) return t;
      const dishes = (out as { dishes?: unknown }).dishes;
      if (!Array.isArray(dishes)) return t;
      const refreshed = dishes.map((d) => {
        if (
          d &&
          typeof d === 'object' &&
          'dish_id' in d &&
          typeof (d as { dish_id: unknown }).dish_id === 'string'
        ) {
          return {
            ...(d as Record<string, unknown>),
            want_to_try: savedSet.has(
              (d as { dish_id: string }).dish_id,
            ),
          };
        }
        return d;
      });
      return {
        ...t,
        output: { ...(out as Record<string, unknown>), dishes: refreshed },
      };
    }),
  }));
}


function historyToUiMessages(history: ChatMessageData[]): UiMessage[] {
  const out: UiMessage[] = [];
  let lastAssistant: UiMessage | null = null;
  for (const row of history) {
    if (row.role === 'user') {
      out.push({
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
          // ``arguments`` is the persisted JSON-string the LLM sent
          // for this call. Hydrating ``input`` keeps the resume flow
          // (history → UI) on par with the live stream where
          // ``tool_call_start`` already provides ``input`` directly,
          // and lets downstream renderers (e.g. the draft deep-link
          // in ``MessageList``) read tool arguments after a refresh.
          input: parseToolArguments(tc.arguments),
          pending: false,
        })),
      };
      out.push(m);
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
  return out;
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
  clientContext = null,
}: UseChatStreamOptions): UseChatStreamApi {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Snapshot of ``clientContext`` at mount time. Used by the
  // restore-on-mount effect to decide whether to resume the previous
  // conversation. We capture it in a ref (not a state/dep) so later
  // navigations don't re-trigger the effect — see the effect's
  // comment block for the UX rationale.
  const clientContextOnMountRef = useRef(clientContext);

  // Cancel any in-flight request when the component unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setConversationId(null);
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    writeLastConversationId(agent, restaurantScopeId, null);
  }, [agent, restaurantScopeId]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  // Restore the last conversation on mount (and whenever the
  // (agent, scope) pair changes — e.g. owner navigates between
  // restaurants). If the saved id no longer exists or the user is
  // anonymous, the API call returns an error and we silently start
  // fresh.
  //
  // A — Context Injection: the page-derived hint (``clientContext``)
  // is intentionally NOT a dependency of this effect. Otherwise
  // every client-side navigation between a contextual page and
  // anywhere else would reset the chat surface, which is jarring
  // when the diner is mid-conversation. We only consult the hint
  // ONCE — on initial mount, before the chat has been opened — so:
  //   • Deep-linking straight to a restaurant/dish (the most common
  //     way the context-injection feature is exercised) starts a
  //     fresh conversation that picks up the hint.
  //   • Arriving at the same page after navigating from elsewhere
  //     preserves whatever conversation was in progress; the
  //     comensal can hit "nueva conversación" from the header if
  //     they want a fresh thread that absorbs the new context.
  useEffect(() => {
    let cancelled = false;
    if (clientContextOnMountRef.current != null) {
      setConversationId(null);
      setMessages([]);
      return;
    }
    const savedId = readLastConversationId(agent, restaurantScopeId);
    if (!savedId) {
      setConversationId(null);
      setMessages([]);
      return;
    }
    listConversationMessages(savedId)
      .then(async (history) => {
        if (cancelled) return;
        const ui = historyToUiMessages(history);
        setConversationId(savedId);
        setMessages(ui);
        // Refresh the want_to_try flags against the live wishlist
        // — the persisted snapshot can lag if the comensal saved
        // the dish after the original tool call. Failure is silent
        // (the original snapshot stays).
        const refreshed = await refreshWishlistFlags(ui);
        if (cancelled) return;
        if (refreshed !== ui) setMessages(refreshed);
      })
      .catch(() => {
        // Saved id is stale (deleted, anon session, etc.). Drop it
        // and let the next user message create a fresh conversation.
        writeLastConversationId(agent, restaurantScopeId, null);
        if (cancelled) return;
        setConversationId(null);
        setMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [agent, restaurantScopeId]);

  const hydrate = useCallback((history: ChatMessageData[]) => {
    setMessages(historyToUiMessages(history));
  }, []);

  const loadConversation = useCallback(
    async (id: string) => {
      // User picked a past conversation from the history panel. Fetch
      // its messages, repaint, set it as active, and persist the
      // choice so a refresh keeps it open. Cancel any in-flight
      // streaming on the previous conversation first.
      abortRef.current?.abort();
      setIsStreaming(false);
      setError(null);
      try {
        const history = await listConversationMessages(id);
        const ui = historyToUiMessages(history);
        setMessages(ui);
        setConversationId(id);
        writeLastConversationId(agent, restaurantScopeId, id);
        // Refresh the want_to_try flags after the initial paint —
        // see the on-mount effect for the rationale.
        const refreshed = await refreshWishlistFlags(ui);
        if (refreshed !== ui) setMessages(refreshed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pude cargar la conversación.');
      }
    },
    [agent, restaurantScopeId],
  );

  const applyEvent = useCallback(
    (ev: StreamEvent, assistantId: string) => {
      switch (ev.type) {
        case 'conversation':
          setConversationId(ev.data.id);
          writeLastConversationId(agent, restaurantScopeId, ev.data.id);
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
    [agent, restaurantScopeId],
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

      // A — Context Injection. Send the page-derived hint on EVERY
      // turn (not only the first). The comensal can navigate
      // between contextual pages while keeping the same chat open
      // — start in restaurant X, get a dish recommendation, tap
      // the dish, ask a follow-up — and the follow-up needs to
      // know the comensal is now on the dish page. The backend's
      // hint resolver re-renders the prefix per turn, so a stale
      // URL just yields no hint and falls back gracefully.
      // ``clientContext`` is null on non-contextual pages (home,
      // feed, etc.), in which case the field is a no-op anyway.
      try {
        for await (const ev of streamChat(
          {
            message: trimmed,
            conversation_id: conversationId,
            agent,
            restaurant_scope_id: restaurantScopeId,
            client_context: clientContext,
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
    [
      agent,
      conversationId,
      isStreaming,
      restaurantScopeId,
      clientContext,
      applyEvent,
    ],
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
    loadConversation,
  };
}
