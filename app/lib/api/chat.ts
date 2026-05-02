import { fetchApi } from './client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ChatAgent = 'sommelier' | 'ghostwriter' | 'business';

export type ChatRole = 'user' | 'assistant' | 'tool';

export interface DishCardRestaurant {
  id: string;
  slug: string;
  name: string;
  location_name: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
  has_reservation: boolean;
  is_claimed: boolean;
}

export interface DishCardData {
  dish_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  rating: number | null;
  review_count: number;
  price_tier: string | null;
  restaurant: DishCardRestaurant;
}

export interface SearchDishesResult {
  count: number;
  dishes: DishCardData[];
  semantic_used: boolean;
}

export interface MapPayload {
  action: 'open_in_map';
  bbox?: { south: number; west: number; north: number; east: number };
  center?: { lat: number; lng: number; zoom?: number };
  dish_ids?: string[];
}

export interface CreateRouteResult {
  list_id: string;
  slug: string;
  name: string;
  description: string | null;
  is_public: boolean;
  public_url: string | null;
  dish_count: number;
  dish_ids: string[];
}

export interface ChatToolCall {
  id: string;
  name: string;
  arguments: string | null;
}

export interface ChatMessageData {
  id?: string;
  role: ChatRole;
  content: string | null;
  tool_calls?: ChatToolCall[] | null;
  tool_result?: {
    id: string;
    name: string;
    content: unknown;
    is_error: boolean;
  } | null;
  created_at?: string;
}

export interface ChatConversationSummary {
  id: string;
  agent: ChatAgent;
  title: string | null;
  started_at: string;
  last_message_at: string;
  restaurant_scope_id: string | null;
}

// ── streaming events emitted by /api/chat/stream ────────────────────────

export type StreamEvent =
  | { type: 'conversation'; data: { id: string; agent: ChatAgent } }
  | { type: 'text_delta'; data: string }
  | {
      type: 'tool_call_start';
      data: { id: string; name: string; input: Record<string, unknown> };
    }
  | {
      type: 'tool_call_result';
      data: {
        id: string;
        name: string;
        output: unknown;
        is_error: boolean;
      };
    }
  | { type: 'card'; data: { name: string; data: unknown } }
  | { type: 'error'; data: { message: string } | string }
  | { type: 'done'; data: null };

export interface StreamChatRequest {
  message: string;
  conversation_id?: string | null;
  agent?: ChatAgent;
  restaurant_scope_id?: string | null;
}

/**
 * Stream a chat turn via SSE.
 *
 * EventSource doesn't support POST + body, so we use fetch with a
 * ReadableStream and parse the SSE wire format manually. The async
 * generator yields one StreamEvent per `event:`/`data:` block.
 *
 * Caller controls cancellation via an AbortSignal.
 */
export async function* streamChat(
  body: StreamChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${BASE_URL}/api/chat/stream`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    let detail = res.statusText;
    try {
      const errBody = await res.json();
      detail = errBody.detail || detail;
    } catch {
      /* not json */
    }
    throw new Error(`Chat stream failed: ${res.status} ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      let sep = buffer.indexOf('\n\n');
      while (sep !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const event = parseSseFrame(frame);
        if (event) yield event;
        sep = buffer.indexOf('\n\n');
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSseFrame(frame: string): StreamEvent | null {
  let dataLine = '';
  for (const raw of frame.split('\n')) {
    if (raw.startsWith('data:')) {
      dataLine += raw.slice(5).trimStart();
    }
  }
  if (!dataLine) return null;
  try {
    return JSON.parse(dataLine) as StreamEvent;
  } catch {
    return null;
  }
}

// ── conversations CRUD ────────────────────────────────────────────────────

export async function listMyConversations(
  limit = 20,
): Promise<ChatConversationSummary[]> {
  return fetchApi<ChatConversationSummary[]>(
    `/api/chat/conversations/me?limit=${limit}`,
  );
}

export async function listConversationMessages(
  conversationId: string,
  limit = 100,
): Promise<ChatMessageData[]> {
  return fetchApi<ChatMessageData[]>(
    `/api/chat/conversations/${conversationId}/messages?limit=${limit}`,
  );
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await fetchApi<void>(`/api/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}

// ── deprecated non-streaming entry — kept for parity with old callers ────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
): Promise<string> {
  const data = await fetchApi<{ response: string }>('/api/chat', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ message, history }),
  });
  return data.response;
}
